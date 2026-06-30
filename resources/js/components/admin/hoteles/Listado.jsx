import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Hoteles = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);

    const [hoteles, setHoteles] = useState([]);
    const [hotelesFiltrados, setHotelesFiltrados] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroLugar, setFiltroLugar] = useState("todos");

    useEffect(() => {
        setLoading(true);

        axios
            .get("/api/hoteles/obtener-hoteles")
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [res.data];

                setHoteles(data);
                setHotelesFiltrados(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al cargar los hoteles");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let filtered = [...hoteles];

        // 🔎 filtro búsqueda
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();

            filtered = filtered.filter((h) => {
                return (
                    h.id?.toString().includes(term) ||
                    (h.nombre || "").toLowerCase().includes(term) ||
                    (h.lugar || "").toLowerCase().includes(term) ||
                    (h.email || "").toLowerCase().includes(term) ||
                    (h.telefono || "").toLowerCase().includes(term)
                );
            });
        }

        // 🌍 filtro lugar
        if (filtroLugar !== "todos") {
            filtered = filtered.filter(
                (h) => (h.lugar ?? "").toLowerCase() === filtroLugar,
            );
        }

        setHotelesFiltrados(filtered);
        setCurrentPage(1);
    }, [searchTerm, filtroLugar, hoteles]);

    const indexOfLastHotel = currentPage * entriesPerPage;
    const indexOfFirstHotel = indexOfLastHotel - entriesPerPage;

    const currentHotels = hotelesFiltrados.slice(
        indexOfFirstHotel,
        indexOfLastHotel,
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // 🟢 EDITAR HOTEL (ACTUALIZADO CON LUGAR)
    const handleEdit = (hotel) => {
        Swal.fire({
            title: "Editar hotel",
            html: `
            <input id="nombre" class="swal2-input" placeholder="Nombre" value="${hotel.nombre}">
            <input id="lugar" class="swal2-input" placeholder="Lugar" value="${hotel.lugar || ""}">
            <input id="email" class="swal2-input" placeholder="Email" value="${hotel.email || ""}">
            <input id="telefono" class="swal2-input" placeholder="Teléfono" value="${hotel.telefono || ""}">
        `,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            preConfirm: () => {
                return {
                    nombre: document.getElementById("nombre").value,
                    lugar: document.getElementById("lugar").value,
                    email: document.getElementById("email").value,
                    telefono: document.getElementById("telefono").value,
                };
            },
        }).then((result) => {
            if (!result.isConfirmed) return;

            axios
                .post(`/api/hoteles/editar/${hotel.id}`, {
                    ...result.value,
                    _method: "PUT",
                })
                .then((res) => {
                    // 🔥 usar respuesta del backend si existe, si no fallback
                    const updatedHotel = res.data.hotel || {
                        ...hotel,
                        ...result.value,
                    };

                    // ✅ actualizar solo el estado principal
                    setHoteles((prev) =>
                        prev.map((h) => (h.id === hotel.id ? updatedHotel : h)),
                    );

                    Swal.fire({
                        icon: "success",
                        title: "Hotel actualizado",
                        text: "Los cambios se guardaron correctamente.",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                })
                .catch(() => {
                    Swal.fire("Error", "No se pudo editar el hotel", "error");
                });
        });
    };

    const pageNumbers = [];

    for (
        let i = 1;
        i <= Math.ceil(hotelesFiltrados.length / entriesPerPage);
        i++
    ) {
        pageNumbers.push(i);
    }

    // ELIMINAR
    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar hotel?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`/api/hoteles/eliminar/${id}`)
                    .then(() => {
                        setHoteles((prev) => prev.filter((h) => h.id !== id));

                        setHotelesFiltrados((prev) =>
                            prev.filter((h) => h.id !== id),
                        );

                        Swal.fire("Eliminado", "Hotel eliminado", "success");
                    })
                    .catch(() => {
                        Swal.fire("Error", "No se pudo eliminar", "error");
                    });
            }
        });
    };

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    <div className="page-title-box">
                        <h4 className="page-title text-center">
                            Listado de Hoteles
                        </h4>
                    </div>

                    <div className="container-fluid p-3">
                        {/* BUSCADOR */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            {/* FILTRO LUGAR */}
                            <div
                                className="d-flex align-items-center"
                                style={{ gap: "6px" }}
                            >
                                <label className="mb-0">Filtro lugar:</label>

                                <select
                                    className="form-select form-select-sm"
                                    style={{ width: 140 }}
                                    value={filtroLugar}
                                    onChange={(e) =>
                                        setFiltroLugar(e.target.value)
                                    }
                                >
                                    <option value="todos">Todos</option>
                                    <option value="huelva">Huelva</option>
                                    <option value="portugal">Portugal</option>
                                </select>
                            </div>

                            {/* BUSCADOR */}
                            <input
                                type="search"
                                className="form-control form-control-sm"
                                style={{ width: 250 }}
                                placeholder="Buscar por ID, nombre, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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
                                <table className="table table-sm table-bordered">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Lugar</th>
                                            <th>Email</th>
                                            <th>Teléfono</th>
                                            <th>Operaciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentHotels.length > 0 ? (
                                            currentHotels.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>{item.nombre}</td>
                                                    <td>{item.lugar || "-"}</td>
                                                    <td>{item.email || "-"}</td>
                                                    <td>
                                                        {item.telefono || "-"}
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
                                                    className="text-center"
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

export default Hoteles;
