<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiUsage extends Model
{
    protected $fillable = ['license_id', 'provider', 'usage_date', 'request_count'];

    protected $casts = [
        'usage_date' => 'date',
    ];

    public function license(): BelongsTo
    {
        return $this->belongsTo(License::class);
    }
}
