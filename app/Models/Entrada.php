<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entrada extends Model
{
    use HasFactory;

    protected $table = 'entradas';

    protected $fillable = [
        'autor_id',
        'titulo',
        'contenido',
        'imagen_destacada',
        'fecha_publicacion',
    ];

    // Relación con el modelo User (autor)
    public function autor()
    {
        return $this->belongsTo(User::class, 'autor_id');
    }

    public function likes()
    {
        return $this->hasMany(LikeEntrada::class);
    }
}
