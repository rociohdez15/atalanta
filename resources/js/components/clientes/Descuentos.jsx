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
    Tag,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Descuentos = () => {
    const [imagenes, setImagenes] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const tamañoPagina = 6;
    const [loading, setLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState({});
    const [copied, setCopied] = useState(false);

    const { pathname } = useLocation();

    useEffect(() => {
        axios
            .get(`/api/descuentos?page=${pagina}&size=${tamañoPagina}`)
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
            .get(`/api/descuentos?page=${pagina}&size=${tamañoPagina}`)
            .then((res) => {
                setImagenes(res.data.content);
                setTotalPaginas(res.data.totalPages);
            })
            .finally(() => setLoading(false)); // ocultar spinner al terminar
    }, [pagina]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1500);
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
                        src="/images/fondo4.jpg"
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
                        Descuentos
                    </h1>
                    <p
                        className="lead mx-auto"
                        style={{
                            maxWidth: "720px",
                            fontSize: "14pt",
                            color: "#ffffff",
                        }}
                    >
                        Descubre nuestras mejores promociones y ahorra en tu
                        próxima aventura. Códigos exclusivos para que viajes más
                        por menos.
                    </p>
                </motion.div>
            </section>

            {/* SECCIÓN DE CARDS */}
            <div className="container-lg px-4 py-5">
                {/* Grid centrado */}
                <div className="row g-4 justify-content-center">
                    {imagenes.map((img, index) => (
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
                                    transition: "all 0.5s ease",
                                    minHeight: "420px",
                                }}
                            >
                                {/* Imagen */}
                                <div
                                    className="position-relative overflow-hidden"
                                    style={{ height: "200px" }}
                                >
                                    <img
                                        src={`/storage/descuentos/portada/${img.id}/${img.foto}`}
                                        alt="descuento"
                                        className="w-100 h-100 rounded-top-4"
                                        style={{
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>

                                {/* Contenido */}
                                <div className="card-body d-flex flex-column text-center">
                                    {/* Código promocional */}
                                    <h5
                                        className="fw-bold mb-2"
                                        style={{
                                            color: "#ffffff",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        {img.titulo}
                                    </h5>

                                    {/* Descripción fija */}
                                    <p
                                        className="mb-3 flex-grow-1"
                                        style={{
                                            color: "#ffffff",
                                            fontSize: "0.9rem",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        {img.descripcion}
                                    </p>

                                    {/* Código promocional */}
                                    <div className="pt-3 border-top mt-3">
                                        <div
                                            className="p-3 rounded-4"
                                            style={{
                                                backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                border: "1px solid rgba(138, 119, 90, 0.2)",
                                            }}
                                        >
                                            <div className="d-flex align-items-center justify-content-between">
                                                {/* Código */}
                                                <div className="flex-grow-1">
                                                    <div
                                                        className="small mb-1 d-flex align-items-center gap-1"
                                                        style={{
                                                            color: "#000000",
                                                        }}
                                                    >
                                                        <Tag
                                                            size={14}
                                                            color="#000000"
                                                        />
                                                        Código promocional
                                                    </div>

                                                    <div
                                                        className="fw-bold fs-5"
                                                        style={{
                                                            fontFamily:
                                                                "monospace",
                                                            letterSpacing:
                                                                "2px",
                                                            color: "#000000",
                                                        }}
                                                    >
                                                        {img.codigo}
                                                    </div>
                                                </div>

                                                {/* Botón copiar */}
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            img.codigo,
                                                        )
                                                    }
                                                    className="btn d-flex align-items-center justify-content-center position-relative"
                                                    style={{
                                                        backgroundColor:
                                                            "rgba(138, 119, 90, 0.1)",
                                                        color: "#000000",
                                                        borderRadius: "10px",
                                                        padding: "10px 12px",
                                                        border: "1px solid rgba(138, 119, 90, 0.2)",
                                                    }}
                                                >
                                                    {copied ? "✔" : "📋"}

                                                    {/* Tooltip tipo "copiado" */}
                                                    {copied && (
                                                        <span
                                                            className="position-absolute"
                                                            style={{
                                                                top: "-30px",
                                                                right: "0",
                                                                backgroundColor:
                                                                    "#000000",
                                                                color: "#fff",
                                                                fontSize:
                                                                    "12px",
                                                                padding:
                                                                    "4px 8px",
                                                                borderRadius:
                                                                    "6px",
                                                                whiteSpace:
                                                                    "nowrap",
                                                            }}
                                                        >
                                                            Copiado al
                                                            portapapeles
                                                        </span>
                                                    )}
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>

                                    <br />

                                    {/* Botón */}
                                    <a
                                        href={img.enlace}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn w-100 mt-auto rounded-top-2"
                                        style={{
                                            backgroundColor:
                                                "rgba(255, 255, 255, 0.8)",
                                            color: "#000000",
                                            border: "1px solid rgba(255,255,255,0.5)",
                                            fontSize: "12px",
                                        }}
                                    >
                                        Usar código
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {imagenes.length > 0 && (
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
        </>
    );
};

export default Descuentos;
