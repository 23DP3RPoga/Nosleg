<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorAppointment extends Model
{
    protected $fillable = [
        'user_id', 'doctor_name', 'specialty', 'location', 'appointment_at', 'reminder_at', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'appointment_at' => 'datetime',
            'reminder_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
