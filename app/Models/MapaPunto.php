<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MapaPunto extends Model
{
    use HasFactory;

    protected $table = 'mapa_puntos';

    protected $fillable = [
        'paquete_id',
        'nombre',
        'latitud',
        'longitud',
        'descripcion',
    ];

    public function paquete()
    {
        return $this->belongsTo(PaqueteTuristico::class);
    }
}
