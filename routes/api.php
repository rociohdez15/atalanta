<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Topbar\MensajesController;
use App\Http\Controllers\Topbar\NotificacionesController;
use App\Http\Controllers\Eventos\EventosController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Administradores\AdministradoresController;
use App\Http\Controllers\Galeria\GaleriaController;
use App\Http\Controllers\Paquetes\PaqueteTuristicoController;
use App\Http\Controllers\Blog\BlogController;
use App\Http\Controllers\Pago\PagoController;
use App\Http\Controllers\Usuarios\DashboardUserController;
use App\Http\Controllers\Reservas\ReservasController;
use App\Http\Controllers\Facturas\FacturasController;
use App\Http\Controllers\Colaboraciones\ColaboracionesController;
use App\Http\Controllers\Resenas\ResenaController;
use App\Http\Controllers\Cuotas\CuotasController;
use App\Http\Controllers\Clientes\ClientesController;
use App\Http\Controllers\Publicidad\PublicidadController;
use App\Http\Controllers\Descuentos\DescuentosController;
use App\Http\Controllers\Proveedores\ProveedoresController;
use App\Http\Controllers\Hoteles\HotelesController;
use App\Http\Controllers\Campanas\CampanaController;
use App\Models\Cliente;
use Illuminate\Http\Request;


//Auth
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/register-cliente', [AuthController::class, 'registerCliente']);
Route::post('/auth/olvidaste', [AuthController::class, 'olvidaste']);
Route::get('/auth/yo', [AuthController::class, 'me'])->middleware('auth.jwt');
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth.jwt');
Route::post('/auth/refresh', [AuthController::class, 'refresh'])->middleware('auth.jwt');



//Dashboard panel de administración
Route::prefix('admin')->middleware('admin')->group(function () {
    Route::get('/total-proveedores', [DashboardController::class, 'getTotalProveedores']);
    Route::get('/total-ingresos', [DashboardController::class, 'getTotalIngresos']);
    Route::get('/total-reservas', [DashboardController::class, 'getTotalReservas']);
    Route::get('/total-usuarios', [DashboardController::class, 'getTotalUsuarios']);
    Route::get('/ingresos-semana-actual', [DashboardController::class, 'obtenerIngresosSemanaActual']);
    Route::get('/ingresos-semana-anterior', [DashboardController::class, 'obtenerIngresosSemanaAnterior']);
    Route::get('/ventas-semana-actual', [DashboardController::class, 'obtenerVentasSemanaActual']);
    Route::get('/ingresos-y-ventas-semana', [DashboardController::class, 'obtenerIngresosYReservasSemana']);
    Route::get('/ventas-anuales', [DashboardController::class, 'obtenerVentasAnuales']);
    Route::get('/ingresos-primer-trimestre', fn() => app(DashboardController::class)->ingresosTrimestre(1));
    Route::get('/ingresos-segundo-trimestre', fn() => app(DashboardController::class)->ingresosTrimestre(2));
    Route::get('/ingresos-tercer-trimestre', fn() => app(DashboardController::class)->ingresosTrimestre(3));
    Route::get('/obtener-proyectos', [DashboardController::class, 'obtenerProyectos']);
    Route::get('/obtener-form-contactos', [DashboardController::class, 'obtenerFormContacto']);
    Route::get('/obtener-notificaciones', [DashboardController::class, 'obtenerNotificaciones']);
});

// Administración
Route::prefix('rol-admin')->middleware('admin')->group(function () {
    Route::get('/obtener-admins', [AdministradoresController::class, 'obtenerAdmins']);
    Route::get('/buscar', [AdministradoresController::class, 'buscarUsuario']); // ?input=...
    Route::delete('/eliminar/{id}', [AdministradoresController::class, 'eliminarAdmin']);
    Route::put('/editar/{id}', [AdministradoresController::class, 'editarEmail']); // email en body o query param
    Route::get('/existe', [AdministradoresController::class, 'existeAdmin']); // ?email=...
    Route::post('/alta', [AdministradoresController::class, 'altaAdmin']); // email y password en body
});

// Eventos
Route::prefix('eventos')->middleware('admin')->group(function () {
    Route::post('/crear-evento', [EventosController::class, 'crearEvento']);
    Route::get('/obtener-eventos', [EventosController::class, 'obtenerEventos']);
    Route::delete('/eliminar/{id}', [EventosController::class, 'eliminarEvento']);
    Route::put('/editar/{id}', [EventosController::class, 'editarEvento']);
    Route::get('/buscar', [EventosController::class, 'buscarEvento']);
});

// Mensajes
Route::prefix('mensajes')->group(function () {
    Route::post('/contacto', [MensajesController::class, 'agregar']);
});
Route::prefix('mensajes')->middleware('admin')->group(function () {
    Route::get('/obtener-mensajes', [MensajesController::class, 'obtenerMensajes']);
    Route::put('/leido', [MensajesController::class, 'marcarComoLeido']);
    Route::get('/mensaje/{id}', [MensajesController::class, 'obtenerMensajePorId']);
    Route::get('/buscar', [MensajesController::class, 'buscarMensajes']);
    Route::delete('/eliminar/{id}', [MensajesController::class, 'eliminarMensaje']);
});

Route::prefix('proveedores')->middleware('admin')->group(function () {
    Route::get('/', [ProveedoresController::class, 'index']);
    Route::post('/', [ProveedoresController::class, 'store']);
    Route::get('/{id}', [ProveedoresController::class, 'show']);
    Route::put('/{id}', [ProveedoresController::class, 'update']);
    Route::delete('/{id}', [ProveedoresController::class, 'destroy']);

    Route::get('/buscar', [ProveedoresController::class, 'buscar']);
});

// Notificaciones
Route::prefix('notificaciones')->middleware('admin')->group(function () {
    Route::get('/obtener-notificaciones', [NotificacionesController::class, 'obtenerNotificaciones']);
    Route::put('/notificaciones/leido', [NotificacionesController::class, 'marcarComoLeido']);
    Route::get('/notificacion/{id}', [NotificacionesController::class, 'obtenerNotificacionPorId']);
    Route::get('/notificaciones/buscar', [NotificacionesController::class, 'buscarNotificacion']);
    Route::delete('/eliminar/{id}', [NotificacionesController::class, 'eliminarNotificacion']);
});

Route::prefix('hoteles')->middleware('admin')->group(function () {
    Route::get('/obtener-hoteles',[HotelesController::class, 'obtenerHoteles']);
    Route::get('/buscar',[HotelesController::class, 'buscar']);
    Route::post('/crear',[HotelesController::class, 'crear']);
    Route::delete('/eliminar/{id}',[HotelesController::class, 'eliminar']);
    Route::put('/editar/{id}', [HotelesController::class, 'editar']);
});

// Imagenes
Route::get('/imagenes', [GaleriaController::class, 'index']);
Route::prefix('imagenes')->middleware('admin')->group(function () {
    Route::get('/obtener-galeria', [GaleriaController::class, 'obtenerGaleria']);
    Route::post('/', [GaleriaController::class, 'guardarImagen']);
    Route::put('/editar/{id}', [GaleriaController::class, 'editar']);
    Route::delete('/eliminar/{id}', [GaleriaController::class, 'eliminar']);
    Route::get('/buscar', [GaleriaController::class, 'buscarImagen']);
});


