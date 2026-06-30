import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Proveedores = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);

    const [proveedores, setProveedores] = useState([]);
    const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);

        axios
            .get("/api/proveedores")
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                setProveedores(data);
                setProveedoresFiltrados(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al cargar proveedores");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setProveedoresFiltrados(proveedores);
                setCurrentPage(1);
                return;
            }

            const term = searchTerm.toLowerCase();

            const filtered = proveedores.filter((p) => {
                return (
                    p.id?.toString().includes(term) ||
                    (p.nombre || "").toLowerCase().includes(term) ||
                    (p.email || "").toLowerCase().includes(term) ||
                    (p.telefono || "").toLowerCase().includes(term)
                );
            });

            setProveedoresFiltrados(filtered);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, proveedores]);

    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentItems = proveedoresFiltrados.slice(indexOfFirst, indexOfLast);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (
        let i = 1;
        i <= Math.ceil(proveedoresFiltrados.length / entriesPerPage);
        i++
    ) {
        pageNumbers.push(i);
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar proveedor?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`/api/proveedores/${id}`)
                    .then(() => {
                        setProveedores((prev) =>
                            prev.filter((p) => p.id !== id),
                        );
                        setProveedoresFiltrados((prev) =>
                            prev.filter((p) => p.id !== id),
                        );

                        Swal.fire(
                            "Eliminado",
                            "Proveedor eliminado",
                            "success",
                        );
                    })
                    .catch(() => {
                        Swal.fire("Error", "No se pudo eliminar", "error");
                    });
            }
        });
    };

    const handleEdit = (proveedor) => {
        Swal.fire({
            title: "Editar proveedor",
            html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre" value="${proveedor.nombre}">
        <input id="email" class="swal2-input" placeholder="Email" value="${proveedor.email || ""}">
        <input id="telefono" class="swal2-input" placeholder="Teléfono" value="${proveedor.telefono || ""}">
        <textarea id="notas" class="swal2-textarea" placeholder="Notas">${proveedor.notas || ""}</textarea>
    `,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            preConfirm: () => {
                return {
                    nombre: document.getElementById("nombre").value,
                    email: document.getElementById("email").value,
                    telefono: document.getElementById("telefono").value,
                    notas: document.getElementById("notas").value,
                };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .put(`/api/proveedores/${proveedor.id}`, result.value)
                    .then((res) => {
                        const updated = res.data.proveedor;

                        setProveedores((prev) =>
                            prev.map((p) =>
                                p.id === proveedor.id ? updated : p,
                            ),
                        );

                        setProveedoresFiltrados((prev) =>
                            prev.map((p) =>
                                p.id === proveedor.id ? updated : p,
                            ),
                        );

                        Swal.fire({
                            icon: "success",
                            title: "Proveedor actualizado",
                            text: "Los cambios se guardaron correctamente.",
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    })
                    .catch(() => {
                        Swal.fire("Error", "No se pudo actualizar", "error");
                    });
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
                                    Listado de Proveedores
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="container-fluid p-3">
                        {/* BUSCADOR */}
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                            <div></div>

                            <div className="d-flex align-items-center">
                                <label className="me-2 mb-0">Buscar:</label>
                                <input
                                    type="search"
                                    className="form-control form-control-sm"
                                    style={{ width: 250 }}
                                    placeholder="Buscar por ID, nombre, email o teléfono"
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
                                            <th>Email</th>
                                            <th>Teléfono</th>
                                            <th>Notas</th>
                                            <th>Operaciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>{item.nombre}</td>
                                                    <td
                                                        style={{
                                                            whiteSpace:
                                                                "pre-line",
                                                        }}
                                                    >
                                                        {item.email?.replace(
                                                            /;/g,
                                                            "\n",
                                                        )}
                                                    </td>

                                                    <td
                                                        style={{
                                                            whiteSpace:
                                                                "pre-line",
                                                        }}
                                                    >
                                                        {item.telefono?.replace(
                                                            /;/g,
                                                            "\n",
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            whiteSpace:
                                                                "pre-line",
                                                        }}
                                                    >
                                                        {item.notas?.replace(
                                                            / - /g,
                                                            "\n- ",
                                                        )}
                                                    </td>

                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                handleEdit(item)
                                                            }
                                                        >
                                                            <i className="fas fa-pencil-alt"></i>
                                                        </button>

                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                handleDelete(
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

export default Proveedores;
