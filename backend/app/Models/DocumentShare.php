<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentShare extends Model
{
    protected $fillable = [
        'user_id', 'document_id', 'token', 'recipient_email', 'recipient_note', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(HealthDocument::class, 'document_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ShareComment::class, 'document_share_id');
    }
}
