import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Principal = () => {
    const [reservas, setReservas] = useState([]);
    const [reservas2, setReservas2] = useState([]); // Resultados de búsqueda
    const [reservasFiltradas, setReservasFiltradas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    // Estado para editar reserva
    const [reservaEditando, setReservaEditando] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const navigate = useNavigate();
    const handleRowClick = (id) => {
        navigate(`/reserva-pendiente/${id}`);
    };

    useEffect(() => {
        axios
            .get("/api/reservas/pendientes")
            .then((res) => {
                const pendientes = res.data.filter(
                    (reserva) => reserva.estado === "Pendiente",
                );
                setReservas(pendientes);
                setReservasFiltradas(pendientes);
                setLoading(false); // <-- aquí
            })
            .catch(() => setLoading(false)); // <-- y en caso de error
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setReservasFiltradas(reservas);
                return;
            }

            axios
                .get(
                    `/api/reservas/buscar?input=${encodeURIComponent(
                        searchTerm,
                    )}`,
                )
                .then((res) => {
                    const data = Array.isArray(res.data)
                        ? res.data
                        : [res.data];
                    const pendientes = data.filter(
                        (reserva) => reserva.estado === "Pendiente",
                    );
                    setReservasFiltradas(pendientes);
                    setCurrentPage(1);
                });
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, reservas]);

    // Abrir modal edición con la reserva seleccionada
    const abrirEditar = (reserva) => {
        setReservaEditando(reserva);
        setEditFormData({ ...reserva });
    };

    // Cerrar modal edición
    const cerrarEditar = () => {
        setReservaEditando(null);
        setEditFormData({});
    };

    // Manejar cambios en el formulario de edición
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Guardar cambios vía PUT
    const guardarEdicion = () => {
        axios
            .put(`/api/reservas/${reservaEditando.id}`, editFormData)
            .then((res) => {
                setReservas((prev) =>
                    prev.map((r) => (r.id === res.data.id ? res.data : r)),
                );
                setReservasFiltradas((prev) =>
                    prev.map((r) => (r.id === res.data.id ? res.data : r)),
                );
                cerrarEditar();
            });
    };

    // Eliminar reserva
    const eliminarReserva = (id) => {
        if (window.confirm("¿Estás seguro de eliminar esta reserva?")) {
            axios.delete(`/api/reservas/${id}`).then(() => {
                setReservas((prev) => prev.filter((r) => r.id !== id));
                setReservasFiltradas((prev) => prev.filter((r) => r.id !== id));
            });
        }
    };

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = reservasFiltradas.slice(
        indexOfFirstEntry,
        indexOfLastEntry,
    );

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setReservas2(reservas);
                return;
            }

            const url = `/api/reservas/buscar?input=${encodeURIComponent(
                searchTerm,
            )}`;

            axios
                .get(url)
                .then((res) => {
                    if (Array.isArray(res.data)) {
                        setReservas2(res.data);
                    } else if (res.data && Array.isArray(res.data.data)) {
                        setReservas2(res.data.data);
                    } else if (res.data && res.data.message) {
                        setReservas2([]);
                    } else {
                        setReservas2([res.data]);
                    }
                })
                .catch((err) => {
                    if (err.response) {
                        console.error("");
                        console.error("");
                    } else {
                        console.error("");
                    }
                });
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, reservas]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (
        let i = 1;
        i <= Math.ceil(reservasFiltradas.length / entriesPerPage);
        i++
    ) {
        pageNumbers.push(i);
    }

    const handleEdit = (reservaId) => {
        const reserva = reservas.find((r) => r.id === reservaId);

        Swal.fire({
            title: `Editar Reserva ID ${reserva.id}`,
            html: `
        <div style="text-align: left;">

            <label for="total_precio">Precio total:</label>
            <input id="total_precio" type="number" step="0.01" class="swal2-input" placeholder="Total Precio" value="${
                reserva.total_precio ?? 0
            }">

            <label for="estado">Estado:</label>
            <select id="estado" class="swal2-input">
                <option value="Pendiente" ${
                    reserva.estado === "Pendiente" ? "selected" : ""
                }>Pendiente</option>
                <option value="Confirmada" ${
                    reserva.estado === "Confirmada" ? "selected" : ""
                }>Confirmada</option>
                <option value="Cancelada" ${
                    reserva.estado === "Cancelada" ? "selected" : ""
                }>Cancelada</option>
            </select>
        </div>
        `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                const total_precio = parseFloat(
                    document.getElementById("total_precio").value,
                );
                const estado = document.getElementById("estado").value;

                if (
                    isNaN(total_precio) ||
                    !estado
                ) {
                    Swal.showValidationMessage(
                        "Todos los campos deben estar correctamente rellenos",
                    );
                    return false;
                }

                return {
                    total_precio,
                    estado,
                };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const {
                    total_precio,
                    estado,
                } = result.value;

                axios
                    .put(`/api/reservas/${reservaId}`, {
                        total_precio,
                        estado,
                    })
                    .then((response) => {
                        const updated = response.data;
                        setReservas((prev) =>
                            prev.map((r) =>
                                r.id === updated.id ? updated : r,
                            ),
                        );
                        Swal.fire(
                            "Actualizado",
                            "La reserva ha sido actualizada.",
                            "success",
                        );
                    })
                    .catch(() => {
                        Swal.fire(
                            "Error",
                            "No se pudo actualizar la reserva.",
                            "error",
                        );
                    });
            }
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar reserva?",
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
                    .delete(`/api/reservas/eliminar/${id}`)
                    .then(() => {
                        setReservas((prev) =>
                            prev.filter((reserva) => reserva.id !== id),
                        );
                        setReservas2((prev) =>
                            prev.filter((reserva) => reserva.id !== id),
                        );

                        Swal.fire(
                            "Eliminada",
                            "La reserva ha sido eliminada correctamente.",
                            "success",
                        );
                    })
                    .catch((err) => {
                        Swal.fire(
                            "Error",
                            "No se pudo eliminar la reserva.",
                            "error",
                        );
                    });
            }
        });
    };

    return (
        <div className="content-page">
            <div className="content">
                {/* Start Content */}
                <div className="container-fluid">
                    {/* Start Page Title */}
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Listado de Reservas Pendientes
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Tabla y búsqueda */}
                    <div className="container-fluid p-3">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                            <div></div>
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
                                    placeholder="Buscar reservas"
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
                                            <th className="text-start">
                                                Cliente
                                            </th>
                                            <th className="text-start">
                                                Experiencia
                                            </th>
                                            <th className="text-start">
                                                Nº Personas
                                            </th>
                                            <th className="text-start">
                                                Fecha Pago
                                            </th>
                                            <th className="text-start">
                                                Descuento
                                            </th>
                                            <th className="text-start">
                                                Estado
                                            </th>
                                            <th className="text-start">
                                                Precio Total
                                            </th>
                                            <th className="text-start">
                                                Fecha Reserva
                                            </th>
                                            <th className="text-start">
                                                Fecha Entrada
                                            </th>
                                            <th className="text-start">
                                                Fecha Salida
                                            </th>
                                            <th className="text-start">
                                                Operaciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentEntries.length > 0 ? (
                                            currentEntries.map((reserva) => (
                                                <tr
                                                    key={reserva.id}
                                                    onClick={() =>
                                                        handleRowClick(
                                                            reserva.id,
                                                        )
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                        position: "relative",
                                                    }}
                                                >
                                                    <td
                                                        style={{
                                                            paddingLeft: "25px",
                                                        }}
                                                    >
                                                        {reserva.id}
                                                    </td>
                                                    <td>
                                                        {reserva.cliente_nombre}
                                                    </td>
                                                    <td>
                                                        {reserva.paquete_nombre}
                                                    </td>
                                                    <td>
                                                        {reserva.num_personas}
                                                    </td>
                                                    <td>
                                                        {new Date(
                                                            reserva.fecha_pago,
                                                        ).toLocaleDateString(
                                                            "es-ES",
                                                        )}
                                                    </td>
                                                    <td>{reserva.descuento}</td>
                                                    <td>{reserva.estado}</td>
                                                    <td>
                                                        {reserva.total_precio}
                                                    </td>
                                                    <td>
                                                        {new Date(
                                                            reserva.fecha_reserva,
                                                        ).toLocaleDateString(
                                                            "es-ES",
                                                        )}
                                                    </td>
                                                    <td>
                                                        {reserva.fecha_inicio
                                                            ? new Date(
                                                                  reserva.fecha_inicio,
                                                              ).toLocaleDateString(
                                                                  "es-ES",
                                                              )
                                                            : "-"}
                                                    </td>

                                                    <td>
                                                        {reserva.fecha_fin
                                                            ? new Date(
                                                                  reserva.fecha_fin,
                                                              ).toLocaleDateString(
                                                                  "es-ES",
                                                              )
                                                            : "-"}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(
                                                                    reserva.id,
                                                                );
                                                            }}
                                                        >
                                                            <i className="fas fa-pencil-alt"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(
                                                                    reserva.id,
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
                                                    colSpan="13"
                                                    className="text-center text-muted"
                                                >
                                                    No se encontraron reservas
                                                    pendientes.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Paginación */}
                        <nav className="mt-3">
                            <ul className="pagination justify-content-center">
                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setCurrentPage(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                    >
                                        &laquo;
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
                                            currentPage === pageNumbers.length
                                        }
                                    >
                                        &raquo;
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>

                {/* Modal Edición */}
                {reservaEditando && (
                    <div
                        className="modal fade show"
                        style={{
                            display: "block",
                            backgroundColor: "rgba(0,0,0,0.5)",
                        }}
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Editar Reserva ID {reservaEditando.id}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={cerrarEditar}
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            guardarEdicion();
                                        }}
                                    >
                                        {/* Campos editables */}
                                        <div className="mb-3">
                                            <label
                                                htmlFor="num_personas"
                                                className="form-label"
                                            >
                                                Nº Personas
                                            </label>
                                            <input
                                                type="number"
                                                id="num_personas"
                                                name="num_personas"
                                                className="form-control"
                                                value={
                                                    editFormData.num_personas ||
                                                    ""
                                                }
                                                onChange={handleEditChange}
                                                min={1}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                htmlFor="descuento"
                                                className="form-label"
                                            >
                                                Descuento
                                            </label>
                                            <input
                                                type="number"
                                                id="descuento"
                                                name="descuento"
                                                className="form-control"
                                                value={
                                                    editFormData.descuento || ""
                                                }
                                                onChange={handleEditChange}
                                                min={0}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                htmlFor="estado"
                                                className="form-label"
                                            >
                                                Estado
                                            </label>
                                            <input
                                                type="text"
                                                id="estado"
                                                name="estado"
                                                className="form-control"
                                                value={
                                                    editFormData.estado || ""
                                                }
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label
                                                htmlFor="total_precio"
                                                className="form-label"
                                            >
                                                Precio Total
                                            </label>
                                            <input
                                                type="number"
                                                id="total_precio"
                                                name="total_precio"
                                                className="form-control"
                                                value={
                                                    editFormData.total_precio ||
                                                    ""
                                                }
                                                onChange={handleEditChange}
                                                min={0}
                                            />
                                        </div>
                                        {/* Añade más campos editables aquí si quieres */}

                                        <div className="modal-footer">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={cerrarEditar}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                            >
                                                Guardar cambios
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Principal;
