<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppTelemetry;
use Illuminate\Http\Request;

class TelemetryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'required|string',
            'event_type' => 'required|string',
            'payload' => 'required|array',
        ]);

        $telemetry = AppTelemetry::create([
            'user_id' => $request->user()->id,
            'app_name' => $validated['app_name'],
            'event_type' => $validated['event_type'],
            'payload' => $validated['payload'],
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Progress tracked successfully',
            'data' => $telemetry
        ], 201);
    }
}