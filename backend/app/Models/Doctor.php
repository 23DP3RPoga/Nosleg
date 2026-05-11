<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Doctor extends Model
{
    protected $fillable = [
        'full_name', 'specialty', 'city', 'clinic', 'phone', 'email',
        'languages', 'rating', 'bio', 'accepting_patients',
    ];

    protected function casts(): array
    {
        return [
            'languages' => 'array',
            'rating' => 'float',
            'accepting_patients' => 'boolean',
        ];
    }

    public function userDoctors(): HasMany
    {
        return $this->hasMany(UserDoctor::class, 'doctor_id');
    }
}
