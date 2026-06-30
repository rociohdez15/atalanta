<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NotificacionNuevaReserva extends Mailable
{
    use Queueable, SerializesModels;

    public $reserva;
    public $participantes;

    public function __construct($reserva, $participantes)
    {
        $this->reserva = $reserva;
        $this->participantes = $participantes;
    }

    public function build()
    {
        $reservaId = $this->reserva->id ?? 'N/A';
        $totalPrecio = $this->reserva->total ?? 0;
        $plazas = $this->reserva->plazas ?? 0;

        $html = "
        <html>
            <body>
                <h2>Nueva Reserva Realizada</h2>
                <p>Se ha realizado una nueva reserva en la web.</p>";

        $html .= "
                </ul>
                <p>Por favor, entra en <a href='https://www.viajesatalanta.com/login'>www.viajesatalanta.com</a> para verla.</p>
            </body>
        </html>
        ";

        return $this->subject("Nueva reserva realizada")
                    ->html($html);
    }
}
