<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Colaboracion extends Model
{
    use HasFactory;

    protected $table = 'proyectos';

    protected $fillable = [
        'nombre',
        'web',
        'descripcion',
        'foto',
        'fecha_inicio',
        'fecha_fin',
    ];

    public function galeria()
    {
        return $this->hasMany(
            GaleriaProyecto::class,
            'proyecto_id'
        );
    }
}
