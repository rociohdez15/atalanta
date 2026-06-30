import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const EnviarPublicidad = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        asunto: "",
        mensaje: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const enviarPublicidad = () => {
        if (!form.asunto || !form.mensaje) {
            Swal.fire("Error", "Completa todos los campos", "warning");
            return;
        }

        setLoading(true);

        axios
            .post("/api/publicidad/enviar", form)
            .then(() => {
                Swal.fire(
                    "Enviado",
                    "La publicidad se ha enviado a todos los clientes",
                    "success"
                );

                // Limpiar los campos del formulario
                setForm({
                    asunto: "",
                    mensaje: "",
                });

                // Redirigir opcionalmente
                navigate("/publicidad");
            })
            .catch(() => {
                Swal.fire(
                    "Error",
                    "No se pudo enviar la publicidad",
                    "error"
                );
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    {/* Título */}
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Enviar Publicidad
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="container-fluid p-3">
                        <div
                            style={{
                                maxWidth: "700px",
                                margin: "2rem auto",
                                padding: "2rem",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "10px",
                                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                            }}
                        >
                            {/* Asunto */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Asunto del correo
                                </label>
                                <input
                                    type="text"
                                    name="asunto"
                                    className="form-control"
                                    value={form.asunto}
                                    onChange={handleChange}
                                    placeholder="Ej: Oferta especial de verano 🌞"
                                />
                            </div>

                            {/* Mensaje */}
                            <div className="mb-4">
                                <label className="form-label">
                                    Mensaje
                                </label>
                                <textarea
                                    name="mensaje"
                                    className="form-control"
                                    rows={8}
                                    value={form.mensaje}
                                    onChange={handleChange}
                                    placeholder="Escribe aquí el contenido de la publicidad..."
                                    style={{ whiteSpace: "pre-wrap" }}
                                />
                            </div>

                            {/* Botones */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: "1rem",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate("/publicidad")}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className="btn btn-primary"
                                    onClick={enviarPublicidad}
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Enviando..."
                                        : "Enviar publicidad"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnviarPublicidad;
