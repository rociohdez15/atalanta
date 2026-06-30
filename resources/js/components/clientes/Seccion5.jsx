import React, { useEffect, useRef, useState } from "react";
import { Star, Loader } from "lucide-react";
import axios from "axios";

const Seccion5 = () => {
    const sectionRef = useRef(null);
    const hasAnimatedRef = useRef(false);

    const [startIndex, setStartIndex] = useState(0);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slidesPerView, setSlidesPerView] = useState(3);

    const calculateSlidesPerView = () => {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 992) return 2;
        return 3;
    };

    useEffect(() => {
        const handleResize = () => {
            const slides = calculateSlidesPerView();
            setSlidesPerView(slides);
            setStartIndex((prev) =>
                Math.min(prev, Math.max(0, testimonials.length - slides)),
            );
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [testimonials.length]);

    useEffect(() => {
        setLoading(true);
        axios
            .get("/api/resenas/mostrar?perPage=100")
            .then((res) => {
                setTestimonials(res.data.data ?? res.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const prev = () => {
        if (startIndex > 0) setStartIndex(startIndex - 1);
    };

    const next = () => {
        if (startIndex < testimonials.length - slidesPerView) {
            setStartIndex(startIndex + 1);
        }
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "300px" }}
            >
                <Loader size={64} className="spin" color="#000000" />
            </div>
        );
    }

    return (
        <section ref={sectionRef} className="text-center py-5" id="sec-55f1">
            <div className="container">
                <div className="mb-5">
                    <h2
                        className="display-5 fw-bold"
                        style={{
                            color: "#000000",
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        Opiniones de nuestros viajeros
                    </h2>
                    <p
                        className="fs-5"
                        style={{
                            color: "#000000",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "14pt",
                        }}
                    >
                        Lo que dicen quienes ya han vivido la experiencia
                    </p>
                </div>

                {/* 👉 MENSAJE SI NO HAY RESEÑAS */}
                {testimonials.length === 0 && (
                    <p
                        className="p-nosotros"
                        style={{
                            color: " #000000",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "12pt",
                            marginTop: "-30px",
                        }}
                    >
                        Aún no hay reseñas disponibles. Sé la primera persona en
                        compartir tu experiencia.
                    </p>
                )}

                {/* 👉 CARRUSEL SOLO SI HAY RESEÑAS */}
                {testimonials.length > 0 && (
                    <div className="position-relative d-flex align-items-center">
                        <button
                            onClick={prev}
                            disabled={startIndex === 0}
                            className="btn"
                            style={{
                                marginRight: "15px",
                                backgroundColor: "#000000",
                                color: "#ffffff",
                            }}
                        >
                            &lt;
                        </button>

                        <div className="row flex-nowrap overflow-hidden w-100">
                            {testimonials
                                .slice(startIndex, startIndex + slidesPerView)
                                .map((t) => (
                                    <div
                                        className="col-12 col-md-6 col-lg-4 mb-4"
                                        key={t.id}
                                    >
                                        <div
                                            className="card h-100"
                                            style={{
                                                backgroundColor: "#000000",
                                            }}
                                        >
                                            <div
                                                className="card-body d-flex flex-column justify-content-between p-4"
                                                style={{ minHeight: "250px" }}
                                            >
                                                <div>
                                                    <div className="d-flex mb-3">
                                                        {[
                                                            ...Array(
                                                                t.num_estrellas,
                                                            ),
                                                        ].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={16}
                                                                style={{
                                                                    fill: "#efb66a",
                                                                    color: "#efb66a",
                                                                }}
                                                            />
                                                        ))}
                                                    </div>

                                                    <p className="fst-italic text-white mb-4">
                                                        "{t.texto}"
                                                    </p>
                                                </div>

                                                <div className="d-flex align-items-center mt-3">
                                                    <img
                                                        src={
                                                            t.foto_cliente ||
                                                            "/images/usuario.png"
                                                        }
                                                        alt="Usuario"
                                                        className="rounded-circle me-3"
                                                        style={{
                                                            width: 48,
                                                            height: 48,
                                                        }}
                                                    />
                                                    <div className="text-white text-start">
                                                        <strong>
                                                            {t.nombre}{" "}
                                                            {t.apellidos}
                                                        </strong>
                                                        <small className="d-block">
                                                            {new Date(
                                                                t.fecha,
                                                            ).toLocaleDateString()}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        <button
                            onClick={next}
                            disabled={
                                startIndex >=
                                testimonials.length - slidesPerView
                            }
                            className="btn"
                            style={{
                                marginLeft: "15px",
                                backgroundColor: "#000000",
                                color: "#ffffff",
                            }}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Seccion5;
