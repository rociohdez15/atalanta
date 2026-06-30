import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Aviso = () => {
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
                        Aviso Legal
                    </h2>
                    <p style={{ color: "#ffffff", fontSize: "18px" }}>
                        Última actualización: 12 de enero de 2026
                    </p>
                </div>

                {/* Secciones de política */}
                {[
                    {
                        title: "1. Datos identificativos",
                        content:
                            "En cumplimiento con el deber de información recogido en la normativa vigente, se informa que el presente sitio web es titularidad de Viajes Atalanta, con domicilio en Villanueva de los Castillejos (Huelva), España. Para cualquier consulta puede contactar en el correo electrónico soporte@viajesatalanta.com.",
                    },
                    {
                        title: "2. Objeto",
                        content:
                            "El presente Aviso Legal regula el acceso y uso del sitio web, así como los servicios ofrecidos a través del mismo. El acceso y navegación por este sitio web atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas las disposiciones incluidas en este Aviso Legal.",
                    },
                    {
                        title: "3. Condiciones de uso",
                        content:
                            "El usuario se compromete a hacer un uso adecuado del sitio web y de sus contenidos, conforme a la legislación vigente, la buena fe y el orden público. Queda prohibido el uso del sitio web con fines ilícitos o que puedan causar perjuicio al titular o a terceros.",
                    },
                    {
                        title: "4. Propiedad intelectual e industrial",
                        content:
                            "Todos los contenidos del sitio web, incluyendo textos, imágenes, diseños, logotipos, código fuente y demás elementos, están protegidos por los derechos de propiedad intelectual e industrial y pertenecen a Viajes Atalanta o a terceros autorizados. Queda prohibida su reproducción, distribución o modificación sin autorización expresa.",
                    },
                    {
                        title: "5. Responsabilidad",
                        content:
                            "El titular no se hace responsable de los daños o perjuicios que pudieran derivarse del uso del sitio web, ni garantiza la ausencia de virus u otros elementos que puedan causar alteraciones en los sistemas informáticos del usuario.",
                    },
                    {
                        title: "6. Enlaces externos",
                        content:
                            "En caso de que en el sitio web se dispongan enlaces a páginas de terceros, el titular no asume responsabilidad alguna sobre dichos contenidos ni sobre las políticas de privacidad de dichos sitios.",
                    },
                    {
                        title: "7. Protección de datos",
                        content:
                            "El tratamiento de los datos personales se rige por lo establecido en la Política de Privacidad, accesible desde este sitio web.",
                    },
                    {
                        title: "8. Legislación aplicable y jurisdicción",
                        content:
                            "La relación entre el titular y el usuario se regirá por la normativa española vigente. Para la resolución de cualquier conflicto que pudiera surgir, las partes se someterán a los juzgados y tribunales que correspondan conforme a la legislación aplicable.",
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

export default Aviso;
