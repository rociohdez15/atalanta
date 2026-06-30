<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class RecordatorioResenaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $cliente;
    public $paqueteNombre;
    public $reservaId;
    public $clienteNombreCompleto;
    public $fechaInicioPaquete;
    public $fechaFinPaquete;

    public function __construct($cliente, $paqueteNombre, $reservaId, $clienteNombreCompleto, $fechaInicioPaquete, $fechaFinPaquete)
    {
        $this->cliente = $cliente;
        $this->paqueteNombre = $paqueteNombre;
        $this->reservaId = $reservaId;
        $this->clienteNombreCompleto = $clienteNombreCompleto;
        $this->fechaInicioPaquete = $fechaInicioPaquete;
        $this->fechaFinPaquete = $fechaFinPaquete;
    }

    public function build()
    {
        // Formateamos la fecha fin del paquete a dd-mm-yyyy
        $fechaFinFormateada = Carbon::parse($this->fechaFinPaquete)->format('d-m-Y');

        $htmlEmail = "
        <html>
        <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
        <div style='max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 10px; color: #333;'>
            <h1 style='color: #35372e; text-align: center;'>¡Tu opinión importa!</h1>
            <p style='font-size: 16px;'>Hola {$this->clienteNombreCompleto},</p>
            <p style='font-size: 16px;'>Tu reserva sobre el paquete <strong>{$this->paqueteNombre}</strong> finalizó ayer ({$fechaFinFormateada}).</p>
            <p style='font-size: 16px;'>Nos encantaría que compartieras tu experiencia dejándonos una reseña.</p>
            <p style='text-align:center; margin-top:20px;'>
                <a href='https://www.viajesatalanta.com/profile?tab=review' style='background:#000000;color:white;padding:10px 20px;text-decoration:none;border-radius:6px; display:inline-block; font-weight:bold;'>
                    Escribir reseña
                </a>
            </p>
            <hr style='border: 0; border-top: 1px solid #ddd; margin: 20px 0;'>
            <p style='font-size: 14px;'>¡Gracias por confiar en Atalanta! 🌍✈️</p>
            <p style='margin-top: 30px; font-size: 12px; color: #777;'>Este mensaje fue generado automáticamente. Por favor, no respondas a este correo.</p>
        </div>
        </body>
        </html>";

        return $this->subject("Cuéntanos tu experiencia con Atalanta")
                    ->html($htmlEmail);
    }
}
