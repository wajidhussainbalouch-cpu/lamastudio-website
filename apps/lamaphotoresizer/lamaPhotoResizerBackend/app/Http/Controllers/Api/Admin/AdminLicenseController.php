<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\License;
use App\Models\PaymentClaim;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLicenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = License::query()->latest();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('license_key', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('device_id', 'like', "%{$search}%");
            });
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate(25));
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total_licenses' => License::count(),
            'active_trials' => License::where('status', 'trial')->count(),
            'active_paid' => License::where('status', 'active')->count(),
            'expired' => License::where('status', 'expired')->count(),
            'pending_claims' => PaymentClaim::where('status', 'pending')->count(),
            'approved_claims_this_month' => PaymentClaim::where('status', 'approved')
                ->whereMonth('reviewed_at', now()->month)
                ->whereYear('reviewed_at', now()->year)
                ->count(),
            'revenue_this_month' => PaymentClaim::where('status', 'approved')
                ->whereMonth('reviewed_at', now()->month)
                ->whereYear('reviewed_at', now()->year)
                ->sum('amount'),
        ]);
    }
}
