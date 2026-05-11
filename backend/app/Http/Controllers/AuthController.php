<?php

namespace App\Http\Controllers;

use App\Models\DoctorAppointment;
use App\Models\DocumentShare;
use App\Models\HealthDocument;
use App\Models\Measurement;
use App\Models\MedicationReminder;
use App\Models\User;
use App\Models\UserDoctor;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        $verificationSent = false;
        $verificationMailError = null;

        try {
            $user->sendEmailVerificationNotification();
            $verificationSent = true;
        } catch (\Throwable $e) {
            report($e);
            if (config('app.debug')) {
                $verificationMailError = $e->getMessage();
            }
        }

        $token = $user->createToken('web')->plainTextToken;

        $payload = [
            'token' => $token,
            'user' => $this->userPayload($user->fresh()),
            'verification_email_sent' => $verificationSent,
        ];
        if ($verificationMailError !== null) {
            $payload['verification_mail_error'] = $verificationMailError;
        }

        return response()->json($payload, 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Nepareizs e-pasts vai parole.'],
            ]);
        }

        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->userPayload($user),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => 'Pārāk daudz pieprasījumu. Mēģini vēlreiz pēc brīža.',
            ], 429);
        }

        return response()->json([
            'message' => 'Ja šis e-pasts ir mums zināms, nosūtījām paroles atjaunošanas saiti.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password,
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            $msg = match ($status) {
                Password::INVALID_TOKEN => 'Saite nav derīga vai ir beigusies. Pieprasi jaunu e-pastu.',
                Password::INVALID_USER => 'Neizdevās atrast lietotāju ar šo e-pastu.',
                default => 'Neizdevās atjaunot paroli. Mēģini vēlreiz.',
            };
            throw ValidationException::withMessages([
                'email' => [$msg],
            ]);
        }

        return response()->json([
            'message' => 'Parole nomainīta. Tagad vari pieslēgties.',
        ]);
    }

    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified.']);
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Could not send verification email. Check mail configuration or try again later.',
            ], 503);
        }

        return response()->json(['message' => 'Verification link sent.'], 202);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'user' => $this->userPayload($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $user->forceFill(['name' => $data['name']])->save();

        return response()->json([
            'user' => $this->userPayload($user->fresh()),
        ]);
    }

    /**
     * Dzēš kontu un visus saistītos datus (GDPR “tiesības tikt aizmirstam”).
     * Nepieciešama parole un apstiprinājums ar e-pasta adresi.
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string'],
            'confirm_email' => ['required', 'email', Rule::in([$request->user()->email])],
        ]);

        /** @var User $user */
        $user = $request->user();

        if (! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Nepareiza parole.'],
            ]);
        }

        DB::transaction(function () use ($user) {
            $docs = HealthDocument::query()->where('user_id', $user->id)->get();
            $docIds = $docs->pluck('id');

            if ($docIds->isNotEmpty()) {
                DocumentShare::query()->whereIn('document_id', $docIds)->delete();
            }
            DocumentShare::query()->where('user_id', $user->id)->delete();

            foreach ($docs as $doc) {
                if ($doc->file_path && Storage::disk('local')->exists($doc->file_path)) {
                    Storage::disk('local')->delete($doc->file_path);
                }
            }
            HealthDocument::query()->where('user_id', $user->id)->delete();

            Measurement::query()->where('user_id', $user->id)->delete();
            MedicationReminder::query()->where('user_id', $user->id)->delete();
            DoctorAppointment::query()->where('user_id', $user->id)->delete();
            UserDoctor::query()->where('user_id', $user->id)->delete();

            $user->tokens()->delete();
            $user->delete();
        });

        return response()->json([
            'message' => 'Konts ir dzēsts.',
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'is_admin' => (bool) $user->is_admin,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
        ];
    }
}

