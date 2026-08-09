<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('license_id')->constrained()->cascadeOnDelete();

            $table->enum('method', ['easypaisa', 'jazzcash', 'bank', 'raast']);
            $table->string('tx_id', 100);
            $table->decimal('amount', 10, 2);
            $table->string('payer_name')->nullable();
            $table->string('payer_contact')->nullable(); // phone / account used to pay
            $table->enum('plan_requested', ['pro_monthly', 'pro_yearly', 'lifetime']);

            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();

            // Prevents the same transaction ID being submitted twice by mistake or abuse.
            $table->unique(['method', 'tx_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_claims');
    }
};
