import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Principal = () => {
    const navigate = useNavigate();

    const [notificaciones, setNotificaciones] = useState([]);
    const [notificacionesFiltradas, setNotificacionesFiltradas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotificaciones = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    "/api/notificaciones/obtener-notificaciones",
                );
                setNotificaciones(res.data);
                setNotificacionesFiltradas(res.data);
            } catch {
                Swal.fire(
                    "Error",
                    "No se pudieron cargar las notificaciones.",
                    "error",
                );
            } finally {
                setLoading(false);
            }
        };
        fetchNotificaciones();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setNotificacionesFiltradas(notificaciones);
                return;
            }
            const fetchBusqueda = async () => {
                try {
                    const res = await axios.get(
                        `/api/notificaciones/notificaciones/buscar?input=${searchTerm}`,
                    );
                    const data = Array.isArray(res.data)
                        ? res.data
                        : [res.data];
                    setNotificacionesFiltradas(data);
                } catch {
                    setNotificacionesFiltradas([]);
                }
            };
            fetchBusqueda();
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, notificaciones]);

    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentNotificaciones = notificacionesFiltradas.slice(
        indexOfFirst,
        indexOfLast,
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (
        let i = 1;
        i <= Math.ceil(notificacionesFiltradas.length / entriesPerPage);
        i++
    )
        pageNumbers.push(i);

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar notificación?",
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
                    .delete(`/api/notificaciones/eliminar/${id}`)
                    .then(() => {
                        setNotificaciones((prev) =>
                            prev.filter((n) => n.id !== id),
                        );
                        setNotificacionesFiltradas((prev) =>
                            prev.filter((n) => n.id !== id),
                        );
                        Swal.fire(
                            "Eliminada",
                            "La notificación ha sido eliminada.",
                            "success",
                        );
                    })
                    .catch(() =>
                        Swal.fire(
                            "Error",
                            "No se pudo eliminar la notificación.",
                            "error",
                        ),
                    );
            }
        });
    };

    const handleRowClick = (id) => navigate(`/notificacion/${id}`);

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Listado de Notificaciones
                                </h4>
                            </div>
                        </div>
                    </div>

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
                                    style={{ width: 150 }}
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
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
                                            <th>ID</th>
                                            <th>Tipo</th>
                                            <th>Cliente</th>
                                            <th>Fecha</th>
                                            <th>Leído</th>
                                            <th>Operaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentNotificaciones.length > 0 ? (
                                            currentNotificaciones.map((n) => (
                                                <tr
                                                    key={n.id}
                                                    onClick={() =>
                                                        handleRowClick(n.id)
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                        backgroundColor:
                                                            n.is_read
                                                                ? "transparent"
                                                                : "#f2f2f2",
                                                    }}
                                                >
                                                    <td
                                                        style={{
                                                            position:
                                                                "relative",
                                                            paddingLeft: "25px",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                left: "10px",
                                                                top: "50%",
                                                                transform:
                                                                    "translateY(-50%)",
                                                                width: "8px",
                                                                height: "8px",
                                                                backgroundColor:
                                                                    !n.is_read
                                                                        ? "#007bff"
                                                                        : "#ccc",
                                                                borderRadius:
                                                                    "50%",
                                                            }}
                                                        />
                                                        {n.id}
                                                    </td>
                                                    <td>
                                                        {n.tipo === "reseña"
                                                            ? "Reseña"
                                                            : n.tipo ===
                                                                "reserva"
                                                              ? "Reserva"
                                                              : n.tipo ===
                                                                  "like"
                                                                ? "Like"
                                                                : n.tipo}
                                                    </td>
                                                    <td>
                                                        {n.cliente
                                                            ? `${n.cliente.nombre} ${n.cliente.apellidos}`
                                                            : "Sin datos"}
                                                    </td>
                                                    <td>
                                                        {(() => {
                                                            const date =
                                                                new Date(
                                                                    n.fecha,
                                                                );

                                                            const day = String(
                                                                date.getDate(),
                                                            ).padStart(2, "0");
                                                            const month =
                                                                String(
                                                                    date.getMonth() +
                                                                        1,
                                                                ).padStart(
                                                                    2,
                                                                    "0",
                                                                );
                                                            const year =
                                                                date.getFullYear();

                                                            return `${day}/${month}/${year}`;
                                                        })()}
                                                    </td>
                                                    <td>
                                                        {n.is_read
                                                            ? "Sí"
                                                            : "No"}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(
                                                                    n.id,
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
                            )}
                        </div>

                        <div
                            className="d-flex justify-content-center align-items-center mt-3 text-secondary"
                            style={{ fontSize: "0.75rem" }}
                        >
                            <nav aria-label="Page navigation example">
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

export default Principal;
