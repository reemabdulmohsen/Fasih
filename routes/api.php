<?php

use App\Http\Controllers\RealtimeSessionController;
use App\Http\Controllers\TranscribeController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'project' => 'Fasih',
    ]);
});

Route::post('/transcribe', TranscribeController::class);
Route::post('/realtime-session', RealtimeSessionController::class);
