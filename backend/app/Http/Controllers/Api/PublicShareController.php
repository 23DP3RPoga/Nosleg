<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentShare;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PublicShareController extends Controller
{
    public function comments(string $token): JsonResponse
    {
        $share = $this->findValidShare($token);
        if (! $share) {
            return response()->json(['error' => 'Invalid or expired link'], 404);
        }

        $items = $share->comments()
            ->orderBy('created_at')
            ->get()
            ->map(fn ($c) => [
                'id' => (string) $c->id,
                'author_name' => $c->author_name,
                'body' => $c->body,
                'created_at' => $c->created_at->toIso8601String(),
            ]);

        return response()->json($items->values());
    }

    public function storeComment(Request $request, string $token): JsonResponse
    {
        $share = $this->findValidShare($token);
        if (! $share) {
            return response()->json(['error' => 'Invalid or expired link'], 404);
        }

        $data = $request->validate([
            'author_name' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $comment = $share->comments()->create($data);

        return response()->json([
            'id' => (string) $comment->id,
            'author_name' => $comment->author_name,
            'body' => $comment->body,
            'created_at' => $comment->created_at->toIso8601String(),
        ], 201);
    }

    public function show(string $token): JsonResponse
    {
        $share = $this->findValidShare($token, withDocument: true);

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
        $share = $this->findValidShare($token, withDocument: true);

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

    private function findValidShare(string $token, bool $withDocument = false): ?DocumentShare
    {
        $query = DocumentShare::query()
            ->where('token', $token)
            ->where('expires_at', '>', now());

        if ($withDocument) {
            $query->with('document');
        }

        return $query->first();
    }
}
