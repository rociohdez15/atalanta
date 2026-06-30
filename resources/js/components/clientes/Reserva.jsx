import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import MapaPuntos from "./mapas/MapaPuntos";
import Swal from "sweetalert2";
import axios from "axios";
import { motion } from "framer-motion";
import ServiciosIncluidos from "./servicios/Servicios";
import { BsCheck, BsX } from "react-icons/bs";
import {
    ArrowLeft,
    User,
    Calendar,
    Users,
    CreditCard,
    Plus,
    Trash2,
    MapPin,
    Loader,
} from "lucide-react";

// Validación de email
const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Validación de DNI español
const validarDNI = (dni) => {
    const dniRegex = /^(\d{8})([A-Z])$/i;
    const letras = "TRWAGMYFPDXBNJZSQVHLCKE";

    const match = dni.match(dniRegex);
    if (!match) return false;

    const numero = parseInt(match[1], 10);
    const letra = match[2].toUpperCase();

    return letras[numero % 23] === letra;
};

const getFechaMinNacimiento = () => {
    const fecha = new Date();
    fecha.setFullYear(fecha.getFullYear() - 110);
    return fecha.toISOString().split("T")[0];
};

const fechaMinNacimiento = getFechaMinNacimiento();
const fechaMaxNacimiento = new Date().toISOString().split("T")[0];

const getNuevoParticipante = () => ({
    nombre: "",
    apellidos: "",
    email: "",
    dni: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    fechaNacimiento: "",
    experiencia: "",
    motivacion: "",
    infoRelevante: "",
});

