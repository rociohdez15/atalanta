<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReservaConfirmacionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $cliente;
    public $fechaReservaFormatted;
    public $fechaInicioFormatted;
    public $fechaFinFormatted;
    public $precioUnitario;
    public $subtotal;
    public $name;
    public $tipoPago;
    public $numCuotas;
    public $importeCuotas;
    public $plazas;
    public $totalPrecio;
    public $linkPagoCuotas;
    public $reserva;
    public $participantes;
    public $paqueteNombre;
    public $reservaId;
    public $clienteNombreCompleto;
    public $fechaInicio;
    public $fechaFin;
    public $serviciosIncluidos;
    public $serviciosNoIncluidos;
    public $descuentos;
    public $esPersonalizado;
    public $destino;
    public $itinerario;
    public $vouchers;
    public $notas;

    public function __construct(
        $cliente,
        $fechaReservaFormatted = null,
        $precioUnitario = 0,
        $subtotal = 0,
        $name = '',
        $tipoPago = '',
        $numCuotas = 0,
        $importeCuotas = 0,
        $plazas = 0,
        $totalPrecio = 0,
        $destino = null,
        $linkPagoCuotas = null,
        $reserva = null,
        $participantes = [],
        $paqueteNombre = '',
        $reservaId = null,
        $clienteNombreCompleto = '',
        $fechaInicio = null,
        $fechaFin = null,
        $serviciosIncluidos = [],
        $serviciosNoIncluidos = [],
        $descuentos = [],
        $itinerario = [],
        $vouchers = [],
        $notas = null
    ) {
        /*
        |--------------------------------------------------------------------------
        | CLIENTE
        |--------------------------------------------------------------------------
        */

        $this->cliente = is_object($cliente)
            ? $cliente->toArray()
            : (is_array($cliente) ? $cliente : []);

        /*
        |--------------------------------------------------------------------------
        | DATOS PRINCIPALES
        |--------------------------------------------------------------------------
        */

        $this->fechaReservaFormatted = $fechaReservaFormatted;
        $this->precioUnitario = $precioUnitario;
        $this->subtotal = $subtotal;
        $this->name = $name;
        $this->tipoPago = $tipoPago;
        $this->numCuotas = $numCuotas;
        $this->importeCuotas = $importeCuotas;
        $this->plazas = $plazas;
        $this->totalPrecio = $totalPrecio;

        $this->linkPagoCuotas = $linkPagoCuotas;
        $this->reserva = $reserva;

        $this->paqueteNombre = $paqueteNombre;
        $this->reservaId = $reservaId;

        $this->clienteNombreCompleto = $clienteNombreCompleto;

        $this->fechaInicio = $fechaInicio;
        $this->fechaFin = $fechaFin;

        $this->destino = $destino;

        /*
        |--------------------------------------------------------------------------
        | NOTAS
        |--------------------------------------------------------------------------
        */

        if ($notas === null && is_object($this->reserva)) {
            $notas = $this->reserva->notas ?? null;
        }

        $this->notas = is_null($notas)
            ? ''
            : (string) $notas;

        /*
        |--------------------------------------------------------------------------
        | PARTICIPANTES (ya no se usan en la factura; se mantiene el
        | parámetro para no romper la firma del constructor)
        |--------------------------------------------------------------------------
        */

        if (is_null($participantes)) {
            $participantes = [];
        }

        if (!is_array($participantes)) {
            $participantes = [$participantes];
        }

        $this->participantes = array_map(
            function ($p) {
                if (is_object($p)) {
                    return (array) $p;
                }

                return is_array($p) ? $p : [];
            },
            $participantes
        );

        /*
        |--------------------------------------------------------------------------
        | SERVICIOS INCLUIDOS
        |--------------------------------------------------------------------------
        */

        if (is_null($serviciosIncluidos)) {
            $serviciosIncluidos = [];
        }

        if (!is_array($serviciosIncluidos)) {
            $serviciosIncluidos = [$serviciosIncluidos];
        }

        $this->serviciosIncluidos = array_map(
            function ($s) {
                if (is_object($s)) {
                    return (array) $s;
                }

                return $s;
            },
            $serviciosIncluidos
        );

        /*
        |--------------------------------------------------------------------------
        | SERVICIOS NO INCLUIDOS
        |--------------------------------------------------------------------------
        */

        if (is_null($serviciosNoIncluidos)) {
            $serviciosNoIncluidos = [];
        }

        if (!is_array($serviciosNoIncluidos)) {
            $serviciosNoIncluidos = [$serviciosNoIncluidos];
        }

        $this->serviciosNoIncluidos = array_map(
            function ($s) {
                if (is_object($s)) {
                    return (array) $s;
                }

                return $s;
            },
            $serviciosNoIncluidos
        );

        /*
        |--------------------------------------------------------------------------
        | DESCUENTOS
        |--------------------------------------------------------------------------
        */

        if (is_null($descuentos)) {
            $descuentos = [];
        }

        if (!is_array($descuentos)) {
            $descuentos = [$descuentos];
        }

        $this->descuentos = array_map(
            function ($d) {
                if (is_object($d)) {
                    return (array) $d;
                }

                return is_array($d) ? $d : [];
            },
            $descuentos
        );

        /*
        |--------------------------------------------------------------------------
        | ITINERARIO
        |--------------------------------------------------------------------------
        */

        if (is_null($itinerario) || !is_array($itinerario)) {
            $itinerario = [];
        }

        $reservaIdFiltro = null;

        if (
            is_object($this->reserva)
            && isset($this->reserva->id)
        ) {
            $reservaIdFiltro = $this->reserva->id;
        }

        $this->itinerario = array_values(
            array_filter(
                $itinerario,
                function ($item) use ($reservaIdFiltro) {

                    if (is_object($item)) {
                        $item = (array) $item;
                    }

                    if (!is_array($item)) {
                        return false;
                    }

                    if (
                        $reservaIdFiltro !== null
                        && isset($item['reserva_id'])
                    ) {
                        return (int) $item['reserva_id'] === (int) $reservaIdFiltro;
                    }

                    return true;
                }
            )
        );

        $this->itinerario = array_map(
            function ($item) {
                return is_object($item)
                    ? (array) $item
                    : $item;
            },
            $this->itinerario
        );

        /*
        |--------------------------------------------------------------------------
        | VOUCHERS
        |--------------------------------------------------------------------------
        */

        if (is_string($vouchers)) {

            $decoded = json_decode($vouchers, true);

            if (
                json_last_error() === JSON_ERROR_NONE
                && is_array($decoded)
            ) {
                $vouchers = $decoded;
            } else {
                $vouchers = [$vouchers];
            }
        }

        if (is_null($vouchers)) {
            $vouchers = [];
        }

        if (!is_array($vouchers)) {
            $vouchers = [$vouchers];
        }

        $this->vouchers = array_map(
            function ($v) {

                if (is_object($v)) {
                    $v = (array) $v;
                }

                if (is_array($v)) {
                    return $v;
                }

                return [
                    'path' => $v,
                    'name' => basename((string) $v),
                    'mime' => 'application/pdf',
                ];
            },
            $vouchers
        );

        /*
        |--------------------------------------------------------------------------
        | RESERVA PERSONALIZADA
        |--------------------------------------------------------------------------
        */

        $this->esPersonalizado =
            is_object($this->reserva)
            && isset($this->reserva->paquete_id)
            && (int) $this->reserva->paquete_id === 0;
    }

    public function build()
    {
        /*
        |--------------------------------------------------------------------------
        | DATOS ECONÓMICOS
        |--------------------------------------------------------------------------
        */

        $tipoPago = strtolower((string) $this->tipoPago);

        $totalPrecioFloat = (float) $this->totalPrecio;

        $totalPrecioFormatted = number_format(
            $totalPrecioFloat,
            2,
            ',',
            '.'
        );

        $plazas = (int) $this->plazas;

        /*
        |--------------------------------------------------------------------------
        | IVA
        |--------------------------------------------------------------------------
        */

        $baseImponible = $totalPrecioFloat / 1.21;
        $iva = $totalPrecioFloat - $baseImponible;

        $baseImponibleFormatted = number_format(
            $baseImponible,
            2,
            ',',
            '.'
        );

        $ivaFormatted = number_format(
            $iva,
            2,
            ',',
            '.'
        );

        /*
        |--------------------------------------------------------------------------
        | NOMBRE DEL PAQUETE / DESTINO
        |--------------------------------------------------------------------------
        */

        if ($this->esPersonalizado) {

            $paqueteNombre =
                $this->destino
                ?: (
                    is_object($this->reserva)
                    ? ($this->reserva->destino ?? 'Destino personalizado')
                    : 'Destino personalizado'
                );
        } else {

            $paqueteNombre =
                $this->paqueteNombre
                ?: ($this->destino ?: 'Experiencia');
        }

        /*
        |--------------------------------------------------------------------------
        | FECHA DE RESERVA
        |--------------------------------------------------------------------------
        */

        $fechaReserva =
            is_object($this->reserva)
            && !empty($this->reserva->fecha_reserva)
            ? $this->reserva->fecha_reserva
            : $this->fechaReservaFormatted;

        try {

            $fechaReservaFormatted = Carbon::parse(
                $fechaReserva
            )->format('d/m/Y');

        } catch (\Throwable $e) {

            $fechaReservaFormatted =
                $this->fechaReservaFormatted
                ?: date('d/m/Y');
        }

        /*
        |--------------------------------------------------------------------------
        | FUNCIÓN PARA EXTRAER FECHAS
        |--------------------------------------------------------------------------
        */

        $extraerFecha = function ($valor) {

            if (empty($valor)) {
                return null;
            }

            if ($valor instanceof Carbon) {
                return $valor;
            }

            if ($valor instanceof \DateTimeInterface) {
                return Carbon::instance($valor);
            }

            if (is_array($valor)) {
                $valor =
                    $valor['date']
                    ?? $valor[0]
                    ?? null;
            }

            if (empty($valor)) {
                return null;
            }

            try {
                return Carbon::parse($valor);
            } catch (\Throwable $e) {
                return null;
            }
        };

        /*
        |--------------------------------------------------------------------------
        | FECHA INICIO
        |--------------------------------------------------------------------------
        */

        $rawInicio = null;

        if (
            is_object($this->reserva)
            && !empty($this->reserva->fecha_inicio)
        ) {
            $rawInicio = $extraerFecha(
                $this->reserva->fecha_inicio
            );
        }

        if (!$rawInicio) {
            $rawInicio = $extraerFecha(
                $this->fechaInicio
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FECHA FIN
        |--------------------------------------------------------------------------
        */

        $rawFin = null;

        if (
            is_object($this->reserva)
            && !empty($this->reserva->fecha_fin)
        ) {
            $rawFin = $extraerFecha(
                $this->reserva->fecha_fin
            );
        }

        if (!$rawFin) {
            $rawFin = $extraerFecha(
                $this->fechaFin
            );
        }

        $fechaInicio = $rawInicio
            ? $rawInicio->format('d-m-Y')
            : null;

        $fechaInicioFormatted = $rawInicio
            ? $rawInicio->format('d/m/Y')
            : 'No disponible';

        $fechaFin = $rawFin
            ? $rawFin->format('d-m-Y')
            : null;

        $fechaFinFormatted = $rawFin
            ? $rawFin->format('d/m/Y')
            : 'No disponible';

        /*
        |--------------------------------------------------------------------------
        | DATOS DEL CLIENTE
        |--------------------------------------------------------------------------
        */

        $reservaId = $this->reservaId;

        $clienteNombreCompleto =
            $this->clienteNombreCompleto
            ?: trim(
                ($this->cliente['nombre'] ?? '')
                    . ' '
                    . ($this->cliente['apellidos'] ?? '')
            );

        $subtotal = number_format(
            (float) $this->subtotal,
            2,
            ',',
            '.'
        );

        /*
        |--------------------------------------------------------------------------
        | EMAIL
        |--------------------------------------------------------------------------
        */

        $htmlEmail = "
        <html>
        <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>

        <div style='max-width:600px; margin:0 auto; background:#fff; padding:30px; border-radius:10px; color:#333;'>

            <h1 style='color:#35372e; text-align:center; margin-bottom:10px;'>
                ¡{$paqueteNombre} TE ESPERA!
            </h1>

            <p style='font-size:16px; text-align:center; color:#666;'>
                Tu reserva con <strong>Atalanta</strong> ha sido confirmada.
            </p>

            <hr style='border:0; border-top:1px solid #ddd; margin:25px 0;'>

            <p style='font-size:16px;'>
                Hola <strong>{$clienteNombreCompleto}</strong>,
            </p>

            <p style='font-size:16px; line-height:1.6;'>
                ¡Gracias por reservar con <strong>Atalanta</strong>!<br>
                Nos alegra acompañarte en esta nueva aventura.
                Aquí tienes todos los detalles de tu experiencia:
            </p>

            <h3 style='margin-top:25px;'>📌 Detalles de tu reserva</h3>

            <ul style='font-size:16px; list-style:none; padding:0; line-height:1.8;'>

                <li>
                    • <strong>Destino:</strong> {$paqueteNombre}
                </li>";

        if ($fechaInicio) {
            $htmlEmail .= "
                <li>
                    • <strong>Fecha de salida:</strong> {$fechaInicio}
                </li>";
        }

        if ($fechaFin) {
            $htmlEmail .= "
                <li>
                    • <strong>Fecha de regreso:</strong> {$fechaFin}
                </li>";
        }

        $htmlEmail .= "
                <li>
                    • <strong>Número de viajeros:</strong> {$plazas}
                </li>

                <li>
                    • <strong>ID Reserva:</strong> {$reservaId}
                </li>

            </ul>";


        /*
        |--------------------------------------------------------------------------
        | SERVICIOS INCLUIDOS
        |--------------------------------------------------------------------------
        */

        if (!empty($this->serviciosIncluidos)) {

            $htmlEmail .= "
            <h3 style='margin-top:25px;'>✨ Servicios incluidos</h3>

            <ul style='font-size:16px; padding-left:15px; line-height:1.8;'>";

            foreach ($this->serviciosIncluidos as $s) {

                if (is_object($s)) {
                    $s = (array) $s;
                }

                if (is_array($s)) {

                    $desc = $s['descripcion'] ?? '';

                    $precio =
                        isset($s['precio'])
                        && is_numeric($s['precio'])
                        && $s['precio'] > 0
                        ? ' — ' . number_format(
                            (float) $s['precio'],
                            2,
                            ',',
                            '.'
                        ) . ' €'
                        : '';

                    $htmlEmail .=
                        "<li>{$desc}{$precio}</li>";

                } elseif (is_string($s)) {

                    $decoded = json_decode($s, true);

                    if (is_array($decoded)) {

                        $desc =
                            $decoded['descripcion']
                            ?? '';

                        $precio =
                            isset($decoded['precio'])
                            && is_numeric($decoded['precio'])
                            && $decoded['precio'] > 0
                            ? ' — ' . number_format(
                                (float) $decoded['precio'],
                                2,
                                ',',
                                '.'
                            ) . ' €'
                            : '';

                        $htmlEmail .=
                            "<li>{$desc}{$precio}</li>";

                    } else {

                        $htmlEmail .=
                            "<li>{$s}</li>";
                    }
                }
            }

            $htmlEmail .= "</ul>";
        }

        /*
        |--------------------------------------------------------------------------
        | NOTAS EN EMAIL
        |--------------------------------------------------------------------------
        */

        if (!empty(trim($this->notas))) {

            $notasEmail = nl2br(
                e($this->notas)
            );

            $htmlEmail .= "
            <h3 style='margin-top:25px;'>
                📝 Notas
            </h3>

            <div style='font-size:16px; line-height:1.6;'>
                {$notasEmail}
            </div>";
        }

        /*
        |--------------------------------------------------------------------------
        | SERVICIOS NO INCLUIDOS
        |--------------------------------------------------------------------------
        */

        if (
            !$this->esPersonalizado
            && !empty($this->serviciosNoIncluidos)
        ) {

            $htmlEmail .= "
            <h3 style='margin-top:25px;'>
                ℹ️ Servicios no incluidos
            </h3>

            <ul style='font-size:16px; padding-left:15px; line-height:1.8;'>";

            foreach ($this->serviciosNoIncluidos as $s) {

                if (is_object($s)) {
                    $s = (array) $s;
                }

                $desc = is_array($s)
                    ? ($s['descripcion'] ?? '')
                    : $s;

                $htmlEmail .=
                    "<li>{$desc}</li>";
            }

            $htmlEmail .= "</ul>";
        }

        /*
        |--------------------------------------------------------------------------
        | ITINERARIO
        |--------------------------------------------------------------------------
        */

        if (!empty($this->itinerario)) {

            $htmlEmail .= "
            <h3 style='margin-top:25px;'>
                🗺️ Itinerario del viaje
            </h3>

            <div style='font-size:16px; line-height:1.8;'>";

            foreach ($this->itinerario as $item) {

                if (is_object($item)) {
                    $item = (array) $item;
                }

                if (!is_array($item)) {
                    continue;
                }

                $dia =
                    $item['dia']
                    ?? '';

                $fecha =
                    $item['fecha']
                    ?? '';

                $descripcion =
                    $item['descripcion']
                    ?? '';

                $htmlEmail .= "
                <div style='margin-bottom:15px; padding:15px; background:#f8f8f8; border-radius:8px;'>

                    <strong>Día {$dia}</strong><br>";

                if (!empty($fecha)) {
                    $htmlEmail .= "
                        <span>📅 {$fecha}</span><br>";
                }

                $htmlEmail .= "
                    <span>{$descripcion}</span>

                </div>";
            }

            $htmlEmail .= "</div>";
        }

        /*
        |--------------------------------------------------------------------------
        | DESCUENTOS
        |--------------------------------------------------------------------------
        */

        if (!empty($this->descuentos)) {

            $htmlEmail .= "
            <h3 style='margin-top:25px;'>
                💸 Completa tu viaje con alguno de nuestros descuentos
            </h3>

            <ul style='font-size:16px; padding-left:15px; line-height:1.8;'>";

            foreach ($this->descuentos as $d) {

                if (!is_array($d)) {
                    continue;
                }

                $titulo =
                    $d['titulo']
                    ?? '';

                $htmlEmail .=
                    "<li><strong>{$titulo}</strong>";

                if (!empty($d['codigo'])) {
                    $htmlEmail .=
                        " — Código: {$d['codigo']}";
                }

                if (!empty($d['descripcion'])) {
                    $htmlEmail .=
                        " — {$d['descripcion']}";
                }

                if (!empty($d['enlace'])) {
                    $htmlEmail .=
                        " — <a href='{$d['enlace']}'>Ver</a>";
                }

                $htmlEmail .= "</li>";
            }

            $htmlEmail .= "</ul>";
        }

        /*
        |--------------------------------------------------------------------------
        | FINAL EMAIL
        |--------------------------------------------------------------------------
        */

        $htmlEmail .= "
            <hr style='border:0; border-top:1px solid #ddd; margin:30px 0;'>

            <h3>¿Qué pasa ahora?</h3>

            <p style='font-size:16px; line-height:1.6;'>
                En breve recibirás otro correo con tu documentación de viaje
                y recomendaciones útiles.<br><br>

                Si necesitas realizar algún cambio o tienes dudas,
                estamos aquí para ayudarte.
            </p>

            <h3 style='margin-top:25px;'>✉️ Contacto</h3>

            <ul style='font-size:16px; list-style:none; padding:0; line-height:1.8;'>
                <li>• Correo: info@viajesatalanta.com</li>
                <li>• Teléfono / WhatsApp: 614892722</li>
                <li>• Horario: Lunes a Jueves de 9:00h a 18:00h y Viernes de 9:00h a 15:00h</li>
            </ul>

            <hr style='border:0; border-top:1px solid #ddd; margin:30px 0;'>

            <p style='font-size:16px; text-align:center;'>
                Gracias por confiar en <strong>Atalanta</strong>.<br>
                Tu próxima aventura comienza aquí 🌍✈️
            </p>

            <p style='margin-top:30px; font-size:12px; color:#777; text-align:center;'>
                Este mensaje fue generado automáticamente.
                Por favor, no respondas a este correo.
            </p>

        </div>
        </body>
        </html>";

        /*
        |--------------------------------------------------------------------------
        | LOGO
        |--------------------------------------------------------------------------
        */

        $logoPath = public_path(
            'images/logo_factura_negro.png'
        );

        if (file_exists($logoPath)) {

            $logoBase64 = base64_encode(
                file_get_contents($logoPath)
            );

            $logoSrc =
                'data:image/png;base64,' .
                $logoBase64;

        } else {

            $logoSrc =
                'data:image/png;base64,' .
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMB/eeFmjAAAAAASUVORK5CYII=';
        }

        /*
        |--------------------------------------------------------------------------
        | PDF
        |--------------------------------------------------------------------------
        */

        $htmlPdf = "
<html>
<head>
<style>

@page {
    margin:10mm 20mm 10mm 10mm;
}

body {
    font-family:'DejaVu Sans', Arial, sans-serif;
    color:#333;
    margin:0;
    padding:0;
}

h1, h2, h3 {
    margin:0;
    padding:0;
}

table {
    width:100%;
    border-collapse:collapse;
    font-size:13px;
}

th,
td {
    padding:12px;
}

th {
    background:#000000;
    color:#fff;
}

</style>
</head>

<body>

<div style='padding:30px;'>

    <table width='100%'
        style='border-bottom:4px solid #000000; margin-bottom:20px; padding-bottom:10px;'>

        <tr>

            <td style='width:30%; vertical-align:middle;'>

                <img
                    src='{$logoSrc}'
                    alt='Logo Empresa'
                    style='height:100px; border-radius:6px;'
                >

            </td>

            <td style='width:70%; vertical-align:middle; text-align:right;'>

                <div style='font-size:11px; color:#000000; text-align:right;'>

                    <strong>Fecha de emisión:</strong><br>

                    " . date('d/m/Y') . "

                </div>

            </td>

        </tr>

    </table>

    <div style='display:table; width:100%; margin-bottom:50px;'>

        <div style='display:table-cell; width:50%; vertical-align:top; text-align:left;'>

            <div
                style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000;'
            >

                <h3 style='color:#000000; font-size:14px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;'>
                    Datos del emisor
                </h3>

                <div style='font-size:13px; line-height:1.3;'>

                    <p style='margin:0 0 4px 0;'>
                        <strong>Atalanta</strong>
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Dirección: Villanueva de los Castillejos, Huelva, España
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Tel: +34 614 892 722
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Email: info@viajesatalanta.com
                    </p>

                    <p style='margin:0 0 6px 0;'>
                        Web: www.viajesatalanta.com
                    </p>

                </div>

            </div>

        </div>

        <div style='display:table-cell; width:50%; vertical-align:top; text-align:right;'>

            <div
                style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000; display:inline-block; text-align:left;'
            >

                <h3 style='color:#000000; font-size:14px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;'>
                    Datos del cliente
                </h3>

                <div style='font-size:13px; line-height:1.3;'>

                    <p>
                        <strong>
                            Nombre: " .
            ($this->cliente['nombre'] ?? '') .
            "
                        </strong>
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        DNI: " .
            ($this->cliente['dni'] ?? '') .
            "
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Dirección: " .
            ($this->cliente['direccion'] ?? '') .
            "
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Tel: " .
            ($this->cliente['telefono'] ?? '') .
            "
                    </p>

                    <p style='margin:0 0 3px 0;'>
                        Email: " .
            ($this->cliente['email'] ?? '') .
            "
                    </p>

                </div>

            </div>

        </div>

    </div>

    <div
        style='background-color:#f5f5f5; padding:20px; border-radius:10px; margin-bottom:30px; border:1px solid rgba(138,119,90,0.2);'
    >

        <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>
            Detalles de la experiencia
        </h3>

        <table>

            <tr>

                <td style='width:50%; padding:5px 10px; vertical-align:top;'>

                    <strong>Experiencia:</strong><br>

                    <span style='font-size:12px;'>
                        <strong>{$paqueteNombre}</strong>
                    </span>

                    <br><br>

                    <strong>Fecha de reserva:</strong><br>

                    {$fechaReservaFormatted}

                    <br><br>

                    <strong>Fecha de ida:</strong><br>

                    {$fechaInicioFormatted}

                </td>

                <td style='width:50%; padding:5px 10px; vertical-align:top;'>

                    <strong>Fecha de vuelta:</strong><br>

                    {$fechaFinFormatted}

                    <br><br>

                    <strong>Número de viajeros:</strong><br>

                    {$plazas}
                    " . ($plazas == 1 ? ' persona' : ' personas') . "

                </td>

            </tr>

        </table>

    </div>";

        /*
        |--------------------------------------------------------------------------
        | NOTAS EN PDF
        |--------------------------------------------------------------------------
        */

        if (!empty(trim($this->notas))) {

            $notasPdf = nl2br(
                htmlspecialchars(
                    $this->notas,
                    ENT_QUOTES,
                    'UTF-8'
                )
            );

            $htmlPdf .= "
    <h5 style='color:#000000; font-size:13px; font-weight:bold; margin-bottom:15px;'>
        Notas:
        {$notasPdf}
    </h5>";
        }

        /*
        |--------------------------------------------------------------------------
        | SERVICIOS INCLUIDOS EN PDF
        | (la tabla de viajeros se ha eliminado de la factura)
        |--------------------------------------------------------------------------
        */

        $htmlPdf .= "

    <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>
        Servicios incluidos
    </h3>

    <div style='margin-bottom:30px;'>

        <table>

            <thead>

                <tr style='background-color:#000000; color:#ffffff;'>

                    <th style='padding:12px; text-align:left;'>
                        Descripción
                    </th>

                    <th style='padding:12px; text-align:right;'>
                        Precio
                    </th>

                </tr>

            </thead>

            <tbody>";

        if (!empty($this->serviciosIncluidos)) {

            foreach (
                $this->serviciosIncluidos
                as $index => $servicio
            ) {

                $bg =
                    $index % 2 === 0
                    ? '#ffffff'
                    : '#f5f5f5';

                if (is_object($servicio)) {
                    $servicio = (array) $servicio;
                }

                if (is_string($servicio)) {

                    $decoded =
                        json_decode(
                            $servicio,
                            true
                        );

                    $desc =
                        is_array($decoded)
                        ? ($decoded['descripcion'] ?? $servicio)
                        : $servicio;

                    $precio =
                        is_array($decoded)
                        ? ($decoded['precio'] ?? 0)
                        : 0;

                } elseif (is_array($servicio)) {

                    $desc =
                        $servicio['descripcion']
                        ?? '';

                    $precio =
                        $servicio['precio']
                        ?? 0;

                } else {

                    $desc = '';
                    $precio = 0;
                }

                $htmlPdf .= "
                <tr style='background-color:{$bg};'>

                    <td style='padding:15px 12px; border-bottom:1px solid rgba(0,0,0,0.15);'>
                        {$desc}
                    </td>

                    <td style='padding:15px 12px; text-align:right; border-bottom:1px solid rgba(0,0,0,0.15);'>
                        " .
                    number_format(
                        (float) $precio,
                        2,
                        ',',
                        '.'
                    ) .
                    " €
                    </td>

                </tr>";
            }

        } else {

            $htmlPdf .= "
                <tr>

                    <td
                        colspan='2'
                        style='padding:15px 12px; text-align:center; color:#888;'
                    >
                        No hay servicios adicionales incluidos.
                    </td>

                </tr>";
        }

        $htmlPdf .= "
            </tbody>

        </table>

    </div>

    <h5 style='color:#000000; font-size:13px; font-weight:bold; margin-bottom:15px;'>
        Gastos de gestión incluidos.
    </h5>

    <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>
        Experiencia
    </h3>

    <div style='margin-bottom:30px;'>

        <table>

            <thead>

                <tr style='background-color:#000000; color:#ffffff;'>

                    <th style='padding:12px; text-align:left;'>
                        Destino y fecha
                    </th>

                    <th style='padding:12px; text-align:center;'>
                        Nº de viajeros
                    </th>

                    <th style='padding:12px; text-align:right;'>
                        " .
            (
                $tipoPago === 'parcial'
                ? 'Importe Total'
                : 'Importe'
            ) .
            "
                    </th>

                </tr>

            </thead>

            <tbody>

                <tr style='background-color:#f5f5f5;'>

                    <td style='padding:15px 12px; border-bottom:1px solid rgba(0,0,0,0.15);'>

                        <strong>{$paqueteNombre}</strong><br>";

        $htmlPdf .= "
                        <span style='font-size:11px; color:#000000;'>
                            Del {$fechaInicio} al {$fechaFin}
                        </span>";

        $htmlPdf .= "

                    </td>

                    <td style='padding:15px 12px; text-align:center; border-bottom:1px solid rgba(0,0,0,0.15);'>

                        {$plazas}
                        " .
            (
                $plazas == 1
                ? ' persona'
                : ' personas'
            ) .
            "

                    </td>

                    <td style='padding:15px 12px; text-align:right; border-bottom:1px solid rgba(0,0,0,0.15);'>

                        <strong>
                            {$subtotal} €
                        </strong>

                    </td>

                </tr>

            </tbody>

        </table>

    </div>

    <div style='width:100%; margin-top:20px;'>

        <div style='width:300px; float:right;'>

            <div
                style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000;'
            >

                <div style='display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;'>

                    <span>Subtotal:</span>

                    <span>
                        {$baseImponibleFormatted} €
                    </span>

                </div>

                <div style='display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px; padding-bottom:15px; border-bottom:2px solid rgba(0,0,0,0.3);'>

                    <span>IVA (21%):</span>

                    <span>
                        {$ivaFormatted} €
                    </span>

                </div>

                <div style='display:flex; justify-content:space-between; font-size:15px; font-weight:bold;'>

                    <span>TOTAL:</span>

                    <span>
                        {$totalPrecioFormatted} €
                    </span>

                </div>

            </div>

        </div>

        <div style='clear:both;'></div>

    </div>

    <div
        style='margin-top:40px; padding-top:20px; border-top:2px solid #000000; font-size:11px; color:#000000; text-align:center;'
    >

        <p style='margin:0 0 5px 0;'>
            <strong>
                Gracias por confiar en Atalanta
            </strong>
        </p>

        <p style='margin:0; opacity:0.8;'>
            Esta factura ha sido generada electrónicamente
            y es válida sin firma ni sello.
        </p>

        <p style='margin:5px 0 0 0; opacity:0.8;'>
            Para cualquier consulta, contacte con nosotros
            en info@viajesatalanta.com o llame al +34 614 892 722
        </p>

    </div>

</div>

</body>
</html>";

        /*
        |--------------------------------------------------------------------------
        | GENERAR PDF
        |--------------------------------------------------------------------------
        */

        $pdf = Pdf::loadHTML($htmlPdf)
            ->setPaper('A4');

        /*
        |--------------------------------------------------------------------------
        | EMAIL + PDF
        |--------------------------------------------------------------------------
        */

        $mail = $this
            ->subject('Confirmación de tu reserva')
            ->html($htmlEmail)
            ->attachData(
                $pdf->output(),
                'factura_reserva.pdf',
                [
                    'mime' => 'application/pdf',
                ]
            );

        /*
        |--------------------------------------------------------------------------
        | VOUCHERS
        |--------------------------------------------------------------------------
        */

        foreach ($this->vouchers as $voucher) {

            if (
                !empty($voucher['path'])
                && file_exists($voucher['path'])
            ) {

                $mail->attach(
                    $voucher['path'],
                    [
                        'as' =>
                        $voucher['name']
                            ?? basename($voucher['path']),

                        'mime' =>
                        $voucher['mime']
                            ?? 'application/pdf',
                    ]
                );
            }
        }

        return $mail;
    }
}