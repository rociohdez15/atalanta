import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Crear = () => {
    const [id, setId] = useState("");
    const [nombre, setNombre] = useState("");
    const [web, setWeb] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [foto, setFoto] = useState(null);
    const [previewFoto, setPreviewFoto] = useState(null);
    const [fechaInicio, setFechaInicio] = useState("");
    const [loading, setLoading] = useState(false);

    const [galeria, setGaleria] = useState([
        { ruta_imagen: null, descripcion_imagen: "" },
    ]);
    const [previewGaleria, setPreviewGaleria] = useState([null]);

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

    const handleGaleriaChange = (index, file) => {
        const nuevasGaleria = [...galeria];
        nuevasGaleria[index].ruta_imagen = file;
        setGaleria(nuevasGaleria);

        const nuevasPreviews = [...previewGaleria];
        nuevasPreviews[index] = file ? URL.createObjectURL(file) : null;
        setPreviewGaleria(nuevasPreviews);
    };

    const handleDescripcionGaleriaChange = (index, valor) => {
        const nuevasGaleria = [...galeria];
        nuevasGaleria[index].descripcion_imagen = valor;
        setGaleria(nuevasGaleria);
    };

    const agregarImagenGaleria = () => {
        setGaleria([...galeria, { ruta_imagen: null, descripcion_imagen: "" }]);
        setPreviewGaleria([...previewGaleria, null]);
    };

    const eliminarImagenGaleria = (index) => {
        const nuevasGaleria = [...galeria];
        nuevasGaleria.splice(index, 1);
        setGaleria(nuevasGaleria);

        const nuevasPreviews = [...previewGaleria];
        nuevasPreviews.splice(index, 1);
        setPreviewGaleria(nuevasPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !nombre.trim() ||
            !descripcion.trim() ||
            !foto ||
            !fechaInicio ||
            galeria.some(
                (img) => !img.ruta_imagen || !img.descripcion_imagen.trim(),
            )
        ) {
            return Swal.fire({
                icon: "error",
                title: "Campos incompletos",
                text: "Todos los campos son obligatorios y debes subir imágenes con descripción.",
                confirmButtonColor: "#d33",
            });
        }

        setLoading(true); // 🔥 activar spinner

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("web", web);
        formData.append("descripcion", descripcion);
        formData.append("fecha_inicio", fechaInicio);
        formData.append("foto", foto);

        galeria.forEach((img) => {
            formData.append("galeria[]", img.ruta_imagen);
            formData.append("galeria_descripcion[]", img.descripcion_imagen);
        });

        try {
            const response = await axios.post(
                "/api/colaboraciones/agregar",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );

            if (response.status === 200 || response.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Colaboración creada",
                    text: `La colaboración "${nombre}" se ha creado correctamente.`,
                    confirmButtonColor: "#28a745",
                });

                // Limpiar campos
                setNombre("");
                setWeb("");
                setDescripcion("");
                setFoto(null);
                setPreviewFoto(null);
                setFechaInicio("");
                setGaleria([{ ruta_imagen: null, descripcion_imagen: "" }]);
                setPreviewGaleria([null]);
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un problema al crear la colaboración. Inténtalo de nuevo.",
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false); // 🔥 desactivar spinner SIEMPRE
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
                                    Crear Colaboración
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white p-5 rounded-5 shadow-lg col-12 col-md-12 col-lg-10 mx-auto"
                        style={{ maxWidth: "1000px" }}
                    >
                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                        >
                            {/* Nombre */}
                            <div className="mb-3">
                                <label htmlFor="nombre" className="form-label">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    className="form-control"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Web */}
                            <div className="mb-3">
                                <label htmlFor="web" className="form-label">
                                    Web
                                </label>
                                <input
                                    type="text"
                                    id="web"
                                    className="form-control"
                                    value={web}
                                    onChange={(e) => setWeb(e.target.value)}
                                />
                            </div>

                            {/* Descripción */}
                            <div className="mb-3">
                                <label
                                    htmlFor="descripcion"
                                    className="form-label"
                                >
                                    Descripción
                                </label>
                                <textarea
                                    id="descripcion"
                                    className="form-control"
                                    rows="4"
                                    value={descripcion}
                                    onChange={(e) =>
                                        setDescripcion(e.target.value)
                                    }
                                    required
                                ></textarea>
                            </div>

                            {/* Fecha inicio */}
                            <div className="mb-3">
                                <label
                                    htmlFor="fechaInicio"
                                    className="form-label"
                                >
                                    Fecha Inicio
                                </label>
                                <input
                                    type="date"
                                    id="fechaInicio"
                                    className="form-control"
                                    value={fechaInicio}
                                    onChange={(e) =>
                                        setFechaInicio(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {/* Foto de portada */}
                            <div className="mb-3">
                                <label className="form-label" htmlFor="foto">
                                    Foto de portada
                                </label>
                                <input
                                    type="file"
                                    id="foto"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFotoChange}
                                    required
                                />
                            </div>
                            {previewFoto && (
                                <div className="mb-3">
                                    <img
                                        src={previewFoto}
                                        alt="Previsualización"
                                        style={{
                                            maxWidth: "150px",
                                            maxHeight: "150px",
                                            borderRadius: "8px",
                                        }}
                                    />
                                </div>
                            )}

                            {/* Galería */}
                            <div className="mb-4">
                                <label className="form-label fw-bold text-center d-block fs-3">
                                    Galería de imágenes
                                </label>
                                {galeria.map((img, index) => (
                                    <div
                                        key={index}
                                        className="mb-3 border rounded p-3"
                                    >
                                        <input
                                            type="file"
                                            className="form-control mb-2"
                                            accept="image/*"
                                            onChange={(e) =>
                                                handleGaleriaChange(
                                                    index,
                                                    e.target.files[0],
                                                )
                                            }
                                            required
                                        />
                                        <input
                                            type="text"
                                            className="form-control mb-2"
                                            placeholder="Descripción de la imagen"
                                            value={img.descripcion_imagen}
                                            onChange={(e) =>
                                                handleDescripcionGaleriaChange(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {previewGaleria[index] && (
                                            <img
                                                src={previewGaleria[index]}
                                                alt={`Vista previa ${index + 1}`}
                                                style={{
                                                    maxWidth: "150px",
                                                    maxHeight: "150px",
                                                    borderRadius: "8px",
                                                    marginTop: "10px",
                                                }}
                                            />
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm mt-2"
                                            onClick={() =>
                                                eliminarImagenGaleria(index)
                                            }
                                        >
                                            &times; Eliminar imagen
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={agregarImagenGaleria}
                                >
                                    + Añadir imagen
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100 text-white d-flex justify-content-center align-items-center"
                                style={{ fontWeight: "600", fontSize: "18px" }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                        Creando...
                                    </>
                                ) : (
                                    "Crear colaboración"
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
