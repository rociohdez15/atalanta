import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const ColaboracionGaleria = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [colaboracion, setColaboracion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState({
        id: null,
        descripcion_imagen: "",
        file: null,
        url: ""
    });

    /* =======================
       OBTENER COLABORACIÓN
    ======================== */
    useEffect(() => {
        setLoading(true);

        axios.get(`/api/colaboraciones/${id}`)
            .then((res) => {
                setColaboracion(res.data);
                setError(null);
            })
            .catch(() => {
                setError("No se pudo cargar la colaboración");
                Swal.fire("Error", "No se pudo cargar la colaboración", "error");
                navigate("/listado-colaboraciones");
            })
            .finally(() => setLoading(false));
    }, [id]);

    /* =======================
       FILTRAR GALERÍA
    ======================== */
    const filteredGaleria =
        colaboracion?.galeria?.filter((img) =>
            img.descripcion_imagen
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
        ) || [];

    /* =======================
       MODAL EDITAR
    ======================== */
    const openEditModal = (img) => {
        setEditData({
            id: img.id,
            descripcion_imagen: img.descripcion_imagen || "",
            file: null,
            url: img.url
        });
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditData((prev) => ({
                ...prev,
                file,
                url: URL.createObjectURL(file)
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = () => {
        const formData = new FormData();
        formData.append("descripcion_imagen", editData.descripcion_imagen);
        if (editData.file) formData.append("imagen", editData.file);

        axios.post(`/api/colaboraciones/${id}/galeria/${editData.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
            .then((res) => {
                setColaboracion((prev) => ({
                    ...prev,
                    galeria: prev.galeria.map((img) =>
                        img.id === editData.id ? res.data : img
                    )
                }));
                Swal.fire("Éxito", "Imagen actualizada", "success");
                setShowModal(false);
            })
            .catch(() => {
                Swal.fire("Error", "No se pudo actualizar la imagen", "error");
            });
    };

    /* =======================
       ELIMINAR
    ======================== */
    const handleDelete = (imgId) => {
        Swal.fire({
            title: "¿Eliminar imagen?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/api/colaboraciones/${id}/galeria/${imgId}`)
                    .then(() => {
                        setColaboracion((prev) => ({
                            ...prev,
                            galeria: prev.galeria.filter((img) => img.id !== imgId)
                        }));
                        Swal.fire("Eliminado", "Imagen eliminada", "success");
                    });
            }
        });
    };

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid p-3">

                    {/* SPINNER / ERROR / CONTENIDO */}
                    {loading ? (
                        <div className="text-center mt-5">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-danger mt-5">
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* PORTADA */}
                            <div className="text-center mb-4">
                                <img
                                    src={`/storage/colaboraciones/portada/${colaboracion.id}/${colaboracion.foto}`}
                                    alt={colaboracion.nombre}
                                    style={{
                                        width: 250,
                                        height: 150,
                                        objectFit: "cover",
                                        borderRadius: 10
                                    }}
                                />
                            </div>

                            {/* BUSCADOR */}
                            <div className="d-flex justify-content-end mb-2">
                                <label className="me-2 mb-0">Buscar:</label>
                                <input
                                    type="search"
                                    className="form-control form-control-sm"
                                    style={{ width: 150 }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* TABLA */}
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered align-middle mb-0 text-center">
                                    <thead>
                                        <tr className="text-secondary text-nowrap">
                                            <th>ID</th>
                                            <th>Imagen</th>
                                            <th>Descripción</th>
                                            <th>Operaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGaleria.length > 0 ? (
                                            filteredGaleria.map((img) => (
                                                <tr key={img.id}>
                                                    <td>{img.id}</td>
                                                    <td>
                                                        <img
                                                            src={img.url}
                                                            alt={img.descripcion_imagen}
                                                            style={{
                                                                width: 150,
                                                                height: 100,
                                                                objectFit: "cover",
                                                                borderRadius: 8
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{img.descripcion_imagen}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() => openEditModal(img)}
                                                        >
                                                            <i className="fas fa-pencil-alt"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleDelete(img.id)}
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-muted text-center">
                                                    No hay imágenes en la galería
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* MODAL */}
                    {showModal && (
                        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5>Editar imagen</h5>
                                        <button className="btn-close" onClick={() => setShowModal(false)} />
                                    </div>
                                    <div className="modal-body">
                                        <input
                                            className="form-control mb-2"
                                            name="descripcion_imagen"
                                            value={editData.descripcion_imagen}
                                            onChange={handleInputChange}
                                        />
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleFileChange}
                                        />
                                        {editData.url && (
                                            <img
                                                src={editData.url}
                                                className="mt-2"
                                                style={{ width: 150 }}
                                            />
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                            Cancelar
                                        </button>
                                        <button className="btn btn-primary" onClick={handleSaveEdit}>
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ColaboracionGaleria;