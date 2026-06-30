import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const ServiciosIncluidos = ({ paqueteId }) => {
    const [incluidos, setIncluidos] = useState([]);
    const [noIncluidos, setNoIncluidos] = useState([]);

    useEffect(() => {
        if (!paqueteId) return;

        const fetchServicios = async () => {
            try {
                const responseIncluidos = await axios.get(
                    `/api/paquetes/${paqueteId}/incluye`
                );
                setIncluidos(responseIncluidos.data);

                const responseNoIncluidos = await axios.get(
                    `/api/paquetes/${paqueteId}/noincluye`
                );
                setNoIncluidos(responseNoIncluidos.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchServicios();
    }, [paqueteId]);

    if (
        (!incluidos || incluidos.length === 0) &&
        (!noIncluidos || noIncluidos.length === 0)
    )
        return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="container my-5"
        >
            <h2
                className="text-center mb-4"
                style={{
                    color: "#000000",
                    fontWeight: "700",
                    fontSize: "2rem",
                    fontFamily: "Inter, sans-serif",
                }}
            >
                ¿Qué incluye tu aventura?
            </h2>

            <div className="row g-4">
                {/* Servicios Incluidos */}
                <div className="col-lg-6">
                    <div
                        className="card border-0"
                        style={{
                            backgroundColor: "#000000",
                            border: "1px solid #000000",
                            borderRadius: "1rem",
                        }}
                    >
                        <div
                            className="card-header d-flex align-items-center"
                            style={{
                                backgroundColor: "transparent",
                                borderBottom: "none",
                            }}
                        >
                            <span
                                className="me-2"
                                style={{ color: "#4ade80", fontSize: "1.5rem" }}
                            >
                                ✓
                            </span>
                            <h5 className="mb-0 fw-bold" style={{ color: " #ffffff", fontFamily: "Inter, sans-serif", }}>
                                Servicios incluidos
                            </h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-unstyled mb-0">
                                {incluidos.length > 0 ? (
                                    incluidos.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className="d-flex align-items-start mb-2"
                                        >
                                            <span
                                                className="me-2"
                                                style={{ color: "#4ade80" }}
                                            >
                                                ✓
                                            </span>
                                            <span
                                                style={{
                                                    color: " #ffffff",
                                                    opacity: 0.8,
                                                    fontFamily: "Inter, sans-serif",
                                                }}
                                            >
                                                {item.descripcion}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li style={{color: "#ffffff", fontFamily: "Inter, sans-serif",}}>
                                        No hay servicios incluidos.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Servicios No Incluidos */}
                <div className="col-lg-6">
                    <div
                        className="card "
                        style={{
                            backgroundColor: "#000000",
                            border: "1px solid #000000",
                            borderRadius: "1rem",
                        }}
                    >
                        <div
                            className="card-header d-flex align-items-center"
                            style={{
                                backgroundColor: "transparent",
                                borderBottom: "none",
                            }}
                        >
                            <span
                                className="me-2"
                                style={{ color: "#f87171", fontSize: "1.5rem" }}
                            >
                                ✗
                            </span>
                            <h5 className="mb-0 fw-bold" style={{ color: " #ffffff", fontFamily: "Inter, sans-serif", }}>
                                No incluido
                            </h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-unstyled mb-0">
                                {noIncluidos.length > 0 ? (
                                    noIncluidos.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className="d-flex align-items-start mb-2"
                                        >
                                            <span
                                                className="me-2"
                                                style={{ color: "#f87171" }}
                                            >
                                                ✗
                                            </span>
                                            <span
                                                style={{
                                                    color: " #ffffff",
                                                    opacity: 0.8,
                                                    fontFamily: "Inter, sans-serif",
                                                }}
                                            >
                                                {item.descripcion}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <li style={{color: "#ffffff", fontFamily: "Inter, sans-serif",}}>
                                        No hay servicios no incluidos.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default ServiciosIncluidos;
