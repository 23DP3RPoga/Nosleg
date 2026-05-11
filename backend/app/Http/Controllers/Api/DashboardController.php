<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoctorAppointment;
use App\Models\HealthDocument;
use App\Models\Measurement;
use App\Models\MedicationReminder;
use App\Models\UserDoctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function counts(Request $request): JsonResponse
    {
        $user = $request->user();
        $uid = $user->id;

        return response()->json([
            'measurements' => Measurement::query()->where('user_id', $uid)->count(),
            'documents' => HealthDocument::query()->where('user_id', $uid)->count(),
            'appointments' => DoctorAppointment::query()
                ->where('user_id', $uid)
                ->where('appointment_at', '>=', now())
                ->count(),
            'medications' => MedicationReminder::query()
                ->where('user_id', $uid)
                ->where('active', true)
                ->count(),
            'doctors' => UserDoctor::query()->where('user_id', $uid)->count(),
        ]);
    }
}
