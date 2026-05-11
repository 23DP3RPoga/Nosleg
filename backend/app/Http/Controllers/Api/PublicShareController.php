<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentShare;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PublicShareController extends Controller
{
    public function show(string $token): JsonResponse
    {
        $share = DocumentShare::query()
            ->where('token', $token)
            ->where('expires_at', '>', now())
            ->with('document')
            ->first();

        if (! $share || ! $share->document) {
            return response()->json(['error' => 'Invalid or expired link'], 404);
        }

        $doc = $share->document;
        $base = rtrim(config('app.url'), '/');

        return response()->json([
            'document_id' => (string) $doc->id,
            'title' => $doc->title,
            'category' => $doc->category,
            'note' => $doc->note,
            'mime_type' => $doc->mime_type,
            'file_path' => $doc->file_path,
            'shared_note' => $share->recipient_note,
            'expires_at' => $share->expires_at->toIso8601String(),
            'download_url' => $base.'/api/public/share/'.$token.'/file',
        ]);
    }

    public function download(string $token): StreamedResponse|JsonResponse
    {
        $share = DocumentShare::query()
            ->where('token', $token)
            ->where('expires_at', '>', now())
            ->with('document')
            ->first();

        if (! $share || ! $share->document) {
            return response()->json(['error' => 'Invalid or expired link'], 404);
        }

        $doc = $share->document;
        if (! Storage::disk('local')->exists($doc->file_path)) {
            return response()->json(['error' => 'File missing'], 404);
        }

        return Storage::disk('local')->response(
            $doc->file_path,
            $doc->title,
            ['Content-Type' => $doc->mime_type ?: 'application/octet-stream']
        );
    }
}
