<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('formulario_contacto', function (Blueprint $table) {
            $table->boolean('rgpd_aceptado')->default(false)->after('fecha');
            $table->timestamp('rgpd_fecha')->nullable()->after('rgpd_aceptado');
        });
    }

    public function down(): void
    {
        Schema::table('formulario_contacto', function (Blueprint $table) {
            $table->dropColumn(['rgpd_aceptado', 'rgpd_fecha']);
        });
    }
};