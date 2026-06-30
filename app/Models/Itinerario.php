<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Itinerario extends Model
{
    use HasFactory;

    protected $fillable = ['paquete_turistico_id', 'dia', 'fecha', 'descripcion'];

    public function paquete()
    {
        return $this->belongsTo(PaqueteTuristico::class, 'paquete_id');
    }
}
