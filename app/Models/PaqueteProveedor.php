<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class PaqueteProveedor extends Pivot
{
    protected $table = 'paquetes_proveedores';

    protected $fillable = [
        'paquete_id',
        'proveedor_id',
    ];
}