<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('likes_entrada', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('entrada_id');
            $table->timestamp('fecha')->nullable()->useCurrent();
            $table->timestamps();

            $table->unique(['usuario_id', 'entrada_id']);

            $table->foreign('usuario_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('entrada_id')->references('id')->on('entradas')->onDelete('cascade');
        });
    }

    public function down(): void {
        Schema::dropIfExists('likes_entrada');
    }
};
