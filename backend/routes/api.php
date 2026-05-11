<?php

use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\SiteMetaController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\DocumentShareController;
use App\Http\Controllers\Api\HealthDocumentController;
use App\Http\Controllers\Api\MeasurementController;
use App\Http\Controllers\Api\MedicationController;
use App\Http\Controllers\Api\PublicShareController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmailVerificationController;
use Illuminate\Support\Facades\Route;

Route::get('/public/share/{token}', [PublicShareController::class, 'show']);
Route::get('/public/share/{token}/file', [PublicShareController::class, 'download']);

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:6,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::post('/contact', [ContactController::class, 'submit'])
    ->middleware('throttle:10,1');

Route::get('/site/contact', [SiteMetaController::class, 'contact']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateProfile']);
    Route::delete('/account', [AuthController::class, 'deleteAccount'])
        ->middleware('throttle:6,1');
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/verification-notification', [AuthController::class, 'sendVerificationEmail'])
        ->middleware('throttle:6,1');
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/dashboard/counts', [DashboardController::class, 'counts']);

    Route::get('/measurements', [MeasurementController::class, 'index']);
    Route::post('/measurements', [MeasurementController::class, 'store']);
    Route::delete('/measurements/{id}', [MeasurementController::class, 'destroy']);

    Route::get('/documents', [HealthDocumentController::class, 'index']);
    Route::post('/documents', [HealthDocumentController::class, 'store']);
    Route::delete('/documents/{id}', [HealthDocumentController::class, 'destroy']);
    Route::get('/documents/{id}/download', [HealthDocumentController::class, 'download']);

    Route::get('/medications', [MedicationController::class, 'index']);
    Route::post('/medications', [MedicationController::class, 'store']);
    Route::patch('/medications/{id}', [MedicationController::class, 'update']);
    Route::delete('/medications/{id}', [MedicationController::class, 'destroy']);

    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::delete('/appointments/{id}', [AppointmentController::class, 'destroy']);

    Route::get('/doctors/specialties', [DoctorController::class, 'specialties']);
    Route::get('/doctors/catalog', [DoctorController::class, 'catalog']);
    Route::get('/doctors/saved', [DoctorController::class, 'saved']);
    Route::post('/doctors/saved', [DoctorController::class, 'storeSaved']);
    Route::delete('/doctors/saved/{id}', [DoctorController::class, 'destroySaved']);

    Route::post('/shares', [DocumentShareController::class, 'store']);

    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::get('/admin/stats', [AdminController::class, 'stats']);
        Route::patch('/admin/users/{userId}/admin', [AdminController::class, 'setAdmin']);
    });
});
