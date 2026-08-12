<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LamaController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/about', function () { return view('about'); });
Route::get('/boards', function () { return view('boards'); });
Route::get('/contact', function () { return view('contact'); });
Route::get('/dgkhan-matric', function () { return view('dgkhan-matric'); });
Route::get('/portal', function () { return view('portal'); });
Route::get('/privacy', function () { return view('privacy'); });
Route::get('/services', function () { return view('services'); });
Route::get('/zoho-domain-verification', function () { return view('zoho-domain-verification'); });

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::post('/api/ask-lama', [LamaController::class, 'ask']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';