<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HealthDocument extends Model
{
    protected $fillable = [
        'user_id', 'title', 'category', 'file_path', 'mime_type', 'size_bytes', 'note',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(DocumentShare::class, 'document_id');
    }
}
