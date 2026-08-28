import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Crear = () => {
    const [clientes, setClientes] = useState([]);
    const [paquetes, setPaquetes] = useState([]);
    const [viajeros, setViajeros] = useState([]);
    const [serviciosIncluidos, setServiciosIncluidos] = useState([]);
    const [serviciosNoIncluidos, setServiciosNoIncluidos] = useState([]);
    const [serviciosBloqueado, setServiciosBloqueado] = useState(false);

    const [itinerario, setItinerario] = useState([]);
    const [itinerarioBloqueado, setItinerarioBloqueado] = useState(false);

    const [clienteId, setClienteId] = useState("");
    const [paqueteId, setPaqueteId] = useState("");

    const [precioBase, setPrecioBase] = useState("");
    const [precioOriginal, setPrecioOriginal] = useState(0);

    const [personalizado, setPersonalizado] = useState(false);

    const [destino, setDestino] = useState("");

    const [paqueteSeleccionado, setPaqueteSeleccionado] = useState(null);

    const [numPersonas, setNumPersonas] = useState("");

    const [vouchers, setVouchers] = useState([]);

    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    const [fechaPago, setFechaPago] = useState("");

    const [metodoPago, setMetodoPago] = useState("total");

    const [descuento, setDescuento] = useState("");

    const [estado, setEstado] = useState("Pendiente");

    const [numCuotas, setNumCuotas] = useState("");

    const [importeCuota, setImporteCuota] = useState("");

    const [totalPrecio, setTotalPrecio] = useState("");

    const [fechaReserva, setFechaReserva] = useState("");

    const [loading, setLoading] = useState(false);

    const [importeAlojamiento, setImporteAlojamiento] = useState("");
    const [impuestoMunicipal, setImpuestoMunicipal] = useState("");

    // =========================================================
    // CLÁUSULA BLACK FRIDAY
    // =========================================================

    const [aceptaClausula, setAceptaClausula] = useState(false);

    const esBlackFriday =
        !personalizado &&
        paqueteSeleccionado?.oferta === "black_friday";

    // =========================================================
    // VIAJEROS FIJOS
    // =========================================================

    const viajerosFijos =
        paqueteSeleccionado?.viajerosFijos &&
        paqueteSeleccionado.viajerosFijos > 0
            ? Number(paqueteSeleccionado.viajerosFijos)
            : null;

    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientesRes, paquetesRes] = await Promise.all([
                    axios.get("/api/clientes-obtener"),
                    axios.get("/api/paquetes-obtener"),
                ]);

                setClientes(
                    Array.isArray(clientesRes.data)
                        ? clientesRes.data
                        : [],
                );

                setPaquetes(
                    Array.isArray(paquetesRes.data)
                        ? paquetesRes.data
                        : [],
                );
            } catch (error) {
                console.log(error);
                setClientes([]);
                setPaquetes([]);
            }
        };

        fetchData();
    }, []);

    // =========================================================
    // VIAJEROS
    // =========================================================

    useEffect(() => {
        if (viajerosFijos) {
            setViajeros(
                Array.from({ length: viajerosFijos }, () => ({
                    nombre: "",
                    apellidos: "",
                    email: "",
                    dni: "",
                    telefono: "",
                    direccion: "",
                    ciudad: "",
                    provincia: "",
                    fecha_nacimiento: "",
                    experiencia: "",
                    motivacion: "",
                    info_relevante: "",
                })),
            );

            setNumPersonas(String(viajerosFijos));
            return;
        }

        const cantidad = parseInt(numPersonas || 0);

        if (cantidad > 0) {
            setViajeros(
                Array.from({ length: cantidad }, () => ({
                    nombre: "",
                    apellidos: "",
                    email: "",
                    dni: "",
                    telefono: "",
                    direccion: "",
                    ciudad: "",
                    provincia: "",
                    fecha_nacimiento: "",
                    experiencia: "",
                    motivacion: "",
                    info_relevante: "",
                })),
            );
        } else {
            setViajeros([]);
        }
    }, [numPersonas, viajerosFijos]);

    const handleViajeroChange = (index, field, value) => {
        const updated = [...viajeros];
        updated[index][field] = value;
        setViajeros(updated);
    };

    const handleVoucherChange = (e) => {
        setVouchers(Array.from(e.target.files));
    };

    // =========================================================
    // ITINERARIO
    // =========================================================

    const agregarItinerario = () => {
        setItinerario([
            ...itinerario,
            {
                dia: "",
                fecha: "",
                descripcion: "",
            },
        ]);
    };

    const cambiarItinerario = (index, field, value) => {
        const nuevo = [...itinerario];
        nuevo[index][field] = value;
        setItinerario(nuevo);
    };

    const eliminarItinerario = (index) => {
        const nuevo = itinerario.filter((_, i) => i !== index);
        setItinerario(nuevo);
    };

    // =========================================================
    // CALCULO TOTAL
    // =========================================================

    useEffect(() => {
        let base = 0;

        if (!personalizado && paqueteSeleccionado) {
            const precio = Number(paqueteSeleccionado.precio || 0);
            const personas = Number(numPersonas || 1);

            base = precio * personas;
        }

        if (personalizado) {
            base = Number(totalPrecio || 0);
        }

        const desc = Number(descuento || 0);

        let totalFinal = base;

        if (desc > 0) {
            totalFinal = base - (base * desc) / 100;
        }

        const final = Number(totalFinal.toFixed(2));

        setTotalPrecio(final);

        const cuotas = Number(numCuotas);

        if (metodoPago === "parcial" && cuotas > 0) {
            const importe = (final / cuotas).toFixed(2);
            setImporteCuota(importe);
        } else {
            setImporteCuota("");
        }
    }, [
        paqueteSeleccionado,
        personalizado,
        numPersonas,
        descuento,
        metodoPago,
        numCuotas,
        totalPrecio,
    ]);

    // =========================================================
    // METODO PAGO
    // =========================================================

    const handleMetodoPagoChange = (value) => {
        setMetodoPago(value);

        if (value === "total") {
            setNumCuotas("");
            setImporteCuota("");
        }
    };

    // =========================================================
    // CAMBIO PAQUETE
    // =========================================================

    const handlePaqueteChange = (e) => {
        const value = e.target.value;

        // ---------------------------------
        // PAQUETE PERSONALIZADO
        // ---------------------------------

        if (value === "personalizado") {
            setPersonalizado(true);
            setPaqueteId("");
            setPaqueteSeleccionado(null);

            // Un personalizado nunca tiene Black Friday
            setAceptaClausula(false);

            setFechaInicio("");
            setFechaFin("");

            setItinerario([]);
            setItinerarioBloqueado(false);

            setServiciosIncluidos([]);
            setServiciosBloqueado(false);

            setServiciosNoIncluidos([]);

            setNumPersonas("");
            setViajeros([]);

            return;
        }

        // ---------------------------------
        // SIN PAQUETE
        // ---------------------------------

        if (value === "") {
            setPersonalizado(false);
            setPaqueteId("");
            setPaqueteSeleccionado(null);

            setAceptaClausula(false);

            setFechaInicio("");
            setFechaFin("");

            setItinerario([]);
            setItinerarioBloqueado(false);

            setServiciosIncluidos([]);
            setServiciosBloqueado(false);

            setServiciosNoIncluidos([]);

            setNumPersonas("");
            setViajeros([]);

            return;
        }

        // ---------------------------------
        // PAQUETE NORMAL / BLACK FRIDAY
        // ---------------------------------

        setPersonalizado(false);
        setPaqueteId(value);

        const paquete = paquetes.find(
            (p) => String(p.id) === String(value),
        );

        setPaqueteSeleccionado(paquete);

        // Si no es Black Friday, quitamos la aceptación
        if (paquete?.oferta !== "black_friday") {
            setAceptaClausula(false);
        }

        if (paquete) {
            setFechaInicio(
                paquete.fecha_inicio?.split("T")[0] || "",
            );

            setFechaFin(
                paquete.fecha_fin?.split("T")[0] || "",
            );
        }

        // ---------------------------------
        // VIAJEROS FIJOS
        // ---------------------------------

        if (
            paquete?.viajerosFijos &&
            paquete.viajerosFijos > 0
        ) {
            setNumPersonas(
                String(paquete.viajerosFijos),
            );
        } else {
            setNumPersonas("");
            setViajeros([]);
        }

        // ---------------------------------
        // ITINERARIO
        // ---------------------------------

        if (paquete?.itinerario) {
            let parsed = [];

            try {
                parsed =
                    typeof paquete.itinerario === "string"
                        ? JSON.parse(paquete.itinerario)
                        : paquete.itinerario;
            } catch {
                parsed = [];
            }

            setItinerario(parsed);
            setItinerarioBloqueado(true);
        } else {
            setItinerario([]);
            setItinerarioBloqueado(false);
        }

        // ---------------------------------
        // SERVICIOS INCLUIDOS
        // ---------------------------------

        if (paquete?.servicios_incluidos) {
            let parsed = [];

            try {
                parsed =
                    typeof paquete.servicios_incluidos === "string"
                        ? JSON.parse(paquete.servicios_incluidos)
                        : paquete.servicios_incluidos;
            } catch {
                parsed = [];
            }

            parsed = parsed.map((s) => {
                if (typeof s === "string") {
                    return {
                        descripcion: s,
                        precio: "",
                    };
                }

                return {
                    descripcion:
                        s.descripcion ||
                        s.nombre ||
                        "",
                    precio: s.precio || "",
                };
            });

            setServiciosIncluidos(parsed);
            setServiciosBloqueado(true);
        }
    };

    // =========================================================
    // VALIDAR FECHAS
    // =========================================================

    const validarFechas = () => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        if (inicio < hoy) {
            Swal.fire({
                icon: "error",
                title: "Fecha inválida",
                text: "La fecha de inicio no puede ser anterior a hoy.",
            });

            return false;
        }

        const minimoFin = new Date(inicio);
        minimoFin.setDate(minimoFin.getDate() + 1);

        if (fin < minimoFin) {
            Swal.fire({
                icon: "error",
                title: "Fecha inválida",
                text: "La fecha de fin debe ser al menos 1 día después de la fecha de inicio.",
            });

            return false;
        }

        return true;
    };

    // =========================================================
    // VALIDAR FECHA ITINERARIO
    // =========================================================

    const validarFechaItinerario = (fecha) => {
        if (!fechaInicio || !fechaFin) return true;

        const fechaItem = new Date(fecha);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);

        if (fechaItem < inicio || fechaItem > fin) {
            Swal.fire({
                icon: "error",
                title: "Fecha inválida",
                text: "La fecha del itinerario debe estar dentro del rango de la reserva.",
            });

            return false;
        }

        return true;
    };

    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ---------------------------------
        // VALIDACIÓN CLÁUSULA BLACK FRIDAY
        // ---------------------------------

        if (esBlackFriday && !aceptaClausula) {
            return Swal.fire({
                icon: "warning",
                title: "Aceptación requerida",
                text: "Debes aceptar la cláusula de la oferta Black Friday para poder crear la reserva.",
                confirmButtonText: "Aceptar",
            });
        }

        // ---------------------------------
        // CAMPOS OBLIGATORIOS
        // ---------------------------------

        if (
            !clienteId ||
            !numPersonas ||
            !fechaPago ||
            !metodoPago ||
            !estado ||
            !totalPrecio ||
            !fechaReserva ||
            !fechaInicio ||
            !fechaFin
        ) {
            return Swal.fire({
                icon: "error",
                title: "Campos incompletos",
                text: "Rellena todos los campos obligatorios.",
            });
        }

        if (!personalizado && !paqueteId) {
            return Swal.fire({
                icon: "error",
                title: "Paquete requerido",
                text: "Debes seleccionar un paquete o marcar personalizado.",
            });
        }

        if (!validarFechas()) return;

        if (
            metodoPago === "parcial" &&
            (!numCuotas || !importeCuota)
        ) {
            return Swal.fire({
                icon: "error",
                title: "Pago parcial",
                text: "Debes completar cuotas e importe.",
            });
        }

        setLoading(true);

        try {
            const formData = new FormData();

            // ---------------------------------
            // DATOS GENERALES
            // ---------------------------------

            formData.append("cliente_id", clienteId);

            formData.append(
                "paquete_id",
                personalizado ? 0 : paqueteId,
            );

            formData.append(
                "personalizado",
                personalizado ? 1 : 0,
            );

            formData.append("destino", destino);
            formData.append("num_personas", numPersonas);

            formData.append("fecha_inicio", fechaInicio);
            formData.append("fecha_fin", fechaFin);

            formData.append("fecha_pago", fechaPago);

            formData.append("metodo_pago", metodoPago);

            formData.append(
                "descuento",
                descuento || 0,
            );

            formData.append("estado", estado);

            formData.append(
                "total_precio",
                totalPrecio,
            );

            formData.append(
                "fecha_reserva",
                fechaReserva,
            );

            formData.append(
                "num_cuotas",
                metodoPago === "parcial"
                    ? numCuotas
                    : "",
            );

            formData.append(
                "importe_cuotas",
                metodoPago === "parcial"
                    ? importeCuota
                    : "",
            );

            formData.append(
                "importe_alojamiento",
                personalizado
                    ? importeAlojamiento
                    : "",
            );

            formData.append(
                "impuesto_municipal",
                personalizado
                    ? impuestoMunicipal
                    : "",
            );

            // ---------------------------------
            // VIAJEROS
            // ---------------------------------

            formData.append(
                "viajeros",
                JSON.stringify(viajeros),
            );

            // ---------------------------------
            // ITINERARIO
            // ---------------------------------

            formData.append(
                "itinerario",
                JSON.stringify(itinerario),
            );

            // ---------------------------------
            // SERVICIOS INCLUIDOS
            // ---------------------------------

            formData.append(
                "servicios_incluidos",
                JSON.stringify(
                    serviciosIncluidos
                        .filter(
                            (s) =>
                                (
                                    s.descripcion ||
                                    s.nombre ||
                                    ""
                                ).trim() !== "",
                        )
                        .map((s) => ({
                            descripcion:
                                s.descripcion ||
                                s.nombre ||
                                "",
                            precio:
                                s.precio || 0,
                        })),
                ),
            );

            // =================================================
            // BLACK FRIDAY
            // =================================================
            // IMPORTANTE:
            // El backend espera exactamente:
            // acepta_condiciones_black_friday
            // =================================================

            formData.append(
                "acepta_condiciones_black_friday",
                esBlackFriday && aceptaClausula
                    ? "1"
                    : "0",
            );

            // Enviamos también la oferta para mantener la
            // información disponible en el request.
            formData.append(
                "oferta",
                esBlackFriday
                    ? "black_friday"
                    : "",
            );

            // ---------------------------------
            // VOUCHERS
            // ---------------------------------

            vouchers.forEach((file, i) => {
                formData.append(
                    `vouchers[${i}]`,
                    file,
                );
            });

            // ---------------------------------
            // DEBUG
            // ---------------------------------

            console.log(
                "BLACK FRIDAY:",
                esBlackFriday,
            );

            console.log(
                "ACEPTA CLÁUSULA:",
                aceptaClausula,
            );

            console.log(
                "ACEPTA CONDICIONES ENVIADO:",
                esBlackFriday && aceptaClausula
                    ? "1"
                    : "0",
            );

            // ---------------------------------
            // PETICIÓN
            // ---------------------------------

            await axios.post(
                "/api/reservas/personalizada",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                },
            );

            Swal.fire({
                icon: "success",
                title: "Reserva creada",
                text: "La reserva se ha creado correctamente.",
            });

            // ---------------------------------
            // RESET
            // ---------------------------------

            setClienteId("");
            setPaqueteId("");

            setPersonalizado(false);
            setDestino("");

            setPaqueteSeleccionado(null);

            setPrecioBase("");

            setNumPersonas("");

            setFechaInicio("");
            setFechaFin("");

            setFechaPago("");

            setMetodoPago("total");

            setDescuento("");

            setEstado("Pendiente");

            setNumCuotas("");
            setImporteCuota("");

            setTotalPrecio("");

            setFechaReserva("");

            setViajeros([]);

            setServiciosIncluidos([]);
            setServiciosNoIncluidos([]);
            setServiciosBloqueado(false);

            setItinerario([]);
            setItinerarioBloqueado(false);

            setVouchers([]);

            setImporteAlojamiento("");
            setImpuestoMunicipal("");

            // IMPORTANTE
            setAceptaClausula(false);

        } catch (error) {
            console.log(
                "🔥 ERROR:",
                error.response?.data,
            );

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    error.response?.data?.message ||
                    "No se pudo crear la reserva.",
            });
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // SERVICIOS INCLUIDOS
    // =========================================================

    const agregarServicioIncluido = () => {
        if (serviciosBloqueado) return;

        setServiciosIncluidos([
            ...serviciosIncluidos,
            {
                descripcion: "",
                precio: "",
            },
        ]);
    };

    const cambiarServicioIncluido = (
        index,
        field,
        value,
    ) => {
        if (serviciosBloqueado) return;

        const updated = [...serviciosIncluidos];

        updated[index] = {
            ...updated[index],
            [field]: value,
        };

        setServiciosIncluidos(updated);
    };

    const eliminarServicioIncluido = (index) => {
        if (serviciosBloqueado) return;

        setServiciosIncluidos(
            serviciosIncluidos.filter(
                (_, i) => i !== index,
            ),
        );
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">

                    <div className="page-title-box text-center">
                        <h4 className="page-title">
                            Crear Reserva
                        </h4>
                    </div>

                    <div className="bg-white p-5 rounded-5 shadow-lg col-12 col-lg-10 mx-auto">
                        <form onSubmit={handleSubmit}>

                            {/* CLIENTE */}

                            <div className="mb-3">
                                <label className="form-label">
                                    Cliente
                                </label>

                                <select
                                    className="form-control"
                                    value={clienteId}
                                    onChange={(e) =>
                                        setClienteId(
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Selecciona cliente
                                    </option>

                                    {clientes.map((c) => (
                                        <option
                                            key={c.id}
                                            value={c.id}
                                        >
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* PAQUETE */}

                            <div className="mb-3">
                                <label className="form-label">
                                    Paquete
                                </label>

                                <select
                                    className="form-control"
                                    value={
                                        personalizado
                                            ? "personalizado"
                                            : paqueteId
                                    }
                                    onChange={
                                        handlePaqueteChange
                                    }
                                >
                                    <option value="">
                                        Selecciona paquete
                                    </option>

                                    <option value="personalizado">
                                        Paquete personalizado
                                    </option>

                                    {paquetes.map((p) => (
                                        <option
                                            key={p.id}
                                            value={p.id}
                                        >
                                            {p.nombre}
                                            {p.oferta ===
                                                "black_friday"
                                                ? " - Black Friday"
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ================================================= */}
                            {/* CLÁUSULA BLACK FRIDAY */}
                            {/* ================================================= */}

                            {esBlackFriday && (
                                <div
                                    className="mb-4 p-4 rounded-4"
                                    style={{
                                        backgroundColor:
                                            "#fff3cd",
                                        border:
                                            "1px solid #ffc107",
                                    }}
                                >
                                    <div className="d-flex align-items-start gap-3">

                                        <div
                                            style={{
                                                fontSize: "24px",
                                            }}
                                        >
                                            ⚠️
                                        </div>

                                        <div className="flex-grow-1">

                                            <h5
                                                className="fw-bold mb-2"
                                            >
                                                Condiciones de la
                                                oferta Black Friday
                                            </h5>

                                            <p
                                                className="mb-3"
                                                style={{
                                                    fontSize: "14px",
                                                    lineHeight: "1.6",
                                                }}
                                            >
                                                La oferta Black Friday
                                                está sujeta a las
                                                condiciones específicas
                                                de la promoción. Al
                                                aceptar, confirmas que
                                                el cliente ha sido
                                                informado y acepta las
                                                condiciones aplicables
                                                a esta oferta.
                                            </p>

                                            <div className="form-check">

                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="aceptaClausula"
                                                    checked={
                                                        aceptaClausula
                                                    }
                                                    onChange={(e) =>
                                                        setAceptaClausula(
                                                            e.target.checked,
                                                        )
                                                    }
                                                />

                                                <label
                                                    className="form-check-label fw-semibold"
                                                    htmlFor="aceptaClausula"
                                                >
                                                    Acepto la cláusula
                                                    y las condiciones
                                                    de la oferta Black
                                                    Friday.
                                                </label>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DESTINO PERSONALIZADO */}

                            {personalizado && (
                                <div className="mb-3">
                                    <label className="form-label">
                                        Destino
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Introduce el destino"
                                        value={destino}
                                        onChange={(e) =>
                                            setDestino(
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            )}

                            {/* NÚMERO DE PERSONAS */}

                            {!viajerosFijos ? (
                                <div className="mb-3">
                                    <label>
                                        Número de personas
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        value={numPersonas}
                                        onChange={(e) =>
                                            setNumPersonas(
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            ) : (
                                <div
                                    className="mb-3 p-3 rounded-3 d-flex align-items-center gap-2"
                                    style={{
                                        backgroundColor:
                                            "#fff3cd",
                                        border:
                                            "1px solid #ffc107",
                                        fontSize: "14px",
                                    }}
                                >
                                    <span>⚠️</span>

                                    <span>
                                        Este paquete tiene un
                                        número fijo de{" "}
                                        <strong>
                                            {viajerosFijos} viajero
                                            {viajerosFijos !== 1
                                                ? "s"
                                                : ""}
                                        </strong>{" "}
                                        por reserva. Completa los
                                        datos de todos ellos a
                                        continuación.
                                    </span>
                                </div>
                            )}

                            {/* FECHAS */}

                            <div className="row">

                                <div className="col-md-6 mb-3">
                                    <label>
                                        Fecha entrada
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fechaInicio}
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        onChange={(e) =>
                                            setFechaInicio(
                                                e.target.value,
                                            )
                                        }
                                        disabled={!personalizado}
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label>
                                        Fecha salida
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fechaFin}
                                        min={
                                            fechaInicio
                                                ? new Date(
                                                      new Date(
                                                          fechaInicio,
                                                      ).getTime() +
                                                          86400000,
                                                  )
                                                      .toISOString()
                                                      .split("T")[0]
                                                : ""
                                        }
                                        disabled={!personalizado}
                                        onChange={(e) =>
                                            setFechaFin(
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                            </div>

                            {/* VIAJEROS */}

                            {viajeros.map((v, index) => (
                                <div
                                    key={index}
                                    className="border p-3 mb-3 rounded"
                                >
                                    <h5>
                                        Viajero {index + 1}

                                        {viajerosFijos && (
                                            <span
                                                className="badge ms-2"
                                                style={{
                                                    backgroundColor:
                                                        "#ffc107",
                                                    color: "#000",
                                                    fontSize:
                                                        "11px",
                                                }}
                                            >
                                                Fijo
                                            </span>
                                        )}
                                    </h5>

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Nombre"
                                        value={v.nombre}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "nombre",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Apellidos"
                                        value={v.apellidos}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "apellidos",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Email"
                                        value={v.email}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "email",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <input
                                        className="form-control mb-2"
                                        placeholder="DNI"
                                        value={v.dni}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "dni",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Teléfono"
                                        value={v.telefono}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "telefono",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Dirección"
                                        value={v.direccion}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "direccion",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Ciudad"
                                        value={v.ciudad}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "ciudad",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Provincia"
                                        value={v.provincia}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "provincia",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <input
                                        type="date"
                                        className="form-control mb-2"
                                        value={v.fecha_nacimiento}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "fecha_nacimiento",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Experiencia"
                                        value={v.experiencia}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "experiencia",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Motivación"
                                        value={v.motivacion}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "motivacion",
                                                e.target.value,
                                            )
                                        }
                                    />

                                    <textarea
                                        className="form-control mb-2"
                                        placeholder="Info relevante"
                                        value={v.info_relevante}
                                        onChange={(e) =>
                                            handleViajeroChange(
                                                index,
                                                "info_relevante",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            ))}

                            {/* FECHAS PAGO Y RESERVA */}

                            <div className="row">

                                <div className="col-md-6 mb-3">
                                    <label>
                                        Fecha pago
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fechaPago}
                                        onChange={(e) =>
                                            setFechaPago(
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label>
                                        Fecha reserva
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fechaReserva}
                                        onChange={(e) =>
                                            setFechaReserva(
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                            </div>

                            {/* DESCUENTO */}

                            <div className="mb-3">
                                <label>
                                    Descuento (%)
                                </label>

                                <input
                                    type="number"
                                    className="form-control"
                                    value={descuento}
                                    onChange={(e) =>
                                        setDescuento(
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            {/* CAMPOS SOLO PERSONALIZADO */}

                            {personalizado && (
                                <div className="row">

                                    <div className="col-md-6 mb-3">
                                        <label>
                                            Importe alojamiento
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Ej: 1200"
                                            value={
                                                importeAlojamiento
                                            }
                                            onChange={(e) =>
                                                setImporteAlojamiento(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>
                                            Impuesto municipal
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Ej: 45"
                                            value={
                                                impuestoMunicipal
                                            }
                                            onChange={(e) =>
                                                setImpuestoMunicipal(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                </div>
                            )}

                            {/* ESTADO */}

                            <div className="mb-3">
                                <label>
                                    Estado
                                </label>

                                <select
                                    className="form-control"
                                    value={estado}
                                    onChange={(e) =>
                                        setEstado(
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="Pendiente">
                                        Pendiente
                                    </option>

                                    <option value="Confirmada">
                                        Confirmada
                                    </option>

                                    <option value="Cancelada">
                                        Cancelada
                                    </option>
                                </select>
                            </div>

                            {/* TOTAL */}

                            <div className="mb-3">
                                <label>
                                    Total precio
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={
                                        totalPrecio !== ""
                                            ? Number(
                                                  totalPrecio,
                                              ).toLocaleString(
                                                  "es-ES",
                                                  {
                                                      minimumFractionDigits:
                                                          2,
                                                      maximumFractionDigits:
                                                          2,
                                                  },
                                              )
                                            : ""
                                    }
                                    onChange={(e) =>
                                        setTotalPrecio(
                                            e.target.value.replace(
                                                ",",
                                                ".",
                                            ),
                                        )
                                    }
                                    readOnly={!personalizado}
                                />
                            </div>

                            {/* SERVICIOS */}

                            <div className="mb-4">

                                <label className="form-label fw-bold text-center d-block fs-3">
                                    Servicios
                                </label>

                                {!personalizado && (
                                    <>
                                        <label className="form-label fw-bold">
                                            Servicios incluidos
                                        </label>

                                        {serviciosIncluidos.map(
                                            (
                                                servicio,
                                                index,
                                            ) => {
                                                const desc =
                                                    typeof servicio ===
                                                    "string"
                                                        ? servicio
                                                        : servicio?.descripcion ??
                                                          "";

                                                const precio =
                                                    typeof servicio ===
                                                    "object"
                                                        ? servicio?.precio ??
                                                          ""
                                                        : "";

                                                return (
                                                    <div
                                                        key={index}
                                                        className="row g-2 mb-2"
                                                    >
                                                        <div className="col-md-8">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={
                                                                    desc
                                                                }
                                                                disabled
                                                            />
                                                        </div>

                                                        <div className="col-md-4">
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={
                                                                    precio
                                                                        ? `${precio} €`
                                                                        : ""
                                                                }
                                                                placeholder="Sin precio"
                                                                disabled
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}

                                        {serviciosNoIncluidos.length >
                                            0 && (
                                            <>
                                                <br />

                                                <label className="form-label fw-bold">
                                                    Servicios no incluidos
                                                </label>

                                                {serviciosNoIncluidos.map(
                                                    (
                                                        servicio,
                                                        index,
                                                    ) => (
                                                        <div
                                                            key={
                                                                index
                                                            }
                                                            className="input-group mb-2"
                                                        >
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={
                                                                    servicio
                                                                }
                                                                disabled
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </>
                                        )}
                                    </>
                                )}

                                {personalizado && (
                                    <>
                                        <label className="form-label fw-bold">
                                            Servicios incluidos
                                        </label>

                                        {serviciosIncluidos.map(
                                            (
                                                servicio,
                                                index,
                                            ) => (
                                                <div
                                                    key={index}
                                                    className="row g-2 mb-2 align-items-center"
                                                >
                                                    <div className="col-md-7">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder={`Servicio incluido #${
                                                                index +
                                                                1
                                                            }`}
                                                            value={
                                                                servicio.descripcion
                                                            }
                                                            onChange={(
                                                                e,
                                                            ) =>
                                                                cambiarServicioIncluido(
                                                                    index,
                                                                    "descripcion",
                                                                    e
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="col-md-3">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="form-control"
                                                            placeholder="Precio (€)"
                                                            value={
                                                                servicio.precio
                                                            }
                                                            onChange={(
                                                                e,
                                                            ) =>
                                                                cambiarServicioIncluido(
                                                                    index,
                                                                    "precio",
                                                                    e
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="col-md-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger w-100"
                                                            onClick={() =>
                                                                eliminarServicioIncluido(
                                                                    index,
                                                                )
                                                            }
                                                            aria-label="Eliminar servicio incluido"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                </div>
                                            ),
                                        )}

                                        <br />

                                        <button
                                            type="button"
                                            className="btn btn-outline-success"
                                            onClick={
                                                agregarServicioIncluido
                                            }
                                        >
                                            + Añadir servicio
                                            incluido
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* VOUCHERS */}

                            <div className="mb-4">

                                <label className="form-label fw-bold text-center d-block fs-3">
                                    Vouchers de hoteles
                                </label>

                                <input
                                    type="file"
                                    className="form-control"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={
                                        handleVoucherChange
                                    }
                                />

                                {vouchers.length > 0 && (
                                    <ul className="mt-2 mb-0 list-unstyled">
                                        {vouchers.map(
                                            (f, i) => (
                                                <li
                                                    key={i}
                                                    className="text-muted small"
                                                >
                                                    📎 {f.name}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                )}
                            </div>

                            {/* ITINERARIO */}

                            <div className="mb-4">

                                <label className="form-label fw-bold text-center d-block fs-3">
                                    Itinerario
                                </label>

                                {itinerario.map(
                                    (item, index) => (
                                        <div
                                            key={index}
                                            className="mb-3 border rounded p-3"
                                        >
                                            <label className="form-label fw-bold">
                                                Día
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="Día (Ej: 1, 2 y 3)"
                                                className="form-control mb-2"
                                                value={
                                                    item.dia
                                                }
                                                disabled={
                                                    itinerarioBloqueado
                                                }
                                                onChange={(e) =>
                                                    cambiarItinerario(
                                                        index,
                                                        "dia",
                                                        e.target
                                                            .value,
                                                    )
                                                }
                                            />

                                            <input
                                                type="date"
                                                className="form-control mb-2"
                                                value={
                                                    item.fecha
                                                }
                                                min={
                                                    fechaInicio
                                                }
                                                max={fechaFin}
                                                disabled={
                                                    itinerarioBloqueado
                                                }
                                                onChange={(e) => {
                                                    const value =
                                                        e.target
                                                            .value;

                                                    if (
                                                        !validarFechaItinerario(
                                                            value,
                                                        )
                                                    ) {
                                                        return;
                                                    }

                                                    cambiarItinerario(
                                                        index,
                                                        "fecha",
                                                        value,
                                                    );
                                                }}
                                            />

                                            <textarea
                                                className="form-control mb-2"
                                                value={
                                                    item.descripcion
                                                }
                                                placeholder="Descripción"
                                                disabled={
                                                    itinerarioBloqueado
                                                }
                                                onChange={(e) =>
                                                    cambiarItinerario(
                                                        index,
                                                        "descripcion",
                                                        e.target
                                                            .value,
                                                    )
                                                }
                                                rows={3}
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() =>
                                                    eliminarItinerario(
                                                        index,
                                                    )
                                                }
                                                disabled={
                                                    itinerarioBloqueado
                                                }
                                            >
                                                &times; Eliminar día
                                            </button>
                                        </div>
                                    ),
                                )}

                                <button
                                    type="button"
                                    className="btn btn-outline-success"
                                    onClick={
                                        agregarItinerario
                                    }
                                    disabled={
                                        itinerarioBloqueado
                                    }
                                >
                                    + Añadir día al itinerario
                                </button>
                            </div>

                            {/* BOTÓN */}

                            <button
                                type="submit"
                                className="btn btn-success w-100"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creando..."
                                    : "Crear reserva"}
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Crear;