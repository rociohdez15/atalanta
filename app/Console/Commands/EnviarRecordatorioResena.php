<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reserva;
use App\Mail\RecordatorioResenaMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class EnviarRecordatorioResena extends Command
{
    protected $signature = 'resenas:recordatorio';
    protected $description = 'Enviar correo a los clientes cuyas reservas finalizaron ayer y aún no tienen reseña';

    public function handle()
    {
        $ayer = Carbon::yesterday()->toDateString();

        // Traemos reservas sin reseña
        $reservas = Reserva::whereDoesntHave('resena2')
            ->where(function ($query) use ($ayer) {

                // CASO 1: Paquetes normales
                $query->whereHas('paquete', function ($q) use ($ayer) {
                    $q->whereDate('fecha_fin', $ayer);
                });

                // CASO 2: Personalizados (paquete_id = 0)
                $query->orWhere(function ($q) use ($ayer) {
                    $q->where('paquete_id', 0)
                      ->whereDate('fecha_fin', $ayer);
                });

            })
            ->with(['cliente2.user', 'paquete'])
            ->get();

        foreach ($reservas as $reserva) {

            $cliente = $reserva->cliente2;
            $usuario = $cliente?->user;

            if (!$usuario || !$usuario->email) {
                $this->warn("Reserva {$reserva->id} ignorada: usuario sin email.");
                continue;
            }

            // ============================
            //   DATOS DEL PAQUETE
            // ============================

            if ($reserva->paquete_id != 0 && $reserva->paquete) {

                // PAQUETE NORMAL
                $paqueteNombre = $reserva->paquete->nombre ?? 'Experiencia';
                $fechaFinRaw   = $reserva->paquete->fecha_fin ?? $reserva->fecha_fin;

            } else {

                // PERSONALIZADO
                $paqueteNombre = $reserva->destino ?: 'Viaje personalizado';
                $fechaFinRaw   = $reserva->fecha_fin;
            }

            // Formateo seguro de fecha
            try {
                $fechaFin = Carbon::parse($fechaFinRaw)->format('d-m-Y');
            } catch (\Throwable $e) {
                $fechaFin = 'Fecha no disponible';
            }

            // ============================
            //   ENVÍO DEL CORREO
            // ============================

            Mail::to($usuario->email)->send(new RecordatorioResenaMail(
                $usuario,
                $paqueteNombre,
                $reserva->id,
                trim(($cliente->nombre ?? '') . ' ' . ($cliente->apellidos ?? '')),
                $reserva->fecha_inicio,
                $fechaFin
            ));

            $this->info("Correo enviado a {$usuario->email} para la reserva {$reserva->id}");
        }

        $this->info("Todos los recordatorios enviados.");
    }
}
