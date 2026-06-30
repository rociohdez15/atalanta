import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Listado = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);

    const [descuentos, setDescuentos] = useState([]);
    const [descuentosFiltrados, setDescuentosFiltrados] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const [editData, setEditData] = useState({
        id: null,
        titulo: "",
        codigo: "",
        descripcion: "",
        enlace: "",
        fotoFile: null,
        fotoUrl: "",
    });

    // 🔹 Carga inicial
    useEffect(() => {
        setLoading(true);

        axios
            .get("/api/descuentos/listado")
            .then((res) => {
                const data = Array.isArray(res.data)
                    ? res.data
                    : (res.data.data ?? []);

                setDescuentos(data);
                setDescuentosFiltrados(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al cargar descuentos");
                setLoading(false);
            });
    }, []);

    // 🔹 Búsqueda
    useEffect(() => {
        const delay = setTimeout(() => {
            const term = searchTerm.toLowerCase().trim();

            if (!term) {
                setDescuentosFiltrados(descuentos);
                setCurrentPage(1);
                return;
            }

            const filtered = descuentos.filter((d) => {
                return (
                    d.id?.toString().includes(term) ||
                    (d.titulo || "").toLowerCase().includes(term) ||
                    (d.codigo || "").toLowerCase().includes(term) ||
                    (d.enlace || "").toLowerCase().includes(term)
                );
            });

            setDescuentosFiltrados(filtered);
            setCurrentPage(1);
        }, 250);

        return () => clearTimeout(delay);
    }, [searchTerm, descuentos]);

    // 🔹 Paginación
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentItems = descuentosFiltrados.slice(indexOfFirst, indexOfLast);

    const pageNumbers = [];
    for (
        let i = 1;
        i <= Math.ceil(descuentosFiltrados.length / entriesPerPage);
        i++
    ) {
        pageNumbers.push(i);
    }

    const paginate = (n) => setCurrentPage(n);

    // 🔹 Editar
    const openEditModal = (item) => {
        setEditData({
            id: item.id,
            titulo: item.titulo,
            codigo: item.codigo,
            descripcion: item.descripcion,
            enlace: item.enlace,
            fotoFile: null,
            fotoUrl: `/storage/descuentos/portada/${item.id}/${item.foto}`,
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

            e.target.value = null;
        }
    };

    const handleSaveEdit = () => {
        const formData = new FormData();
        formData.append("titulo", editData.titulo);
        formData.append("codigo", editData.codigo);
        formData.append("descripcion", editData.descripcion || "");
        formData.append("enlace", editData.enlace || "");

        if (editData.fotoFile) {
            formData.append("foto", editData.fotoFile);
        }

        axios
            .post(`/api/descuentos/${editData.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => {
                const updated = res.data; // backend YA devuelve el objeto actualizado

                setDescuentos((prev) =>
                    prev.map((d) =>
                        d.id === updated.id
                            ? {
                                  ...d,
                                  ...updated,
                                  foto_url: updated.foto_url,
                              }
                            : d,
                    ),
                );

                setDescuentosFiltrados((prev) =>
                    prev.map((d) =>
                        d.id === updated.id
                            ? {
                                  ...d,
                                  ...updated,
                                  foto_url: updated.foto_url,
                              }
                            : d,
                    ),
                );

                Swal.fire({
                    icon: "success",
                    title: "Actualizado",
                    text: "Descuento actualizado correctamente",
                    timer: 1500,
                    showConfirmButton: false,
                });

                setShowModal(false);
            })
            .catch(() => {
                Swal.fire("Error", "No se pudo actualizar", "error");
            });
    };

    // 🔹 Eliminar
    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar descuento?",
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
                    .delete(`/api/descuentos/${id}`)
                    .then(() => {
                        setDescuentos((prev) =>
                            prev.filter((d) => d.id !== id),
                        );
                        setDescuentosFiltrados((prev) =>
                            prev.filter((d) => d.id !== id),
                        );

                        Swal.fire(
                            "Eliminado",
                            "Descuento eliminado correctamente.",
                            "success",
                        );
                    })
                    .catch(() => {
                        Swal.fire("Error", "No se pudo eliminar", "error");
                    });
            }
        });
    };

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    {/* TÍTULO */}
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Listado de Descuentos
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* BUSCADOR */}
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
                                            <th>Título</th>
                                            <th>Código</th>
                                            <th>Enlace</th>
                                            <th>Operaciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>

                                                    <td>
                                                        <img
                                                            src={item.foto_url}
                                                            alt={item.titulo}
                                                            style={{
                                                                width: 80,
                                                                height: 50,
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    </td>

                                                    <td>{item.titulo}</td>
                                                    <td>{item.codigo}</td>
                                                    <td>{item.enlace}</td>

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

                        {/* PAGINACIÓN */}
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

                                {pageNumbers.map((n) => (
                                    <li
                                        key={n}
                                        className={`page-item ${
                                            n === currentPage ? "active" : ""
                                        }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => paginate(n)}
                                        >
                                            {n}
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

                {/* MODAL */}
                {showModal && (
                    <div
                        className="modal fade show d-block"
                        style={{ background: "rgba(0,0,0,.5)" }}
                    >
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5>Editar descuento</h5>
                                    <button
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    />
                                </div>

                                <div className="modal-body">
                                    <input
                                        className="form-control mb-2"
                                        name="titulo"
                                        value={editData.titulo}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        className="form-control mb-2"
                                        name="codigo"
                                        value={editData.codigo}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        className="form-control mb-2"
                                        name="enlace"
                                        value={editData.enlace}
                                        onChange={handleInputChange}
                                    />
                                    <textarea
                                        className="form-control mb-2"
                                        name="descripcion"
                                        value={editData.descripcion}
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
