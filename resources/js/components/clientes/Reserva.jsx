import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    User,
    Calendar,
    Users,
    CreditCard,
    Plus,
    Trash2,
    MapPin,
    Loader,
    BedDouble,
} from "lucide-react";

// Validación de email
const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Validación de DNI español
const validarDNI = (dni) => {
    const dniRegex = /^(\d{8})([A-Z])$/i;
    const letras = "TRWAGMYFPDXBNJZSQVHLCKE";

    const match = dni.match(dniRegex);
    if (!match) return false;

    const numero = parseInt(match[1], 10);
    const letra = match[2].toUpperCase();

    return letras[numero % 23] === letra;
};

// Fecha mínima de nacimiento: 110 años
const getFechaMinNacimiento = () => {
    const fecha = new Date();
    fecha.setFullYear(fecha.getFullYear() - 110);
    return fecha.toISOString().split("T")[0];
};

const fechaMinNacimiento = getFechaMinNacimiento();
const fechaMaxNacimiento = new Date().toISOString().split("T")[0];

const getNuevoParticipante = () => ({
    nombre: "",
    apellidos: "",
    email: "",
    dni: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    fechaNacimiento: "",
    experiencia: "",
    motivacion: "",
    infoRelevante: "",
});

// Estilos comunes reutilizados en los inputs del formulario
const labelStyle = {
    color: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
};

const inputStyle = {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    fontFamily: "Inter, sans-serif",
    height: "25px",
    fontSize: "12px",
};

// -------------------------------------------------
// ⭐ CONDICIONES ESPECIALES POR OFERTA ⭐
// -------------------------------------------------
//
// Ofertas que exigen aceptar unas condiciones antes de reservar.
// La clave es el valor de paquete.oferta. Para añadir otra oferta
// basta con una entrada más.
//
const CONDICIONES_OFERTA = {
    black_friday: {
        nombre: "Condiciones Especiales de la Compra Black Friday 24h",
        detalle:
            "(Tarifas No Reembolsable/Reembolsable según oferta y Confirmación en 24h)",
        pdf: "/documents/clausula_condiciones_bf_atalanta.pdf",
        enlace: "📄 Descargar Condiciones Especiales Black Friday 24h (PDF)",
    },
    cyber_monday: {
        nombre: "Condiciones Especiales de la Compra Cyber Monday",
        detalle:
            "(Tarifas No Reembolsable/Reembolsable según oferta y Confirmación en 24h)",
        pdf: "/documents/clausula_condiciones_cm_atalanta.pdf",
        enlace: "📄 Descargar Condiciones Especiales Cyber Monday (PDF)",
    },
};

// -------------------------------------------------
// CAPACIDAD DE CADA TIPO DE HABITACIÓN
// -------------------------------------------------
//
// Si el registro trae el campo "capacidad" (columna nueva
// recomendada en precios_paquetes) se usa ese valor.
// Si no existe, se deduce del nombre del tipo de habitación
// como respaldo (individual = 1, doble = 2, etc.).
//
const CAPACIDAD_POR_PALABRA = {
    individual: 1,
    sencilla: 1,
    single: 1,
    doble: 2,
    double: 2,
    triple: 3,
    cuadruple: 4,
    cuatro: 4,
    quintuple: 5,
    quintaple: 5,
};

