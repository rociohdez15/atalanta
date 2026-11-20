import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import MapaPuntos from "./mapas/MapaPuntos";
import ServiciosIncluidos from "./servicios/Servicios";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    HelpCircle,
    MapPin,
    Loader,
    Download,
} from "lucide-react";

// Ofertas que se agotan cuando no quedan plazas
const OFERTAS_CON_STOCK_LIMITADO = ["black_friday", "cyber_monday"];

const ExperienciaSola = () => {
    const { id } = useParams();

    const [paquete, setPaquete] = useState(null);
    const [puntosMapa, setPuntosMapa] = useState([]);
    const [itinerarios, setItinerarios] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [error, setError] = useState(null);

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // ============================================================
    // PANTALLA COMPLETA
    // ============================================================

    const [isFullscreen, setIsFullscreen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [reservaLoading, setReservaLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const baseUrl = `/storage/paquetes/${id}/images/`;

    // ============================================================
    // PDF ITINERARIO
    // ============================================================

    const pdfItinerarioUrl = paquete?.pdf_itinerario
        ? `/api/paquetes/${id}/itinerario-pdf`
        : null;

    // ============================================================
    // OFERTA AGOTADA (Black Friday / Cyber Monday sin plazas)
    // ============================================================

    const ofertaAgotada =
        OFERTAS_CON_STOCK_LIMITADO.includes(paquete?.oferta) &&
        paquete?.plazas <= 0;

    // ============================================================
    // CARGAR DATOS
    // ============================================================

    useEffect(() => {
        setLoading(true);

        const fetchPaquete = axios.get(`/api/paquetes/${id}`, {
            withCredentials: true,
        });

        const fetchImagenes = axios.get(`/api/paquetes/${id}/imagenes`, {
            withCredentials: true,
        });

        const fetchPuntos = axios.get(`/api/paquetes/${id}/puntos`, {
            withCredentials: true,
        });

        const fetchItinerarios = axios.get(
            `/api/paquetes/${id}/itinerarios`,
            {
                withCredentials: true,
            }
        );

        Promise.all([
            fetchPaquete,
            fetchImagenes,
            fetchPuntos,
            fetchItinerarios,
        ])
            .then(
                ([
                    resPaquete,
                    resImagenes,
                    resPuntos,
                    resItinerarios,
                ]) => {
                    setPaquete(resPaquete.data);
                    setImagenes(resImagenes.data);
                    setPuntosMapa(resPuntos.data);
                    setItinerarios(resItinerarios.data);
                    setSelectedImageIndex(0);
                    setError(null);
                }
            )
            .catch((err) => {
                console.error("Error cargando experiencia:", err);
                setError("No se pudieron cargar todos los datos");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    // ============================================================
    // SESIÓN
    // ============================================================

    useEffect(() => {
        axios
            .get("/api/check-session", {
                withCredentials: true,
            })
            .then(() => {
                setIsLoggedIn(true);
            })
            .catch(() => {
                setIsLoggedIn(false);
            });
    }, []);

    // ============================================================
    // IMAGEN ACTUAL
    // ============================================================

    const currentImg = imagenes[selectedImageIndex];

    const imgSrc = currentImg
        ? currentImg.ruta_imagen.startsWith("/storage")
            ? currentImg.ruta_imagen
            : `/storage/paquetes/${id}/images/${currentImg.ruta_imagen}`
        : "https://via.placeholder.com/900x600";

    // ============================================================
    // GALERÍA
    // ============================================================

    const imagenAnterior = () => {
        if (imagenes.length === 0) {
            return;
        }

        setSelectedImageIndex((prevIndex) => {
            return (
                (prevIndex - 1 + imagenes.length) %
                imagenes.length
            );
        });
    };

    const imagenSiguiente = () => {
        if (imagenes.length === 0) {
            return;
        }

        setSelectedImageIndex((prevIndex) => {
            return (prevIndex + 1) % imagenes.length;
        });
    };

    const abrirPantallaCompleta = () => {
        console.log("ABRIENDO PANTALLA COMPLETA");
        console.log("Imagen actual:", selectedImageIndex);
        console.log("Total imágenes:", imagenes.length);

        if (imagenes.length > 0) {
            setIsFullscreen(true);
        }
    };

    const cerrarPantallaCompleta = () => {
        console.log("CERRANDO PANTALLA COMPLETA");
        setIsFullscreen(false);
    };

    // ============================================================
    // TECLADO PANTALLA COMPLETA
    // ============================================================

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isFullscreen) {
                return;
            }

            if (e.key === "Escape") {
                e.preventDefault();
                setIsFullscreen(false);
            }

            if (e.key === "ArrowLeft") {
                e.preventDefault();

                setSelectedImageIndex((prevIndex) => {
                    return (
                        (prevIndex - 1 + imagenes.length) %
                        imagenes.length
                    );
                });
            }

            if (e.key === "ArrowRight") {
                e.preventDefault();

                setSelectedImageIndex((prevIndex) => {
                    return (prevIndex + 1) % imagenes.length;
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isFullscreen, imagenes.length]);

    // ============================================================
    // BLOQUEAR SCROLL CON PANTALLA COMPLETA
    // ============================================================

    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isFullscreen]);

    // ============================================================
    // JQUERY DÍAS
    // ============================================================

    useEffect(() => {
        $(".dia")
            .off("click")
            .on("click", function () {
                const target = $(this).data("target");
                $(target).slideToggle();
            });

        return () => {
            $(".dia").off("click");
        };
    }, [puntosMapa]);

    // ============================================================
    // COLLAPSE BOOTSTRAP
    // ============================================================

    useEffect(() => {
        puntosMapa.forEach((_, idx) => {
            const collapseEl = document.getElementById(
                `collapse-${idx}`
            );

            if (collapseEl) {
                $(collapseEl).on("show.bs.collapse", (e) => {
                    const arrow =
                        e.target.previousSibling?.querySelector(
                            ".transition-arrow svg"
                        );

                    if (arrow) {
                        arrow.style.transform = "rotate(180deg)";
                    }
                });

                $(collapseEl).on("hide.bs.collapse", (e) => {
                    const arrow =
                        e.target.previousSibling?.querySelector(
                            ".transition-arrow svg"
                        );

                    if (arrow) {
                        arrow.style.transform = "rotate(0deg)";
                    }
                });
            }
        });

        return () => {
            puntosMapa.forEach((_, idx) => {
                const collapseEl = document.getElementById(
                    `collapse-${idx}`
                );

                if (collapseEl) {
                    $(collapseEl).off(
                        "show.bs.collapse hide.bs.collapse"
                    );
                }
            });
        };
    }, [puntosMapa]);

    // ============================================================
    // RESERVA
    // ============================================================

    const handleReservaClick = async () => {
        // Oferta agotada: no se puede reservar
        if (ofertaAgotada) {
            return;
        }

        if (!isLoggedIn) {
            navigate("/login", {
                state: {
                    from: location,
                },
            });

            return;
        }

        setReservaLoading(true);

        setTimeout(() => {
            navigate(`/reservas/${paquete?.id}`);
        }, 50);
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    height: "100vh",
                }}
            >
                <Loader
                    size={64}
                    className="spin"
                    color="#000000"
                />
            </div>
        );
    }

    // ============================================================
    // RETURN
    // ============================================================

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        body {
                            font-family: 'Merriweather', serif;
                            margin: 0;
                        }

                        .bg-cover {
                            background-size: cover;
                            background-position: center;
                            background-repeat: no-repeat;
                            filter: brightness(75%);
                        }

                        .hero-container {
                            background-color: transparent !important;
                        }

                        .main-image {
                            transition: transform 0.3s ease;
                        }

                        .main-image:hover {
                            transform: scale(1.02);
                        }

                        .fullscreen-gallery {
                            animation: fullscreenFadeIn 0.2s ease;
                        }

                        @keyframes fullscreenFadeIn {
                            from {
                                opacity: 0;
                            }

                            to {
                                opacity: 1;
                            }
                        }

                        .fullscreen-image {
                            animation: fullscreenZoomIn 0.25s ease;
                        }

                        @keyframes fullscreenZoomIn {
                            from {
                                transform: scale(0.95);
                            }

                            to {
                                transform: scale(1);
                            }
                        }

                        .fullscreen-control:hover {
                            background-color: #FEDE59 !important;
                            color: #ffffff !important;
                        }

                        @media (max-width: 768px) {
                            .fullscreen-image {
                                max-width: 94vw !important;
                                max-height: 80vh !important;
                            }

                            .fullscreen-arrow {
                                width: 44px !important;
                                height: 44px !important;
                                font-size: 28px !important;
                            }

                            .fullscreen-left {
                                left: 10px !important;
                            }

                            .fullscreen-right {
                                right: 10px !important;
                            }

                            .fullscreen-close {
                                top: 10px !important;
                                right: 10px !important;
                            }

                            .fullscreen-info {
                                display: none !important;
                            }
                        }
                    `,
                }}
            />

            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="w-100 m-0 p-0">
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        duration: 0.8,
                    }}
                    className="position-relative overflow-hidden"
                    style={{
                        paddingTop: "5rem",
                        paddingBottom: "5rem",
                        background:
                            "linear-gradient(to right, #000000, #877c4f)",
                    }}
                >
                    <div className="position-absolute top-0 start-0 w-100 h-100">
                        <img
                            src={
                                paquete
                                    ? `/storage/paquetes/portada/${id}/${paquete.foto}`
                                    : "https://via.placeholder.com/1920x1080"
                            }
                            alt={
                                paquete
                                    ? paquete.nombre
                                    : "Imagen de paquete"
                            }
                            className="w-100 h-100"
                            style={{
                                objectFit: "cover",
                            }}
                        />

                        <div
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{
                                backgroundColor:
                                    "rgba(0, 0, 0, 0.4)",
                            }}
                        />
                    </div>

                    <section className="position-relative px-3 px-sm-4 px-lg-5">
                        <div
                            className="container position-relative"
                            style={{
                                zIndex: 2,
                                maxWidth: "1200px",
                            }}
                        >
                            {/* Volver */}
                            <button
                                type="button"
                                onClick={() =>
                                    (window.location.href =
                                        "/experiencias")
                                }
                                className="btn btn-link d-flex align-items-center mb-4"
                                style={{
                                    transition:
                                        "color 0.3s ease, background-color 0.3s ease",
                                    textDecoration: "none",
                                    boxShadow: "none",
                                    color: "#ffffff",
                                    fontFamily:
                                        "Inter, sans-serif",
                                    fontSize: "10pt",
                                    margin: 0,
                                    padding: "0.25rem 0.5rem",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color =
                                        "#ffffff";
                                    e.currentTarget.style.backgroundColor =
                                        "rgba(53, 55, 46, 0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color =
                                        "#ffffff";
                                    e.currentTarget.style.backgroundColor =
                                        "transparent";
                                }}
                            >
                                <ArrowLeft
                                    size={20}
                                    className="me-2"
                                />

                                Volver a Experiencias
                            </button>

                            <motion.div
                                initial={{
                                    y: 20,
                                    opacity: 0,
                                }}
                                animate={{
                                    y: 0,
                                    opacity: 1,
                                }}
                                transition={{
                                    duration: 0.8,
                                    delay: 0.2,
                                }}
                                className="row align-items-center g-3"
                            >
                                {/* Información */}
                                <div className="col-lg-8">
                                    <span
                                        className="badge mb-2"
                                        style={{
                                            backgroundColor:
                                                "#ffffff",
                                            color: "#000000",
                                            fontFamily:
                                                "'Inter', sans-serif",
                                            fontSize: "0.7rem",
                                        }}
                                    >
                                        {paquete
                                            ? paquete.tipo_viaje
                                            : "Cargando..."}
                                    </span>

                                    <br />

                                    <h1
                                        className="fw-bold mb-3"
                                        style={{
                                            color: "#ffffff",
                                            fontFamily:
                                                '"TT Espina Trial Variable", sans-serif',
                                            fontSize: "2rem",
                                            transform:
                                                "scaleX(1.5)",
                                            display:
                                                "inline-block",
                                            transformOrigin:
                                                "left center",
                                        }}
                                    >
                                        {paquete
                                            ? paquete.nombre
                                            : "Cargando..."}
                                    </h1>

                                    <div
                                        className="d-flex flex-wrap align-items-center gap-2 mb-3"
                                        style={{
                                            color: "#ffffff",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <MapPin
                                                size={16}
                                                className="me-1"
                                            />

                                            <span
                                                style={{
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                    fontSize:
                                                        "1rem",
                                                }}
                                            >
                                                {paquete
                                                    ? paquete.lugar
                                                    : "Cargando..."}
                                            </span>
                                        </div>

                                        <div className="d-flex align-items-center">
                                            <Calendar
                                                size={16}
                                                className="me-1"
                                            />

                                            <span
                                                style={{
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                    fontSize:
                                                        "1rem",
                                                }}
                                            >
                                                {(() => {
                                                    if (
                                                        !paquete?.fecha_inicio ||
                                                        !paquete?.fecha_fin
                                                    ) {
                                                        return "Cargando...";
                                                    }

                                                    const inicio =
                                                        new Date(
                                                            paquete.fecha_inicio
                                                        );

                                                    const fin =
                                                        new Date(
                                                            paquete.fecha_fin
                                                        );

                                                    const diaInicio =
                                                        inicio.getDate();

                                                    const diaFin =
                                                        fin.getDate();

                                                    const mesInicio =
                                                        inicio.toLocaleDateString(
                                                            "es-ES",
                                                            {
                                                                month: "long",
                                                            }
                                                        );

                                                    const mesFin =
                                                        fin.toLocaleDateString(
                                                            "es-ES",
                                                            {
                                                                month: "long",
                                                            }
                                                        );

                                                    const añoInicio =
                                                        inicio.getFullYear();

                                                    const añoFin =
                                                        fin.getFullYear();

                                                    if (
                                                        mesInicio ===
                                                            mesFin &&
                                                        añoInicio ===
                                                            añoFin
                                                    ) {
                                                        return `${diaInicio} al ${diaFin} de ${mesFin} de ${añoFin}`;
                                                    }

                                                    if (
                                                        añoInicio ===
                                                        añoFin
                                                    ) {
                                                        return `${diaInicio} de ${mesInicio} al ${diaFin} de ${mesFin} de ${añoFin}`;
                                                    }

                                                    return `${diaInicio} de ${mesInicio} de ${añoInicio} al ${diaFin} de ${mesFin} de ${añoFin}`;
                                                })()}
                                            </span>
                                        </div>
                                    </div>

                                    <p
                                        style={{
                                            color: "#ffffff",
                                            maxWidth: "600px",
                                            fontFamily:
                                                "'Inter', sans-serif",
                                            fontSize: "1rem",
                                        }}
                                    >
                                        {paquete
                                            ? paquete.descripcion
                                            : "Cargando..."}
                                    </p>
                                </div>

                                {/* Precio */}
                                <div className="col-lg-4">
                                    <div
                                        className="card border-0 shadow-sm"
                                        style={{
                                            backgroundColor:
                                                "#ffffff",
                                            backdropFilter:
                                                "blur(4px)",
                                            border: "1px solid rgba(233,218,182,0.3)",
                                            borderRadius:
                                                "1rem",
                                        }}
                                    >
                                        <br />

                                        <div className="card-header bg-transparent text-center border-0 pb-2">
                                            <div className="d-flex flex-column align-items-center justify-content-center">
                                                <p
                                                    style={{
                                                        color: "#000000",
                                                        fontSize:
                                                            "0.8rem",
                                                        margin: 0,
                                                        fontFamily:
                                                            "'Inter', sans-serif",
                                                    }}
                                                >
                                                    Desde
                                                </p>

                                                <span
                                                    style={{
                                                        fontSize:
                                                            "1.5rem",
                                                        fontWeight:
                                                            "bold",
                                                        color: "#000000",
                                                        fontFamily:
                                                            "'Inter', sans-serif",
                                                        lineHeight:
                                                            "1.2",
                                                    }}
                                                >
                                                    {paquete
                                                        ? paquete.precio
                                                        : "Cargando..."}{" "}
                                                    €
                                                </span>
                                            </div>

                                            <p
                                                style={{
                                                    color: "#000000",
                                                    fontSize:
                                                        "0.8rem",
                                                    marginTop:
                                                        "0.5rem",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                }}
                                            >
                                                por persona
                                            </p>
                                        </div>

                                        <div className="card-body">
                                            <button
                                                className="btn w-100 mb-2 d-flex align-items-center justify-content-center"
                                                style={{
                                                    background:
                                                        "#000000",
                                                    color: "#ffffff",
                                                    fontSize:
                                                        "0.9rem",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                    border: "none",
                                                    opacity:
                                                        ofertaAgotada
                                                            ? 0.5
                                                            : 1,
                                                    cursor:
                                                        ofertaAgotada
                                                            ? "not-allowed"
                                                            : "pointer",
                                                }}
                                                onClick={
                                                    handleReservaClick
                                                }
                                                disabled={
                                                    reservaLoading ||
                                                    ofertaAgotada
                                                }
                                            >
                                                {reservaLoading ? (
                                                    <Loader
                                                        size={16}
                                                        className="spin me-2"
                                                        color="#ffffff"
                                                    />
                                                ) : (
                                                    <CreditCard
                                                        size={16}
                                                        className="me-1"
                                                    />
                                                )}

                                                {reservaLoading
                                                    ? "Cargando..."
                                                    : ofertaAgotada
                                                      ? "No disponible"
                                                      : "Reservar ahora"}
                                            </button>

                                            <Link
                                                to="/faq"
                                                className="w-100"
                                                style={{
                                                    display:
                                                        "inline-flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    padding:
                                                        "0.375rem 0.75rem",
                                                    fontSize:
                                                        "0.9rem",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                    fontWeight: 500,
                                                    color: "#000000",
                                                    border: "1px solid #000000",
                                                    borderRadius:
                                                        "0.25rem",
                                                    backgroundColor:
                                                        "transparent",
                                                    textDecoration:
                                                        "none",
                                                    transition:
                                                        "all 0.3s",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                        "#000000";
                                                    e.currentTarget.style.color =
                                                        "#ffffff";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor =
                                                        "transparent";
                                                    e.currentTarget.style.color =
                                                        "#000000";
                                                }}
                                            >
                                                <HelpCircle
                                                    size={16}
                                                    className="me-1"
                                                />

                                                Preguntas frecuentes
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                </motion.div>

                {/* =====================================================
                    ITINERARIO
                ===================================================== */}

                <motion.section
                    initial={{
                        opacity: 0,
                        y: 30,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.8,
                        delay: 0.3,
                    }}
                >
                    <div
                        className="container py-5"
                        style={{
                            maxWidth: "900px",
                        }}
                    >
                        <h2
                            className="text-center fw-bold mb-4"
                            style={{
                                color: "#000000",
                                fontSize: "2rem",
                                fontFamily:
                                    "Inter, sans-serif",
                            }}
                        >
                            Itinerario Detallado
                        </h2>

                        <div className="row g-4">
                            {/* Itinerario */}
                            <div className="col-12 col-md-6">
                                <div
                                    className="card h-100"
                                    style={{
                                        backgroundColor:
                                            "#000000",
                                        border: "1px solid #000000",
                                        borderRadius:
                                            "1rem",
                                    }}
                                >
                                    <div className="card-header bg-transparent border-0">
                                        <h5
                                            className="card-title mb-1 d-flex align-items-center"
                                            style={{
                                                color: "#ffffff",
                                                fontSize:
                                                    "16px",
                                                fontFamily:
                                                    "Inter, sans-serif",
                                            }}
                                        >
                                            <Calendar
                                                size={20}
                                                className="me-2"
                                            />

                                            Días de tu aventura
                                        </h5>

                                        <p
                                            className="mb-0"
                                            style={{
                                                fontFamily:
                                                    "'Inter', sans-serif",
                                                fontSize:
                                                    "14px",
                                                color: "#ffffff",
                                                marginTop:
                                                    "0rem",
                                            }}
                                        >
                                            Haz clic en cada día
                                            para ver los detalles
                                            completos
                                        </p>
                                    </div>

                                    <div className="card-body">
                                        <div
                                            className="accordion"
                                            id="accordionItinerary"
                                        >
                                            {puntosMapa.map(
                                                (p, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="mb-3"
                                                        style={{
                                                            borderBottom:
                                                                "1px solid #ffffff",
                                                        }}
                                                    >
                                                        <button
                                                            className="btn w-100 text-start d-flex align-items-center justify-content-between"
                                                            type="button"
                                                            data-bs-toggle="collapse"
                                                            data-bs-target={`#collapse-${idx}`}
                                                            aria-expanded="false"
                                                            aria-controls={`collapse-${idx}`}
                                                            style={{
                                                                backgroundColor:
                                                                    "transparent",
                                                                border: "none",
                                                                color: "#ffffff",
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            <div
                                                                className="d-flex align-items-center"
                                                                style={{
                                                                    fontFamily:
                                                                        "'Inter', sans-serif",
                                                                    fontSize:
                                                                        "14px",
                                                                }}
                                                            >
                                                                <span
                                                                    className="badge me-3"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#ffffff",
                                                                        color: "#000000",
                                                                        fontFamily:
                                                                            "'Inter', sans-serif",
                                                                    }}
                                                                >
                                                                    Día{" "}
                                                                    {itinerarios[
                                                                        idx
                                                                    ]
                                                                        ?.dia ||
                                                                        idx +
                                                                            1}
                                                                </span>

                                                                {p.nombre ||
                                                                    `Punto ${
                                                                        idx +
                                                                        1
                                                                    }`}
                                                            </div>

                                                            <span
                                                                className="transition-arrow"
                                                                style={{
                                                                    display:
                                                                        "inline-block",
                                                                    transition:
                                                                        "transform 0.3s",
                                                                }}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="16"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="#ffffff"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <polyline points="6 9 12 15 18 9" />
                                                                </svg>
                                                            </span>
                                                        </button>

                                                        <div
                                                            className="collapse"
                                                            id={`collapse-${idx}`}
                                                        >
                                                            <div className="pt-3">
                                                                <div
                                                                    className="d-flex align-items-center small mb-2"
                                                                    style={{
                                                                        fontFamily:
                                                                            "'Inter', sans-serif",
                                                                        fontSize:
                                                                            "14px",
                                                                        paddingLeft:
                                                                            "0.7rem",
                                                                        color: "#ffffff",
                                                                    }}
                                                                >
                                                                    <MapPin
                                                                        size={
                                                                            20
                                                                        }
                                                                        className="me-2"
                                                                        style={{
                                                                            color: "#ffffff",
                                                                        }}
                                                                    />

                                                                    {p.descripcion ||
                                                                        `Punto ${
                                                                            idx +
                                                                            1
                                                                        }`}
                                                                </div>

                                                                <p
                                                                    style={{
                                                                        color: "#ffffff",
                                                                        lineHeight:
                                                                            "1.6",
                                                                        paddingLeft:
                                                                            "1rem",
                                                                        marginLeft:
                                                                            "1rem",
                                                                        borderLeft:
                                                                            "2px solid #ffffff",
                                                                        fontFamily:
                                                                            "'Inter', sans-serif",
                                                                        fontSize:
                                                                            "14px",
                                                                    }}
                                                                >
                                                                    {itinerarios[
                                                                        idx
                                                                    ]
                                                                        ?.descripcion ||
                                                                        "Sin descripción disponible"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mapa */}
                            <div className="col-12 col-md-6">
                                <div
                                    className="card h-100"
                                    style={{
                                        border: "1px solid #000000",
                                        borderRadius:
                                            "1rem",
                                        backgroundColor:
                                            "#000000",
                                    }}
                                >
                                    <div className="card-header border-bottom-0">
                                        <h5
                                            className="card-title d-flex align-items-center mb-1"
                                            style={{
                                                color: "#ffffff",
                                                fontSize:
                                                    "16px",
                                                fontFamily:
                                                    "Inter, sans-serif",
                                            }}
                                        >
                                            <span className="me-2">
                                                <i className="bi bi-geo-alt-fill" />
                                            </span>

                                            Tu ruta de aventura
                                        </h5>

                                        <p
                                            className="mb-0"
                                            style={{
                                                fontFamily:
                                                    "'Inter', sans-serif",
                                                fontSize:
                                                    "14px",
                                                color: "#ffffff",
                                                marginTop:
                                                    "0rem",
                                            }}
                                        >
                                            Explora todos los puntos
                                            que visitarás durante tu
                                            experiencia
                                        </p>
                                    </div>

                                    <div className="card-body">
                                        <div
                                            className="rounded overflow-hidden"
                                            style={{
                                                height: "400px",
                                            }}
                                        >
                                            <MapaPuntos
                                                puntos={puntosMapa}
                                            />
                                        </div>

                                        <div className="mt-3 text-center">
                                            <span
                                                className="badge rounded-pill"
                                                style={{
                                                    backgroundColor:
                                                        "#ffffff",
                                                    fontFamily:
                                                        "'Inter', sans-serif",
                                                    fontSize:
                                                        "12px",
                                                    color: "#000000",
                                                }}
                                            >
                                                {puntosMapa.length}{" "}
                                                ubicaciones únicas
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PDF */}
                        {pdfItinerarioUrl && (
                            <div className="text-center mt-4">
                                <a
                                    href={pdfItinerarioUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn d-inline-flex align-items-center"
                                    style={{
                                        backgroundColor:
                                            "#000000",
                                        color: "#ffffff",
                                        fontFamily:
                                            "'Inter', sans-serif",
                                        fontSize: "0.95rem",
                                        border: "none",
                                        borderRadius:
                                            "0.5rem",
                                        padding:
                                            "0.6rem 1.5rem",
                                        textDecoration:
                                            "none",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#FEDE59";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#000000";
                                    }}
                                >
                                    <Download
                                        size={18}
                                        className="me-2"
                                    />

                                    Itinerario Detallado
                                    Descargable
                                </a>
                            </div>
                        )}
                    </div>
                </motion.section>

                {/* =====================================================
                    GALERÍA
                ===================================================== */}

                <motion.section
                    initial={{
                        opacity: 0,
                        y: 30,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.8,
                        delay: 0.4,
                    }}
                    className="mb-16 container"
                    style={{
                        maxWidth: "900px",
                    }}
                >
                    <h2
                        className="text-center fw-bold mb-4"
                        style={{
                            color: "#000000",
                            fontSize: "2rem",
                            fontFamily:
                                "Inter, sans-serif",
                        }}
                    >
                        Galería de la experiencia
                    </h2>

                    <div>
                        {/* =================================================
                            IMAGEN PRINCIPAL
                        ================================================= */}

                        <div
                            className="position-relative mb-4 overflow-hidden rounded-3"
                            style={{
                                width: "100%",
                                margin: "0 auto",
                                backgroundColor: "#eeeeee",
                            }}
                        >
                            {imagenes.length > 0 && (
                                <img
                                    src={imgSrc}
                                    alt={`Imagen ${
                                        selectedImageIndex + 1
                                    }`}
                                    className="w-100 main-image"
                                    onClick={
                                        abrirPantallaCompleta
                                    }
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        height: "500px",
                                        objectFit: "cover",
                                        cursor: "zoom-in",
                                    }}
                                />
                            )}

                            {imagenes.length > 0 && (
                                <>
                                    {/* =================================================
                                        BOTÓN ANTERIOR
                                    ================================================= */}

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            imagenAnterior();
                                        }}
                                        className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius:
                                                "50%",
                                            opacity: 0.9,
                                            zIndex: 10,
                                            fontSize:
                                                "28px",
                                            padding: 0,
                                        }}
                                        aria-label="Imagen anterior"
                                    >
                                        &#8249;
                                    </button>

                                    {/* =================================================
                                        BOTÓN SIGUIENTE
                                    ================================================= */}

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            imagenSiguiente();
                                        }}
                                        className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius:
                                                "50%",
                                            opacity: 0.9,
                                            zIndex: 10,
                                            fontSize:
                                                "28px",
                                            padding: 0,
                                        }}
                                        aria-label="Imagen siguiente"
                                    >
                                        &#8250;
                                    </button>

                                    {/* =================================================
                                        CONTADOR
                                    ================================================= */}

                                    <div
                                        className="position-absolute top-0 end-0 bg-dark text-light px-3 py-1 rounded m-3"
                                        style={{
                                            zIndex: 10,
                                            fontFamily:
                                                "'Inter', sans-serif",
                                        }}
                                    >
                                        {selectedImageIndex +
                                            1}{" "}
                                        / {imagenes.length}
                                    </div>

                                    {/* =================================================
                                        BOTÓN PANTALLA COMPLETA
                                    ================================================= */}

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();

                                            console.log(
                                                "CLICK EN VER PANTALLA COMPLETA"
                                            );

                                            abrirPantallaCompleta();
                                        }}
                                        className="btn position-absolute bottom-0 end-0 m-3 d-flex align-items-center gap-2"
                                        style={{
                                            backgroundColor:
                                                "rgba(0, 0, 0, 0.8)",
                                            color: "#ffffff",
                                            border: "none",
                                            borderRadius:
                                                "0.5rem",
                                            padding:
                                                "0.65rem 1rem",
                                            fontFamily:
                                                "'Inter', sans-serif",
                                            fontSize:
                                                "0.85rem",
                                            fontWeight: 500,
                                            zIndex: 20,
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                "#FEDE59";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                                "rgba(0, 0, 0, 0.8)";
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize:
                                                    "1.2rem",
                                                lineHeight: 1,
                                            }}
                                        >
                                            ⛶
                                        </span>

                                        Ver en pantalla
                                        completa
                                    </button>
                                </>
                            )}
                        </div>

                        {/* =================================================
                            THUMBNAILS
                        ================================================= */}

                        <div className="row g-2">
                            {imagenes.map((img, index) => (
                                <div
                                    key={index}
                                    className="col-4 col-md-2 position-relative"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedImageIndex(
                                                index
                                            )
                                        }
                                        className="position-relative w-100 p-0 border-0 rounded overflow-hidden"
                                        style={{
                                            aspectRatio: "1/1",
                                            backgroundColor:
                                                "transparent",
                                        }}
                                    >
                                        <img
                                            src={
                                                img.ruta_imagen.startsWith(
                                                    "/storage"
                                                )
                                                    ? img.ruta_imagen
                                                    : `${baseUrl}${img.ruta_imagen}`
                                            }
                                            alt={`Thumbnail ${
                                                index + 1
                                            }`}
                                            className="w-100 h-100 object-fit-cover rounded-2"
                                            style={{
                                                borderRadius:
                                                    "0.5rem",
                                                border:
                                                    selectedImageIndex ===
                                                    index
                                                        ? "7px solid #FEDE59"
                                                        : "none",
                                            }}
                                        />

                                        {selectedImageIndex ===
                                            index && (
                                            <div
                                                className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    borderRadius:
                                                        "50%",
                                                    backgroundColor:
                                                        "#ffffff",
                                                    color: "#FEDE59",
                                                    fontSize:
                                                        "1rem",
                                                    fontWeight:
                                                        "bold",
                                                    pointerEvents:
                                                        "none",
                                                }}
                                            >
                                                &#10003;
                                            </div>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <ServiciosIncluidos paqueteId={id} />

                    <br />
                    <br />
                </motion.section>

                {/* =====================================================
                    ⭐ VISOR PANTALLA COMPLETA
                ===================================================== */}

                {isFullscreen && imagenes.length > 0 && (
                    <div
                        className="fullscreen-gallery position-fixed top-0 start-0 w-100 h-100"
                        style={{
                            backgroundColor:
                                "rgba(0, 0, 0, 0.97)",
                            zIndex: 999999,
                        }}
                        onClick={cerrarPantallaCompleta}
                    >
                        {/* =================================================
                            CONTADOR
                        ================================================= */}

                        <div
                            className="position-absolute top-0 start-50 translate-middle-x"
                            style={{
                                color: "#ffffff",
                                fontFamily:
                                    "'Inter', sans-serif",
                                fontSize: "16px",
                                padding: "20px",
                                zIndex: 1000002,
                            }}
                        >
                            {selectedImageIndex + 1} /{" "}
                            {imagenes.length}
                        </div>

                        {/* =================================================
                            CERRAR
                        ================================================= */}

                        <button
                            type="button"
                            className="fullscreen-control fullscreen-close"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                cerrarPantallaCompleta();
                            }}
                            style={{
                                position: "absolute",
                                top: "20px",
                                right: "20px",
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                border: "none",
                                backgroundColor:
                                    "#ffffff",
                                color: "#000000",
                                fontSize: "32px",
                                lineHeight: "1",
                                zIndex: 1000002,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            aria-label="Cerrar"
                        >
                            ×
                        </button>

                        {/* =================================================
                            ANTERIOR
                        ================================================= */}

                        <button
                            type="button"
                            className="fullscreen-control fullscreen-arrow fullscreen-left"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                imagenAnterior();
                            }}
                            style={{
                                position: "absolute",
                                left: "25px",
                                top: "50%",
                                transform:
                                    "translateY(-50%)",
                                width: "58px",
                                height: "58px",
                                borderRadius: "50%",
                                border: "none",
                                backgroundColor:
                                    "#ffffff",
                                color: "#000000",
                                fontSize: "38px",
                                lineHeight: "1",
                                zIndex: 1000002,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            aria-label="Imagen anterior"
                        >
                            ‹
                        </button>

                        {/* =================================================
                            IMAGEN
                        ================================================= */}

                        <div
                            className="position-absolute top-50 start-50 translate-middle"
                            style={{
                                width: "90vw",
                                height: "90vh",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1000000,
                            }}
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            <img
                                key={selectedImageIndex}
                                src={imgSrc}
                                alt={`Imagen ${
                                    selectedImageIndex +
                                    1
                                }`}
                                className="fullscreen-image"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    width: "auto",
                                    height: "auto",
                                    objectFit: "contain",
                                    display: "block",
                                    borderRadius:
                                        "8px",
                                    userSelect: "none",
                                }}
                            />
                        </div>

                        {/* =================================================
                            SIGUIENTE
                        ================================================= */}

                        <button
                            type="button"
                            className="fullscreen-control fullscreen-arrow fullscreen-right"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                imagenSiguiente();
                            }}
                            style={{
                                position: "absolute",
                                right: "25px",
                                top: "50%",
                                transform:
                                    "translateY(-50%)",
                                width: "58px",
                                height: "58px",
                                borderRadius: "50%",
                                border: "none",
                                backgroundColor:
                                    "#ffffff",
                                color: "#000000",
                                fontSize: "38px",
                                lineHeight: "1",
                                zIndex: 1000002,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            aria-label="Imagen siguiente"
                        >
                            ›
                        </button>

                        {/* =================================================
                            AYUDA
                        ================================================= */}

                        <div
                            className="fullscreen-info position-absolute bottom-0 start-50 translate-middle-x mb-3"
                            style={{
                                color: "rgba(255,255,255,0.85)",
                                fontFamily:
                                    "'Inter', sans-serif",
                                fontSize: "13px",
                                zIndex: 1000002,
                                textAlign: "center",
                                backgroundColor:
                                    "rgba(0,0,0,0.5)",
                                padding:
                                    "7px 14px",
                                borderRadius:
                                    "20px",
                            }}
                        >
                            ← → para cambiar de imagen
                            &nbsp;&nbsp;·&nbsp;&nbsp;
                            ESC para cerrar
                        </div>
                    </div>
                )}
            </section>
        </>
    );
};

export default ExperienciaSola;