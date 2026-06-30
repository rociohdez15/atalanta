<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\PaqueteTuristico;

class LimpiarReservasExpiradas extends Command
{
    protected $signature = 'reservas:limpiar';

    protected $description = 'Limpiar reservas temporales expiradas';

    public function handle()
    {
        $temporales = DB::table('reservas_temporales')
            ->where('created_at', '<', now()->subHours(3))
            ->get();

        foreach ($temporales as $temp) {

            $datos = json_decode($temp->datos, true);

            if (!empty($datos['participantes'])) {

                $cantidad = count($datos['participantes']);

                PaqueteTuristico::where('id', $datos['paqueteId'])
                    ->decrement('plazas_reservadas', $cantidad);
            }

            DB::table('reservas_temporales')
                ->where('id', $temp->id)
                ->delete();
        }

        $this->info('Reservas temporales limpiadas');
    }
}