<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->string('license_key', 40)->unique();
            $table->string('device_id')->index(); // stable id generated client-side, stored in localStorage
            $table->string('email')->nullable();

            $table->enum('status', ['trial', 'active', 'expired', 'revoked'])->default('trial');
            $table->enum('plan', ['trial', 'pro_monthly', 'pro_yearly', 'lifetime'])->default('trial');

            // Trial gating: whichever limit is hit first ends the trial.
            $table->timestamp('trial_ends_at')->nullable();
            $table->unsignedInteger('trial_photo_limit')->default(20);
            $table->unsignedInteger('photos_used')->default(0);

            $table->timestamp('activated_at')->nullable();
            $table->timestamp('pro_expires_at')->nullable(); // null = lifetime / not applicable

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};
