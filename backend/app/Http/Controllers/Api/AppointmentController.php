<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoctorAppointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $rows = DoctorAppointment::query()
            ->where('user_id', $user->id)
            ->orderBy('appointment_at')
            ->get();

        return response()->json($rows->map(fn (DoctorAppointment $a) => [
            'id' => (string) $a->id,
            'doctor_name' => $a->doctor_name,
            'specialty' => $a->specialty,
            'location' => $a->location,
            'appointment_at' => $a->appointment_at->toIso8601String(),
            'reminder_at' => $a->reminder_at?->toIso8601String(),
            'notes' => $a->notes,
        ])->values());
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'doctor_name' => ['required', 'string', 'max:255'],
            'specialty' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:500'],
            'appointment_at' => ['required', 'date'],
            'reminder_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $a = DoctorAppointment::create([
            'user_id' => $user->id,
            'doctor_name' => $data['doctor_name'],
            'specialty' => $data['specialty'] ?? null,
            'location' => $data['location'] ?? null,
            'appointment_at' => $data['appointment_at'],
            'reminder_at' => $data['reminder_at'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);

        return response()->json(['id' => (string) $a->id], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        DoctorAppointment::query()->where('user_id', $user->id)->whereKey($id)->delete();

        return response()->json(['ok' => true]);
    }
}
