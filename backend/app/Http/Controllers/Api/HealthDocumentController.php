<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HealthDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HealthDocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $rows = HealthDocument::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($rows->map(fn (HealthDocument $d) => [
            'id' => (string) $d->id,
            'title' => $d->title,
            'category' => $d->category,
            'file_path' => $d->file_path,
            'mime_type' => $d->mime_type,
            'size_bytes' => $d->size_bytes,
            'note' => $d->note,
            'created_at' => $d->created_at->toIso8601String(),
        ])->values());
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:64'],
            'note' => ['nullable', 'string', 'max:2000'],
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $file = $request->file('file');
        $path = $file->store('health-documents/'.$user->id, 'local');

        $doc = HealthDocument::create([
            'user_id' => $user->id,
            'title' => $data['title'],
            'category' => $data['category'],
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'note' => $data['note'] ?? null,
        ]);

        return response()->json([
            'id' => (string) $doc->id,
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $doc = HealthDocument::query()
            ->where('user_id', $user->id)
            ->whereKey($id)
            ->firstOrFail();

        if (Storage::disk('local')->exists($doc->file_path)) {
            Storage::disk('local')->delete($doc->file_path);
        }
        $doc->delete();

        return response()->json(['ok' => true]);
    }

    public function download(Request $request, int $id): StreamedResponse
    {
        $user = $request->user();
        $doc = HealthDocument::query()
            ->where('user_id', $user->id)
            ->whereKey($id)
            ->firstOrFail();

        if (! Storage::disk('local')->exists($doc->file_path)) {
            abort(404);
        }

        return Storage::disk('local')->response(
            $doc->file_path,
            $doc->title,
            ['Content-Type' => $doc->mime_type ?: 'application/octet-stream']
        );
    }
}
