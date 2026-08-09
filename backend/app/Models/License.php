<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class License extends Model
{
    use HasFactory;

    protected $fillable = [
        'license_key', 'device_id', 'email',
        'status', 'plan',
        'trial_ends_at', 'trial_photo_limit', 'photos_used',
        'activated_at', 'pro_expires_at',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'activated_at' => 'datetime',
        'pro_expires_at' => 'datetime',
    ];

    public function paymentClaims(): HasMany
    {
        return $this->hasMany(PaymentClaim::class);
    }

    public function apiUsage(): HasMany
    {
        return $this->hasMany(ApiUsage::class);
    }

    /** True if this license currently allows processing (trial not exhausted, or paid & not expired). */
    public function isUsable(): bool
    {
        return match ($this->status) {
            'active' => $this->pro_expires_at === null || $this->pro_expires_at->isFuture(),
            'trial' => $this->photos_used < $this->trial_photo_limit
                && ($this->trial_ends_at === null || $this->trial_ends_at->isFuture()),
            default => false,
        };
    }

    public function remainingTrialPhotos(): int
    {
        return max(0, $this->trial_photo_limit - $this->photos_used);
    }

    public static function generateKey(): string
    {
        // Human-typeable-ish, still hard to guess: LAMA-XXXX-XXXX-XXXX
        $groups = [];
        for ($i = 0; $i < 3; $i++) {
            $groups[] = strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));
        }
        return 'LAMA-' . implode('-', $groups);
    }
}
