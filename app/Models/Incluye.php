<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incluye extends Model
{
    use HasFactory;

    protected $table = 'incluye';

    protected $fillable = [
        'paquete_id',
        'descripcion',
    ];

    public function paquete()
    {
        return $this->belongsTo(PaqueteTuristico::class);
    }
}
