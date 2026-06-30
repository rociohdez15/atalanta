import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Principal = () => {
    const navigate = useNavigate();

    const handleRowClick = (id) => {
        navigate(`/paquete/${id}`);
    };

    const [currentPage, setCurrentPage] = useState(1); // Página actual
    const [entriesPerPage] = useState(10); // Número de registros por página
    const [loading, setLoading] = useState(true);

    // Inicialización
    const [paquetes, setPaquetes] = useState([]); // Lista original
    const [paquetesFiltrados, setPaquetesFiltrados] = useState([]); // Lista visible (filtrada)
    const [searchTerm, setSearchTerm] = useState("");
    const [totalPages, setTotalPages] = useState(1);

    // Al cargar los paquetes
    useEffect(() => {
        setLoading(true);

        axios
            .get(`/api/paquetes`, {
                params: {
                    page: currentPage - 1,
                    size: entriesPerPage,
                },
            })
            .then((res) => {
                const data = res.data.content;
                setPaquetes(data);
                setPaquetesFiltrados(data);
                setTotalPages(res.data.totalPages);
            })
            .catch(() => {
                setPaquetes([]);
                setPaquetesFiltrados([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [currentPage]);

    // Efecto de búsqueda
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setPaquetesFiltrados(paquetes); // Restaurar todos los paquetes
                return;
            }

            axios
                .get(`/api/paquetes/buscar?input=${searchTerm}`)
                .then((res) => {
                    const data = Array.isArray(res.data)
                        ? res.data
                        : [res.data];
                    setPaquetesFiltrados(data); // Actualizar la lista visible
                    setCurrentPage(1);
                });
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, paquetes]); // Asegúrate de tener paquetes como dependencia por si cambia

    // Cálculo de los registros para mostrar según la página actual
    const indexOfLastAdmin = currentPage * entriesPerPage;
    const indexOfFirstAdmin = indexOfLastAdmin - entriesPerPage;
    const currentAdmins = paquetesFiltrados; // Ya está paginado

    // Función para manejar el cambio de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Número total de páginas
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar paquete?",
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
                    .delete(`/api/paquetes/eliminar/${id}`)
                    .then(() => {
                        setPaquetes((prev) =>
                            prev.filter((admin) => admin.id !== id),
                        );
                        setPaquetesFiltrados((prev) =>
                            prev.filter((admin) => admin.id !== id),
                        );

                        Swal.fire(
                            "Eliminado",
                            "La paquete ha sido eliminado correctamente.",
                            "success",
                        );
                    })
                    .catch((err) => {
                        Swal.fire(
                            "Error",
                            "No se pudo eliminar el paquete.",
                            "error",
                        );
                    });
            }
        });
    };

    const handleEdit = async (id) => {
        const paquete = paquetes.find((p) => p.id === id);
        if (!paquete) return;

        let selectedImage = null;
        const baseImageUrl = `/storage/paquetes/portada/${paquete.id}/${paquete.foto}`;

        await Swal.fire({
            title: "Editar Paquete",
            html: `
            <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${paquete.nombre}">
            <input id="swal-fecha-inicio" type="date" class="swal2-input" value="${paquete.fecha_inicio.slice(0, 10)}">
            <input id="swal-fecha-fin" type="date" class="swal2-input" value="${paquete.fecha_fin.slice(0, 10)}">
            <input id="swal-precio" type="number" class="swal2-input" placeholder="Precio" value="${paquete.precio}">
            <input id="swal-tipo" class="swal2-input" placeholder="Tipo de viaje" value="${paquete.tipo_viaje}">
            <textarea id="swal-desc" class="swal2-textarea" placeholder="Descripción">${paquete.descripcion}</textarea>
            <input id="swal-foto" type="file" class="swal2-file" accept="image/*">
            <img id="preview-image" src="${baseImageUrl}" style="max-width: 100%; margin-top: 10px;" />
            <input id="swal-plazas" type="number" class="swal2-input" placeholder="Plazas" value="${paquete.plazas}">
        `,
            didOpen: () => {
                const fileInput = document.getElementById("swal-foto");
                const preview = document.getElementById("preview-image");

                fileInput.addEventListener("change", (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        selectedImage = file;

                        const reader = new FileReader();
                        reader.onload = function (event) {
                            preview.src = event.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            },
            focusConfirm: false,
            confirmButtonText: "Guardar cambios",
            preConfirm: () => {
                return {
                    nombre: document.getElementById("swal-nombre").value,
                    fecha_inicio:
                        document.getElementById("swal-fecha-inicio").value,
                    fecha_fin: document.getElementById("swal-fecha-fin").value,
                    precio: parseFloat(
                        document.getElementById("swal-precio").value,
                    ),
                    tipo_viaje: document.getElementById("swal-tipo").value,
                    descripcion: document.getElementById("swal-desc").value,
                    fotoFile: selectedImage, // null si no cambió
                    plazas: parseInt(
                        document.getElementById("swal-plazas").value,
                    ),
                };
            },
        }).then(async (result) => {
            if (!result.isConfirmed || !result.value) return;

            const formValues = result.value;
            const formData = new FormData();
            formData.append("_method", "PUT");
            formData.append("nombre", formValues.nombre);
            formData.append("fecha_inicio", formValues.fecha_inicio);
            formData.append("fecha_fin", formValues.fecha_fin);
            formData.append("precio", formValues.precio);
            formData.append("tipo_viaje", formValues.tipo_viaje);
            formData.append("descripcion", formValues.descripcion);
            formData.append("plazas", formValues.plazas);

            if (formValues.fotoFile) {
                formData.append("foto", formValues.fotoFile);
            }
            // Si no cambió la imagen, no envías nada en 'foto', manteniendo la ruta base

            try {
                const res = await axios.post(
                    `/api/paquetes/editar/${id}`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    },
                );

                Swal.fire(
                    "Éxito",
                    "El paquete se actualizó correctamente",
                    "success",
                );

                const updatedData = res.data;

                setPaquetes((prev) =>
                    prev.map((p) =>
                        p.id === id ? { ...p, ...updatedData } : p,
                    ),
                );
                setPaquetesFiltrados((prev) =>
                    prev.map((p) =>
                        p.id === id ? { ...p, ...updatedData } : p,
                    ),
                );
            } catch (error) {
                Swal.fire("Error", "No se pudo actualizar el paquete", "error");
            }
        });
    };
    return (
        <div className="content-page">
            <div className="content">
                {/* Start Content*/}
                <div className="container-fluid">
                    {/* start page title */}
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Listado de Paquetes
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Tabla */}
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
                                            <th
                                                scope="col"
                                                className="text-start"
                                            >
                                                ID
                                            </th>
                                            <th
                                                scope="col"
                                                className="text-start"
                                            >
                                                Nombre
                                            </th>
                                            <th
                                                scope="col"
                                                className="text-start"
                                            >
                                                Fecha Inicio
                                            </th>
                                            <th
                                                scope="col"
                                                className="text-start"
                                            >
                                                Fecha Fin
                                            </th>
                                            <th
                                                scope="col"
                                                className="text-start"
                                            >
                                                Precio
                                            </th>
                                            <th
                                                scope="col"
                                                className="text-start"
                                            >
                                                Tipo de Viaje
                                            </th>
                                            <th
                                                scope="col"
                                                className="text-start"
                                            >
                                                Descripción
                                            </th>
                                            <th
                                                scope="col"
                                                className="text-start"
                                            >
                                                Foto
                                            </th>
                                            <th
                                                scope="col"
                                                className="text-start"
                                            >
                                                Plazas
                                            </th>
                                            <th
                                                scope="col"
                                                className="text-start"
                                            >
                                                Operaciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan="10"
                                                    className="text-center py-4"
                                                >
                                                    <div
                                                        className="spinner-border text-primary"
                                                        role="status"
                                                    >
                                                        <span className="visually-hidden">
                                                            Cargando...
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : currentAdmins.length > 0 ? (
                                            currentAdmins.map((paquete) => (
                                                <tr
                                                    key={paquete.id}
                                                    onClick={() =>
                                                        handleRowClick(
                                                            paquete.id,
                                                        )
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                        position: "relative",
                                                        backgroundColor:
                                                            paquete.is_read
                                                                ? "transparent"
                                                                : "#f2f2f2",
                                                    }}
                                                >
                                                    <td
                                                        style={{
                                                            paddingLeft: "25px",
                                                            position:
                                                                "relative",
                                                        }}
                                                    >
                                                        {paquete.id}
                                                    </td>
                                                    <td>{paquete.nombre}</td>
                                                    <td>
                                                        {paquete.fecha_inicio
                                                            ? new Date(
                                                                  paquete.fecha_inicio,
                                                              ).toLocaleDateString(
                                                                  "es-ES",
                                                              )
                                                            : "Sin datos"}
                                                    </td>
                                                    <td>
                                                        {paquete.fecha_fin
                                                            ? new Date(
                                                                  paquete.fecha_fin,
                                                              ).toLocaleDateString(
                                                                  "es-ES",
                                                              )
                                                            : "Sin datos"}
                                                    </td>
                                                    <td>{paquete.precio} €</td>
                                                    <td>
                                                        {paquete.tipo_viaje}
                                                    </td>
                                                    <td>
                                                        {paquete.descripcion}
                                                    </td>
                                                    <td>
                                                        <img
                                                            src={`/storage/paquetes/portada/${paquete.id}/${paquete.foto}`}
                                                            alt={paquete.foto}
                                                            style={{
                                                                width: 80,
                                                                height: 50,
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{paquete.plazas}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(
                                                                    paquete.id,
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
                                                                    paquete.id,
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
                                                    colSpan="10"
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
                            {/* Paginación */}
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
                {/* container */}
            </div>
        </div>
    );
};

export default Principal;
