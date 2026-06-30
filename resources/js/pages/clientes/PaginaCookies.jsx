import React, { useEffect } from "react";
import Navbar from "../../components/clientes/Navbar";
import Cookies from "../../components/clientes/Cookies";
import Footer from "../../components/clientes/Footer";

const PaginaContacto = () => {
  useEffect(() => {
    // Cambiar el título de la página
    document.title = "Cookies | Atalanta";

    // Crear meta robots para noindex
    const metaRobots = document.createElement("meta");
    metaRobots.name = "robots";
    metaRobots.content = "noindex";
    document.head.appendChild(metaRobots);

    // Opcional: otras metas
    const metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    metaDescription.content = "Cookies | Atalanta";
    document.head.appendChild(metaDescription);

    const metaKeywords = document.createElement("meta");
    metaKeywords.name = "keywords";
    metaKeywords.content =
      "Book your outdoor adventure, About Us, Find your next getaway, Our Services, Plan Your Camping Trip, How to plan a camping trip, Contact Us";
    document.head.appendChild(metaKeywords);

    const metaViewport = document.createElement("meta");
    metaViewport.name = "viewport";
    metaViewport.content = "width=device-width, initial-scale=1.0";
    document.head.appendChild(metaViewport);

    // Limpiar cuando el componente se desmonte
    return () => {
      document.head.removeChild(metaRobots);
      document.head.removeChild(metaDescription);
      document.head.removeChild(metaKeywords);
      document.head.removeChild(metaViewport);
    };
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ backgroundColor: "#877c4f" }}>
        <br />
        <br />
        <br />
        <Cookies />
      </div>
      <Footer />
    </div>
  );
};

export default PaginaContacto;
