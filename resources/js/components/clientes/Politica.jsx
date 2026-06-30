import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Politica = () => {
    const { pathname } = useLocation();

    return (
        <div
            className="min-vh-100 d-flex justify-content-center align-items-start"
            style={{
                backgroundColor: "#ffffff",
                paddingTop: "3rem",
                paddingBottom: "4rem",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
        >
            <div
                className="col-12 col-md-10 col-lg-8 p-4 p-md-5 rounded-4 shadow-lg"
                style={{
                    backgroundColor: " #000000",
                    color: "#ffffff",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    backdropFilter: "blur(6px)",
                    border: "none",
                }}
            >
                {/* Header */}
                <div className="text-center mb-5">
                    <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                        style={{
                            background:
                                "linear-gradient(to right, #000000, #ffffff)",
                            borderRadius: "50%",
                            width: "80px",
                            height: "80px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <i
                            className="bi bi-shield-lock-fill"
                            style={{ fontSize: "40px", color: "#ffffff" }}
                        ></i>
                    </div>
                    <h2
                        style={{
                            fontWeight: "700",
                            color: "#ffffff",
                            fontSize: "40px",
                        }}
                    >
                        Política de Privacidad
                    </h2>
                    <p style={{ color: "#ffffff", fontSize: "18px" }}>
                        Última actualización: 12 de enero de 2026
                    </p>
                </div>

                {/* Secciones de política */}
                {[
                    {
                        title: "1. Identidad del responsable del tratamiento",
                        content:
                            "El responsable del tratamiento de sus datos personales es Viajes Atalanta, con domicilio en Villanueva de los Castillejos (Huelva), España. Para cualquier consulta relacionada con la protección de datos puede contactar en el correo electrónico soporte@viajesatalanta.com.",
                    },
                    {
                        title: "2. Información que recopilamos",
                        content:
                            "Recopilamos datos personales que usted nos proporciona directamente al registrarse, realizar una reserva o contactar con nosotros, tales como nombre, correo electrónico, dirección, teléfono y datos necesarios para la gestión de pagos.",
                    },
                    {
                        title: "3. Finalidad del tratamiento",
                        content:
                            "Utilizamos sus datos para gestionar reservas, prestar nuestros servicios, gestionar pagos, mejorar la experiencia del usuario, enviar comunicaciones relacionadas con el servicio y cumplir con nuestras obligaciones legales.",
                    },
                    {
                        title: "4. Base legal para el tratamiento",
                        content:
                            "La base legal para el tratamiento de sus datos personales es la ejecución de un contrato en el que el interesado es parte, conforme al artículo 6.1.b del Reglamento (UE) 2016/679 (RGPD). Asimismo, el tratamiento puede basarse en el consentimiento del interesado (art. 6.1.a RGPD), el cumplimiento de obligaciones legales (art. 6.1.c RGPD) y el interés legítimo del responsable (art. 6.1.f RGPD), por ejemplo, para mejorar los servicios ofrecidos.",
                    },
                    {
                        title: "5. Normativa aplicable",
                        content:
                            "El tratamiento de los datos personales se realiza conforme al Reglamento (UE) 2016/679 (Reglamento General de Protección de Datos - RGPD) y a la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), así como a la normativa aplicable en materia de consumidores y usuarios.",
                    },
                    {
                        title: "6. Conservación de los datos",
                        content:
                            "Los datos personales se conservarán durante el tiempo necesario para cumplir con la finalidad para la que fueron recogidos y, posteriormente, durante los plazos legalmente establecidos para atender posibles responsabilidades.",
                    },
                    {
                        title: "7. Destinatarios de los datos",
                        content:
                            "Sus datos podrán ser comunicados a proveedores de servicios necesarios para la prestación del servicio (como plataformas de pago, servicios tecnológicos o proveedores de alojamiento web), así como a autoridades públicas cuando sea requerido por ley. En caso de transferencias internacionales de datos, se garantizará el cumplimiento de las medidas adecuadas conforme a la normativa europea.",
                    },
                    {
                        title: "8. Derechos del usuario",
                        listItems: [
                            "Derecho de acceso a sus datos personales.",
                            "Derecho de rectificación de datos inexactos.",
                            "Derecho de supresión de sus datos.",
                            "Derecho de oposición al tratamiento.",
                            "Derecho a la limitación del tratamiento.",
                            "Derecho a la portabilidad de los datos.",
                            "Derecho a no ser objeto de decisiones automatizadas.",
                            "Derecho a retirar el consentimiento en cualquier momento.",
                        ],
                    },
                    {
                        title: "9. Ejercicio de derechos",
                        content:
                            "Puede ejercer sus derechos enviando una solicitud junto con una copia de un documento acreditativo de su identidad al correo soporte@viajesatalanta.com. Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).",
                    },
                    {
                        title: "10. Seguridad de los datos",
                        content:
                            "Se aplican medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado al riesgo, con el fin de proteger los datos personales frente a pérdida, acceso no autorizado o alteración.",
                    },
                    {
                        title: "11. Cookies",
                        content:
                            "Este sitio web utiliza únicamente cookies técnicas necesarias para su correcto funcionamiento, que no requieren el consentimiento del usuario. Actualmente, no se utilizan cookies analíticas, publicitarias ni de personalización. En caso de incorporarlas en el futuro, se implementará el correspondiente sistema de gestión de consentimiento conforme a la normativa vigente.",
                    },
                    {
                        title: "12. Menores de edad",
                        content:
                            "Los servicios ofrecidos no están dirigidos a menores de 18 años. No recopilamos intencionadamente datos personales de menores. En caso de detectar dicho tratamiento, se procederá a su eliminación inmediata.",
                    },
                    {
                        title: "13. Cambios en la política de privacidad",
                        content:
                            "Nos reservamos el derecho a modificar la presente política de privacidad para adaptarla a novedades legislativas o cambios en nuestros servicios. Las modificaciones serán publicadas en esta página.",
                    },
                    {
                        title: "14. Contacto",
                        content: (
                            <>
                                Para cualquier consulta relacionada con esta
                                política puede escribir a{" "}
                                <a
                                    href="mailto:soporte@viajesatalanta.com"
                                    style={{
                                        color: "#2575fc",
                                        fontWeight: "600",
                                    }}
                                >
                                    soporte@viajesatalanta.com
                                </a>
                            </>
                        ),
                    },
                ].map(({ title, content, listItems }, i) => (
                    <section
                        key={i}
                        className="mb-4"
                        style={{ lineHeight: "1.6", color: "#ffffff" }}
                    >
                        <h5
                            style={{
                                fontWeight: "600",
                                marginBottom: "0.8rem",
                                color: "#ffffff",
                                fontSize: "18px",
                            }}
                        >
                            {title}
                        </h5>
                        {listItems ? (
                            <ul className="ms-3">
                                {listItems.map((item, idx) => (
                                    <li
                                        key={idx}
                                        style={{
                                            marginBottom: "0.4rem",
                                            fontSize: "18px",
                                        }}
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p
                                style={{
                                    color: "#ffffff",
                                    fontSize: "16px",
                                }}
                            >
                                {content}
                            </p>
                        )}
                    </section>
                ))}

                {/* Botón */}
                <div className="text-center mt-5">
                    <Link
                        to="/login"
                        className="btn px-4 py-2"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)", // fondo translúcido
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            color: "#000000", // texto marrón
                            border: "1px solid rgba(255,255,255,0.5)", // borde sutil
                            fontWeight: "600",
                            fontSize: "12px",
                            minWidth: "110px",
                            textAlign: "center",
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
                        Entendido, volver al login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Politica;
