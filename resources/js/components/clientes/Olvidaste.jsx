import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, LogIn, UserPlus, Send } from "lucide-react";
import { motion } from "framer-motion";

const Olvidaste = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // <-- Hook para navegación

    const { pathname } = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const response = await axios.post("/api/auth/olvidaste", {
                email: email,
            });

            Swal.fire({
                icon: "success",
                title: "¡Correo enviado!",
                text: "Se ha enviado una nueva contraseña a tu correo electrónico.",
            });

            setEmail("");
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message ||
                    "No se pudo enviar el correo. Verifica que el email sea correcto.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-vh-100 py-5 pt-0 px-3 d-flex justify-content-center align-items-center"
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
                        color: "#ffffff",
                        fontFamily:
                            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    }}
                >
                    {/* Título */}
                    <motion.h4
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-center mb-4 fw-bold"
                        style={{
                            color: "#ffffff",
                            fontSize: "25px",
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        Recuperar contraseña
                    </motion.h4>

                    <motion.p
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-center mb-4"
                        style={{
                            fontSize: "14px",
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        Introduce tu correo para recibir instrucciones de
                        recuperación
                    </motion.p>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="mb-3"
                        >
                            <label
                                htmlFor="email"
                                className="form-label"
                                style={{ color: "#ffffff" }}
                            >
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                className="form-control"
                                style={{
                                    borderColor: "#ffffff",
                                    height: "25px",
                                    backgroundColor: "#ffffff",
                                    color: "#000000",
                                    paddingLeft: "12px",
                                    fontSize: "12px",
                                }}
                            />
                        </motion.div>

                        <br />
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="d-grid gap-2 mb-3"
                        >
                            <button
                                type="submit"
                                className="btn rounded-top-2 d-flex justify-content-center align-items-center"
                                style={{
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
                                    flex: 1,
                                    height: "35px",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "rgba(255, 255, 255, 0.2)";
                                    e.currentTarget.style.color = "#ffffff";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "rgba(255, 255, 255, 0.8)";
                                    e.currentTarget.style.color = "#000000";
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div
                                        className="spinner-border spinner-border-sm text-white"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Cargando...
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <Send
                                            style={{
                                                width: "20px",
                                                height: "20px",
                                            }}
                                            className="me-2"
                                        />
                                        Enviar nueva contraseña
                                    </>
                                )}
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="row"
                        >
                            <div className="col-12 col-md-6 mb-2 mb-md-0">
                                <Link
                                    to="/login"
                                    className="btn w-100 rounded-top-2"
                                    style={{
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.8)",
                                        backdropFilter: "blur(12px)",
                                        WebkitBackdropFilter: "blur(12px)",
                                        color: "#000000",
                                        border: "1px solid rgba(255,255,255,0.5)",
                                        minWidth: "110px",
                                        textAlign: "center",
                                        fontSize: "12px",
                                        transition: "all 0.3s ease",
                                        fontFamily: "Inter, sans-serif",
                                        flex: 1,
                                        height: "35px",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "rgba(255, 255, 255, 0.2)";
                                        e.currentTarget.style.color = "#ffffff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "rgba(255, 255, 255, 0.8)";
                                        e.currentTarget.style.color = "#000000";
                                    }}
                                >
                                    <LogIn
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                        }}
                                        className="me-2"
                                    />
                                    Iniciar sesión
                                </Link>
                            </div>
                            <div className="col-12 col-md-6">
                                <Link
                                    to="/register"
                                    className="btn w-100 rounded-top-2"
                                    style={{
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.8)",
                                        backdropFilter: "blur(12px)",
                                        WebkitBackdropFilter: "blur(12px)",
                                        color: "#000000",
                                        border: "1px solid rgba(255,255,255,0.5)",
                                        minWidth: "110px",
                                        textAlign: "center",
                                        fontSize: "12px",
                                        transition: "all 0.3s ease",
                                        fontFamily: "Inter, sans-serif",
                                        flex: 1,
                                        height: "35px",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "rgba(255, 255, 255, 0.2)";
                                        e.currentTarget.style.color = "#ffffff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "rgba(255, 255, 255, 0.8)";
                                        e.currentTarget.style.color = "#000000";
                                    }}
                                >
                                    <UserPlus
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                        }}
                                        className="me-2"
                                    />
                                    Registrarse
                                </Link>
                            </div>
                        </motion.div>
                    </form>

                    <div
                        className="mt-5 pt-5"
                        style={{
                            borderTop: "1px solid #ffffff",
                        }}
                    >
                        <button
                            type="button" // <-- importante
                            onClick={() => navigate("/login")} // <-- navegar con react-router-dom
                            className="d-flex btn btn-link justify-content-center align-items-center w-100"
                            style={{
                                color: "#ffffff",
                                transition: "color 0.3s",
                                backgroundColor: "transparent",
                                border: "none",
                                padding: 0,
                                textDecoration: "none",
                                fontSize: "10pt",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "#d5d2d2")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "#ffffff")
                            }
                        >
                            <ArrowLeft
                                style={{ width: "16px", height: "16px" }}
                                className="me-2"
                            />
                            Volver al login
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Olvidaste;
