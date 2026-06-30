import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaInstagram, FaWhatsapp, FaFacebookF } from "react-icons/fa";

const Footer = () => {
    const { pathname } = useLocation();

    const sameStyle = {
        fontFamily: "Inter, sans-serif",
        fontSize: "15px",
        color: "#ffffff",
        padding: "12px 16px",
        minWidth: "140px",
        textAlign: "center",
        textDecoration: "none",
    };

    return (
        <footer
            className="py-4"
            style={{
                backgroundColor: " #000000",
                borderTop: "1px solid #ffffff",
                fontSize: "10px", // letra más pequeña
            }}
        >
            <div className="container">
                <div className="row justify-content-between align-items-center">
                    {/* Columna izquierda: Redes y FAQ */}
                    <div className="col-md-6 mb-3 text-md-start text-center">
                        <h6
                            className="p-nosotros"
                            style={{
                                fontWeight: "bold",
                                marginBottom: "8px",
                                marginLeft: "10px",
                                fontFamily: "Inter, sans-serif",
                                fontSize: "15px",
                                color: " #ffffff",
                            }}
                        >
                            Síguenos
                        </h6>
                        <div className="mb-2">
                            <a
                                href="https://www.instagram.com/lourhdez?igsh=dmNvN3c4OWo3YnV0"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mx-2"
                                aria-label="Instagram"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "15px",
                                    color: " #ffffff",
                                }}
                            >
                                <FaInstagram size={20} />
                            </a>
                            <a
                                href="https://wa.me/34659633676"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mx-2"
                                aria-label="WhatsApp"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "15px",
                                    color: "#ffffff",
                                }}
                            >
                                <FaWhatsapp size={20} />
                            </a>

                            <a
                                href="https://www.facebook.com/share/1CUMZzfek4/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mx-2"
                                aria-label="Facebook"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "15px",
                                    color: " #ffffff",
                                }}
                            >
                                <FaFacebookF size={20} />
                            </a>
                        </div>
                        <div>
                            <Link
                                to="/faq"
                                className="mx-2 text-decoration-none p-nosotros"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "15px",
                                    color: " #ffffff",
                                }}
                            >
                                Preguntas Frecuentes
                            </Link>
                        </div>
                    </div>

                    {/* Columna derecha: Datos empresa */}
                    <div className="col-md-6 mb-3 text-md-end text-center">
                        <h6
                            className="p-nosotros"
                            style={{
                                fontWeight: "bold",
                                marginBottom: "10px",
                                fontFamily: "Inter, sans-serif",
                                fontSize: "15px",
                                color: " #ffffff",
                            }}
                        >
                            Atalanta
                        </h6>
                        <p
                            className="p-nosotros"
                            style={{
                                margin: 0,
                                fontFamily: "Inter, sans-serif",
                                fontSize: "15px",
                                color: " #ffffff",
                            }}
                        >
                            Villanueva de los Castillejos, Huelva, España
                        </p>
                        <p
                            className="p-nosotros"
                            style={{
                                margin: 0,
                                fontFamily: "Inter, sans-serif",
                                fontSize: "15px",
                                color: " #ffffff",
                            }}
                        >
                            Tel: 614 892 722 | Email: info@viajesatalanta.com
                        </p>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div
                            className="d-flex flex-wrap justify-content-center"
                            style={{ gap: "8px" }}
                        >
                            <Link
                                to="/politica"
                                className="p-nosotros"
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "15px",
                                    color: "#ffffff",
                                    padding: "12px 16px",
                                    minWidth: "140px",
                                    textAlign: "center",
                                    textDecoration: "none",
                                }}
                            >
                                Política de Privacidad
                            </Link>

                            <Link
                                to="/aviso"
                                className="p-nosotros"
                                style={{ ...sameStyle }}
                            >
                                Aviso Legal
                            </Link>

                            <Link
                                to="/terminos"
                                className="p-nosotros"
                                style={{ ...sameStyle }}
                            >
                                Términos y Condiciones
                            </Link>

                            <Link
                                to="/contacto"
                                className="p-nosotros"
                                style={{ ...sameStyle }}
                            >
                                Contacto
                            </Link>

                            <Link
                                to="/cookies"
                                className="p-nosotros"
                                style={{ ...sameStyle }}
                            >
                                Política de Cookies
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 text-center">
                        <p
                            className="small mb-0 p-nosotros"
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "15px",
                                color: " #ffffff",
                            }}
                        >
                            &copy; {new Date().getFullYear()} Atalanta - Todos
                            los derechos reservados
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
