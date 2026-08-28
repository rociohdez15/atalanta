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
        Schema::table('reservas', function (Blueprint $table) {
            $table->boolean('acepta_condiciones_black_friday')
                ->default(false)
                ->after('estado');

            $table->timestamp('condiciones_black_friday_aceptadas_at')
                ->nullable()
                ->after('acepta_condiciones_black_friday');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropColumn([
                'acepta_condiciones_black_friday',
                'condiciones_black_friday_aceptadas_at',
            ]);
        });
    }
};
