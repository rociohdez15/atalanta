<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LikeEntrada extends Model
{
    use HasFactory;

    protected $table = 'likes_entrada';

    protected $fillable = [
        'usuario_id',
        'entrada_id',
        'fecha',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function entrada()
    {
        return $this->belongsTo(Entrada::class, 'entrada_id');
    }
}
