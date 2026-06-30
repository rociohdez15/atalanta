<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proyectos', function (Blueprint $table) {

            // Eliminar columnas existentes
            if (Schema::hasColumn('proyectos', 'estado')) {
                $table->dropColumn('estado');
            }

            if (Schema::hasColumn('proyectos', 'asignado')) {
                $table->dropColumn('asignado');
            }

            // Añadir nuevas columnas
            if (!Schema::hasColumn('proyectos', 'web')) {
                $table->string('web')->nullable()->after('nombre');
            }

            if (!Schema::hasColumn('proyectos', 'descripcion')) {
                $table->text('descripcion')->nullable()->after('web');
            }
        });
    }

    public function down(): void
    {
        Schema::table('proyectos', function (Blueprint $table) {

            // Volver a crear las columnas eliminadas
            $table->string('estado')->nullable();
            $table->boolean('asignado')->default(false);

            // Eliminar las columnas añadidas
            $table->dropColumn(['web', 'descripcion']);
        });
    }
};
