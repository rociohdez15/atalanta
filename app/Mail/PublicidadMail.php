<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PublicidadMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $asunto;
    public string $contenido;

    public function __construct(string $asunto, string $contenido)
    {
        $this->asunto = $asunto;
        $this->contenido = $contenido;
    }

    public function build()
    {
        $year = date('Y');

        $htmlEmail = "
        <html>
        <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; color: #333;'>

                <!-- Header -->
                <div style='text-align:center; margin-bottom:20px;'>
                    <h1 style='color:#35372e; margin-bottom:5px;'>Atalanta</h1>
                </div>

                <hr style='border:0; border-top:1px solid #ddd; margin:20px 0;'>

                <!-- Content -->
                <div style='font-size:16px; line-height:1.7;'>
                    {$this->formatearTexto($this->contenido)}
                </div>

                <!-- CTA -->
                <div style='text-align:center; margin-top:30px;'>
                    <a href='https://www.viajesatalanta.com'
                       style='display:inline-block; padding:12px 24px;
                              background-color:#8a775a; color:#ffffff;
                              text-decoration:none; border-radius:30px;
                              font-size:14px; font-weight:600;'>
                        Ver más detalles
                    </a>
                </div>

                <hr style='border:0; border-top:1px solid #ddd; margin:30px 0;'>

                <!-- Footer -->
                <div style='text-align:center; font-size:12px; color:#777;'>
                    <p style='margin-bottom:5px;'>© {$year} Atalanta</p>
                    <p style='margin:0;'>Has recibido este correo porque eres cliente de nuestra plataforma.</p>
                </div>

            </div>
        </body>
        </html>";

        return $this->subject($this->asunto)
                    ->html($htmlEmail);
    }

    /**
     * Convierte saltos de línea en <br> y escapa HTML
     */
    private function formatearTexto(string $texto): string
    {
        return nl2br(e($texto));
    }
}
