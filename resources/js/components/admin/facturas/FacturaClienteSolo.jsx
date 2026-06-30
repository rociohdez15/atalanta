import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const ReservasCliente = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);

    const [reservas, setReservas] = useState([]);
    const [reservasFiltradas, setReservasFiltradas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);

    // 🔹 Carga inicial
    useEffect(() => {
        setLoading(true);
        axios.get(`/api/reservas/cliente/${id}`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
                setReservas(data);
                setReservasFiltradas(data);
                setLoading(false);
            })
            .catch(err => {
                setError("Error al cargar reservas");
                setLoading(false);
                Swal.fire({
                    icon: "error",
                    title: "Error al cargar reservas",
                    text: err.message || "No se pudo obtener la información."
                });
            });
    }, [id]);

    // 🔹 Búsqueda
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (!searchTerm.trim()) {
                setReservasFiltradas(reservas);
                return;
            }

            const term = searchTerm.toLowerCase();
            const filtered = reservas.filter(r => {
                return (
                    (r.id?.toString() || "").includes(term) ||
                    (r.cliente_id?.toString() || "").includes(term) ||
                    (r.paquete_id?.toString() || "").includes(term) ||
                    (r.estado?.toLowerCase() || "").includes(term)
                );
            });
            setReservasFiltradas(filtered);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, reservas]);

    // 🔹 Paginación
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentReservations = reservasFiltradas.slice(indexOfFirst, indexOfLast);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(reservasFiltradas.length / entriesPerPage); i++) {
        pageNumbers.push(i);
    }

    const paginate = (number) => setCurrentPage(number);

    // 🔹 Abrir factura
    const handleRowClick = (reservaId) => {
        navigate(`/factura-reserva/${reservaId}`);
    };

    // 🔹 Descargar factura
    const handleDownload = async (reservaId) => {
        setDownloadingId(reservaId);
        try {
            const response = await axios.get(`/api/factura/${reservaId}/${id}`, {
                responseType: "blob",
                withCredentials: true,
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `factura_reserva_${reservaId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudo descargar la factura", "error");
        } finally {
            setDownloadingId(null);
        }
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
                                    Reservas del cliente {id}
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Buscador */}
                    <div className="d-flex justify-content-end mb-3">
                        <label htmlFor="searchInput" className="me-2 mb-0">Buscar:</label>
                        <input
                            id="searchInput"
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
                            <div className="text-center text-danger mt-5">{error}</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered align-middle mb-0">
                                    <thead>
                                        <tr className="text-secondary text-nowrap">
                                            <th>ID</th>
                                            <th>Reservation Token</th>
                                            <th>Cliente ID</th>
                                            <th>Paquete ID</th>
                                            <th>Num Personas</th>
                                            <th>Fecha Pago</th>
                                            <th>Tipo Pago</th>
                                            <th>Descuento</th>
                                            <th>Estado</th>
                                            <th>Total Precio</th>
                                            <th>Fecha Reserva</th>
                                            <th>Operaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentReservations.length > 0 ? (
                                            currentReservations.map((reserva) => (
                                                <tr
                                                    key={reserva.id}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleRowClick(reserva.id)}
                                                >
                                                    <td>{reserva.id}</td>
                                                    <td>{reserva.reservation_token}</td>
                                                    <td>{reserva.cliente_id}</td>
                                                    <td>{reserva.paquete_id}</td>
                                                    <td>{reserva.num_personas}</td>
                                                    <td>{reserva.fecha_pago ? new Date(reserva.fecha_pago).toLocaleDateString("es-ES") : ""}</td>
                                                    <td>{reserva.metodo_pago === "parcial" ? "Parcial" : reserva.metodo_pago === "total" ? "Total" : reserva.metodo_pago}</td>
                                                    <td>{reserva.descuento}</td>
                                                    <td>{reserva.estado}</td>
                                                    <td>{reserva.total_precio}</td>
                                                    <td>{reserva.fecha_reserva ? new Date(reserva.fecha_reserva).toLocaleDateString("es-ES") : ""}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownload(reserva.id);
                                                            }}
                                                            disabled={downloadingId === reserva.id}
                                                            title="Descargar factura"
                                                        >
                                                            {downloadingId === reserva.id ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                <i className="fas fa-file-download"></i>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="14" className="text-center text-muted">
                                                    No se encontraron reservas.
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

                                {pageNumbers.map((number) => (
                                    <li key={number} className={`page-item ${number === currentPage ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => paginate(number)}>
                                            {number}
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

export default ReservasCliente;