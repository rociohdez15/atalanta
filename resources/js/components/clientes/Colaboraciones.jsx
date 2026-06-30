import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    Globe,
    X,
    ChevronRight,
    Loader,
    ChevronLeft,
} from "lucide-react";
import axios from "axios";

const Colaboraciones = () => {
    const [colaboraciones, setColaboraciones] = useState([]);
    const [selected, setSelected] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [loading, setLoading] = useState(true); // <-- Estado de carga
    const [showFullImage, setShowFullImage] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [galeria, setGaleria] = useState([]);
    const [galeriaIndex, setGaleriaIndex] = useState(0);

    const tamañoPagina = 6;

    // Detectar si es móvil
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Cargar datos del backend
    useEffect(() => {
        setLoading(true);
        axios
            .get(`/api/colaboraciones?page=${pagina}&size=${tamañoPagina}`)
            .then((res) => {
                setColaboraciones(res.data.content ?? []);
                setTotalPaginas(res.data.totalPages ?? 0);
            })
            .catch((err) => {
                console.error(err);
                setColaboraciones([]);
                setTotalPaginas(0);
            })
            .finally(() => setLoading(false));
    }, [pagina]);

    useEffect(() => {
        if (selected) {
            fetch(`/api/colaboraciones/${selected.id}/galeria`)
                .then((res) => res.json())
                .then((data) => setGaleria(data.galeria));
        }
    }, [selected]);

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
            {/* ================= HERO ================= */}
            <section
                className="position-relative d-flex align-items-center overflow-hidden"
                style={{ minHeight: "60vh" }}
            >
                <div className="position-absolute top-0 start-0 w-100 h-100">
                    <img
                        src="/images/fondoo3.jpg"
                        alt="Paisaje de viaje"
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                        loading="eager"
                    />

                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="container position-relative text-center"
                    style={{ zIndex: 1 }}
                >
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
                                window.innerWidth < 768 ? "-5.5rem" : "-7rem", // móvil: 5.5rem, tablet/desktop: 2rem
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                                "rgba(53, 55, 46, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                                "transparent";
                        }}
                    >
                        <ArrowLeft size={20} className="me-2" />
                        Volver al inicio
                    </button>

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
                        Colaboraciones
                    </h1>
                </motion.div>
            </section>

            {/* SECCIÓN DE CARDS */}
            <div className="container-lg px-4 py-5">
                <div className="row g-4 justify-content-center">
                    {colaboraciones.length > 0 ? (
                        colaboraciones.map((colab, index) => (
                            <motion.div
                                key={colab.id}
                                className="col-12 col-md-6 col-lg-4 col-xl-3 d-flex"
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                }}
                            >
                                <div
                                    className="card border-0 shadow-sm w-100 d-flex flex-column rounded-4"
                                    style={{
                                        backgroundColor: "#000000",
                                        border: "1px solid rgba(53, 55, 46, 0.1)",
                                        transition: "all 0.5s ease",
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
                                    <div
                                        className="position-relative overflow-hidden"
                                        style={{ height: "200px" }}
                                    >
                                        <img
                                            src={`/storage/colaboraciones/portada/${colab.id}/${colab.foto}`}
                                            alt={colab.nombre}
                                            className="w-100 h-100 rounded-top rounded-top-4"
                                            style={{
                                                objectFit: "cover",
                                                transition:
                                                    "transform 0.5s ease",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.transform =
                                                    "scale(1.1)")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.transform =
                                                    "scale(1)")
                                            }
                                        />
                                    </div>

                                    <div className="card-body d-flex flex-column">
                                        <h5
                                            className="fw-bold mb-2"
                                            style={{
                                                color: "#ffffff",
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            {colab.nombre}
                                        </h5>

                                        <p
                                            className="mb-3 flex-grow-1"
                                            style={{
                                                color: "#ffffff",
                                                fontSize: "0.9rem",
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            {colab.descripcion.length > 130
                                                ? colab.descripcion.substring(
                                                      0,
                                                      130,
                                                  ) + "..."
                                                : colab.descripcion}
                                        </p>

                                        <div className="d-flex flex-column mt-auto">
                                            <div
                                                className="d-flex align-items-center mb-2"
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
                                                    style={{ color: "#ffffff" }}
                                                />
                                                <span className="fw-medium">
                                                    {new Date(
                                                        colab.fecha_inicio,
                                                    ).toLocaleDateString(
                                                        "es-ES",
                                                        {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                        },
                                                    )}
                                                </span>
                                            </div>

                                            <button
                                                className="btn mt-1"
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
                                                onClick={() =>
                                                    setSelected(colab)
                                                }
                                            >
                                                Ver detalles
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            className="col-12 text-center py-5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <p
                                className="p-nosotros"
                                style={{
                                    color: " #000000",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "16pt",
                                    marginTop: "-30px",
                                }}
                            >
                                No hay colaboraciones disponibles por el
                                momento.
                            </p>
                            <p
                                className="p-nosotros"
                                style={{
                                    color: " #000000",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "16pt",
                                    marginTop: "-20px",
                                }}
                            >
                                Vuelve más tarde para descubrir nuevas
                                colaboraciones y oportunidades.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ================= MODAL ================= */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal show d-flex align-items-center justify-content-center"
                        style={{
                            display: "block",
                            backgroundColor: "rgba(0,0,0,0.8)",
                            zIndex: 1050,
                            padding: 10,
                        }}
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="modal-dialog modal-dialog-centered custom-modal"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxHeight: "90vh",
                                width: "95%",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                className="modal-content rounded-4 d-flex flex-column"
                                style={{
                                    backgroundColor: "#000000",
                                    overflow: "hidden",
                                    height: "100%",
                                }}
                            >
                                {/* IMAGEN */}
                                <div
                                    className="position-relative"
                                    style={{
                                        height: "260px",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    <img
                                        src={`/storage/colaboraciones/portada/${selected.id}/${selected.foto}`}
                                        className="img-fluid w-100 h-100"
                                        style={{ objectFit: "cover" }}
                                        alt={selected.nombre}
                                    />

                                    {/* ❌ CERRAR MODAL */}
                                    <button
                                        type="button"
                                        className="btn position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                                        onClick={() => setSelected(null)}
                                        aria-label="Close modal"
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            padding: 0,
                                            backgroundColor: "#ffffff",
                                            color: "#000000",
                                        }}
                                    >
                                        <X size={18} />
                                    </button>

                                    {/* 📷 BOTÓN GALERÍA */}
                                    <button
                                        type="button"
                                        className="btn position-absolute end-0 me-2 rounded-circle shadow-sm"
                                        onClick={() => {
                                            setShowGallery(true);
                                            setGaleriaIndex(0);
                                        }}
                                        aria-label="Ver galería"
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            padding: 0,
                                            backgroundColor: "#ffffff",
                                            color: "#000000",
                                            bottom:
                                                window.innerWidth < 768
                                                    ? "3rem"
                                                    : "3rem", // más arriba en móviles
                                            top: "auto",
                                            transform: "none",
                                        }}
                                    >
                                        🖼️
                                    </button>

                                    {/* 🔍 BOTÓN LUPA */}
                                    <button
                                        type="button"
                                        className="btn position-absolute end-0 me-2 rounded-circle shadow-sm"
                                        onClick={() => setShowFullImage(true)}
                                        aria-label="Ver imagen en grande"
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            padding: 0,
                                            backgroundColor: "#ffffff",
                                            color: "#000000",
                                            bottom:
                                                window.innerWidth < 768
                                                    ? "0.5rem"
                                                    : "0.5rem", // más arriba en móviles
                                            right: "0.5rem",
                                        }}
                                    >
                                        🔍
                                    </button>

                                    {/* INFO SOBRE IMAGEN */}
                                    <div
                                        className="position-absolute start-0 p-2 text-white"
                                        style={{
                                            textShadow:
                                                "0 0 4px rgba(0,0,0,0.7)",
                                            fontSize: "0.9rem",
                                            bottom: "0.5rem",
                                        }}
                                    >
                                        <div className="fw-bold">
                                            {selected.nombre}
                                        </div>
                                        <div className="d-flex gap-2 mt-1">
                                            <div className="d-flex align-items-center">
                                                <Globe
                                                    size={12}
                                                    className="me-1"
                                                />
                                                <a
                                                    href={
                                                        selected.web.startsWith(
                                                            "http",
                                                        )
                                                            ? selected.web
                                                            : `https://${selected.web}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-white text-decoration-underline"
                                                    style={{
                                                        fontSize: "0.9rem",
                                                    }}
                                                >
                                                    {selected.web}
                                                </a>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <Calendar
                                                    size={12}
                                                    className="me-1"
                                                />
                                                {new Date(
                                                    selected.fecha_inicio,
                                                ).toLocaleDateString("es-ES", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CONTENIDO */}
                                <div
                                    className="flex-column overflow-auto"
                                    style={{
                                        padding: "0.5rem 1rem 1rem 1rem",
                                        flex: "0 1 auto",
                                    }}
                                >
                                    <h5
                                        className="fw-bold mb-2"
                                        style={{
                                            color: "#ffffff",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        Descripción
                                    </h5>
                                    <p
                                        className="mb-3 flex-grow-1"
                                        style={{
                                            color: "#ffffff",
                                            fontSize: "0.9rem",
                                            fontFamily: "Inter, sans-serif",
                                            whiteSpace: "pre-line",
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: selected.descripcion.replace(
                                                /<a /g,
                                                '<a style="color: #000000; font-size: 0.9rem; text-decoration: underline;" ',
                                            ),
                                        }}
                                    />

                                    <div
                                        className="bg-white text-dark p-2 rounded-3 mt-3"
                                        style={{ fontSize: "0.85rem" }}
                                    >
                                        <div className="fw-bold mb-1">
                                            Información Adicional
                                        </div>
                                        <div>
                                            Sitio Web:{" "}
                                            <a
                                                href={
                                                    selected.web.startsWith(
                                                        "http",
                                                    )
                                                        ? selected.web
                                                        : `https://${selected.web}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-decoration-underline"
                                                style={{ fontSize: "0.9rem" }}
                                            >
                                                {selected.web}
                                            </a>
                                        </div>
                                        <div>
                                            Fecha:{" "}
                                            {new Date(
                                                selected.fecha_inicio,
                                            ).toLocaleDateString("es-ES", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ================= FULLSCREEN IMAGE ================= */}
            <AnimatePresence>
                {showFullImage && selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ background: "rgba(0,0,0,0.9)", zIndex: 2000 }}
                        onClick={() => setShowFullImage(false)}
                    >
                        <img
                            src={`/storage/colaboraciones/portada/${selected.id}/${selected.foto}`}
                            className="img-fluid rounded"
                            alt={selected.nombre}
                            style={{
                                maxHeight: "90vh",
                                maxWidth: "90vw",
                                objectFit: "contain",
                            }}
                        />

                        <button
                            className="btn position-absolute top-0 end-0 m-3 rounded-circle"
                            onClick={() => setShowFullImage(false)}
                            style={{
                                background: "#fff",
                                width: 45,
                                height: 45,
                                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                            }}
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ================= FULLSCREEN GALERÍA ================= */}
            <AnimatePresence>
                {showGallery && selected && galeria.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                        style={{ background: "rgba(0,0,0,0.95)", zIndex: 2000 }}
                        onClick={() => setShowGallery(false)}
                    >
                        {/* IMAGEN CENTRAL */}
                        <div
                            className="d-flex align-items-center justify-content-center position-relative"
                            style={{
                                flex: "1 1 auto",
                                width: "100%",
                                maxHeight: "80vh",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="btn position-absolute top-50 start-0 translate-middle-y rounded-circle"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setGaleriaIndex((prev) =>
                                        prev === 0
                                            ? galeria.length - 1
                                            : prev - 1,
                                    );
                                }}
                                style={{
                                    background: "rgba(255,255,255,0.8)",
                                    width: 45,
                                    height: 45,
                                    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                                    zIndex: 10,
                                }}
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <img
                                src={`/storage/colaboraciones/${selected.id}/images/${galeria[galeriaIndex].ruta_imagen}`}
                                alt={
                                    galeria[galeriaIndex].descripcion_imagen ||
                                    `Imagen ${galeriaIndex + 1}`
                                }
                                className="img-fluid rounded"
                                style={{
                                    maxHeight: "80vh",
                                    maxWidth: "80vw",
                                    objectFit: "contain",
                                }}
                            />

                            <button
                                className="btn position-absolute top-50 end-0 translate-middle-y rounded-circle"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setGaleriaIndex((prev) =>
                                        prev === galeria.length - 1
                                            ? 0
                                            : prev + 1,
                                    );
                                }}
                                style={{
                                    background: "rgba(255,255,255,0.8)",
                                    width: 45,
                                    height: 45,
                                    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                                    zIndex: 10,
                                }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* MINIATURAS */}
                        <div
                            className="d-flex justify-content-center align-items-center gap-2 mt-3 overflow-auto"
                            style={{ padding: "0 1rem" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {galeria.map((img, index) => (
                                <img
                                    key={index}
                                    src={`/storage/colaboraciones/${selected.id}/images/${img.ruta_imagen}`}
                                    alt={
                                        img.descripcion_imagen ||
                                        `Imagen ${index + 1}`
                                    }
                                    onClick={() => setGaleriaIndex(index)}
                                    className={`rounded ${galeriaIndex === index ? "border border-3 border-warning" : ""}`}
                                    style={{
                                        width: 80,
                                        height: 60,
                                        objectFit: "cover",
                                        cursor: "pointer",
                                        transition: "transform 0.2s",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.transform =
                                            "scale(1.05)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.transform =
                                            "scale(1)")
                                    }
                                />
                            ))}
                        </div>

                        {/* BOTÓN CERRAR */}
                        <button
                            className="btn position-absolute top-0 end-0 m-3 rounded-circle"
                            onClick={() => setShowGallery(false)}
                            style={{
                                background: "#fff",
                                width: 45,
                                height: 45,
                                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                            }}
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ================= PAGINACIÓN ================= */}
            {colaboraciones.length > 0 && totalPaginas > 1 && (
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="d-flex justify-content-center align-items-center gap-3 flex-wrap my-5"
                >
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

                    {Array.from({ length: totalPaginas }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => setPagina(index)}
                            className="btn rounded-circle d-flex align-items-center justify-content-center p-0"
                            style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor:
                                    index === pagina ? "#5c503eff" : "#000000",
                                color: "#ffffff",
                                border: "none",
                                transition: "all 0.3s",
                                cursor: "pointer",
                            }}
                        >
                            {index + 1}
                        </button>
                    ))}

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

            <div className="container my-5">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="text-center rounded-4 p-5 shadow-lg mx-auto"
                    style={{
                        background: "#000000",
                        color: "#ffffff",
                        maxWidth: "60rem",
                    }}
                >
                    {/* Título */}
                    <h2
                        className="fw-bold mb-3"
                        style={{
                            fontSize: "1.75rem",
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        ¿Interesado en colaborar con nosotros?
                    </h2>

                    {/* Párrafo */}
                    <p
                        className="mb-4 opacity-75"
                        style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "14px",
                        }}
                    >
                        Si tu empresa comparte nuestra visión de ofrecer
                        experiencias de viaje excepcionales y sostenibles, nos
                        encantaría explorar oportunidades de colaboración.
                    </p>

                    {/* Botón */}
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
                            fontSize: "12px", // <-- igual que el otro botón
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
                        Contáctanos
                    </button>
                </motion.div>
            </div>
        </>
    );
};

export default Colaboraciones;
