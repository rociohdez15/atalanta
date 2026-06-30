<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resena extends Model
{
    use HasFactory;

    protected $table = 'resenas';

    protected $fillable = [
        'cliente_id',
        'reserva_id',
        'paquete_id',
        'num_estrellas',
        'fecha',
        'foto_cliente',
        'texto',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function paquete()
    {
        return $this->belongsTo(PaqueteTuristico::class);
    }
}
