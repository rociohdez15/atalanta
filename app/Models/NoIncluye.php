<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NoIncluye extends Model
{
    use HasFactory;

    protected $table = 'no_incluye';

    protected $fillable = [
        'paquete_id',
        'descripcion',
    ];

    public function noIncluye()
    {
        return $this->hasMany(NoIncluye::class, 'paquete_turistico_id');
    }
}
