<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Factura extends Model
{
    use HasFactory;

    protected $table = 'facturas';

    protected $fillable = [
        'cliente_id',
        'reserva_id',
        'nombre_cliente',
        'apellidos_cliente',
        'email_cliente',
        'fecha_compra',
        'metodo_pago',
        'precio_total',
        'iva',
        'telefono_empresa',
        'email_empresa',
        'detalles',
    ];

    protected $casts = [
        'fecha_compra' => 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function reserva()
    {
        return $this->belongsTo(Reserva::class);
    }
    
}
