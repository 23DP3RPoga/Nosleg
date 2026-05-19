<?php

namespace App\Services;

use App\Models\DoctorAppointment;
use App\Models\DocumentShare;
use App\Models\HealthDocument;
use App\Models\Measurement;
use App\Models\MedicationReminder;
use App\Models\User;
use App\Models\UserDoctor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class DeleteUserAccount
{
    /**
     * Deletes a user and all associated data (DB rows, uploaded files, tokens).
     */
    public function delete(User $user): void
    {
        DB::transaction(function () use ($user) {
            $docs = HealthDocument::query()->where('user_id', $user->id)->get();
            $docIds = $docs->pluck('id');

            if ($docIds->isNotEmpty()) {
                DocumentShare::query()->whereIn('document_id', $docIds)->delete();
            }
            DocumentShare::query()->where('user_id', $user->id)->delete();

            foreach ($docs as $doc) {
                if ($doc->file_path && Storage::disk('local')->exists($doc->file_path)) {
                    Storage::disk('local')->delete($doc->file_path);
                }
            }
            HealthDocument::query()->where('user_id', $user->id)->delete();

            Measurement::query()->where('user_id', $user->id)->delete();
            MedicationReminder::query()->where('user_id', $user->id)->delete();
            DoctorAppointment::query()->where('user_id', $user->id)->delete();
            UserDoctor::query()->where('user_id', $user->id)->delete();

            $user->tokens()->delete();

            if (Schema::hasTable('password_reset_tokens')) {
                DB::table('password_reset_tokens')->where('email', $user->email)->delete();
            }

            $user->delete();
        });
    }
}
