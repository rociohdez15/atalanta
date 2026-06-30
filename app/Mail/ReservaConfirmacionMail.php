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
    public $importeAlojamiento = 0;
    public $impuestoMunicipal = 0;


    public function __construct(
        $cliente,
        $fechaReservaFormatted,
        $fechaInicioFormatted,
        $fechaFinFormatted,
        $precioUnitario,
        $subtotal,
        $name,
        $tipoPago,
        $numCuotas,
        $importeCuotas,
        $plazas,
        $totalPrecio,
        $destino,
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
        $importeAlojamiento = 0,
        $impuestoMunicipal = 0
    ) {
        $this->fechaReservaFormatted = $fechaReservaFormatted;
        $this->fechaInicioFormatted  = $fechaInicioFormatted;
        $this->fechaFinFormatted     = $fechaFinFormatted;
        $this->cliente               = is_object($cliente) ? $cliente->toArray() : $cliente;
        $this->precioUnitario        = $precioUnitario;
        $this->subtotal              = $subtotal;
        $this->name                  = $name;
        $this->tipoPago              = $tipoPago;
        $this->numCuotas             = $numCuotas;
        $this->importeCuotas         = $importeCuotas;
        $this->plazas                = $plazas;
        $this->totalPrecio           = $totalPrecio;
        $this->linkPagoCuotas        = $linkPagoCuotas;
        $this->reserva               = $reserva;
        $this->paqueteNombre         = $paqueteNombre;
        $this->reservaId             = $reservaId;
        $this->clienteNombreCompleto = $clienteNombreCompleto;
        $this->fechaInicio           = $fechaInicio;
        $this->fechaFin              = $fechaFin;
        $this->destino               = $destino;
        // Normalizar vouchers
        if (is_string($vouchers)) {
            $decoded = json_decode($vouchers, true);
            $vouchers = $decoded ?: [$vouchers];
        }

        if (!is_array($vouchers)) {
            $vouchers = [$vouchers];
        }

        $this->vouchers = array_map(function ($v) {
            if (is_object($v)) return (array) $v;
            if (is_array($v)) return $v;

            // Si es un string, lo tratamos como un archivo simple
            return [
                'path' => $v,
                'name' => basename($v),
                'mime' => 'application/pdf'
            ];
        }, $vouchers);

        $this->importeAlojamiento = $importeAlojamiento;
        $this->impuestoMunicipal  = $impuestoMunicipal;

        // Normalizar participantes a arrays
        $this->participantes = array_map(
            fn($p) => is_object($p) ? (array) $p : $p,
            $participantes ?? []
        );

        // Normalizar servicios incluidos a arrays
        $this->serviciosIncluidos = array_map(
            fn($s) => is_object($s) ? (array) $s : $s,
            $serviciosIncluidos ?? []
        );

        // Normalizar servicios no incluidos a arrays
        $this->serviciosNoIncluidos = array_map(
            fn($s) => is_object($s) ? (array) $s : $s,
            $serviciosNoIncluidos ?? []
        );

        // Normalizar descuentos a arrays
        $this->descuentos = array_map(
            fn($d) => is_object($d) ? (array) $d : $d,
            $descuentos ?? []
        );

        // Filtrar y normalizar itinerario
        $this->itinerario = array_values(array_filter(
            $itinerario ?? [],
            function ($item) {
                $item = is_object($item) ? (array) $item : $item;
                return isset($item['reserva_id'])
                    ? $item['reserva_id'] == $this->reserva->id
                    : true;
            }
        ));

        // Normalizar todos los items del itinerario a arrays
        $this->itinerario = array_map(
            fn($item) => is_object($item) ? (array) $item : $item,
            $this->itinerario
        );

        $this->esPersonalizado = isset($this->reserva->paquete_id)
            && $this->reserva->paquete_id == 0;
    }

    public function build()
    {
        $tipoPago             = strtolower($this->tipoPago);
        $importeCuotas        = number_format((float) $this->importeCuotas, 2, ',', '.');
        $totalPrecioFormatted = number_format((float) $this->totalPrecio, 2, ',', '.');
        $plazas               = $this->plazas;
        $numCuotas            = $this->numCuotas;

        $totalPrecioFloat       = (float) $this->totalPrecio;
        $baseImponible          = $totalPrecioFloat / 1.21;
        $iva                    = $totalPrecioFloat - $baseImponible;
        $baseImponibleFormatted = number_format($baseImponible, 2, ',', '.');
        $ivaFormatted           = number_format($iva, 2, ',', '.');

        $paqueteNombre = $this->esPersonalizado
            ? ($this->reserva->destino ?? 'Destino personalizado')
            : $this->paqueteNombre;

        $fechaReserva = ($this->reserva && isset($this->reserva->fecha_reserva))
            ? $this->reserva->fecha_reserva
            : date('Y-m-d');

        $fechaReservaFormatted = Carbon::parse($fechaReserva)->format('d/m/Y');

        $reservaObj   = is_object($this->reserva) ? $this->reserva : null;
        $extraerFecha = function ($valor) {
            if (empty($valor)) return null;
            if (is_array($valor)) {
                $valor = $valor['date'] ?? $valor[0] ?? null;
            }
            if (empty($valor) || !is_string($valor)) return null;
            return $valor;
        };

        $rawInicio = ($reservaObj && !empty($reservaObj->fecha_inicio))
            ? $reservaObj->fecha_inicio
            : $extraerFecha($this->fechaInicio);

        $rawFin = ($reservaObj && !empty($reservaObj->fecha_fin))
            ? $reservaObj->fecha_fin
            : $extraerFecha($this->fechaFin);

        $fechaInicio          = $rawInicio ? Carbon::parse($rawInicio)->format('d-m-Y') : null;
        $fechaInicioFormatted = $rawInicio ? Carbon::parse($rawInicio)->format('d/m/Y') : 'No disponible';
        $fechaFin             = $rawFin    ? Carbon::parse($rawFin)->format('d-m-Y')    : null;
        $fechaFinFormatted    = $rawFin    ? Carbon::parse($rawFin)->format('d/m/Y')    : 'No disponible';

        $reservaId             = $this->reservaId;
        $clienteNombreCompleto = $this->clienteNombreCompleto;
        $precioUnitario        = $this->precioUnitario;
        $subtotal              = $this->subtotal;

        // =====================================================================
        // EMAIL HTML
        // =====================================================================
        $htmlEmail = "
        <html>
        <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;'>
        <div style='max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 10px; color: #333;'>

            <h1 style='color: #35372e; text-align: center; margin-bottom: 10px;'>
                ¡{$paqueteNombre} TE ESPERA!
            </h1>
            <p style='font-size: 16px; text-align:center; color:#666;'>
                Tu reserva con <strong>Atalanta</strong> ha sido confirmada.
            </p>
            <hr style='border:0; border-top:1px solid #ddd; margin:25px 0;'>
            <p style='font-size:16px;'>Hola <strong>{$clienteNombreCompleto}</strong>,</p>
            <p style='font-size:16px; line-height:1.6;'>
                ¡Gracias por reservar con <strong>Atalanta</strong>!<br>
                Nos alegra acompañarte en esta nueva aventura. Aquí tienes todos los detalles de tu experiencia:
            </p>

            <h3 style='margin-top:25px;'>📌 Detalles de tu reserva</h3>
            <ul style='font-size: 16px; list-style: none; padding: 0; line-height:1.8;'>
                <li>• <strong>Destino:</strong> {$paqueteNombre}</li>";

        if ($fechaInicio) {
            $htmlEmail .= "<li>• <strong>Fecha de salida:</strong> {$fechaInicio}</li>";
        }
        if ($fechaFin) {
            $htmlEmail .= "<li>• <strong>Fecha de regreso:</strong> {$fechaFin}</li>";
        }

        $htmlEmail .= "
                <li>• <strong>Número de viajeros:</strong> {$plazas}</li>
                <li>• <strong>ID Reserva:</strong> {$reservaId}</li>
            </ul>";

        if (!empty($this->serviciosIncluidos)) {
            $htmlEmail .= "
            <h3 style='margin-top:25px;'>✨ Servicios incluidos</h3>
            <ul style='font-size: 16px; padding-left: 15px; line-height:1.8;'>";

            foreach ($this->serviciosIncluidos as $s) {
                $s = is_object($s) ? (array) $s : $s;

                if (is_array($s)) {
                    $desc   = $s['descripcion'] ?? '';
                    $precio = isset($s['precio']) && $s['precio'] > 0
                        ? ' — ' . number_format((float)$s['precio'], 2, ',', '.') . ' €'
                        : '';
                    $htmlEmail .= "<li> {$desc}{$precio}</li>";
                } else {
                    $decoded = json_decode($s, true);
                    if (is_array($decoded)) {
                        $desc   = $decoded['descripcion'] ?? '';
                        $precio = isset($decoded['precio']) && $decoded['precio'] > 0
                            ? ' — ' . number_format((float)$decoded['precio'], 2, ',', '.') . ' €'
                            : '';
                        $htmlEmail .= "<li> {$desc}{$precio}</li>";
                    } else {
                        $htmlEmail .= "<li> {$s}</li>";
                    }
                }
            }
            $htmlEmail .= "</ul>";
        }

        if (!$this->esPersonalizado && !empty($this->serviciosNoIncluidos)) {
            $htmlEmail .= "
            <h3 style='margin-top:25px;'>ℹ️ Servicios no incluidos</h3>
            <ul style='font-size: 16px; padding-left: 15px; line-height:1.8;'>";
            foreach ($this->serviciosNoIncluidos as $s) {
                $s    = is_object($s) ? (array) $s : $s;
                $desc = is_array($s) ? ($s['descripcion'] ?? '') : $s;
                $htmlEmail .= "<li> {$desc}</li>";
            }
            $htmlEmail .= "</ul>";
        }

        if (!empty($this->itinerario)) {
            $htmlEmail .= "
            <h3 style='margin-top:25px;'>🗺️ Itinerario del viaje</h3>
            <div style='font-size:16px; line-height:1.8;'>";

            foreach ($this->itinerario as $item) {
                $item        = is_object($item) ? (array) $item : $item;
                $dia         = $item['dia']         ?? '';
                $fecha       = $item['fecha']        ?? '';
                $descripcion = $item['descripcion']  ?? '';

                $htmlEmail .= "
                <div style='margin-bottom:15px; padding:15px; background:#f8f8f8; border-radius:8px;'>
                    <strong>Día {$dia}</strong><br>";
                if (!empty($fecha)) {
                    $htmlEmail .= "<span>📅 {$fecha}</span><br>";
                }
                $htmlEmail .= "<span>{$descripcion}</span></div>";
            }
            $htmlEmail .= "</div>";
        }

        if (!empty($this->descuentos)) {
            $htmlEmail .= "
            <h3 style='margin-top:25px;'>💸 Completa tu viaje con alguno de nuestros descuentos</h3>
            <ul style='font-size: 16px; padding-left: 15px; line-height:1.8;'>";
            foreach ($this->descuentos as $d) {
                $d = is_object($d) ? (array) $d : $d;
                $htmlEmail .= "<li><strong>{$d['titulo']}</strong>";
                if (!empty($d['codigo']))      $htmlEmail .= " — Código: {$d['codigo']}";
                if (!empty($d['descripcion'])) $htmlEmail .= " — {$d['descripcion']}";
                if (!empty($d['enlace']))      $htmlEmail .= " — <a href='{$d['enlace']}'>Ver</a>";
                $htmlEmail .= "</li>";
            }
            $htmlEmail .= "</ul>";
        }

        $htmlEmail .= "
            <hr style='border:0; border-top:1px solid #ddd; margin:30px 0;'>
            <h3>¿Qué pasa ahora?</h3>
            <p style='font-size:16px; line-height:1.6;'>
                En breve recibirás otro correo con tu documentación de viaje y recomendaciones útiles.<br><br>
                Si necesitas realizar algún cambio o tienes dudas, estamos aquí para ayudarte.
            </p>
            <h3 style='margin-top:25px;'>✉️ Contacto</h3>
            <ul style='font-size: 16px; list-style: none; padding: 0; line-height:1.8;'>
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
                Este mensaje fue generado automáticamente. Por favor, no respondas a este correo.
            </p>
        </div>
        </body>
        </html>";

        // =====================================================================
        // PDF
        // =====================================================================
        $logoPath = public_path('images/logo_factura_negro.png');
        if (file_exists($logoPath)) {
            $logoBase64 = base64_encode(file_get_contents($logoPath));
            $logoSrc    = 'data:image/png;base64,' . $logoBase64;
        } else {
            $logoSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMB/eeFmjAAAAAASUVORK5CYII=';
        }

        $htmlPdf = "
<html>
<head>
<style>
    @page { margin: 10mm 20mm 10mm 10mm; }
    body { font-family: 'DejaVu Sans', Arial, sans-serif; color:#333; margin:0; padding:0; }
    h1, h2, h3 { margin:0; padding:0; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th, td { padding:12px; }
    th { background:#000000; color:#fff; }
</style>
</head>
<body>
<div style='padding:30px;'>

    <table width='100%' style='border-bottom:4px solid #000000; margin-bottom:20px; padding-bottom:10px;'>
        <tr>
            <td style='width:30%; vertical-align:middle;'>
                <img src='{$logoSrc}' alt='Logo Empresa' style='height:100px; border-radius:6px;'>
            </td>
            <td style='width:70%; vertical-align:middle; text-align:right;'>
                <div style='background-color:#000000; color:#fff; padding:5px 15px; border-radius:6px; display:inline-block; margin-bottom:10px;'>
                    <div style='font-size:10px; opacity:0.9;'>FACTURA Nº</div>
                    <div style='font-size:18px; font-weight:bold;'>{$reservaId}</div>
                </div>
                <div style='font-size:11px; color:#000000; text-align:right;'>
                    <strong>Fecha de emisión:</strong><br>" . date('d/m/Y') . "
                </div>
            </td>
        </tr>
    </table>

    <div style='display:table; width:100%; margin-bottom:50px;'>
        <div style='display:table-cell; width:50%; vertical-align:top; text-align:left;'>
            <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000;'>
                <h3 style='color:#000000; font-size:14px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;'>Datos del emisor</h3>
                <div style='font-size:13px; line-height:1.3;'>
                    <p style='margin:0 0 4px 0;'><strong style='color:#000000;'>Atalanta</strong></p>
                    <p style='margin:0 0 3px 0;'>Dirección: Villanueva de los Castillejos, Huelva, España</p>
                    <p style='margin:0 0 3px 0;'>Tel: +34 614 892 722</p>
                    <p style='margin:0 0 3px 0;'>Email: info@viajesatalanta.com</p>
                    <p style='margin:0 0 6px 0;'>Web: www.viajesatalanta.com</p>
                </div>
            </div>
        </div>
        <div style='display:table-cell; width:50%; vertical-align:top; text-align:right;'>
            <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000; display:inline-block; text-align:left;'>
                <h3 style='color:#000000; font-size:14px; font-weight:bold; margin-bottom:10px; text-transform:uppercase; letter-spacing:1px;'>Datos del cliente</h3>
                <div style='font-size:13px; line-height:1.3;'>
                    <p><strong style='color:#000000;'>Nombre: " . ($this->cliente['nombre'] ?? '') . "</strong></p>
                    <p style='margin:0 0 3px 0;'>DNI: "       . ($this->cliente['dni']       ?? '') . "</p>
                    <p style='margin:0 0 3px 0;'>Dirección: " . ($this->cliente['direccion'] ?? '') . "</p>
                    <p style='margin:0 0 3px 0;'>Tel: "        . ($this->cliente['telefono']  ?? '') . "</p>
                    <p style='margin:0 0 3px 0;'>Email: "      . ($this->cliente['email']     ?? '') . "</p>
                </div>
            </div>
        </div>
    </div>

    <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; margin-bottom:30px; border:1px solid rgba(138,119,90,0.2);'>
        <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>Detalles de la experiencia</h3>
        <table style='width:100%; border-collapse:collapse; font-size:13px;'>
            <tr>
                <td style='width:50%; padding:5px 10px; vertical-align:top;'>
                    <strong style='color:#000000'>Experiencia:</strong><br>
                    <span style='font-size:12px;'><strong>{$paqueteNombre}</strong></span><br><br>
                    <strong style='color:#000000'>Fecha de reserva:</strong><br>
                    {$this->fechaReservaFormatted}<br><br>
                    <strong style='color:#000000'>Fecha de entrada:</strong><br>
                    {$this->fechaInicioFormatted}
                </td>
                <td style='width:50%; padding:5px 10px; vertical-align:top;'>
                    <strong style='color:#000000'>Fecha de salida:</strong><br>
                    {$this->fechaFinFormatted}<br><br>
                    <strong style='color:#000000'>Número de viajeros:</strong><br>
                    {$plazas}" . ($plazas == 1 ? ' persona' : ' personas') . "
                </td>
            </tr>
        </table>
    </div>

    <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>Viajeros</h3>
    <div style='margin-bottom:30px;'>
        <table>
            <thead>
                <tr style='background-color:#000000; color:#ffffff;'>
                    <th style='padding:12px; text-align:left;'>Nombre</th>
                    <th style='padding:12px; text-align:left;'>Apellidos</th>
                    <th style='padding:12px; text-align:center;'>DNI</th>
                    <th style='padding:12px; text-align:left;'>Email</th>
                </tr>
            </thead>
            <tbody>";

        foreach ($this->participantes as $p) {
            $p          = is_object($p) ? (array) $p : $p;
            $nombreP    = $p['nombre']    ?? 'Nombre no disponible';
            $apellidosP = $p['apellidos'] ?? '';
            $dni        = $p['dni']       ?? 'N/A';
            $emailP     = $p['email']     ?? 'Email no disponible';

            $htmlPdf .= "
                <tr style='background-color:#f5f5f5;'>
                    <td style='padding:12px; border-bottom:1px solid rgba(0,0,0,0.15);'>{$nombreP}</td>
                    <td style='padding:12px; border-bottom:1px solid rgba(0,0,0,0.15);'>{$apellidosP}</td>
                    <td style='padding:12px; text-align:center; border-bottom:1px solid rgba(0,0,0,0.15);'>{$dni}</td>
                    <td style='padding:12px; border-bottom:1px solid rgba(0,0,0,0.15);'>{$emailP}</td>
                </tr>";
        }

        $htmlPdf .= "
            </tbody>
        </table>
    </div>

    <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>Servicios incluidos</h3>
    <div style='margin-bottom:30px;'>
        <table>
            <thead>
                <tr style='background-color:#000000; color:#ffffff;'>
                    <th style='padding:12px; text-align:left;'>Descripción</th>
                    <th style='padding:12px; text-align:right;'>Precio</th>
                </tr>
            </thead>
            <tbody>";

        if (!empty($this->serviciosIncluidos)) {
            foreach ($this->serviciosIncluidos as $index => $servicio) {
                $bg      = $index % 2 === 0 ? '#ffffff' : '#f5f5f5';
                $servicio = is_object($servicio) ? (array) $servicio : $servicio;

                if (is_string($servicio)) {
                    $decoded = json_decode($servicio, true);
                    $desc    = $decoded['descripcion'] ?? $servicio;
                    $precio  = $decoded['precio'] ?? 0;
                } elseif (is_array($servicio)) {
                    $desc   = $servicio['descripcion'] ?? '';
                    $precio = $servicio['precio'] ?? 0;
                } else {
                    $desc   = '';
                    $precio = 0;
                }

                $htmlPdf .= "
                <tr style='background-color:{$bg};'>
                    <td style='padding:15px 12px; border-bottom:1px solid rgba(0,0,0,0.15);'>{$desc}</td>
                    <td style='padding:15px 12px; text-align:right; border-bottom:1px solid rgba(0,0,0,0.15);'>
                        " . number_format((float)$precio, 2, ',', '.') . " €
                    </td>
                </tr>";
            }
        } else {
            $htmlPdf .= "
                <tr>
                    <td colspan='2' style='padding:15px 12px; text-align:center; color:#888;'>
                        No hay servicios adicionales incluidos.
                    </td>
                </tr>";
        }

        $htmlPdf .= "
            </tbody>
        </table>
    </div>

    <h5 style='color:#000000; font-size:13px; font-weight:bold; margin-bottom:15px;'>Gastos de gestión: 10%</h5>
    <h5 style='color:#000000; font-size:13px; font-weight:bold; margin-bottom:15px;'>
        Importe a pagar en el alojamiento: {$this->importeAlojamiento} €
    </h5>

    <h5 style='color:#000000; font-size:13px; font-weight:bold; margin-bottom:15px;'>
        Impuesto municipal: {$this->impuestoMunicipal} €
    </h5>

    <h3 style='color:#000000; font-size:16px; font-weight:bold; margin-bottom:15px;'>Experiencia</h3>
    <div style='margin-bottom:30px;'>
        <table>
            <thead>
                <tr style='background-color:#000000; color:#ffffff;'>
                    <th style='padding:12px; text-align:left;'>Destino y fecha</th>
                    <th style='padding:12px; text-align:center;'>Nº de viajeros</th>
                    <th style='padding:12px; text-align:right;'>" . ($tipoPago === 'parcial' ? 'Importe Total' : 'Importe') . "</th>
                </tr>
            </thead>
            <tbody>
                <tr style='background-color:#f5f5f5;'>
                    <td style='padding:15px 12px; border-bottom:1px solid rgba(0,0,0,0.15);'>
                        <strong>{$paqueteNombre}</strong><br>";

        if (!$this->esPersonalizado) {
            $htmlPdf .= "<span style='font-size:11px; color:#000000;'>Del {$fechaInicio} al {$fechaFin}</span>";
        }

        $htmlPdf .= "
                    </td>
                    <td style='padding:15px 12px; text-align:center; border-bottom:1px solid rgba(0,0,0,0.15);'>
                        {$plazas}" . ($plazas == 1 ? ' persona' : ' personas') . "
                    </td>
                    <td style='padding:15px 12px; text-align:right; border-bottom:1px solid rgba(0,0,0,0.15);'>
                        <strong>{$subtotal} €</strong>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div style='width:100%; margin-top:20px;'>
        <div style='width:300px; float:right;'>
            <div style='background-color:#f5f5f5; padding:20px; border-radius:10px; border:2px solid #000000;'>
                <div style='display:flex; justify-content:space-between; margin-bottom:10px; font-size:13px;'>
                    <span>Subtotal:</span><span>{$baseImponibleFormatted} €</span>
                </div>
                <div style='display:flex; justify-content:space-between; margin-bottom:15px; font-size:13px; padding-bottom:15px; border-bottom:2px solid rgba(0,0,0,0.3);'>
                    <span>IVA (21%):</span><span>{$ivaFormatted} €</span>
                </div>
                <div style='display:flex; justify-content:space-between; font-size:15px; font-weight:bold; color:#000000;'>
                    <span>TOTAL:</span><span>{$totalPrecioFormatted} €</span>
                </div>
            </div>
        </div>
        <div style='clear:both;'></div>
    </div>

    <div style='margin-top:40px; padding-top:20px; border-top:2px solid #000000; font-size:11px; color:#000000; text-align:center;'>
        <p style='margin:0 0 5px 0;'><strong>Gracias por confiar en Atalanta</strong></p>
        <p style='margin:0; opacity:0.8;'>Esta factura ha sido generada electrónicamente y es válida sin firma ni sello.</p>
        <p style='margin:5px 0 0 0; opacity:0.8;'>Para cualquier consulta, contacte con nosotros en info@viajesatalanta.com o llame al +34 614 892 722</p>
    </div>

</div>
</body>
</html>";

        $pdf = Pdf::loadHTML($htmlPdf)->setPaper('A4');

        $mail = $this->subject('Confirmación de tu reserva')
            ->html($htmlEmail)
            ->attachData($pdf->output(), 'factura_reserva.pdf', [
                'mime' => 'application/pdf',
            ]);

        foreach ($this->vouchers as $voucher) {
            if (!empty($voucher['path']) && file_exists($voucher['path'])) {
                $mail->attach($voucher['path'], [
                    'as'   => $voucher['name'],
                    'mime' => $voucher['mime'],
                ]);
            }
        }

        return $mail;
    }
}
