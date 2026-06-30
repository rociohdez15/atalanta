import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Crear = () => {
    const [titulo, setTitulo] = useState("");
    const [imagenDestacada, setImagenDestacada] = useState(null);
    const [preview, setPreview] = useState(null);
    const [contenido, setContenido] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setImagenDestacada(null);
            setPreview(null);
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Por favor, selecciona un archivo de imagen válido.");
            setImagenDestacada(null);
            setPreview(null);
            return;
        }

        setError("");
        setImagenDestacada(file);

        // Usamos FileReader para base64 en lugar de URL.createObjectURL
        const reader = new FileReader();
        reader.onload = (event) => {
            setPreview(event.target.result); // base64
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        if (!titulo.trim() || !imagenDestacada || !contenido.trim()) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        setError("");

        const formData = new FormData();
        formData.append("titulo", titulo);
        formData.append("imagen_destacada", imagenDestacada);
        formData.append("contenido", contenido);

        try {
            const response = await axios.post("/api/blog/agregar", formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            Swal.fire({
                icon: "success",
                title: "Entrada agregada",
                text: `La entrada "${titulo}" se ha agregado correctamente.`,
                confirmButtonColor: "#28a745",
            });

            setTitulo("");
            setImagenDestacada(null);
            setPreview(null);
            setContenido("");
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un problema al agregar la entrada.",
            });
        } finally {
            setLoading(false); // 👈 SIEMPRE se ejecuta
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
                                    Agregar Entrada al Blog
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-5 shadow-lg col-12 col-md-8 col-lg-6 mx-auto">
                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                        >
                            <div className="mb-3">
                                <label htmlFor="titulo" className="form-label">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    id="titulo"
                                    className="form-control"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label
                                    htmlFor="imagen_destacada"
                                    className="form-label"
                                >
                                    Imagen Destacada
                                </label>
                                <input
                                    type="file"
                                    id="imagen_destacada"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleImagenChange}
                                    required
                                />
                            </div>

                            {preview && (
                                <div className="mb-3 text-center">
                                    <p>
                                        Previsualización de la imagen destacada:
                                    </p>
                                    <img
                                        src={preview}
                                        alt="Previsualización"
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "300px",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </div>
                            )}

                            <div className="mb-3">
                                <label
                                    htmlFor="contenido"
                                    className="form-label"
                                >
                                    Contenido
                                </label>
                                <textarea
                                    id="contenido"
                                    className="form-control"
                                    rows="6"
                                    value={contenido}
                                    onChange={(e) =>
                                        setContenido(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-success w-100 text-white d-flex justify-content-center align-items-center"
                                style={{
                                    fontWeight: "600",
                                    fontSize: "18px",
                                    height: "45px",
                                }}
                            >
                                {loading ? (
                                    <div
                                        className="spinner-border spinner-border-sm text-light"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Cargando...
                                        </span>
                                    </div>
                                ) : (
                                    "Agregar Entrada"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Crear;
