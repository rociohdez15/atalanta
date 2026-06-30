import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import { motion } from "framer-motion";

const Entrada = () => {
    const [entrada, setEntrada] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { id } = useParams();

    /* =====================================================
       COMPROBAR SESIÓN (cookie HTTP-only)
    ===================================================== */
    useEffect(() => {
        axios
            .get("/api/auth/yo", { withCredentials: true })
            .then(() => setIsLoggedIn(true))
            .catch(() => setIsLoggedIn(false));
    }, []);

    /* =====================================================
       OBTENER ENTRADA
    ===================================================== */
    useEffect(() => {
        setLoading(true);

        axios
            .get(`/api/entrada/${id}`)
            .then((res) => {
                setEntrada(res.data);
            })
            .catch(() => {
                console.error("No se pudo cargar la entrada");
            })
            .finally(() => setLoading(false));
    }, [id]);

    /* =====================================================
       COMPROBAR LIKE DEL USUARIO
    ===================================================== */
    useEffect(() => {
        if (!isLoggedIn || !entrada) return;

        axios
            .get(`/api/like/check/${entrada.id}`, {
                withCredentials: true,
            })
            .then((res) => {
                setIsLiked(res.data.liked);
            })
            .catch(() => {
                setIsLiked(false);
            });
    }, [isLoggedIn, entrada]);

    /* =====================================================
       TOGGLE LIKE
    ===================================================== */
    const handleLikeClick = async () => {
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }

        try {
            await axios.post(
                "/api/like/toggle",
                { entrada_id: entrada.id },
                { withCredentials: true }
            );

            const res = await axios.get(`/api/like/count/${entrada.id}`);

            setEntrada((prev) => ({
                ...prev,
                likes_count: res.data.likes,
            }));

            setIsLiked((prev) => !prev);
        } catch (err) {
            console.error("Error al dar like");
        }
    };

    /* =====================================================
       LOADING
    ===================================================== */
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

    if (!entrada) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <Loader size={64} className="spin" color="#000000" />
            </div>
        );
    }

    /* =====================================================
       RENDER
    ===================================================== */
    return (
        <div className="container py-5 pt-0">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <button
                        type="button"
                        onClick={() => navigate("/blogger")}
                        className="btn btn-link d-flex align-items-center mb-4"
                        style={{
                            textDecoration: "none",
                            color: "#000000",
                            fontSize: "10pt",
                        }}
                    >
                        <ArrowLeft size={20} className="me-2" />
                        Volver al blog
                    </button>

                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="rounded-4 shadow-lg overflow-hidden mb-5"
                        style={{ backgroundColor: "#000000" }}
                    >
                        {/* IMAGEN */}
                        <div
                            className="position-relative"
                            style={{ height: "24rem" }}
                        >
                            <img
                                src={`/storage/blog/${entrada.id}/${entrada.imagen_destacada}`}
                                alt={entrada.titulo}
                                className="w-100 h-100 object-fit-cover"
                            />
                            <div className="position-absolute bottom-0 start-0 p-4 text-white">
                                <h1 className="fw-bold fs-1">
                                    {entrada.titulo}
                                </h1>
                            </div>
                        </div>

                        {/* CONTENIDO */}
                        <div className="p-4 text-white">
                            <div className="mb-4" style={{ lineHeight: "1.7" }}>
                                {entrada.contenido}
                            </div>

                            {/* LIKES */}
                            {/* LIKES + SHARE */}
                            <div
                                className="d-flex align-items-center mt-3"
                                style={{ gap: "0.5rem" }}
                            >
                                {/* Botón Me gusta */}
                                <button
                                    onClick={handleLikeClick}
                                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill border-0"
                                    style={{
                                        backgroundColor: "#ffffff",
                                        color: "#000000",
                                        fontSize: "12px",
                                        minWidth: "110px",
                                        justifyContent: "center",
                                    }}
                                >
                                    <i
                                        className={`bi bi-heart${
                                            isLiked ? "-fill" : ""
                                        }`}
                                    ></i>
                                    <span>
                                        {entrada.likes_count || 0} Me gusta
                                    </span>
                                </button>

                                {/* Spacer para empujar el botón de compartir a la derecha */}
                                <div style={{ flex: 1 }}></div>

                                {/* Botón Compartir */}
                                <button
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator
                                                .share({
                                                    title: entrada.titulo,
                                                    text: "Mira esta entrada interesante:",
                                                    url: window.location.href,
                                                })
                                                .catch((err) =>
                                                    console.error(
                                                        "Error al compartir",
                                                        err
                                                    )
                                                );
                                        } else {
                                            navigator.clipboard
                                                .writeText(window.location.href)
                                                .then(() =>
                                                    alert(
                                                        "Enlace copiado al portapapeles"
                                                    )
                                                )
                                                .catch(() =>
                                                    alert(
                                                        "No se pudo copiar el enlace"
                                                    )
                                                );
                                        }
                                    }}
                                    className="d-flex align-items-center justify-content-center rounded-pill px-3 py-2 border-0"
                                    style={{
                                        backgroundColor: "#ffffff",
                                        color: "#000000",
                                        fontSize: "12px",
                                        minWidth: "110px", // mismo ancho que el botón de Me gusta
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "rgba(255,255,255,0.8)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#ffffff";
                                    }}
                                >
                                    <i className="bi bi-share"></i>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Entrada;
