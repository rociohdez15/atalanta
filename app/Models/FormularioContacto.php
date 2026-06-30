<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormularioContacto extends Model
{
    use HasFactory;

    protected $table = 'formulario_contacto';

    protected $fillable = [
        'nombre',
        'email',
        'mensaje',
        'fecha',
        'is_read',
        'rgpd_aceptado',
        'rgpd_fecha',
    ];

    protected $casts = [
        'fecha' => 'date',
        'is_read' => 'boolean',
    ];
}
