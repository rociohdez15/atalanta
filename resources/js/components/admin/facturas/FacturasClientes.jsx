import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Principal = () => {
    const navigate = useNavigate();

    const handleRowClick = (id) => {
        navigate(`/factura-cliente/${id}`);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);

    const [clientes, setClientes] = useState([]);
    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        setLoading(true);

        axios
            .get("/api/clientes/obtener-clientes")
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [res.data];
                setClientes(data);
                setClientesFiltrados(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al cargar clientes");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setClientesFiltrados(clientes);
                return;
            }

            axios
                .get(
                    `/api/clientes/buscar?input=${encodeURIComponent(
                        searchTerm,
                    )}`,
                )
                .then((res) => {
                    const data = Array.isArray(res.data)
                        ? res.data
                        : [res.data];
                    setClientesFiltrados(data);
                });
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, clientes]);

    const indexOfLastClient = currentPage * entriesPerPage;
    const indexOfFirstClient = indexOfLastClient - entriesPerPage;
    const currentClients = clientesFiltrados.slice(
        indexOfFirstClient,
        indexOfLastClient,
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (
        let i = 1;
        i <= Math.ceil(clientesFiltrados.length / entriesPerPage);
        i++
    ) {
        pageNumbers.push(i);
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar cliente?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                setDeletingId(id); // 🔥 activar spinner

                axios
                    .delete(`/api/clientes/eliminar/${id}`)
                    .then(() => {
                        setClientes((prev) => prev.filter((c) => c.id !== id));
                        setClientesFiltrados((prev) =>
                            prev.filter((c) => c.id !== id),
                        );

                        Swal.fire(
                            "Eliminado",
                            "El cliente ha sido eliminado correctamente.",
                            "success",
                        );
                    })
                    .catch(() => {
                        Swal.fire(
                            "Error",
                            "No se pudo eliminar el cliente.",
                            "error",
                        );
                    })
                    .finally(() => {
                        setDeletingId(null); // 🔥 quitar spinner
                    });
            }
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
                                    Listado de Clientes
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

                    {/* Tabla / Contenido */}
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
                                            <th>Usuario ID</th>
                                            <th>Nombre</th>
                                            <th>Apellidos</th>
                                            <th>DNI</th>
                                            <th>Dirección</th>
                                            <th>Teléfono</th>
                                            <th>Fecha Nac.</th>
                                            <th>Operaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentClients.length > 0 ? (
                                            currentClients.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() =>
                                                        handleRowClick(item.id)
                                                    }
                                                >
                                                    <td>{item.id}</td>
                                                    <td>{item.usuario_id}</td>
                                                    <td>{item.nombre}</td>
                                                    <td>{item.apellidos}</td>
                                                    <td>{item.dni}</td>
                                                    <td>{item.direccion}</td>
                                                    <td>{item.telefono}</td>
                                                    <td>
                                                        {new Date(
                                                            item.fecha_nacimiento,
                                                        ).toLocaleDateString(
                                                            "es-ES",
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(
                                                                    item.id,
                                                                );
                                                            }}
                                                            disabled={
                                                                deletingId ===
                                                                item.id
                                                            }
                                                        >
                                                            {deletingId ===
                                                            item.id ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                <i className="fas fa-trash-alt"></i>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="9"
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
            </div>
        </div>
    );
};

export default Principal;
