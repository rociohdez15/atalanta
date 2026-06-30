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

const Experiencia = () => {
    const [imagenes, setImagenes] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const tamañoPagina = 6;
    const [loading, setLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState({});
    const [filtro, setFiltro] = useState("todas");

    const { pathname } = useLocation();

    useEffect(() => {
        axios
            .get(`/api/paquetes?page=${pagina}&size=${tamañoPagina}`)
            .then((res) => {
                setImagenes(res.data.content);
                setTotalPaginas(res.data.totalPages);
            });
    }, [pagina]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768); // móvil si < 768px
        };

        handleResize(); // set inicial
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        setLoading(true); // mostrar spinner mientras cargamos
        axios
            .get(`/api/paquetes?page=${pagina}&size=${tamañoPagina}`)
            .then((res) => {
                setImagenes(res.data.content);
                setTotalPaginas(res.data.totalPages);
            })
            .finally(() => setLoading(false)); // ocultar spinner al terminar
    }, [pagina]);

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
            {/* HERO */}
            <section
                className="position-relative d-flex align-items-center overflow-hidden"
                style={{
                    minHeight: "60vh",
                }}
            >
                {/* Imagen de fondo */}
                <div className="position-absolute top-0 start-0 w-100 h-100">
                    <img
                        src="/images/fondo2.jpg"
                        alt="Paisaje de viaje"
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                        loading="eager"
                    />

                    {/* Overlay para mejorar legibilidad */}
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                            backgroundColor: "rgba(0, 0, 0, 0.4)", // negro translúcido
                        }}
                    ></div>
                </div>

                {/* Contenido del hero */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="container position-relative text-center"
                    style={{ zIndex: 1 }}
                >
                    {/* Botón volver */}
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
                            marginTop:
                                window.innerWidth < 768 ? "5.5rem" : "4rem", // móvil: 5.5rem, tablet/desktop: 2rem
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = isMobile
                                ? "#ffffff"
                                : "#ffffff";
                            e.currentTarget.style.backgroundColor =
                                "rgba(53, 55, 46, 0.1)";
                            e.currentTarget.style.textDecoration = "none";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = isMobile
                                ? "#ffffff"
                                : "#ffffff";
                            e.currentTarget.style.backgroundColor =
                                "transparent";
                            e.currentTarget.style.textDecoration = "none";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <ArrowLeft size={20} className="me-2" />
                        Volver al inicio
                    </button>

                    <br />

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
                        Experiencias
                    </h1>
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

            {/* SECCIÓN DE CARDS */}
            <div className="container-lg px-4 py-5">
                <ExperienciaFilter selected={filtro} onChange={setFiltro} />
                {/* Grid centrado */}
                <div className="row g-4 justify-content-center">
                    {imagenes.filter((img) => img.plazas > 0).length === 0 ? (
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
                                En este momento estamos trabajando para ofrecer
                                las mejores experiencias.
                            </p>
                        </div>
                    ) : (
                        imagenes
                            .filter((img) => img.plazas > 0)
                            .filter((img) => {
                                if (filtro === "todas") return true;
                                return img.tipo_viaje === filtro;
                            })
                            .map((img, index) => (
                                <motion.div
                                    key={img.id}
                                    className="col-12 col-md-6 col-lg-4 col-xl-3 d-flex"
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <div
                                        className="card border-0 shadow-sm w-100 h-100 d-flex flex-column rounded-4"
                                        style={{
                                            backgroundColor: "#000000",
                                            border: "1px solid rgba(53, 55, 46, 0.1)",
                                            transition: "all 0.5s ease",
                                            minHeight: "500px", // <-- aumenta este valor para que sea más alta
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
                                        {/* Imagen */}
                                        <div
                                            className="position-relative overflow-hidden"
                                            style={{ height: "200px" }}
                                        >
                                            {!loadedImages[img.id] && (
                                                <div
                                                    className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                                                    style={{ zIndex: 1 }}
                                                >
                                                    <Loader
                                                        size={48}
                                                        color="#ffffff"
                                                        className="spin"
                                                    />
                                                </div>
                                            )}

                                            <div
                                                className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill fw-semibold"
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    color: "#000000",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                    fontSize: "12px",
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                {img.tipo_viaje}
                                            </div>
                                            <div
                                                className="position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill fw-semibold"
                                                style={{
                                                    backgroundColor: "#ffffff",
                                                    color: "#000000",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                {img.precio} €
                                            </div>
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

                                        {/* Contenido */}
                                        <div className="card-body d-flex flex-column text-center">
                                            <h5
                                                className="fw-bold mb-2"
                                                style={{
                                                    color: "#ffffff",
                                                    transition:
                                                        "color 0.3s ease",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                }}
                                            >
                                                {img.nombre}
                                            </h5>
                                            <p
                                                className="mb-3 flex-grow-1"
                                                style={{
                                                    color: "#ffffff",
                                                    fontSize: "0.9rem",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                }}
                                            >
                                                {img.descripcion.length > 130
                                                    ? img.descripcion.substring(
                                                          0,
                                                          130,
                                                      ) + "..."
                                                    : img.descripcion}
                                            </p>

                                            {/* Ubicación */}
                                            <div
                                                className="d-flex align-items-center mb-2"
                                                style={{
                                                    color: "#ffffff",
                                                    fontSize: "0.9rem",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                }}
                                            >
                                                <MapPin
                                                    size={16}
                                                    style={{ color: "#ffffff" }}
                                                    className="me-2"
                                                />
                                                <span className="fw-medium">
                                                    {img.lugar}
                                                </span>
                                            </div>

                                            {/* Fecha */}
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
                                                    style={{ color: "#ffffff" }}
                                                    className="me-2"
                                                />
                                                <span className="fw-medium">
                                                    {(() => {
                                                        const inicio = new Date(
                                                            img.fecha_inicio,
                                                        );
                                                        const fin = new Date(
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

                                            <Link
                                                to={`/experiencia/${img.id}`}
                                                className="btn w-100 mt-auto rounded-top-2"
                                                style={{
                                                    backgroundColor:
                                                        "rgba(255, 255, 255, 0.8)", // fondo blanco translúcido
                                                    backdropFilter:
                                                        "blur(12px)",
                                                    WebkitBackdropFilter:
                                                        "blur(12px)",
                                                    color: "#000000", // texto marrón
                                                    border: "1px solid rgba(255,255,255,0.5)", // borde sutil
                                                    minWidth: "110px",
                                                    textAlign: "center",
                                                    fontSize: "12px",
                                                    transition: "all 0.3s ease",
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
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                    )}
                </div>
            </div>

            {imagenes.filter((img) => img.plazas > 0).length > 0 && (
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="d-flex justify-content-center align-items-center gap-3 flex-wrap my-5"
                >
                    {/* Botón Anterior */}
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
                        <ChevronLeft size={18} className="me-2" />
                    </button>

                    {/* Botones números página */}
                    {Array.from({ length: totalPaginas }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => setPagina(index)}
                            className="btn rounded-circle d-flex align-items-center justify-content-center p-0"
                            style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor:
                                     index === pagina ? "#6b6b6b" : "#1a1a1a",
                                color: "#ffffff",
                                border: "none",
                                transition: "all 0.3s",
                                cursor: "pointer",
                            }}
                        >
                            {index + 1}
                        </button>
                    ))}

                    {/* Botón Siguiente */}
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
                        <ChevronRight size={18} className="ms-2" />
                    </button>
                </motion.div>
            )}

            <br />
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-5 text-center px-3 my-5 "
            >
                <div
                    className="rounded-4 p-4 mx-auto"
                    style={{
                        maxWidth: "60rem", // Más estrecho que antes
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
                    <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 mt-4 justify-content-center ">
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
