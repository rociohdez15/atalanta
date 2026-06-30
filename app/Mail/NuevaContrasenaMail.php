<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NuevaContrasenaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $name;
    public $nuevaContrasena;

    public function __construct($name, $nuevaContrasena)
    {
        $this->name = $name;
        $this->nuevaContrasena = $nuevaContrasena;
    }

    public function build()
    {
        $html = "
            <html>
                <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px;'>
                        <h2 style='color: #333;'>Hola {$this->name},</h2>
                        <p>Has solicitado restablecer tu contraseña.</p>
                        <p><strong>Tu nueva contraseña es:</strong></p>
                        <div style='font-size: 20px; margin: 10px 0; color: #000; font-weight: bold;'>{$this->nuevaContrasena}</div>
                        <p>Te recomendamos cambiarla después de iniciar sesión.</p>
                        <p style='margin-top: 30px; font-size: 12px; color: #777;'>Este mensaje fue generado automáticamente. Por favor, no respondas a este correo.</p>
                    </div>
                </body>
            </html>
        ";

        return $this->subject('Tu nueva contraseña')->html($html);
    }
}
