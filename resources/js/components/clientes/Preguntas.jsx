import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    MapPin,
} from "lucide-react";

const preguntas = [
    {
        pregunta: "¿Qué servicios ofrece Atalanta?",
        respuesta:
            "En ATALANTA nos encargamos de que no tengas que preocuparte por nada. Nuestros paquetes tanto de viajes en grupo como individual están diseñados personalmente para cada tipo de viajero, desde que sale de casa hasta que vuelve a ella. Esto incluye: transporte, alojamiento, comidas, actividades y otras especificaciones a tener en cuenta según el destino.",
    },
    {
        pregunta: "¿Se necesita un depósito para reservar?",
        respuesta:
            "Sí. Para asegurar tu plaza en nuestros viajes, pedimos un depósito inicial que varía segun el destino. Este importe se descuenta del precio final del viaje y no será reembolsable en caso de que la propia persona desee cancelar voluntariamente.",
    },
    {
        pregunta:
            "¿Cuándo se confirma el viaje? ¿Qué pasa si no se llega a confirmar y ya he pagado?",
        respuesta:
            "Todos nuestros viajes tienen un número mínimo de plazas que hay que llenar. En cuanto dicho número esté cubierto, tu viaje estará confirmado. Podrás verlo en nuestra web y además te avisaremos por email y WhatsApp.\n\nEn caso de que el número mínimo de plazas no se alcance, el importe pagado como reserva u otras cuotas será devuelto de forma íntegra a través del mismo método de pago por el cual se hizo la reserva y también podrás verlo en la web y avisaremos por los mismos canales anteriormente indicados.",
    },
    {
        pregunta:
            "¿Qué precio tiene la consulta de presupuesto para viajes personalizados y qué incluye?",
        respuesta:
            "El precio de la sesión de consultoría es de 30,00 EUR. Incluye un dosier detallado del destino, que se entregará con el precio aproximado total del viaje en caso de realizarlo con nosotros. El tiempo estimado de la entrega del dosier puede variar dependiendo de las especificaciones que requieras para tu viaje (número de días, actividades, comidas, etc.). Por lo general, tardamos aproximadamente 1 semana en prepararlo. La sesión requiere que se rellene un formulario y que el pago de este importe se realiza previamente, una vez completada la información específica para ello.",
    },
    {
        pregunta: "¿Cuándo y cómo se realiza el pago?",
        respuesta:
            "Para garantizar tu plaza, es necesario un pago inicial de reserva. Esta cantidad será descontada del precio final y en ningún caso será reembolsable. Para el resto del importe ofrecemos planes de pago flexible, por lo que puedes abonarlo por cuotas o en su totalidad. Consulta las condiciones en cada viaje o escríbenos para más detalles. Aceptamos transferencias bancarias, tarjetas de crédito y débito, y algunas plataformas de pago digital como PayPal. Te enviaremos los detalles según tu país de residencia.",
    },
    {
        pregunta: "¿Qué pasa si necesito cancelar el viaje?",
        respuesta:
            "Para cancelar el viaje, será necesario avisar con 30 días de antelación. De esta forma el importe será devuelto de forma íntegra exceptuando la cuota inicial para hacer la reserva. Es decir, si tu viaje tiene un valor de 1.000 EUR y una cuota de reserva de 100 EUR, el importe a devolver será de 900 EUR.",
    },
    {
        pregunta: "¿Compartiré habitación con alguien?",
        respuesta:
            "En nuestros viajes en grupo siempre damos varias opciones de habitación. Normalmente habitaciones dobles o triples, sin embargo, si necesitas tener una habitación individual, podemos ofrecerla siempre que los alojamientos tengan disponibilidad y en este caso es posible que se requiera un coste extra.",
    },
    {
        pregunta: "¿Está prevista una caja/presupuesto común?",
        respuesta:
            "No. En nuestras aventuras grupales cada uno es libre de gastar lo que quiera sin que esto influya en los demás integrantes del grupo.",
    },
        {
        pregunta: "¿Qué es un coordinador?",
        respuesta:
            "El coordinador se trata de aquella persona que te acompañara en el viaje desde que salgas de casa hasta que vuelvas a ella. Te indicará cómo y cuándo proceder con las actividades, horas de comida, tiempo libre etc y se encargará de crear un ambiente de comunidad previo entre todos los miembros del grupo. A esta persona se la conocerá antes del viaje. La figura del coordinador está presente solo en algunas de nuestras aventuras grupales. Esto se especificará en los detalles del paquete. Sin embargo, si lo deseas o necesitas,  en tu aventura personalizada, podemos revisarlo con detenimiento según destino y fechas y asignarlo (bajo coste extra).",
    },
    {
        pregunta: "¿Puedo traspasar el viaje a otra persona?",
        respuesta:
            "No. Nuestros viajes no se pueden traspasar a otra persona.",
    },
    {
        pregunta: "Condiciones generales / privacidad",
        respuesta:
            "Consulta nuestras condiciones generales y políticas de privacidad en la sección correspondiente de nuestra web.",
    },
];

