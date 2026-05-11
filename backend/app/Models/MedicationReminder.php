<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicationReminder extends Model
{
    protected $fillable = [
        'user_id', 'medication_name', 'dosage', 'frequency', 'times_of_day',
        'start_date', 'end_date', 'active', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'times_of_day' => 'array',
            'start_date' => 'date',
            'end_date' => 'date',
            'active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
