<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\License;
use App\Models\PaymentClaim;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PaymentClaimController extends Controller
{
    /**
     * A user who has paid manually via EasyPaisa/JazzCash/bank transfer
     * submits their transaction ID here. It sits as "pending" until an
     * admin reviews it in the admin dashboard — this endpoint never
     * activates a license by itself.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'license_key' => ['required', 'string'],
            'method' => ['required', 'in:easypaisa,jazzcash,bank,raast'],
            'tx_id' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:1'],
            'payer_name' => ['nullable', 'string', 'max:120'],
            'payer_contact' => ['nullable', 'string', 'max:60'],
            'plan_requested' => ['required', 'in:pro_monthly,pro_yearly,lifetime'],
        ]);

        $license = License::where('license_key', $data['license_key'])->first();
        if (! $license) {
            return response()->json(['error' => 'License key not found.'], 404);
        }

        try {
            $claim = PaymentClaim::create([
                'license_id' => $license->id,
                'method' => $data['method'],
                'tx_id' => $data['tx_id'],
                'amount' => $data['amount'],
                'payer_name' => $data['payer_name'] ?? null,
                'payer_contact' => $data['payer_contact'] ?? null,
                'plan_requested' => $data['plan_requested'],
                'status' => 'pending',
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            // Unique(method, tx_id) constraint — most likely a duplicate submission.
            throw ValidationException::withMessages([
                'tx_id' => 'This transaction ID has already been submitted.',
            ]);
        }

        return response()->json([
            'message' => 'Payment claim submitted. It will be reviewed within 24 hours.',
            'claim_id' => $claim->id,
            'status' => $claim->status,
        ], 201);
    }

    /** Lets the client poll whether their own submitted claim has been reviewed yet. */
    public function status(Request $request, int $id): JsonResponse
    {
        $data = $request->validate(['license_key' => ['required', 'string']]);

        $claim = PaymentClaim::with('license')->findOrFail($id);
        if ($claim->license->license_key !== $data['license_key']) {
            return response()->json(['error' => 'Not found.'], 404);
        }

        return response()->json([
            'status' => $claim->status,
            'admin_note' => $claim->admin_note,
        ]);
    }
}
