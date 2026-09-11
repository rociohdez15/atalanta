import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
    User,
    Calendar,
    Download,
    Edit,
    Save,
    X,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    Loader,
    Star,
} from "lucide-react";

export default function DashboardProfesional() {
    const [reservations, setReservations] = useState([]); // estado inicial vacío para reservas reales
    const [loadingReservations, setLoadingReservations] = useState(true);
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const { pathname } = useLocation();
    const [showCurrent, setShowCurrent] = useState(true);
    const [showNew, setShowNew] = useState(true);
    const [showConfirm, setShowConfirm] = useState(true);
    const [userReviews, setUserReviews] = useState([]);
    const [reviewStars, setReviewStars] = useState({});
    const [reviewText, setReviewText] = useState({});
    const [sendingReview, setSendingReview] = useState(false);
    const [reservations2, setReservations2] = useState([]);
    const [loading2, setLoading2] = useState(true);
    const [currentPageReviews, setCurrentPageReviews] = useState(1);
    const reviewsPerPage = 10;

    // Ahora activeTab es estado interno, inicializado a "personal"
    const [activeTab, setActiveTab] = useState("personal");
    if (
        activeTab !== "personal" &&
        activeTab !== "password" &&
        activeTab !== "reservations" &&
        activeTab !== "reviews"
    )
        return null;

    // Cuando cambias de tab, sólo setea si es una opción válida
    const handleTabChange = (tab) => {
        if (
            tab === "personal" ||
            tab === "password" ||
            tab === "reservations" ||
            tab === "reviews"
        ) {
            setActiveTab(tab);
        }
    };

    const handleSavePersonalData = () => {
        // Guardar datos...
        setIsEditingPersonal(false);
    };

    const inputStyle = {
        backgroundColor: "#f8f5f1",
        border: "1px solid rgba(53,55,46,0.2)",
        color: "#000000",
        borderRadius: "0.25rem",
        fontSize: "0.875rem",
    };

    const labelStyle = {
        color: "#000000",
        fontWeight: "500",
        fontSize: "0.9rem",
        marginBottom: "0.25rem",
    };

    const cardStyle = {
        backgroundColor: "#000000",
        border: "1px solid rgba(53,55,46,0.1)",
        borderRadius: "0.5rem",
        padding: "1.25rem",
    };

    const cardHeaderStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
    };

    const titleStyle = {
        color: "#000000",
        fontWeight: "700",
        fontSize: "1.25rem",
        margin: 0,
    };

    const descStyle = {
        color: "rgba(53,55,46,0.6)",
        fontSize: "0.875rem",
        marginTop: "0.125rem",
    };

    const btnOutlineStyle = {
        borderColor: "#c16e44",
        color: "#c16e44",
        fontWeight: "600",
        fontSize: "0.875rem",
        borderRadius: "0.375rem",
        padding: "0.25rem 0.75rem",
        transition: "background-color 0.3s ease, color 0.3s ease",
    };

    const btnOutlineHover = (e) => {
        e.currentTarget.style.backgroundColor = "#c16e44";
        e.currentTarget.style.color = "#ffffff";
    };

    const btnOutlineLeave = (e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = "#c16e44";
    };

    const btnFillStyle = {
        backgroundColor: "#a0bac1",
        color: "#000000",
        fontWeight: "600",
        fontSize: "0.875rem",
        borderRadius: "0.375rem",
        padding: "0.25rem 0.75rem",
        border: "none",
        transition: "background-color 0.3s ease",
    };

    const btnFillHover = (e) => {
        e.currentTarget.style.backgroundColor = "rgba(160,186,193,0.9)";
    };

    const btnFillLeave = (e) => {
        e.currentTarget.style.backgroundColor = "#a0bac1";
    };

    const btnCancelStyle = {
        borderColor: "rgba(53,55,46,0.3)",
        color: "#000000",
        fontWeight: "600",
        fontSize: "0.875rem",
        borderRadius: "0.375rem",
        padding: "0.25rem 0.75rem",
        backgroundColor: "transparent",
        transition: "background-color 0.3s ease, color 0.3s ease",
    };

    const tabs = [
        { id: "personal", label: "Datos Personales", icon: User },
        { id: "password", label: "Contraseña", icon: Lock },
        { id: "reservations", label: "Mis Reservas", icon: Calendar },
        { id: "reviews", label: "Mis Reseñas", icon: Edit },
    ];

    useEffect(() => {
        async function fetchReservations() {
            try {
                // Petición al backend con cookie HttpOnly
                const response = await axios.get("/api/mis-reservas", {
                    withCredentials: true, // 🔹 envía la cookie automáticamente
                });

                // Asumiendo que el backend devuelve un array con las reservas del usuario
                setReservations(response.data);
            } catch (error) {
                Swal.fire(
                    "Error",
                    "No se pudieron cargar las reservas.",
                    "error",
                );
            } finally {
                setLoadingReservations(false);
            }
        }

        fetchReservations();
    }, []);

    const [userData, setUserData] = useState({
        nombre: "",
        apellidos: "",
        dni: "",
        direccion: "",
        telefono: "",
        fecha_nacimiento: "",
        email: "",
    });
    const [passwords, setPasswords] = useState({
        current: "",
        newPass: "",
        confirm: "",
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(""); // <-- Añadido para evitar error ReferenceError

    useEffect(() => {
        async function fetchUserData() {
            try {
                // Petición al backend con cookie HttpOnly
                const response = await axios.get("/api/profile", {
                    withCredentials: true, // 🔹 envía la cookie automáticamente
                });

                const data = response.data;

                setUserData({
                    nombre: data.nombre || "",
                    apellidos: data.apellidos || "",
                    dni: data.dni || "",
                    direccion: data.direccion || "",
                    telefono: data.telefono || "",
                    fecha_nacimiento: data.fecha_nacimiento || "",
                    email: data.email || "",
                });
            } catch (error) {
                Swal.fire(
                    "Error",
                    "No se pudieron cargar los datos del usuario.",
                    "error",
                );
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, []);

    const handleUserChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    function validarDNI(dni) {
        const letras = "TRWAGMYFPDXBNJZSQVHLCKE";

        // Comprobar formato 8 números + letra mayúscula
        const dniRegex = /^\d{8}[A-Z]$/;
        if (!dniRegex.test(dni)) return false;

        const numero = parseInt(dni.substring(0, 8), 10);
        const letra = dni.charAt(8);

        // Comprobar que la letra sea la correcta
        return letras.charAt(numero % 23) === letra;
    }

    const validarTelefono = (telefono) => {
        // Validación básica de teléfono: solo números y longitud entre 9 y 15 dígitos
        const telefonoRegex = /^[0-9]{9,15}$/;
        return telefonoRegex.test(telefono);
    };

    const guardarDatos = async (e) => {
        e.preventDefault();

        // Validar DNI
        if (!userData.dni || !validarDNI(userData.dni)) {
            Swal.fire({
                icon: "error",
                title: "DNI incorrecto",
                text: "Por favor, introduce un DNI válido.",
            });
            return;
        }

        // Validar teléfono
        if (!userData.telefono || !validarTelefono(userData.telefono)) {
            Swal.fire({
                icon: "error",
                title: "Teléfono inválido",
                text: "Por favor, introduce un teléfono válido.",
            });
            return;
        }

        // Si todo está bien, continua con el envío
        try {
            const formData = new FormData();
            formData.append("_method", "PUT");
            formData.append("nombre", userData.nombre);
            formData.append("apellidos", userData.apellidos);
            formData.append("dni", userData.dni);
            formData.append("direccion", userData.direccion);
            formData.append("telefono", userData.telefono);
            formData.append("fecha_nacimiento", userData.fecha_nacimiento);
            formData.append("email", userData.email);

            const response = await axios.post("/api/profile/update", formData, {
                withCredentials: true, // 🔹 envía la cookie HttpOnly automáticamente
            });

            Swal.fire({
                icon: "success",
                title: "Datos guardados",
                text: "Datos personales guardados correctamente.",
            });
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const errores = Object.values(error.response.data.errors)
                    .flat()
                    .join("\n");
                Swal.fire({
                    icon: "error",
                    title: "Error de validación",
                    text: errores,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        error.response?.data?.message ||
                        error.message ||
                        "Error desconocido",
                });
            }
        }
    };

    const descargarFactura = async (reservaId) => {
        try {
            const response = await fetch(
                `/api/facturas/${reservaId}/descargar`,
                {
                    method: "GET",
                    credentials: "include", // 🔹 envía la cookie HttpOnly automáticamente
                },
            );

            if (!response.ok) {
                throw new Error("Error al descargar la factura");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `factura_reserva_${reservaId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("No se pudo descargar la factura.");
        }
    };

    // Función para manejar cambios en inputs de contraseña
    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    // Función mínima para cambiar contraseña (puedes implementar la lógica real)

    const cambiarContrasena = async (e) => {
        e.preventDefault();

        // Validación de que las contraseñas coincidan
        if (passwords.newPass !== passwords.confirm) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "La nueva contraseña y la confirmación no coinciden.",
            });
            return;
        }

        // Validación local de la nueva contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial)
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!regex.test(passwords.newPass)) {
            Swal.fire({
                icon: "error",
                title: "Contraseña no válida",
                html: "La nueva contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, un número y un carácter especial.",
            });
            return;
        }

        try {
            const response = await axios.post(
                "/api/profile/password",
                {
                    current_password: passwords.current,
                    new_password: passwords.newPass,
                    new_password_confirmation: passwords.confirm,
                },
                {
                    withCredentials: true, // 🔹 envía la cookie HttpOnly automáticamente
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                },
            );

            Swal.fire({
                icon: "success",
                title: "Contraseña cambiada",
                text: "Tu contraseña ha sido cambiada correctamente.",
            });

            setPasswords({
                current: "",
                newPass: "",
                confirm: "",
            });
        } catch (error) {
            if (error.response) {
                if (error.response.status === 422) {
                    // Validación del backend: puede incluir error de contraseña actual incorrecta
                    const errores = Object.values(
                        error.response.data.errors || {},
                    )
                        .flat()
                        .join("\n");

                    Swal.fire({
                        icon: "error",
                        title: "La contraseña actual no es correcta.",
                        text: errores || error.response.data.message,
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text:
                            error.response.data.message ||
                            error.message ||
                            "Error desconocido",
                    });
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "Error desconocido",
                });
            }
        }
    };

    function parseDateDMY(dateStr) {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("/");
        if (!day || !month || !year) return null;
        return new Date(`${year}-${month}-${day}`);
    }

    useEffect(() => {
        const fetchUserReviews = async () => {
            try {
                const res = await axios.get("/api/mis-resenas", {
                    withCredentials: true,
                });

                // Asegurarse de que sea array
                setUserReviews(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error("Error al obtener reseñas del usuario:", error);
                setUserReviews([]); // fallback
            }
        };

        fetchUserReviews();
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const reservationsPerPage = 10;

    // Calcular índices para mostrar solo las reservas correspondientes a la página actual
    const indexOfLastReservation = currentPage * reservationsPerPage;
    const indexOfFirstReservation =
        indexOfLastReservation - reservationsPerPage;
    const currentReservations = reservations.slice(
        indexOfFirstReservation,
        indexOfLastReservation,
    );

    // Calcular total de páginas
    const totalPages = Math.ceil(reservations.length / reservationsPerPage);

    const reservaTieneResena = (reservaId) => {
        return userReviews.some((r) => r.reserva_id === reservaId);
    };

    // Traer reservas vencidas al montar el componente
    useEffect(() => {
        const fetchVencidas = async () => {
            try {
                const response = await axios.get("/api/reservas/vencidas", {
                    withCredentials: true,
                });

                setReservations2(response.data);
            } catch (error) {
                console.error(
                    "Error al obtener reservas vencidas:",
                    error.response?.data || error,
                );
            } finally {
                setLoading2(false);
            }
        };

        fetchVencidas();
    }, []);

    const reviewsFiltradas = reservations2.filter(
        (r) =>
            Array.isArray(userReviews) &&
            !userReviews.some((rev) => rev.reserva_id === r.reserva_id),
    );

    const reservasPendientes = reservations2;

    const indexOfLastReview = currentPageReviews * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reservasPendientes.slice(
        indexOfFirstReview,
        indexOfLastReview,
    );
    const totalReviewPages = Math.ceil(
        reservasPendientes.length / reviewsPerPage,
    );

    const enviarResena = async (reserva) => {
        // Validaciones
        if (!reviewStars[reserva.reserva_id]) {
            Swal.fire("Error", "Selecciona una puntuación", "error");
            return;
        }

        if (!reviewText[reserva.reserva_id]?.trim()) {
            Swal.fire("Error", "Escribe una reseña", "error");
            return;
        }

        setSendingReview(true);

        try {
            await axios.post(
                "/api/resenas/crear-resena",
                {
                    reserva_id: reserva.reserva_id,
                    paquete_id: reserva.paquete_id,
                    estrellas: reviewStars[reserva.reserva_id],
                    texto: reviewText[reserva.reserva_id],
                },
                {
                    withCredentials: true, // cookie JWT
                },
            );

            Swal.fire("¡Gracias!", "Reseña enviada correctamente", "success");

            // Limpia inputs
            setReviewStars((prev) => ({
                ...prev,
                [reserva.reserva_id]: 0,
            }));

            setReviewText((prev) => ({
                ...prev,
                [reserva.reserva_id]: "",
            }));

            // Quitar la reserva del listado (ya reseñada)
            setReservations2((prev) =>
                prev.filter((r) => r.reserva_id !== reserva.reserva_id),
            );
        } catch (error) {
            Swal.fire(
                "Error",
                error.response?.data?.message || "No se pudo enviar la reseña",
                "error",
            );
        } finally {
            setSendingReview(false);
        }
    };

    const MAX_REVIEW_LENGTH = 145;

    if (loadingReservations) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "50vh" }} // ajusta altura según prefieras
            >
                <Loader size={64} className="spin" color="#000000" />
            </div>
        );
    }

    return (
        <div className="container my-1 mb-0" style={{ maxWidth: "900px" }}>
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-4"
            >
                <div
                    className="position-relative text-center rounded-4 p-4 overflow-hidden"
                    style={{
                        background: "#000000",
                    }}
                >
                    {/* Contenido */}
                    <div className="position-relative" style={{ zIndex: 10 }}>
                        <div
                            className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: "96px",
                                height: "96px",
                                background: "#ffffff",
                            }}
                        >
                            <User
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    color: "#000000",
                                }}
                            />
                        </div>

                        <h1
                            className="fw-bold mb-2"
                            style={{
                                fontSize: "1.75rem",
                                color: "#ffffff",
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            Mi Perfil
                        </h1>

                        <p
                            style={{
                                color: "#ffffff",
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            Gestiona tu información personal y reservas
                        </p>
                    </div>
                </div>
            </motion.div>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
            >
                <style>
                    {`
                    .tabs-container {
                        display: flex;
                        flex-wrap: nowrap; /* 👈 CLAVE */
                        gap: 0.5rem;
                        background-color: #000000;
                        border: 1px solid #000000;
                        border-radius: 1.5rem;
                        padding: 0.25rem;
                    }

                    @media (max-width: 576px) {
                        .tabs-container {
                            flex-direction: column;
                        }
                    }

                    .tab-button {
                        flex: 1; /* 👈 TODOS EN UNA LÍNEA */
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        border-radius: 1.5rem;
                        font-size: 0.875rem;
                        border: none;
                        user-select: none;
                        padding: 0.25rem 0.75rem;
                        background-color: transparent;
                        color: #ffffff;
                        transition: background-color 0.3s ease, color 0.3s ease;
                        white-space: nowrap; /* 👈 evita salto de línea */
                    }

                    .tab-button.active {
                        background-color: #ffffff;
                        color: #ffffff;
                    }
                    .tab-button:focus {
                        outline: none;
                        box-shadow: 0 0 0 3px rgba(53, 55, 46, 0.3);
                    }
                    `}
                </style>

                <div className="tabs-container">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            className={`tab-button ${
                                activeTab === id ? "active" : ""
                            }`}
                            style={activeTab === id ? { color: "#000000" } : {}}
                            onClick={() => setActiveTab(id)}
                        >
                            <Icon style={{ width: "1rem", height: "1rem" }} />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="tab-content mt-4" id="perfilTabsContent">
                    {/* Datos Personales */}
                    {activeTab === "personal" && (
                        <div
                            className="tab-pane fade show active"
                            id="personal"
                            role="tabpanel"
                        >
                            <div
                                className="card bg-light border"
                                style={{
                                    borderRadius: "1rem ",
                                    border: "1px solid #000000",
                                }}
                            >
                                <div
                                    className="card-header d-flex justify-content-between align-items-center"
                                    style={{
                                        borderBottom: "none",
                                        borderRadius: "1rem 1rem 0 0",
                                        backgroundColor: " #000000",
                                        color: " #ffffff",
                                    }}
                                >
                                    <div>
                                        <h5
                                            className="mb-0"
                                            style={{
                                                fontSize: "14px",
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            Información Personal
                                        </h5>
                                        <small
                                            style={{
                                                color: " #ffffff",
                                                fontSize: "12px",
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            Actualiza tu información personal
                                            aquí
                                        </small>
                                    </div>
                                    {!isEditingPersonal ? (
                                        <button
                                            className="btn"
                                            onClick={() =>
                                                setIsEditingPersonal(true)
                                            }
                                            style={{
                                                backgroundColor: "#ffffff",
                                                color: "#000000",
                                                padding: "0.25rem 0.5rem", // menos padding arriba/abajo y a los lados
                                                fontSize: "0.75rem", // texto más pequeño
                                                borderRadius: "0.25rem", // menos redondeado si quieres
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.25rem",
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            <Edit
                                                size={14}
                                                style={{ color: "#000000" }}
                                            />
                                            Editar
                                        </button>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-info"
                                                onClick={(e) => guardarDatos(e)}
                                                style={{
                                                    padding: "0.25rem 0.5rem",
                                                    fontSize: "0.75rem",
                                                    borderRadius: "0.25rem",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.25rem",
                                                    backgroundColor: "#ffffff",
                                                    color: "#000000",
                                                    borderColor: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                }}
                                            >
                                                <Save size={14} />
                                                Guardar
                                            </button>

                                            <button
                                                className="btn btn-outline-secondary"
                                                onClick={() =>
                                                    setIsEditingPersonal(false)
                                                }
                                                style={{
                                                    padding: "0.25rem 0.5rem",
                                                    fontSize: "0.75rem",
                                                    borderRadius: "0.25rem",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.25rem",
                                                    backgroundColor: "#ffffff",
                                                    color: "#000000",
                                                    borderColor: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                }}
                                            >
                                                <X size={14} />
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div
                                    className="card-body"
                                    style={{
                                        backgroundColor: " #000000",
                                        borderRadius: "0 0 1rem 1rem",
                                    }}
                                >
                                    <div className="row g-3">
                                        {[
                                            {
                                                id: "nombre",
                                                label: "Nombre",
                                                type: "text",
                                            },
                                            {
                                                id: "apellidos",
                                                label: "Apellidos",
                                                type: "text",
                                            },
                                            {
                                                id: "dni",
                                                label: "DNI",
                                                type: "text",
                                            },
                                            {
                                                id: "telefono",
                                                label: "Teléfono",
                                                type: "text",
                                            },
                                            {
                                                id: "direccion",
                                                label: "Dirección",
                                                type: "text",
                                            },
                                        ].map((field) => (
                                            <div
                                                className="col-md-6"
                                                key={field.id}
                                            >
                                                <label
                                                    htmlFor={field.id}
                                                    className="form-label"
                                                    style={{
                                                        color: "#ffffff",
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {field.label}
                                                </label>
                                                <input
                                                    type={field.type}
                                                    id={field.id}
                                                    style={{
                                                        backgroundColor:
                                                            "#ffffff",
                                                        borderColor: "#ffffff",
                                                        height: "25px",
                                                        fontSize: "12px",
                                                    }}
                                                    className="form-control"
                                                    value={userData[field.id]}
                                                    onChange={(e) =>
                                                        setUserData({
                                                            ...userData,
                                                            [field.id]:
                                                                e.target.value,
                                                        })
                                                    }
                                                    disabled={
                                                        !isEditingPersonal
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cambiar Contraseña */}
                    {activeTab === "password" && (
                        <div
                            className="tab-pane fade mt-4 show active"
                            id="password"
                            role="tabpanel"
                        >
                            <div
                                className="card bg-light border"
                                style={{
                                    borderRadius: "1rem",
                                    border: "1px solid rgba(53, 55, 46, 0.1)",
                                }}
                            >
                                <div
                                    className="card-header"
                                    style={{
                                        borderBottom: "none",
                                        borderRadius: "1rem 1rem 0 0",
                                        backgroundColor: "#000000",
                                        color: "#ffffff",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <h5
                                        className="mb-0"
                                        style={{
                                            fontSize: "14px",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        Cambiar contraseña
                                    </h5>
                                    <small
                                        style={{
                                            color: "#ffffff",
                                            fontSize: "12px",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        Asegúrate de usar una contraseña segura
                                    </small>
                                </div>

                                <div
                                    className="card-body"
                                    style={{
                                        backgroundColor: "#000000",
                                        borderRadius: "0 0 1rem 1rem",
                                    }}
                                >
                                    <form onSubmit={cambiarContrasena}>
                                        {/* Contraseña Actual */}
                                        <div className="mb-3 position-relative">
                                            <label
                                                htmlFor="currentPassword"
                                                className="form-label"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                Contraseña actual
                                            </label>
                                            <input
                                                type={
                                                    showCurrent
                                                        ? "password"
                                                        : "text"
                                                }
                                                className="form-control"
                                                id="currentPassword"
                                                name="current"
                                                value={passwords.current}
                                                onChange={handlePasswordChange}
                                                required
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    borderColor: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                    fontSize: "12px",
                                                    height: "25px",
                                                    paddingRight: "2rem",
                                                }}
                                            />
                                            <span
                                                className="position-absolute top-50 end-0 translate-middle-y me-2"
                                                style={{
                                                    cursor: "pointer",
                                                    marginTop: "15px",
                                                    color: "#000000",
                                                }}
                                                onClick={() =>
                                                    setShowCurrent(!showCurrent)
                                                }
                                            >
                                                {showCurrent ? (
                                                    <EyeOff size={16} />
                                                ) : (
                                                    <Eye size={16} />
                                                )}
                                            </span>
                                        </div>

                                        {/* Nueva Contraseña */}
                                        <div className="mb-3 position-relative">
                                            <label
                                                htmlFor="newPassword"
                                                className="form-label"
                                                style={{
                                                    color: "#ffffff",
                                                    fontSize: "14px",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                }}
                                            >
                                                Nueva contraseña
                                            </label>
                                            <input
                                                type={
                                                    showNew
                                                        ? "password"
                                                        : "text"
                                                }
                                                className="form-control"
                                                id="newPassword"
                                                name="newPass"
                                                value={passwords.newPass}
                                                onChange={handlePasswordChange}
                                                required
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    borderColor: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                    fontSize: "12px",
                                                    height: "25px",
                                                    paddingRight: "2rem",
                                                }}
                                            />
                                            <span
                                                className="position-absolute top-50 end-0 translate-middle-y me-2"
                                                style={{
                                                    cursor: "pointer",
                                                    marginTop: "15px",
                                                    color: "#000000",
                                                }}
                                                onClick={() =>
                                                    setShowNew(!showNew)
                                                }
                                            >
                                                {showNew ? (
                                                    <EyeOff size={16} />
                                                ) : (
                                                    <Eye size={16} />
                                                )}
                                            </span>
                                        </div>

                                        {/* Confirmar Nueva Contraseña */}
                                        <div className="mb-4 position-relative">
                                            <label
                                                htmlFor="confirmPassword"
                                                className="form-label"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                Confirmar nueva contraseña
                                            </label>
                                            <input
                                                type={
                                                    showConfirm
                                                        ? "password"
                                                        : "text"
                                                }
                                                className="form-control"
                                                id="confirmPassword"
                                                name="confirm"
                                                value={passwords.confirm}
                                                onChange={handlePasswordChange}
                                                required
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    borderColor: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                    fontSize: "12px",
                                                    height: "25px",
                                                    paddingRight: "2rem",
                                                }}
                                            />
                                            <span
                                                className="position-absolute top-50 end-0 translate-middle-y me-2"
                                                style={{
                                                    cursor: "pointer",
                                                    marginTop: "15px",
                                                    color: "#000000",
                                                }}
                                                onClick={() =>
                                                    setShowConfirm(!showConfirm)
                                                }
                                            >
                                                {showConfirm ? (
                                                    <EyeOff size={16} />
                                                ) : (
                                                    <Eye size={16} />
                                                )}
                                            </span>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={
                                                passwords.newPass !==
                                                passwords.confirm
                                            }
                                            className="btn"
                                            style={{
                                                background: "#ffffff",
                                                color: "#000000",
                                                border: "none",
                                                fontFamily: "Inter, sans-serif",
                                                fontSize: "12px",
                                            }}
                                        >
                                            <div className="d-flex align-items-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="#000000"
                                                    className="bi bi-check-circle me-2"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 11.03a.75.75 0 0 0 1.07 0l3.992-3.992a.75.75 0 1 0-1.06-1.06L7.5 9.44 5.525 7.464a.75.75 0 0 0-1.06 1.06l2.5 2.506z" />
                                                </svg>
                                                Cambiar Contraseña
                                            </div>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mis Reservas */}
                    {activeTab === "reservations" && (
                        <div
                            className="tab-pane fade mt-4 show active"
                            id="reservations"
                            role="tabpanel"
                        >
                            <div
                                className="card bg-light border"
                                style={{
                                    borderRadius: "1rem",
                                    border: "1px solid rgba(53, 55, 46, 0.1)",
                                    backgroundColor: "#000000",
                                }}
                            >
                                <div
                                    className="card-header"
                                    style={{
                                        borderBottom: "none",
                                        borderRadius: "1rem 1rem 0 0",
                                        backgroundColor: "#000000",
                                        color: "#ffffff",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.25rem",
                                    }}
                                >
                                    <h5
                                        className="mb-0"
                                        style={{
                                            fontSize: "14px",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        Mis Reservas
                                    </h5>
                                    <small
                                        style={{
                                            fontSize: "12px",
                                            color: "#ffffff",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        Historial completo de tus reservas
                                    </small>
                                </div>
                                <div
                                    className="card-body"
                                    style={{
                                        backgroundColor: "#000000", // aquí cambio el blanco por beige para el cuerpo tb
                                        borderRadius: "0 0 1rem 1rem",
                                        padding: "1rem",
                                        overflowX: "auto",
                                        fontFamily: "Inter, sans-serif",
                                        fontSize: "12px",
                                    }}
                                >
                                    <table
                                        className="table table-hover align-middle"
                                        style={{
                                            minWidth: "700px",
                                            backgroundColor: " #ffffff", // tabla también beige
                                        }}
                                    >
                                        <thead>
                                            <tr
                                                style={{
                                                    borderColor:
                                                        "rgba(53, 55, 46, 0.2)",
                                                    backgroundColor: "#000000",
                                                }}
                                            >
                                                {[
                                                    "Nº Reserva",
                                                    "Experiencia",
                                                    "Fecha Reserva",
                                                    "Fecha Inicio",
                                                    "Fecha Fin",
                                                    "Nº Viajeros",
                                                    "Total",
                                                    "Factura",
                                                ].map((header) => (
                                                    <th
                                                        key={header}
                                                        style={{
                                                            color: "#ffffff",
                                                            borderBottom:
                                                                "2px solid #ffffff", // <-- línea beige
                                                        }}
                                                    >
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentReservations.map(
                                                (res, reservation, idx) => (
                                                    <tr
                                                        key={res.reserva_id}
                                                        style={{
                                                            borderColor:
                                                                " #ffffff",
                                                            backgroundColor:
                                                                idx % 2 === 0
                                                                    ? "  #000000"
                                                                    : "  #000000", // filas alternas beige y beige claro
                                                        }}
                                                    >
                                                        <td
                                                            className="fw-medium"
                                                            style={{
                                                                color: "#ffffff",
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {res.reserva_id}
                                                        </td>
                                                        <td
                                                            style={{
                                                                color: "#ffffff",
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {res.experiencia}
                                                        </td>
                                                        <td
                                                            style={{
                                                                color: "#ffffff",
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {res.fecha_reserva
                                                                ? new Date(
                                                                      res.fecha_reserva,
                                                                  ).toLocaleDateString()
                                                                : "-"}
                                                        </td>
                                                        <td
                                                            style={{
                                                                color: "#ffffff",
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {res.fecha_inicio
                                                                ? new Date(
                                                                      res.fecha_inicio,
                                                                  ).toLocaleDateString()
                                                                : "-"}
                                                        </td>
                                                        <td
                                                            style={{
                                                                color: "#ffffff",
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {res.fecha_fin
                                                                ? new Date(
                                                                      res.fecha_fin,
                                                                  ).toLocaleDateString()
                                                                : "-"}
                                                        </td>
                                                        
                                                        <td
                                                            style={{
                                                                color: "#ffffff",
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {res.num_personas}
                                                        </td>
                                                        <td
                                                            className="fw-medium"
                                                            style={{
                                                                color: "#ffffff",
                                                                fontFamily:
                                                                    "Inter, sans-serif",
                                                                fontSize:
                                                                    "12px",
                                                            }}
                                                        >
                                                            {res.total_precio} €
                                                        </td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    descargarFactura(
                                                                        res.reserva_id,
                                                                    )
                                                                }
                                                                className="btn btn-outline-warning btn-sm"
                                                                style={{
                                                                    borderColor:
                                                                        "#ffffff",
                                                                    color: "#ffffff",
                                                                    fontFamily:
                                                                        "Inter, sans-serif",
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="16"
                                                                    fill="currentColor"
                                                                    className="bi bi-download"
                                                                    viewBox="0 0 16 16"
                                                                >
                                                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3a.5.5 0 0 1 1 0v3a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-3a.5.5 0 0 1 .5-.5z" />
                                                                    <path d="M5.646 8.146a.5.5 0 0 1 .708 0L8 9.793V1.5a.5.5 0 0 1 1 0v8.293l1.646-1.647a.5.5 0 0 1 .708.708l-2.5 2.5a.5.5 0 0 1-.708 0l-2.5-2.5a.5.5 0 0 1 0-.708z" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                    {/* Controles de paginación */}
                                    <div className="d-flex justify-content-center align-items-center mt-3">
                                        <button
                                            className="btn btn-outline-light btn-sm me-2"
                                            disabled={currentPage === 1}
                                            onClick={() =>
                                                setCurrentPage(currentPage - 1)
                                            }
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                                fontSize: "12px",
                                            }}
                                        >
                                            &laquo; Anterior
                                        </button>

                                        <span
                                            style={{
                                                color: "#ffffff",
                                                fontFamily: "Inter, sans-serif",
                                                fontSize: "12px",
                                            }}
                                        >
                                            Página {currentPage} de {totalPages}
                                        </span>

                                        <button
                                            className="btn btn-outline-light btn-sm ms-2"
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            onClick={() =>
                                                setCurrentPage(currentPage + 1)
                                            }
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                                fontSize: "12px",
                                            }}
                                        >
                                            Siguiente &raquo;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mis Reseñas */}
                    {activeTab === "reviews" && (
                        <div
                            className="tab-pane fade mt-4 show active"
                            id="reviews"
                            role="tabpanel"
                        >
                            <div
                                className="card border"
                                style={{
                                    borderRadius: "1rem", // borde general redondeado
                                    border: "1px solid rgba(53, 55, 46, 0.1)", // borde suave
                                    backgroundColor: "#000000", // fondo claro
                                }}
                            >
                                <div
                                    className="card-header"
                                    style={{
                                        borderBottom: "none",
                                        borderRadius: "1rem 1rem 0 0", // solo esquinas superiores
                                        backgroundColor: "#000000",
                                        color: "#ffffff",
                                    }}
                                >
                                    <h5
                                        className="mb-0"
                                        style={{
                                            fontSize: "14px",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        Mis Reseñas
                                    </h5>
                                    <small
                                        style={{
                                            fontSize: "12px",
                                            color: "#ffffff",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        Valora tus experiencias pasadas
                                    </small>
                                </div>

                                <div
                                    className="card-body"
                                    style={{ backgroundColor: "#000000" }} // igual que el card
                                >
                                    {reviewsFiltradas.length === 0 ? (
                                        <p className="text-center text-white">
                                            No tienes reseñas pendientes ✨
                                        </p>
                                    ) : (
                                        <>
                                            {currentReviews.map((reserva) => {
                                                const urlImagen = `/storage/paquetes/portada/${reserva.paquete_id}/${reserva.foto}`;

                                                return (
                                                    <div
                                                        key={reserva.reserva_id}
                                                        className="mb-4 p-3 rounded d-flex align-items-center"
                                                        style={{
                                                            backgroundColor:
                                                                "#ffffff",
                                                            gap: "1rem",
                                                            borderRadius:
                                                                "0.75rem", // borde redondeado de cada tarjeta
                                                            border: "1px solid rgba(53, 55, 46, 0.1)",
                                                        }}
                                                    >
                                                        {/* Foto del paquete */}
                                                        <img
                                                            src={urlImagen}
                                                            alt={reserva.nombre}
                                                            style={{
                                                                width: "100px",
                                                                height: "100px",
                                                                objectFit:
                                                                    "cover",
                                                                borderRadius:
                                                                    "0.5rem",
                                                            }}
                                                        />

                                                        <div className="flex-grow-1">
                                                            {/* Nombre del paquete */}
                                                            <h6
                                                                style={{
                                                                    color: "#000000",
                                                                }}
                                                            >
                                                                {reserva.nombre}
                                                            </h6>

                                                            {/* Estrellas */}
                                                            <div className="d-flex mb-2">
                                                                {[
                                                                    1, 2, 3, 4,
                                                                    5,
                                                                ].map(
                                                                    (star) => (
                                                                        <Star
                                                                            key={
                                                                                star
                                                                            }
                                                                            size={
                                                                                20
                                                                            }
                                                                            onClick={() =>
                                                                                setReviewStars(
                                                                                    (
                                                                                        prev,
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        [reserva.reserva_id]:
                                                                                            star,
                                                                                    }),
                                                                                )
                                                                            }
                                                                            style={{
                                                                                cursor: "pointer",
                                                                                fill:
                                                                                    reviewStars[
                                                                                        reserva
                                                                                            .reserva_id
                                                                                    ] >=
                                                                                    star
                                                                                        ? "#efb66a"
                                                                                        : "transparent",
                                                                                color: "#efb66a",
                                                                            }}
                                                                        />
                                                                    ),
                                                                )}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    position:
                                                                        "relative",
                                                                }}
                                                            >
                                                                <textarea
                                                                    className="form-control mb-2"
                                                                    rows="3"
                                                                    placeholder="Escribe tu reseña..."
                                                                    maxLength={
                                                                        145
                                                                    }
                                                                    value={
                                                                        reviewText[
                                                                            reserva
                                                                                .reserva_id
                                                                        ] || ""
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setReviewText(
                                                                            (
                                                                                prev,
                                                                            ) => ({
                                                                                ...prev,
                                                                                [reserva.reserva_id]:
                                                                                    e.target.value.slice(
                                                                                        0,
                                                                                        145,
                                                                                    ),
                                                                            }),
                                                                        )
                                                                    }
                                                                    style={{
                                                                        paddingBottom:
                                                                            "1.8rem",
                                                                    }} // espacio para el contador
                                                                />

                                                                {/* Contador dentro del textarea */}
                                                                <small
                                                                    style={{
                                                                        position:
                                                                            "absolute",
                                                                        bottom: "8px",
                                                                        right: "12px",
                                                                        fontSize:
                                                                            "12px",
                                                                        color:
                                                                            (reviewText[
                                                                                reserva
                                                                                    .reserva_id
                                                                            ]
                                                                                ?.length ||
                                                                                0) >=
                                                                            145
                                                                                ? "red"
                                                                                : "#999",
                                                                        pointerEvents:
                                                                            "none",
                                                                    }}
                                                                >
                                                                    {reviewText[
                                                                        reserva
                                                                            .reserva_id
                                                                    ]?.length ||
                                                                        0}
                                                                    /145
                                                                </small>
                                                            </div>

                                                            <button
                                                                className="btn btn-sm"
                                                                style={{
                                                                    backgroundColor:
                                                                        "#000000",
                                                                    color: "#ffffff",
                                                                }}
                                                                onClick={() =>
                                                                    enviarResena(
                                                                        reserva,
                                                                    )
                                                                }
                                                                disabled={
                                                                    sendingReview
                                                                }
                                                            >
                                                                Enviar reseña
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* PAGINACIÓN */}
                                            {totalReviewPages > 1 && (
                                                <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                                                    <button
                                                        className="btn btn-outline-light btn-sm me-2"
                                                        disabled={
                                                            currentPageReviews ===
                                                            1
                                                        }
                                                        onClick={() =>
                                                            setCurrentPageReviews(
                                                                (p) => p - 1,
                                                            )
                                                        }
                                                        style={{
                                                            fontFamily:
                                                                "Inter, sans-serif",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        Anterior
                                                    </button>

                                                    <span
                                                        style={{
                                                            color: "#ffffff",
                                                            fontFamily:
                                                                "Inter, sans-serif",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        Página{" "}
                                                        {currentPageReviews} de{" "}
                                                        {totalReviewPages}
                                                    </span>

                                                    <button
                                                        className="btn btn-outline-light btn-sm ms-2"
                                                        disabled={
                                                            currentPageReviews ===
                                                            totalReviewPages
                                                        }
                                                        onClick={() =>
                                                            setCurrentPageReviews(
                                                                (p) => p + 1,
                                                            )
                                                        }
                                                        style={{
                                                            fontFamily:
                                                                "Inter, sans-serif",
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        Siguiente
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
            <br />
            <br />
        </div>
    );
}
