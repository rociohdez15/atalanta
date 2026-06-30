import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import ServiciosIncluidos from "./servicios/Servicios";
import { BsCheck, BsX } from "react-icons/bs";
import Swal from "sweetalert2";
import {
    ArrowLeft,
    User,
    CheckCircle,
    DollarSign,
    Calendar,
    Users,
    CreditCard,
    Plus,
    Trash2,
    MapPin,
    Loader,
} from "lucide-react";

const TipoPago = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { paqueteId } = useParams();
    const { id } = useParams();
    const { paqueteId: paqueteIdRuta } = useParams();

    const [tipoPago, setTipoPago] = useState("total");
    const [precioPaquete, setPrecioPaquete] = useState(0);
    const [cuotas, setCuotas] = useState(3);
    const [loading, setLoading] = useState(true);
    const [plazas, setPlazas] = useState(1);
    const [clienteId, setClienteId] = useState(null);
    const [paquete, setPaquete] = useState(null);
    const [error, setError] = useState(null);
    const [participantes, setParticipantes] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [puntosMapa, setPuntosMapa] = useState([]);
    const [itinerarios, setItinerarios] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (location.state?.participantes) {
            setParticipantes(location.state.participantes);
            setPlazas(location.state.participantes.length);
        } else {
            console.warn("Error ");
        }
    }, [location.state]);

    const baseUrl = `/storage/paquetes/${id}/images/`;

    const estiloFondo = paquete
        ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(/storage/paquetes/portada/${id}/${paquete.foto})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
          }
        : {};

    // Cargar datos del paquete y recursos asociados
    useEffect(() => {
        const idFinal = paqueteIdRuta || location.state?.paqueteId || paqueteId;

        if (!idFinal) {
            alert("No se encontró el ID del paquete.");
            return;
        }

        setLoading(true);

        Promise.all([
            axios.get(`/api/paquetes/${idFinal}`, { withCredentials: true }),
            axios.get(`/api/paquetes/${idFinal}/imagenes`, {
                withCredentials: true,
            }),
            axios.get(`/api/paquetes/${idFinal}/puntos`, {
                withCredentials: true,
            }),
            axios.get(`/api/paquetes/${idFinal}/itinerarios`, {
                withCredentials: true,
            }),
            axios.get("/api/pago/cliente", { withCredentials: true }), // HttpOnly cookie
        ])
            .then(
                ([
                    resPaquete,
                    resImagenes,
                    resPuntos,
                    resItinerarios,
                    resCliente,
                ]) => {
                    setPaquete(resPaquete.data);
                    setPrecioPaquete(resPaquete.data.precio);
                    setImagenes(resImagenes.data);
                    setPuntosMapa(resPuntos.data);
                    setItinerarios(resItinerarios.data);
                    setClienteId(resCliente.data.id);
                    setPlazas(resCliente.data.participantes?.length || 1);
                    setLoading(false);
                },
            )
            .catch((err) => {
                setError(
                    "Error al cargar los datos del paquete o del cliente.",
                );
                setLoading(false);
            });
    }, [paqueteIdRuta, location.state, paqueteId]);

    const totalPrice = paquete?.precio
        ? paquete.precio * participantes.length
        : 0;
    const totalOriginalPrice = paquete?.precio
        ? paquete.precio * participantes.length
        : null;

    const calcularTotal = () => {
        if (!paquete) return "0.00";
        return (paquete.precio * participantes.length).toFixed(2);
    };

    const calcularCuota = () => {
        if (!paquete) return "0.00";
        return ((paquete.precio * participantes.length) / cuotas).toFixed(2);
    };

    const handlePagar = async () => {
        // ⛔ Evitar doble click
        if (isSubmitting) return;

        setIsSubmitting(true); // 🔥 ACTIVAR SPINNER

        try {
            if (!clienteId) {
                setIsSubmitting(false);
                navigate("/login", { replace: true });
                return;
            }

            if (!participantes.length) {
                setIsSubmitting(false);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No hay participantes",
                });
                return;
            }

            const datosReserva = {
                participantes,
                tipoPago,
                cuotas: tipoPago === "parcial" ? cuotas : null,
                totalPrecio:
                    tipoPago === "parcial" ? calcularCuota() : calcularTotal(),
                plazas,
                paqueteId: parseInt(paqueteIdRuta || paqueteId),
            };

            // 🟡 Guardar reserva temporal
            await axios.post("/api/registro/reserva/temp", datosReserva, {
                withCredentials: true,
            });

            // 🟡 Crear sesión Stripe
            const response = await axios.post(
                "/api/pago/stripe",
                {},
                { withCredentials: true },
            );

            // 🔥 Redirección externa → NO hace falta quitar spinner
            window.location.replace(response.data.url);
        } catch (error) {
            setIsSubmitting(false); // ❌ Error → quitamos spinner

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo iniciar el pago.",
            });
        }
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <Loader size={64} className="spin" color="#000000" />
            </div>
        );
    }

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                body {
                    margin: 0;
                }

                .bg-cover {
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    filter: brightness(75%);
                }

                .hero-container {
                    background-color: transparent !important; /* Asegura que el hero no reciba el fondo */
                }
                `,
                }}
            />

            {/* Hero section debajo del navbar */}
            <section className="w-100 m-0 p-0">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="position-relative overflow-hidden"
                    style={{
                        paddingTop: "5rem",
                        paddingBottom: "5rem",
                        background:
                            "linear-gradient(to right, #000000, #877c4f)",
                    }}
                >
                    {/* Imagen de fondo */}
                    <div className="position-absolute top-0 start-0 w-100 h-100">
                        <img
                            src={
                                paquete
                                    ? `/storage/paquetes/portada/${paqueteId}/${paquete.foto}`
                                    : "https://via.placeholder.com/1920x1080" // fallback
                            }
                            alt={paquete ? paquete.nombre : "Imagen de paquete"}
                            className="w-100 h-100"
                            style={{
                                objectFit: "cover",
                            }}
                        />

                        {/* Overlay oscuro translúcido */}
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{
                                backgroundColor: "rgba(0, 0, 0, 0.4)", // negro translúcido
                            }}
                        ></div>
                    </div>

                    {/* Contenido */}
                    <section className="position-relative px-3 px-sm-4 px-lg-5">
                        <div
                            className="container position-relative"
                            style={{ zIndex: 2, maxWidth: "1200px" }}
                        >
                            {/* Botón volver */}
                            <button
                                type="button"
                                onClick={() =>
                                    (window.location.href = "/experiencias")
                                }
                                className="btn btn-link d-flex align-items-center mb-4"
                                style={{
                                    transition:
                                        "color 0.3s ease, background-color 0.3s ease",
                                    textDecoration: "none",
                                    boxShadow: "none",
                                    color: "#ffffff",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "10pt",
                                    marginTop: "-25px",
                                    marginLeft: "-60px",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#ffffff";
                                    e.currentTarget.style.backgroundColor =
                                        "rgba(53, 55, 46, 0.1)";
                                    e.currentTarget.style.textDecoration =
                                        "none";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "#ffffff";
                                    e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    e.currentTarget.style.textDecoration =
                                        "none";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <ArrowLeft size={20} className="me-2" />
                                Volver a Experiencias
                            </button>

                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-center"
                            >
                                <h1
                                    className="fw-bold"
                                    style={{
                                        color: "#ffffff",
                                        fontFamily:
                                            '"TT Espina Trial Variable", sans-serif',
                                        fontSize: "clamp(2rem, 5vw, 4rem)",
                                        transform: "scaleX(1.5)", // 1.0 es normal, >1 estira
                                        display: "inline-block",
                                    }}
                                >
                                    Selecciona el tipo de pago
                                </h1>
                                <p
                                    className="lead mx-auto"
                                    style={{
                                        maxWidth: "720px",
                                        fontSize: "14pt",
                                        color: "#ffffff",
                                    }}
                                >
                                    Elige entre pago único o pago en cuotas para
                                    completar tu reserva. Procesamos pagos de
                                    forma segura.
                                </p>
                            </motion.div>
                        </div>
                    </section>
                </motion.div>

                <div className="container my-5">
                    <div className="row g-5 justify-content-center">
                        {/* Columna izquierda */}
                        <div className="col-lg-8 mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="d-flex flex-column gap-4"
                            >
                                {/* Pago Único */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                    className={`rounded-4 p-4 cursor-pointer ${
                                        tipoPago === "total"
                                            ? "shadow"
                                            : "border border-secondary-subtle"
                                    }`}
                                    style={{
                                        border: "2px solid",
                                        borderColor:
                                            tipoPago === "total"
                                                ? "#000000"
                                                : "#000000",
                                        backgroundColor: "#000000",
                                    }}
                                    onClick={() => setTipoPago("total")}
                                >
                                    <div className="d-flex">
                                        <input
                                            type="radio"
                                            id="total"
                                            name="pago"
                                            checked={tipoPago === "total"}
                                            onChange={() =>
                                                setTipoPago("total")
                                            }
                                            className="form-check-input me-3 mt-1"
                                        />
                                        <div>
                                            <label
                                                htmlFor="total"
                                                className="form-label fw-semibold d-flex align-items-center"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                <DollarSign className="me-2" />
                                                Pago único
                                                {tipoPago === "total" && (
                                                    <span
                                                        className="badge ms-2"
                                                        style={{
                                                            backgroundColor:
                                                                "#ffffff",
                                                            fontFamily:
                                                                "'Inter', sans-serif",
                                                            color: " #000000",
                                                        }}
                                                    >
                                                        Seleccionado
                                                    </span>
                                                )}
                                            </label>
                                            <p
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                Paga ahora el total del viaje.
                                                ¡Sin complicaciones!
                                            </p>

                                            <small
                                                className="d-block mt-1"
                                                style={{
                                                    color: "#f5f5f5",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                Opción de pago a plazos
                                                disponible con Klarna al pagar.
                                            </small>
                                            <br />
                                            <div
                                                className=" rounded p-3 d-flex justify-content-between"
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                    fontSize: "14px",
                                                    color: "#000000",
                                                }}
                                            >
                                                <span
                                                    style={{ fontSize: "14px" }}
                                                >
                                                    Total a pagar:
                                                </span>
                                                <span
                                                    className="fw-bold"
                                                    style={{
                                                        color: " #000000",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {calcularTotal()}€
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Información de Seguridad */}
                                <div
                                    className="card border-0 shadow-sm rounded-4"
                                    style={{
                                        backgroundColor: " #000000",
                                    }}
                                >
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <CheckCircle
                                                className="me-2"
                                                size={22}
                                                style={{ color: "#ffffff" }}
                                            />
                                            <h6
                                                className="mb-0 fw-semibold"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                }}
                                            >
                                                Pago 100% Seguro
                                            </h6>
                                        </div>
                                        <div className="row text-muted small">
                                            <div
                                                className="col-md-4 d-flex align-items-center"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                }}
                                            >
                                                <div
                                                    className="rounded-circle me-2"
                                                    style={{
                                                        width: "8px",
                                                        height: "8px",
                                                        fontFamily:
                                                            "'Inter', sans-serif",
                                                        backgroundColor:
                                                            "#ffffff",
                                                    }}
                                                ></div>
                                                Cifrado SSL 256-bit
                                            </div>
                                            <div
                                                className="col-md-4 d-flex align-items-center"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                }}
                                            >
                                                <div
                                                    className="rounded-circle me-2"
                                                    style={{
                                                        width: "8px",
                                                        height: "8px",
                                                        backgroundColor:
                                                            "#ffffff",
                                                    }}
                                                ></div>
                                                Protección antifraude
                                            </div>
                                            <div
                                                className="col-md-4 d-flex align-items-center"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                }}
                                            >
                                                <div
                                                    className="rounded-circle me-2"
                                                    style={{
                                                        width: "8px",
                                                        height: "8px",
                                                        backgroundColor:
                                                            "#ffffff",
                                                    }}
                                                ></div>
                                                Reembolso garantizado
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón Confirmar */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                    className="d-flex justify-content-center"
                                >
                                    <button
                                        onClick={handlePagar}
                                        className="btn px-4 py-2"
                                        style={{
                                            backgroundColor: "#000000",
                                            backdropFilter: "blur(12px)",
                                            WebkitBackdropFilter: "blur(12px)",
                                            color: "#ffffff",
                                            border: "1px solid rgba(255,255,255,0.5)",
                                            minWidth: "110px",
                                            textAlign: "center",
                                            fontSize: "12px",
                                            transition: "all 0.3s ease",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                        disabled={isSubmitting} // 🔒 bloquea el botón mientras procesa
                                    >
                                        {isSubmitting ? (
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
                                                <CreditCard
                                                    size={18}
                                                    className="me-2"
                                                />
                                                {tipoPago === "total"
                                                    ? `Pagar ${calcularTotal()}€`
                                                    : `Pagar primera cuota ${calcularCuota()}€`}
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Columna derecha: Resumen de Reserva */}
                        <div className="col-lg-4 mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="position-sticky"
                                style={{ top: "8rem" }}
                            >
                                <div
                                    className="card rounded-4"
                                    style={{
                                        backgroundColor: "#000000",
                                        border: "1px solid #ffffff",
                                    }}
                                >
                                    <div
                                        className="card-header"
                                        style={{ borderBottom: "none" }}
                                    >
                                        <h5
                                            className="card-title"
                                            style={{ color: "#ffffff" }}
                                        >
                                            Resumen de reserva
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        {/* Imagen y detalles de la experiencia */}
                                        <div className="mb-4">
                                            <div className="ratio ratio-16x9 rounded mb-2 overflow-hidden">
                                                <img
                                                    src={
                                                        paquete
                                                            ? `/storage/paquetes/portada/${paqueteId}/${paquete.foto}`
                                                            : ""
                                                    }
                                                    alt={
                                                        paquete?.titulo ||
                                                        "Imagen de la experiencia"
                                                    }
                                                    className="img-fluid w-100 h-100 object-fit-cover"
                                                />
                                            </div>
                                            {paquete && (
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor:
                                                            "#ffffff",
                                                        color: "#ffffff",
                                                        fontFamily:
                                                            "'Inter', sans-serif",
                                                    }}
                                                >
                                                    {paquete.tipo_viaje}
                                                </span>
                                            )}
                                            <h3
                                                className="fw-bold mt-2 mb-2"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                    fontSize: "18px",
                                                }}
                                            >
                                                {paquete?.nombre ||
                                                    "Nombre no disponible"}
                                            </h3>

                                            <div
                                                className="text-muted small"
                                                style={{
                                                    color: "rgba(53,55,46,0.7)",
                                                }}
                                            >
                                                <div
                                                    className="d-flex align-items-center mb-1"
                                                    style={{
                                                        color: "#ffffff",
                                                        fontFamily:
                                                            "'Inter', sans-serif",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    <MapPin
                                                        size={14}
                                                        className="me-2"
                                                    />
                                                    <span>
                                                        {paquete
                                                            ? paquete.lugar
                                                            : "Cargando..."}
                                                    </span>
                                                </div>
                                                <div
                                                    className="d-flex align-items-center mb-1"
                                                    style={{
                                                        color: "#ffffff",
                                                        fontFamily:
                                                            "'Inter', sans-serif",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    <Calendar
                                                        size={14}
                                                        className="me-2"
                                                    />
                                                    <span>
                                                        {(() => {
                                                            if (
                                                                !paquete?.fecha_inicio ||
                                                                !paquete?.fecha_fin
                                                            )
                                                                return "Cargando...";

                                                            const inicio =
                                                                new Date(
                                                                    paquete.fecha_inicio,
                                                                );
                                                            const fin =
                                                                new Date(
                                                                    paquete.fecha_fin,
                                                                );

                                                            const diaInicio =
                                                                inicio.getDate();
                                                            const diaFin =
                                                                fin.getDate();
                                                            const mes =
                                                                fin.toLocaleDateString(
                                                                    "es-ES",
                                                                    {
                                                                        month: "long",
                                                                    },
                                                                );
                                                            const año =
                                                                fin.getFullYear();

                                                            return `${diaInicio} al ${diaFin} de ${mes} de ${año}`;
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <hr
                                            style={{
                                                borderColor: "#ffffff",
                                            }}
                                        />

                                        {/* Precio */}
                                        <div>
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between text-muted mb-1">
                                                    <span
                                                        style={{
                                                            color: "#ffffff",
                                                            fontFamily:
                                                                "'Inter', sans-serif",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        Precio por persona:
                                                    </span>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span
                                                            className="fw-medium"
                                                            style={{
                                                                color: "#ffffff",
                                                                fontFamily:
                                                                    "'Inter', sans-serif",
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            {paquete?.precio ||
                                                                "Cargando..."}
                                                            €
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="d-flex justify-content-between text-muted mb-1">
                                                    <span
                                                        style={{
                                                            color: "#ffffff",
                                                            fontFamily:
                                                                "'Inter', sans-serif",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        Número de viajeros:
                                                    </span>
                                                    <span
                                                        style={{
                                                            color: "#ffffff",
                                                            fontFamily:
                                                                "'Inter', sans-serif",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        {participantes.length}
                                                    </span>
                                                </div>
                                            </div>

                                            <hr
                                                style={{
                                                    borderColor: "#ffffff",
                                                }}
                                            />

                                            <div
                                                className="d-flex justify-content-between fw-bold fs-5"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                <span>Total:</span>
                                                <span>€{totalPrice}</span>
                                            </div>
                                            <br />
                                            {/* Resumen del plan de pago seleccionado */}
                                            {tipoPago === "parcial" && (
                                                <div
                                                    className="card mb-3"
                                                    style={{
                                                        backgroundColor:
                                                            "#ffffff",
                                                    }}
                                                >
                                                    <div className="card-body p-3">
                                                        <h6
                                                            className="card-subtitle mb-2 fw-medium"
                                                            style={{
                                                                color: " #000000",
                                                            }}
                                                        >
                                                            Plan de Pago
                                                            Seleccionado: Cuotas
                                                        </h6>
                                                        <div
                                                            className="small"
                                                            style={{
                                                                color: " #000000",
                                                                fontFamily:
                                                                    "'Inter', sans-serif",
                                                            }}
                                                        >
                                                            <div>
                                                                • Hoy:{" "}
                                                                {calcularCuota()}
                                                                €
                                                            </div>
                                                            <div
                                                                style={{
                                                                    color: " #000000",
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                }}
                                                            >
                                                                {cuotas - 1}{" "}
                                                                cuotas de €
                                                                {calcularCuota()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default TipoPago;