// Paquetes
Route::get('/paquetes/ultimos', [PaqueteTuristicoController::class, 'ultimos']);
Route::get('/paquetes/buscar', [PaqueteTuristicoController::class, 'buscar'])->middleware('admin');
Route::get('/paquetes', [PaqueteTuristicoController::class, 'index']);
Route::get('/paquetes/admin', [PaqueteTuristicoController::class, 'indexAdmin']);
Route::get('/paquetes/{id}', [PaqueteTuristicoController::class, 'show']);
Route::get('/paquetes/{id}/imagenes', [PaqueteTuristicoController::class, 'imagenes']);
Route::get('/paquetes/{id}/puntos', [PaqueteTuristicoController::class, 'getByPaquete']);
Route::get('/paquetes/{id}/itinerarios', [PaqueteTuristicoController::class, 'itinerarios']);
Route::get('/paquetes/{id}/incluye', [PaqueteTuristicoController::class, 'incluye']);
Route::get('/paquetes/{id}/noincluye', [PaqueteTuristicoController::class, 'noIncluye']);
Route::put('/paquetes/editar/{id}', [PaqueteTuristicoController::class, 'editar'])->middleware('admin');
Route::delete('paquetes/eliminar/{id}', [PaqueteTuristicoController::class, 'destroy'])->middleware('admin');
Route::post('/paquetes/agregar', [PaqueteTuristicoController::class, 'agregar'])->middleware('admin');
Route::get('/paquetes/paquete/{id}', [PaqueteTuristicoController::class, 'obtenerPaquetePorId'])->middleware('admin');

// Colaboraciones
Route::get('/colaboraciones', [ColaboracionesController::class, 'index']);
Route::get('/colaboraciones/{id}/galeria', [ColaboracionesController::class, 'galeria']);
Route::get('/colaboraciones/listado', [ColaboracionesController::class, 'listado'])->middleware('admin');
Route::get('/colaboraciones/{id}', [ColaboracionesController::class, 'show']);
Route::delete('/colaboraciones/{colaboracion}/galeria/{imagen}', [ColaboracionesController::class, 'eliminarImagen'])->middleware('admin');
Route::post('/colaboraciones/{colaboracion}/galeria/{imagen}', [ColaboracionesController::class, 'editarImagen'])->middleware('admin');
Route::delete('/colaboraciones/{id}', [ColaboracionesController::class, 'eliminar'])->middleware('admin');
Route::put('/colaboraciones/{id}', [ColaboracionesController::class, 'editar'])->middleware('admin');
Route::post('/colaboraciones/agregar', [ColaboracionesController::class, 'store'])->middleware('admin');

// Servicios Incluidos
Route::post('/paquetes/{id}/incluye', [PaqueteTuristicoController::class, 'agregarIncluye'])->middleware('admin');
Route::put('/incluye/{id}', [PaqueteTuristicoController::class, 'editarIncluye'])->middleware('admin');
Route::delete('/incluye/{id}', [PaqueteTuristicoController::class, 'eliminarIncluye'])->middleware('admin');

// Servicios No Incluidos
Route::post('/paquetes/{id}/no-incluye', [PaqueteTuristicoController::class, 'agregarNoIncluye'])->middleware('admin');
Route::put('/no-incluye/{id}', [PaqueteTuristicoController::class, 'editarNoIncluye'])->middleware('admin');
Route::delete('/no-incluye/{id}', [PaqueteTuristicoController::class, 'eliminarNoIncluye'])->middleware('admin');

// Imágenes Galería
Route::put('/galeria/{id}', [PaqueteTuristicoController::class, 'editarImagenGaleria'])->middleware('admin');

// Puntos del Mapa
Route::post('/paquetes/{id}/mapa', [PaqueteTuristicoController::class, 'agregarPuntoMapa'])->middleware('admin');
Route::delete('/mapa/{id}', [PaqueteTuristicoController::class, 'eliminarPuntoMapa'])->middleware('admin');
Route::put('/mapa/{id}', [PaqueteTuristicoController::class, 'editarPuntoMapa'])->middleware('admin');

// Itinerario
Route::post('/paquetes/{id}/itinerario', [PaqueteTuristicoController::class, 'agregarItinerario'])->middleware('admin');
Route::delete('/itinerario/{id}', [PaqueteTuristicoController::class, 'eliminarItinerario'])->middleware('admin');
Route::put('/itinerario/{id}', [PaqueteTuristicoController::class, 'editarItinerario'])->middleware('admin');
Route::get('/paquetes/{id}/itinerario-pdf', [PaqueteTuristicoController::class, 'descargarItinerario']);

