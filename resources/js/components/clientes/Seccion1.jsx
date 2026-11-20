import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

/* =========================================================
   TIEMPOS DE CAMPAÑA (Black Friday / Cyber Monday)
   Ciclo diario: la oferta empieza a las 20:00 y termina
   a las 20:00 del día siguiente.
========================================================= */

function getCampanaTimes() {
    const now = new Date();

    // Hoy a las 20:00
    const todayStart = new Date(now);
    todayStart.setHours(20, 0, 0, 0);

    // Si todavía no son las 20:00:
    // estamos esperando a que empiece la oferta.
    if (now.getTime() < todayStart.getTime()) {
        return {
            isActive: false,
            target: todayStart.getTime(),
        };
    }

    // Si ya son las 20:00:
    // la oferta está activa y termina mañana a las 20:00.
    const tomorrowEnd = new Date(todayStart);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    return {
        isActive: true,
        target: tomorrowEnd.getTime(),
    };
}

/* =========================================================
   CONFIGURACIÓN DE LAS CAMPAÑAS CON CONTADOR
========================================================= */

const CAMPANAS_CTA = {
    black_friday: {
        oferta: "black_friday",
        textoPreparate: "¡Prepárate para las ofertas Black Friday!",
        textoBoton: "Ver ofertas Black Friday",
    },

    cyber_monday: {
        oferta: "cyber_monday",
        textoPreparate: "¡Prepárate para las ofertas Cyber Monday!",
        textoBoton: "Ver ofertas Cyber Monday",
    },
};

/* =========================================================
   CAMPAÑA CTA (Black Friday + Cyber Monday)
========================================================= */

