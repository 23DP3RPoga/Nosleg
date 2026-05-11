<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Measurement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeasurementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $rows = Measurement::query()
            ->where('user_id', $user->id)
            ->orderByDesc('taken_at')
            ->limit(100)
            ->get();

        return response()->json($rows->map(fn (Measurement $m) => [
            'id' => (string) $m->id,
            'type' => $m->type,
            'systolic' => $m->systolic,
            'diastolic' => $m->diastolic,
            'value' => $m->value,
            'note' => $m->note,
            'taken_at' => $m->taken_at->toIso8601String(),
        ])->values());
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'type' => ['required', 'string', 'max:32'],
            'systolic' => ['nullable', 'integer', 'min:0', 'max:400'],
            'diastolic' => ['nullable', 'integer', 'min:0', 'max:400'],
            'value' => ['nullable', 'numeric'],
            'note' => ['nullable', 'string', 'max:280'],
            'taken_at' => ['required', 'date'],
        ]);

        $m = Measurement::create([
            'user_id' => $user->id,
            'type' => $data['type'],
            'systolic' => $data['systolic'] ?? null,
            'diastolic' => $data['diastolic'] ?? null,
            'value' => $data['value'] ?? null,
            'note' => $data['note'] ?? null,
            'taken_at' => $data['taken_at'],
        ]);

        return response()->json([
            'id' => (string) $m->id,
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        Measurement::query()->where('user_id', $user->id)->whereKey($id)->delete();

        return response()->json(['ok' => true]);
    }
}
