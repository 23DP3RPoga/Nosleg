<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShareComment extends Model
{
    protected $fillable = [
        'document_share_id',
        'author_name',
        'body',
    ];

    public function share(): BelongsTo
    {
        return $this->belongsTo(DocumentShare::class, 'document_share_id');
    }
}
