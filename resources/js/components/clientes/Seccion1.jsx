import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const Seccion1 = () => {
  const { pathname } = useLocation();
  const [campanas, setCampanas] = useState([]);
  const [fondoActual, setFondoActual] = useState("/images/fondo1.webp");

  const fondosCampanas = {
    san_valentin: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1600&q=80",
    verano: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1920&q=80",
    black_friday: "https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=1600&q=80",
    navidad: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=1600&q=80",
    default: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
  };

  const textosCampanas = {
    san_valentin: {
      titulo: "Celebra el amor viajando juntos por nuevos caminos",
      p1: "Convierte cada viaje en un momento especial para los dos",
      p2: "Siente el amor",
    },
    verano: {
      titulo: "Vive un verano lleno de aventuras bajo el sol",
      p1: "",
      p2: "",
    },
    black_friday: {
      titulo: "Aprovecha las mejores ofertas para viajar más lejos",
      p1: "Encuentra oportunidades únicas para viajar más por menos",
      p2: "Aprovecha hoy",
    },
    navidad: {
      titulo: "Comparte la magia de viajar en esta época especial",
      p1: "Comparte la magia de descubrir nuevos lugares en familia",
      p2: "Vívela ahora",
    },
    default: {
      titulo: "Viaja con la seguridad de quienes conocen el camino",
      p1: "Explora el mundo con la emoción de lo inesperado",
      p2: "Descúbrelo",
    },
  };

  const [textoActual, setTextoActual] = useState(textosCampanas.default);

  const navigationCardsBase = [
    { title: "Nosotros", iconClass: "fa-users", gradient: "#ffffff", description: "", link: "/nosotros" },
    { title: "Experiencias", iconClass: "fa-earth-americas", gradient: "#ffffff", description: "", link: "/experiencias" },
    { title: "Blog", iconClass: "fa-pencil", gradient: "#ffffff", description: "", link: "/blogger" },
    { title: "Galería", iconClass: "fa-photo-film", gradient: "#ffffff", description: "", link: "/galeria" },
  ];

  useEffect(() => {
    const fetchCampanas = async () => {
      try {
        const res = await axios.get("/api/campanas/activas");
        setCampanas(res.data);
      } catch (error) {
        console.error("Error cargando campañas", error);
      }
    };
    fetchCampanas();
  }, []);

  function normalizarNombre(nombre) {
    if (!nombre) return "";
    const limpio = nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, " ");

    if (limpio.includes("san") && limpio.includes("valentin")) return "san_valentin";
    if (limpio.includes("verano")) return "verano";
    if (limpio.includes("black") || limpio.includes("friday")) return "black_friday";
    if (limpio.includes("navidad")) return "navidad";
    return "default";
  }

  function getIcon(nombre) {
    switch (nombre) {
      case "san_valentin": return "fa-heart";
      case "verano": return "fa-sun";
      case "black_friday": return "fa-bag-shopping";
      case "navidad": return "fa-snowflake";
      default: return "fa-star";
    }
  }

  function getGradient(nombre) {
    switch (nombre) {
      case "san_valentin": return "#ff4d6d";
      case "verano": return "#fbbf24";
      case "black_friday": return "#111827";
      case "navidad": return "#60a5fa";
      default: return "#ffffff";
    }
  }

  // AGRUPAR CAMPAÑAS POR TIPO
  const campanasAgrupadas = campanas.reduce((acc, c) => {
    const nombre = normalizarNombre(c.nombre);
    if (!acc[nombre]) acc[nombre] = [];
    acc[nombre].push(c);
    return acc;
  }, {});

  // Convertir cada grupo en un slide
  const campanasCards = Object.entries(campanasAgrupadas).map(([nombre, grupo]) => {
    return grupo.map((c) => ({
      title: c.titulo,
      iconClass: getIcon(nombre),
      gradient: getGradient(nombre),
      description: c.subtitulo || "",
      link: c.link || "/experiencias",
      nombre,
    }));
  });

  const slides = [navigationCardsBase, ...campanasCards];

  useEffect(() => {
    const carousel = document.getElementById("cardsCarousel");
    if (!carousel) return;

    const handleSlide = () => {
      const activeItem = carousel.querySelector(".carousel-item.active");
      const activeIndex = parseInt(activeItem?.dataset?.index ?? "0", 10);

      if (activeIndex === 0) {
        setFondoActual("/images/fondo1.webp");
        setTextoActual(textosCampanas.default);
        return;
      }

      const grupoIndex = activeIndex - 1;
      const grupoNombre = Object.keys(campanasAgrupadas)[grupoIndex];

      setFondoActual(fondosCampanas[grupoNombre] ?? fondosCampanas.default);
      setTextoActual(textosCampanas[grupoNombre] ?? textosCampanas.default);
    };

    carousel.addEventListener("slid.bs.carousel", handleSlide);
    return () => carousel.removeEventListener("slid.bs.carousel", handleSlide);
  }, [campanasAgrupadas]);

  const CardGrid = ({ grupo, slideIndex }) => (
    <div className="d-flex flex-wrap justify-content-center" style={{ gap: "1rem" }}>
      {grupo.map(({ title, iconClass, link, description }, cardIndex) => (
        <div key={`${slideIndex}-${cardIndex}`} className="nav-card-wrapper">
          <Link to={link} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
            <div
              className="card text-center shadow-sm d-flex flex-column justify-content-center"
              style={{
                width: "230px",
                aspectRatio: "1 / 1",
                padding: "1.5rem",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                color: "#fff",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgb(0 0 0 / 0.2)",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  className="nav-card-icon"
                  style={{
                    marginTop: "1rem",
                    marginBottom: "0.8rem",
                    fontSize: "2.25rem",
                    filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))",
                    textAlign: "center",
                  }}
                >
                  <i className={`fa-solid ${iconClass} nav-card-icon`} style={{ fontSize: "2.5rem" }}></i>
                </div>

                <h5
                  className="fw-bold mb-1 nav-card-title"
                  style={{
                    color: "inherit",
                    wordWrap: "break-word",
                    fontFamily: "Inter, sans-serif",
                    textAlign: "center",
                  }}
                >
                  {title}
                </h5>

                <p
                  style={{
                    color: "inherit",
                    fontSize: "0.875rem",
                    marginTop: "0.25rem",
                    wordWrap: "break-word",
                    textAlign: "center",
                  }}
                >
                  {description}
                </p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );

  return (
    <section
      className="position-relative d-flex align-items-center u-section-1"
      id="sec-0609"
      style={{ minHeight: "auto", paddingTop: "4rem", paddingBottom: "4rem" }}
    >
      <style>{`
        .nav-card-wrapper {
          display: flex;
          flex-direction: column;
        }
        #cardsCarousel .carousel-indicators {
          bottom: -40px !important;
        }
        @media (max-width: 575px) {
          #cardsCarousel .carousel-control-prev,
          #cardsCarousel .carousel-control-next {
            display: none !important;
          }
          .nav-card-wrapper {
            flex: 0 0 calc(50% - 0.5rem);
            max-width: calc(50% - 0.5rem);
          }
          .nav-card-wrapper .card {
            width: 100% !important;
          }
          .nav-card-wrapper .nav-card-icon {
            font-size: 1.5rem !important;
            margin-top: 0.5rem !important;
            margin-bottom: 0.4rem !important;
          }
          .nav-card-wrapper .nav-card-title {
            font-size: 0.85rem !important;
          }
        }
      `}</style>

      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          zIndex: 0,
          overflow: "hidden",
          backgroundImage: `url(${fondoActual})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }} />

      <div className="container text-center position-relative px-3 px-md-5" style={{ zIndex: 2 }}>
        <div className="text-center mb-5">
          <br />
          <h1
            className="fw-bold lh-tight titulo"
            style={{
              fontFamily: '"TT Espina Trial Variable", sans-serif',
              fontSize: "clamp(3rem, 6vw, 6.5rem)",
              color: "#ffffff",
              wordWrap: "break-word",
            }}
          >
            {textoActual.titulo}
          </h1>

          <p className="lead mx-auto" style={{ maxWidth: "720px", fontSize: "14pt", color: "#ffffff" }}>
            {textoActual.p1}&nbsp;
          </p>

          <p className="lead mx-auto" style={{ maxWidth: "720px", fontSize: "14pt", color: "#ffffff" }}>
            {textoActual.p2}&nbsp;
          </p>
        </div>

        {campanas.length > 0 ? (
          <div id="cardsCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-touch="true">
            <div className="carousel-indicators">
              {slides.map((_, i) => (
                <button key={i} type="button" data-bs-target="#cardsCarousel" data-bs-slide-to={i} className={i === 0 ? "active" : ""} />
              ))}
            </div>

            <div className="carousel-inner">
              {slides.map((grupo, index) => (
                <div key={index} data-index={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                  <CardGrid grupo={grupo} slideIndex={index} />
                </div>
              ))}
            </div>

            <button className="carousel-control-prev" type="button" data-bs-target="#cardsCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" />
            </button>

            <button className="carousel-control-next" type="button" data-bs-target="#cardsCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" />
            </button>
          </div>
        ) : (
          <CardGrid grupo={navigationCardsBase} slideIndex={0} />
        )}

        <br />

        <div className="text-center mt-4">
          <Link
            to="/experiencias"
            className="btn me-3 rounded-top-2 rounded-bottom-2 p-nosotros"
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
          >
            Reservar ahora
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Seccion1;
