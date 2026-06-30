import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Leaf, Landmark, Compass } from "lucide-react";
import { useLocation } from "react-router-dom";

const NosotrosComponent = () => {
    const { pathname } = useLocation();

    const values = [
        {
            title: "Sostenibilidad",
            description:
                "Creamos turismo sostenible para aminorar el impacto de la huella turística en cada lugar.",
            icon: Leaf,
        },
        {
            title: "Compromiso cultural",
            description:
                "Promovemos el turismo cultural como forma de contribuir social y económicamente en nuestros destinos.",
            icon: Landmark,
        },
        {
            title: "Integración local",
            description:
                "Respetamos a los lugareños creando comunidad con ellos. Todos aprendemos de todos.",
            icon: Users,
        },
        {
            title: "Espíritu aventurero",
            description:
                "Improvisamos y nos dejamos llevar por las experiencias en cada momento. Le damos caña a tus sentidos para que salgan fuera de su zona de confort.",
            icon: Compass,
        },
    ];

    return (
        <main className="container py-4 py-md-5">
            <div
                className="mb-4"
                style={{ opacity: 1, transform: "translateX(0)" }}
            >
                <button
                    type="button"
                    onClick={() => (window.location.href = "/")}
                    className="btn btn-link d-flex align-items-center mb-4"
                    style={{
                        transition:
                            "color 0.3s ease, background-color 0.3s ease",
                        textDecoration: "none", // quita el subrayado
                        boxShadow: "none", // quita cualquier sombra por defecto
                        color: "#000000",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "10pt",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = " #000000";
                        e.currentTarget.style.backgroundColor =
                            "rgba(53, 55, 46, 0.1)";
                        e.currentTarget.style.textDecoration = "none";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = " #000000";
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.textDecoration = "none";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    <ArrowLeft size={20} className="me-2" />
                    Volver al inicio
                </button>
            </div>
            <br />
            <div className="text-center">
                <h1
                    className="mb-3 fw-bold"
                    style={{
                        marginTop: "-120px",
                        color: "#000000",
                        fontFamily: '"TT Espina Trial Variable", sans-serif',
                        fontSize: "clamp(2rem, 5vw, 4rem)",
                        transform: "scaleX(1.5)",
                        display: "inline-block", // ya queda centrado dentro del div
                    }}
                >
                    Nosotros
                </h1>
            </div>

            <p
                className="lead mx-auto text-center"
                style={{
                    maxWidth: "720px",
                    fontSize: "14pt",
                    color: "#000000",
                }}
            >
            </p>

            {/* Sección de bienvenida y presentación */}
            <section className="container mb-5">
                <div className="row align-items-center">
                    <div className="col-lg-5 order-lg-1 order-2">
                        <div className="text-center text-sm-start mb-5">
                            <h2
                                className="fs-2 fw-bold mb-3"
                                style={{
                                    color: " #000000",
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                ¡Bienvenidos!
                            </h2>

                            <div
                                className="text-light pe-lg-5"
                                style={{ color: " #000000" }}
                            >
                                <p
                                    className="mb-3"
                                    style={{
                                        fontSize: "0.85rem",
                                        color: " #000000",
                                        fontFamily: "Inter, sans-serif",
                                    }}
                                >
                                    <strong>
                                        Es hora de viajar de otra forma ¿No
                                        crees?
                                    </strong>
                                </p>
                                <p
                                    className="mb-3"
                                    style={{
                                        fontSize: "0.85rem",
                                        color: " #000000",
                                        fontFamily: "Inter, sans-serif",
                                    }}
                                >
                                    <strong>
                                        Y para eso estamos aqui. Mi nombre es
                                        Lourdes, una apasionada del turismo
                                        activo y cultural, especializada en dar
                                        forma a experiencias que invitan a salir
                                        de la rutina, afrontar nuevos retos y
                                        conectar con las personas y las
                                        historias que dan vida al mundo.
                                    </strong>
                                </p>

                                <p
                                    className="mb-3"
                                    style={{
                                        fontSize: "0.85rem",
                                        color: " #000000",
                                        fontFamily: "Inter, sans-serif",
                                    }}
                                >
                                    Mi trayectoria tanto académica como
                                    profesional, me ha enseñado que un viaje no
                                    solo se vive, sino que se siente. He tenido
                                    la suerte de poder recorrer múltiples
                                    países, siempre buscando algo más allá de lo
                                    común. La búsqueda de algo más auténtico que
                                    me conectara con cada lugar.
                                </p>

                                <p
                                    className="mb-3"
                                    style={{
                                        fontSize: "0.85rem",
                                        color: " #000000",
                                        fontFamily: "Inter, sans-serif",
                                    }}
                                >
                                    Amante del deporte y la naturaleza desde
                                    pequeñita, he ido estableciendo a lo largo
                                    de mi vida una relación de valores entre
                                    ambas cosas que ha hecho que hoy todos ellos
                                    pasen a formar parte de{" "}
                                    <strong>ATALANTA</strong>.
                                </p>

                                <p
                                    className="mb-3"
                                    style={{
                                        fontSize: "0.85rem",
                                        color: " #000000",
                                        fontFamily: "Inter, sans-serif",
                                    }}
                                >
                                    Creo firmemente que viajar cambia la
                                    manera en la que percibimos el mundo y
                                    como nos vemos a nosotros mismos.
                                    <strong>
                                        Cada lugar te deja marcas invisibles en
                                        tu forma de mirar la vida.
                                    </strong>
                                    Por eso nace este proyecto, para ayudarte a
                                    conectar con otros lugares, culturas y
                                    personas, pero sobretodo conectar con tu
                                    interior.
                                </p>

                                <p
                                    className="mb-0"
                                    style={{
                                        fontSize: "1.2rem",
                                        color: " #000000",
                                        fontFamily: "Inter, sans-serif",
                                    }}
                                >
                                    Y tú, ¿Cuántas versiones de ti mismo tienes
                                    en el mapa?
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-7 order-lg-2 order-1 mb-4 mb-lg-0">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="shadow-lg overflow-hidden rounded-4"
                        >
                            <img
                                src="images/nosotros.jpg"
                                alt="Equipo Wanderlust en reunión"
                                className="img-fluid w-100"
                                style={{
                                    height: "500px",
                                    objectFit: "cover",
                                    borderRadius: "1rem",
                                }}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            <br />
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mb-5"
            >
                <h2
                    className="text-center fw-bold mb-5"
                    style={{
                        color: "#000000",
                        fontFamily: "Inter, sans-serif",
                    }}
                >
                    Nuestros valores
                </h2>

                <div className="row row-cols-1 row-cols-md-2 g-4">
                    {values.map((value, index) => {
                        const Icon = value.icon;
                        return (
                            <motion.div
                                key={value.title}
                                initial={{
                                    x: index % 2 === 0 ? -50 : 50,
                                    opacity: 0,
                                }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{
                                    delay: 0.8 + index * 0.2,
                                    duration: 0.8,
                                }}
                            >
                                <motion.div
                                    animate={{
                                        boxShadow:
                                            "0 8px 20px rgba(0, 0, 0, 0.15)", // sombra base aumentada
                                    }}
                                    whileHover={{
                                        y: -6,
                                        scale: 1.03,
                                        boxShadow:
                                            "0 20px 50px rgba(0, 0, 0, 0.3)", // sombra en hover más intensa
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                    }}
                                    className="card h-100 border border-2 rounded-4"
                                    style={{
                                        borderColor: "#877c4f33",
                                        background: "#000000",
                                        backdropFilter: "blur(6px)",
                                    }}
                                >
                                    <div className="card-body d-flex gap-3">
                                        <div
                                            style={{
                                                background: "#ffffff",
                                                width: "48px",
                                                height: "48px",
                                                borderRadius: "20px",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon
                                                size={24}
                                                style={{ color: "#000000" }}
                                            />
                                        </div>

                                        <div>
                                            <h5
                                                className="fw-bold mt-2"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                    fontSize: "14pt",
                                                }}
                                            >
                                                {value.title}
                                            </h5>
                                            <p
                                                className="mb-0"
                                                style={{
                                                    color: "#ffffff",
                                                    fontFamily:
                                                        "Inter, sans-serif",
                                                    fontSize: "12pt",
                                                }}
                                            >
                                                {value.description}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
            <br />
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="text-center rounded-4 p-5 shadow-lg"
                style={{
                      background: "#000000",
                      color: "#ffffff",
                }}
            >
                <h2
                    className="fw-bold mb-4"
                    style={{
                        fontSize: "1.75rem",
                        fontFamily: "Inter, sans-serif",
                    }}
                >
                    ¿Te unes a nuestra próxima aventura?
                </h2>
                <button
                    type="button"
                    onClick={() => (window.location.href = "/experiencias")}
                    className="btn mt-1"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        color: "#000000",
                        border: "1px solid rgba(255,255,255,0.5)",
                        minWidth: "110px",
                        textAlign: "center",
                        fontSize: "12px", // mismo tamaño que los otros botones
                        transition: "all 0.3s ease",
                        fontFamily: "Inter, sans-serif",
                        padding: "0.5rem 1rem",
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
                    Explorar destinos
                </button>
            </motion.div>
        </main>
    );
};

export default NosotrosComponent;
