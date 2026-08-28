<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    public function up(): void
    {
        Schema::table('paquetes_turisticos', function (Blueprint $table) {
            $table->dateTime('oferta_inicio')
                ->nullable()
                ->after('oferta');

            $table->dateTime('oferta_fin')
                ->nullable()
                ->after('oferta_inicio');
        });
    }

    public function down(): void
    {
        Schema::table('paquetes_turisticos', function (Blueprint $table) {
            $table->dropColumn([
                'oferta_inicio',
                'oferta_fin',
            ]);
        });
    }
};
