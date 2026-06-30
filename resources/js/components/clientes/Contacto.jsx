import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
    Phone,
    EnvelopeFill,
    GeoAltFill,
    ClockFill,
} from "react-bootstrap-icons";

const Contacto = () => {
    const { pathname } = useLocation();
    const [loading, setLoading] = useState(false);
    const [rgpdAceptado, setRgpdAceptado] = useState(false);

    const [form, setForm] = useState({
        nombre: "",
        email: "",
        mensaje: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // activar spinner

        try {
            await axios.post("/api/mensajes/contacto", {
                ...form,
                rgpd_aceptado: true,
                rgpd_fecha: new Date().toISOString(),
            });

            Swal.fire({
                icon: "success",
                title: "Mensaje enviado",
                text: "Tu mensaje ha sido enviado correctamente.",
            });

            setForm({ nombre: "", email: "", mensaje: "" });
            setRgpdAceptado(false);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un problema al enviar tu mensaje. Inténtalo de nuevo.",
            });
        } finally {
            setLoading(false); // desactivar spinner
        }
    };
    return (
        <div className="container py-5 pt-0">
            {/* Botón Volver al inicio */}
            <div className="mb-4">
                <button
                    type="button"
                    onClick={() => (window.location.href = "/")}
                    className="btn btn-link d-flex align-items-center mb-4"
                    style={{
                        transition:
                            "color 0.3s ease, background-color 0.3s ease",
                        textDecoration: "none",
                        boxShadow: "none",
                        color: "#000000",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10pt",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#000000";
                        e.currentTarget.style.backgroundColor =
                            "rgba(53, 55, 46, 0.1)";
                        e.currentTarget.style.textDecoration = "none";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#000000";
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.textDecoration = "none";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    <ArrowLeft size={20} className="me-2" />
                    Volver al inicio
                </button>
                <br />
            </div>

            {/* Título y descripción centrados arriba */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-5 mx-auto"
                style={{ maxWidth: "720px" }}
            >
                <h1
                    className="fw-bold"
                    style={{
                        marginTop: "-120px",
                        color: "#000000",
                        fontFamily: '"TT Espina Trial Variable", sans-serif',
                        fontSize: "clamp(2rem, 5vw, 4rem)",
                        transform: "scaleX(1.5)", // 1.0 es normal, >1 estira
                        display: "inline-block",
                    }}
                >
                    Formulario de Contacto
                </h1>
                <p
                    className="lead mx-auto"
                    style={{
                        maxWidth: "720px",
                        fontSize: "14pt",
                        color: "#000000",
                    }}
                >
                    ¿Tienes preguntas sobre nuestras experiencias? ¿Necesitas
                    ayuda planificando tu próxima aventura? Estamos aquí para
                    ayudarte a crear el viaje perfecto.
                </p>
            </motion.div>

            {/* Contenido principal: formulario e info de contacto lado a lado */}
            <div
                className="d-flex justify-content-center align-items-start flex-wrap"
                style={{ gap: "50px" }} // reduce este valor si quieres aún menos separación
            >
                {/* Formulario */}
                <div style={{ flex: "1 1 470px", maxWidth: "470px" }}>
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <div
                            className="card shadow-lg border-0 m-0"
                            style={{
                                backgroundColor: "#000000",
                                backdropFilter: "blur(6px)",
                                borderRadius: "1rem",
                            }}
                        >
                            <div className="card-header text-center pb-0 bg-transparent border-0">
                                <div className="d-flex justify-content-center mb-3">
                                    <div
                                        className="p-3"
                                        style={{
                                            background: "#ffffff",
                                            borderRadius: "50%",
                                            width: "60px",
                                            height: "60px",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <i
                                            className="bi bi-chat-dots-fill"
                                            style={{
                                                color: "#000000",
                                                fontSize: "32px",
                                            }}
                                        ></i>
                                    </div>
                                </div>
                                <h5
                                    className="card-title fw-bold"
                                    style={{
                                        color: "#ffffff",
                                        fontSize: "1.5rem",
                                    }}
                                >
                                    Envíanos un Mensaje
                                </h5>
                                <p
                                    style={{
                                        color: "#ffffff",
                                        fontSize: "1rem",
                                        marginTop: "0rem",
                                    }}
                                >
                                    Responderemos en menos de 24 horas
                                </p>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit} noValidate>
                                    {/* Nombre */}
                                    <div className="mb-4 position-relative">
                                        <label
                                            htmlFor="nombre"
                                            className="form-label"
                                            style={{ color: "#ffffff" }}
                                        >
                                            Nombre *
                                        </label>
                                        <i
                                            className="bi bi-person-fill position-absolute"
                                            style={{
                                                left: "12px",
                                                top: "75%",
                                                transform: "translateY(-50%)",
                                                color: "#877c4f",
                                                pointerEvents: "none",
                                            }}
                                        />
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            placeholder="Tu nombre completo"
                                            value={form.nombre}
                                            onChange={handleChange}
                                            className="form-control ps-5 border"
                                            style={{
                                                borderColor:
                                                    "rgba(135,124,79,0.3)",
                                                backgroundColor: "#ffffff",
                                                height: "25px", // Altura personalizada
                                                fontSize: "12px",
                                            }}
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="mb-4 position-relative">
                                        <label
                                            htmlFor="email"
                                            className="form-label"
                                            style={{ color: "#ffffff" }}
                                        >
                                            Correo Electrónico *
                                        </label>
                                        <i
                                            className="bi bi-envelope-fill position-absolute"
                                            style={{
                                                left: "12px",
                                                top: "75%",
                                                transform: "translateY(-50%)",
                                                color: "#877c4f",
                                                pointerEvents: "none",
                                            }}
                                        />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="tu@email.com"
                                            value={form.email}
                                            onChange={handleChange}
                                            className="form-control ps-5 border"
                                            style={{
                                                borderColor:
                                                    "rgba(135,124,79,0.3)",
                                                backgroundColor: "#ffffff",
                                                height: "25px", // Altura personalizada
                                                fontSize: "12px",
                                            }}
                                            required
                                        />
                                    </div>

                                    {/* Mensaje */}
                                    <div className="mb-4 position-relative">
                                        <label
                                            htmlFor="mensaje"
                                            className="form-label"
                                            style={{ color: "#ffffff" }}
                                        >
                                            Mensaje *
                                        </label>
                                        <i
                                            className="bi bi-chat-left-text-fill position-absolute"
                                            style={{
                                                left: "12px",
                                                top: "35%",
                                                transform: "translateY(-50%)",
                                                color: "#877c4f",
                                                pointerEvents: "none",
                                            }}
                                        />
                                        <textarea
                                            id="mensaje"
                                            name="mensaje"
                                            placeholder="Cuéntanos sobre tu viaje ideal, fechas preferidas, número de viajeros, y cualquier pregunta que tengas..."
                                            value={form.mensaje}
                                            onChange={handleChange}
                                            className="form-control ps-5 pt-2 border"
                                            style={{
                                                minHeight: "120px",
                                                resize: "none",
                                                borderColor:
                                                    "rgba(135,124,79,0.3)",
                                                backgroundColor: "#ffffff",
                                                fontSize: "12px",
                                            }}
                                            required
                                        />
                                    </div>

                                    {/* Checkbox RGPD */}
                                    <div className="mb-3 d-flex align-items-start gap-2">
                                        <input
                                            type="checkbox"
                                            id="rgpd"
                                            checked={rgpdAceptado}
                                            onChange={(e) =>
                                                setRgpdAceptado(
                                                    e.target.checked,
                                                )
                                            }
                                            style={{
                                                marginTop: "3px",
                                                cursor: "pointer",
                                            }}
                                        />
                                        <label
                                            htmlFor="rgpd"
                                            style={{
                                                color: "#ffffff",
                                                fontSize: "12px",
                                            }}
                                        >
                                            <a
                                                href="/politica"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: "#f0e6d3",
                                                    textDecoration: "underline",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                He leído y acepto la Política de
                                                Privacidad
                                            </a>
                                            . Consiento el tratamiento de mis
                                            datos para gestionar mi consulta.
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading || !rgpdAceptado}
                                        className="btn w-100 py-1 text-lg"
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
                                            opacity:
                                                loading || !rgpdAceptado
                                                    ? 0.5
                                                    : 1,
                                            cursor:
                                                loading || !rgpdAceptado
                                                    ? "not-allowed"
                                                    : "pointer",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading && rgpdAceptado) {
                                                e.currentTarget.style.backgroundColor =
                                                    "rgba(255, 255, 255, 0.2)";
                                                e.currentTarget.style.color =
                                                    "#ffffff";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                "rgba(255, 255, 255, 0.8)";
                                            e.currentTarget.style.color =
                                                "#000000";
                                        }}
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
                                                <i
                                                    className="bi bi-send-fill me-2"
                                                    style={{ color: "#000000" }}
                                                ></i>
                                                Enviar Mensaje
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </div>
                {/* Información contacto */}
                <div style={{ flex: "1 1 470px", maxWidth: "470px" }}>
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <div
                            className="card shadow border-0 m-0"
                            style={{
                                backgroundColor: "#000000",
                                fontSize: "0.8rem",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                borderRadius: "1rem",
                            }}
                        >
                            <div
                                className="card-header text-center"
                                style={{
                                    borderBottom: "none",
                                    backgroundColor: "transparent",
                                }}
                            >
                                <h2
                                    className="fw-bold"
                                    style={{
                                        color: "#ffffff",
                                        fontSize: "1.25rem",
                                        lineHeight: 1,
                                    }}
                                >
                                    Información de Contacto
                                </h2>
                            </div>
                            <div className="card-body px-3 py-2">
                                {/* Teléfono */}
                                <div className="d-flex align-items-start mb-3">
                                    <div
                                        style={{
                                            backgroundColor:
                                                "rgba(160, 186, 193, 0.1)",
                                            padding: "8px",
                                            borderRadius: "50%",
                                            marginRight: "0.75rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            minWidth: "30px",
                                            minHeight: "30px",
                                        }}
                                    >
                                        <Phone size={24} color="#ffffff" />
                                    </div>
                                    <div>
                                        <h5
                                            className="fw-bold"
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "0.7rem",
                                                fontSize: "1rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            Teléfono
                                        </h5>
                                        <p
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "1.3rem",
                                                fontSize: "0.85rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            +34 614 892 722
                                        </p>
                                        <p
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "0",
                                                fontSize: "0.7rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            Lunes a Viernes, 9:00 - 18:00
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="d-flex align-items-start mb-3">
                                    <div
                                        style={{
                                            backgroundColor:
                                                "rgba(160, 186, 193, 0.1)",
                                            padding: "8px",
                                            borderRadius: "50%",
                                            marginRight: "0.75rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            minWidth: "30px",
                                            minHeight: "30px",
                                        }}
                                    >
                                        <EnvelopeFill
                                            size={24}
                                            color="#ffffff"
                                        />
                                    </div>
                                    <div>
                                        <h5
                                            className="fw-bold"
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "0.7rem",
                                                fontSize: "1rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            Email
                                        </h5>
                                        <p
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "1.3rem",
                                                fontSize: "0.85rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            info@viajesatalanta.com
                                        </p>
                                        <p
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "0",
                                                fontSize: "0.7rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            Respuesta en 24 horas
                                        </p>
                                    </div>
                                </div>

                                {/* Oficina */}
                                <div className="d-flex align-items-start mb-3">
                                    <div
                                        style={{
                                            backgroundColor:
                                                "rgba(239, 182, 106, 0.1)",
                                            padding: "8px",
                                            borderRadius: "50%",
                                            marginRight: "0.75rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            minWidth: "30px",
                                            minHeight: "30px",
                                        }}
                                    >
                                        <GeoAltFill size={24} color="#ffffff" />
                                    </div>
                                    <div>
                                        <h5
                                            className="fw-bold"
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "0.7rem",
                                                fontSize: "1rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            Oficina
                                        </h5>
                                        <p
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "1.3rem",
                                                fontSize: "0.85rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            Villanueva de los Castillejos, 21540
                                        </p>
                                        <p
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "0",
                                                fontSize: "0.85rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            Huelva, España
                                        </p>
                                    </div>
                                </div>

                                {/* Horarios */}
                                <div className="d-flex align-items-start">
                                    <div
                                        style={{
                                            backgroundColor:
                                                "rgba(239, 182, 106, 0.1)",
                                            padding: "8px",
                                            borderRadius: "50%",
                                            marginRight: "0.75rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            minWidth: "30px",
                                            minHeight: "30px",
                                        }}
                                    >
                                        <ClockFill size={24} color="#ffffff" />
                                    </div>
                                    <div>
                                        <h5
                                            className="fw-bold"
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "0.7rem",
                                                fontSize: "1rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            Horarios
                                        </h5>
                                        <p
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "1.3rem",
                                                fontSize: "0.85rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            Lun - Vie: 9:00 - 18:00
                                        </p>
                                        <p
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "0",
                                                fontSize: "0.85rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            Sáb: 10:00 - 14:00
                                        </p>
                                        <p
                                            style={{
                                                color: "#ffffff",
                                                marginTop: "0",
                                                fontSize: "0.85rem",
                                                lineHeight: 0,
                                            }}
                                        >
                                            Dom: Cerrado
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contacto;
