import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Crear = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notificacion, setNotificacion] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/notificaciones/notificacion/${id}`)
      .then((res) => {
        setNotificacion(res.data);
      })
      .catch(() => {
        setError("Error al obtener la notificación.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const marcarComoLeido = () => {
    axios
      .put(`/api/notificaciones/notificaciones/leido?id=${id}`)
      .then(() => {
        navigate("/notificaciones");
      });
  };

  const volver = () => {
    navigate("/notificaciones");
  };

  return (
    <div className="content-page">
      <div className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="page-title-box">
                <h4 className="page-title text-center">Detalle de Notificación</h4>
              </div>
            </div>
          </div>

          <div className="container-fluid p-3">
            <div
              style={{
                maxWidth: "700px",
                margin: "2rem auto",
                padding: "2rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                minHeight: "150px",
              }}
            >
              {loading ? (
                <div className="text-center mt-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : error ? (
                <p className="text-center text-danger">{error}</p>
              ) : (
                <>
                  <h4
                    style={{
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>
                        {notificacion.cliente
                          ? `${notificacion.cliente.nombre} ${notificacion.cliente.apellidos}`
                          : "Sin datos"}
                      </strong>{" "}
                      <span
                        style={{
                          color: "#6c757d",
                          fontSize: "0.9rem",
                        }}
                      >
                        &lt;
                        {notificacion.cliente && notificacion.cliente.user
                          ? notificacion.cliente.user.email
                          : "Sin datos"}
                        &gt;
                      </span>
                    </div>
                    <span
                      style={{
                        marginLeft: "auto",
                        color: "#6c757d",
                        fontSize: "0.9rem",
                      }}
                    >
                      {notificacion.fecha
                        ? new Date(notificacion.fecha).toLocaleDateString("en-CA")
                        : ""}
                    </span>
                  </h4>

                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      marginBottom: "2rem",
                    }}
                  >
                    {notificacion.tipo === "resena"
                      ? "Reseña"
                      : notificacion.tipo === "reserva"
                      ? "Reserva"
                      : notificacion.tipo === "like"
                      ? "Like"
                      : notificacion.tipo}
                  </p>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    {!notificacion.is_read && (
                      <button
                        className="btn btn-primary"
                        onClick={marcarComoLeido}
                      >
                        Marcar como leído
                      </button>
                    )}
                    <button className="btn btn-secondary" onClick={volver}>
                      Volver
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Crear;