<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * NOTA: si tu modelo actual tiene más cosas (relaciones, casts, etc.),
 * conserva lo tuyo y añade solo lo marcado como NUEVO.
 */
class PrecioPaquete extends Model
{
    protected $table = 'precios_paquetes';

    protected $fillable = [
        'paquete_id',
        'tipo_habitacion',
        'capacidad',
        'precio',
        'habitaciones_totales',      // NUEVO
        'habitaciones_disponibles',  // NUEVO
    ];

    public function paquete()
    {
        return $this->belongsTo(PaqueteTuristico::class, 'paquete_id');
    }

    /**
     * NUEVO: descuenta 1 habitación de forma atómica.
     * Devuelve false si ya no queda ninguna.
     */
    public function reservarHabitacion(): bool
    {
        if ($this->habitaciones_disponibles === null) {
            return true; // sin límite
        }

        return static::where('id', $this->getKey())
            ->where('habitaciones_disponibles', '>', 0)
            ->decrement('habitaciones_disponibles') > 0;
    }

    /**
     * NUEVO: devuelve 1 habitación (cancelación / reserva caducada).
     */
    public function liberarHabitacion(): void
    {
        if ($this->habitaciones_disponibles === null) {
            return;
        }

        static::where('id', $this->getKey())
            ->whereColumn('habitaciones_disponibles', '<', 'habitaciones_totales')
            ->increment('habitaciones_disponibles');
    }
}