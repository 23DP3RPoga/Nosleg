<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicationReminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $rows = MedicationReminder::query()
            ->where('user_id', $user->id)
            ->orderByDesc('active')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($rows->map(fn (MedicationReminder $m) => [
            'id' => (string) $m->id,
            'medication_name' => $m->medication_name,
            'dosage' => $m->dosage,
            'frequency' => $m->frequency,
            'times_of_day' => $m->times_of_day,
            'start_date' => $m->start_date->format('Y-m-d'),
            'end_date' => $m->end_date?->format('Y-m-d'),
            'active' => $m->active,
            'notes' => $m->notes,
        ])->values());
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'medication_name' => ['required', 'string', 'max:255'],
            'dosage' => ['nullable', 'string', 'max:255'],
            'frequency' => ['required', 'string', 'max:64'],
            'times_of_day' => ['required', 'array', 'min:1'],
            'times_of_day.*' => ['string', 'max:16'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $m = MedicationReminder::create([
            'user_id' => $user->id,
            'medication_name' => $data['medication_name'],
            'dosage' => $data['dosage'] ?? null,
            'frequency' => $data['frequency'],
            'times_of_day' => $data['times_of_day'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'] ?? null,
            'notes' => $data['notes'] ?? null,
            'active' => true,
        ]);

        return response()->json(['id' => (string) $m->id], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $m = MedicationReminder::query()
            ->where('user_id', $user->id)
            ->whereKey($id)
            ->firstOrFail();

        $data = $request->validate([
            'active' => ['required', 'boolean'],
        ]);

        $m->update(['active' => $data['active']]);

        return response()->json(['ok' => true]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        MedicationReminder::query()->where('user_id', $user->id)->whereKey($id)->delete();

        return response()->json(['ok' => true]);
    }
}
