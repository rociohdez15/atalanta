import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Principal = () => {
    const [eventos, setEventos] = useState([]);
    const [eventos2, setEventos2] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventos = async () => {
            setLoading(true);
            try {
                const res = await axios.get("/api/eventos/obtener-eventos");
                setEventos(res.data);
                setEventos2(res.data);
            } catch {
                Swal.fire(
                    "Error",
                    "No se pudieron cargar los eventos.",
                    "error",
                );
            } finally {
                setLoading(false);
            }
        };
        fetchEventos();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setEventos2(eventos);
                return;
            }
            const fetchBusqueda = async () => {
                try {
                    const res = await axios.get(
                        `/api/eventos/buscar?input=${searchTerm}`,
                    );
                    const data = Array.isArray(res.data)
                        ? res.data
                        : [res.data];
                    setEventos2(data);
                } catch {
                    setEventos2([]);
                }
            };
            fetchBusqueda();
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, eventos]);

    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentEventos = eventos2.slice(indexOfFirst, indexOfLast);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(eventos2.length / entriesPerPage); i++)
        pageNumbers.push(i);

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar evento?",
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
                    .delete(`/api/eventos/eliminar/${id}`)
                    .then(() => {
                        setEventos((prev) => prev.filter((e) => e.id !== id));
                        setEventos2((prev) => prev.filter((e) => e.id !== id));
                        Swal.fire(
                            "Eliminado",
                            "El evento ha sido eliminado.",
                            "success",
                        );
                    })
                    .catch(() =>
                        Swal.fire(
                            "Error",
                            "No se pudo eliminar el evento.",
                            "error",
                        ),
                    );
            }
        });
    };

    const handleEdit = (eventoId) => {
        const evento = eventos.find((e) => e.id === eventoId);
        Swal.fire({
            title: "Editar evento",
            html: `<div style="text-align: center;">
          <label for="nombre" style="display:block;margin-bottom:4px;">Nombre</label>
          <input id="nombre" class="swal2-input" value="${evento.nombre}">

          <label for="fecha" style="display:block;margin-top:10px;margin-bottom:4px;">Fecha</label>
          <input id="fecha" type="date" class="swal2-input" value="${evento.fecha}">

          <label for="hora" style="display:block;margin-top:10px;margin-bottom:4px;">Hora</label>
          <input id="hora" type="time" class="swal2-input" value="${evento.hora}">
        </div>`,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            focusConfirm: false,
            preConfirm: () => {
                const nombre = document.getElementById("nombre").value;
                const fecha = document.getElementById("fecha").value;
                const hora = document.getElementById("hora").value;

                if (!nombre || !fecha || !hora) {
                    Swal.showValidationMessage(
                        "Todos los campos son obligatorios",
                    );
                    return false;
                }

                return { nombre, fecha, hora };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const { nombre, fecha, hora } = result.value;
                axios
                    .put(
                        `/api/eventos/editar/${eventoId}?nombre=${nombre}&fecha=${fecha}&hora=${hora}`,
                    )
                    .then(() => {
                        setEventos((prev) =>
                            prev.map((e) =>
                                e.id === eventoId
                                    ? { ...e, nombre, fecha, hora }
                                    : e,
                            ),
                        );
                        setEventos2((prev) =>
                            prev.map((e) =>
                                e.id === eventoId
                                    ? { ...e, nombre, fecha, hora }
                                    : e,
                            ),
                        );
                        Swal.fire(
                            "Actualizado",
                            "El evento ha sido actualizado.",
                            "success",
                        );
                    })
                    .catch(() =>
                        Swal.fire(
                            "Error",
                            "No se pudo actualizar el evento.",
                            "error",
                        ),
                    );
            }
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
                                    Listado de Eventos
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
                                            <th className="text-start">ID</th>
                                            <th className="text-start">
                                                Nombre
                                            </th>
                                            <th className="text-start">
                                                Fecha
                                            </th>
                                            <th className="text-start">Hora</th>
                                            <th className="text-start">
                                                Operaciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentEventos.length > 0 ? (
                                            currentEventos.map((evento) => (
                                                <tr key={evento.id}>
                                                    <td>{evento.id}</td>
                                                    <td>{evento.nombre}</td>
                                                    <td>
                                                        {(() => {
                                                            const date =
                                                                new Date(
                                                                    evento.fecha,
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
                                                        {evento.hora
                                                            ? evento.hora.substring(
                                                                  0,
                                                                  5,
                                                              )
                                                            : ""}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    evento.id,
                                                                )
                                                            }
                                                        >
                                                            <i className="fas fa-pencil-alt"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    evento.id,
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
                                                    colSpan="5"
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
                                                onClick={() => paginate(number)}
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

export default Principal;
