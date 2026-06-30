import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Clientes = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);

    const [clientes, setClientes] = useState([]);
    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // NUEVO
    const [reservas, setReservas] = useState([]);

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
                setError("Error al cargar los clientes");
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

    // ELIMINAR
    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar cliente?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`/api/clientes/eliminar/${id}`)
                    .then(() => {
                        setClientes((prev) => prev.filter((c) => c.id !== id));
                        setClientesFiltrados((prev) =>
                            prev.filter((c) => c.id !== id),
                        );

                        Swal.fire("Eliminado", "Cliente eliminado", "success");
                    })
                    .catch(() => {
                        Swal.fire("Error", "No se pudo eliminar", "error");
                    });
            }
        });
    };

    // 🔥 CLICK CLIENTE → reservas
    const handleRowClick = (clienteId) => {
        axios
            .get(`/api/reservas/clientes/${clienteId}`)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [res.data];

                setReservas(data);
                mostrarReservas(data);
            })
            .catch(() => {
                Swal.fire("Error", "No se pudieron cargar reservas", "error");
            });
    };
    // MODAL reservas
    const mostrarReservas = (reservas) => {
        if (!reservas || reservas.length === 0) {
            Swal.fire("Sin reservas", "Este cliente no tiene reservas", "info");
            return;
        }

        const formatDate = (date) => {
            if (!date) return "-";
            const d = new Date(date);
            return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-ES");
        };

        Swal.fire({
            title: '<span style="font-size:22px;">Reservas del cliente</span>',
            width: 650,
            html: reservas
                .map((r) => {
                    const paquete =
                        r.paquete_nombre ?? r.paquete ?? r.paquete_id ?? "-";

                    return `
                    <div style="text-align:left; border-bottom:1px solid #ddd; margin-bottom:10px; padding-bottom:8px;">
                        <strong>ID:</strong> ${r.id ?? "-"}<br/>

                        <strong>Paquete:</strong> ${r.paquete_nombre ?? "-"}<br/>

                        <strong>Personas:</strong> ${r.num_personas ?? 0}<br/>

                        <strong>Estado:</strong> ${r.estado ?? "-"}<br/>

                        <strong>Tipo Pago:</strong> ${r.metodo_pago ?? "-"}<br/>

                        <strong>Fecha Pago:</strong> ${formatDate(r.fecha_pago)}<br/>

                        <strong>Fecha Reserva:</strong> ${formatDate(r.fecha_reserva)}<br/>

                        <strong>Total:</strong> ${r.total_precio ?? 0} €
                    </div>
                `;
                })
                .join(""),
        });
    };

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Listado de Clientes
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="container-fluid p-3">
                        {/* BUSCADOR (igual que el tuyo) */}
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                            <div></div>
                            <div className="d-flex align-items-center">
                                <label className="me-2 mb-0">Buscar:</label>
                                <input
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

                        {loading ? (
                            <div className="text-center mt-5">
                                <div className="spinner-border text-primary" />
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
                                                    onClick={() =>
                                                        handleRowClick(item.id)
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <td>{item.id}</td>
                                                    <td>{item.nombre}</td>
                                                    <td>{item.apellidos}</td>
                                                    <td>{item.dni}</td>
                                                    <td>{item.direccion}</td>
                                                    <td>{item.telefono}</td>
                                                    <td>
                                                        {(() => {
                                                            const date =
                                                                new Date(
                                                                    item.fecha_nacimiento,
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
                                                        <button
                                                            className="btn btn-success btn-sm"
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
                                                    colSpan="8"
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

                        {/* PAGINACIÓN (igual que el tuyo) */}
                        <div className="d-flex justify-content-center align-items-center mt-3 text-secondary">
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

                                    {pageNumbers.map((number) => (
                                        <li
                                            key={number}
                                            className={`page-item ${
                                                number === currentPage
                                                    ? "active"
                                                    : ""
                                            }`}
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

export default Clientes;
