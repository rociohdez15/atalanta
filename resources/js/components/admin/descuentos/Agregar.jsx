import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CrearDescuento = () => {
    const [titulo, setTitulo] = useState("");
    const [codigo, setCodigo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [enlace, setEnlace] = useState("");
    const [foto, setFoto] = useState(null);
    const [previewFoto, setPreviewFoto] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleFotoChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFoto(file);
            setPreviewFoto(URL.createObjectURL(file));
        } else {
            setFoto(null);
            setPreviewFoto(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!titulo.trim() || !codigo.trim() || !foto) {
            return Swal.fire({
                icon: "error",
                title: "Campos incompletos",
                text: "Título, código y foto son obligatorios.",
                confirmButtonColor: "#d33",
            });
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("codigo", codigo);
        formData.append("descripcion", descripcion || "");
        formData.append("enlace", enlace || "");
        formData.append("foto", foto);

        try {
            const response = await axios.post(
                "/api/descuentos/agregar",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );

            if (response.status === 200 || response.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Descuento creado",
                    text: `El descuento "${titulo}" se ha creado correctamente.`,
                    confirmButtonColor: "#28a745",
                });

                // 🔥 reset igual que colaboraciones
                setTitulo("");
                setCodigo("");
                setDescripcion("");
                setEnlace("");
                setFoto(null);
                setPreviewFoto(null);
            }
        } catch (error) {
            console.error(error);

            let mensaje = "Error al crear el descuento.";

            if (error.response?.data?.errors) {
                mensaje = Object.values(error.response.data.errors)
                    .flat()
                    .join("<br>");
            }

            Swal.fire({
                icon: "error",
                title: "Error",
                html: mensaje,
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
                                    Crear Descuento
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white p-5 rounded-5 shadow-lg col-12 col-md-12 col-lg-10 mx-auto"
                        style={{ maxWidth: "1000px" }}
                    >
                        <form onSubmit={handleSubmit} encType="multipart/form-data">

                            {/* Título */}
                            <div className="mb-3">
                                <label className="form-label">Título</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Código */}
                            <div className="mb-3">
                                <label className="form-label">Código</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Descripción */}
                            <div className="mb-3">
                                <label className="form-label">Descripción</label>
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                />
                            </div>

                            {/* Enlace */}
                            <div className="mb-3">
                                <label className="form-label">Enlace</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={enlace}
                                    onChange={(e) => setEnlace(e.target.value)}
                                />
                            </div>

                            {/* Foto */}
                            <div className="mb-3">
                                <label className="form-label">Foto de portada</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFotoChange}
                                    required
                                />
                            </div>

                            {/* Preview */}
                            {previewFoto && (
                                <div className="mb-3">
                                    <img
                                        src={previewFoto}
                                        alt="preview"
                                        style={{
                                            maxWidth: "150px",
                                            maxHeight: "150px",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </div>
                            )}

                            {/* Botón */}
                            <button
                                type="submit"
                                className="btn btn-success w-100 d-flex justify-content-center align-items-center"
                                style={{ fontWeight: "600", fontSize: "18px" }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Creando...
                                    </>
                                ) : (
                                    "Crear descuento"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearDescuento;