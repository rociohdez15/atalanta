<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Proyecto;

class GaleriaProyecto extends Model
{
    protected $table = 'galeria_proyectos';

    protected $fillable = [
        'proyecto_id',
        'ruta_imagen',
        'descripcion_imagen'
    ];

    public function proyecto()
    {
        return $this->belongsTo(Proyecto::class);
    }

    public function colaboracion()
    {
        return $this->belongsTo(Colaboracion::class);
    }
}
