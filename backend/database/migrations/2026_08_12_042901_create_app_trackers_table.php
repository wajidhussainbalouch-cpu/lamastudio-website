<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('app_trackers', function (Blueprint $table) {
            $table->id();
            $table->string('app_key')->unique();
            $table->string('name');
            $table->integer('total_downloads')->default(0);
            $table->integer('active_users')->default(0);
            $table->decimal('success_rate', 5, 2)->default(100.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_trackers');
    }
};