const Preguntas = () => {
    const [abiertaIndex, setAbiertaIndex] = useState(null);

    const { pathname } = useLocation();

    const togglePregunta = (index) => {
        setAbiertaIndex(abiertaIndex === index ? null : index);
    };

    return (
        <div className="container py-5" style={{ minHeight: "80vh" }}>
            {/* Contenido del hero */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="container position-relative text-center"
                style={{ zIndex: 1 }}
            >
                {/* Botón volver */}
                <button
                    type="button"
                    onClick={() => (window.location.href = "/")}
                    className="btn btn-link d-flex align-items-center mb-4"
                    style={{
                        transition:
                            "color 0.3s ease, background-color 0.3s ease",
                        textDecoration: "none",
                        boxShadow: "none",
                        color: "#000000",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10pt",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#000000";
                        e.currentTarget.style.backgroundColor =
                            "rgba(53, 55, 46, 0.1)";
                        e.currentTarget.style.textDecoration = "none";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#000000";
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.textDecoration = "none";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    <ArrowLeft size={20} className="me-2" />
                    Volver al inicio
                </button>
                <h1
                    className="fw-bold"
                    style={{
                        color: "#000000",
                        fontFamily: '"TT Espina Trial Variable", sans-serif',
                        fontSize: "clamp(2rem, 5vw, 4rem)",
                        transform: "scaleX(1.5)", // 1.0 es normal, >1 estira
                        display: "inline-block",
                    }}
                >
                    Preguntas frecuentes
                </h1>
            </motion.div>
            <br />
            <div className="row g-4">
                {preguntas.map((faq, index) => {
                    const estaAbierta = abiertaIndex === index;

                    return (
                        <div key={index} className="col-12">
                            <div
                                className="p-3 rounded"
                                style={{
                                    backgroundColor: "#000000",
                                    color: "#ffffff",
                                    cursor: "pointer",
                                }}
                                onClick={() => togglePregunta(index)}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5
                                        className="mb-0"
                                        style={{
                                            fontSize: "12pt",
                                            fontFamily: "'Inter', sans-serif",
                                        }}
                                    >
                                        <strong>{faq.pregunta}</strong>
                                    </h5>
                                    <span
                                        style={{
                                            transition: "transform 0.4s ease",
                                            transform: estaAbierta
                                                ? "rotate(180deg)"
                                                : "rotate(0deg)",
                                            fontSize: "12pt",
                                            color: "#ffffff",
                                        }}
                                    >
                                        ▼
                                    </span>
                                </div>

                                <div
                                    style={{
                                        maxHeight: estaAbierta
                                            ? "500px"
                                            : "0px",
                                        overflow: "hidden",
                                        transition: "max-height 0.8s ease",
                                    }}
                                >
                                    <p
                                        className="mt-3 mb-0"
                                        style={{
                                            opacity: estaAbierta ? 1 : 0,
                                            transition: "opacity 0.8s ease",
                                            fontSize: "10pt",
                                            fontFamily: "'Inter', sans-serif",
                                        }}
                                    >
                                        {faq.respuesta}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Preguntas;
