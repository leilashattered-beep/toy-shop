<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                ->constrained('categories')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->decimal('old_price', 10, 2)->nullable();
            $table->string('image')->nullable();
            $table->string('size', 64)->nullable();
            $table->string('material')->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamps();

            $table->index(['category_id', 'price']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
