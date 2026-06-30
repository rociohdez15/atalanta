<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cuota extends Model
{
    use HasFactory;

    protected $table = 'cuotas';

    protected $fillable = [
        'reserva_id', 'numero', 'importe', 'pagada', 'fecha_pago'
    ];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class);
    }
}
