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
import Cookies from "./pages/clientes/PaginaCookies";

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
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
