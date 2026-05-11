<?php

namespace Database\Seeders;

use App\Models\Doctor;
use Illuminate\Database\Seeder;

class DoctorCatalogSeeder extends Seeder
{
    public function run(): void
    {
        if (Doctor::query()->exists()) {
            return;
        }

        Doctor::insert([
            [
                'full_name' => 'Dr. Anna Kalniņa',
                'specialty' => 'Kardiologs',
                'city' => 'Rīga',
                'clinic' => 'Centrālā slimnīca',
                'phone' => '+371 20000001',
                'email' => 'anna.kalnina@example.lv',
                'languages' => json_encode(['lv', 'en']),
                'rating' => 4.8,
                'bio' => 'Specializējas sirds un asinsvadu slimībās.',
                'accepting_patients' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'full_name' => 'Dr. Roberts Ozols',
                'specialty' => 'Ģimenes ārsts',
                'city' => 'Liepāja',
                'clinic' => 'Veselības centrs',
                'phone' => '+371 20000002',
                'email' => 'roberts.ozols@example.lv',
                'languages' => json_encode(['lv']),
                'rating' => 4.5,
                'bio' => 'Primārā aprūpe un profilakse.',
                'accepting_patients' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'full_name' => 'Dr. Elīna Bērziņa',
                'specialty' => 'Endokrinologs',
                'city' => 'Rīga',
                'clinic' => 'Diagnostikas centrs',
                'phone' => '+371 20000003',
                'email' => 'elina.berzina@example.lv',
                'languages' => json_encode(['lv', 'ru', 'en']),
                'rating' => 4.9,
                'bio' => 'Diabēts un vielmaiņas traucējumi.',
                'accepting_patients' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
