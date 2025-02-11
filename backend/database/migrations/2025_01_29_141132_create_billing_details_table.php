<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('billing_details', function (Blueprint $table) {
            $table->id();
            $table->string('name', 45);
            $table->string('email', 45);
            $table->string('phone', 15);
            $table->text('address')->nullable();
            $table->string('city', 45)->nullable();
            $table->unsignedInteger('post_code')->length(6)->nullable();
            $table->unsignedTinyInteger('quantity');
            $table->unsignedBigInteger('total_amount');
            $table->unsignedBigInteger('sub_total_amount');
            $table->unsignedBigInteger('total_tax_amount');
            $table->string('item_trx_id', 50);
            $table->string('payment_proof', 100);
            $table->foreignId('discount_id')->constrained('discounts')->noActionOnDelete()->nullable();
            $table->unsignedBigInteger('discount_amount')->default(0)->nullable();
            $table->boolean('is_paid')->default(false);
            $table->boolean('on_store')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_details');
    }
};
