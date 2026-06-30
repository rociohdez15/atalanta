<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $name;

    public function __construct($name)
    {
        $this->name = $name;
    }

    public function build()
    {
        $html = "
            <html>
                <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px;'>
                        <h2 style='color: #333;'>¡Bienvenido/a {$this->name}!</h2>
                        <p>Gracias por registrarte en Atalanta.</p>
                        <p>Ya puedes acceder a tu cuenta y explorar todas las experiencias que tenemos para ti.</p>
                        <p style='margin-top: 20px;'>Si tienes alguna duda, puedes contactarnos desde nuestra página web.</p>
                        <p style='margin-top: 30px; font-size: 12px; color: #777;'>Este mensaje fue generado automáticamente. Por favor, no respondas a este correo.</p>
                    </div>
                </body>
            </html>
        ";

        return $this->subject('Registro exitoso')->html($html);
    }
}
