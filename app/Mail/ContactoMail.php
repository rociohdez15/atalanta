<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $nombre;
    public $email;
    public $mensaje;

    public function __construct($nombre, $email, $mensaje)
    {
        $this->nombre = $nombre;
        $this->email = $email;
        $this->mensaje = $mensaje;
    }

    public function build()
    {
        $htmlEmail = "
        <html>
            <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
                <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; color: #333;'>

                    <h1 style='color: #35372e; text-align: center;'>Nuevo mensaje del formulario de contacto</h1>

                    <p style='font-size: 16px;'>
                        Se ha recibido un nuevo mensaje desde el formulario de contacto de la web de <strong>Atalanta</strong>.
                    </p>

                    <hr style='border: 0; border-top: 1px solid #ddd; margin: 20px 0;'>

                    <h3 style='color: #35372e;'>📩 Datos del remitente</h3>

                    <ul style='font-size: 16px; list-style: none; padding: 0;'>
                        <li><strong>Nombre:</strong> {$this->nombre}</li>
                        <li><strong>Email:</strong> {$this->email}</li>
                    </ul>

                    <hr style='border: 0; border-top: 1px solid #ddd; margin: 20px 0;'>

                    <h3 style='color: #35372e;'>💬 Mensaje</h3>

                    <p style='font-size: 16px; white-space: pre-line;'>
                        {$this->mensaje}
                    </p>

                    <hr style='border: 0; border-top: 1px solid #ddd; margin: 20px 0;'>

                    <p style='font-size: 16px;'>
                        Puedes gestionar este mensaje accediendo al panel de administración:
                    </p>

                    <p style='font-size: 16px;'>
                        👉 <a href='https://www.viajesatalanta.com/login'>www.viajesatalanta.com</a>
                    </p>

                    <p style='margin-top: 30px; font-size: 12px; color: #777; text-align: center;'>
                        Este mensaje fue generado automáticamente. No respondas a este correo.
                    </p>

                </div>
            </body>
        </html>
        ";

        return $this->subject('Nuevo mensaje del formulario de contacto')
                    ->html($htmlEmail);
    }
}
