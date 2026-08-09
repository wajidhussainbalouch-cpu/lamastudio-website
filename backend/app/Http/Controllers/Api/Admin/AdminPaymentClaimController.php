<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentClaim;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminPaymentClaimController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending');

        $query = PaymentClaim::with('license')->latest();
        if (in_array($status, ['pending', 'approved', 'rejected'], true)) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate(25));
    }

    public function approve(Request $request, PaymentClaim $paymentClaim): JsonResponse
    {
        $data = $request->validate(['admin_note' => ['nullable', 'string', 'max:500']]);

        $license = $paymentClaim->license;

        $license->status = 'active';
        $license->plan = $paymentClaim->plan_requested;
        $license->activated_at = now();
        $license->pro_expires_at = match ($paymentClaim->plan_requested) {
            'pro_monthly' => Carbon::now()->addMonth(),
            'pro_yearly' => Carbon::now()->addYear(),
            'lifetime' => null,
        };
        $license->save();

        $paymentClaim->update([
            'status' => 'approved',
            'admin_note' => $data['admin_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json(['message' => 'Claim approved and license activated.']);
    }

    public function reject(Request $request, PaymentClaim $paymentClaim): JsonResponse
    {
        $data = $request->validate(['admin_note' => ['required', 'string', 'max:500']]);

        $paymentClaim->update([
            'status' => 'rejected',
            'admin_note' => $data['admin_note'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json(['message' => 'Claim rejected.']);
    }
}