//Blog
Route::get('/blogger', [BlogController::class, 'index']);
Route::delete('/blog/eliminar/{id}', [BlogController::class, 'eliminar'])->middleware('admin');
Route::get('/entrada/{id}', [BlogController::class, 'show']);
Route::post('/like/toggle', [BlogController::class, 'toggle'])->middleware('auth.jwt');
Route::get('/like/check/{entradaId}', [BlogController::class, 'likedByUser'])->middleware('auth.jwt');
Route::get('/blog/obtener-entradas', [BlogController::class, 'obtenerEntradas'])->middleware('admin');
Route::get('/like/count/{entradaId}', [BlogController::class, 'count']);
Route::put('/blog/editar/{id}', [BlogController::class, 'editar'])->middleware('admin');
Route::get('/blog/buscar', [BlogController::class, 'buscar'])->middleware('admin');
Route::post('/blog/agregar', [BlogController::class, 'agregar'])->middleware('admin');

// Descuentos
Route::get('/descuentos', [DescuentosController::class, 'index']);
Route::get('/descuentos/listado', [DescuentosController::class, 'listado'])->middleware('admin');
Route::post('/descuentos/agregar', [DescuentosController::class, 'store'])->middleware('admin');
Route::get('/descuentos/{id}', [DescuentosController::class, 'show'])->middleware('admin');
Route::post('/descuentos/{id}', [DescuentosController::class, 'editar'])->middleware('admin');
Route::delete('/descuentos/{id}', [DescuentosController::class, 'destroy'])->middleware('admin');


// Pago
Route::post('/stripe/webhook', [PagoController::class, 'stripeWebhook']);
Route::get('/pago/verificar-exito', [PagoController::class, 'verificarPagoExito']);

// 🔒 Endpoints de pago con autenticación + throttle
Route::middleware(['auth.jwt'])->group(function () {

    // Crear sesión de pago: máx 10 intentos por minuto por usuario
    Route::post('/pago/stripe', [PagoController::class, 'crearPago'])
        ->middleware('throttle:10,1');

    // Guardar/obtener reserva temporal: máx 20 por minuto
    Route::post('/registro/reserva/temp', [PagoController::class, 'guardarReservaTemp'])
        ->middleware('throttle:20,1');

    Route::get('/obtener/reserva/temp', [PagoController::class, 'obtenerReservaTemp'])
        ->middleware('throttle:20,1');

    // Validar DNI: throttle agresivo para evitar enumeración
    Route::post('/validar-dni-reserva', [PagoController::class, 'validarDniReserva'])
        ->middleware('throttle:10,1');

    // Datos del cliente autenticado
    Route::get('/pago/cliente', [PagoController::class, 'obtenerClienteUsuario'])
        ->middleware('throttle:30,1');
});

// Dashboard Usuario
Route::get('/profile', [DashboardUserController::class, 'show'])->middleware('auth.jwt');
Route::put('/profile/update', [DashboardUserController::class, 'update'])->middleware('auth.jwt');
Route::post('/profile/password', [DashboardUserController::class, 'cambioPassword'])->middleware('auth.jwt');
Route::get('/mis-reservas', [DashboardUserController::class, 'listarReservasUsuario'])->middleware('auth.jwt');
Route::get('/facturas/{reservaId}/descargar', [DashboardUserController::class, 'mostrarNombrePorLog'])->middleware('auth.jwt');

