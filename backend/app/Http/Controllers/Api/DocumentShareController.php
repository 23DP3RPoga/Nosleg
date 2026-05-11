<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentShare;
use App\Models\HealthDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentShareController extends Controller
{
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

        DocumentShare::create([
            'user_id' => $user->id,
            'document_id' => $data['document_id'],
            'token' => $data['token'],
            'recipient_email' => $data['recipient_email'] ?? null,
            'recipient_note' => $data['recipient_note'] ?? null,
            'expires_at' => $data['expires_at'],
        ]);

        return response()->json(['ok' => true], 201);
    }
}
