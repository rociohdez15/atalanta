<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncluyePersonalizados extends Model
{
    use HasFactory;

    protected $table = 'incluye_personalizados';

    protected $fillable = [
        'reserva_id',
        'descripcion',
        'precio',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
    ];

    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'reserva_id');
    }
}