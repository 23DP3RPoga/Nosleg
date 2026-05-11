<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\UserDoctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function specialties(): JsonResponse
    {
        $list = Doctor::query()
            ->distinct()
            ->orderBy('specialty')
            ->pluck('specialty');

        return response()->json($list->values());
    }

    public function catalog(Request $request): JsonResponse
    {
        $q = Doctor::query()->orderByDesc('rating');

        if ($request->filled('specialty')) {
            $q->where('specialty', $request->string('specialty'));
        }

        if ($request->filled('search')) {
            $term = '%'.$request->string('search').'%';
            $q->where(function ($qq) use ($term) {
                $qq->where('full_name', 'like', $term)
                    ->orWhere('specialty', 'like', $term)
                    ->orWhere('clinic', 'like', $term)
                    ->orWhere('city', 'like', $term);
            });
        }

        $rows = $q->get();

        return response()->json($rows->values()->map(fn (Doctor $d) => [
            'id' => (string) $d->id,
            'full_name' => $d->full_name,
            'specialty' => $d->specialty,
            'city' => $d->city,
            'clinic' => $d->clinic,
            'phone' => $d->phone,
            'email' => $d->email,
            'languages' => $d->languages,
            'rating' => $d->rating,
            'bio' => $d->bio,
            'accepting_patients' => $d->accepting_patients,
        ]));
    }

    public function saved(Request $request): JsonResponse
    {
        $user = $request->user();
        $rows = UserDoctor::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($rows->map(fn (UserDoctor $r) => [
            'id' => (string) $r->id,
            'doctor_id' => $r->doctor_id ? (string) $r->doctor_id : null,
            'full_name' => $r->full_name,
            'specialty' => $r->specialty,
            'clinic' => $r->clinic,
            'phone' => $r->phone,
            'email' => $r->email,
            'notes' => $r->notes,
            'source' => $r->source,
        ])->values());
    }

    public function storeSaved(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'doctor_id' => ['nullable', 'exists:doctors,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'specialty' => ['nullable', 'string', 'max:255'],
            'clinic' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:64'],
            'email' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'source' => ['required', 'string', 'in:catalog,custom'],
        ]);

        $row = UserDoctor::create([
            'user_id' => $user->id,
            'doctor_id' => $data['doctor_id'] ?? null,
            'full_name' => $data['full_name'],
            'specialty' => $data['specialty'] ?? null,
            'clinic' => $data['clinic'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'notes' => $data['notes'] ?? null,
            'source' => $data['source'],
        ]);

        return response()->json(['id' => (string) $row->id], 201);
    }

    public function destroySaved(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        UserDoctor::query()->where('user_id', $user->id)->whereKey($id)->delete();

        return response()->json(['ok' => true]);
    }
}
