import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

const Principal = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(10);

    const [facturas, setFacturas] = useState([]);
    const [facturasFiltradas, setFacturasFiltradas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);

    // 🔹 Cargar facturas
    useEffect(() => {
        setLoading(true);
        axios.get("/api/facturas")
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
                setFacturas(data);
                setFacturasFiltradas(data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                Swal.fire("Error", "No se pudieron cargar las facturas", "error");
            });
    }, []);

    // 🔹 Filtrado simple
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (!searchTerm.trim()) {
                setFacturasFiltradas(facturas);
                setCurrentPage(1);
                return;
            }
            const term = searchTerm.toLowerCase();
            const filtered = facturas.filter(f =>
                f.id.toString().includes(term) ||
                f.cliente_id.toString().includes(term) ||
                f.nombre_cliente?.toLowerCase().includes(term) ||
                f.email_cliente?.toLowerCase().includes(term)
            );
            setFacturasFiltradas(filtered);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, facturas]);

    // 🔹 Paginación
    const indexOfLastItem = currentPage * entriesPerPage;
    const indexOfFirstItem = indexOfLastItem - entriesPerPage;
    const currentFacturas = facturasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(facturasFiltradas.length / entriesPerPage); i++) {
        pageNumbers.push(i);
    }
    const paginate = (number) => setCurrentPage(number);

    // 🔹 Eliminar factura
    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar factura?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/api/facturas/eliminar/${id}`)
                    .then(() => {
                        setFacturas(prev => prev.filter(f => f.id !== id));
                        setFacturasFiltradas(prev => prev.filter(f => f.id !== id));
                        Swal.fire("Eliminado", "La factura ha sido eliminada.", "success");
                    })
                    .catch(() => {
                        Swal.fire("Error", "No se pudo eliminar la factura.", "error");
                    });
            }
        });
    };

    // 🔹 Descargar factura
    const handleDownload = async (facturaId) => {
        setDownloadingId(facturaId);
        try {
            const response = await axios.get(`/api/factura/${facturaId}`, {
                responseType: "blob",
                withCredentials: true,
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `factura_reserva_${facturaId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            Swal.fire("Error", "No se pudo descargar la factura.", "error");
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
                                    Listado de Facturas
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

                    {/* Tabla */}
                    <div className="table-responsive p-3">
                        {loading ? (
                            <div className="text-center mt-5">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : (
                            <table className="table table-sm table-bordered align-middle mb-0">
                                <thead>
                                    <tr className="text-secondary text-nowrap">
                                        <th>ID</th>
                                        <th>Cliente ID</th>
                                        <th>Reserva ID</th>
                                        <th>Nombre Cliente</th>
                                        <th>Email Cliente</th>
                                        <th>Fecha Compra</th>
                                        <th>Tipo Pago</th>
                                        <th>Precio Total</th>
                                        <th>IVA</th>
                                        <th>Teléfono Empresa</th>
                                        <th>Email Empresa</th>
                                        <th>Detalles</th>
                                        <th>Operaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentFacturas.length > 0 ? (
                                        currentFacturas.map((f) => (
                                            <tr key={f.id} style={{ cursor: "pointer" }}>
                                                <td>{f.id}</td>
                                                <td>{f.cliente_id}</td>
                                                <td>{f.reserva_id}</td>
                                                <td>{f.nombre_cliente}</td>
                                                <td>{f.email_cliente}</td>
                                                <td>{f.fecha_compra ? new Date(f.fecha_compra).toLocaleDateString("es-ES") : ""}</td>
                                                <td>{f.metodo_pago === "parcial" ? "Parcial" : f.metodo_pago === "total" ? "Total" : f.metodo_pago}</td>
                                                <td>{f.precio_total} €</td>
                                                <td>{f.iva} %</td>
                                                <td>{f.telefono_empresa}</td>
                                                <td>{f.email_empresa}</td>
                                                <td>{f.detalles}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownload(f.id);
                                                        }}
                                                        disabled={downloadingId === f.id}
                                                        title="Descargar factura"
                                                    >
                                                        {downloadingId === f.id ? (
                                                            <span className="spinner-border spinner-border-sm"></span>
                                                        ) : (
                                                            <i className="fas fa-file-download"></i>
                                                        )}
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm ms-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(f.id);
                                                        }}
                                                        title="Eliminar factura"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="13" className="text-center text-muted">
                                                No se encontraron resultados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* Paginación */}
                        <div className="d-flex justify-content-center mt-3">
                            <ul className="pagination mb-0">
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

export default Principal;