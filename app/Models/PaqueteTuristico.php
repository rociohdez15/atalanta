<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Itinerario;
use App\Models\LugarVisita;
use App\Models\GaleriaPaquete;
use App\Models\Incluye;
use App\Models\NoIncluye;
use App\Models\MapaPunto;

class PaqueteTuristico extends Model
{
    use HasFactory;

    protected $table = 'paquetes_turisticos';

    protected $fillable = [
        'nombre',
        'lugar',
        'duracion',
        'fecha_inicio',
        'fecha_fin',
        'precio',
        'servicios',
        'plazas',
        'numero_plazas',
        'fecha',
        'tipo_viaje',
        'descripcion',
        'foto',
        'incluye',
        'no_incluye',
        'preguntas_frecuentes',
        'viajerosFijos'
    ];

    public function itinerario()
    {
        return $this->hasMany(Itinerario::class, 'paquete_turistico_id');
    }

    public function lugaresVisita()
    {
        return $this->hasMany(LugarVisita::class);
    }

    public function imagenes()
    {
        return $this->hasMany(GaleriaPaquete::class, 'paquete_id');
    }

    public function serviciosIncluidos()
    {
        return $this->hasMany(Incluye::class, 'paquete_id');
    }

    public function serviciosNoIncluidos()
    {
        return $this->hasMany(NoIncluye::class, 'paquete_id');
    }

    public function puntosMapa()
    {
        return $this->hasMany(MapaPunto::class, 'paquete_id');
    }

    public function incluye()
    {
        return $this->hasMany(Incluye::class, 'paquete_id');
    }

    public function noIncluye()
    {
        return $this->hasMany(NoIncluye::class, 'paquete_id');
    }

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'precio' => 'decimal:2',
    ];

    // 💥 Eliminar todo al borrar un paquete
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($paquete) {
            $paquete->serviciosIncluidos()->delete();
            $paquete->serviciosNoIncluidos()->delete();
            $paquete->imagenes()->delete();
            $paquete->puntosMapa()->delete();
            $paquete->itinerario()->delete();
        });
    }
}
