import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Loader,
} from "lucide-react";
import { motion } from "framer-motion";
import { X } from "phosphor-react";

const Galeria = () => {
    const [imagenes, setImagenes] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const tamañoPagina = 6;
    const [selectedItem, setSelectedItem] = useState(null);
    const [showFullImage, setShowFullImage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mapLoading, setMapLoading] = useState(true);

    const { pathname } = useLocation();

    // Cargar imágenes con paginación
    useEffect(() => {
        setLoading(true);
        axios
            .get(`/api/imagenes?page=${pagina}&size=${tamañoPagina}`)
            .then((res) => {
                setImagenes(res.data.content);
                setTotalPaginas(res.data.totalPages);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [pagina]);

    // Reiniciar mapLoading cada vez que cambia la imagen seleccionada
    useEffect(() => {
        if (selectedItem) setMapLoading(true);
    }, [selectedItem]);

    const formatFecha = (fecha) => {
        if (!fecha) return "Sin fecha";
        const d = new Date(fecha);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Spinner mientras carga la galería
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
        <div className="container py-5 pt-0">
            <div
                className="mb-4"
                style={{ opacity: 1, transform: "translateX(0)" }}
            >
                <button
                    type="button"
                    onClick={() => (window.location.href = "/")}
                    className="btn btn-link d-flex align-items-center mb-4 mt-5"
                    style={{
                        transition:
                            "color 0.3s ease, background-color 0.3s ease",
                        textDecoration: "none", // quita el subrayado
                        boxShadow: "none", // quita cualquier sombra por defecto
                        color: " #000000",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10pt",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = " #000000";
                        e.currentTarget.style.backgroundColor =
                            "rgba(53, 55, 46, 0.1)";
                        e.currentTarget.style.textDecoration = "none";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = " #000000";
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.textDecoration = "none";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    <ArrowLeft size={20} className="me-2" />
                    Volver al inicio
                </button>
            </div>
            <br />
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
            >
                <h1
                    className="text-center mb-3 fw-bold"
                    style={{
                        marginTop: "-120px",
                        color: " #000000",
                        fontFamily: '"TT Espina Trial Variable", sans-serif',
                        fontSize: "clamp(2rem, 5vw, 4rem)",
                        transform: "scaleX(1.5)", // 1.0 es normal, >1 estira
                        display: "inline-block",
                    }}
                >
                    Galería
                </h1>
            </motion.div>

            {/* Imágenes */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="container my-5"
            >
                {Array.from(
                    { length: Math.ceil(imagenes.length / 3) },
                    (_, fila) => (
                        <motion.div
                            key={fila}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                delay: 0.4 + fila * 0.2,
                                duration: 0.8,
                            }}
                            className="row justify-content-center g-4 mb-4"
                        >
                            {imagenes
                                .slice(fila * 3, fila * 3 + 3)
                                .map((img, index) => (
                                    <motion.div
                                        key={img.id}
                                        initial={{
                                            y: 50,
                                            opacity: 0,
                                            scale: 0.9,
                                        }}
                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: 0.6 + index * 0.05,
                                            duration: 0.6,
                                        }}
                                        whileHover={{ y: -10 }}
                                        className="col-12 col-sm-6 col-lg-4 col-xl-3"
                                    >
                                        <div
                                            className="bg-light rounded-3 shadow overflow-hidden position-relative"
                                            style={{
                                                backgroundColor: "#000000",
                                            }}
                                        >
                                            {/* Imagen */}
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ duration: 0.6 }}
                                                className="ratio"
                                                style={{
                                                    aspectRatio: "4 / 3",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <img
                                                    src={`/storage/uploads/images/${img.imagen}`}
                                                    alt={img.titulo}
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            </motion.div>

                                            {/* Contenido */}
                                            <div
                                                className="p-3 text-dark"
                                                style={{
                                                    backgroundColor: "#000000",
                                                }}
                                            >
                                                <h5
                                                    className="fw-bold text-truncate"
                                                    style={{
                                                        fontSize: "15px",
                                                        color: "#ffffff",
                                                    }}
                                                >
                                                    {img.titulo}
                                                </h5>
                                                <div className="mb-3 small text-muted">
                                                    <div className="d-flex align-items-center mb-1">
                                                        <MapPin
                                                            size={14}
                                                            className="me-2"
                                                            style={{
                                                                color: "#ffffff",
                                                            }}
                                                        />
                                                        <span
                                                            style={{
                                                                color: "#ffffff",
                                                            }}
                                                        >
                                                            {img.mapa}
                                                        </span>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <Calendar
                                                            size={14}
                                                            className="me-2"
                                                            style={{
                                                                color: "#ffffff",
                                                            }}
                                                        />
                                                        <span
                                                            style={{
                                                                color: "#ffffff",
                                                            }}
                                                        >
                                                            {formatFecha(
                                                                img.fecha,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn w-100 border-opacity-30 rounded-top-2"
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
                                                        setSelectedItem(img)
                                                    }
                                                >
                                                    Ver detalles y mapa
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </motion.div>
                    ),
                )}
            </motion.div>

            {/* Modal de imagen y mapa */}
            {selectedItem && (
                <>
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
                        onClick={() => setSelectedItem(null)}
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
                                {/* Imagen principal */}
                                <div
                                    className="position-relative"
                                    style={{
                                        height: "180px",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    <img
                                        src={`/storage/uploads/images/${selectedItem.imagen}`}
                                        alt={selectedItem?.titulo || "Imagen"}
                                        className="img-fluid w-100 h-100"
                                        style={{ objectFit: "cover" }}
                                    />

                                    {/* Fullscreen */}
                                    <button
                                        className="btn position-absolute bottom-0 end-0 m-2 rounded-circle shadow-sm"
                                        onClick={() => setShowFullImage(true)}
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            padding: 0,
                                            backgroundColor:
                                                "rgba(255,255,255,0.9)",
                                            color: "#000000",
                                        }}
                                    >
                                        🔍
                                    </button>

                                    {/* Cerrar modal */}
                                    <button
                                        type="button"
                                        className="btn position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                                        onClick={() => setSelectedItem(null)}
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
                                </div>

                                {/* Body */}
                                <div
                                    className="flex-column overflow-auto"
                                    style={{
                                        padding: "0.5rem",
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
                                        Ubicación en el mapa
                                    </h5>

                                    {/* Mapa */}
                                    <div
                                        className="shadow rounded-3 overflow-hidden mb-2 position-relative"
                                        style={{ height: "250px" }}
                                    >
                                        {mapLoading && (
                                            <div
                                                className="d-flex justify-content-center align-items-center w-100 h-100"
                                                style={{
                                                    backgroundColor: "#fff",
                                                }}
                                            >
                                                <Loader
                                                    size={40}
                                                    className="spin"
                                                    color="#000000"
                                                />
                                            </div>
                                        )}

                                        <iframe
                                            key={selectedItem.id}
                                            src={`https://www.google.com/maps?q=${encodeURIComponent(
                                                selectedItem?.coordenadas
                                                    ? `${selectedItem.coordenadas.lat},${selectedItem.coordenadas.lng}`
                                                    : selectedItem?.ubicacion ||
                                                          "",
                                            )}&output=embed`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            onLoad={() => setMapLoading(false)}
                                        />
                                    </div>

                                    {/* Información */}
                                    <div
                                        className="bg-white text-dark p-2 rounded-3"
                                        style={{ fontSize: "0.85rem" }}
                                    >
                                        <div className="fw-bold mb-1">
                                            Información del destino
                                        </div>
                                        <div>
                                            Ubicación:{" "}
                                            {selectedItem?.mapa ||
                                                "Sin ubicación"}
                                        </div>
                                        <div>
                                            Fecha:{" "}
                                            {formatFecha(selectedItem?.fecha)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Fullscreen image */}
                    {showFullImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                            style={{
                                background: "rgba(0,0,0,0.9)",
                                zIndex: 2000,
                            }}
                            onClick={() => setShowFullImage(false)}
                        >
                            <img
                                src={`/storage/uploads/images/${selectedItem.imagen}`}
                                className="img-fluid rounded"
                                alt="Fullscreen"
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
                </>
            )}

            {/* Paginación */}
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
        </div>
    );
};

export default Galeria;
