import React from "react";
import "./index.css";
import "./nicepage.css";
import "./index3.css";
import "./nicepage3.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
} from "react-router-dom"; // Usamos Routes en lugar de Switch
import ScrollToTop from "./ScrollToTop";
import NotFound from "./NotFound";
import { AuthProvider } from "./AuthContext";
import Home from "./pages/clientes/Home"; // Asegúrate de ajustar la ruta si es necesario
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Galeria from "./pages/clientes/Galeria";
import Colaboraciones from "./pages/clientes/Colaboraciones";
import Descuentos from "./pages/clientes/PaginaDescuentos";
import Nosotros from "./pages/clientes/Nosotros";
import Experiencia from "./pages/clientes/Experiencia";
import ExperienciaSola from "./pages/clientes/ExperienciaSola";
import Preguntas from "./pages/clientes/PaginaPreguntas";
import Blog from "./pages/clientes/PaginaBlog";
import EntradaSola from "./pages/clientes/EntradaSola";
import Contacto from "./pages/clientes/PaginaContacto";
import Olvidaste from "./pages/clientes/PaginaOlvidaste";
import Terminos from "./pages/clientes/PaginaTerminos";
import Politica from "./pages/clientes/PaginaPolitica";
import AvisoLegal from "./pages/clientes/AvisoLegal";
import Reserva from "./pages/clientes/PaginaReserva";
import TipoPago from "./pages/clientes/PaginaTipoPago";
import PagoExito from "./pages/clientes/PaginaExito";
import Dashboard from "./pages/clientes/PaginaDashboard";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import AdminRoute from "./AdminRoute";
import DashboardAdmin from "./pages/admin/dashboard/DashboardAdmin";
import Clientes from "./pages/admin/clientes/Listado";
import Resenas from "./pages/admin/resenas/Listado";
import Cuotas from "./pages/admin/cuotas/CuotasTodas";
import Publicidad from "./pages/admin/publicidad/Publicidad";
import AdminTodos from "./pages/admin/administradores/AdminTodos";
import AdminAlta from "./pages/admin/administradores/AdminAlta";
import ColaboracionesTodas from "./pages/admin/colaboraciones/ColaboracionesTodas";
import DescuentosTodos from "./pages/admin/descuentos/DescuentosTodos";
import AgregarDescuentos from "./pages/admin/descuentos/Agregar";
import ColaboracionSola from "./pages/admin/colaboraciones/ColaboracionSola";
import ListadoClientes from "./pages/admin/clientes/Listado";
import ListadoProveedores from "./pages/admin/proveedores/Listado";
import ListadoCampanas from "./pages/admin/campanas/Listado";
import AgregarCliente from "./pages/admin/clientes/Agregar";
import ListadoHoteles from "./pages/admin/hoteles/Listado";
import AgregarHoteles from "./pages/admin/hoteles/Agregar";
import AgregarProveedores from "./pages/admin/proveedores/Agregar";
import AgregarCampanas from "./pages/admin/campanas/Agregar";
import AgregarColaboracion from "./pages/admin/colaboraciones/CrearColaboraciones";
import EventosTodos from "./pages/admin/eventos/EventosTodos";
import CrearEventos from "./pages/admin/eventos/CrearEventos";
import Mensajes from "./pages/admin/mensajes/MensajesTodos";
import MensajeSolo from "./pages/admin/mensajes/MensajeSolo";
import Notificaciones from "./pages/admin/notificaciones/NotificacionesTodas";
import NotificacionSola from "./pages/admin/notificaciones/NotificacionSola";
import GaleriaTodos from "./pages/admin/galeria/GaleriaTodos";
import AgregarImagen from "./pages/admin/galeria/AgregarImagen";
import PaquetesTodos from "./pages/admin/paquetes/PaquetesTodos";
import PaquetesArgegar from "./pages/admin/paquetes/AgregarPaquete";
import PaqueteSolo from "./pages/admin/paquetes/PaqueteSolo";
import BlogTodos from "./pages/admin/blog/BlogTodos";
import EntradasArgegar from "./pages/admin/blog/AgregarEntrada";
import Cookies from "./pages/clientes/PaginaCookies";
import ReservasPendientes from "./pages/admin/reservas/PaginaReservasPendientes";
import ReservasConfirmadas from "./pages/admin/reservas/PaginaReservasConfirmadas";
import ReservasCanceladas from "./pages/admin/reservas/PaginaReservasCanceladas";
import ReservaSolaConfirmada from "./pages/admin/reservas/PaginaLeerConfirmada";
import ReservaSolaPendiente from "./pages/admin/reservas/PaginaLeerPendiente";
import ReservaSolaCancelada from "./pages/admin/reservas/PaginaLeerCancelada";
import CrearReserva from "./pages/admin/reservas/PaginaCrear";
import FacturasClientes from "./pages/admin/facturas/PaginaFacturasCliente";
import FacturaClienteSolo from "./pages/admin/facturas/PaginaFacturaClienteSolo";
import FacturasAtalanta from "./pages/admin/facturas/PaginaFacturaAtalanta";

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route
                        path="*"
                        element={
                            <PublicRoute>
                                <NotFound />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <PublicRoute>
                                <Home />
                            </PublicRoute>
                        }
                    />{" "}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/galeria"
                        element={
                            <PublicRoute>
                                <Galeria />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/colaboraciones"
                        element={
                            <PublicRoute>
                                <Colaboraciones />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/descuentos"
                        element={
                            <PublicRoute>
                                <Descuentos />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/experiencias"
                        element={
                            <PublicRoute>
                                <Experiencia />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/experiencia/:id"
                        element={
                            <PublicRoute>
                                <ExperienciaSola />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/nosotros"
                        element={
                            <PublicRoute>
                                <Nosotros />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/faq"
                        element={
                            <PublicRoute>
                                <Preguntas />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/blogger"
                        element={
                            <PublicRoute>
                                <Blog />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/entrada/:id"
                        element={
                            <PublicRoute>
                                <EntradaSola />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/contacto"
                        element={
                            <PublicRoute>
                                <Contacto />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/olvidaste"
                        element={
                            <PublicRoute>
                                <Olvidaste />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/terminos"
                        element={
                            <PublicRoute>
                                <Terminos />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/politica"
                        element={
                            <PublicRoute>
                                <Politica />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/aviso"
                        element={
                            <PublicRoute>
                                <AvisoLegal />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/cookies"
                        element={
                            <PublicRoute>
                                <Cookies />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/pago/exito"
                        element={
                            <PublicRoute>
                                <PagoExito />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/dashboard-admin"
                        element={
                            <AdminRoute>
                                <DashboardAdmin />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/clientes"
                        element={
                            <AdminRoute>
                                <Clientes />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/resenas"
                        element={
                            <AdminRoute>
                                <Resenas />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/cuotas"
                        element={
                            <AdminRoute>
                                <Cuotas />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/publicidad"
                        element={
                            <AdminRoute>
                                <Publicidad />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin-todos"
                        element={
                            <AdminRoute>
                                <AdminTodos />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin-alta"
                        element={
                            <AdminRoute>
                                <AdminAlta />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/listado-colaboraciones"
                        element={
                            <AdminRoute>
                                <ColaboracionesTodas />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/colaboraciones/:id"
                        element={
                            <AdminRoute>
                                <ColaboracionSola />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/listado-descuentos"
                        element={
                            <AdminRoute>
                                <DescuentosTodos />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/listado-clientes"
                        element={
                            <AdminRoute>
                                <ListadoClientes />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/agregar-proveedores"
                        element={
                            <AdminRoute>
                                <AgregarProveedores />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/listado-proveedores"
                        element={
                            <AdminRoute>
                                <ListadoProveedores />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/agregar-campanas"
                        element={
                            <AdminRoute>
                                <AgregarCampanas />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/listado-campanas"
                        element={
                            <AdminRoute>
                                <ListadoCampanas />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/agregar-hoteles"
                        element={
                            <AdminRoute>
                                <AgregarHoteles />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/listado-hoteles"
                        element={
                            <AdminRoute>
                                <ListadoHoteles />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/agregar-descuentos"
                        element={
                            <AdminRoute>
                                <AgregarDescuentos />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/agregar-cliente"
                        element={
                            <AdminRoute>
                                <AgregarCliente />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/agregar-colaboracion"
                        element={
                            <AdminRoute>
                                <AgregarColaboracion />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/eventos-todos"
                        element={
                            <AdminRoute>
                                <EventosTodos />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/crear-eventos"
                        element={
                            <AdminRoute>
                                <CrearEventos />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/mensajes"
                        element={
                            <AdminRoute>
                                <Mensajes />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/mensaje/:id"
                        element={
                            <AdminRoute>
                                <MensajeSolo />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/notificaciones"
                        element={
                            <AdminRoute>
                                <Notificaciones />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/notificacion/:id"
                        element={
                            <AdminRoute>
                                <NotificacionSola />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/galeria-listado"
                        element={
                            <AdminRoute>
                                <GaleriaTodos />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/agregar-imagen"
                        element={
                            <AdminRoute>
                                <AgregarImagen />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/paquetes-listado"
                        element={
                            <AdminRoute>
                                <PaquetesTodos />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/paquetes-agregar"
                        element={
                            <AdminRoute>
                                <PaquetesArgegar />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/paquete/:id"
                        element={
                            <AdminRoute>
                                <PaqueteSolo />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/blog-listado"
                        element={
                            <AdminRoute>
                                <BlogTodos />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/blog-agregar"
                        element={
                            <AdminRoute>
                                <EntradasArgegar />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/reservas/:paqueteId"
                        element={
                            <PrivateRoute>
                                <Reserva />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/seleccionar-pago/:paqueteId"
                        element={
                            <PrivateRoute>
                                <TipoPago />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/reservas-pendientes"
                        element={
                            <AdminRoute>
                                <ReservasPendientes />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/reservas-confirmadas"
                        element={
                            <AdminRoute>
                                <ReservasConfirmadas />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/reservas-canceladas"
                        element={
                            <AdminRoute>
                                <ReservasCanceladas />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/crear-reserva"
                        element={
                            <AdminRoute>
                                <CrearReserva />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/reserva-confirmada/:id"
                        element={
                            <AdminRoute>
                                <ReservaSolaConfirmada />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/reserva-pendiente/:id"
                        element={
                            <AdminRoute>
                                <ReservaSolaPendiente />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/reserva-cancelada/:id"
                        element={
                            <AdminRoute>
                                <ReservaSolaCancelada />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/facturas-clientes"
                        element={
                            <AdminRoute>
                                <FacturasClientes />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/factura-cliente/:id"
                        element={
                            <AdminRoute>
                                <FacturaClienteSolo />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/facturas-atalanta"
                        element={
                            <AdminRoute>
                                <FacturasAtalanta />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
