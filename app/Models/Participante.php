<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Participante extends Model
{
    use HasFactory;

    protected $fillable = [
        'reserva_id',
        'nombre',
        'apellidos',
        'email',
        'dni',
        'telefono',
        'direccion',
        'ciudad',
        'provincia',
        'fecha_nacimiento',
        'experiencia',
        'motivacion',
        'info_relevante',
    ];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class);
    }
}