// Reservas
Route::get('/reservas/pendientes', [ReservasController::class, 'pendientes'])->middleware('admin');
Route::post('/reservas/personalizada', [ReservasController::class, 'crearPersonalizada'])->middleware('admin');
Route::get('/clientes-obtener', [ReservasController::class, 'clientesObtener'])->middleware('admin');
Route::get('/paquetes-obtener', [ReservasController::class, 'paquetesObtener'])->middleware('admin');
Route::put('/reservas/{id}', [ReservasController::class, 'update'])->middleware('admin');
Route::delete('/reservas/eliminar/{id}', [ReservasController::class, 'destroy'])->middleware('admin');
Route::get('/reservas/buscar', [ReservasController::class, 'buscar'])->middleware('admin');
Route::get('/reservas/confirmadas', [ReservasController::class, 'confirmadas'])->middleware('admin');
Route::get('/reservas/canceladas', [ReservasController::class, 'canceladas'])->middleware('admin');
Route::get('/participantes/reserva/{id}', [ReservasController::class, 'getPorReserva'])->middleware('admin');
Route::put('/participantes/{id}', [ReservasController::class, 'updateParticipantes'])->middleware('admin');
Route::delete('/participantes/{id}', [ReservasController::class, 'destroyParticipantes'])->middleware('admin');

// Facturas
Route::get('/clientes/obtener-clientes', [FacturasController::class, 'obtenerClientes'])->middleware('admin');
Route::get('/clientes/buscar', [FacturasController::class, 'buscarClientes'])->middleware('admin');
Route::delete('/clientes/eliminar/{id}', [FacturasController::class, 'eliminarCliente'])->middleware('admin');
Route::get('/reservas/cliente/{clienteId}', [FacturasController::class, 'reservasPorCliente'])->middleware('admin');
Route::get('/factura/{reservaId}/{id}', [FacturasController::class, 'generarFacturaAdmin'])->middleware('admin');
Route::get('/facturas', [FacturasController::class, 'index'])->middleware('admin');
Route::get('/facturas/{id}', [FacturasController::class, 'show'])->middleware('admin');
Route::get('/facturas/buscador', [FacturasController::class, 'buscador'])->middleware('admin');
Route::delete('/facturas/eliminar/{id}', [FacturasController::class, 'destroy'])->middleware('admin');
Route::post('/facturas', [FacturasController::class, 'store'])->middleware('admin');
Route::get('/factura/{id}', [FacturasController::class, 'generarFacturaSimple'])->middleware('admin');

// Resenas
Route::prefix('resenas')->group(function () {
    Route::get('/obtener', [ResenaController::class, 'listado'])->middleware('admin');
    Route::get('/mis-resenas', [ResenaController::class, 'misResenas'])->middleware('auth.jwt');
    Route::get('/pendientes', [ResenaController::class, 'pendientes'])->middleware('auth.jwt');
    Route::get('/mostrar', [ResenaController::class, 'index']);      // Listar
    Route::post('/crear-resena', [ResenaController::class, 'store'])->middleware('auth.jwt');
    Route::get('/{id}', [ResenaController::class, 'show']);   // Ver una reseña
    Route::post('/', [ResenaController::class, 'store']);     // Crear
    Route::put('/{id}', [ResenaController::class, 'update']); // Actualizar
    Route::delete('/{id}', [ResenaController::class, 'destroy']); // Borrar
});

Route::get('/reservas/vencidas', [ResenaController::class, 'vencidas'])->middleware('auth.jwt');

// Cuotas
Route::get('/cuotas/obtener', [CuotasController::class, 'obtener'])->middleware('admin');
Route::post('/cuotas/marcar-pagada', [CuotasController::class, 'marcarPagada'])->middleware('admin');

// Publicidad
Route::post('/publicidad/enviar', [PublicidadController::class, 'enviar'])->middleware('admin');

// Clientes
Route::get('/reservas/clientes/{id}', [ClientesController::class, 'reservasPorCliente'])->middleware('admin');

// Reenviar mail confirmación
Route::post('/reservas/{id}/enviar-confirmacion', [ReservasController::class, 'reenviarConfirmacion']);

// Campañas
Route::get('/campanas/activas', [CampanaController::class, 'activas']);
Route::get('/campanas', [CampanaController::class, 'index']);
Route::put('/campanas/{id}/estado', [CampanaController::class, 'cambiarEstado']);
Route::put('/campanas/{id}', [CampanaController::class, 'update']);
Route::delete('/campanas/{id}', [CampanaController::class, 'destroy']);
Route::post('/campanas', [CampanaController::class, 'store']);