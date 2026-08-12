<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppTelemetry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'app_name',
        'event_type',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}