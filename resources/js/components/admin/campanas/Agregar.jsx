import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CrearCampana = () => {
    const [nombre, setNombre] = useState("");
    const [titulo, setTitulo] = useState("");
    const [subtitulo, setSubtitulo] = useState("");
    const [imagen, setImagen] = useState("");
    const [boton, setBoton] = useState("");
    const [link, setLink] = useState("");
    const [orden, setOrden] = useState(0);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [activo, setActivo] = useState(true);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre.trim() || !titulo.trim()) {
            return Swal.fire({
                icon: "error",
                title: "Campos obligatorios",
                text: "Nombre y título son obligatorios",
                confirmButtonColor: "#d33",
            });
        }

        setLoading(true);

        try {
            const res = await axios.post("/api/campanas", {
                nombre,
                titulo,
                subtitulo,
                imagen,
                boton,
                link,
                orden,
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                activo,
            });

            if (res.status === 200 || res.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Campaña creada",
                    text: `La campaña "${titulo}" se ha creado correctamente.`,
                    confirmButtonColor: "#28a745",
                });

                // Reset form
                setNombre("");
                setTitulo("");
                setSubtitulo("");
                setImagen("");
                setBoton("");
                setLink("");
                setOrden(0);
                setFechaInicio("");
                setFechaFin("");
                setActivo(true);
            }
        } catch (error) {
            let mensaje = "No se pudo crear la campaña.";

            if (error.response?.data?.message) {
                mensaje = error.response.data.message;
            }

            Swal.fire({
                icon: "error",
                title: "Error",
                text: mensaje,
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">

                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Crear Campaña
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white p-5 rounded-5 shadow-lg col-12 col-md-10 mx-auto"
                        style={{ maxWidth: "900px" }}
                    >
                        <form onSubmit={handleSubmit}>

                            <div className="row">

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Nombre *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Título *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="col-12 mb-3">
                                    <label className="form-label">Subtítulo</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={subtitulo}
                                        onChange={(e) => setSubtitulo(e.target.value)}
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Imagen (URL)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={imagen}
                                        onChange={(e) => setImagen(e.target.value)}
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Botón</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={boton}
                                        onChange={(e) => setBoton(e.target.value)}
                                    />
                                </div>

                                <div className="col-12 mb-3">
                                    <label className="form-label">Link</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Orden</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={orden}
                                        onChange={(e) => setOrden(e.target.value)}
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Fecha inicio</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fechaInicio}
                                        onChange={(e) => setFechaInicio(e.target.value)}
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label className="form-label">Fecha fin</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fechaFin}
                                        onChange={(e) => setFechaFin(e.target.value)}
                                    />
                                </div>

                                <div className="col-12 mb-3 d-flex align-items-center">
                                    <label className="me-2">Activa</label>
                                    <input
                                        type="checkbox"
                                        checked={activo}
                                        onChange={(e) => setActivo(e.target.checked)}
                                    />
                                </div>

                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100"
                                disabled={loading}
                                style={{ fontWeight: "600", fontSize: "18px" }}
                            >
                                {loading ? "Creando..." : "Crear campaña"}
                            </button>

                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CrearCampana;