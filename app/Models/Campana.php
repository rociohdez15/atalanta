<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campana extends Model
{
    use HasFactory;

    protected $table = 'campanas';

    protected $fillable = [
        'nombre',
        'titulo',
        'subtitulo',
        'imagen',
        'boton',
        'link',
        'activo',
        'fecha_inicio',
        'fecha_fin',
        'orden',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    // Scope: campañas activas
    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }

    // Scope: ordenadas para carrusel
    public function scopeOrdenadas($query)
    {
        return $query->orderBy('orden', 'asc');
    }

    // Scope: campañas vigentes por fecha
    public function scopeVigentes($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('fecha_inicio')
              ->orWhere('fecha_inicio', '<=', now());
        })->where(function ($q) {
            $q->whereNull('fecha_fin')
              ->orWhere('fecha_fin', '>=', now());
        });
    }

    // Accessor opcional: saber si está activa por fecha
    public function getEstaVigenteAttribute()
    {
        $now = now();

        return (
            ($this->fecha_inicio === null || $this->fecha_inicio <= $now) &&
            ($this->fecha_fin === null || $this->fecha_fin >= $now)
        );
    }
}