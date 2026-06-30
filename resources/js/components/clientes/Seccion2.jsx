import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Seccion2 = () => {
    const sectionRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false); // Flag para animación
    const { pathname } = useLocation();

    const runAnimation = () => {
        // Reset estilos antes de animar
        $("#sec-d117 .image-container").css({
            opacity: 0,
            position: "relative",
            left: "-50px",
        });

        $("#sec-d117 .text-container").css({
            opacity: 0,
            position: "relative",
            right: "-50px",
        });

        // Animar imagen primero
        $("#sec-d117 .image-container").animate(
            { opacity: 1, left: 0 },
            700,
            "swing",
            () => {
                $("#sec-d117 .text-container")
                    .delay(200)
                    .animate({ opacity: 1, right: 0 }, 700, "swing");
            }
        );
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        runAnimation();
                        setHasAnimated(true); // Marcar como animado
                    }
                });
            },
            { threshold: 0.5 } // 50% visible
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, [hasAnimated]);

    return (
        <section
            ref={sectionRef}
            className="u-clearfix u-container-align-center u-section-2"
            id="sec-d117"
            style={{ backgroundColor: "#000000", color: "white" }}
        >
            <div className="container py-5">
                <div className="row align-items-center justify-content-center">
                    <div className="col-12 col-md-6 text-center text-md-start text-container">
                        <h2
                            className="fs-md-1 fw-bold mb-4"
                            style={{
                                color: "#ffffff",
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            Sobre nosotros
                        </h2>

                        <p
                            className="mb-3 lead mx-auto parrafo-desktop-padding"
                            style={{
                                color: "#ffffff",
                                lineHeight: "1.7",
                                fontSize: "14pt",
                                maxWidth: "720px",
                            }}
                        >
                            En Atalanta creamos aventuras más allá de lo
                            convencional. Nuestras propuestas tienen una
                            conexión directa con el lugar y con su gente.
                            Valoramos la dedicación al 100% y hacemos que cada
                            detalle cuente. Por eso el objetivo no es sólo
                            llevarte a nuevos destinos, sino que tu viaje se
                            convierta en una experiencia enriquecedora antes,
                            durante y después de realizarlo. ¿TE ATREVES A
                            VIVIRLO?
                        </p>
                        <Link
                            to="/nosotros"
                            className="btn btn-primary rounded-3"
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
                            Saber más
                        </Link>
                    </div>

                    <div className="col-12 col-md-6 order-md-last mt-4 mt-md-0 image-container">
                        <div className="position-relative">
                            <div className="rounded-4 overflow-hidden shadow-lg">
                                <img
                                    src="images/yo2.jpg"
                                    alt="Equipo de turismo profesional"
                                    className="img-fluid w-100 rounded-4 shadow-lg"
                                    style={{
                                        objectFit: "cover",
                                        height: "auto", // 🔹 altura automática
                                        maxHeight: "500px", // opcional: máximo para escritorio
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Seccion2;
