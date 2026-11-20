<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\IncluyePersonalizados;

class Reserva extends Model
{
    use HasFactory;

    protected $table = 'reservas';

    protected $fillable = [
        'cliente_id',
        'paquete_id',
        'num_personas',
        'fecha_inicio',
        'fecha_fin',
        'fecha_pago',
        'metodo_pago',
        'descuento',
        'estado',
        'total_precio',
        'fecha_reserva',
        'num_cuotas',
        'importe_cuotas',
        'stripe_session_id',
        'destino',
        'vouchers_hotel',
        'acepta_condiciones_black_friday',
        'condiciones_black_friday_aceptadas_at',
        'notas'
    ];

    protected $casts = [
        'fecha_pago' => 'date',
        'fecha_reserva' => 'date',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'vouchers_hotel' => 'array',
        'acepta_condiciones_black_friday' => 'boolean',
        'condiciones_black_friday_aceptadas_at' => 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }


    public function paquete()
    {
        return $this->belongsTo(PaqueteTuristico::class, 'paquete_id');
    }

    public function participantes()
    {
        return $this->hasMany(Participante::class, 'reserva_id'); // asumiendo que la FK es reserva_id
    }

    public function factura()
    {
        return $this->hasOne(Factura::class, 'reserva_id');
    }

    public function cliente2()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function resena()
    {
        return $this->hasOne(Resena::class);
    }

    public function resena2()
    {
        return $this->hasOne(Resena::class, 'reserva_id', 'id');
        // 1️⃣ resenas.reserva_id -> reservas.id
    }

    public function cuotas()
    {
        return $this->hasMany(Cuota::class);
    }

    public function incluye_personalizados()
    {
        return $this->hasMany(IncluyePersonalizados::class, 'reserva_id');
    }



    // 💥 Hook para borrar participantes al eliminar la reserva
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($reserva) {
            // Elimina participantes asociados antes de eliminar la reserva
            $reserva->participantes()->delete();
        });
    }
}
