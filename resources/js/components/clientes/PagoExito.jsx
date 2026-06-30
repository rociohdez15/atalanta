import React, { useEffect, useState, useRef } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Mail, CheckCircle, Loader, AlertCircle, XCircle } from "lucide-react";

// Máximo de segundos esperando al webhook antes de mostrar error
const MAX_ESPERA_SEG = 20;
const INTERVALO_MS   = 2000;

const PagoExito = () => {
    const [estado, setEstado]             = useState("cargando"); // cargando | confirmada | sin_plazas | error
    const [datosPago, setDatosPago]       = useState(null);
    const [mensajeError, setMensajeError] = useState(null);
    const [segundosEsperados, setSegundosEsperados] = useState(0);

    const [searchParams] = useSearchParams();
    const intervaloRef   = useRef(null);

    useEffect(() => {
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            setMensajeError("No se encontró la sesión de pago.");
            setEstado("error");
            return;
        }

        const verificar = async () => {
            try {
                const res = await axios.get(
                    `/api/pago/verificar-exito?session_id=${sessionId}`,
                    { withCredentials: true }
                );

                const data = res.data;

                if (data.estado === "confirmada") {
                    clearInterval(intervaloRef.current);
                    setDatosPago(data);
                    setEstado("confirmada");
                    return;
                }

                if (data.estado === "sin_plazas") {
                    clearInterval(intervaloRef.current);
                    setMensajeError(data.error);
                    setEstado("sin_plazas");
                    return;
                }

                // estado === "pendiente": webhook aún no llegó, seguimos esperando
                setSegundosEsperados((s) => {
                    const nuevo = s + INTERVALO_MS / 1000;
                    if (nuevo >= MAX_ESPERA_SEG) {
                        clearInterval(intervaloRef.current);
                        setMensajeError(
                            "La confirmación está tardando más de lo esperado. " +
                            "Revisa tu email en unos minutos o contacta con nosotros."
                        );
                        setEstado("error");
                    }
                    return nuevo;
                });

            } catch (err) {
                clearInterval(intervaloRef.current);
                console.error(err);
                setMensajeError("No se pudo verificar el pago correctamente.");
                setEstado("error");
            }
        };

        // Primera llamada inmediata, luego polling cada INTERVALO_MS
        verificar();
        intervaloRef.current = setInterval(verificar, INTERVALO_MS);

        return () => clearInterval(intervaloRef.current);
    }, [searchParams]);

    /* ── Spinner mientras verificamos o esperamos webhook ── */
    if (estado === "cargando") {
        return (
            <div
                className="d-flex flex-column justify-content-center align-items-center gap-3"
                style={{ height: "100vh" }}
            >
                <Loader size={64} className="spin" color="#000000" />
                <p style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}>
                    {segundosEsperados > 0
                        ? "Confirmando tu reserva…"
                        : "Verificando el pago…"}
                </p>
            </div>
        );
    }

    /* ── Sin plazas: pago cobrado pero reserva no creada ── */
    if (estado === "sin_plazas") {
        return (
            <div
                className="min-vh-100 d-flex justify-content-center align-items-center px-3"
                style={{ backgroundColor: "#ffffff" }}
            >
                <div
                    className="card shadow border-0 p-4 text-center"
                    style={{ maxWidth: "600px", width: "100%", borderRadius: "20px" }}
                >
                    <div className="mb-4">
                        <XCircle size={64} color="#dc3545" />
                    </div>

                    <h2
                        className="fw-bold mb-3"
                        style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}
                    >
                        No se pudo completar la reserva
                    </h2>

                    <p style={{ color: "#6c757d", fontFamily: "'Inter', sans-serif" }}>
                        {mensajeError}
                    </p>

                    <p
                        className="mt-3"
                        style={{
                            color: "#6c757d",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.9rem",
                        }}
                    >
                        Si se realizó un cargo, será reembolsado automáticamente.
                        Por favor, contacta con nosotros si tienes alguna duda.
                    </p>
                </div>
            </div>
        );
    }

    /* ── Error genérico (timeout, red, etc.) ── */
    if (estado === "error") {
        return (
            <div
                className="min-vh-100 d-flex justify-content-center align-items-center px-3"
                style={{ backgroundColor: "#ffffff" }}
            >
                <div
                    className="card shadow border-0 p-4 text-center"
                    style={{ maxWidth: "600px", width: "100%", borderRadius: "20px" }}
                >
                    <div className="mb-4">
                        <AlertCircle size={64} color="#dc3545" />
                    </div>

                    <h2
                        className="fw-bold mb-3"
                        style={{ color: "#000000", fontFamily: "'Inter', sans-serif" }}
                    >
                        Error en la verificación
                    </h2>

                    <p style={{ color: "#6c757d", fontFamily: "'Inter', sans-serif" }}>
                        {mensajeError}
                    </p>
                </div>
            </div>
        );
    }

    /* ── Fallback (no debería ocurrir) ── */
    if (!datosPago) {
        return <Navigate to="/login" replace />;
    }

    /* ── Éxito ── */
    return (
        <div className="min-vh-100" style={{ backgroundColor: "#ffffff" }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="position-relative py-5 px-3 overflow-hidden"
            >
                <div
                    className="position-relative text-center mx-auto"
                    style={{ maxWidth: "960px" }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="d-inline-flex align-items-center justify-content-center mb-4 rounded-circle shadow"
                        style={{ width: "6rem", height: "6rem", backgroundColor: "#4ade80" }}
                    >
                        <CheckCircle size={48} className="text-white" />
                    </motion.div>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <h1
                            className="fw-bold mb-3"
                            style={{
                                fontSize: "2.5rem",
                                color: "#000000",
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            ¡Pago realizado con éxito!
                        </h1>

                        <p
                            style={{
                                fontSize: "1.25rem",
                                color: "#000000",
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            Tu pago ha sido procesado correctamente.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            <div
                className="d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#ffffff", padding: "1rem" }}
            >
                <div className="col-12 col-md-8">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div
                            className="card mb-4"
                            style={{
                                backgroundColor: "#000000",
                                border: "1px solid #000000",
                                overflow: "hidden",
                                borderRadius: "20px",
                            }}
                        >
                            <div className="card-body text-center p-4">
                                <h2
                                    className="fw-bold mb-3"
                                    style={{
                                        color: "#ffffff",
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    ¡Gracias por confiar en nosotros!
                                </h2>

                                <p
                                    className="mb-3"
                                    style={{
                                        color: "#ffffff",
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    Hemos recibido tu pago correctamente. En breve recibirás
                                    un email con toda la información de tu reserva.
                                </p>

                                <hr style={{ borderColor: "#ffffff" }} />

                                <div
                                    className="mt-3 d-flex align-items-center justify-content-center mb-2"
                                    style={{ color: "#ffffff" }}
                                >
                                    <Mail size={20} className="me-2" />
                                    <span style={{ fontFamily: "'Inter', sans-serif" }}>
                                        Confirmación enviada a {datosPago.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PagoExito;
