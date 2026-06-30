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
        Schema::table('paquetes_turisticos', function (Blueprint $table) {
            $table->string('lugar')->after('nombre');
            $table->integer('numero_plazas')->after('plazas');
            $table->string('tipo_viaje')->after('precio');
            $table->text('descripcion')->after('tipo_viaje');
            $table->string('foto')->nullable()->after('descripcion');
            $table->text('incluye')->nullable()->after('foto');
            $table->text('no_incluye')->nullable()->after('incluye');
            $table->text('preguntas_frecuentes')->nullable()->after('no_incluye');
        });
    }

    public function down(): void
    {
        Schema::table('paquetes_turisticos', function (Blueprint $table) {
            $table->dropColumn([
                'lugar',
                'numero_plazas',
                'fecha',
                'tipo_viaje',
                'descripcion',
                'foto',
                'incluye',
                'no_incluye',
                'preguntas_frecuentes'
            ]);
        });
    }
};
