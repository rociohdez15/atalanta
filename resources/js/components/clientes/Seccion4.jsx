import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const Seccion4 = () => {
    const sectionRef = useRef(null);

    const { pathname } = useLocation();

    const animarSeccion = () => {
        // Reset estilos antes de animar para poder repetir la animación
        $("#sec-5cb4 h2, #sec-5cb4 ul").css({
            opacity: 0,
            position: "relative",
            left: "-50px",
        });

        $("#sec-5cb4 a.btn").css({
            opacity: 0,
            position: "relative",
            top: "50px",
        });

        // Animar título y lista primero (fade + slide desde izquierda)
        $("#sec-5cb4 h2, #sec-5cb4 ul").animate(
            {
                opacity: 1,
                left: 0,
            },
            700,
            "swing",
            () => {
                // Luego animar botón con pequeño delay (fade + slide desde abajo)
                $("#sec-5cb4 a.btn").delay(200).animate(
                    {
                        opacity: 1,
                        top: 0,
                    },
                    700,
                    "swing"
                );
            }
        );
    };

    useEffect(() => {
        // Animar al cargar, por si ya está visible
        animarSeccion();

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animarSeccion();
                        // Opcional: para animar solo una vez, descomenta esta línea:
                        // observer.disconnect();
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="u-clearfix u-container-align-left u-shading u-section-4"
            id="sec-5cb4"
            style={{ backgroundSize: "cover", backgroundPosition: "center" }}
        >
            <br />
            <br />
            <div className="container py-4 px-3">
                <div className="row justify-content-start">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6">
                        <h2
                            className="titulo-nosotros mb-4"
                            style={{ fontSize: "50px", color: "#35372e" }}
                        >
                            Plan Your Camping Trip
                        </h2>

                        <ul
                            className="list-unstyled text-body p-nosotros mb-4"
                            style={{
                                fontSize: "1rem",
                                lineHeight: "1.5",
                                color: "#35372e",
                            }}
                        >
                            {[
                                "Lorem ipsum dolor sit amet",
                                "Ut enim ad minim veniam",
                                "Excepteur sint occaecat cupidatat",
                            ].map((text, i) => (
                                <li
                                    key={i}
                                    className="d-flex align-items-start mb-3"
                                    style={{ paddingLeft: "11px" }}
                                >
                                    <div
                                        className="u-list-icon u-text-palette-2-base me-2 flex-shrink-0"
                                        style={{ fontSize: "1.2em" }}
                                    >
                                        <svg
                                            className="u-svg-content"
                                            viewBox="0 0 512 512"
                                            style={{
                                                display: "block",
                                                width: "1em",
                                                height: "1em",
                                                color: "#35372e",
                                            }}
                                        >
                                            <path
                                                d="m202.6 478-202.6-186.6 70.5-76.6 121.5 111.9 239.4-292.7 80.6 65.9z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </div>
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            to="/experiencias"
                            className="btn btn-primary rounded-pill px-4 py-2"
                            style={{
                                fontWeight: "600",
                                backgroundColor: "#35372e",
                                color: "#fcf4ef",
                                borderColor: "#35372e",
                            }}
                        >
                            Book now
                        </Link>
                    </div>
                </div>
            </div>
            <br />
            <br />
        </section>
    );
};

export default Seccion4;
