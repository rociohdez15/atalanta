import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Campanas = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);

    const [campanas, setCampanas] = useState([]);
    const [campanasFiltradas, setCampanasFiltradas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatearFecha = (fecha) => {
        if (!fecha) return "";
        const date = new Date(fecha);

        const dia = String(date.getDate()).padStart(2, "0");
        const mes = String(date.getMonth() + 1).padStart(2, "0");
        const anio = date.getFullYear();

        return `${dia}/${mes}/${anio}`;
    };

    useEffect(() => {
        axios
            .get("/api/campanas")
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                setCampanas(data);
                setCampanasFiltradas(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al cargar campañas");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setCampanasFiltradas(campanas);
                return;
            }

            const term = searchTerm.toLowerCase();

            const filtradas = campanas.filter((c) =>
                Object.values(c).some((val) =>
                    val?.toString().toLowerCase().includes(term),
                ),
            );

            setCampanasFiltradas(filtradas);
        }, 300);

        return () => clearTimeout(delay);
    }, [searchTerm, campanas]);

    const cambiarEstado = (campana) => {
        axios
            .put(`/api/campanas/${campana.id}/estado`, {
                activo: !campana.activo,
            })
            .then(() => {
                const actualizadas = campanas.map((c) =>
                    c.id === campana.id ? { ...c, activo: !c.activo } : c,
                );

                setCampanas(actualizadas);
                setCampanasFiltradas(actualizadas);

                Swal.fire({
                    icon: "success",
                    title: "Estado actualizado",
                    timer: 1200,
                    showConfirmButton: false,
                });
            })
            .catch(() => {
                Swal.fire("Error", "No se pudo cambiar el estado", "error");
            });
    };

    const eliminarCampana = (id) => {
        Swal.fire({
            title: "¿Eliminar campaña?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/api/campanas/${id}`).then(() => {
                    const updated = campanas.filter((c) => c.id !== id);
                    setCampanas(updated);
                    setCampanasFiltradas(updated);

                    Swal.fire("Eliminada", "Campaña eliminada", "success");
                });
            }
        });
    };

    const formatDateInput = (date) => {
        if (!date) return "";
        return date.split("T")[0];
    };

    const editarCampana = (campana) => {
        Swal.fire({
            title: "Editar campaña",
            width: 650,
            html: `
            <input id="nombre" class="swal2-input" value="${campana.nombre || ""}" placeholder="Nombre">
            <input id="titulo" class="swal2-input" value="${campana.titulo || ""}" placeholder="Título">
            <input id="subtitulo" class="swal2-input" value="${campana.subtitulo || ""}" placeholder="Subtítulo">

            <input id="imagen" class="swal2-input" value="${campana.imagen || ""}" placeholder="Imagen">
            <input id="boton" class="swal2-input" value="${campana.boton || ""}" placeholder="Botón">
            <input id="link" class="swal2-input" value="${campana.link || ""}" placeholder="Link">

            <input id="orden" type="number" class="swal2-input" value="${campana.orden || 0}" placeholder="Orden">

            <input id="fecha_inicio" type="date" class="swal2-input" value="${formatDateInput(campana.fecha_inicio)}">
            <input id="fecha_fin" type="date" class="swal2-input" value="${formatDateInput(campana.fecha_fin)}">

            <div style="margin-top:15px; display:flex; justify-content:center;">
                <label class="switch">
                    <input type="checkbox" id="activo" ${campana.activo ? "checked" : ""}>
                    <span class="slider round"></span>
                </label>
            </div>
            <p style="text-align:center;margin-top:5px;">Activo</p>
        `,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",

            preConfirm: () => {
                return {
                    nombre: document.getElementById("nombre").value,
                    titulo: document.getElementById("titulo").value,
                    subtitulo: document.getElementById("subtitulo").value,
                    imagen: document.getElementById("imagen").value,
                    boton: document.getElementById("boton").value,
                    link: document.getElementById("link").value,
                    orden: parseInt(
                        document.getElementById("orden").value || 0,
                    ),
                    fecha_inicio: document.getElementById("fecha_inicio").value,
                    fecha_fin: document.getElementById("fecha_fin").value,
                    activo: document.getElementById("activo").checked,
                };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .put(`/api/campanas/${campana.id}`, result.value)
                    .then((res) => {
                        const updated = campanas.map((c) =>
                            c.id === campana.id ? res.data : c,
                        );

                        setCampanas(updated);
                        setCampanasFiltradas(updated);

                        Swal.fire({
                            icon: "success",
                            title: "Actualizada correctamente",
                            timer: 1200,
                            showConfirmButton: false,
                        });
                    })
                    .catch(() => {
                        Swal.fire("Error", "No se pudo actualizar", "error");
                    });
            }
        });
    };

    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentItems = campanasFiltradas.slice(indexOfFirst, indexOfLast);

    const pageNumbers = [];
    for (
        let i = 1;
        i <= Math.ceil(campanasFiltradas.length / entriesPerPage);
        i++
    ) {
        pageNumbers.push(i);
    }

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    <div className="page-title-box">
                        <h4 className="page-title text-center">
                            Listado de Campañas
                        </h4>
                    </div>

                    <div className="container-fluid p-3">
                        <div className="d-flex justify-content-end mb-3">
                            <input
                                type="search"
                                className="form-control form-control-sm"
                                style={{ width: 250 }}
                                placeholder="Buscar campaña"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <div className="text-center">
                                <div className="spinner-border text-primary" />
                            </div>
                        ) : error ? (
                            <div className="text-danger text-center">
                                {error}
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered align-middle">
                                    <thead>
                                        <tr className="text-secondary">
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Título</th>
                                            <th>Subtítulo</th>
                                            <th>Imagen</th>
                                            <th>Botón</th>
                                            <th>Link</th>
                                            <th>Orden</th>
                                            <th>Inicio</th>
                                            <th>Fin</th>
                                            <th>Estado</th>
                                            <th>Operaciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>{item.nombre}</td>
                                                    <td>{item.titulo}</td>
                                                    <td>{item.subtitulo}</td>
                                                    <td>
                                                        {item.imagen && (
                                                            <img
                                                                src={
                                                                    item.imagen
                                                                }
                                                                alt=""
                                                                style={{
                                                                    width: 50,
                                                                }}
                                                            />
                                                        )}
                                                    </td>
                                                    <td>{item.boton}</td>
                                                    <td>
                                                        <a
                                                            href={item.link}
                                                            target="_blank"
                                                        >
                                                            Ver
                                                        </a>
                                                    </td>
                                                    <td>{item.orden}</td>
                                                    <td>
                                                        {formatearFecha(
                                                            item.fecha_inicio,
                                                        )}
                                                    </td>
                                                    <td>
                                                        {formatearFecha(
                                                            item.fecha_fin,
                                                        )}
                                                    </td>

                                                    <td>
                                                        <label className="switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    item.activo
                                                                }
                                                                onChange={() =>
                                                                    cambiarEstado(
                                                                        item,
                                                                    )
                                                                }
                                                            />
                                                            <span className="slider round"></span>
                                                        </label>
                                                    </td>

                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                editarCampana(
                                                                    item,
                                                                )
                                                            }
                                                        >
                                                            <i className="fas fa-pencil-alt"></i>
                                                        </button>

                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                eliminarCampana(
                                                                    item.id,
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
                                                    colSpan="12"
                                                    className="text-center"
                                                >
                                                    No hay campañas
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CSS switch estilo Android */}
            <style>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 42px;
                    height: 22px;
                }

                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: 0.4s;
                    border-radius: 34px;
                }

                .slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.4s;
                    border-radius: 50%;
                }

                input:checked + .slider {
                    background-color: #28a745;
                }

                input:checked + .slider:before {
                    transform: translateX(20px);
                }
            `}</style>
        </div>
    );
};

export default Campanas;
