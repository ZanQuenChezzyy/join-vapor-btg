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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->foreignId('brand_id')->constrained('brands')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('slug', 100);
            $table->string('thumbnail', 100);
            $table->text('description');
            $table->unsignedTinyInteger('stock')->length(3)->default(0);
            $table->unsignedBigInteger('price')->length(20);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_displayed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
