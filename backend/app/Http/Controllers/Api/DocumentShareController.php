<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentShare;
use App\Models\HealthDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentShareController extends Controller
{
    public function index(Request $request, int $documentId): JsonResponse
    {
        $user = $request->user();

        HealthDocument::query()
            ->where('user_id', $user->id)
            ->whereKey($documentId)
            ->firstOrFail();

        $rows = DocumentShare::query()
            ->where('user_id', $user->id)
            ->where('document_id', $documentId)
            ->orderByDesc('created_at')
            ->get();

        $now = now();

        return response()->json($rows->map(fn (DocumentShare $s) => [
            'id' => (string) $s->id,
            'token' => $s->token,
            'recipient_email' => $s->recipient_email,
            'recipient_note' => $s->recipient_note,
            'expires_at' => $s->expires_at->toIso8601String(),
            'is_active' => $s->expires_at->isAfter($now),
            'created_at' => $s->created_at->toIso8601String(),
        ])->values());
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'document_id' => ['required', 'exists:health_documents,id'],
            'token' => ['required', 'string', 'max:64'],
            'recipient_email' => ['nullable', 'email', 'max:255'],
            'recipient_note' => ['nullable', 'string', 'max:2000'],
            'expires_at' => ['required', 'date'],
        ]);

        HealthDocument::query()
            ->where('user_id', $user->id)
            ->whereKey($data['document_id'])
            ->firstOrFail();

        $share = DocumentShare::create([
            'user_id' => $user->id,
            'document_id' => $data['document_id'],
            'token' => $data['token'],
            'recipient_email' => $data['recipient_email'] ?? null,
            'recipient_note' => $data['recipient_note'] ?? null,
            'expires_at' => $data['expires_at'],
        ]);

        return response()->json([
            'id' => (string) $share->id,
            'token' => $share->token,
            'expires_at' => $share->expires_at->toIso8601String(),
            'is_active' => true,
        ], 201);
    }
}
