import { Link } from "react-router-dom";

const Aviso = () => {
    return (
        <div
            className="min-vh-100 d-flex justify-content-center align-items-start"
            style={{
                backgroundColor: "#ffffff",
                paddingTop: "3rem",
                paddingBottom: "4rem",
                fontFamily:
                    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
        >
            <div
                className="col-12 col-md-10 col-lg-8 p-4 p-md-5 rounded-4 shadow-lg"
                style={{
                    backgroundColor: "#000000",
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
                            width: "80px",
                            height: "80px",
                        }}
                    >
                        <i
                            className="bi bi-shield-lock-fill"
                            style={{
                                fontSize: "40px",
                                color: "#ffffff",
                            }}
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

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "18px",
                        }}
                    >
                        Última actualización: 30 de septiembre de 2026
                    </p>
                </div>

                {/* 1. Datos identificativos */}
                <section
                    className="mb-4"
                    style={{
                        lineHeight: "1.6",
                        color: "#ffffff",
                    }}
                >
                    <h5
                        style={{
                            fontWeight: "600",
                            marginBottom: "0.8rem",
                            color: "#ffffff",
                            fontSize: "18px",
                        }}
                    >
                        1. Datos identificativos
                    </h5>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        En cumplimiento de lo establecido en la normativa
                        vigente sobre servicios de la sociedad de la
                        información y comercio electrónico, se informa de los
                        datos identificativos de la titular del presente sitio
                        web:
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <strong>Titular:</strong> Lourdes Hernández Silva
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <strong>Nombre comercial:</strong> Viajes Atalanta
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <strong>Forma jurídica:</strong> Empresaria individual
                        / Autónoma
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <strong>NIF:</strong> 29619278Q
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <strong>Domicilio:</strong> Calle Artillerito, 7, 21540, Villanueva de los Castillejos, Huelva,
                        España
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <strong>Correo electrónico:</strong>{" "}
                        soporte@viajesatalanta.com
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                            marginBottom: 0,
                        }}
                    >
                        La actividad desarrollada a través de este sitio web
                        comprende la comercialización y prestación de servicios
                        relacionados con viajes y experiencias turísticas.
                    </p>
                </section>

                {/* 2. Objeto */}
                <section
                    className="mb-4"
                    style={{
                        lineHeight: "1.6",
                        color: "#ffffff",
                    }}
                >
                    <h5
                        style={{
                            fontWeight: "600",
                            marginBottom: "0.8rem",
                            color: "#ffffff",
                            fontSize: "18px",
                        }}
                    >
                        2. Objeto
                    </h5>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        El presente Aviso Legal regula el acceso, navegación y
                        utilización del sitio web de Viajes Atalanta, así como
                        las responsabilidades derivadas de la utilización de
                        sus contenidos y servicios.
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        El acceso y navegación por el sitio web atribuyen la
                        condición de usuario e implican la aceptación de las
                        condiciones establecidas en el presente Aviso Legal,
                        sin perjuicio de las condiciones particulares que
                        resulten aplicables a determinados servicios.
                    </p>
                </section>

                {/* 3. Condiciones de uso */}
                <section
                    className="mb-4"
                    style={{
                        lineHeight: "1.6",
                        color: "#ffffff",
                    }}
                >
                    <h5
                        style={{
                            fontWeight: "600",
                            marginBottom: "0.8rem",
                            color: "#ffffff",
                            fontSize: "18px",
                        }}
                    >
                        3. Condiciones de uso
                    </h5>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        El usuario se compromete a realizar un uso adecuado
                        del sitio web, de sus contenidos y de los servicios
                        disponibles, de conformidad con la legislación
                        aplicable, la buena fe, el orden público y el presente
                        Aviso Legal.
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        Queda prohibido utilizar el sitio web con fines
                        ilícitos, fraudulentos o contrarios a la legislación
                        vigente, así como realizar cualquier actuación que
                        pueda causar daños al sitio web, a sus sistemas, a la
                        titular o a terceros.
                    </p>
                </section>

                {/* 4. Propiedad intelectual */}
                <section
                    className="mb-4"
                    style={{
                        lineHeight: "1.6",
                        color: "#ffffff",
                    }}
                >
                    <h5
                        style={{
                            fontWeight: "600",
                            marginBottom: "0.8rem",
                            color: "#ffffff",
                            fontSize: "18px",
                        }}
                    >
                        4. Propiedad intelectual e industrial
                    </h5>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        Todos los contenidos del sitio web, incluyendo, entre
                        otros, textos, fotografías, imágenes, diseños,
                        logotipos, iconos, gráficos, vídeos, código fuente,
                        estructura, diseño y demás elementos, están protegidos
                        por la normativa aplicable en materia de propiedad
                        intelectual e industrial.
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        Salvo autorización expresa de la titular o de los
                        correspondientes titulares de los derechos, queda
                        prohibida la reproducción, distribución, comunicación
                        pública, transformación o cualquier otra forma de
                        explotación de dichos contenidos.
                    </p>
                </section>

                {/* 5. Responsabilidad */}
                <section
                    className="mb-4"
                    style={{
                        lineHeight: "1.6",
                        color: "#ffffff",
                    }}
                >
                    <h5
                        style={{
                            fontWeight: "600",
                            marginBottom: "0.8rem",
                            color: "#ffffff",
                            fontSize: "18px",
                        }}
                    >
                        5. Responsabilidad
                    </h5>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        La titular del sitio web adopta las medidas razonables
                        para garantizar el correcto funcionamiento del mismo,
                        la disponibilidad de los contenidos y la seguridad de
                        la información, sin que pueda garantizar la
                        disponibilidad permanente del sitio web ni la
                        inexistencia absoluta de errores o interrupciones.
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        La titular no será responsable de los daños que puedan
                        derivarse de circunstancias ajenas a su control,
                        interrupciones del servicio, fallos de terceros,
                        problemas de conexión o acontecimientos que no puedan
                        ser razonablemente previstos o evitados, sin perjuicio
                        de las responsabilidades que legalmente correspondan.
                    </p>
                </section>

                {/* 6. Enlaces externos */}
                <section
                    className="mb-4"
                    style={{
                        lineHeight: "1.6",
                        color: "#ffffff",
                    }}
                >
                    <h5
                        style={{
                            fontWeight: "600",
                            marginBottom: "0.8rem",
                            color: "#ffffff",
                            fontSize: "18px",
                        }}
                    >
                        6. Enlaces externos
                    </h5>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        El sitio web puede contener enlaces a páginas,
                        plataformas o servicios de terceros. Estos enlaces se
                        facilitan con finalidad meramente informativa.
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        Viajes Atalanta no controla los contenidos, servicios,
                        políticas de privacidad ni condiciones de uso de las
                        páginas de terceros y, por tanto, no asume
                        responsabilidad por ellos, salvo en los casos en que
                        legalmente corresponda.
                    </p>
                </section>

                {/* 7. Protección de datos */}
                <section
                    className="mb-4"
                    style={{
                        lineHeight: "1.6",
                        color: "#ffffff",
                    }}
                >
                    <h5
                        style={{
                            fontWeight: "600",
                            marginBottom: "0.8rem",
                            color: "#ffffff",
                            fontSize: "18px",
                        }}
                    >
                        7. Protección de datos personales
                    </h5>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        El tratamiento de los datos personales realizados a
                        través de este sitio web se efectuará de conformidad
                        con la normativa aplicable en materia de protección de
                        datos personales.
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        La información relativa al tratamiento de los datos
                        personales, las finalidades, bases jurídicas,
                        destinatarios, plazos de conservación y derechos de
                        los usuarios se encuentra disponible en la{" "}
                        <Link
                            to="/politica-privacidad"
                            style={{
                                color: "#ffffff",
                                fontWeight: "600",
                                textDecoration: "underline",
                            }}
                        >
                            Política de Privacidad
                        </Link>
                        .
                    </p>
                </section>

                {/* 8. Servicios y contratación */}
                <section
                    className="mb-4"
                    style={{
                        lineHeight: "1.6",
                        color: "#ffffff",
                    }}
                >
                    <h5
                        style={{
                            fontWeight: "600",
                            marginBottom: "0.8rem",
                            color: "#ffffff",
                            fontSize: "18px",
                        }}
                    >
                        8. Servicios y contratación
                    </h5>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        La información relativa a los servicios turísticos,
                        viajes, experiencias y demás productos ofrecidos a
                        través del sitio web se facilitará de forma clara,
                        comprensible y conforme a la normativa aplicable.
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        Las condiciones específicas de contratación, precios,
                        formas de pago, modificaciones, cancelaciones,
                        reembolsos y demás condiciones aplicables a cada
                        servicio se regirán por las correspondientes
                        condiciones de contratación y por la normativa
                        aplicable.
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        Cuando los servicios ofrecidos tengan la consideración
                        legal de viajes combinados o servicios de viaje
                        vinculados, se proporcionará al viajero la información
                        precontractual y contractual exigida por la normativa
                        vigente.
                    </p>
                </section>

                {/* 9. Precios */}
                <section
                    className="mb-4"
                    style={{
                        lineHeight: "1.6",
                        color: "#ffffff",
                    }}
                >
                    <h5
                        style={{
                            fontWeight: "600",
                            marginBottom: "0.8rem",
                            color: "#ffffff",
                            fontSize: "18px",
                        }}
                    >
                        9. Información sobre precios
                    </h5>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        Los precios de los servicios ofrecidos a través del
                        sitio web se mostrarán de forma clara, indicando, cuando
                        corresponda, los impuestos aplicables y los gastos
                        adicionales que puedan resultar de aplicación.
                    </p>
                </section>

                {/* 10. Legislación */}
                <section
                    className="mb-4"
                    style={{
                        lineHeight: "1.6",
                        color: "#ffffff",
                    }}
                >
                    <h5
                        style={{
                            fontWeight: "600",
                            marginBottom: "0.8rem",
                            color: "#ffffff",
                            fontSize: "18px",
                        }}
                    >
                        10. Legislación aplicable y jurisdicción
                    </h5>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        La relación entre la titular del sitio web y los
                        usuarios se regirá por la legislación española vigente,
                        sin perjuicio de los derechos que correspondan a los
                        consumidores y usuarios conforme a la normativa
                        aplicable.
                    </p>

                    <p
                        style={{
                            color: "#ffffff",
                            fontSize: "16px",
                        }}
                    >
                        Para la resolución de cualquier controversia que pueda
                        surgir en relación con el acceso o utilización del
                        sitio web, serán competentes los juzgados y tribunales
                        que correspondan de conformidad con la legislación
                        aplicable.
                    </p>
                </section>

                {/* Botón */}
                <div className="text-center mt-5">
                    <Link
                        to="/login"
                        className="btn px-4 py-2"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            color: "#000000",
                            border:
                                "1px solid rgba(255,255,255,0.5)",
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