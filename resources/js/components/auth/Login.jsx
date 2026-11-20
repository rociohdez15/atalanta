import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { AuthContext } from "../../AuthContext"; // ajusta la ruta si es distinta

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);
    const [loading, setLoading] = useState(false);

    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Nunca volver a una ruta de admin desde el login de cliente
    const rawFrom = location.state?.from?.pathname || "/";
    const from = rawFrom.startsWith("/dashboard-admin") ? "/" : rawFrom;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email, password, remember: rememberMe }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al iniciar sesión");
            }

            if (!data.user) {
                throw new Error("Respuesta inválida del servidor");
            }

            setUser(data.user);
            navigate(from, { replace: true }); // siempre parte cliente
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message,
                confirmButtonText: "Aceptar",
            });
        } finally {
            setLoading(false);
        }
    };

    const buttonStyle = {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "#000000",
        border: "1px solid rgba(255,255,255,0.5)",
        minWidth: "110px",
        textAlign: "center",
        fontSize: "12px",
        transition: "all 0.3s ease",
        fontFamily: "Inter, sans-serif",
    };

    const hoverIn = (e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        e.currentTarget.style.color = "#ffffff";
    };
    const hoverOut = (e) => {
        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
        e.currentTarget.style.color = "#000000";
    };

    const inputStyle = {
        borderColor: "#ffffff",
        height: "25px",
        backgroundColor: "#ffffff",
        fontSize: "12px",
    };

    return (
        <div
            className="min-vh-100 py-5 px-3"
            style={{ backgroundColor: "#ffffff" }}
        >
            <div className="container d-flex justify-content-center align-items-center">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-opacity-75 rounded-4 p-4 shadow-lg"
                    style={{
                        backdropFilter: "blur(5px)",
                        backgroundColor: "#000000",
                        maxWidth: "430px",
                        width: "100%",
                    }}
                >
                    {/* Volver */}
                    <motion.button
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="btn btn-link text-decoration-none mb-3 d-flex align-items-center"
                        style={{
                            color: "#ffffff",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "10pt",
                        }}
                        onClick={() => navigate("/")}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#d5d2d2")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#ffffff")
                        }
                    >
                        <ArrowLeft size={18} className="me-2" />
                        Volver al inicio
                    </motion.button>

                    {/* Título */}
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-center mb-4"
                    >
                        <h2
                            className="fw-bold"
                            style={{
                                color: "#ffffff",
                                fontSize: "25px",
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            Iniciar sesión
                        </h2>
                        <p
                            style={{
                                color: "#ffffff",
                                marginTop: "-10px",
                                fontFamily: "Inter, sans-serif",
                                fontSize: "14px",
                            }}
                        >
                            Bienvenido de nuevo a Atalanta
                        </p>
                    </motion.div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Email */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="mb-3"
                        >
                            <label
                                htmlFor="email"
                                className="form-label"
                                style={{ color: "#ffffff", fontSize: "14px" }}
                            >
                                Correo electrónico
                            </label>
                            <div className="position-relative">
                                <Mail
                                    size={18}
                                    className="position-absolute top-50 start-0 translate-middle-y ms-3"
                                    style={{ color: "#000000" }}
                                />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="form-control ps-5"
                                    placeholder="tu@email.com"
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </motion.div>

                        {/* Contraseña */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="mb-3"
                        >
                            <label
                                htmlFor="password"
                                className="form-label"
                                style={{ color: "#ffffff", fontSize: "14px" }}
                            >
                                Contraseña
                            </label>
                            <div className="position-relative">
                                <Lock
                                    size={18}
                                    className="position-absolute top-50 start-0 translate-middle-y ms-3"
                                    style={{ color: "#000000" }}
                                />
                                <input
                                    id="password"
                                    type={hidePassword ? "password" : "text"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="form-control ps-5 pe-5"
                                    placeholder="Tu contraseña"
                                    required
                                    style={inputStyle}
                                />
                                <span
                                    className="position-absolute top-50 end-0 translate-middle-y me-3"
                                    style={{
                                        cursor: "pointer",
                                        color: "#000000",
                                    }}
                                    onClick={() =>
                                        setHidePassword(!hidePassword)
                                    }
                                >
                                    {hidePassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </span>
                            </div>
                        </motion.div>

                        {/* Recordarme */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="form-check mb-3"
                        >
                            <input
                                type="checkbox"
                                id="remember"
                                className="form-check-input"
                                checked={rememberMe}
                                onChange={(e) =>
                                    setRememberMe(e.target.checked)
                                }
                            />
                            <label
                                htmlFor="remember"
                                className="form-check-label"
                                style={{ color: "#ffffff", fontSize: "14px" }}
                            >
                                Recordarme
                            </label>
                        </motion.div>

                        {/* Botones */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="d-grid gap-2 mb-3"
                        >
                            <button
                                type="submit"
                                className="btn rounded-top-2 d-flex align-items-center justify-content-center"
                                style={buttonStyle}
                                onMouseEnter={hoverIn}
                                onMouseLeave={hoverOut}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div
                                        className="spinner-border spinner-border-sm text-dark"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Cargando...
                                        </span>
                                    </div>
                                ) : (
                                    "Iniciar sesión"
                                )}
                            </button>

                            <Link to="/register" className="w-100">
                                <button
                                    type="button"
                                    className="btn rounded-top-2 w-100"
                                    style={buttonStyle}
                                    onMouseEnter={hoverIn}
                                    onMouseLeave={hoverOut}
                                >
                                    Registrarse
                                </button>
                            </Link>
                        </motion.div>

                        {/* Olvidaste contraseña */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="text-center mb-3"
                        >
                            <Link
                                to="/olvidaste"
                                className="text-decoration-none"
                                style={{ color: "#ffffff", fontSize: "14px" }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = "#d5d2d2")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = "#ffffff")
                                }
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </motion.div>

                        {/* Términos */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="text-center"
                        >
                            <p style={{ fontSize: "12px", color: "#ffffff" }}>
                                Al hacer clic en "Iniciar sesión", aceptas
                                nuestros{" "}
                                <Link
                                    to="/terminos"
                                    className="text-decoration-underline"
                                    style={{
                                        color: "#ffffff",
                                        fontSize: "14px",
                                    }}
                                >
                                    Términos y condiciones
                                </Link>{" "}
                                y{" "}
                                <Link
                                    to="/politica"
                                    className="text-decoration-underline"
                                    style={{
                                        color: "#ffffff",
                                        fontSize: "14px",
                                    }}
                                >
                                    Política de privacidad
                                </Link>
                            </p>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
