import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Listado = () => {
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);

    const [colaboraciones, setColaboraciones] = useState([]);
    const [colaboracionesFiltradas, setColaboracionesFiltradas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState({
        id: null,
        nombre: "",
        web: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        fotoFile: null,
        fotoUrl: "",
    });

    // 🔹 Carga inicial
    useEffect(() => {
        setLoading(true);

        axios
            .get("/api/colaboraciones/listado")
            .then((res) => {
                const data = Array.isArray(res.data)
                    ? res.data
                    : (res.data.data ?? []);
                setColaboraciones(data);
                setColaboracionesFiltradas(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al cargar colaboraciones");
                setLoading(false);
            });
    }, []);

    // 🔹 Búsqueda
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (!searchTerm.trim()) {
                setColaboracionesFiltradas(colaboraciones);
                setCurrentPage(1);
                return;
            }

            const term = searchTerm.toLowerCase();

            const filtered = colaboraciones.filter((c) => {
                return (
                    c.id?.toString().includes(term) ||
                    (c.nombre || "").toLowerCase().includes(term) ||
                    (c.web || "").toLowerCase().includes(term) ||
                    (c.descripcion || "").toLowerCase().includes(term)
                );
            });

            setColaboracionesFiltradas(filtered);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, colaboraciones]);

    // 🔹 Paginación
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentItems = colaboracionesFiltradas.slice(
        indexOfFirst,
        indexOfLast,
    );

    const pageNumbers = [];
    for (
        let i = 1;
        i <= Math.ceil(colaboracionesFiltradas.length / entriesPerPage);
        i++
    ) {
        pageNumbers.push(i);
    }

    const paginate = (number) => setCurrentPage(number);

    // 🔹 Eliminar
    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar colaboración?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`/api/colaboraciones/${id}`)
                    .then(() => {
                        setColaboraciones((prev) =>
                            prev.filter((c) => c.id !== id),
                        );
                        setColaboracionesFiltradas((prev) =>
                            prev.filter((c) => c.id !== id),
                        );
                        Swal.fire(
                            "Eliminado",
                            "Colaboración eliminada correctamente.",
                            "success",
                        );
                    })
                    .catch(() => {
                        Swal.fire("Error", "No se pudo eliminar.", "error");
                    });
            }
        });
    };

    // 🔹 Editar
    const openEditModal = (item) => {
        setEditData({
            id: item.id,
            nombre: item.nombre,
            web: item.web,
            descripcion: item.descripcion,
            fecha_inicio: item.fecha_inicio,
            fecha_fin: item.fecha_fin,
            fotoFile: null,
            fotoUrl: `/storage/colaboraciones/portada/${item.id}/${item.foto}`,
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
            const preview = URL.createObjectURL(file);

            setEditData((prev) => ({
                ...prev,
                fotoFile: file,
                fotoUrl: preview,
            }));

            // 👇 reset input para permitir seleccionar misma imagen otra vez
            e.target.value = null;
        }
    };

    const handleSaveEdit = () => {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("nombre", editData.nombre);
        formData.append("web", editData.web || "");
        formData.append("descripcion", editData.descripcion || "");
        formData.append("fecha_inicio", editData.fecha_inicio || "");
        formData.append("fecha_fin", editData.fecha_fin || "");
        if (editData.fotoFile) formData.append("foto", editData.fotoFile);

        axios
            .post(`/api/colaboraciones/${editData.id}`, formData)
            .then((res) => {
                const updated =
                    res.data.data || res.data.colaboracion || res.data;

                setColaboraciones((prev) =>
                    prev.map((c) => (c.id === editData.id ? updated : c)),
                );

                Swal.fire({
                    icon: "success",
                    title: "Colaboración actualizada",
                    text: "Los cambios se guardaron correctamente",
                    timer: 2000,
                    showConfirmButton: false,
                });

                setShowModal(false);
            })
            .catch(() => {
                Swal.fire("Error", "No se pudo actualizar", "error");
            });
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
                                    Listado de Colaboraciones
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Buscador */}
                    <div className="d-flex justify-content-end mb-3">
                        <label className="me-2">Buscar:</label>
                        <input
                            type="search"
                            className="form-control form-control-sm"
                            style={{ width: 200 }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* CONTENIDO */}
                    <div className="container-fluid p-3">
                        {loading ? (
                            <div className="text-center mt-5">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-danger mt-5">
                                {error}
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered align-middle mb-0">
                                    <thead>
                                        <tr className="text-secondary text-nowrap">
                                            <th>ID</th>
                                            <th>Foto</th>
                                            <th>Nombre</th>
                                            <th>Web</th>
                                            <th>Fecha Inicio</th>
                                            <th>Operaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        navigate(
                                                            `/colaboraciones/${item.id}`,
                                                        )
                                                    }
                                                >
                                                    <td>{item.id}</td>
                                                    <td>
                                                        <img
                                                            src={`/storage/colaboraciones/portada/${item.id}/${item.foto}`}
                                                            alt={item.nombre}
                                                            style={{
                                                                width: 80,
                                                                height: 50,
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{item.nombre}</td>
                                                    <td>{item.web}</td>
                                                    <td>
                                                        {item.fecha_inicio
                                                            ? new Date(
                                                                  item.fecha_inicio,
                                                              ).toLocaleDateString(
                                                                  "es-ES",
                                                              )
                                                            : ""}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditModal(
                                                                    item,
                                                                );
                                                            }}
                                                        >
                                                            <i className="fas fa-pencil-alt"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(
                                                                    item.id,
                                                                );
                                                            }}
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
                                                    No se encontraron
                                                    resultados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Paginación */}
                        <div className="d-flex justify-content-center mt-3">
                            <ul className="pagination">
                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setCurrentPage(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                    >
                                        «
                                    </button>
                                </li>

                                {pageNumbers.map((number) => (
                                    <li
                                        key={number}
                                        className={`page-item ${number === currentPage ? "active" : ""}`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => paginate(number)}
                                        >
                                            {number}
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
                                        »
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div
                        className="modal fade show d-block"
                        style={{ background: "rgba(0,0,0,.5)" }}
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5>Editar colaboración</h5>
                                    <button
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    <input
                                        className="form-control mb-2"
                                        name="nombre"
                                        value={editData.nombre}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        className="form-control mb-2"
                                        name="web"
                                        value={editData.web}
                                        onChange={handleInputChange}
                                    />
                                    <textarea
                                        className="form-control mb-2"
                                        name="descripcion"
                                        value={editData.descripcion}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        type="date"
                                        className="form-control mb-2"
                                        name="fecha_inicio"
                                        value={editData.fecha_inicio}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={handleFileChange}
                                    />
                                    {editData.fotoUrl && (
                                        <img
                                            key={editData.fotoUrl}
                                            src={editData.fotoUrl}
                                            className="mt-2"
                                            style={{ width: 100 }}
                                        />
                                    )}
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
    );
};

export default Listado;