const Reserva = () => {
    const { paqueteId } = useParams();
    const { id } = useParams();
    const navigate = useNavigate();

    // --- Estados ---
    const [participantes, setParticipantes] = useState([
        getNuevoParticipante(),
    ]);
    const [cliente, setCliente] = useState(null);
    const [plazasDisponibles, setPlazasDisponibles] = useState(null);
    const [paquete, setPaquete] = useState(null);
    const [puntosMapa, setPuntosMapa] = useState([]);
    const [itinerarios, setItinerarios] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imagenes, setImagenes] = useState([]);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const tooltipRef = useRef(null);
    const [loading, setLoading] = useState(true); // estado loading
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dniBloqueados, setDniBloqueados] = useState({});
    const [validandoDni, setValidandoDni] = useState({});

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        const nuevos = [...participantes];
        nuevos[index] = { ...nuevos[index], [name]: value };
        setParticipantes(nuevos);

        // Validar DNI automáticamente si es el campo dni y es válido
        if (name === "dni" && validarDNI(value)) {
            validarDniBackend(value, index);
        }
    };

    const validarDniBackend = async (dni, index) => {
        setValidandoDni((prev) => ({ ...prev, [index]: true }));

        try {
            const res = await axios.post(
                "/api/validar-dni-reserva",
                { dni, paqueteId },
                { withCredentials: true },
            );

            if (res.data.existe) {
                // Mostrar SweetAlert
                Swal.fire({
                    icon: "warning",
                    title: "Ya existe una reserva",
                    text: "Ya existe una reserva en el sistema para este viajero.",
                });

                // Limpiar input de DNI
                const nuevos = [...participantes];
                nuevos[index].dni = "";
                setParticipantes(nuevos);

                // Marcar como bloqueado temporalmente para no enviar al pago
                setDniBloqueados((prev) => ({ ...prev, [index]: true }));
            } else {
                setDniBloqueados((prev) => ({ ...prev, [index]: false }));
            }
        } catch (error) {
            console.error(" ");
        } finally {
            setValidandoDni((prev) => ({ ...prev, [index]: false }));
        }
    };
    const baseUrl = `/storage/paquetes/${id}/images/`;
    const estiloFondo = paquete
        ? {
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/storage/paquetes/portada/${id}/${paquete.foto})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
          }
        : {};

    // --- Verificar sesión vía HttpOnly cookie ---
    useEffect(() => {
        axios
            .get("/api/check-session", { withCredentials: true })
            .then(() => setIsLoggedIn(true))
            .catch(() => setIsLoggedIn(false));
    }, []);

    // --- Cargar datos del paquete ---
    useEffect(() => {
        setError(null);
        setLoading(true); // mostrar spinner al iniciar la carga

        const fetchPaquete = axios.get(`/api/paquetes/${paqueteId}`, {
            withCredentials: true,
        });
        const fetchImagenes = axios.get(`/api/paquetes/${paqueteId}/imagenes`, {
            withCredentials: true,
        });
        const fetchPuntos = axios.get(`/api/paquetes/${paqueteId}/puntos`, {
            withCredentials: true,
        });
        const fetchItinerarios = axios.get(
            `/api/paquetes/${paqueteId}/itinerarios`,
            { withCredentials: true },
        );
        const fetchCliente = axios.get("/api/pago/cliente", {
            withCredentials: true,
        });

        Promise.all([
            fetchPaquete,
            fetchImagenes,
            fetchPuntos,
            fetchItinerarios,
            fetchCliente,
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
                    setImagenes(resImagenes.data);
                    setPuntosMapa(resPuntos.data);
                    setItinerarios(resItinerarios.data);
                    setCliente(resCliente.data);
                    setPlazasDisponibles(resPaquete.data.plazas);
                    // Si el paquete tiene viajeros fijos, inicializa el array con ese número
                    if (
                        resPaquete.data.viajerosFijos &&
                        resPaquete.data.viajerosFijos > 0
                    ) {
                        setParticipantes(
                            Array.from(
                                { length: resPaquete.data.viajerosFijos },
                                () => getNuevoParticipante(),
                            ),
                        );
                    }
                },
            )
            .catch(() => setError("No se pudieron cargar todos los datos"))
            .finally(() => setLoading(false)); // ocultar spinner al terminar
    }, [paqueteId]);

    // --- Interacciones con el mapa ---
    useEffect(() => {
        $(".dia")
            .off("click")
            .on("click", function () {
                const target = $(this).data("target");
                $(target).slideToggle();
            });
        return () => $(".dia").off("click");
    }, [puntosMapa]);

    // --- Total de precio ---
    const totalPrice = paquete?.precio
        ? paquete.precio * participantes.length
        : 0;

    // --- Manejo de participantes ---
    const handleChange2 = (index, e) => {
        const { name, value } = e.target;
        const nuevos = [...participantes];
        nuevos[index] = { ...nuevos[index], [name]: value };
        setParticipantes(nuevos);
    };

    const agregarParticipante = () => {
        if (participantes.length >= plazasDisponibles) {
            Swal.fire({
                icon: "warning",
                title: "Límite alcanzado",
                text: "No hay más plazas disponibles.",
            });
            return;
        }
        setParticipantes([...participantes, getNuevoParticipante()]);

        if (paquete?.viajerosFijos && paquete.viajerosFijos > 0) {
            Swal.fire({
                icon: "info",
                title: "Número fijo de viajeros",
                text: `Este paquete solo admite ${paquete.viajerosFijos} viajero${paquete.viajerosFijos !== 1 ? "s" : ""} por reserva.`,
            });
            return;
        }
    };

    const eliminarParticipante = (index) => {
        if (participantes.length === 1) {
            Swal.fire({
                icon: "info",
                title: "No permitido",
                text: "Debe haber al menos un viajero.",
            });
            return;
        }
        if (paquete?.viajerosFijos && paquete.viajerosFijos > 0) {
            Swal.fire({
                icon: "info",
                title: "Número fijo de viajeros",
                text: "No puedes eliminar viajeros en este paquete.",
            });
            return;
        }
        const nuevos = participantes.filter((_, i) => i !== index);
        setParticipantes(nuevos);
        Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "El viajero ha sido eliminado.",
            timer: 1500,
            showConfirmButton: false,
        });
    };

    // --- Ir a pago ---
    const handleIrAPago = async () => {
        // 🔒 Evita doble click
        if (isSubmitting) return;

        // 🔥 ACTIVA SPINNER AL INICIO
        setIsSubmitting(true);

        // --- Validación campos vacíos ---
        const camposVacios = participantes.some((p) =>
            Object.values(p).some((v) => v.trim() === ""),
        );
        if (camposVacios) {
            Swal.fire({
                icon: "warning",
                title: "Campos vacíos",
                text: "Completa todos los campos antes de continuar.",
            });
            setIsSubmitting(false);
            return;
        }

        // --- Validación DNI ---
        for (const p of participantes) {
            if (!validarDNI(p.dni)) {
                Swal.fire({
                    icon: "error",
                    title: "DNI inválido",
                    text: `El DNI ${p.dni} no es válido.`,
                });
                setIsSubmitting(false);
                return;
            }
        }

        if (Object.values(validandoDni).some((v) => v === true)) {
            Swal.fire({
                icon: "info",
                title: "Validando DNI",
                text: "Espera a que se validen todos los DNIs antes de continuar.",
            });
            setIsSubmitting(false);
            return;
        }

        // 🚫 DNI ya registrado en backend
        if (Object.values(dniBloqueados).some((v) => v === true)) {
            Swal.fire({
                icon: "warning",
                title: "DNI duplicado",
                text: "Hay viajeros que ya tienen una reserva confirmada para este viaje. Corrige los DNIs o elimina esos participantes.",
            });
            setIsSubmitting(false);
            return;
        }

        // 🚫 DNIs duplicados dentro del formulario
        const dnis = participantes.map((p) => p.dni);
        const dnisDuplicados = dnis.filter(
            (dni, index) => dnis.indexOf(dni) !== index,
        );

        if (dnisDuplicados.length > 0) {
            Swal.fire({
                icon: "error",
                title: "DNI duplicado",
                text: "No puede haber dos viajeros con el mismo DNI en la misma reserva.",
            });
            setIsSubmitting(false);
            return;
        }

        // --- Validación fecha nacimiento (máx 110 años) ---
        const hoy = new Date();
        for (const p of participantes) {
            const fechaNac = new Date(p.fechaNacimiento);
            const edad = hoy.getFullYear() - fechaNac.getFullYear();

            if (edad > 110) {
                Swal.fire({
                    icon: "error",
                    title: "Fecha de nacimiento inválida",
                    text: "La edad no es correcta.",
                });
                setIsSubmitting(false);
                return;
            }
        }

        // --- Validación cliente ---
        if (!cliente) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo obtener el cliente.",
            });
            setIsSubmitting(false);
            return;
        }

        try {
            // --- Llamada backend ---
            await axios.post(
                "/api/registro/reserva/temp",
                {
                    paqueteId: parseInt(paqueteId), // ← añadir esto, viene de useParams() como string
                    participantes,
                },
                { withCredentials: true },
            );

            // 👉 Navegamos
            navigate(`/seleccionar-pago/${paqueteId}`, {
                replace: true,
                state: {
                    participantes,
                    plazas: participantes.length,
                },
            });
        } catch (error) {
            setIsSubmitting(false);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo guardar la reserva temporal.",
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
                        {/* Overlay para mejorar legibilidad */}
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
                                    (window.location.href = `/experiencia/${paqueteId}`)
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
                                Volver
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
                                    Reserva tu Aventura
                                </h1>
                                <p
                                    className="lead mx-auto"
                                    style={{
                                        maxWidth: "720px",
                                        fontSize: "14pt",
                                        color: "#ffffff",
                                    }}
                                >
                                    Estás a un paso de vivir una experiencia
                                    inolvidable. Completa el formulario y nos
                                    pondremos en contacto contigo.
                                </p>
                            </motion.div>
                        </div>
                    </section>
                </motion.div>

                <div className="container py-5">
                    <div className="row g-4">
                        {/* Formulario Principal */}
                        <div className="col-lg-8">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <form
                                    onSubmit={(e) => e.preventDefault()}
                                    className="space-y-5"
                                >
                                    {participantes.map((p, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                duration: 0.6,
                                                delay: index * 0.1,
                                            }}
                                        >
                                            <div
                                                className="rounded-4 shadow-sm border"
                                                style={{
                                                    backgroundColor: " #000000",
                                                    borderColor:
                                                        "rgba(53,55,46,0.1)",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {/* Cabecera */}
                                                <div
                                                    className="d-flex justify-content-between align-items-center p-3"
                                                    style={{
                                                        background:
                                                            "linear-gradient(to right, rgba(53,55,46,0.05), rgba(135,124,79,0.05))",
                                                    }}
                                                >
                                                    <h5
                                                        className="m-0 d-flex align-items-center"
                                                        style={{
                                                            color: "#ffffff",
                                                            fontSize: "16px",
                                                        }}
                                                    >
                                                        <User
                                                            className="me-2"
                                                            size={20}
                                                        />
                                                        Viajero {index + 1}
                                                        {index === 0 && (
                                                            <span
                                                                className="badge ms-3"
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    color: "#000000",
                                                                }}
                                                            >
                                                                Principal
                                                            </span>
                                                        )}
                                                    </h5>

                                                    {participantes.length > 1 &&
                                                        index > 0 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm d-flex align-items-center"
                                                                onClick={() =>
                                                                    eliminarParticipante(
                                                                        index,
                                                                    )
                                                                }
                                                                style={{
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                    border: "1px solid red",
                                                                    color: "#fff",
                                                                    backgroundColor:
                                                                        "red",
                                                                }}
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                    className="me-1"
                                                                />
                                                                Eliminar
                                                            </button>
                                                        )}
                                                </div>

                                                {/* Contenido */}
                                                <div className="p-4">
                                                    <h6
                                                        className="mb-3 fw-semibold d-flex align-items-center"
                                                        style={{
                                                            color: "#ffffff",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display:
                                                                    "inline-block",
                                                                width: "8px",
                                                                height: "8px",
                                                                backgroundColor:
                                                                    "#ffffffff",
                                                                borderRadius:
                                                                    "50%",
                                                                marginRight:
                                                                    "10px",
                                                            }}
                                                        ></span>
                                                        Datos de Contacto
                                                    </h6>

                                                    <div className="row g-3 mb-4">
                                                        <div className="col-md-6">
                                                            <label
                                                                className="form-label"
                                                                style={{
                                                                    color: "#ffffff",
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                    fontSize:
                                                                        "14px",
                                                                }}
                                                            >
                                                                Nombre *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={p.nombre}
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        e,
                                                                    )
                                                                }
                                                                name="nombre"
                                                                required
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    borderColor:
                                                                        "#ffffff",
                                                                    fontFamily:
                                                                        "Inter, sans-serif", // 👈 aquí defines la fuente
                                                                    height: "25px", // Altura personalizada
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label
                                                                className="form-label"
                                                                style={{
                                                                    color: "#ffffff",
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                    fontSize:
                                                                        "14px",
                                                                }}
                                                            >
                                                                Apellidos *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    borderColor:
                                                                        "e9dab6",
                                                                    fontFamily:
                                                                        "Inter, sans-serif", // 👈 aquí defines la fuente
                                                                    height: "25px", // Altura personalizada
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                                className="form-control"
                                                                value={
                                                                    p.apellidos
                                                                }
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        e,
                                                                    )
                                                                }
                                                                name="apellidos"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label
                                                                className="form-label"
                                                                style={{
                                                                    color: "#ffffff",
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                    fontSize:
                                                                        "14px",
                                                                }}
                                                            >
                                                                Email *
                                                            </label>
                                                            <input
                                                                type="email"
                                                                className="form-control"
                                                                value={p.email}
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        e,
                                                                    )
                                                                }
                                                                name="email"
                                                                required
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    borderColor:
                                                                        "#ffffff",
                                                                    fontFamily:
                                                                        "Inter, sans-serif", // 👈 aquí defines la fuente
                                                                    height: "25px", // Altura personalizada
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label
                                                                className="form-label"
                                                                style={{
                                                                    color: "#ffffff",
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                    fontSize:
                                                                        "14px",
                                                                }}
                                                            >
                                                                DNI *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={p.dni}
                                                                name="dni"
                                                                required
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        e,
                                                                    )
                                                                }
                                                                onBlur={() => {
                                                                    if (
                                                                        !validarDNI(
                                                                            p.dni,
                                                                        )
                                                                    ) {
                                                                        Swal.fire(
                                                                            {
                                                                                icon: "error",
                                                                                title: "DNI no válido",
                                                                                text: "El DNI introducido no es válido. Comprueba número y letra.",
                                                                            },
                                                                        );

                                                                        const nuevos =
                                                                            [
                                                                                ...participantes,
                                                                            ];
                                                                        nuevos[
                                                                            index
                                                                        ].dni =
                                                                            "";
                                                                        setParticipantes(
                                                                            nuevos,
                                                                        );
                                                                        return;
                                                                    }

                                                                    validarDniBackend(
                                                                        p.dni,
                                                                        index,
                                                                    );
                                                                }}
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    borderColor:
                                                                        "#ffffff",
                                                                    fontFamily:
                                                                        "Inter, sans-serif",
                                                                    height: "25px",
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label
                                                                className="form-label"
                                                                style={{
                                                                    color: "#ffffff",
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                    fontSize:
                                                                        "14px",
                                                                }}
                                                            >
                                                                Teléfono *
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                className="form-control"
                                                                value={
                                                                    p.telefono
                                                                }
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        e,
                                                                    )
                                                                }
                                                                name="telefono"
                                                                required
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    borderColor:
                                                                        "#ffffff",
                                                                    fontFamily:
                                                                        "Inter, sans-serif", // 👈 aquí defines la fuente
                                                                    height: "25px", // Altura personalizada
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="col-md-6">
                                                            <label
                                                                className="form-label"
                                                                style={{
                                                                    color: "#ffffff",
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                    fontSize:
                                                                        "14px",
                                                                }}
                                                            >
                                                                Dirección *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={
                                                                    p.direccion
                                                                }
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        e,
                                                                    )
                                                                }
                                                                name="direccion"
                                                                required
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    borderColor:
                                                                        "#ffffff",
                                                                    fontFamily:
                                                                        "Inter, sans-serif", // 👈 aquí defines la fuente
                                                                    height: "25px", // Altura personalizada
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label
                                                                className="form-label"
                                                                style={{
                                                                    color: "#ffffff",
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                    fontSize:
                                                                        "14px",
                                                                }}
                                                            >
                                                                Ciudad *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={p.ciudad}
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        e,
                                                                    )
                                                                }
                                                                name="ciudad"
                                                                required
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    borderColor:
                                                                        "#ffffff",
                                                                    fontFamily:
                                                                        "Inter, sans-serif", // 👈 aquí defines la fuente
                                                                    height: "25px", // Altura personalizada
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label
                                                                className="form-label"
                                                                style={{
                                                                    color: "#ffffff",
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                    fontSize:
                                                                        "14px",
                                                                }}
                                                            >
                                                                Provincia *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={
                                                                    p.provincia
                                                                }
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        e,
                                                                    )
                                                                }
                                                                name="provincia"
                                                                required
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    borderColor:
                                                                        "#ffffff",
                                                                    fontFamily:
                                                                        "Inter, sans-serif", // 👈 aquí defines la fuente
                                                                    height: "25px", // Altura personalizada
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="col-md-4">
                                                            <label
                                                                className="form-label"
                                                                style={{
                                                                    color: "#ffffff",
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                    fontSize:
                                                                        "14px",
                                                                }}
                                                            >
                                                                Fecha de
                                                                nacimiento *
                                                            </label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={
                                                                    p.fechaNacimiento
                                                                }
                                                                name="fechaNacimiento"
                                                                min={
                                                                    fechaMinNacimiento
                                                                }
                                                                max={
                                                                    fechaMaxNacimiento
                                                                }
                                                                required
                                                                onChange={(e) =>
                                                                    handleChange(
                                                                        index,
                                                                        e,
                                                                    )
                                                                }
                                                                onBlur={() => {
                                                                    if (
                                                                        p.fechaNacimiento <
                                                                        fechaMinNacimiento
                                                                    ) {
                                                                        Swal.fire(
                                                                            {
                                                                                icon: "error",
                                                                                title: "Fecha no válida",
                                                                                text: "La fecha de nacimiento no es correcta.",
                                                                                confirmButtonText:
                                                                                    "Aceptar",
                                                                            },
                                                                        );

                                                                        const nuevos =
                                                                            [
                                                                                ...participantes,
                                                                            ];
                                                                        nuevos[
                                                                            index
                                                                        ].fechaNacimiento =
                                                                            "";
                                                                        setParticipantes(
                                                                            nuevos,
                                                                        );
                                                                    }
                                                                }}
                                                                style={{
                                                                    backgroundColor:
                                                                        "#ffffff",
                                                                    borderColor:
                                                                        "#ffffff",
                                                                    fontFamily:
                                                                        "Inter, sans-serif",
                                                                    height: "25px",
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <hr className="my-3" />

                                                    <h6
                                                        className="mb-3 fw-semibold d-flex align-items-center"
                                                        style={{
                                                            color: "#ffffff",
                                                            fontFamily:
                                                                "'Inter', sans-serif",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display:
                                                                    "inline-block",
                                                                width: "8px",
                                                                height: "8px",
                                                                backgroundColor:
                                                                    "#ffffff",
                                                                borderRadius:
                                                                    "50%",
                                                                marginRight:
                                                                    "10px",
                                                            }}
                                                        ></span>
                                                        Cuéntanos más sobre ti
                                                    </h6>

                                                    <div className="mb-3">
                                                        <label
                                                            className="form-label"
                                                            style={{
                                                                color: "#ffffff",
                                                                fontFamily:
                                                                    "'Inter', sans-serif",
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            ¿Cuál es tu
                                                            experiencia como
                                                            viajero/a? *
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="3"
                                                            value={
                                                                p.experiencia
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    index,
                                                                    e,
                                                                )
                                                            }
                                                            name="experiencia"
                                                            required
                                                            style={{
                                                                backgroundColor:
                                                                    "#ffffff",
                                                                borderColor:
                                                                    "#ffffff",
                                                                fontFamily:
                                                                    "Inter, sans-serif", // 👈 aquí defines la fuente
                                                                height: "25px", // Altura personalizada
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label
                                                            className="form-label"
                                                            style={{
                                                                color: "#ffffff",
                                                                fontFamily:
                                                                    "'Inter', sans-serif",
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            ¿Por qué quieres
                                                            unirte a esta
                                                            expedición? *
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="3"
                                                            value={p.motivacion}
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    index,
                                                                    e,
                                                                )
                                                            }
                                                            name="motivacion"
                                                            required
                                                            style={{
                                                                backgroundColor:
                                                                    "#ffffff",
                                                                borderColor:
                                                                    "#ffffff",
                                                                fontFamily:
                                                                    "Inter, sans-serif", // 👈 aquí defines la fuente
                                                                height: "25px", // Altura personalizada
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label
                                                            className="form-label"
                                                            style={{
                                                                color: "#ffffff",
                                                                fontFamily:
                                                                    "'Inter', sans-serif",
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            ¿Hay algo importante
                                                            que debamos saber
                                                            sobre ti?
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="3"
                                                            value={
                                                                p.infoRelevante
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    index,
                                                                    e,
                                                                )
                                                            }
                                                            name="infoRelevante"
                                                            style={{
                                                                backgroundColor:
                                                                    "#ffffff",
                                                                borderColor:
                                                                    "#ffffff",
                                                                fontFamily:
                                                                    "Inter, sans-serif", // 👈 aquí defines la fuente
                                                                height: "25px", // Altura personalizada
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        />
                                                        <small
                                                            className="text-white"
                                                            style={{
                                                                fontFamily:
                                                                    "'Inter', sans-serif",
                                                                fontSize: "8pt",
                                                            }}
                                                        >
                                                            Esta información nos
                                                            ayuda a personalizar
                                                            tu experiencia y
                                                            garantizar tu
                                                            seguridad.
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                            <br />
                                        </motion.div>
                                    ))}
                                    <div
                                        className="mt-3 mb-3 p-3 rounded"
                                        style={{
                                            backgroundColor:
                                                "rgba(255,255,255,0.1)",
                                            border: "1px solid rgba(255,255,255,0.3)",
                                            fontSize: "12px",
                                            color: "#000000",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        Al añadir los datos de otros viajeros,
                                        confirmas que tienes su consentimiento
                                        para facilitar sus datos personales con
                                        el fin de gestionar esta reserva, de
                                        acuerdo con nuestra{" "}
                                        <Link
                                            to="/politica"
                                            style={{
                                                color: "#493f2f",
                                                textDecoration: "underline",
                                                fontSize: "12px",
                                            }}
                                        >
                                            Política de Privacidad
                                        </Link>
                                        .
                                    </div>

                                    <br />

                                    {/* Botón */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.6,
                                            delay: 0.5,
                                        }}
                                        className="text-center"
                                    >
                                        <button
                                            type="button"
                                            className="btn px-4 py-2"
                                            style={{
                                                backgroundColor: "#000000", // gris cuando bloqueado
                                                backdropFilter: "blur(12px)",
                                                WebkitBackdropFilter:
                                                    "blur(12px)",
                                                color: "#ffffff",
                                                border: "1px solid rgba(255,255,255,0.5)",
                                                minWidth: "110px",
                                                textAlign: "center",
                                                fontSize: "12px",
                                                transition: "all 0.3s ease",
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                            onClick={handleIrAPago}
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
                                                        size={20}
                                                        className="me-2"
                                                    />
                                                    Enviar reserva
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                </form>
                            </motion.div>
                        </div>

                        {/* Resumen de Reserva */}
                        <div className="col-lg-4">
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
                                            Resumen de Reserva
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
                                                        color: "#000000",
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

                                        {/* Detalles de viajeros */}
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <Users
                                                    size={16}
                                                    className="me-2 text-white"
                                                />
                                                <span
                                                    className="fw-medium"
                                                    style={{
                                                        color: "#ffffff",
                                                        fontFamily:
                                                            "'Inter', sans-serif",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {participantes.length}{" "}
                                                    viajero
                                                    {participantes.length !== 1
                                                        ? "s"
                                                        : ""}
                                                </span>
                                            </div>
                                            {participantes.map(
                                                (traveler, index) => (
                                                    <div
                                                        key={index}
                                                        className="small mb-2"
                                                        style={{
                                                            color: "#ffffff",
                                                            fontFamily:
                                                                "'Inter', sans-serif",
                                                            fontSize: "14px",
                                                        }}
                                                    >
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
                                                            Viajero {index + 1}:
                                                        </span>{" "}
                                                        {traveler.nombre &&
                                                        traveler.apellidos
                                                            ? `${traveler.nombre} ${traveler.apellidos}`
                                                            : "Datos pendientes"}
                                                    </div>
                                                ),
                                            )}
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
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
                {/* Botón Flotante para Agregar Viajero */}
                {(!paquete?.viajerosFijos || paquete.viajerosFijos === 0) && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        style={{
                            position: "fixed",
                            bottom: "2rem",
                            right: "2rem",
                            zIndex: 1050,
                        }}
                    >
                        <button
                            type="button"
                            onClick={agregarParticipante}
                            className="btn"
                            style={{
                                width: "4rem",
                                height: "4rem",
                                borderRadius: "50%",
                                background:
                                    "linear-gradient(to right, #3a9e2fff, #3a9e2fff)",
                                color: "#ffffff",
                                boxShadow: "0 0.75rem 1.5rem rgba(0,0,0,0.2)",
                                transition: "all 0.3s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                                e.currentTarget.style.boxShadow =
                                    "0 1rem 2rem rgba(0,0,0,0.3)";
                                tooltipRef.current.style.opacity = 1;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow =
                                    "0 0.75rem 1.5rem rgba(0,0,0,0.2)";
                                tooltipRef.current.style.opacity = 0;
                            }}
                        >
                            <Plus size={24} />
                        </button>

                        <div
                            ref={tooltipRef}
                            style={{
                                position: "absolute",
                                top: "-3rem",
                                right: 0,
                                backgroundColor: "#000000",
                                color: "#ffffff",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "0.5rem",
                                fontSize: "0.8rem",
                                whiteSpace: "nowrap",
                                opacity: 0,
                                transition: "opacity 0.3s",
                                pointerEvents: "none",
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            Agregar Viajero
                        </div>
                    </motion.div>
                )}
            </section>
        </>
    );
};

export default Reserva;
