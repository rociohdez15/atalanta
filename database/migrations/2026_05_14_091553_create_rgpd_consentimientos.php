<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Añadir campos RGPD a la tabla clientes
        Schema::table('clientes', function (Blueprint $table) {
            $table->boolean('rgpd_aceptado')->default(false)->after('fecha_nacimiento');
            $table->timestamp('rgpd_fecha')->nullable()->after('rgpd_aceptado');
            $table->string('rgpd_version', 10)->nullable()->after('rgpd_fecha');
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table) {
            $table->dropColumn(['rgpd_aceptado', 'rgpd_fecha', 'rgpd_version']);
        });
    }
};