<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoctorAppointment;
use App\Models\DocumentShare;
use App\Models\HealthDocument;
use App\Models\Measurement;
use App\Models\MedicationReminder;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users(): JsonResponse
    {
        $users = User::query()->orderByDesc('created_at')->get();

        $payload = $users->map(function (User $u) {
            $parts = preg_split('/\s+/', trim($u->name), 2);
            $first = $parts[0] ?? '';
            $last = $parts[1] ?? null;

            return [
                'id' => (string) $u->id,
                'email' => $u->email,
                'first_name' => $first ?: null,
                'last_name' => $last,
                'created_at' => $u->created_at->toIso8601String(),
                'roles' => $u->is_admin ? ['admin', 'user'] : ['user'],
            ];
        });

        return response()->json($payload->values());
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            [
                'total_users' => User::query()->count(),
                'total_admins' => User::query()->where('is_admin', true)->count(),
                'total_measurements' => Measurement::query()->count(),
                'total_documents' => HealthDocument::query()->count(),
                'total_appointments' => DoctorAppointment::query()->count(),
                'total_medications' => MedicationReminder::query()->count(),
                'total_shares' => DocumentShare::query()->count(),
            ],
        ]);
    }

    public function setAdmin(Request $request, int $userId): JsonResponse
    {
        $actor = $request->user();
        $data = $request->validate([
            'is_admin' => ['required', 'boolean'],
        ]);

        $target = User::query()->whereKey($userId)->firstOrFail();

        if ($target->id === $actor->id && ! $data['is_admin']) {
            return response()->json(['message' => 'Cannot remove your own admin access'], 422);
        }

        $target->update(['is_admin' => $data['is_admin']]);

        return response()->json(['ok' => true]);
    }
}
