<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Schools Table (Stores each school's info & subscription tier)
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique(); // e.g., lamastudio.pk/school/abc-public
            $table->string('email')->unique();
            $table->string('phone');
            $table->enum('subscription_status', ['free', 'paid'])->default('free');
            $table->integer('student_limit')->default(50); // Free tier cap
            $table->timestamps();
        });

        // 2. Users Table (Admins, Teachers, Principals)
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['super_admin', 'school_admin', 'teacher'])->default('school_admin');
            $table->timestamps();
        });

        // 3. Students Table (The records being counted against the 50-student limit)
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('b_form_or_roll_no');
            $table->string('class');
            $table->string('guardian_phone');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
        Schema::dropIfExists('users');
        Schema::dropIfExists('schools');
    }
};