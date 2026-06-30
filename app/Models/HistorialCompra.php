<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistorialCompra extends Model
{
    use HasFactory;

    protected $table = 'historial_compras';

    protected $fillable = [
        'cliente_id',
        'paquete_id',
        'fecha_compra',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function paquete()
    {
        return $this->belongsTo(PaqueteTuristico::class, 'paquete_id');
    }
}
