<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiUsage;
use App\Models\License;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LicenseController extends Controller
{
    /**
     * First launch on a device: create (or return the existing) trial
     * license for that device_id. Idempotent so re-calling it after a
     * page reload doesn't spawn duplicate trials.
     */
    public function trialStart(Request $request): JsonResponse
    {
        $data = $request->validate([
            'device_id' => ['required', 'string', 'max:100'],
        ]);

        $license = License::firstOrCreate(
            ['device_id' => $data['device_id']],
            [
                'license_key' => License::generateKey(),
                'status' => 'trial',
                'plan' => 'trial',
                'trial_ends_at' => now()->addDays(7),
                'trial_photo_limit' => 20,
                'photos_used' => 0,
            ]
        );

        return response()->json($this->serialize($license));
    }

    /** Looks up a license by key and returns its current usable state. */
    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate([
            'license_key' => ['required', 'string'],
        ]);

        $license = License::where('license_key', $data['license_key'])->first();

        if (! $license) {
            return response()->json(['error' => 'License key not found.'], 404);
        }

        $this->syncExpiry($license);

        return response()->json($this->serialize($license));
    }

    /**
     * Called after a batch finishes processing, so trial usage is counted
     * by the server (not just trusted from the browser). Also logs which
     * background-removal engine was used, for cost/quota visibility.
     */
    public function consume(Request $request): JsonResponse
    {
        $data = $request->validate([
            'license_key' => ['required', 'string'],
            'photo_count' => ['required', 'integer', 'min:1', 'max:500'],
            'engine' => ['required', 'in:on_device,remove_bg'],
        ]);

        $license = License::where('license_key', $data['license_key'])->first();
        if (! $license) {
            return response()->json(['error' => 'License key not found.'], 404);
        }

        $this->syncExpiry($license);

        if (! $license->isUsable()) {
            return response()->json([
                'allowed' => false,
                'reason' => $license->status === 'trial' ? 'trial_exhausted' : 'license_inactive',
                'license' => $this->serialize($license),
            ], 402);
        }

        if ($license->status === 'trial') {
            $license->increment('photos_used', $data['photo_count']);
        }

        ApiUsage::where('license_id', $license->id)
            ->where('provider', $data['engine'])
            ->where('usage_date', now()->toDateString())
            ->first()?->increment('request_count', $data['photo_count'])
            ?? ApiUsage::create([
                'license_id' => $license->id,
                'provider' => $data['engine'],
                'usage_date' => now()->toDateString(),
                'request_count' => $data['photo_count'],
            ]);

        return response()->json([
            'allowed' => true,
            'license' => $this->serialize($license->fresh()),
        ]);
    }

    private function syncExpiry(License $license): void
    {
        $dirty = false;

        if ($license->status === 'trial' && $license->trial_ends_at?->isPast()) {
            $license->status = 'expired';
            $dirty = true;
        }
        if ($license->status === 'active' && $license->pro_expires_at?->isPast()) {
            $license->status = 'expired';
            $dirty = true;
        }

        if ($dirty) $license->save();
    }

    private function serialize(License $license): array
    {
        return [
            'license_key' => $license->license_key,
            'status' => $license->status,
            'plan' => $license->plan,
            'is_usable' => $license->isUsable(),
            'trial_ends_at' => $license->trial_ends_at?->toIso8601String(),
            'trial_photo_limit' => $license->trial_photo_limit,
            'photos_used' => $license->photos_used,
            'remaining_trial_photos' => $license->remainingTrialPhotos(),
            'pro_expires_at' => $license->pro_expires_at?->toIso8601String(),
        ];
    }
}
