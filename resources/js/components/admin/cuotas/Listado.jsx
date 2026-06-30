import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Cuotas = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);

    const [cuotas, setCuotas] = useState([]);
    const [cuotasFiltradas, setCuotasFiltradas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔹 Cargar cuotas
    useEffect(() => {
        setLoading(true);

        axios
            .get("/api/cuotas/obtener")
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                setCuotas(data);
                setCuotasFiltradas(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener cuotas:", err);
                setError("Error al cargar las cuotas");
                setLoading(false);
            });
    }, []);

    // 🔹 Filtro búsqueda
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim() === "") {
                setCuotasFiltradas(cuotas);
                return;
            }

            const filtered = cuotas.filter(
                (c) =>
                    c.cliente_nombre
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    c.cliente_apellidos
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    c.cliente_email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );

            setCuotasFiltradas(filtered);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, cuotas]);

    // 🔹 Paginación frontend
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentCuotas = cuotasFiltradas.slice(indexOfFirst, indexOfLast);

    const pageNumbers = [];
    for (
        let i = 1;
        i <= Math.ceil(cuotasFiltradas.length / entriesPerPage);
        i++
    ) {
        pageNumbers.push(i);
    }

    // 🔹 Cambiar estado de cuota
    const toggleCuota = (reservaId, index) => {
        const updated = cuotas.map((c) => {
            if (c.reserva_id === reservaId) {
                const newCuotas = [...c.cuotas];
                if (newCuotas[index])
                    newCuotas[index].pagada = !newCuotas[index].pagada;
                return { ...c, cuotas: newCuotas };
            }
            return c;
        });

        setCuotas(updated);
        setCuotasFiltradas(updated);
    };

    // 🔹 Guardar cuotas
    const guardarCuotas = (reservaId) => {
        const reserva = cuotas.find((c) => c.reserva_id === reservaId);
        if (!reserva) return;

        const cuotasParaMarcar = reserva.cuotas
            .filter((c) => c && c.numero > 1 && c.pagada)
            .map((c) => c.numero);

        if (cuotasParaMarcar.length === 0) {
            Swal.fire("Info", "No hay cuotas seleccionadas.", "info");
            return;
        }

        Promise.all(
            cuotasParaMarcar.map((numero) =>
                axios.post("/api/cuotas/marcar-pagada", {
                    reserva_id: reservaId,
                    numero,
                })
            )
        )
            .then(() => {
                Swal.fire("Guardado", "Cuotas actualizadas.", "success");
                return axios.get("/api/cuotas/obtener");
            })
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                setCuotas(data);
                setCuotasFiltradas(data);
            })
            .catch(() => {
                Swal.fire("Error", "No se pudo guardar.", "error");
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
                                    Listado de Cuotas
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

                    {/* Contenido */}
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
                                            <th>ID Reserva</th>
                                            <th>Nombre</th>
                                            <th>Apellidos</th>
                                            <th>Nº Cuotas</th>
                                            {[...Array(6)].map((_, i) => (
                                                <th key={i}>Cuota {i + 1}</th>
                                            ))}
                                            <th>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentCuotas.length > 0 ? (
                                            currentCuotas.map((c) => (
                                                <tr key={c.reserva_id}>
                                                    <td>{c.reserva_id}</td>
                                                    <td>{c.cliente_nombre}</td>
                                                    <td>{c.cliente_apellidos}</td>
                                                    <td>{c.num_cuotas}</td>

                                                    {c.cuotas.map((cuota, i) => (
                                                        <td key={i} className="text-center">
                                                            {cuota === null ? (
                                                                "-"
                                                            ) : cuota.pagada || i === 0 ? (
                                                                `✅ ${cuota.importe ?? 0}€`
                                                            ) : (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={cuota.pagada}
                                                                    onChange={() =>
                                                                        toggleCuota(c.reserva_id, i)
                                                                    }
                                                                />
                                                            )}
                                                        </td>
                                                    ))}

                                                    <td>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() =>
                                                                guardarCuotas(c.reserva_id)
                                                            }
                                                        >
                                                            Guardar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="11" className="text-center text-muted">
                                                    No hay cuotas registradas
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
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        «
                                    </button>
                                </li>

                                {pageNumbers.map((n) => (
                                    <li key={n} className={`page-item ${n === currentPage ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => setCurrentPage(n)}>
                                            {n}
                                        </button>
                                    </li>
                                ))}

                                <li className="page-item">
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === pageNumbers.length}
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

export default Cuotas;