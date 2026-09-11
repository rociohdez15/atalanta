import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Loader,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import ExperienciaFilter from "./ExperienciaFilter";
import OfertaFilter from "./OfertaFilter";

const Experiencia = () => {
    const [imagenes, setImagenes] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);

    const tamañoPagina = 6;

    const [loading, setLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState({});

    // FILTRO DE CATEGORÍA
    const [filtro, setFiltro] = useState("todas");

    // FILTRO DE OFERTA
    const [filtroOferta, setFiltroOferta] = useState("sin_oferta");

    const [isMobile, setIsMobile] = useState(false);

    const { search } = useLocation();

    /* =========================================================
       FILTROS DESDE LA URL
    ========================================================= */

    useEffect(() => {
        const params = new URLSearchParams(search);

        const filtroURL = params.get("filtro");
        const ofertaURL = params.get("oferta");

        setFiltro(filtroURL || "todas");
        setFiltroOferta(ofertaURL || "sin_oferta");

        setPagina(0);
    }, [search]);

    /* =========================================================
       CARGAR PAQUETES
    ========================================================= */

    useEffect(() => {
        let cancelado = false;

        setLoading(true);

        const params = new URLSearchParams();

        params.append("page", pagina);
        params.append("size", tamañoPagina);

        // FILTRO DE CATEGORÍA
        if (filtro && filtro !== "todas") {
            params.append("tipo_viaje", filtro);
        }

        // FILTRO DE OFERTA
        if (filtroOferta && filtroOferta !== "todas") {
            params.append("oferta", filtroOferta);
        }

        axios
            .get(`/api/paquetes?${params.toString()}`)
            .then((res) => {
                if (cancelado) return;

                const data = res.data;

                const paquetes = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.content)
                      ? data.content
                      : Array.isArray(data?.data)
                        ? data.data
                        : [];

                setImagenes(paquetes);

                setTotalPaginas(data?.totalPages || data?.last_page || 0);

                setLoadedImages({});
            })
            .catch((error) => {
                if (cancelado) return;

                console.error("Error cargando experiencias:", error);

                setImagenes([]);
                setTotalPaginas(0);
            })
            .finally(() => {
                if (!cancelado) {
                    setLoading(false);
                }
            });

        return () => {
            cancelado = true;
        };
    }, [pagina, filtro, filtroOferta]);

    /* =========================================================
       DETECTAR MÓVIL
    ========================================================= */

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    /* =========================================================
       NOMBRE DE LA OFERTA
    ========================================================= */

    const getNombreOferta = (oferta) => {
        if (!oferta) return "";

        switch (oferta) {
            case "navidad":
                return "Navidad";

            case "verano":
                return "Verano";

            case "san_valentin":
                return "San Valentín";

            case "black_friday":
                return "Black Friday";

            case "cyber_monday":
                return "Cyber Monday";

            case "bajada_precio":
                return "Bajada de precio";

            default:
                return oferta;
        }
    };

    /* =========================================================
       FILTRAR EXPERIENCIAS
    ========================================================= */

    const experienciasFiltradas = imagenes.filter((img) => {
        /* =====================================================
           FILTRO CATEGORÍA
        ===================================================== */

        if (filtro !== "todas" && img.tipo_viaje !== filtro) {
            return false;
        }

        /* =====================================================
           FILTRO OFERTA
        ===================================================== */

        if (filtroOferta === "sin_oferta") {
            return !img.oferta;
        }

        if (filtroOferta !== "todas") {
            if (img.oferta !== filtroOferta) {
                return false;
            }
        }

        /* =====================================================
           COMPROBAR FECHAS DE LA OFERTA
        ===================================================== */

        if (img.oferta) {
            if (!img.oferta_inicio || !img.oferta_fin) {
                return false;
            }

            const ahora = new Date();

            const inicio = new Date(img.oferta_inicio);

            const fin = new Date(img.oferta_fin);

            // La oferta todavía no ha comenzado
            if (ahora < inicio) {
                return false;
            }

            // La oferta ya ha terminado
            if (ahora > fin) {
                return false;
            }
        }

        return true;
    });

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    height: "100vh",
                }}
            >
                <Loader size={64} className="spin" color="#000000" />
            </div>
        );
    }

    return (
        <>
            {/* =====================================================
                HERO
            ===================================================== */}

            <section
                className="position-relative d-flex align-items-center overflow-hidden"
                style={{
                    minHeight: "60vh",
                }}
            >
                <div className="position-absolute top-0 start-0 w-100 h-100">
                    <img
                        src="/images/fondo2.jpg"
                        alt="Paisaje de viaje"
                        className="w-100 h-100"
                        style={{
                            objectFit: "cover",
                        }}
                        loading="eager"
                    />

                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                            backgroundColor: "rgba(0, 0, 0, 0.4)",
                        }}
                    ></div>
                </div>

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
                    className="container position-relative text-center"
                    style={{
                        zIndex: 1,
                    }}
                >
                    {/* BOTÓN VOLVER */}

                    <button
                        type="button"
                        onClick={() => (window.location.href = "/")}
                        className="btn btn-link d-flex align-items-center mb-4"
                        style={{
                            transition:
                                "color 0.3s ease, background-color 0.3s ease",
                            textDecoration: "none",
                            boxShadow: "none",
                            color: "#ffffff",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "10pt",
                            padding: "0.25rem 0.5rem",
                            width: "fit-content",
                            marginTop: isMobile ? "5.5rem" : "4rem",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#ffffff";

                            e.currentTarget.style.backgroundColor =
                                "rgba(53, 55, 46, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#ffffff";

                            e.currentTarget.style.backgroundColor =
                                "transparent";
                        }}
                    >
                        <ArrowLeft size={20} className="me-2" />
                        Volver al inicio
                    </button>

                    <br />

                    {/* TÍTULO */}

                    <h1
                        className="fw-bold"
                        style={{
                            color: "#ffffff",
                            fontFamily:
                                '"TT Espina Trial Variable", sans-serif',
                            fontSize: "clamp(2rem, 5vw, 4rem)",
                            transform: "scaleX(1.5)",
                            display: "inline-block",
                        }}
                    >
                        Experiencias
                    </h1>

                    {/* DESCRIPCIÓN */}

                    <p
                        className="lead mx-auto"
                        style={{
                            maxWidth: "720px",
                            fontSize: "14pt",
                            color: "#ffffff",
                        }}
                    >
                        Descubre aventuras extraordinarias que transformarán tu
                        manera de ver el mundo. Cada viaje es una historia
                        esperando ser vivida.
                    </p>
                </motion.div>
            </section>

            {/* =====================================================
                SECCIÓN CARDS
            ===================================================== */}

            <div className="container-lg px-4 py-5">
                {/* =================================================
                    FILTROS
                ================================================= */}

                <div
                    className="
                        d-flex
                        flex-column
                        flex-md-row
                        justify-content-center
                        align-items-center
                        gap-3
                        mb-5
                    "
                >
                    {/* FILTRO CATEGORÍA */}

                    <ExperienciaFilter
                        selected={filtro}
                        onChange={(valor) => {
                            setFiltro(valor);
                            setPagina(0);
                        }}
                    />

                    {/* FILTRO OFERTA */}

                    <OfertaFilter
                        selected={filtroOferta}
                        onChange={(valor) => {
                            setFiltroOferta(valor);
                            setPagina(0);
                        }}
                    />
                </div>

                {/* =================================================
                    GRID
                ================================================= */}

                <div className="row g-4 justify-content-center">
                    {experienciasFiltradas.length === 0 ? (
                        <div className="text-center py-5">
                            <p
                                className="lead mx-auto mt-3"
                                style={{
                                    maxWidth: "720px",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "16pt",
                                    color: "#000000",
                                }}
                            >
                                No hay experiencias disponibles con los filtros
                                seleccionados.
                            </p>
                        </div>
                    ) : (
                        experienciasFiltradas.map((img, index) => {
                            const esProximamente =
                                img.estado === "proximamente";

                            const esBlackFridayAgotado =
                                img.oferta === "black_friday" &&
                                img.plazas <= 0;

                            return (
                                <motion.div
                                    key={img.id}
                                    className="col-12 col-md-6 col-lg-4 col-xl-3 d-flex"
                                    initial={{
                                        y: 50,
                                        opacity: 0,
                                    }}
                                    animate={{
                                        y: 0,
                                        opacity: 1,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                    }}
                                >
                                    {/* =================================================
                                            CARD
                                        ================================================= */}

                                    <div
                                        className="card border-0 shadow-sm w-100 h-100 d-flex flex-column rounded-4"
                                        style={{
                                            backgroundColor: "#000000",
                                            border: "1px solid rgba(53, 55, 46, 0.1)",
                                            transition: "all 0.5s ease",
                                            minHeight: "500px",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(-8px)";

                                            e.currentTarget.style.boxShadow =
                                                "0 20px 30px rgba(0,0,0,0.15)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(0)";

                                            e.currentTarget.style.boxShadow =
                                                "0 0 0 rgba(0,0,0,0)";
                                        }}
                                    >
                                        {/* =================================================
                                                IMAGEN
                                            ================================================= */}

                                        <div
                                            className="position-relative overflow-hidden"
                                            style={{
                                                height: "200px",
                                            }}
                                        >
                                            {/* LOADER */}

                                            {!loadedImages[img.id] && (
                                                <div
                                                    className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                                                    style={{
                                                        zIndex: 1,
                                                    }}
                                                >
                                                    <Loader
                                                        size={48}
                                                        color="#ffffff"
                                                        className="spin"
                                                    />
                                                </div>
                                            )}

                                            {/* CATEGORÍA */}

                                            <div
                                                className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill fw-semibold"
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    color: "#000000",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                    fontSize: "12px",
                                                    textTransform: "capitalize",
                                                    zIndex: 3,
                                                }}
                                            >
                                                {img.tipo_viaje}
                                            </div>

                                            {/* OFERTA */}

                                            {img.oferta && (
                                                <div
                                                    className="position-absolute start-0 m-3 px-3 py-1 rounded-pill fw-semibold"
                                                    style={{
                                                        top: "30px",
                                                        backgroundColor:
                                                            "#000000",
                                                        color: "#ffffff",
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                        fontSize: "11px",
                                                        zIndex: 3,
                                                        border: "1px solid rgba(255,255,255,0.4)",
                                                    }}
                                                >
                                                    {getNombreOferta(
                                                        img.oferta,
                                                    )}
                                                </div>
                                            )}

                                            {/* SOLD OUT */}

                                            {esBlackFridayAgotado && (
                                                <div
                                                    className="position-absolute top-50 start-50"
                                                    style={{
                                                        zIndex: 10,
                                                        width: "150%",
                                                        backgroundColor:
                                                            "#d00000",
                                                        color: "#ffffff",
                                                        padding: "8px 0",
                                                        transform:
                                                            "translate(-50%, -50%) rotate(-12deg)",
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                        fontSize: "18px",
                                                        fontWeight: "900",
                                                        letterSpacing: "1px",
                                                        textAlign: "center",
                                                        whiteSpace: "nowrap",
                                                        borderTop:
                                                            "2px solid #ffffff",
                                                        borderBottom:
                                                            "2px solid #ffffff",
                                                        boxShadow:
                                                            "0 4px 10px rgba(0, 0, 0, 0.45)",
                                                    }}
                                                >
                                                    SOLD OUT &nbsp;&nbsp; SOLD
                                                    OUT &nbsp;&nbsp; SOLD OUT
                                                    &nbsp;&nbsp; SOLD OUT
                                                </div>
                                            )}

                                            {/* PRECIO */}

                                            {/* =================================================
                                                PRECIO
                                                OCULTO SI ES PRÓXIMAMENTE
                                            ================================================= */}

                                            {!esProximamente && (
                                                <div
                                                    className="position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill fw-semibold"
                                                    style={{
                                                        backgroundColor:
                                                            "#ffffff",
                                                        color: "#000000",
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                        fontSize: "12px",
                                                        zIndex: 3,
                                                    }}
                                                >
                                                    {img.precio} €
                                                </div>
                                            )}

                                            {/* IMAGEN */}

                                            <img
                                                src={`/storage/paquetes/portada/${img.id}/${img.foto}`}
                                                alt={img.nombre}
                                                className="w-100 h-100 rounded-top rounded-top-4"
                                                style={{
                                                    objectFit: "cover",
                                                    transition:
                                                        "transform 0.5s ease, opacity 0.3s ease",
                                                    opacity: loadedImages[
                                                        img.id
                                                    ]
                                                        ? 1
                                                        : 0,
                                                }}
                                                onLoad={() =>
                                                    setLoadedImages((prev) => ({
                                                        ...prev,
                                                        [img.id]: true,
                                                    }))
                                                }
                                                onError={() =>
                                                    setLoadedImages((prev) => ({
                                                        ...prev,
                                                        [img.id]: true,
                                                    }))
                                                }
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.transform =
                                                        "scale(1.1)")
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.transform =
                                                        "scale(1)")
                                                }
                                            />

                                            {/* OVERLAY */}

                                            <div
                                                className="position-absolute top-0 start-0 w-100 h-100"
                                                style={{
                                                    background:
                                                        "linear-gradient(to top, rgba(53,55,46,0.2), transparent)",
                                                    opacity: 0,
                                                    transition:
                                                        "opacity 0.5s ease",
                                                }}
                                            ></div>
                                        </div>

                                        {/* =================================================
                                                CONTENIDO
                                            ================================================= */}

                                        <div className="card-body d-flex flex-column text-center">
                                            {/* NOMBRE */}

                                            <h5
                                                className="fw-bold mb-2"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                }}
                                            >
                                                {img.nombre}
                                            </h5>

                                            {/* DESCRIPCIÓN */}
                                            {!esProximamente && (
                                                <p
                                                    className="mb-3 flex-grow-1"
                                                    style={{
                                                        color: "#ffffff",
                                                        fontSize: "0.9rem",
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                    }}
                                                >
                                                    {img.descripcion &&
                                                    img.descripcion.length > 130
                                                        ? img.descripcion.substring(
                                                              0,
                                                              130,
                                                          ) + "..."
                                                        : img.descripcion}
                                                </p>
                                            )}

                                            {/* =================================================
                                                    UBICACIÓN
                                                    SIEMPRE VISIBLE
                                                ================================================= */}

                                            <div
                                                className={
                                                    esProximamente
                                                        ? "d-flex align-items-center mb-3"
                                                        : "d-flex align-items-center mb-2"
                                                }
                                                style={{
                                                    color: "#ffffff",
                                                    fontSize: "0.9rem",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                }}
                                            >
                                                <MapPin
                                                    size={16}
                                                    className="me-2"
                                                />

                                                <span className="fw-medium">
                                                    {img.lugar}
                                                </span>
                                            </div>

                                            {/* =================================================
                                                    FECHA
                                                    OCULTA SI ES PRÓXIMAMENTE
                                                ================================================= */}

                                            {!esProximamente && (
                                                <div
                                                    className="d-flex align-items-center mb-3"
                                                    style={{
                                                        color: "#ffffff",
                                                        fontSize: "0.9rem",
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                    }}
                                                >
                                                    <Calendar
                                                        size={16}
                                                        className="me-2"
                                                    />

                                                    <span className="fw-medium">
                                                        {(() => {
                                                            const inicio =
                                                                new Date(
                                                                    img.fecha_inicio,
                                                                );

                                                            const fin =
                                                                new Date(
                                                                    img.fecha_fin,
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
                                            )}

                                            {/* =================================================
                                                    BOTÓN
                                                ================================================= */}

                                            {esProximamente ? (
                                                <div
                                                    className="btn w-100 mt-auto rounded-top-2"
                                                    style={{
                                                        backgroundColor:
                                                            "rgba(255, 255, 255, 0.5)",
                                                        backdropFilter:
                                                            "blur(12px)",
                                                        WebkitBackdropFilter:
                                                            "blur(12px)",
                                                        color: "#000000",
                                                        border: "1px solid rgba(255,255,255,0.5)",
                                                        minWidth: "110px",
                                                        textAlign: "center",
                                                        fontSize: "12px",
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                        cursor: "default",
                                                        opacity: 0.8,
                                                    }}
                                                >
                                                    Próximamente
                                                </div>
                                            ) : esBlackFridayAgotado ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="btn w-100 mt-auto rounded-top-2"
                                                    style={{
                                                        backgroundColor:
                                                            "rgba(255, 255, 255, 0.3)",
                                                        color: "#999999",
                                                        border: "1px solid rgba(255,255,255,0.2)",
                                                        minWidth: "110px",
                                                        textAlign: "center",
                                                        fontSize: "12px",
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                        cursor: "not-allowed",
                                                        opacity: 0.6,
                                                    }}
                                                >
                                                    No disponible
                                                </button>
                                            ) : (
                                                <Link
                                                    to={`/experiencia/${img.id}`}
                                                    className="btn w-100 mt-auto rounded-top-2"
                                                    style={{
                                                        backgroundColor:
                                                            "rgba(255, 255, 255, 0.8)",
                                                        backdropFilter:
                                                            "blur(12px)",
                                                        WebkitBackdropFilter:
                                                            "blur(12px)",
                                                        color: "#000000",
                                                        border: "1px solid rgba(255,255,255,0.5)",
                                                        minWidth: "110px",
                                                        textAlign: "center",
                                                        fontSize: "12px",
                                                        transition:
                                                            "all 0.3s ease",
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor =
                                                            "rgba(255, 255, 255, 0.2)";

                                                        e.currentTarget.style.color =
                                                            "#ffffff";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor =
                                                            "rgba(255, 255, 255, 0.8)";

                                                        e.currentTarget.style.color =
                                                            "#000000";
                                                    }}
                                                >
                                                    Ver más
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* =====================================================
                PAGINACIÓN
            ===================================================== */}

            {experienciasFiltradas.length > 0 && totalPaginas > 1 && (
                <motion.div
                    initial={{
                        y: 30,
                        opacity: 0,
                    }}
                    animate={{
                        y: 0,
                        opacity: 1,
                    }}
                    transition={{
                        delay: 1,
                        duration: 0.8,
                    }}
                    className="d-flex justify-content-center align-items-center gap-3 flex-wrap my-5"
                >
                    {/* ANTERIOR */}

                    <button
                        className="btn d-flex align-items-center px-4 py-2 rounded-pill"
                        style={{
                            backgroundColor: "#000000",
                            color: "#ffffff",
                            border: "none",
                        }}
                        onClick={() => setPagina(Math.max(pagina - 1, 0))}
                        disabled={pagina <= 0}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* NÚMEROS */}

                    {Array.from(
                        {
                            length: totalPaginas,
                        },
                        (_, index) => (
                            <button
                                key={index}
                                onClick={() => setPagina(index)}
                                className="btn rounded-circle d-flex align-items-center justify-content-center p-0"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    backgroundColor:
                                        index === pagina
                                            ? "#6b6b6b"
                                            : "#1a1a1a",
                                    color: "#ffffff",
                                    border: "none",
                                    transition: "all 0.3s",
                                    cursor: "pointer",
                                }}
                            >
                                {index + 1}
                            </button>
                        ),
                    )}

                    {/* SIGUIENTE */}

                    <button
                        className="btn d-flex align-items-center px-4 py-2 rounded-pill"
                        style={{
                            backgroundColor: "#000000",
                            color: "#ffffff",
                            border: "none",
                        }}
                        onClick={() =>
                            setPagina(Math.min(pagina + 1, totalPaginas - 1))
                        }
                        disabled={pagina >= totalPaginas - 1}
                    >
                        <ChevronRight size={18} />
                    </button>
                </motion.div>
            )}

            {/* =====================================================
                EXPERIENCIA PERSONALIZADA
            ===================================================== */}

            <br />

            <motion.div
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
                    delay: 0.5,
                }}
                className="mt-5 text-center px-3 my-5"
            >
                <div
                    className="rounded-4 p-4 mx-auto"
                    style={{
                        maxWidth: "60rem",
                        background: "#000000",
                        color: "#ffffff",
                        boxSizing: "border-box",
                    }}
                >
                    <h2
                        className="fw-bold mb-4"
                        style={{
                            fontSize: "1.75rem",
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        Creamos tu propia experiencia
                    </h2>

                    <p
                        className="mb-4 opacity-75"
                        style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "14px",
                        }}
                    >
                        Nuestro equipo de expertos puede diseñar una experiencia
                        personalizada especialmente para ti. Contáctanos y
                        cuéntanos tu aventura ideal.
                    </p>

                    <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 mt-4 justify-content-center">
                        {/* CONTACTAR */}

                        <button
                            type="button"
                            onClick={() => (window.location.href = "/contacto")}
                            className="btn mt-1"
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
                                padding: "0.5rem 1rem",
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
                            Contactar ahora
                        </button>

                        {/* CONSULTA PERSONALIZADA */}

                        <button
                            type="button"
                            onClick={() =>
                                (window.location.href =
                                    "https://forms.zohopublic.eu/infoviajesa1/form/TravelConsentForm/formperma/tuol5HBatga4UsFvc6oOaKd4jGKfuG39t8cREOGAvvQ")
                            }
                            className="btn mt-1"
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
                                padding: "0.5rem 1rem",
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
                            Solicitar consulta personalizada
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default Experiencia;
