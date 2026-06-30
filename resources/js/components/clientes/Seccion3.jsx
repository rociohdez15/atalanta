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

    useEffect(() => {
        setLoading(true);

        axios
            .get(`/api/paquetes/ultimos`)
            .then((res) => {
                const paquetesConPlazas = res.data.content.filter(
                    (exp) => exp.plazas > 0,
                );
                setExperiencias(paquetesConPlazas);
            })
            .catch(() => setError("No se pudieron cargar las experiencias"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (experiencias.length === 0 || !window.$) return;

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
                    $card.animate({ opacity: 1, bottom: 0 }, 700, "swing");
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
            { threshold: 0.5 },
        );

        observer.observe(sectionEl);

        return () => observer.disconnect();
    }, [experiencias]);

    if (loading) {
        return (
            <section
                className="u-align-center u-clearfix u-container-align-center u-palette-2-base u-section-3 py-5"
                style={{ backgroundColor: "#ffffff" }}
            >
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: "300px" }}
                >
                    <Loader size={64} className="spin" color="#000000" />
                </div>
            </section>
        );
    }

    if (error) return <p className="text-center text-danger">{error}</p>;

    return (
        <section
            ref={sectionRef}
            className="u-align-center u-clearfix u-container-align-center u-palette-2-base u-section-3 py-5"
            id="sec-4bf5"
            style={{ backgroundColor: "#ffffff" }}
        >
            <div className="container">
                <br />
                {!loading && (
                    <>
                        <div className="text-center mb-5">
                            <h2
                                className="display-5 fw-bold"
                                style={{
                                    color: " #000000",
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                Encuentra tu próxima aventura
                            </h2>
                            <p
                                className="fs-5 p-nosotros"
                                style={{
                                    color: " #000000",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "14pt",
                                }}
                            >
                                Descubre nuestras experiencias más populares
                                diseñadas para brindarte momentos inolvidables
                            </p>
                        </div>

                        {experiencias.length === 0 && (
                            <p
                                className="p-nosotros"
                                style={{
                                    color: " #000000",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "12pt",
                                    marginTop: "-30px",
                                }}
                            >
                                En este momento estamos trabajando para ofrecer
                                las mejores experiencias.
                            </p>
                        )}

                        {/* Grid de experiencias */}
                        <div
                            className={`row ${
                                experiencias.length > 0 &&
                                experiencias.length < 3
                                    ? "justify-content-center"
                                    : ""
                            }`}
                        >
                            {experiencias.map((exp) => {
                                const urlImagen = `/storage/paquetes/portada/${exp.id}/${exp.foto}`;
                                const fechaInicio = new Date(exp.fecha_inicio);
                                const fechaFin = new Date(exp.fecha_fin);
                                const duracionDias = Math.ceil(
                                    (fechaFin - fechaInicio) /
                                        (1000 * 60 * 60 * 24),
                                );
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
                                            <div className="position-relative">
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
                                                    }}
                                                >
                                                    {exp.tipo_viaje}
                                                </div>
                                                <div
                                                    className="position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill fw-semibold"
                                                    style={{
                                                        backgroundColor:
                                                            "#ffffff",
                                                        color: "#000000",
                                                        fontFamily:
                                                            "Inter, sans-serif",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    {exp.precio} €
                                                </div>
                                            </div>

                                            <div
                                                className="card-body d-flex flex-column text-center"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                }}
                                            >
                                                <h5 className="card-title fw-bold mb-2 mt-5">
                                                    {exp.nombre}
                                                </h5>
                                                <p
                                                    className="card-text flex-grow-1"
                                                    style={{
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    {exp.descripcion.length >
                                                    130
                                                        ? exp.descripcion.substring(
                                                              0,
                                                              130,
                                                          ) + "..."
                                                        : exp.descripcion}
                                                </p>

                                                <ul className="list-unstyled mt-3 mb-4">
                                                    <li
                                                        className="mb-2 d-flex align-items-center"
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
                                                    <li
                                                        className="mb-2 d-flex align-items-center"
                                                        style={{
                                                            fontSize: "14px",
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
                                                    <li
                                                        className="d-flex align-items-center"
                                                        style={{
                                                            fontSize: "14px",
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
                                                </ul>

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
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Botón "Ver todos" SOLO si hay experiencias */}
                        {experiencias.length > 0 && (
                            <div className="text-center mt-4">
                                <Link
                                    to="/experiencias"
                                    className="btn btn-lg"
                                    style={{
                                        backgroundColor: "#000000",
                                        color: " #ffffff",
                                        borderColor: " #ffffff",
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
