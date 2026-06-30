<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proveedores', function (Blueprint $table) {

            // Eliminar columna antigua si ya no la quieres
            $table->dropColumn('tipo_servicio');

            // Modificar / mantener nombre (ya existe)
            $table->string('email')->after('nombre')->nullable();
            
            // teléfono (puedes mantenerlo o redefinirlo)
            $table->string('telefono', 20)->change();

            // nueva columna notas
            $table->text('notas')->nullable()->after('telefono');
        });
    }

    public function down(): void
    {
        Schema::table('proveedores', function (Blueprint $table) {

            $table->string('tipo_servicio')->after('nombre');

            $table->dropColumn('email');
            $table->dropColumn('notas');

            // opcional: restaurar tipo original
            $table->string('telefono', 20)->change();
        });
    }
};