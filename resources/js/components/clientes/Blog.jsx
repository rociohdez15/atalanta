import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    Award,
    Globe,
    Heart,
    Star,
    Clock,
    ChevronRight,
    ChevronLeft,
    Loader,
} from "lucide-react";
import { motion } from "framer-motion";

const Blog = () => {
    const [entradas, setEntradas] = useState([]);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [loading, setLoading] = useState(true); // NUEVO: estado de carga
    const tamañoPagina = 6;

    const { pathname } = useLocation();

    useEffect(() => {
        setLoading(true); // activamos el spinner
        axios
            .get(`/api/blogger?page=${pagina + 1}&size=${tamañoPagina}`)
            .then((res) => {
                setEntradas(res.data.content);
                setTotalPaginas(res.data.totalPages);
                setLoading(false); // desactivamos spinner al cargar
            })
            .catch(() => setLoading(false)); // desactivamos en caso de error
    }, [pagina]);

    const acortarTexto = (texto, maxLongitud = 200) => {
        if (texto.length <= maxLongitud) return texto;
        return texto.slice(0, maxLongitud) + "...";
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
        <div className="container py-5 pt-0 pb-0">
            <div
                className="mb-4"
                style={{ opacity: 1, transform: "translateX(0)" }}
            >
                <button
                    type="button"
                    onClick={() => (window.location.href = "/")}
                    className="btn btn-link d-flex align-items-center mb-4"
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
                    Territorio Atalanta
                </h1>
            </motion.div>

            <div className="row justify-content-center">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="row g-4 mb-4"
                >
                    {entradas.length === 0 ? (
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className="col-12 text-center py-5"
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
                                En este momento estamos trabajando para ofrecer
                                las mejores entradas.
                            </p>
                        </motion.div>
                    ) : (
                        entradas.map((entrada, index) => (
                            <motion.div
                                key={entrada.id}
                                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                transition={{
                                    delay: 0.6 + index * 0.1,
                                    duration: 0.6,
                                }}
                                whileHover={{ y: -10 }}
                                className="col-12 col-md-6 col-lg-4"
                            >
                                <div
                                    className="card h-100 shadow-sm border border-secondary-subtle rounded-3 overflow-hidden"
                                    style={{
                                        backgroundColor: " #000000",
                                        borderColor: " #ffffff",
                                    }}
                                >
                                    {/* Imagen */}
                                    <div
                                        className="position-relative overflow-hidden imagen-blog"
                                        style={{ height: "200px" }}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <img
                                                src={`/storage/blog/${entrada.id}/${entrada.imagen_destacada}`}
                                                alt={entrada.titulo}
                                                className="w-100 h-100 object-fit-cover"
                                                style={{ objectFit: "cover" }}
                                            />
                                        </motion.div>
                                    </div>

                                    {/* Contenido */}
                                    <div className="card-body d-flex flex-column titulo-blog">
                                        <h3
                                            className="card-title fw-bold mb-3"
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                                fontSize: "1.25rem",
                                                color: "#ffffff",
                                                lineHeight: "1.3",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {entrada.titulo}
                                        </h3>

                                        <p
                                            className="card-text mb-4 flex-grow-1"
                                            style={{
                                                color: "#ffffff",
                                                fontFamily: "Inter, sans-serif",
                                                fontSize: "12pt",
                                            }}
                                        >
                                            {acortarTexto(entrada.contenido)}
                                        </p>

                                        <motion.div
                                            whileHover={{ x: 5 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ width: "100%" }}
                                        >
                                            <Link
                                                to={`/entrada/${entrada.id}`}
                                                className="btn w-100 d-flex align-items-center justify-content-center"
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
                                            >
                                                Leer más
                                                <i className="bi bi-chevron-right ms-2"></i>
                                            </Link>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}

                    {entradas.length > 0 && (
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
                                onClick={() =>
                                    setPagina(Math.max(pagina - 1, 0))
                                }
                                disabled={pagina <= 0}
                            >
                                <ChevronLeft size={18} className="me-2" />
                            </button>

                            {/* Botones números página */}
                            {Array.from(
                                { length: totalPaginas },
                                (_, index) => (
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
                                ),
                            )}

                            {/* Botón Siguiente */}
                            <button
                                className="btn d-flex align-items-center px-4 py-2 rounded-pill"
                                style={{
                                    backgroundColor: "#000000",
                                    color: "#ffffff",
                                    border: "none",
                                }}
                                onClick={() =>
                                    setPagina(
                                        Math.min(pagina + 1, totalPaginas - 1),
                                    )
                                }
                                disabled={pagina >= totalPaginas - 1}
                            >
                                <ChevronRight size={18} className="ms-2" />
                            </button>
                        </motion.div>
                    )}

                    <br />
                    <div className="container m-0 mb-1 p-0">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="text-center rounded-4 p-4 mx-auto"
                            style={{
                                background: "#000000",
                                color: "#ffffff",
                                maxWidth: "60rem", // máximo ancho igual que Experiencia
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
                                Inspírate y planifica tu próxima aventura
                            </h2>
                            <p
                                className="mb-4 opacity-75"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "14px",
                                }}
                            >
                                 Cada artículo está diseñado para despertar tu
                                pasión por viajar y proporcionarte las
                                herramientas necesarias para convertir tus
                                sueños en realidad.
                            </p>
                            <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 mt-4 justify-content-center">
                                <button
                                    type="button"
                                    onClick={() =>
                                        (window.location.href = "/experiencias")
                                    }
                                    className="btn mt-1"
                                    style={{
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.8)",
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
                                    Ver destinos
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        (window.location.href = "/contacto")
                                    }
                                    className="btn mt-1"
                                    style={{
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.8)",
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
                                    Contacta con nosotros
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Blog;
