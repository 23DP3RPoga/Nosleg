<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('specialty');
            $table->string('city')->nullable();
            $table->string('clinic')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->json('languages')->nullable();
            $table->decimal('rating', 3, 1)->nullable();
            $table->text('bio')->nullable();
            $table->boolean('accepting_patients')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
