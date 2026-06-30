<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stripe_session_resultados', function (Blueprint $table) {
            $table->id();
            $table->string('stripe_session_id')->unique();
            $table->unsignedBigInteger('usuario_id');
            $table->string('resultado'); // 'sin_plazas'
            $table->timestamps();

            $table->foreign('usuario_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->index('stripe_session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stripe_session_resultados');
    }
};
