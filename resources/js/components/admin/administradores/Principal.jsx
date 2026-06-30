import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Principal = () => {
    const [admins, setAdmins] = useState([]); // Lista completa de administradores
    const [admins2, setAdmins2] = useState([]); // Resultados de búsqueda
    const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
    const [currentPage, setCurrentPage] = useState(1); // Página actual
    const [entriesPerPage] = useState(10); // Definido a 1 para mostrar solo 1 registro por página
    const [loading, setLoading] = useState(true);

    // Obtener admins desde la API (solo una vez al cargar la página)
    useEffect(() => {
        setLoading(true);

        axios
            .get("/api/rol-admin/obtener-admins")
            .then((res) => {
                setAdmins(res.data); // Guardamos todos los admins
                setAdmins2(res.data); // Inicializamos admins2 con todos los admins
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                console.error("");
            });
    }, []); // Solo se ejecuta una vez cuando el componente se monta

    // Filtrar por searchTerm usando debounce
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setAdmins2(admins); // Si no hay búsqueda, mostramos todos los admins
                return;
            }

            axios
                .get(`/api/rol-admin/buscar?input=${searchTerm}`)
                .then((res) => {
                    // Asegúrate de que res.data sea un array
                    const data = Array.isArray(res.data)
                        ? res.data
                        : [res.data]; // Si es un solo objeto, lo convertimos en un array
                    setAdmins2(data); // Actualizamos admins2 con los resultados de búsqueda
                });
        }, 300); // Espera 300ms tras el último cambio

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, admins]); // Dependemos de `admins` solo cuando se inicializa, no en cada búsqueda

    // Cálculo de los registros para mostrar según la página actual
    const indexOfLastAdmin = currentPage * entriesPerPage;
    const indexOfFirstAdmin = indexOfLastAdmin - entriesPerPage;
    const currentAdmins = admins2.slice(indexOfFirstAdmin, indexOfLastAdmin); // Slice para mostrar solo los admins de la página actual

    // Función para manejar el cambio de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Número total de páginas
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(admins2.length / entriesPerPage); i++) {
        pageNumbers.push(i);
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar administrador?",
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
                    .delete(`/api/rol-admin/eliminar/${id}`)
                    .then(() => {
                        setAdmins((prev) =>
                            prev.filter((admin) => admin.id !== id),
                        );
                        setAdmins2((prev) =>
                            prev.filter((admin) => admin.id !== id),
                        );

                        Swal.fire(
                            "Eliminado",
                            "El administrador ha sido eliminado correctamente.",
                            "success",
                        );
                    })
                    .catch((err) => {
                        Swal.fire(
                            "Error",
                            "No se pudo eliminar el administrador.",
                            "error",
                        );
                    });
            }
        });
    };

    const handleEdit = (adminId) => {
        const admin = admins.find((a) => a.id === adminId);

        Swal.fire({
            title: "Editar administrador",
            html: `
      <div style="text-align: center;">
        <label for="swal-input1" style="display:block;margin-bottom:4px;">Email</label>
        <input id="swal-input1" class="swal2-input" placeholder="Email" value="${admin.email}">

        <label for="swal-input2" style="display:block;margin-top:10px;margin-bottom:4px;">Nueva contraseña (opcional)</label>
        <input id="swal-input2" class="swal2-input" type="password" placeholder="Nueva contraseña">
      </div>
    `,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            focusConfirm: false,
            preConfirm: () => {
                const email = document
                    .getElementById("swal-input1")
                    .value.trim();
                const password = document
                    .getElementById("swal-input2")
                    .value.trim();

                if (!email) {
                    Swal.showValidationMessage(
                        "¡El email no puede estar vacío!",
                    );
                }

                return { email, password };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const { email, password } = result.value;

                // Evitamos enviar cambios si no hay modificaciones
                if (email === admin.email && !password) {
                    Swal.fire(
                        "Nada que cambiar",
                        "No se ha modificado ni el email ni la contraseña.",
                        "info",
                    );
                    return;
                }

                // Preparamos el body, enviamos la contraseña solo si existe
                const body = { email };
                if (password) body.password = password;

                axios
                    .put(`/api/rol-admin/editar/${adminId}`, body, {
                        headers: { "Content-Type": "application/json" },
                    })
                    .then(() => {
                        setAdmins((prev) =>
                            prev.map((a) =>
                                a.id === adminId ? { ...a, email } : a,
                            ),
                        );
                        setAdmins2((prev) =>
                            prev.map((a) =>
                                a.id === adminId ? { ...a, email } : a,
                            ),
                        );

                        Swal.fire(
                            "Actualizado",
                            "El administrador ha sido actualizado correctamente.",
                            "success",
                        );
                    })
                    .catch((err) => {
                        Swal.fire(
                            "Error",
                            err.response?.data?.message ||
                                "No se pudo actualizar el administrador.",
                            "error",
                        );
                        console.error(err.response?.data || err.message);
                    });
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
                                    Listado de Administradores
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
                                                Email
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
                                        {currentAdmins.length > 0 ? (
                                            currentAdmins.map((admin) => (
                                                <tr key={admin.id}>
                                                    <td>{admin.id}</td>
                                                    <td>{admin.email}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    admin.id,
                                                                )
                                                            }
                                                        >
                                                            <i className="fas fa-pencil-alt"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    admin.id,
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
                                                    colSpan="2"
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
