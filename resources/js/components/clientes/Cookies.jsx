import React from "react";
import { Link } from "react-router-dom";

const Cookies = () => {
  const cookies = [
    {
      nombre: "laravel_session",
      tipo: "Técnica",
      finalidad: "Mantiene la sesión del usuario autenticado entre páginas.",
      duracion: "2 horas (sesión)",
    },
    {
      nombre: "XSRF-TOKEN",
      tipo: "Técnica / Seguridad",
      finalidad: "Protege contra ataques CSRF (falsificación de solicitudes).",
      duracion: "2 horas (sesión)",
    },
  ];

  const secciones = [
    {
      title: "1. ¿Qué es una cookie?",
      content:
        "Una cookie es un pequeño archivo de texto que un sitio web almacena en tu dispositivo cuando lo visitas. Se utiliza para recordar información sobre tu visita, como tu idioma preferido y otras opciones, lo que facilita tu próxima visita y hace que el sitio te resulte más útil.",
    },
    {
      title: "2. ¿Qué cookies utiliza esta web?",
      content: "TABLE",
    },
    {
      title: "3. Cookies de terceros",
      content:
        "Esta web no utiliza cookies de terceros. No empleamos herramientas de análisis de tráfico (como Google Analytics), píxeles de seguimiento publicitario (como Facebook Pixel) ni ninguna otra tecnología de rastreo externo. Los datos de navegación no se comparten con ninguna empresa ajena a Viajes Atalanta.",
    },
    {
      title: "4. ¿Cómo desactivar las cookies?",
      content:
        "Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta que deshabilitar las cookies técnicas puede afectar al funcionamiento de la web (por ejemplo, no podrás mantener la sesión iniciada). Aquí tienes los enlaces a las instrucciones de los principales navegadores:",
      links: [
        { label: "Google Chrome", url: "https://support.google.com/chrome/answer/95647" },
        { label: "Mozilla Firefox", url: "https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web" },
        { label: "Safari", url: "https://support.apple.com/es-es/guide/safari/sfri11471/mac" },
        { label: "Microsoft Edge", url: "https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" },
      ],
    },
    {
      title: "5. Cambios en la política de cookies",
      content:
        "Podemos actualizar esta Política de Cookies cuando sea necesario, por ejemplo si añadimos nuevas funcionalidades a la web. Publicaremos los cambios en esta misma página indicando la fecha de la última actualización.",
    },
    {
      title: "6. Contacto",
      content: "EMAIL",
    },
  ];

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
          backgroundColor: "#000000",
          color: "#ffffff",
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
              background: "linear-gradient(to right, #000000, #ffffff)",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <i
              className="bi bi-cookie"
              style={{ fontSize: "40px", color: "#ffffff" }}
            ></i>
          </div>
          <h2 style={{ fontWeight: "700", color: "#ffffff", fontSize: "40px" }}>
            Política de Cookies
          </h2>
          <p style={{ color: "#ffffff", fontSize: "18px" }}>
            Última actualización: 12 de enero de 2026
          </p>
        </div>

        {/* Secciones */}
        {secciones.map(({ title, content, links }, i) => (
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

            {content === "TABLE" ? (
              <>
                <p style={{ color: "#ffffff", fontSize: "16px", marginBottom: "1rem" }}>
                  Esta web utiliza únicamente cookies técnicas, necesarias para el
                  correcto funcionamiento de la plataforma. No se utilizan cookies
                  de análisis, publicidad ni seguimiento.
                </p>
                <div className="table-responsive">
                  <table
                    className="table table-bordered"
                    style={{
                      color: "#ffffff",
                      fontSize: "14px",
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                        <th style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}>Nombre</th>
                        <th style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}>Tipo</th>
                        <th style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}>Finalidad</th>
                        <th style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}>Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cookies.map((cookie, idx) => (
                        <tr key={idx} style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                          <td style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff", fontFamily: "monospace" }}>
                            {cookie.nombre}
                          </td>
                          <td style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}>
                            {cookie.tipo}
                          </td>
                          <td style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}>
                            {cookie.finalidad}
                          </td>
                          <td style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}>
                            {cookie.duracion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : content === "EMAIL" ? (
              <p style={{ color: "#ffffff", fontSize: "16px" }}>
                Para cualquier consulta sobre el uso de cookies en esta web,
                puedes contactarnos en:{" "}
                <a
                  href="mailto:soporte@viajesatalanta.com"
                  style={{ color: "#f0e6d3", fontWeight: "600" }}
                >
                  soporte@viajesatalanta.com
                </a>
                .
              </p>
            ) : (
              <>
                <p style={{ color: "#ffffff", fontSize: "16px" }}>{content}</p>
                {links && (
                  <ul className="ms-3">
                    {links.map((link, idx) => (
                      <li key={idx} style={{ marginBottom: "0.4rem", fontSize: "15px" }}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#f0e6d3", textDecoration: "underline" }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>
        ))}

        {/* Botón */}
        <div className="text-center mt-5">
          <Link
            to="/"
            className="btn px-4 py-2"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#000000",
              border: "1px solid rgba(255,255,255,0.5)",
              fontWeight: "600",
              fontSize: "12px",
              minWidth: "110px",
              textAlign: "center",
              transition: "all 0.3s ease",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
              e.currentTarget.style.color = "#000000";
            }}
          >
            Entendido, volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
