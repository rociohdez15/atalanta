<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PaqueteTuristico;

class GaleriaPaquete extends Model
{
    use HasFactory;

    protected $fillable = [
        'paquete_id',
        'ruta_imagen',
        'descripcion_imagen',
        'orden',
    ];

    public function paquete()
    {
        return $this->belongsTo(PaqueteTuristico::class);
    }
}
