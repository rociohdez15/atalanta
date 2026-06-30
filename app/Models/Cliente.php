<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $table = 'clientes';

    protected $fillable = [
        'usuario_id',
        'nombre',
        'apellidos',
        'dni',
        'direccion',
        'telefono',
        'fecha_nacimiento',
        'rgpd_aceptado',
        'rgpd_fecha',
        'rgpd_version'
    ];

    // Relación con el modelo User
    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'cliente_id');
    }

    // Eliminar usuario asociado al eliminar cliente
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($cliente) {
            if ($cliente->user) {
                $cliente->user->delete();
            }
        });
    }
}
