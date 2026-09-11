import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { MapPin, Clock, Users, Loader } from "lucide-react";

const Seccion3 = () => {
    const [experiencias, setExperiencias] = useState([]);
    const [error, setError] = useState(null);
    const sectionRef = useRef(null);
    const hasAnimatedRef = useRef(false);
    const [loading, setLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState({});

    const handleImageLoad = (id) => {
        setLoadedImages((prev) => ({
            ...prev,
            [id]: true,
        }));
    };

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
       CARGAR EXPERIENCIAS
    ========================================================= */

    useEffect(() => {
        setLoading(true);
        setError(null);

        axios
            .get(`/api/paquetes/ultimos`)
            .then((res) => {
                const ahora = new Date();

                /*
                 * La API puede devolver directamente un array
                 * o un objeto con content/data.
                 */
                const paquetes = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.content)
                      ? res.data.content
                      : Array.isArray(res.data?.data)
                        ? res.data.data
                        : [];

                const paquetesFiltrados = paquetes.filter((exp) => {
                    /* =====================================================
                       1. PLAZAS / ESTADO
                    ===================================================== */

                    /*
                     * Black Friday agotado debe seguir apareciendo
                     * para poder mostrar el cartel SOLD OUT.
                     */
                    const esBlackFridayAgotado =
                        exp.oferta === "black_friday" && exp.plazas <= 0;

                    /*
                     * Un paquete se muestra si:
                     *
                     * - Tiene plazas disponibles
                     * - Está próximamente
                     * - Es Black Friday y está agotado
                     */
                    const tieneDisponibilidad =
                        exp.plazas > 0 ||
                        exp.estado === "proximamente" ||
                        esBlackFridayAgotado;

                    if (!tieneDisponibilidad) {
                        return false;
                    }

                    /* =====================================================
                       2. COMPROBAR FECHAS DE LA OFERTA
                    ===================================================== */

                    if (exp.oferta) {
                        /*
                         * Si tiene una oferta pero no tiene las dos fechas,
                         * no se muestra.
                         */
                        if (!exp.oferta_inicio || !exp.oferta_fin) {
                            return false;
                        }

                        const inicio = new Date(exp.oferta_inicio);

                        const fin = new Date(exp.oferta_fin);

                        /*
                         * La oferta todavía no ha comenzado.
                         */
                        if (ahora < inicio) {
                            return false;
                        }

                        /*
                         * La oferta ya ha terminado.
                         */
                        if (ahora > fin) {
                            return false;
                        }
                    }

                    return true;
                });

                setExperiencias(paquetesFiltrados);
            })
            .catch(() => setError("No se pudieron cargar las experiencias"))
            .finally(() => setLoading(false));
    }, []);

    /* =========================================================
       ANIMACIÓN
    ========================================================= */

    useEffect(() => {
        if (experiencias.length === 0 || !window.$) {
            return;
        }

        const sectionEl = sectionRef.current;

        if (!sectionEl) return;

        const runAnimation = () => {
            const $cards = window.$(sectionEl).find(".card-item");

            $cards.css({
                opacity: 0,
                position: "relative",
                bottom: "-50px",
            });

            $cards.each(function (index) {
                const $card = window.$(this);

                setTimeout(() => {
                    $card.animate(
                        {
                            opacity: 1,
                            bottom: 0,
                        },
                        700,
                        "swing",
                    );
                }, index * 200);
            });
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimatedRef.current) {
                        runAnimation();
                        hasAnimatedRef.current = true;
                    }
                });
            },
            {
                threshold: 0.5,
            },
        );

        observer.observe(sectionEl);

        return () => observer.disconnect();
    }, [experiencias]);

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <section
                className="u-align-center u-clearfix u-container-align-center u-palette-2-base u-section-3 py-5"
                style={{
                    backgroundColor: "#ffffff",
                }}
            >
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{
                        minHeight: "300px",
                    }}
                >
                    <Loader size={64} className="spin" color="#000000" />
                </div>
            </section>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {
        return <p className="text-center text-danger">{error}</p>;
    }

    return (
        <section
            ref={sectionRef}
            className="u-align-center u-clearfix u-container-align-center u-palette-2-base u-section-3 py-5"
            id="sec-4bf5"
            style={{
                backgroundColor: "#ffffff",
            }}
        >
            <div className="container">
                <br />

                {!loading && (
                    <>
                        {/* =================================================
                            CABECERA
                        ================================================= */}

                        <div className="text-center mb-5">
                            <h2
                                className="display-5 fw-bold"
                                style={{
                                    color: "#000000",
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                Encuentra tu próxima aventura
                            </h2>

                            <p
                                className="fs-5 p-nosotros"
                                style={{
                                    color: "#000000",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "14pt",
                                }}
                            >
                                Descubre nuestras experiencias más populares
                                diseñadas para brindarte momentos inolvidables
                            </p>
                        </div>

                        {/* =================================================
                            SIN EXPERIENCIAS
                        ================================================= */}

                        {experiencias.length === 0 && (
                            <p
                                className="p-nosotros"
                                style={{
                                    color: "#000000",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "12pt",
                                    marginTop: "-30px",
                                }}
                            >
                                En este momento estamos trabajando para ofrecer
                                las mejores experiencias.
                            </p>
                        )}

                        {/* =================================================
                            GRID
                        ================================================= */}

                        <div
                            className={`row ${
                                experiencias.length > 0 &&
                                experiencias.length < 3
                                    ? "justify-content-center"
                                    : ""
                            }`}
                        >
                            {experiencias.map((exp) => {
                                const fechaInicio = new Date(exp.fecha_inicio);

                                const fechaFin = new Date(exp.fecha_fin);

                                const duracionDias = Math.ceil(
                                    (fechaFin - fechaInicio) /
                                        (1000 * 60 * 60 * 24),
                                );

                                /*
                                 * Black Friday agotado.
                                 */
                                const esBlackFridayAgotado =
                                    exp.oferta === "black_friday" &&
                                    exp.plazas <= 0;

                                /*
                                 * Próximamente.
                                 */
                                const esProximamente =
                                    exp.estado === "proximamente";

                                return (
                                    <div
                                        className="col-md-6 col-lg-4 mb-4 card-item"
                                        key={exp.id}
                                    >
                                        <div
                                            className="card h-100 d-flex flex-column shadow-sm border-0 rounded-4"
                                            style={{
                                                backgroundColor: "#000000",
                                            }}
                                        >
                                            {/* =================================================
                                                IMAGEN
                                            ================================================= */}

                                            <div className="position-relative overflow-hidden">
                                                {/* LOADER */}

                                                {!loadedImages[exp.id] && (
                                                    <div
                                                        className="d-flex justify-content-center align-items-center"
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            inset: 0,
                                                            zIndex: 2,
                                                        }}
                                                    >
                                                        <Loader
                                                            size={48}
                                                            color="#ffffff"
                                                            className="spin"
                                                        />
                                                    </div>
                                                )}

                                                {/* IMAGEN */}

                                                <img
                                                    src={`/storage/paquetes/portada/${exp.id}/${exp.foto}`}
                                                    alt={exp.nombre}
                                                    className="card-img-top border-0 rounded-top rounded-top-4"
                                                    style={{
                                                        height: "200px",
                                                        width: "100%",
                                                        objectFit: "cover",
                                                        opacity: loadedImages[
                                                            exp.id
                                                        ]
                                                            ? 1
                                                            : 0,
                                                        transition:
                                                            "opacity 0.3s ease",
                                                    }}
                                                    onLoad={() =>
                                                        handleImageLoad(exp.id)
                                                    }
                                                    onError={() =>
                                                        handleImageLoad(exp.id)
                                                    }
                                                />

                                                {/* =================================================
                                                    CATEGORÍA
                                                ================================================= */}

                                                <div
                                                    className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill fw-semibold"
                                                    style={{
                                                        backgroundColor:
                                                            "#ffffff",
                                                        color: "#000000",
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                        fontSize: "12px",
                                                        textTransform:
                                                            "capitalize",
                                                        zIndex: 3,
                                                    }}
                                                >
                                                    {exp.tipo_viaje}
                                                </div>

                                                {/* =================================================
                                                    OFERTA
                                                ================================================= */}

                                                {exp.oferta && (
                                                    <div
                                                        className="position-absolute start-0 m-3 px-3 py-1 rounded-pill fw-semibold"
                                                        style={{
                                                            top: "48px",
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
                                                            exp.oferta,
                                                        )}
                                                    </div>
                                                )}

                                                {/* =================================================
                                                    SOLD OUT - BLACK FRIDAY
                                                ================================================= */}

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
                                                            letterSpacing:
                                                                "1px",
                                                            textAlign: "center",
                                                            whiteSpace:
                                                                "nowrap",
                                                            borderTop:
                                                                "2px solid #ffffff",
                                                            borderBottom:
                                                                "2px solid #ffffff",
                                                            boxShadow:
                                                                "0 4px 10px rgba(0, 0, 0, 0.45)",
                                                        }}
                                                    >
                                                        SOLD OUT &nbsp;&nbsp;
                                                        SOLD OUT &nbsp;&nbsp;
                                                        SOLD OUT &nbsp;&nbsp;
                                                        SOLD OUT
                                                    </div>
                                                )}

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
                                                        {exp.precio} €
                                                    </div>
                                                )}
                                            </div>

                                            {/* =================================================
                                                CONTENIDO
                                            ================================================= */}

                                            <div
                                                className="card-body d-flex flex-column text-center"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                }}
                                            >
                                                {/* NOMBRE */}

                                                <h5 className="card-title fw-bold mb-2 mt-5">
                                                    {exp.nombre}
                                                </h5>

                                                {/* DESCRIPCIÓN */}

                                                {/* DESCRIPCIÓN */}
                                                {!esProximamente && (
                                                    <p
                                                        className="card-text flex-grow-1"
                                                        style={{
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        {exp.descripcion &&
                                                        exp.descripcion.length >
                                                            130
                                                            ? exp.descripcion.substring(
                                                                  0,
                                                                  130,
                                                              ) + "..."
                                                            : exp.descripcion}
                                                    </p>
                                                )}
                                                {/* =================================================
                                                    INFORMACIÓN
                                                ================================================= */}

                                                <ul className="list-unstyled mt-3 mb-4">
                                                    {/* =================================================
                                                        LUGAR
                                                        SIEMPRE VISIBLE
                                                    ================================================= */}

                                                    <li
                                                        className={
                                                            esProximamente
                                                                ? "d-flex align-items-center"
                                                                : "mb-2 d-flex align-items-center"
                                                        }
                                                        style={{
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        <MapPin
                                                            size={16}
                                                            className="me-2"
                                                            style={{
                                                                stroke: "#ffffff",
                                                            }}
                                                        />

                                                        {exp.lugar}
                                                    </li>

                                                    {/* =================================================
                                                        DURACIÓN
                                                        OCULTA SI ES PRÓXIMAMENTE
                                                    ================================================= */}

                                                    {!esProximamente && (
                                                        <li
                                                            className="mb-2 d-flex align-items-center"
                                                            style={{
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            <Clock
                                                                size={16}
                                                                className="me-2"
                                                                style={{
                                                                    stroke: "#ffffff",
                                                                }}
                                                            />
                                                            {duracionDias} días
                                                        </li>
                                                    )}

                                                    {/* =================================================
                                                        PLAZAS
                                                        OCULTAS SI ES PRÓXIMAMENTE
                                                    ================================================= */}

                                                    {!esProximamente && (
                                                        <li
                                                            className="d-flex align-items-center"
                                                            style={{
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            <Users
                                                                size={16}
                                                                className="me-2"
                                                                style={{
                                                                    stroke: "#ffffff",
                                                                }}
                                                            />
                                                            {exp.plazas} plazas
                                                        </li>
                                                    )}
                                                </ul>

                                                {/* =================================================
                                                    BOTONES
                                                ================================================= */}

                                                {esProximamente ? (
                                                    /* =========================
                                                       PRÓXIMAMENTE
                                                    ========================= */

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
                                                            fontSize: "12px",
                                                            fontFamily:
                                                                "Inter, sans-serif",
                                                            cursor: "default",
                                                        }}
                                                    >
                                                        Próximamente
                                                    </div>
                                                ) : esBlackFridayAgotado ? (
                                                    /* =========================
                                                       BLACK FRIDAY AGOTADO
                                                    ========================= */

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
                                                    /* =========================
                                                       NORMAL
                                                    ========================= */

                                                    <Link
                                                        to={`/experiencia/${exp.id}`}
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
                                                        Ver detalles
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* =================================================
                            VER TODAS
                        ================================================= */}

                        {experiencias.length > 0 && (
                            <div className="text-center mt-4">
                                <Link
                                    to="/experiencias"
                                    className="btn btn-lg"
                                    style={{
                                        backgroundColor: "#000000",
                                        color: "#ffffff",
                                        borderColor: "#ffffff",
                                        fontSize: "12px",
                                        fontFamily: "Inter, sans-serif",
                                    }}
                                >
                                    Ver todas las experiencias
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default Seccion3;
