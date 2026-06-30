import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Terminos = () => {
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
                            className="bi bi-shield-fill"
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
                        Términos y Condiciones de Uso
                    </h2>
                    <p style={{ color: "#ffffff", fontSize: "18px" }}>
                        Última actualización: 12 de enero de 2026
                    </p>
                </div>

                <p
                    style={{
                        lineHeight: "1.7",
                        color: "#ffffff",
                        fontSize: "16px",
                    }}
                >
                    Al utilizar los servicios prestados por Viajes Atalanta a
                    través de este sitio web: https://www.viajesatalanta.com/ ,
                    usted acepta los Términos y Condiciones Generales que se
                    detallan a continuación y las condiciones generales de uso
                    del sitio. Al acceder al sitio y aceptar las condiciones,
                    usted también declara ser mayor de edad y tener capacidad
                    jurídica. De conformidad con este acuerdo, los servicios de
                    procesamiento de pagos con tarjeta de crédito para bienes
                    y/o servicios adquiridos en este sitio son proporcionados
                    por la empresa matriz Viajes Atalanta. Al acceder al sitio y
                    aceptar las condiciones, usted también declara ser mayor de
                    18 años y tener capacidad de obrar.
                </p>

                {/* Secciones mapeadas */}
                {[
                    {
                        title: "1. Fuentes legislativas.",
                        content:
                            "Al utilizar los servicios prestados por Viajes Atalanta a través de este sitio web: https://www.viajesatalanta.com/ , usted acepta los Términos y Condiciones Generales que se detallan a continuación y las condiciones generales de uso del sitio. Al acceder al sitio y aceptar las condiciones, usted también declara ser mayor de edad y tener capacidad jurídica. De conformidad con este acuerdo, los servicios de procesamiento de pagos con tarjeta de crédito para bienes y/o servicios adquiridos en este sitio son proporcionados por la empresa matriz Viajes Atalanta. Al acceder al sitio y aceptar las condiciones, usted también declara ser mayor de 18 años y tener capacidad de obrar.",
                    },
                    {
                        title: "2. Autorizaciones",
                        content:
                            "Viajes Atalanta, a quien se dirige el Usuario, dispone de las autorizaciones pertinentes para realizar las respectivas actividades de acuerdo con la legislación administrativa aplicable.",
                    },
                    {
                        title: "3. Información obligatoria",
                        content:
                            "Viajes Atalanta debe crear una ficha técnica en el programa, ya sea de catálogo o no. La información obligatoria que debe incluirse es la siguiente:\n\n" +
                            "1. Detalles de la póliza de seguro de responsabilidad civil.\n" +
                            "2. Periodo del programa catalogado o no catalogado.\n" +
                            "3. Modalidades y condiciones de sustitución del viajero.",
                    },
                    {
                        title: "4. Duración de la oferta y precio del alojamiento",
                        content:
                            "Las ofertas propuestas en el Sitio web son válidas mientras estén presentes en el sitio, hasta que se agoten las plazas disponibles, y pueden variar en tiempo real.\n\n" +
                            "El precio del alojamiento depende de la época del año y del número de participantes. No incluye: seguros, tasas de estancia, tasas de salida, visados y costes administrativos y sanitarios, suplemento por habitación individual, comidas y bebidas no incluidas, llamadas de teléfono, visitas y excursiones opcionales, actividades de pago, gastos personales y propinas.\n\n" +
                            "Las descripciones de los alojamientos especifican las prestaciones incluidas en el precio y condiciones particulares, si las hubiera.",
                    },
                    {
                        title: "5. Reserva",
                        content:
                            "El Usuario que desee reservar deberá manifestar su voluntad a través de la solicitud en el sitio web.\n\n" +
                            "Las solicitudes tienen valor de propuestas contractuales irrevocables y se aceptan una vez que el Usuario haya aceptado los T&C y proporcionado los datos de pago.\n\n" +
                            "La aceptación de los T&C implica reconocimiento y aceptación por parte del Usuario en nombre de todos los viajeros.",
                    },
                    {
                        title: "6. Opciones de pago",
                        content:
                            "El Usuario puede pagar el precio total al momento o, cuando esté disponible, fraccionar el pago.\n\n" +
                            "El primer plazo se abona al realizar la reserva; el resto al menos 14 días antes de la fecha de entrada al hotel. Si el pago no se realiza correctamente, Viajes Atalanta puede intentar cobrar y, si no se completa, cancelar la reserva y reembolsar el depósito.\n\n" +
                            "Los pagos se procesan mediante métodos seguros. Especificaciones:\n" +
                            "- Tarjetas europeas: 2,9% + 0,25 €\n" +
                            "- Tarjetas no europeas: 3,9% + 0,25 €\n" +
                            "- Conversión de divisas: 1% adicional\n" +
                            "- Otros métodos: Bizum/Apple Pay/Google Pay: mismas tarifas que tarjeta corriente; SEPA Direct Debit: 0,8% (máx. 5 €); Transferencias internacionales: según moneda y país.",
                    },
                    {
                        title: "7. Exclusión del derecho de desistimiento",
                        content:
                            "Salvo que se indique lo contrario en estos T&C, para todas las reservas y compras de servicios efectuadas con Viajes Atalanta, el Usuario no tendrá derecho de desistimiento previsto para los contratos a distancia y fuera de las sedes comerciales.",
                    },
                    {
                        title: "8. Alojamiento y estancia",
                        content:
                            "a. Categoría del hotel: según normas locales, pueden variar respecto a normas europeas. Las valoraciones son orientativas y no constituyen garantía.\n" +
                            "b. Entrada y salida: check-in a partir de las 14:00, check-out antes de las 12:00. Horas adicionales no generan reembolso.\n" +
                            "c. Habitaciones: dobles, con dos camas individuales o una matrimonial.\n" +
                            "d. Comidas: según la fórmula elegida (Todo incluido, Pensión completa, Media pensión). Bebidas no incluidas salvo excepciones indicadas; consumiciones extra a cargo del Cliente.",
                    },
                    {
                        title: "9. Foto",
                        content:
                            "Viajes Atalanta proporciona fotografías e ilustraciones con carácter ilustrativo, excepto cuando indican la categoría o nivel de los servicios.",
                    },
                    {
                        title: "10. Reclamaciones",
                        content:
                            "Las reclamaciones por ejecución errónea del contrato deben notificarse al proveedor en 24 horas y por escrito a Viajes Atalanta en un plazo máximo de 30 días desde el regreso. Los gastos de comunicación correrán a cargo del Usuario.",
                    },
                    {
                        title: "11. Cambios",
                        content:
                            "Algunas reservas no admiten cambios. En esos casos, se deberá cancelar y realizar una nueva reserva, sin garantía de que el precio original esté disponible.",
                    },
                    {
                        title: "12. Documentos de identidad, visados y requisitos sanitarios",
                        content:
                            "El Usuario es responsable de verificar pasaportes, visados, vacunaciones y regulaciones sanitarias. La información puede variar según nacionalidad y país. Es responsabilidad del Usuario disponer de toda la documentación necesaria.",
                    },
                    {
                        title: "13. Ley y jurisdicción aplicable",
                        content:
                            "Profesionales y empresas: T&C regidos por ley española, tribunales del domicilio del consumidor.\n" +
                            "Consumidores: T&C regidos por ley española; tribunales del domicilio del consumidor o de la Sociedad según corresponda.\n" +
                            "Plataforma ODR de la Comisión Europea: http://ec.europa.eu/consumers/odr",
                    },
                    {
                        title: "14. Privacidad y protección de datos",
                        content: (
                            <>
                                Viajes Atalanta respeta tu privacidad. Toda la
                                información personal será tratada conforme a
                                nuestra{" "}
                                <Link
                                    to="/politica"
                                    style={{
                                        color: "#2575fc",
                                        fontWeight: "600",
                                    }}
                                >
                                    Política de Privacidad
                                </Link>
                                . No compartiremos ni venderemos tus datos a
                                terceros sin tu consentimiento.
                            </>
                        ),
                    },
                    {
                        title: "15. Obligaciones del usuario",
                        listItems: [
                            "No utilizar la plataforma para fines ilegales o no autorizados.",
                            "No interferir con el funcionamiento del sitio o de otros usuarios.",
                            "No publicar contenido falso, ofensivo o que viole derechos de terceros.",
                        ],
                    },
                    {
                        title: "16. Propiedad intelectual",
                        content:
                            "Todos los derechos sobre el contenido, diseño, imágenes, marcas y software de Atalanta pertenecen a la empresa o a sus licenciantes. Está prohibido copiar, reproducir o distribuir cualquier contenido sin autorización expresa.",
                    },
                    {
                        title: "17. Limitación de responsabilidad",
                        content:
                            "Viajes Atalanta no será responsable por daños directos o indirectos derivados del uso o imposibilidad de uso de la plataforma, incluyendo pérdida de datos, interrupciones del servicio o fallos en las reservas causados por terceros.",
                    },
                    {
                        title: "18. Suspensión o terminación",
                        content:
                            "Viajes Atalanta podrá suspender o cancelar el acceso de un usuario si considera que ha violado estos términos o ha realizado actividades fraudulentas, ilegales o dañinas para otros usuarios o la plataforma.",
                    },
                    {
                        title: "19. Contacto",
                        content: (
                            <>
                                Para cualquier consulta sobre estos Términos y
                                Condiciones, puedes escribirnos a:{" "}
                                <a
                                    href="mailto:soporte@viajesatalanta.com"
                                    style={{
                                        color: "#2575fc",
                                        fontWeight: "600",
                                    }}
                                >
                                    soporte@viajesatalanta.com
                                </a>
                                .
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
                                    whiteSpace: "pre-line", // 👈 CLAVE
                                }}
                            >
                                {content}
                            </p>
                        )}
                    </section>
                ))}

                <div className="text-center mt-5">
                    <Link
                        to="/login"
                        className="btn px-4 py-2 rounded-top-2"
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

export default Terminos;
