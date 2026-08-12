<?php

use App\Http\Controllers\Api\Admin\AdminAuthController;
use App\Http\Controllers\Api\Admin\AdminLicenseController;
use App\Http\Controllers\Api\Admin\AdminPaymentClaimController;
use App\Http\Controllers\Api\LicenseController;
use App\Http\Controllers\Api\PaymentClaimController;
use App\Http\Controllers\Api\TelemetryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| lamaPhotoResizer & LamaStudio API routes
|--------------------------------------------------------------------------
| Public routes are called directly from the static apps. Admin routes require 
| a Sanctum bearer token obtained from POST /api/admin/login.
*/

// ---- Public: license lifecycle ----
Route::post('/license/trial-start', [LicenseController::class, 'trialStart']);
Route::post('/license/verify', [LicenseController::class, 'verify']);
Route::post('/license/consume', [LicenseController::class, 'consume']);

// ---- Public: payment claims ----
Route::post('/payment-claims', [PaymentClaimController::class, 'store']);
Route::get('/payment-claims/{id}/status', [PaymentClaimController::class, 'status']);

// ---- Admin auth ----
Route::post('/admin/login', [AdminAuthController::class, 'login']);

// ---- Authenticated Apps & Telemetry (requires Bearer token) ----
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/app/telemetry', [TelemetryController::class, 'store']);
});

// ---- Admin dashboard (requires Authorization: Bearer <token>) ----
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);

    Route::get('/stats', [AdminLicenseController::class, 'stats']);
    Route::get('/licenses', [AdminLicenseController::class, 'index']);

    Route::get('/payment-claims', [AdminPaymentClaimController::class, 'index']);
    Route::post('/payment-claims/{paymentClaim}/approve', [AdminPaymentClaimController::class, 'approve']);
    Route::post('/payment-claims/{paymentClaim}/reject', [AdminPaymentClaimController::class, 'reject']);
});