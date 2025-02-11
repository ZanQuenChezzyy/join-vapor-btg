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
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10);
            $table->unsignedTinyInteger('type')->length(1);
            $table->unsignedInteger('value')->length(7);
            $table->unsignedInteger('min_order_value')->length(7)->default(0);
            $table->unsignedInteger('max_order_value')->length(7)->default(0);
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->text('description');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
