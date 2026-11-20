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
        $fechaFinFormateada = Carbon::parse($this->fechaFinPaquete)->format('d-m-Y');

        $htmlEmail = "
        <html>
        <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
        <div style='max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 10px; color: #333;'>

            <h1 style='color: #35372e; text-align: center;'>
                ¡Tu opinión importa!
            </h1>

            <p style='font-size: 16px;'>
                Hola {$this->clienteNombreCompleto},
            </p>

            <p style='font-size: 16px; line-height: 1.6;'>
                Tu viaje correspondiente al paquete
                <strong>{$this->paqueteNombre}</strong> finalizó ayer
                ({$fechaFinFormateada}).
            </p>

            <p style='font-size: 16px; line-height: 1.6;'>
                Esperamos que hayas disfrutado de esta experiencia.
                Nos encantaría conocer tu opinión y que compartieras
                con nosotros tu experiencia para ayudar a otros viajeros
                a descubrir nuestros destinos.
            </p>

            <p style='font-size: 16px; line-height: 1.6;'>
                Para escribir tu reseña, solo tienes que seguir estos sencillos pasos:
            </p>

            <div style='background-color: #f8f7f4; padding: 20px; border-radius: 8px; margin: 20px 0;'>

                <p style='font-size: 15px; font-weight: bold; color: #35372e; margin-bottom: 8px;'>
                    PASO 1. Accede a tu cuenta
                </p>

                <p style='font-size: 14px; line-height: 1.6; margin-top: 0;'>
                    Entra en nuestra página web
                    <a href='https://www.viajesatalanta.com' style='color: #FEDE59; font-weight: bold;'>
                        www.viajesatalanta.com
                    </a>
                    e inicia sesión utilizando la dirección de correo electrónico
                    con la que realizaste tu reserva y la contraseña de tu cuenta.
                </p>

                <p style='font-size: 14px; line-height: 1.6;'>
                    <strong>¿No recuerdas tu contraseña?</strong>
                    Si tu cuenta fue creada por nuestro equipo de Viajes Atalanta,
                    o no recuerdas tus datos de acceso, pulsa en
                    <strong>«¿Olvidaste tu contraseña?»</strong> en la pantalla
                    de inicio de sesión.
                </p>

                <p style='font-size: 14px; line-height: 1.6;'>
                    Recibirás un correo electrónico con las instrucciones
                    para establecer una nueva contraseña. Una vez creada,
                    podrás utilizarla para iniciar sesión.
                    Por seguridad, te recomendamos cambiarla posteriormente
                    desde tu perfil por una contraseña personal.
                </p>

                <hr style='border: 0; border-top: 1px solid #ddd; margin: 20px 0;'>

                <p style='font-size: 15px; font-weight: bold; color: #35372e; margin-bottom: 8px;'>
                    PASO 2. Accede a tu perfil
                </p>

                <p style='font-size: 14px; line-height: 1.6; margin-top: 0;'>
                    Una vez hayas iniciado sesión:
                </p>

                <ul style='font-size: 14px; line-height: 1.8; padding-left: 20px;'>
                    <li>
                        <strong>Desde un ordenador:</strong>
                        haz clic en tu nombre, situado en la parte superior derecha
                        de la página.
                    </li>
                    <li>
                        <strong>Desde un móvil:</strong>
                        pulsa el icono del menú (las tres rayitas),
                        situado en la parte superior derecha.
                    </li>
                </ul>

                <p style='font-size: 14px; line-height: 1.6;'>
                    En ambos casos, selecciona la opción
                    <strong>«Ver perfil»</strong>.
                </p>

                <hr style='border: 0; border-top: 1px solid #ddd; margin: 20px 0;'>

                <p style='font-size: 15px; font-weight: bold; color: #35372e; margin-bottom: 8px;'>
                    PASO 3. Escribe tu reseña
                </p>

                <p style='font-size: 14px; line-height: 1.6; margin-top: 0;'>
                    Dentro de tu perfil, accede al apartado
                    <strong>«Mis reseñas»</strong>.
                    Allí podrás escribir y publicar tu opinión sobre
                    el viaje que has realizado.
                </p>

                <p style='font-size: 14px; line-height: 1.6;'>
                    ¡Cuéntanos qué te ha parecido la experiencia,
                    qué es lo que más has disfrutado y qué destacarías de tu viaje!
                </p>

            </div>

            <p style='font-size: 16px; text-align: center; line-height: 1.6;'>
                ¿Preparado para compartir tu experiencia?
            </p>

            <p style='text-align: center; margin-top: 20px; margin-bottom: 25px;'>
                <a href='https://www.viajesatalanta.com/profile?tab=review'
                   style='background: #FEDE59; color: white; padding: 13px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;'>
                    ACCEDER A MI PERFIL
                </a>
            </p>

            <p style='font-size: 15px; line-height: 1.6;'>
                Tu opinión es muy importante para nosotros. Nos ayuda a seguir
                mejorando y permite que otros viajeros conozcan las experiencias
                que ofrecemos.
            </p>

            <p style='font-size: 15px;'>
                ¡Muchas gracias por confiar en Viajes Atalanta!
                <br>
                <strong>El equipo de Viajes Atalanta</strong> 🌍✈️
            </p>

            <hr style='border: 0; border-top: 1px solid #ddd; margin: 20px 0;'>

            <p style='font-size: 12px; color: #777; text-align: center; line-height: 1.6;'>
                Este mensaje ha sido generado automáticamente.
                Por favor, no respondas a este correo.
                <br>
                <a href='https://www.viajesatalanta.com' style='color: #FEDE59;'>
                    www.viajesatalanta.com
                </a>
            </p>

        </div>
        </body>
        </html>";

        return $this->subject("Cuéntanos tu experiencia con Atalanta")
                    ->html($htmlEmail);
    }
}
