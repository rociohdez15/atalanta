import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Resenas = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);

    const [resenas, setResenas] = useState([]);
    const [resenasFiltradas, setResenasFiltradas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔹 Cargar reseñas
    useEffect(() => {
        setLoading(true);

        axios
            .get("/api/resenas/obtener")
            .then((res) => {
                const data = res.data.data || [];
                setResenas(data);
                setResenasFiltradas(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener reseñas:", err);
                setError("Error al cargar las reseñas");
                setLoading(false);
            });
    }, []);

    // 🔹 Filtro búsqueda
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setResenasFiltradas(resenas);
                return;
            }

            const filtered = resenas.filter((r) => {
                const term = searchTerm.toLowerCase();

                return (
                    r.id.toString().includes(term) ||
                    (r.cliente_nombre || "").toLowerCase().includes(term) ||
                    (r.cliente_apellidos || "").toLowerCase().includes(term) ||
                    (r.paquete_nombre || "").toLowerCase().includes(term)
                );
            });

            setResenasFiltradas(filtered);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, resenas]);

    // 🔹 Paginación frontend
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentResenas = resenasFiltradas.slice(indexOfFirst, indexOfLast);

    const pageNumbers = [];
    for (
        let i = 1;
        i <= Math.ceil(resenasFiltradas.length / entriesPerPage);
        i++
    ) {
        pageNumbers.push(i);
    }

    // 🔹 Eliminar reseña
    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar reseña?",
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
                    .delete(`/api/resenas/${id}`)
                    .then(() => {
                        setResenas((prev) => prev.filter((r) => r.id !== id));
                        setResenasFiltradas((prev) =>
                            prev.filter((r) => r.id !== id),
                        );
                        Swal.fire(
                            "Eliminado",
                            "La reseña ha sido eliminada.",
                            "success",
                        );
                    })
                    .catch(() => {
                        Swal.fire(
                            "Error",
                            "No se pudo eliminar la reseña.",
                            "error",
                        );
                    });
            }
        });
    };

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    {/* start page title */}
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Listado de Reseñas
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Tabla con búsqueda y márgenes */}
                    <div className="container-fluid p-3">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center mb-2 mb-md-0"></div>
                            <div className="d-flex align-items-center">
                                <label
                                    htmlFor="searchInput"
                                    className="me-2 mb-0"
                                >
                                    Buscar:
                                </label>
                                <input
                                    id="searchInput"
                                    type="search"
                                    className="form-control form-control-sm"
                                    style={{ width: 250 }}
                                    placeholder="Buscar por ID, cliente o paquete"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Tabla */}
                        {loading ? (
                            <div className="text-center mt-5">
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Cargando...
                                    </span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center mt-5 text-danger">
                                {error}
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered align-middle mb-0">
                                    <thead>
                                        <tr className="text-secondary text-nowrap">
                                            <th>ID</th>
                                            <th>Cliente</th>
                                            <th>Paquete</th>
                                            <th>Puntuación(⭐)</th>
                                            <th>Comentario</th>
                                            <th>Fecha</th>
                                            <th>Operaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentResenas.length > 0 ? (
                                            currentResenas.map((r) => (
                                                <tr key={r.id}>
                                                    <td>{r.id}</td>
                                                    <td>
                                                        {r.cliente_nombre}{" "}
                                                        {r.cliente_apellidos}
                                                    </td>
                                                    <td>{r.paquete_nombre}</td>
                                                    <td>{r.num_estrellas}</td>
                                                    <td
                                                        style={{
                                                            maxWidth: 250,
                                                            whiteSpace:
                                                                "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                        }}
                                                    >
                                                        {r.texto}
                                                    </td>
                                                    <td>
                                                        {new Date(
                                                            r.fecha,
                                                        ).toLocaleDateString(
                                                            "es-ES",
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    r.id,
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
                                                    colSpan="7"
                                                    className="text-center text-muted"
                                                >
                                                    No se encontraron reseñas
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Paginación */}
                        <div
                            className="d-flex justify-content-center align-items-center mt-3 text-secondary"
                            style={{ fontSize: "0.75rem" }}
                        >
                            <nav aria-label="Page navigation">
                                <ul className="pagination mb-0">
                                    <li className="page-item">
                                        <button
                                            className="page-link"
                                            aria-label="Previous"
                                            onClick={() =>
                                                setCurrentPage(currentPage - 1)
                                            }
                                            disabled={currentPage === 1}
                                        >
                                            <i className="fas fa-chevron-left" />
                                        </button>
                                    </li>
                                    {pageNumbers.map((number) => (
                                        <li
                                            key={number}
                                            className={`page-item ${number === currentPage ? "active" : ""}`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() =>
                                                    setCurrentPage(number)
                                                }
                                            >
                                                {number}
                                            </button>
                                        </li>
                                    ))}
                                    <li className="page-item">
                                        <button
                                            className="page-link"
                                            aria-label="Next"
                                            onClick={() =>
                                                setCurrentPage(currentPage + 1)
                                            }
                                            disabled={
                                                currentPage ===
                                                pageNumbers.length
                                            }
                                        >
                                            <i className="fas fa-chevron-right" />
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resenas;
