<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LugarVisita extends Model
{
    use HasFactory;

    protected $fillable = ['paquete_turistico_id', 'nombre', 'latitud', 'longitud'];

    public function paquete()
    {
        return $this->belongsTo(PaqueteTuristico::class, 'paquete_turistico_id');
    }
}