const CampanaCTA = ({ campana }) => {
    const config = CAMPANAS_CTA[campana] ?? CAMPANAS_CTA.black_friday;

    const initialData = getCampanaTimes();

    const [isActive, setIsActive] = useState(initialData.isActive);

    const [target, setTarget] = useState(initialData.target);

    const [remaining, setRemaining] = useState(
        Math.max(0, initialData.target - Date.now()),
    );

    useEffect(() => {
        const updateCountdown = () => {
            const now = Date.now();
            const diff = target - now;

            /*
             * Cuando llega a las 20:00:
             *
             * - Si estábamos esperando → empieza la oferta.
             * - Si la oferta estaba activa → termina y empieza
             *   el siguiente periodo de espera.
             */
            if (diff <= 0) {
                const newData = getCampanaTimes();

                setIsActive(newData.isActive);
                setTarget(newData.target);
                setRemaining(Math.max(0, newData.target - Date.now()));

                return;
            }

            setRemaining(diff);
        };

        updateCountdown();

        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [target]);

    /*
     * HORAS
     */
    const hh = String(Math.floor(remaining / 3600000)).padStart(2, "0");

    /*
     * MINUTOS
     */
    const mm = String(Math.floor((remaining % 3600000) / 60000)).padStart(
        2,
        "0",
    );

    /*
     * SEGUNDOS
     */
    const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

    return (
        <div className="campana-slide d-flex flex-column align-items-center justify-content-center">
            {/* =================================================
                TEXTO DEL ESTADO
            ================================================= */}

            <div
                style={{
                    color: "#fff",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    textAlign: "center",
                    marginTop: "-150px",
                }}
            >
                {isActive ? "La oferta termina en:" : "La oferta comienza en:"}
            </div>

            {/* =================================================
                CONTADOR
            ================================================= */}

            <div
                className="d-flex justify-content-center"
                style={{
                    gap: "0.75rem",
                }}
            >
                {[
                    {
                        value: hh,
                        label: "horas",
                    },
                    {
                        value: mm,
                        label: "min",
                    },
                    {
                        value: ss,
                        label: "seg",
                    },
                ].map(({ value, label }) => (
                    <div
                        key={label}
                        style={{
                            background: "rgba(0,0,0,0.45)",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            borderRadius: "10px",
                            padding: "0.6rem 1rem",
                            minWidth: "64px",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                color: "#fff",
                                fontSize: "1.4rem",
                                fontWeight: 700,
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            {value}
                        </div>

                        <div
                            style={{
                                color: "#d8d8d4",
                                fontSize: "0.7rem",
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            {label}
                        </div>
                    </div>
                ))}
            </div>

            {/* =================================================
                TEXTO INFORMATIVO
            ================================================= */}

            <div
                style={{
                    color: "#fff",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.85rem",
                    marginTop: "1rem",
                    textAlign: "center",
                }}
            >
                {isActive
                    ? "¡Aprovecha la oferta antes de que termine!"
                    : config.textoPreparate}
            </div>

            {/* =================================================
                BOTÓN DE LA CAMPAÑA
            ================================================= */}

            <button
                type="button"
                onClick={() => {
                    window.location.href = `/experiencias?oferta=${config.oferta}`;
                }}
                className="btn rounded-top-2 rounded-bottom-2"
                style={{
                    marginTop: "2rem",
                    fontSize: "14px",
                    fontWeight: 600,
                    padding: "0.85rem 2.25rem",
                    fontFamily: "Inter, sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    color: "#000000",
                    border: "1px solid rgba(255,255,255,0.5)",
                    cursor: "pointer",
                }}
            >
                <i className="fa-solid fa-bag-shopping"></i>
                {config.textoBoton}
                <i className="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    );
};

/* =========================================================
   SECCIÓN
========================================================= */

const Seccion1 = () => {
    const { pathname } = useLocation();

    const [campanas, setCampanas] = useState([]);

    const [fondoActual, setFondoActual] = useState("/images/fondo1.webp");

    /* =====================================================
       FONDOS
    ===================================================== */

    const fondosCampanas = {
        san_valentin:
            "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1600&q=80",

        verano: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1920&q=80",

        black_friday: "/images/campanas/fondo_bf.png",

        black_friday_mobile: "/images/campanas/fondo_bfm.png",

        cyber_monday: "/images/campanas/ciberlunes.png",

        cyber_monday_mobile: "/images/campanas/fondo_cmm.png",

        navidad:
            "https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=1600&q=80",

        default:
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    };

    /* =====================================================
       TEXTOS
    ===================================================== */

    const textosCampanas = {
        san_valentin: {
            titulo: "Celebra el amor viajando juntos por nuevos caminos",

            p1: "Convierte cada viaje en un momento especial para los dos",

            p2: "Siente el amor",
        },

        verano: {
            titulo: "Vive un verano lleno de aventuras bajo el sol",

            p1: "",

            p2: "",
        },

        black_friday: {
            titulo: "Aprovecha las mejores ofertas para viajar más lejos",

            p1: "Encuentra oportunidades únicas para viajar más por menos",

            p2: "Aprovecha hoy",
        },

        cyber_monday: {
            titulo: "Las mejores ofertas online para tu próxima aventura",

            p1: "Descubre experiencias únicas con descuentos solo por tiempo limitado",

            p2: "Reserva hoy",
        },

        navidad: {
            titulo: "Comparte la magia de viajar en esta época especial",

            p1: "Comparte la magia de descubrir nuevos lugares en familia",

            p2: "Vívela ahora",
        },

        default: {
            titulo: "Viaja con la seguridad de quienes conocen el camino",

            p1: "Explora el mundo con la emoción de lo inesperado",

            p2: "Descúbrelo",
        },
    };

    const [textoActual, setTextoActual] = useState(textosCampanas.default);

    /* =====================================================
       CARDS BASE
    ===================================================== */

    const navigationCardsBase = [
        {
            title: "Nosotros",
            iconClass: "fa-users",
            gradient: "#ffffff",
            description: "",
            link: "/nosotros",
        },

        {
            title: "Experiencias",
            iconClass: "fa-earth-americas",
            gradient: "#ffffff",
            description: "",
            link: "/experiencias",
        },

        {
            title: "Blog",
            iconClass: "fa-pencil",
            gradient: "#ffffff",
            description: "",
            link: "/blogger",
        },

        {
            title: "Galería",
            iconClass: "fa-photo-film",
            gradient: "#ffffff",
            description: "",
            link: "/galeria",
        },
    ];

    /* =====================================================
       CARGAR CAMPAÑAS
    ===================================================== */

    useEffect(() => {
        const fetchCampanas = async () => {
            try {
                const res = await axios.get("/api/campanas/activas");

                setCampanas(res.data);
            } catch (error) {
                console.error("Error cargando campañas", error);
            }
        };

        fetchCampanas();
    }, []);

    /* =====================================================
       NORMALIZAR NOMBRE
    ===================================================== */

    function normalizarNombre(nombre) {
        if (!nombre) return "";

        const limpio = nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9 ]/g, " ");

        if (limpio.includes("san") && limpio.includes("valentin")) {
            return "san_valentin";
        }

        if (limpio.includes("verano")) {
            return "verano";
        }

        // Cyber Monday (se comprueba antes que Black Friday)
        if (limpio.includes("cyber") || limpio.includes("monday")) {
            return "cyber_monday";
        }

        if (limpio.includes("black") || limpio.includes("friday")) {
            return "black_friday";
        }

        if (limpio.includes("navidad")) {
            return "navidad";
        }

        return "default";
    }

    /* =====================================================
       ICONOS
    ===================================================== */

    function getIcon(nombre) {
        switch (nombre) {
            case "san_valentin":
                return "fa-heart";

            case "verano":
                return "fa-sun";

            case "black_friday":
                return "fa-bag-shopping";

            case "cyber_monday":
                return "fa-laptop";

            case "navidad":
                return "fa-snowflake";

            default:
                return "fa-star";
        }
    }

    /* =====================================================
       GRADIENTES
    ===================================================== */

    function getGradient(nombre) {
        switch (nombre) {
            case "san_valentin":
                return "#ff4d6d";

            case "verano":
                return "#fbbf24";

            case "black_friday":
                return "#111827";

            case "cyber_monday":
                return "#0ea5e9";

            case "navidad":
                return "#60a5fa";

            default:
                return "#ffffff";
        }
    }

    /* =====================================================
       AGRUPAR CAMPAÑAS
    ===================================================== */

    const campanasAgrupadas = campanas.reduce((acc, c) => {
        const nombre = normalizarNombre(c.nombre);

        if (!acc[nombre]) {
            acc[nombre] = [];
        }

        acc[nombre].push(c);

        return acc;
    }, {});

    /* =====================================================
       CONFIGURACIÓN DE SLIDES
    ===================================================== */

    const slidesConfig = [
        {
            nombre: "base",
            cards: navigationCardsBase,
        },

        ...Object.entries(campanasAgrupadas).map(([nombre, grupo]) => ({
            nombre,

            cards: grupo.map((c) => ({
                title: c.titulo,

                iconClass: getIcon(nombre),

                gradient: getGradient(nombre),

                description: c.subtitulo || "",

                link: c.link || "/experiencias",

                nombre,
            })),
        })),
    ];

    /* =====================================================
       CAMBIO DE SLIDE
    ===================================================== */

    useEffect(() => {
        const carousel = document.getElementById("cardsCarousel");

        if (!carousel) return;

        const handleSlide = () => {
            const activeItem = carousel.querySelector(".carousel-item.active");

            const activeIndex = parseInt(activeItem?.dataset?.index ?? "0", 10);

            if (activeIndex === 0) {
                setFondoActual("/images/fondo1.webp");

                setTextoActual(textosCampanas.default);

                return;
            }

            const grupoIndex = activeIndex - 1;

            const grupoNombre = Object.keys(campanasAgrupadas)[grupoIndex];

            setFondoActual(
                fondosCampanas[grupoNombre] ?? fondosCampanas.default,
            );

            setTextoActual(
                textosCampanas[grupoNombre] ?? textosCampanas.default,
            );
        };

        carousel.addEventListener("slid.bs.carousel", handleSlide);

        return () => {
            carousel.removeEventListener("slid.bs.carousel", handleSlide);
        };
    }, [campanasAgrupadas]);

    /* =====================================================
       CLASE DEL FONDO (escritorio / móvil por campaña)
    ===================================================== */

    const getClaseFondo = () => {
        if (fondoActual === fondosCampanas.black_friday) {
            return "black-friday-background";
        }

        if (fondoActual === fondosCampanas.cyber_monday) {
            return "cyber-monday-background";
        }

        return "";
    };

    /* =====================================================
       CARD GRID
    ===================================================== */

    const CardGrid = ({ grupo, slideIndex }) => (
        <div className="card-grid-slide">
            {/* TARJETAS */}

            <div className="cards-container">
                {grupo.map(
                    ({ title, iconClass, link, description }, cardIndex) => (
                        <div
                            key={`${slideIndex}-${cardIndex}`}
                            className="nav-card-wrapper"
                        >
                            <Link
                                to={link}
                                style={{
                                    textDecoration: "none",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <div
                                    className="card text-center shadow-sm d-flex flex-column justify-content-center"
                                    style={{
                                        width: "230px",

                                        aspectRatio: "1 / 1",

                                        padding: "1.5rem",

                                        background: "rgba(255,255,255,0.12)",

                                        backdropFilter: "blur(12px)",

                                        WebkitBackdropFilter: "blur(12px)",

                                        color: "#fff",

                                        borderRadius: "12px",

                                        boxShadow:
                                            "0 8px 24px rgb(0 0 0 / 0.2)",

                                        cursor: "pointer",

                                        overflow: "hidden",
                                    }}
                                >
                                    <div>
                                        {/* ICONO */}

                                        <div
                                            className="nav-card-icon"
                                            style={{
                                                marginTop: "1rem",

                                                marginBottom: "0.8rem",

                                                fontSize: "2.25rem",

                                                filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))",

                                                textAlign: "center",
                                            }}
                                        >
                                            <i
                                                className={`fa-solid ${iconClass}`}
                                                style={{
                                                    fontSize: "2.5rem",
                                                }}
                                            ></i>
                                        </div>

                                        {/* TÍTULO */}

                                        <h5
                                            className="fw-bold mb-1 nav-card-title"
                                            style={{
                                                color: "inherit",

                                                wordWrap: "break-word",

                                                fontFamily: "Inter, sans-serif",

                                                textAlign: "center",
                                            }}
                                        >
                                            {title}
                                        </h5>

                                        {/* DESCRIPCIÓN */}

                                        <p
                                            className="nav-card-description"
                                            style={{
                                                color: "inherit",

                                                fontSize: "0.875rem",

                                                marginTop: "0.25rem",

                                                wordWrap: "break-word",

                                                textAlign: "center",
                                            }}
                                        >
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ),
                )}
            </div>

            {/* RESERVAR AHORA */}

            <div className="reserve-button-container">
                <Link
                    to="/experiencias"
                    className="btn rounded-top-2 rounded-bottom-2 p-nosotros reserve-btn"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",

                        backdropFilter: "blur(12px)",

                        WebkitBackdropFilter: "blur(12px)",

                        color: "#000000",

                        border: "1px solid rgba(255,255,255,0.5)",

                        fontSize: "12px",

                        transition: "all 0.3s ease",

                        fontFamily: "Inter, sans-serif",
                    }}
                >
                    Reservar ahora
                </Link>
            </div>
        </div>
    );

    /* =====================================================
       RETURN
    ===================================================== */

    return (
        <section
            className="position-relative d-flex align-items-center u-section-1"
            id="sec-0609"
            style={{
                minHeight: "auto",
                paddingTop: "4rem",
                paddingBottom: "4rem",
            }}
        >
            <style>{`

                /* =====================================================
                   FONDO
                ===================================================== */

                .seccion1-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    overflow: hidden;
                    background-size: cover;
                    background-position: center;
                }

                /* =====================================================
                   TÍTULO
                ===================================================== */

                .hero-text-container {
                    height: auto;
                    min-height: auto;
                    max-height: none;

                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;

                    padding-top: 2rem;
                    padding-bottom: 0;
                    margin-bottom: 1rem !important;
                    overflow: visible;
                }

                /* =====================================================
                   ESCRITORIO GRANDE
                ===================================================== */

                @media (min-width: 1200px) {
                    .hero-text-container {
                        height: auto;
                        min-height: auto;
                        max-height: none;
                        padding-top: 2rem;
                        padding-bottom: 0;
                        margin-bottom: 1rem !important;
                    }

                    .hero-text-container h1 {
                        line-height: 1.05;
                    }
                }

                .hero-text-container h1 {
                    margin-top: 0;
                    margin-bottom: 1rem;
                }

                .hero-text-container p {
                    margin-bottom: 0.5rem;
                }

                /* =====================================================
                   CARRUSEL
                ===================================================== */

                #cardsCarousel {
                    width: 100%;

                    height: 350px !important;
                    min-height: 350px !important;
                    max-height: 350px !important;
                }

                #cardsCarousel .carousel-inner {
                    width: 100%;

                    height: 420px !important;
                    min-height: 420px !important;
                    max-height: 420px !important;

                    overflow: hidden;
                }

                #cardsCarousel .carousel-item {
                    width: 100%;

                    height: 420px !important;
                    min-height: 420px !important;
                    max-height: 420px !important;

                    overflow: hidden;
                }

                #cardsCarousel .carousel-item.active {
                    height: 420px !important;
                    min-height: 420px !important;
                    max-height: 420px !important;
                }

                #cardsCarousel .carousel-item > * {
                    width: 100%;

                    height: 420px !important;
                    min-height: 420px !important;
                    max-height: 420px !important;
                }

                /* =====================================================
                   FONDOS DE CAMPAÑA (ESCRITORIO)
                ===================================================== */

                .black-friday-background {
                    background-image: url("/images/campanas/fondo_bf.png") !important;
                }

                .cyber-monday-background {
                    background-image: url("/images/campanas/fondo_cm.png") !important;
                }

                /* Móvil + tablet: fondos verticales de las campañas */
                @media (max-width: 1199px) {
                    .black-friday-background {
                        background-image: url("/images/campanas/fondo_bfm.png") !important;
                    }

                    .cyber-monday-background {
                        background-image: url("/images/campanas/fondo_cmm.png") !important;
                    }
                }

                /* =====================================================
                   CARD GRID
                ===================================================== */

                .card-grid-slide {
                    width: 100%;

                    height: 420px !important;
                    min-height: 420px !important;
                    max-height: 420px !important;

                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    overflow: hidden;
                }

                .cards-container {
                    width: 100%;

                    display: flex;
                    flex-wrap: wrap;

                    justify-content: center;

                    gap: 1rem;
                }

                .nav-card-wrapper {
                    display: flex;
                    flex-direction: column;
                    flex: 0 0 auto;
                }

                /* =====================================================
                   BOTÓN RESERVAR
                ===================================================== */

                .reserve-button-container {
                    margin-top: -40px;

                    height: 40px;

                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .reserve-button-container .reserve-btn {
                    margin-top: 150px;
                }

                /* =====================================================
                   SLIDE DE CAMPAÑA (BLACK FRIDAY / CYBER MONDAY)
                ===================================================== */

                .campana-slide {
                    width: 100%;

                    height: 420px !important;
                    min-height: 420px !important;
                    max-height: 420px !important;

                    display: flex;
                    flex-direction: column;

                    align-items: center;
                    justify-content: center;

                    overflow: hidden;
                }

                /* =====================================================
                   INDICADORES
                ===================================================== */

                #cardsCarousel .carousel-indicators {
                    bottom: -40px !important;
                }

                /* =====================================================
                   CONTROLES
                ===================================================== */

                #cardsCarousel .carousel-control-prev,
                #cardsCarousel .carousel-control-next {
                    z-index: 10;
                    top: 25% !important;
                    bottom: auto !important;
                    height: 40px !important;
                }

                /* =====================================================
                   MÓVIL + TABLET
                   (antes: max-width 575px → ahora 1199px)
                ===================================================== */

                @media (max-width: 1199px) {

                    /* ---------------------------------------------
                       TÍTULO
                    --------------------------------------------- */

                    .hero-text-container {
                        height: auto !important;
                        min-height: auto !important;
                        max-height: none !important;

                        padding-top: 1rem !important;
                        padding-bottom: 0 !important;
                        padding-left: 10px;
                        padding-right: 10px;
                        margin-bottom: 1rem !important;
                    }

                    .hero-text-container h1 {
                        font-size:
                            clamp(
                                2.4rem,
                                10vw,
                                4rem
                            ) !important;

                        line-height: 1.05;

                        margin-bottom: 0.75rem;
                    }

                    .hero-text-container p {
                        font-size: 11pt !important;

                        line-height: 1.3;
                    }

                    /* ---------------------------------------------
                       CARRUSEL
                    --------------------------------------------- */

                    #cardsCarousel {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;

                        /* espacio para los indicadores (bottom: -40px) */
                        margin-bottom: 3rem;
                    }

                    #cardsCarousel .carousel-inner {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: hidden;
                        padding-bottom: 0.75rem;
                    }

                    #cardsCarousel .carousel-item {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: visible;
                    }

                    #cardsCarousel .carousel-item.active {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                    }

                    #cardsCarousel .carousel-item > * {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                    }

                    /* Cuadrícula de tarjetas (dentro o fuera del carrusel,
                       p. ej. cuando no hay campañas activas) */
                    .card-grid-slide {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: visible !important;
                        padding-bottom: 0.5rem;
                    }

                    /* El slide de cuadrícula crece con su contenido */
                    #cardsCarousel .carousel-item > .card-grid-slide {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: visible;
                        padding-bottom: 0.5rem;
                    }

                    /* Los slides de campaña (Black Friday / Cyber Monday)
                       mantienen altura fija */
                    #cardsCarousel .carousel-item > .campana-slide {
                        height: 420px !important;
                        min-height: 420px !important;
                        max-height: 420px !important;
                    }

                    /* ---------------------------------------------
                       OCULTAR FLECHAS
                    --------------------------------------------- */

                    #cardsCarousel .carousel-control-prev,
                    #cardsCarousel .carousel-control-next {
                        display: none !important;
                    }

                    /* ---------------------------------------------
                       TARJETAS
                    --------------------------------------------- */

                    .cards-container {
                        width: 100%;

                        display: flex;
                        flex-wrap: wrap;

                        justify-content: center;

                        gap: 1rem;
                    }

                    .nav-card-wrapper {
                        flex: 0 0 calc(50% - 0.5rem);

                        max-width:
                            min(calc(50% - 0.5rem), 200px);
                    }

                    .nav-card-wrapper .card {
                        width: 100% !important;

                        padding: 1rem !important;
                    }

                    .nav-card-wrapper .nav-card-icon {
                        margin-top:
                            0.5rem !important;

                        margin-bottom:
                            0.4rem !important;
                    }

                    .nav-card-wrapper .nav-card-icon i {
                        font-size:
                            2rem !important;
                    }

                    .nav-card-wrapper .nav-card-title {
                        font-size:
                            0.85rem !important;
                    }

                    .nav-card-wrapper
                    .nav-card-description {
                        font-size:
                            0.75rem !important;
                    }

                    /* ---------------------------------------------
                       RESERVAR
                    --------------------------------------------- */

                    .reserve-button-container {
                        margin-top: 1.5rem;

                        height: auto;
                    }

                    .reserve-button-container .reserve-btn {
                        margin-top: 0 !important;
                    }

                    /* ---------------------------------------------
                       CAMPAÑAS (BLACK FRIDAY / CYBER MONDAY)
                    --------------------------------------------- */

                    .campana-slide {
                        height: 420px !important;
                        min-height: 420px !important;
                        max-height: 420px !important;
                    }

                    .campana-slide > div:first-child {
                        gap: 0.5rem !important;
                    }

                    .campana-slide
                    > div:first-child
                    > div {
                        min-width:
                            58px !important;

                        padding:
                            0.5rem 0.6rem !important;
                    }

                    .campana-slide button {
                        font-size:
                            12px !important;

                        padding:
                            0.7rem 1.2rem !important;
                    }
                }

            `}</style>

            {/* =====================================================
                FONDO
            ===================================================== */}

            <div
                className={`seccion1-background ${getClaseFondo()}`}
                style={{
                    backgroundImage: `url(${fondoActual})`,
                }}
            />

            {/* OVERLAY */}

            <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    zIndex: 1,
                }}
            />

            {/* =====================================================
                CONTENIDO
            ===================================================== */}

            <div
                className="container text-center position-relative px-3 px-md-5"
                style={{
                    zIndex: 2,
                }}
            >
                {/* =================================================
                    CABECERA
                ================================================= */}

                <div className="text-center mb-5 hero-text-container">
                    <h1
                        className="fw-bold lh-tight titulo"
                        style={{
                            fontFamily:
                                '"TT Espina Trial Variable", sans-serif',

                            fontSize: "clamp(3rem, 6vw, 6.5rem)",

                            color: "#ffffff",

                            wordWrap: "break-word",
                        }}
                    >
                        {textoActual.titulo}
                    </h1>

                    <p
                        className="lead mx-auto"
                        style={{
                            maxWidth: "720px",
                            fontSize: "14pt",
                            color: "#ffffff",
                        }}
                    >
                        {textoActual.p1}
                    </p>

                    <p
                        className="lead mx-auto"
                        style={{
                            maxWidth: "720px",
                            fontSize: "14pt",
                            color: "#ffffff",
                        }}
                    >
                        {textoActual.p2}
                    </p>
                </div>

                {/* =================================================
                    CARRUSEL
                ================================================= */}

                {campanas.length > 0 ? (
                    <div
                        id="cardsCarousel"
                        className="carousel slide"
                        data-bs-ride="carousel"
                        data-bs-touch="true"
                    >
                        {/* INDICADORES */}

                        <div className="carousel-indicators">
                            {slidesConfig.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    data-bs-target="#cardsCarousel"
                                    data-bs-slide-to={i}
                                    className={i === 0 ? "active" : ""}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>

                        {/* SLIDES */}

                        <div className="carousel-inner">
                            {slidesConfig.map(({ nombre, cards }, index) => (
                                <div
                                    key={index}
                                    data-index={index}
                                    className={`carousel-item ${
                                        index === 0 ? "active" : ""
                                    }`}
                                >
                                    {nombre === "black_friday" ||
                                    nombre === "cyber_monday" ? (
                                        <CampanaCTA campana={nombre} />
                                    ) : (
                                        <CardGrid
                                            grupo={cards}
                                            slideIndex={index}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* =================================================
                            PREV
                        ================================================= */}

                        <button
                            className="carousel-control-prev"
                            type="button"
                            data-bs-target="#cardsCarousel"
                            data-bs-slide="prev"
                            style={{
                                width: "48px",
                                opacity: 1,
                                zIndex: 5,
                            }}
                        >
                            <span
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "rgba(0,0,0,0.45)",
                                }}
                            >
                                <i
                                    className="fa-solid fa-chevron-left"
                                    style={{
                                        color: "#fff",
                                        fontSize: "1rem",
                                    }}
                                ></i>
                            </span>
                        </button>

                        {/* =================================================
                            NEXT
                        ================================================= */}

                        <button
                            className="carousel-control-next"
                            type="button"
                            data-bs-target="#cardsCarousel"
                            data-bs-slide="next"
                            style={{
                                width: "48px",
                                opacity: 1,
                                zIndex: 5,
                            }}
                        >
                            <span
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "rgba(0,0,0,0.45)",
                                }}
                            >
                                <i
                                    className="fa-solid fa-chevron-right"
                                    style={{
                                        color: "#fff",
                                        fontSize: "1rem",
                                    }}
                                ></i>
                            </span>
                        </button>
                    </div>
                ) : (
                    <CardGrid grupo={navigationCardsBase} slideIndex={0} />
                )}

                <br />
            </div>
        </section>
    );
};

export default Seccion1;