const getCapacidadHabitacion = (precio) => {
    if (!precio) return 1;

    if (precio.capacidad) {
        return Number(precio.capacidad);
    }

    const texto = (precio.tipo_habitacion || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    for (const [palabra, cantidad] of Object.entries(CAPACIDAD_POR_PALABRA)) {
        if (texto.includes(palabra)) return cantidad;
    }

    return 1;
};

// -------------------------------------------------
// ⭐ STOCK DE HABITACIONES ⭐
// -------------------------------------------------
//
// habitaciones_disponibles viene de precios_paquetes:
//   - null / undefined  -> sin límite de habitaciones
//   - 0                 -> agotada
//   - n > 0             -> quedan n habitaciones de ese tipo
//
const hayStock = (precio) => {
    if (!precio) return false;

    const d = precio.habitaciones_disponibles;
    if (d === null || d === undefined) return true;

    return Number(d) > 0;
};

// Nº de habitaciones restantes (null si no hay límite)
const getHabitacionesRestantes = (precio) => {
    const d = precio?.habitaciones_disponibles;
    if (d === null || d === undefined) return null;
    return Number(d);
};

// -------------------------------------------------
// NOMBRE VISIBLE DE CADA TIPO DE HABITACIÓN
// -------------------------------------------------
//
// En base de datos el tipo de habitación se guarda en
// minúsculas (individual, doble, triple, cuadruple...).
// Aquí solo se formatea para mostrarlo al usuario.
//
const NOMBRES_TIPO_HABITACION = {
    individual: "Individual",
    sencilla: "Individual",
    single: "Individual",
    doble: "Doble",
    double: "Doble",
    triple: "Triple",
    cuadruple: "Cuádruple",
    quintuple: "Quíntuple",
};

const formatearTipoHabitacion = (tipo) => {
    if (!tipo) return "";

    const clave = tipo
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (NOMBRES_TIPO_HABITACION[clave]) {
        return NOMBRES_TIPO_HABITACION[clave];
    }

    // Tipo no reconocido: al menos ponemos la inicial en mayúscula
    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
};

const Reserva = () => {
    const { paqueteId } = useParams();
    const navigate = useNavigate();

    // -------------------------------------------------
    // ESTADOS
    // -------------------------------------------------

    const [participantes, setParticipantes] = useState([getNuevoParticipante()]);

    const [cliente, setCliente] = useState(null);
    const [plazasDisponibles, setPlazasDisponibles] = useState(null);
    const [paquete, setPaquete] = useState(null);
    const [puntosMapa, setPuntosMapa] = useState([]);
    const [itinerarios, setItinerarios] = useState([]);
    const [imagenes, setImagenes] = useState([]);

    // Precios por tipo de habitación (vienen de paquete.precios)
    const [preciosHabitacion, setPreciosHabitacion] = useState([]);
    const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);

    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [dniBloqueados, setDniBloqueados] = useState({});
    const [validandoDni, setValidandoDni] = useState({});

    // Aceptación de las condiciones especiales de la oferta
    // (Black Friday / Cyber Monday)
    const [aceptaCondicionesBF, setAceptaCondicionesBF] = useState(false);

    const tooltipRef = useRef(null);

    // Condiciones de la oferta del paquete (null si no requiere ninguna)
    const condicionesOferta = CONDICIONES_OFERTA[paquete?.oferta] || null;
    const faltaAceptarCondiciones = !!condicionesOferta && !aceptaCondicionesBF;

    // -------------------------------------------------
    // LÍMITE MÁXIMO DE VIAJEROS
    // -------------------------------------------------
    const maxViajeros =
        paquete?.viajerosFijos && paquete.viajerosFijos > 0
            ? paquete.viajerosFijos
            : plazasDisponibles || 1;

    // Cuando el paquete tiene precios por tipo de habitación, el nº de
    // viajeros lo fija la habitación elegida y no se puede tocar a mano.
    const viajerosEditables = preciosHabitacion.length === 0;

    // -------------------------------------------------
    // ⭐ DISPONIBILIDAD DE HABITACIONES ⭐
    // -------------------------------------------------
    //
    // Una habitación "cabe" si su capacidad no supera las plazas que
    // quedan libres en el paquete.
    //
    const cabeEnPlazas = (precio) => {
        if (plazasDisponibles === null || plazasDisponibles === undefined) {
            return true; // aún no ha cargado el dato: no bloqueamos por error
        }
        return getCapacidadHabitacion(precio) <= plazasDisponibles;
    };

    // Una habitación se puede elegir si cabe en las plazas Y quedan
    // unidades de ese tipo (stock de habitaciones).
    const habitacionDisponible = (precio) =>
        cabeEnPlazas(precio) && hayStock(precio);

    // Con habitación por tipo, el límite de viajeros es su capacidad,
    // pero nunca puede superar las plazas realmente disponibles
    // (doble comprobación de seguridad, aunque ya no debería hacer
    // falta porque no se puede seleccionar una habitación que no cabe).
    const maxViajerosEfectivo = !viajerosEditables
        ? Math.min(
              getCapacidadHabitacion(habitacionSeleccionada),
              plazasDisponibles ?? Infinity,
          )
        : maxViajeros;

    // -------------------------------------------------
    // PRECIO SEGÚN HABITACIÓN SELECCIONADA
    // -------------------------------------------------
    //
    // Si hay tipos de habitación cargados, el precio por persona
    // es el de la habitación elegida. Si el paquete no tiene
    // precios por habitación configurados, se usa paquete.precio
    // como respaldo (compatibilidad con paquetes antiguos).
    //
    const precioPorPersona = habitacionSeleccionada
        ? Number(habitacionSeleccionada.precio)
        : preciosHabitacion.length === 0
        ? Number(paquete?.precio || 0)
        : 0;

    const totalPrice = precioPorPersona * participantes.length;

    // -------------------------------------------------
    // SELECCIONAR TIPO DE HABITACIÓN
    // -------------------------------------------------
    //
    // El nº de viajeros queda fijado por la capacidad de la
    // habitación elegida: no se puede añadir ni quitar viajeros
    // manualmente, se ajusta automáticamente la lista.
    //
    const ajustarParticipantesACapacidad = (capacidad) => {
        setParticipantes((prev) => {
            if (prev.length === capacidad) return prev;

            if (prev.length > capacidad) {
                return prev.slice(0, capacidad);
            }

            const nuevos = [...prev];
            while (nuevos.length < capacidad) {
                nuevos.push(getNuevoParticipante());
            }
            return nuevos;
        });

        // Descartamos estados de DNI de índices que ya no existen
        setDniBloqueados((prev) => {
            const nuevo = {};
            Object.keys(prev).forEach((k) => {
                if (Number(k) < capacidad) nuevo[k] = prev[k];
            });
            return nuevo;
        });

        setValidandoDni((prev) => {
            const nuevo = {};
            Object.keys(prev).forEach((k) => {
                if (Number(k) < capacidad) nuevo[k] = prev[k];
            });
            return nuevo;
        });
    };

    const seleccionarHabitacion = (precio) => {
        // ⭐ Sin habitaciones de este tipo: bloqueamos la selección
        if (!hayStock(precio)) {
            Swal.fire({
                icon: "warning",
                title: "Habitación agotada",
                text: `Ya no quedan habitaciones ${formatearTipoHabitacion(
                    precio.tipo_habitacion,
                ).toLowerCase()} disponibles. Elige otro tipo de habitación.`,
            });
            return;
        }

        // Bloqueamos la selección si la habitación no cabe en las
        // plazas restantes del paquete.
        if (!cabeEnPlazas(precio)) {
            Swal.fire({
                icon: "warning",
                title: "Plazas insuficientes",
                text: `Solo quedan ${plazasDisponibles} plaza${
                    plazasDisponibles !== 1 ? "s" : ""
                } disponible${
                    plazasDisponibles !== 1 ? "s" : ""
                }. No es posible reservar una habitación ${formatearTipoHabitacion(
                    precio.tipo_habitacion,
                ).toLowerCase()} (${getCapacidadHabitacion(precio)} personas).`,
            });
            return;
        }

        setHabitacionSeleccionada(precio);
        ajustarParticipantesACapacidad(getCapacidadHabitacion(precio));
    };

    // -------------------------------------------------
    // CAMBIAR DATOS DE PARTICIPANTE
    // -------------------------------------------------

    const handleChange = (index, e) => {
        const { name, value } = e.target;

        const nuevos = [...participantes];

        nuevos[index] = {
            ...nuevos[index],
            [name]: value,
        };

        setParticipantes(nuevos);

        if (name === "dni" && validarDNI(value)) {
            validarDniBackend(value, index);
        }
    };

    // -------------------------------------------------
    // VALIDAR DNI EN BACKEND
    // -------------------------------------------------

    const validarDniBackend = async (dni, index) => {
        setValidandoDni((prev) => ({ ...prev, [index]: true }));

        try {
            const res = await axios.post(
                "/api/validar-dni-reserva",
                { dni, paqueteId },
                { withCredentials: true },
            );

            if (res.data.existe) {
                Swal.fire({
                    icon: "warning",
                    title: "Ya existe una reserva",
                    text: "Ya existe una reserva en el sistema para este viajero.",
                });

                const nuevos = [...participantes];
                nuevos[index].dni = "";
                setParticipantes(nuevos);

                setDniBloqueados((prev) => ({ ...prev, [index]: true }));
            } else {
                setDniBloqueados((prev) => ({ ...prev, [index]: false }));
            }
        } catch (error) {
            console.error("Error al validar DNI:", error);
        } finally {
            setValidandoDni((prev) => ({ ...prev, [index]: false }));
        }
    };

    // -------------------------------------------------
    // SESIÓN
    // -------------------------------------------------

    useEffect(() => {
        axios
            .get("/api/check-session", { withCredentials: true })
            .then(() => setIsLoggedIn(true))
            .catch(() => setIsLoggedIn(false));
    }, []);

    // -------------------------------------------------
    // CARGAR DATOS DEL PAQUETE
    // -------------------------------------------------

    useEffect(() => {
        setError(null);
        setLoading(true);

        const fetchPaquete = axios.get(`/api/paquetes/${paqueteId}`, {
            withCredentials: true,
        });

        const fetchImagenes = axios.get(`/api/paquetes/${paqueteId}/imagenes`, {
            withCredentials: true,
        });

        const fetchPuntos = axios.get(`/api/paquetes/${paqueteId}/puntos`, {
            withCredentials: true,
        });

        const fetchItinerarios = axios.get(`/api/paquetes/${paqueteId}/itinerarios`, {
            withCredentials: true,
        });

        const fetchCliente = axios.get("/api/pago/cliente", {
            withCredentials: true,
        });

        Promise.all([fetchPaquete, fetchImagenes, fetchPuntos, fetchItinerarios, fetchCliente])
            .then(([resPaquete, resImagenes, resPuntos, resItinerarios, resCliente]) => {
                const paqueteData = resPaquete.data;

                setPaquete(paqueteData);
                setImagenes(resImagenes.data);
                setPuntosMapa(resPuntos.data);
                setItinerarios(resItinerarios.data);
                setCliente(resCliente.data);
                setPlazasDisponibles(paqueteData.plazas);

                // Precios por tipo de habitación (relación 'precios' del paquete)
                const precios = Array.isArray(paqueteData.precios) ? paqueteData.precios : [];
                setPreciosHabitacion(precios);

                // -------------------------------------------------
                // PRESELECCIÓN DE HABITACIÓN
                // -------------------------------------------------
                //
                // Se busca la primera habitación que:
                //   1) quepa en las plazas restantes del paquete, y
                //   2) tenga habitaciones disponibles (stock).
                //
                // Si ninguna cumple, no se preselecciona ninguna: el
                // usuario verá el aviso en cada tarjeta y el botón de
                // envío permanecerá deshabilitado.
                //
                const primeraHabitacionDisponible =
                    precios.find(
                        (p) =>
                            getCapacidadHabitacion(p) <= paqueteData.plazas &&
                            hayStock(p),
                    ) || null;

                setHabitacionSeleccionada(primeraHabitacionDisponible);

                const capacidadInicial = primeraHabitacionDisponible
                    ? getCapacidadHabitacion(primeraHabitacionDisponible)
                    : Math.min(1, paqueteData.plazas || 1);

                setParticipantes(
                    Array.from({ length: capacidadInicial || 1 }, () =>
                        getNuevoParticipante(),
                    ),
                );
            })
            .catch((err) => {
                console.error(err);
                setError("No se pudieron cargar todos los datos");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [paqueteId]);

    // -------------------------------------------------
    // INTERACCIONES MAPA
    // -------------------------------------------------

    useEffect(() => {
        if (typeof $ !== "undefined") {
            $(".dia")
                .off("click")
                .on("click", function () {
                    const target = $(this).data("target");
                    $(target).slideToggle();
                });
        }

        return () => {
            if (typeof $ !== "undefined") {
                $(".dia").off("click");
            }
        };
    }, [puntosMapa]);

    // -------------------------------------------------
    // AÑADIR PARTICIPANTE
    // -------------------------------------------------

    const agregarParticipante = () => {
        if (participantes.length >= maxViajeros) {
            Swal.fire({
                icon: "warning",
                title: "Límite alcanzado",
                text:
                    paquete?.viajerosFijos && paquete.viajerosFijos > 0
                        ? `Este paquete permite un máximo de ${paquete.viajerosFijos} viajeros por reserva.`
                        : "No hay más plazas disponibles.",
            });
            return;
        }

        setParticipantes((prev) => [...prev, getNuevoParticipante()]);
    };

    // -------------------------------------------------
    // ELIMINAR PARTICIPANTE
    // -------------------------------------------------

    const eliminarParticipante = (index) => {
        if (participantes.length === 1) {
            Swal.fire({
                icon: "info",
                title: "No permitido",
                text: "Debe haber al menos un viajero.",
            });
            return;
        }

        const nuevos = participantes.filter((_, i) => i !== index);
        setParticipantes(nuevos);

        setDniBloqueados((prev) => {
            const nuevoEstado = {};
            Object.keys(prev).forEach((key) => {
                const numericKey = Number(key);
                if (numericKey < index) nuevoEstado[numericKey] = prev[key];
                else if (numericKey > index) nuevoEstado[numericKey - 1] = prev[key];
            });
            return nuevoEstado;
        });

        setValidandoDni((prev) => {
            const nuevoEstado = {};
            Object.keys(prev).forEach((key) => {
                const numericKey = Number(key);
                if (numericKey < index) nuevoEstado[numericKey] = prev[key];
                else if (numericKey > index) nuevoEstado[numericKey - 1] = prev[key];
            });
            return nuevoEstado;
        });

        Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "El viajero ha sido eliminado.",
            timer: 1500,
            showConfirmButton: false,
        });
    };

    // -------------------------------------------------
    // IR A PAGO
    // -------------------------------------------------

    const handleIrAPago = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        // CONDICIONES ESPECIALES DE LA OFERTA (Black Friday / Cyber Monday)
        if (faltaAceptarCondiciones) {
            Swal.fire({
                icon: "warning",
                title: "Condiciones no aceptadas",
                text: `Debes leer y aceptar las ${condicionesOferta.nombre} antes de continuar.`,
            });
            setIsSubmitting(false);
            return;
        }

        // TIPO DE HABITACIÓN OBLIGATORIO (si el paquete tiene precios por habitación)
        if (preciosHabitacion.length > 0 && !habitacionSeleccionada) {
            Swal.fire({
                icon: "warning",
                title: "Selecciona una habitación",
                text: "Debes elegir un tipo de habitación antes de continuar.",
            });
            setIsSubmitting(false);
            return;
        }

        // ⭐ Doble comprobación de seguridad: plazas Y stock ⭐
        // Aunque ya no debería ser posible seleccionar una habitación
        // no disponible, comprobamos otra vez aquí por si los datos
        // cambiaron mientras el usuario tenía el formulario abierto.
        if (
            preciosHabitacion.length > 0 &&
            habitacionSeleccionada &&
            !habitacionDisponible(habitacionSeleccionada)
        ) {
            Swal.fire({
                icon: "error",
                title: "Habitación no disponible",
                text: "La habitación seleccionada ya no está disponible. Elige otra habitación.",
            });
            setHabitacionSeleccionada(null);
            setIsSubmitting(false);
            return;
        }

        // MÁXIMO DE VIAJEROS
        if (participantes.length > maxViajerosEfectivo) {
            Swal.fire({
                icon: "error",
                title: "Número de viajeros no válido",
                text: `El máximo permitido es de ${maxViajerosEfectivo} viajero${maxViajerosEfectivo !== 1 ? "s" : ""}.`,
            });
            setIsSubmitting(false);
            return;
        }

        // CAMPOS VACÍOS
        const camposVacios = participantes.some((p) =>
            Object.entries(p).some(([campo, valor]) => {
                if (campo === "infoRelevante") return false;
                return typeof valor === "string" && valor.trim() === "";
            }),
        );

        if (camposVacios) {
            Swal.fire({
                icon: "warning",
                title: "Campos vacíos",
                text: "Completa todos los campos obligatorios antes de continuar.",
            });
            setIsSubmitting(false);
            return;
        }

        // EMAIL
        for (const p of participantes) {
            if (!validarEmail(p.email)) {
                Swal.fire({
                    icon: "error",
                    title: "Email inválido",
                    text: `El email ${p.email} no es válido.`,
                });
                setIsSubmitting(false);
                return;
            }
        }

        // DNI
        for (const p of participantes) {
            if (!validarDNI(p.dni)) {
                Swal.fire({
                    icon: "error",
                    title: "DNI inválido",
                    text: `El DNI ${p.dni} no es válido.`,
                });
                setIsSubmitting(false);
                return;
            }
        }

        // DNI EN VALIDACIÓN
        if (Object.values(validandoDni).some((v) => v === true)) {
            Swal.fire({
                icon: "info",
                title: "Validando DNI",
                text: "Espera a que se validen todos los DNIs antes de continuar.",
            });
            setIsSubmitting(false);
            return;
        }

        // DNI BLOQUEADOS
        if (Object.values(dniBloqueados).some((v) => v === true)) {
            Swal.fire({
                icon: "warning",
                title: "DNI duplicado",
                text: "Hay viajeros que ya tienen una reserva confirmada para este viaje. Corrige los DNIs o elimina esos participantes.",
            });
            setIsSubmitting(false);
            return;
        }

        // DNIs DUPLICADOS
        const dnis = participantes.map((p) => p.dni);
        const dnisDuplicados = dnis.filter((dni, index) => dnis.indexOf(dni) !== index);

        if (dnisDuplicados.length > 0) {
            Swal.fire({
                icon: "error",
                title: "DNI duplicado",
                text: "No puede haber dos viajeros con el mismo DNI en la misma reserva.",
            });
            setIsSubmitting(false);
            return;
        }

        // FECHA DE NACIMIENTO
        const hoy = new Date();

        for (const p of participantes) {
            const fechaNac = new Date(p.fechaNacimiento);
            const edad = hoy.getFullYear() - fechaNac.getFullYear();

            if (edad > 110) {
                Swal.fire({
                    icon: "error",
                    title: "Fecha de nacimiento inválida",
                    text: "La edad no es correcta.",
                });
                setIsSubmitting(false);
                return;
            }
        }

        // CLIENTE
        if (!cliente) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo obtener el cliente.",
            });
            setIsSubmitting(false);
            return;
        }

        // GUARDAR RESERVA TEMPORAL
        try {
            await axios.post(
                "/api/registro/reserva/temp",
                {
                    paqueteId: parseInt(paqueteId),
                    participantes,
                    // Tipo de habitación elegido y precio aplicado
                    precio_paquete_id: habitacionSeleccionada?.id || null,
                    tipo_habitacion: habitacionSeleccionada?.tipo_habitacion || null,
                    precio_unitario: precioPorPersona,
                    total: totalPrice,
                    // Se reutiliza el campo existente para Black Friday y Cyber Monday
                    acepta_condiciones_black_friday: condicionesOferta
                        ? aceptaCondicionesBF
                        : false,
                },
                { withCredentials: true },
            );

            navigate(`/seleccionar-pago/${paqueteId}`, {
                replace: true,
                state: {
                    participantes,
                    plazas: participantes.length,
                    tipoHabitacion: habitacionSeleccionada?.tipo_habitacion || null,
                    // ⭐ Se propaga también a TipoPago.jsx, que lo necesita
                    // para calcular el precio real de la habitación.
                    precioPaqueteId: habitacionSeleccionada?.id || null,
                    precioPorPersona: precioPorPersona,
                    total: totalPrice,
                },
            });
        } catch (error) {
            console.error("Error al guardar reserva temporal:", error);
            setIsSubmitting(false);

            // ⭐ Si el backend responde que ya no hay plazas o habitaciones
            // (por ejemplo, otra persona reservó justo antes), avisamos
            // con un mensaje claro en vez del genérico.
            const mensajeBackend = error?.response?.data?.error;

            Swal.fire({
                icon: "error",
                title: "Error",
                text:
                    typeof mensajeBackend === "string"
                        ? mensajeBackend
                        : "No se pudo guardar la reserva temporal.",
            });
        }
    };

    // -------------------------------------------------
    // LOADING
    // -------------------------------------------------

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <Loader size={64} className="spin" color="#000000" />
            </div>
        );
    }

    // -------------------------------------------------
    // RENDER
    // -------------------------------------------------

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        body { margin: 0; }
                        .bg-cover {
                            background-size: cover;
                            background-position: center;
                            background-repeat: no-repeat;
                            filter: brightness(75%);
                        }
                        .hero-container { background-color: transparent !important; }
                        .habitacion-card {
                            cursor: pointer;
                            transition: all 0.2s ease;
                        }
                        .habitacion-card:hover {
                            transform: translateY(-2px);
                        }
                        .habitacion-card.disabled {
                            cursor: not-allowed;
                            opacity: 0.45;
                        }
                        .habitacion-card.disabled:hover {
                            transform: none;
                        }
                    `,
                }}
            />

            {/* HERO */}
            <section className="w-100 m-0 p-0">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="position-relative overflow-hidden"
                    style={{
                        paddingTop: "5rem",
                        paddingBottom: "5rem",
                        background: "linear-gradient(to right, #000000, #877c4f)",
                    }}
                >
                    <div className="position-absolute top-0 start-0 w-100 h-100">
                        <img
                            src={
                                paquete
                                    ? `/storage/paquetes/portada/${paqueteId}/${paquete.foto}`
                                    : "https://via.placeholder.com/1920x1080"
                            }
                            alt={paquete ? paquete.nombre : "Imagen de paquete"}
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                        />
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                        ></div>
                    </div>

                    <section className="position-relative px-3 px-sm-4 px-lg-5">
                        <div
                            className="container position-relative"
                            style={{ zIndex: 2, maxWidth: "1200px" }}
                        >
                            <button
                                type="button"
                                onClick={() => (window.location.href = `/experiencia/${paqueteId}`)}
                                className="btn btn-link d-flex align-items-center mb-4"
                                style={{
                                    transition: "color 0.3s ease, background-color 0.3s ease",
                                    textDecoration: "none",
                                    boxShadow: "none",
                                    color: "#ffffff",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "10pt",
                                }}
                            >
                                <ArrowLeft size={20} className="me-2" />
                                Volver
                            </button>

                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-center"
                            >
                                <h1
                                    className="fw-bold"
                                    style={{
                                        color: "#ffffff",
                                        fontFamily: '"TT Espina Trial Variable", sans-serif',
                                        fontSize: "clamp(2rem, 5vw, 4rem)",
                                        transform: "scaleX(1.5)",
                                        display: "inline-block",
                                    }}
                                >
                                    Reserva tu Aventura
                                </h1>

                                <p
                                    className="lead mx-auto"
                                    style={{ maxWidth: "720px", fontSize: "14pt", color: "#ffffff" }}
                                >
                                    Estás a un paso de vivir una experiencia inolvidable. Completa el
                                    formulario y nos pondremos en contacto contigo.
                                </p>
                            </motion.div>
                        </div>
                    </section>
                </motion.div>

                {/* CONTENIDO */}
                <div className="container py-5">
                    <div className="row g-4">
                        {/* FORMULARIO */}
                        <div className="col-lg-8">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                                    {/* SELECTOR DE TIPO DE HABITACIÓN */}
                                    {preciosHabitacion.length > 0 && (
                                        <div
                                            className="rounded-4 shadow-sm border p-4 mb-4"
                                            style={{
                                                backgroundColor: "#000000",
                                                borderColor: "rgba(53,55,46,0.1)",
                                            }}
                                        >
                                            <h6
                                                className="mb-3 fw-semibold d-flex align-items-center"
                                                style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif" }}
                                            >
                                                <BedDouble size={18} className="me-2" />
                                                Elige tu tipo de habitación
                                            </h6>

                                            {/* ⭐ Aviso cuando ninguna habitación está disponible
                                                (ni por plazas ni por stock) */}
                                            {plazasDisponibles !== null &&
                                                preciosHabitacion.every((p) => !habitacionDisponible(p)) && (
                                                    <div
                                                        className="alert mb-3"
                                                        style={{
                                                            backgroundColor: "rgba(220,53,69,0.15)",
                                                            border: "1px solid rgba(220,53,69,0.5)",
                                                            color: "#ffffff",
                                                            fontFamily: "'Inter', sans-serif",
                                                            fontSize: "13px",
                                                        }}
                                                    >
                                                        Ahora mismo no hay ningún tipo de habitación
                                                        disponible para este paquete (quedan{" "}
                                                        {plazasDisponibles} plaza
                                                        {plazasDisponibles !== 1 ? "s" : ""}). No es
                                                        posible completar la reserva.
                                                    </div>
                                                )}

                                            <div className="row g-3">
                                                {preciosHabitacion.map((precio) => {
                                                    const seleccionada =
                                                        habitacionSeleccionada?.id === precio.id;

                                                    const disponible = habitacionDisponible(precio);
                                                    const sinStock = !hayStock(precio);
                                                    const restantes = getHabitacionesRestantes(precio);
                                                    const pocasQuedan =
                                                        !sinStock && restantes !== null && restantes <= 3;

                                                    return (
                                                        <div className="col-md-6" key={precio.id}>
                                                            <div
                                                                className={`habitacion-card rounded-3 p-3 h-100 ${
                                                                    disponible ? "" : "disabled"
                                                                }`}
                                                                onClick={() =>
                                                                    disponible && seleccionarHabitacion(precio)
                                                                }
                                                                aria-disabled={!disponible}
                                                                style={{
                                                                    border: seleccionada
                                                                        ? "2px solid #FEDE59"
                                                                        : "1px solid rgba(255,255,255,0.3)",
                                                                    backgroundColor: seleccionada
                                                                        ? "rgba(58,158,47,0.15)"
                                                                        : "rgba(255,255,255,0.05)",
                                                                }}
                                                            >
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <span
                                                                        style={{
                                                                            color: "#ffffff",
                                                                            fontFamily: "'Inter', sans-serif",
                                                                            fontSize: "14px",
                                                                            fontWeight: seleccionada ? 600 : 400,
                                                                        }}
                                                                    >
                                                                        {formatearTipoHabitacion(precio.tipo_habitacion)}
                                                                    </span>

                                                                    <span
                                                                        style={{
                                                                            color: "#ffffff",
                                                                            fontFamily: "'Inter', sans-serif",
                                                                            fontSize: "14px",
                                                                            fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        {Number(precio.precio).toFixed(2)} € / persona
                                                                    </span>
                                                                </div>

                                                                {/* ⭐ Aviso individual por tarjeta */}
                                                                {!disponible && (
                                                                    <small
                                                                        className="d-block mt-1"
                                                                        style={{
                                                                            color: "#ff8080",
                                                                            fontFamily: "'Inter', sans-serif",
                                                                            fontSize: "11px",
                                                                        }}
                                                                    >
                                                                        {sinStock
                                                                            ? "Agotada"
                                                                            : `Sin plazas suficientes (necesita ${getCapacidadHabitacion(
                                                                                  precio,
                                                                              )}, quedan ${plazasDisponibles})`}
                                                                    </small>
                                                                )}

                                                                {/* ⭐ Pocas habitaciones restantes */}
                                                                {disponible && pocasQuedan && (
                                                                    <small
                                                                        className="d-block mt-1"
                                                                        style={{
                                                                            color: "#FEDE59",
                                                                            fontFamily: "'Inter', sans-serif",
                                                                            fontSize: "11px",
                                                                        }}
                                                                    >
                                                                        ¡Solo quedan {restantes} habitación
                                                                        {restantes !== 1 ? "es" : ""}!
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <small
                                                className="d-block mt-3"
                                                style={{
                                                    color: "rgba(255,255,255,0.7)",
                                                    fontFamily: "'Inter', sans-serif",
                                                    fontSize: "8pt",
                                                }}
                                            >
                                                El número de viajeros se ajusta automáticamente según
                                                la habitación elegida.
                                            </small>
                                        </div>
                                    )}

                                    {participantes.map((p, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                        >
                                            <div
                                                className="rounded-4 shadow-sm border"
                                                style={{
                                                    backgroundColor: "#000000",
                                                    borderColor: "rgba(53,55,46,0.1)",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {/* CABECERA */}
                                                <div
                                                    className="d-flex justify-content-between align-items-center p-3"
                                                    style={{
                                                        background:
                                                            "linear-gradient(to right, rgba(53,55,46,0.05), rgba(135,124,79,0.05))",
                                                    }}
                                                >
                                                    <h5
                                                        className="m-0 d-flex align-items-center"
                                                        style={{ color: "#ffffff", fontSize: "16px" }}
                                                    >
                                                        <User className="me-2" size={20} />
                                                        Viajero {index + 1}
                                                        {index === 0 && (
                                                            <span
                                                                className="badge ms-3"
                                                                style={{ backgroundColor: "#ffffff", color: "#000000" }}
                                                            >
                                                                Principal
                                                            </span>
                                                        )}
                                                    </h5>

                                                    {viajerosEditables && participantes.length > 1 && index > 0 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm d-flex align-items-center"
                                                            onClick={() => eliminarParticipante(index)}
                                                            style={{
                                                                fontFamily: "'Inter', sans-serif",
                                                                border: "1px solid red",
                                                                color: "#fff",
                                                                backgroundColor: "red",
                                                            }}
                                                        >
                                                            <Trash2 size={16} className="me-1" />
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>

                                                {/* CONTENIDO */}
                                                <div className="p-4">
                                                    <h6
                                                        className="mb-3 fw-semibold d-flex align-items-center"
                                                        style={{ color: "#ffffff" }}
                                                    >
                                                        <span
                                                            style={{
                                                                display: "inline-block",
                                                                width: "8px",
                                                                height: "8px",
                                                                backgroundColor: "#ffffff",
                                                                borderRadius: "50%",
                                                                marginRight: "10px",
                                                            }}
                                                        ></span>
                                                        Datos de Contacto
                                                    </h6>

                                                    <div className="row g-3 mb-4">
                                                        <div className="col-md-6">
                                                            <label className="form-label" style={labelStyle}>
                                                                Nombre *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={p.nombre}
                                                                onChange={(e) => handleChange(index, e)}
                                                                name="nombre"
                                                                required
                                                                style={inputStyle}
                                                            />
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label className="form-label" style={labelStyle}>
                                                                Apellidos *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={p.apellidos}
                                                                onChange={(e) => handleChange(index, e)}
                                                                name="apellidos"
                                                                required
                                                                style={{ ...inputStyle, borderColor: "#e9dab6" }}
                                                            />
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label className="form-label" style={labelStyle}>
                                                                Email *
                                                            </label>
                                                            <input
                                                                type="email"
                                                                className="form-control"
                                                                value={p.email}
                                                                onChange={(e) => handleChange(index, e)}
                                                                name="email"
                                                                required
                                                                style={inputStyle}
                                                            />
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label className="form-label" style={labelStyle}>
                                                                DNI *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={p.dni}
                                                                name="dni"
                                                                required
                                                                onChange={(e) => handleChange(index, e)}
                                                                onBlur={() => {
                                                                    if (!validarDNI(p.dni)) {
                                                                        Swal.fire({
                                                                            icon: "error",
                                                                            title: "DNI no válido",
                                                                            text: "El DNI introducido no es válido. Comprueba número y letra.",
                                                                        });

                                                                        const nuevos = [...participantes];
                                                                        nuevos[index].dni = "";
                                                                        setParticipantes(nuevos);
                                                                        return;
                                                                    }

                                                                    validarDniBackend(p.dni, index);
                                                                }}
                                                                style={inputStyle}
                                                            />
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label className="form-label" style={labelStyle}>
                                                                Teléfono *
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                className="form-control"
                                                                value={p.telefono}
                                                                onChange={(e) => handleChange(index, e)}
                                                                name="telefono"
                                                                required
                                                                style={inputStyle}
                                                            />
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label className="form-label" style={labelStyle}>
                                                                Dirección *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={p.direccion}
                                                                onChange={(e) => handleChange(index, e)}
                                                                name="direccion"
                                                                required
                                                                style={inputStyle}
                                                            />
                                                        </div>

                                                        <div className="col-md-4">
                                                            <label className="form-label" style={labelStyle}>
                                                                Ciudad *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={p.ciudad}
                                                                onChange={(e) => handleChange(index, e)}
                                                                name="ciudad"
                                                                required
                                                                style={inputStyle}
                                                            />
                                                        </div>

                                                        <div className="col-md-4">
                                                            <label className="form-label" style={labelStyle}>
                                                                Provincia *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={p.provincia}
                                                                onChange={(e) => handleChange(index, e)}
                                                                name="provincia"
                                                                required
                                                                style={inputStyle}
                                                            />
                                                        </div>

                                                        <div className="col-md-4">
                                                            <label className="form-label" style={labelStyle}>
                                                                Fecha de nacimiento *
                                                            </label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={p.fechaNacimiento}
                                                                name="fechaNacimiento"
                                                                min={fechaMinNacimiento}
                                                                max={fechaMaxNacimiento}
                                                                required
                                                                onChange={(e) => handleChange(index, e)}
                                                                onBlur={() => {
                                                                    if (p.fechaNacimiento < fechaMinNacimiento) {
                                                                        Swal.fire({
                                                                            icon: "error",
                                                                            title: "Fecha no válida",
                                                                            text: "La fecha de nacimiento no es correcta.",
                                                                            confirmButtonText: "Aceptar",
                                                                        });

                                                                        const nuevos = [...participantes];
                                                                        nuevos[index].fechaNacimiento = "";
                                                                        setParticipantes(nuevos);
                                                                    }
                                                                }}
                                                                style={inputStyle}
                                                            />
                                                        </div>
                                                    </div>

                                                    <hr className="my-3" />

                                                    <h6
                                                        className="mb-3 fw-semibold d-flex align-items-center"
                                                        style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif" }}
                                                    >
                                                        <span
                                                            style={{
                                                                display: "inline-block",
                                                                width: "8px",
                                                                height: "8px",
                                                                backgroundColor: "#ffffff",
                                                                borderRadius: "50%",
                                                                marginRight: "10px",
                                                            }}
                                                        ></span>
                                                        Cuéntanos más sobre ti
                                                    </h6>

                                                    <div className="mb-3">
                                                        <label className="form-label" style={labelStyle}>
                                                            ¿Cuál es tu experiencia como viajero/a? *
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="3"
                                                            value={p.experiencia}
                                                            onChange={(e) => handleChange(index, e)}
                                                            name="experiencia"
                                                            required
                                                            style={{
                                                                backgroundColor: "#ffffff",
                                                                borderColor: "#ffffff",
                                                                fontFamily: "Inter, sans-serif",
                                                                fontSize: "12px",
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label" style={labelStyle}>
                                                            ¿Por qué quieres unirte a esta expedición? *
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="3"
                                                            value={p.motivacion}
                                                            onChange={(e) => handleChange(index, e)}
                                                            name="motivacion"
                                                            required
                                                            style={{
                                                                backgroundColor: "#ffffff",
                                                                borderColor: "#ffffff",
                                                                fontFamily: "Inter, sans-serif",
                                                                fontSize: "12px",
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label" style={labelStyle}>
                                                            ¿Hay algo importante que debamos saber sobre ti?
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="3"
                                                            value={p.infoRelevante}
                                                            onChange={(e) => handleChange(index, e)}
                                                            name="infoRelevante"
                                                            style={{
                                                                backgroundColor: "#ffffff",
                                                                borderColor: "#ffffff",
                                                                fontFamily: "Inter, sans-serif",
                                                                fontSize: "12px",
                                                            }}
                                                        />
                                                        <small
                                                            className="text-white"
                                                            style={{ fontFamily: "'Inter', sans-serif", fontSize: "8pt" }}
                                                        >
                                                            Esta información nos ayuda a personalizar tu experiencia y
                                                            garantizar tu seguridad.
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>

                                            <br />
                                        </motion.div>
                                    ))}

                                    {/* AVISO PRIVACIDAD */}
                                    <div
                                        className="mt-3 mb-3 p-3 rounded"
                                        style={{
                                            backgroundColor: "rgba(255,255,255,0.1)",
                                            border: "1px solid rgba(255,255,255,0.3)",
                                            fontSize: "12px",
                                            color: "#000000",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        Al añadir los datos de otros viajeros, confirmas que tienes su
                                        consentimiento para facilitar sus datos personales con el fin de
                                        gestionar esta reserva, de acuerdo con nuestra{" "}
                                        <Link
                                            to="/politica"
                                            style={{ color: "#493f2f", textDecoration: "underline", fontSize: "12px" }}
                                        >
                                            Política de Privacidad
                                        </Link>
                                        .
                                    </div>

                                    {/* CONDICIONES ESPECIALES (Black Friday / Cyber Monday) */}
                                    {condicionesOferta && (
                                        <div
                                            className="mt-3 mb-3 p-3 rounded"
                                            style={{
                                                backgroundColor: "rgba(255,255,255,0.1)",
                                                border: "1px solid rgba(255,255,255,0.3)",
                                                fontFamily: "Inter, sans-serif",
                                            }}
                                        >
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`aceptaCondiciones-${paqueteId}`}
                                                    checked={aceptaCondicionesBF}
                                                    onChange={(e) => setAceptaCondicionesBF(e.target.checked)}
                                                    required
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`aceptaCondiciones-${paqueteId}`}
                                                    style={{ color: "#000000", fontSize: "12px" }}
                                                >
                                                    He leído y acepto las{" "}
                                                    <strong>{condicionesOferta.nombre}</strong>{" "}
                                                    {condicionesOferta.detalle}.
                                                </label>
                                            </div>

                                            <a
                                                href={condicionesOferta.pdf}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: "#493f2f",
                                                    textDecoration: "underline",
                                                    fontSize: "12px",
                                                    display: "inline-block",
                                                    marginTop: "0.5rem",
                                                }}
                                            >
                                                {condicionesOferta.enlace}
                                            </a>
                                        </div>
                                    )}

                                    <br />

                                    {/* BOTÓN ENVIAR */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.5 }}
                                        className="text-center"
                                    >
                                        <button
                                            type="button"
                                            className="btn px-4 py-2"
                                            disabled={
                                                faltaAceptarCondiciones ||
                                                (preciosHabitacion.length > 0 && !habitacionSeleccionada) ||
                                                isSubmitting
                                            }
                                            style={{
                                                backgroundColor:
                                                    faltaAceptarCondiciones ||
                                                    (preciosHabitacion.length > 0 && !habitacionSeleccionada)
                                                        ? "#555555"
                                                        : "#000000",
                                                backdropFilter: "blur(12px)",
                                                WebkitBackdropFilter: "blur(12px)",
                                                color: "#ffffff",
                                                border: "1px solid rgba(255,255,255,0.5)",
                                                minWidth: "110px",
                                                textAlign: "center",
                                                fontSize: "12px",
                                                transition: "all 0.3s ease",
                                                fontFamily: "Inter, sans-serif",
                                                cursor:
                                                    faltaAceptarCondiciones ||
                                                    (preciosHabitacion.length > 0 && !habitacionSeleccionada)
                                                        ? "not-allowed"
                                                        : "pointer",
                                            }}
                                            onClick={handleIrAPago}
                                        >
                                            {isSubmitting ? (
                                                <div className="spinner-border spinner-border-sm text-white" role="status">
                                                    <span className="visually-hidden">Cargando...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <CreditCard size={20} className="me-2" />
                                                    Enviar reserva
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                </form>
                            </motion.div>
                        </div>

                        {/* RESUMEN */}
                        <div className="col-lg-4">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="position-sticky"
                                style={{ top: "8rem" }}
                            >
                                <div
                                    className="card rounded-4"
                                    style={{ backgroundColor: "#000000", border: "1px solid #ffffff" }}
                                >
                                    <div className="card-header" style={{ borderBottom: "none" }}>
                                        <h5 className="card-title" style={{ color: "#ffffff" }}>
                                            Resumen de Reserva
                                        </h5>
                                    </div>

                                    <div className="card-body">
                                        <div className="mb-4">
                                            <div className="ratio ratio-16x9 rounded mb-2 overflow-hidden">
                                                <img
                                                    src={
                                                        paquete
                                                            ? `/storage/paquetes/portada/${paqueteId}/${paquete.foto}`
                                                            : ""
                                                    }
                                                    alt={paquete?.titulo || "Imagen de la experiencia"}
                                                    className="img-fluid w-100 h-100 object-fit-cover"
                                                />
                                            </div>

                                            {paquete && (
                                                <span
                                                    className="badge"
                                                    style={{
                                                        backgroundColor: "#ffffff",
                                                        color: "#000000",
                                                        fontFamily: "'Inter', sans-serif",
                                                    }}
                                                >
                                                    {paquete.tipo_viaje}
                                                </span>
                                            )}

                                            <h3
                                                className="fw-bold mt-2 mb-2"
                                                style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "18px" }}
                                            >
                                                {paquete?.nombre || "Nombre no disponible"}
                                            </h3>

                                            <div className="text-muted small" style={{ color: "rgba(53,55,46,0.7)" }}>
                                                <div
                                                    className="d-flex align-items-center mb-1"
                                                    style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                                                >
                                                    <MapPin size={14} className="me-2" />
                                                    <span>{paquete ? paquete.lugar : "Cargando..."}</span>
                                                </div>

                                                <div
                                                    className="d-flex align-items-center mb-1"
                                                    style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                                                >
                                                    <Calendar size={14} className="me-2" />
                                                    <span>
                                                        {(() => {
                                                            if (!paquete?.fecha_inicio || !paquete?.fecha_fin) {
                                                                return "Cargando...";
                                                            }

                                                            const inicio = new Date(paquete.fecha_inicio);
                                                            const fin = new Date(paquete.fecha_fin);
                                                            const diaInicio = inicio.getDate();
                                                            const diaFin = fin.getDate();
                                                            const mes = fin.toLocaleDateString("es-ES", { month: "long" });
                                                            const año = fin.getFullYear();

                                                            return `${diaInicio} al ${diaFin} de ${mes} de ${año}`;
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <hr style={{ borderColor: "#ffffff" }} />

                                        {/* TIPO DE HABITACIÓN ELEGIDA */}
                                        {preciosHabitacion.length > 0 && (
                                            <>
                                                <div className="mb-3">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <BedDouble size={16} className="me-2 text-white" />
                                                        <span
                                                            className="fw-medium"
                                                            style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                                                        >
                                                            Habitación
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="small"
                                                        style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                                                    >
                                                        {habitacionSeleccionada
                                                            ? formatearTipoHabitacion(habitacionSeleccionada.tipo_habitacion)
                                                            : "Sin seleccionar"}
                                                    </div>
                                                </div>
                                                <hr style={{ borderColor: "#ffffff" }} />
                                            </>
                                        )}

                                        {/* VIAJEROS */}
                                        <div className="mb-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <Users size={16} className="me-2 text-white" />
                                                <span
                                                    className="fw-medium"
                                                    style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                                                >
                                                    {participantes.length} viajero{participantes.length !== 1 ? "s" : ""}
                                                </span>
                                            </div>

                                            {participantes.map((traveler, index) => (
                                                <div
                                                    key={index}
                                                    className="small mb-2"
                                                    style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                                                >
                                                    <span className="fw-medium" style={{ color: "#ffffff" }}>
                                                        Viajero {index + 1}:
                                                    </span>{" "}
                                                    {traveler.nombre && traveler.apellidos
                                                        ? `${traveler.nombre} ${traveler.apellidos}`
                                                        : "Datos pendientes"}
                                                </div>
                                            ))}
                                        </div>

                                        <hr style={{ borderColor: "#ffffff" }} />

                                        {/* PRECIO */}
                                        <div>
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between text-muted mb-1">
                                                    <span style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
                                                        Precio por persona:
                                                    </span>
                                                    <span
                                                        className="fw-medium"
                                                        style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}
                                                    >
                                                        {precioPorPersona > 0 ? `${precioPorPersona.toFixed(2)} €` : "Selecciona habitación"}
                                                    </span>
                                                </div>

                                                <div className="d-flex justify-content-between text-muted mb-1">
                                                    <span style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
                                                        Número de viajeros:
                                                    </span>
                                                    <span style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: "14px" }}>
                                                        {participantes.length}
                                                    </span>
                                                </div>
                                            </div>

                                            <hr style={{ borderColor: "#ffffff" }} />

                                            <div
                                                className="d-flex justify-content-between fw-bold fs-5"
                                                style={{ color: "#ffffff", fontFamily: "'Inter', sans-serif" }}
                                            >
                                                <span>Total:</span>
                                                <span>{totalPrice.toFixed(2)} €</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* BOTÓN FLOTANTE AGREGAR VIAJERO */}
                {viajerosEditables && participantes.length < maxViajeros && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                        style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 1050 }}
                    >
                        <button
                            type="button"
                            onClick={agregarParticipante}
                            className="btn"
                            style={{
                                width: "4rem",
                                height: "4rem",
                                borderRadius: "50%",
                                background: "linear-gradient(to right, #FEDE59, #FEDE59)",
                                color: "#ffffff",
                                boxShadow: "0 0.75rem 1.5rem rgba(0,0,0,0.2)",
                                transition: "all 0.3s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                                e.currentTarget.style.boxShadow = "0 1rem 2rem rgba(0,0,0,0.3)";
                                if (tooltipRef.current) tooltipRef.current.style.opacity = 1;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "0 0.75rem 1.5rem rgba(0,0,0,0.2)";
                                if (tooltipRef.current) tooltipRef.current.style.opacity = 0;
                            }}
                        >
                            <Plus size={24} />
                        </button>

                        <div
                            ref={tooltipRef}
                            style={{
                                position: "absolute",
                                top: "-3rem",
                                right: 0,
                                backgroundColor: "#000000",
                                color: "#ffffff",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "0.5rem",
                                fontSize: "0.8rem",
                                whiteSpace: "nowrap",
                                opacity: 0,
                                transition: "opacity 0.3s",
                                pointerEvents: "none",
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            Agregar Viajero
                        </div>
                    </motion.div>
                )}
            </section>
        </>
    );
};

export default Reserva;