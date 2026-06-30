import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Principal = () => {
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState({
        id: null,
        titulo: "",
        fecha_publicacion: "",
        ubicacion: "",
        mapa: "",
        imagenFile: null,
        imagenUrl: "",
    });

    useEffect(() => {
        setLoading(true);

        axios
            .get("/api/blog/obtener-entradas")
            .then((res) => {
                setImages(res.data);
                setFilteredImages(res.data);
            })
            .catch(() => {
                setImages([]);
                setFilteredImages([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setFilteredImages(images);
                return;
            }
            axios
                .get(`/api/blog/buscar?query=${searchTerm}`)
                .then((res) => {
                    const data = Array.isArray(res.data)
                        ? res.data
                        : [res.data];
                    setFilteredImages(data);
                    setCurrentPage(1);
                })
                .catch((err) => console.error(err));
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, images]);

    const indexOfLastImage = currentPage * entriesPerPage;
    const indexOfFirstImage = indexOfLastImage - entriesPerPage;
    const currentImages = filteredImages.slice(
        indexOfFirstImage,
        indexOfLastImage,
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (
        let i = 1;
        i <= Math.ceil(filteredImages.length / entriesPerPage);
        i++
    ) {
        pageNumbers.push(i);
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar entrada del blog?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`/api/blog/eliminar/${id}`)
                    .then(() => {
                        setImages((prev) =>
                            prev.filter((img) => img.id !== id),
                        );
                        setFilteredImages((prev) =>
                            prev.filter((img) => img.id !== id),
                        );
                        Swal.fire(
                            "Eliminado",
                            "La entrada ha sido eliminada.",
                            "success",
                        );
                    })
                    .catch(() => {
                        Swal.fire(
                            "Error",
                            "No se pudo eliminar la entrada.",
                            "error",
                        );
                    });
            }
        });
    };

    const formatDateToInput = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date)) return "";
        return date.toISOString().split("T")[0];
    };

    const openEditModal = (entry) => {
        setEditData({
            id: entry.id,
            titulo: entry.titulo,
            contenido: entry.contenido || "",
            fecha_publicacion: formatDateToInput(entry.fecha_publicacion),
            imagenFile: null,
            imagenUrl: `/storage/blog/${entry.id}/${entry.imagen_destacada}`,
        });
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                setEditData((prev) => ({
                    ...prev,
                    imagenFile: file,
                    imagenUrl: event.target.result, // base64
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveEdit = () => {
        if (!editData.titulo.trim()) {
            Swal.fire("Error", "El título es obligatorio", "error");
            return;
        }
        if (!editData.fecha_publicacion) {
            Swal.fire("Error", "La fecha es obligatoria", "error");
            return;
        }
        if (!editData.contenido.trim()) {
            Swal.fire("Error", "El contenido es obligatorio", "error");
            return;
        }

        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("titulo", editData.titulo);
        formData.append("contenido", editData.contenido);
        formData.append("fecha_publicacion", editData.fecha_publicacion);
        if (editData.imagenFile) {
            formData.append("imagen", editData.imagenFile);
        }

        axios
            .post(`/api/blog/editar/${editData.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => {
                setImages((prev) =>
                    prev.map((entry) =>
                        entry.id === editData.id ? res.data : entry,
                    ),
                );
                setFilteredImages((prev) =>
                    prev.map((entry) =>
                        entry.id === editData.id ? res.data : entry,
                    ),
                );
                Swal.fire(
                    "Éxito",
                    "La entrada ha sido actualizada.",
                    "success",
                );
                setShowModal(false);
            })
            .catch((error) => {
                console.error("Error response:", error.response?.data);
                Swal.fire(
                    "Error",
                    "No se pudo actualizar la entrada.",
                    "error",
                );
            });
    };

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    <br />
                    <br />
                    <h4 className="page-title text-center">
                        Listado de Entradas
                    </h4>

                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                        <div></div>
                        <div className="d-flex align-items-center">
                            <label className="me-2 mb-0">Buscar:</label>
                            <input
                                type="search"
                                className="form-control form-control-sm"
                                style={{ width: 150 }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-responsive p-3">
                        {loading ? (
                            <div className="text-center mt-5">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : (
                            <table className="table table-sm table-bordered align-middle mb-0">
                                <thead>
                                    <tr className="text-secondary text-nowrap">
                                        <th className="text-start">ID</th>
                                        <th className="text-start">Título</th>
                                        <th className="text-start">
                                            Contenido
                                        </th>
                                        <th className="text-start">Imagen</th>
                                        <th className="text-start">
                                            Fecha Publicación
                                        </th>
                                        <th className="text-start">
                                            Operaciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentImages.length > 0 ? (
                                        currentImages.map((entrada) => (
                                            <tr key={entrada.id}>
                                                <td
                                                    style={{
                                                        paddingLeft: "25px",
                                                    }}
                                                >
                                                    {entrada.id}
                                                </td>
                                                <td>{entrada.titulo}</td>
                                                <td
                                                    className="text-truncate"
                                                    style={{
                                                        maxWidth: "200px",
                                                    }}
                                                >
                                                    {entrada.contenido}
                                                </td>
                                                <td>
                                                    <img
                                                        src={`/storage/blog/${entrada.id}/${entrada.imagen_destacada}`}
                                                        alt={entrada.titulo}
                                                        style={{
                                                            width: 80,
                                                            height: 50,
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    {new Date(
                                                        entrada.fecha_publicacion,
                                                    ).toLocaleDateString(
                                                        "es-ES",
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-warning btn-sm me-2"
                                                        onClick={() =>
                                                            openEditModal(
                                                                entrada,
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-pencil-alt"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                entrada.id,
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="text-center text-muted"
                                            >
                                                No se encontraron resultados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Paginación */}
                    <div
                        className="d-flex justify-content-center align-items-center mt-3 text-secondary"
                        style={{ fontSize: "0.75rem" }}
                    >
                        <nav>
                            <ul className="pagination mb-0">
                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setCurrentPage(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                    >
                                        <i className="fas fa-chevron-left" />
                                    </button>
                                </li>

                                {pageNumbers.map((num) => (
                                    <li
                                        key={num}
                                        className={`page-item ${
                                            num === currentPage ? "active" : ""
                                        }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => paginate(num)}
                                        >
                                            {num}
                                        </button>
                                    </li>
                                ))}

                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setCurrentPage(currentPage + 1)
                                        }
                                        disabled={
                                            currentPage === pageNumbers.length
                                        }
                                    >
                                        <i className="fas fa-chevron-right" />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    {/* Modal edición */}
                    {showModal && (
                        <div
                            className="modal fade show d-block"
                            tabIndex="-1"
                            role="dialog"
                            aria-modal="true"
                            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                        >
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            Editar Imagen
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setShowModal(false)}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <form>
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Título
                                                </label>
                                                <input
                                                    type="text"
                                                    name="titulo"
                                                    className="form-control"
                                                    value={editData.titulo}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Fecha
                                                </label>
                                                <input
                                                    type="date"
                                                    name="fecha_publicacion"
                                                    className="form-control"
                                                    value={
                                                        editData.fecha_publicacion ||
                                                        ""
                                                    }
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Contenido
                                                </label>
                                                <textarea
                                                    name="contenido"
                                                    className="form-control"
                                                    value={
                                                        editData.contenido || ""
                                                    }
                                                    onChange={handleInputChange}
                                                    rows={10} // opcional para definir altura
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Imagen
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="form-control"
                                                    onChange={handleFileChange}
                                                />
                                                {editData.imagenUrl && (
                                                    <img
                                                        src={editData.imagenUrl}
                                                        alt="Previsualización"
                                                        style={{
                                                            marginTop: "10px",
                                                            maxWidth: "100px",
                                                            height: "100px",
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSaveEdit}
                                        >
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

export default Principal;
