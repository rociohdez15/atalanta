import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const ofertas = [
    { key: "", label: "Sin oferta" },
    { key: "navidad", label: "Navidad" },
    { key: "verano", label: "Verano" },
    { key: "san_valentin", label: "San Valentín" },
    { key: "black_friday", label: "Black Friday" },
    { key: "cyber_monday", label: "Cyber Monday" },
    { key: "bajada_precio", label: "Bajada de precio" },
];

const estados = [
    { key: "disponible", label: "Disponible" },
    { key: "proximamente", label: "Próximamente" },
];

const CrearPaquete = () => {
    const [nombre, setNombre] = useState("");
    const [lugar, setLugar] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [precio, setPrecio] = useState("");
    const [tipoViaje, setTipoViaje] = useState("");
    const [oferta, setOferta] = useState("");
    const [ofertaInicio, setOfertaInicio] = useState("");
    const [ofertaFin, setOfertaFin] = useState("");
    const [estado, setEstado] = useState("disponible");
    const [descripcion, setDescripcion] = useState("");
    const [foto, setFoto] = useState(null);
    const [previewFotos, setPreviewFotos] = useState([]);
    const [plazas, setPlazas] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Viajeros fijos
    const [viajerosFijos, setViajerosFijos] = useState("");
    const [tieneViajerosFijos, setTieneViajerosFijos] =
        useState(false);

    const [serviciosIncluidos, setServiciosIncluidos] = useState([
        { descripcion: "", precio: "" },
    ]);

    const [serviciosNoIncluidos, setServiciosNoIncluidos] =
        useState([""]);

    const [galeria, setGaleria] = useState(
        Array(6).fill(null)
    );

    const [previewGaleria, setPreviewGaleria] = useState(
        Array(6).fill(null)
    );

    const [puntosMapa, setPuntosMapa] = useState([
        {
            nombre: "",
            latitud: "",
            longitud: "",
            descripcion: "",
        },
    ]);

    const [itinerario, setItinerario] = useState([
        {
            dia: 1,
            fecha: "",
            descripcion: "",
        },
    ]);

    // =========================================================
    // FOTO DE PORTADA
    // =========================================================

    const handleFotosChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setFoto(null);
            setPreviewFotos([]);
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError(
                "Solo puedes subir archivos de imagen."
            );
            setFoto(null);
            setPreviewFotos([]);
            return;
        }

        setError("");
        setFoto(file);
        setPreviewFotos([
            URL.createObjectURL(file),
        ]);
    };

    // =========================================================
    // GALERÍA
    // =========================================================

    const handleGaleriaChange = (index, file) => {
        const nuevasImagenes = [...galeria];

        nuevasImagenes[index] = file;

        setGaleria(nuevasImagenes);

        const nuevasPrevias = [...previewGaleria];

        nuevasPrevias[index] = file
            ? URL.createObjectURL(file)
            : null;

        setPreviewGaleria(nuevasPrevias);
    };

    // =========================================================
    // SERVICIOS INCLUIDOS
    // =========================================================

    const agregarServicioIncluido = () => {
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
        campo,
        valor
    ) => {
        const nuevosServicios = [
            ...serviciosIncluidos,
        ];

        nuevosServicios[index][campo] = valor;

        setServiciosIncluidos(nuevosServicios);
    };

    const eliminarServicioIncluido = (index) => {
        setServiciosIncluidos(
            serviciosIncluidos.filter(
                (_, i) => i !== index
            )
        );
    };

    // =========================================================
    // SERVICIOS NO INCLUIDOS
    // =========================================================

    const agregarServicioNoIncluido = () => {
        setServiciosNoIncluidos([
            ...serviciosNoIncluidos,
            "",
        ]);
    };

    const cambiarServicioNoIncluido = (
        index,
        valor
    ) => {
        const nuevos = [
            ...serviciosNoIncluidos,
        ];

        nuevos[index] = valor;

        setServiciosNoIncluidos(nuevos);
    };

    const eliminarServicioNoIncluido = (index) => {
        const nuevos =
            serviciosNoIncluidos.filter(
                (_, i) => i !== index
            );

        setServiciosNoIncluidos(
            nuevos.length ? nuevos : [""]
        );
    };

    // =========================================================
    // PUNTOS DEL MAPA
    // =========================================================

    const cambiarPuntoMapa = (
        index,
        campo,
        valor
    ) => {
        const nuevos = [...puntosMapa];

        nuevos[index][campo] = valor;

        setPuntosMapa(nuevos);
    };

    const agregarPuntoMapa = () => {
        setPuntosMapa([
            ...puntosMapa,
            {
                nombre: "",
                latitud: "",
                longitud: "",
                descripcion: "",
            },
        ]);
    };

    const eliminarPuntoMapa = (index) => {
        const nuevos = [...puntosMapa];

        nuevos.splice(index, 1);

        setPuntosMapa(
            nuevos.length
                ? nuevos
                : [
                      {
                          nombre: "",
                          latitud: "",
                          longitud: "",
                          descripcion: "",
                      },
                  ]
        );
    };

    // =========================================================
    // ITINERARIO
    // =========================================================

    const cambiarItinerario = (
        index,
        campo,
        valor
    ) => {
        const nuevos = [...itinerario];

        nuevos[index][campo] = valor;

        setItinerario(nuevos);
    };

    const agregarItinerario = () => {
        setItinerario([
            ...itinerario,
            {
                dia: itinerario.length + 1,
                fecha: "",
                descripcion: "",
            },
        ]);
    };

    const eliminarItinerario = (index) => {
        const nuevos = [...itinerario];

        nuevos.splice(index, 1);

        setItinerario(
            nuevos.length
                ? nuevos
                : [
                      {
                          dia: 1,
                          fecha: "",
                          descripcion: "",
                      },
                  ]
        );
    };

    // =========================================================
    // CREAR PAQUETE
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        // -----------------------------------------------------
        // SERVICIOS INCLUIDOS
        // -----------------------------------------------------

        const serviciosIncluidosValidos =
            serviciosIncluidos
                .filter(
                    (s) =>
                        s.descripcion &&
                        typeof s.descripcion ===
                            "string" &&
                        s.descripcion.trim() !== ""
                )
                .map((s) => ({
                    descripcion:
                        s.descripcion.trim(),
                    precio: Number(
                        s.precio || 0
                    ),
                }));

        // -----------------------------------------------------
        // SERVICIOS NO INCLUIDOS
        // -----------------------------------------------------

        const serviciosNoIncluidosValidos =
            serviciosNoIncluidos.filter(
                (s) =>
                    typeof s === "string" &&
                    s.trim() !== ""
            );

        // -----------------------------------------------------
        // PUNTOS DEL MAPA
        // -----------------------------------------------------

        const puntosMapaValidos =
            puntosMapa.filter(
                (p) =>
                    p.nombre.trim() &&
                    p.latitud.trim() &&
                    p.longitud.trim() &&
                    p.descripcion.trim()
            );

        // -----------------------------------------------------
        // ITINERARIO
        // -----------------------------------------------------

        const itinerarioValidos =
            itinerario.filter(
                (item) =>
                    item.dia &&
                    item.fecha.trim() &&
                    item.descripcion.trim()
            );

        // -----------------------------------------------------
        // CAMPOS OBLIGATORIOS
        // -----------------------------------------------------

        if (
            !nombre.trim() ||
            !lugar ||
            !fechaInicio ||
            !fechaFin ||
            !precio ||
            !tipoViaje.trim() ||
            !descripcion.trim() ||
            !foto ||
            !plazas ||
            galeria.some(
                (img) => img === null
            )
        ) {
            setLoading(false);

            return Swal.fire({
                icon: "error",
                title: "Campos incompletos",
                text: "Todos los campos son obligatorios y debes subir las 6 imágenes de la galería.",
                confirmButtonColor: "#d33",
            });
        }

        // -----------------------------------------------------
        // ESTADO
        // -----------------------------------------------------

        if (
            estado !== "disponible" &&
            estado !== "proximamente"
        ) {
            setLoading(false);

            return Swal.fire({
                icon: "error",
                title: "Estado inválido",
                text: "Debes seleccionar un estado válido.",
                confirmButtonColor: "#d33",
            });
        }

        // -----------------------------------------------------
        // PLAZAS
        // -----------------------------------------------------

        if (Number(plazas) <= 0) {
            setLoading(false);

            return Swal.fire({
                icon: "error",
                title: "Plazas inválidas",
                text: "El paquete debe tener al menos una plaza.",
                confirmButtonColor: "#d33",
            });
        }

        // -----------------------------------------------------
        // VIAJEROS FIJOS
        // -----------------------------------------------------

        if (tieneViajerosFijos) {
            const vf = Number(
                viajerosFijos
            );

            if (
                !viajerosFijos ||
                vf <= 0 ||
                !Number.isInteger(vf)
            ) {
                setLoading(false);

                return Swal.fire({
                    icon: "error",
                    title: "Viajeros fijos inválidos",
                    text: "El número de viajeros fijos debe ser un número entero mayor que 0.",
                    confirmButtonColor: "#d33",
                });
            }

            if (vf > Number(plazas)) {
                setLoading(false);

                return Swal.fire({
                    icon: "error",
                    title: "Viajeros fijos inválidos",
                    text: "El número de viajeros fijos no puede ser mayor que las plazas totales.",
                    confirmButtonColor: "#d33",
                });
            }
        }

        // -----------------------------------------------------
        // SERVICIOS
        // -----------------------------------------------------

        if (
            serviciosIncluidosValidos.length === 0
        ) {
            setLoading(false);

            return Swal.fire({
                icon: "error",
                title: "Servicios incluidos",
                text: "Debes añadir al menos un servicio incluido.",
                confirmButtonColor: "#d33",
            });
        }

        if (
            serviciosNoIncluidosValidos.length ===
            0
        ) {
            setLoading(false);

            return Swal.fire({
                icon: "error",
                title: "Servicios no incluidos",
                text: "Debes añadir al menos un servicio no incluido.",
                confirmButtonColor: "#d33",
            });
        }

        // -----------------------------------------------------
        // MAPA
        // -----------------------------------------------------

        if (puntosMapaValidos.length === 0) {
            setLoading(false);

            return Swal.fire({
                icon: "error",
                title: "Puntos del mapa",
                text: "Debes añadir al menos un punto válido en el mapa.",
                confirmButtonColor: "#d33",
            });
        }

        // -----------------------------------------------------
        // ITINERARIO
        // -----------------------------------------------------

        if (itinerarioValidos.length === 0) {
            setLoading(false);

            return Swal.fire({
                icon: "error",
                title: "Itinerario",
                text: "Debes añadir al menos un día válido en el itinerario.",
                confirmButtonColor: "#d33",
            });
        }

        // -----------------------------------------------------
        // FECHAS
        // -----------------------------------------------------

        const hoy = new Date();

        hoy.setHours(0, 0, 0, 0);

        const inicio = new Date(
            `${fechaInicio}T00:00:00`
        );

        const fin = new Date(
            `${fechaFin}T00:00:00`
        );

        if (
            inicio < hoy ||
            fin < hoy
        ) {
            setLoading(false);

            return Swal.fire({
                icon: "error",
                title: "Fechas inválidas",
                text: "La fecha de inicio y fin deben ser posteriores al día de hoy.",
                confirmButtonColor: "#d33",
            });
        }

        if (fin < inicio) {
            setLoading(false);

            return Swal.fire({
                icon: "error",
                title: "Fechas inválidas",
                text: "La fecha fin debe ser posterior a la fecha inicio.",
                confirmButtonColor: "#d33",
            });
        }

        // -----------------------------------------------------
        // FECHAS DE OFERTA
        // -----------------------------------------------------

        if (oferta) {
            if (
                !ofertaInicio ||
                !ofertaFin
            ) {
                setLoading(false);

                return Swal.fire({
                    icon: "error",
                    title: "Fechas de oferta",
                    text: "Debes indicar el inicio y el fin de la oferta.",
                    confirmButtonColor: "#d33",
                });
            }

            const inicioOferta =
                new Date(ofertaInicio);

            const finOferta =
                new Date(ofertaFin);

            if (
                isNaN(
                    inicioOferta.getTime()
                ) ||
                isNaN(
                    finOferta.getTime()
                )
            ) {
                setLoading(false);

                return Swal.fire({
                    icon: "error",
                    title: "Fechas de oferta inválidas",
                    text: "Las fechas de la oferta no son válidas.",
                    confirmButtonColor: "#d33",
                });
            }

            if (
                finOferta <= inicioOferta
            ) {
                setLoading(false);

                return Swal.fire({
                    icon: "error",
                    title: "Fechas de oferta inválidas",
                    text: "La fecha fin de la oferta debe ser posterior a la fecha de inicio.",
                    confirmButtonColor: "#d33",
                });
            }
        }

        // -----------------------------------------------------
        // FECHAS DEL ITINERARIO
        // -----------------------------------------------------

        for (
            let i = 0;
            i < itinerarioValidos.length;
            i++
        ) {
            const fechaItinerario =
                new Date(
                    `${itinerarioValidos[i].fecha}T00:00:00`
                );

            if (
                fechaItinerario < inicio ||
                fechaItinerario > fin
            ) {
                setLoading(false);

                return Swal.fire({
                    icon: "error",
                    title: "Fecha del itinerario inválida",
                    text: `El día ${itinerarioValidos[i].dia} del itinerario debe estar entre ${fechaInicio} y ${fechaFin}.`,
                    confirmButtonColor: "#d33",
                });
            }
        }

        // =====================================================
        // FORMDATA
        // =====================================================

        const formData = new FormData();

        formData.append(
            "nombre",
            nombre.trim()
        );

        formData.append(
            "lugar",
            lugar.trim()
        );

        formData.append(
            "fecha_inicio",
            fechaInicio
        );

        formData.append(
            "fecha_fin",
            fechaFin
        );

        formData.append(
            "precio",
            precio
        );

        formData.append(
            "tipo_viaje",
            tipoViaje.trim()
        );

        formData.append(
            "oferta",
            oferta
        );

        formData.append(
            "oferta_inicio",
            ofertaInicio
        );

        formData.append(
            "oferta_fin",
            ofertaFin
        );

        /*
         * IMPORTANTE:
         *
         * En React:
         * "disponible"     -> Disponible
         * "proximamente"   -> Próximamente
         *
         * Y esto es exactamente lo que recibirá Laravel
         * y se guardará en la BD.
         */
        formData.append(
            "estado",
            estado
        );

        formData.append(
            "descripcion",
            descripcion.trim()
        );

        formData.append(
            "plazas",
            plazas
        );

        formData.append(
            "foto",
            foto
        );

        // -----------------------------------------------------
        // VIAJEROS FIJOS
        // -----------------------------------------------------

        if (
            tieneViajerosFijos &&
            viajerosFijos
        ) {
            formData.append(
                "viajerosFijos",
                Number(viajerosFijos)
            );
        }

        // -----------------------------------------------------
        // GALERÍA
        // -----------------------------------------------------

        galeria.forEach((img) => {
            formData.append(
                "galeria[]",
                img
            );
        });

        // -----------------------------------------------------
        // SERVICIOS INCLUIDOS
        // -----------------------------------------------------

        serviciosIncluidosValidos.forEach(
            (s) => {
                formData.append(
                    "servicios_incluidos[]",
                    JSON.stringify({
                        descripcion:
                            s.descripcion,
                        precio: s.precio,
                    })
                );
            }
        );

        // -----------------------------------------------------
        // SERVICIOS NO INCLUIDOS
        // -----------------------------------------------------

        serviciosNoIncluidosValidos.forEach(
            (s) => {
                formData.append(
                    "servicios_no_incluidos[]",
                    s.trim()
                );
            }
        );

        // -----------------------------------------------------
        // PUNTOS DEL MAPA
        // -----------------------------------------------------

        puntosMapaValidos.forEach(
            (punto, index) => {
                formData.append(
                    `puntos_mapa[${index}][nombre]`,
                    punto.nombre.trim()
                );

                formData.append(
                    `puntos_mapa[${index}][latitud]`,
                    punto.latitud.trim()
                );

                formData.append(
                    `puntos_mapa[${index}][longitud]`,
                    punto.longitud.trim()
                );

                formData.append(
                    `puntos_mapa[${index}][descripcion]`,
                    punto.descripcion.trim()
                );
            }
        );

        // -----------------------------------------------------
        // ITINERARIO
        // -----------------------------------------------------

        itinerarioValidos.forEach(
            (item, index) => {
                formData.append(
                    `itinerario[${index}][dia]`,
                    item.dia
                );

                formData.append(
                    `itinerario[${index}][fecha]`,
                    item.fecha
                );

                formData.append(
                    `itinerario[${index}][descripcion]`,
                    item.descripcion.trim()
                );
            }
        );

        // =====================================================
        // ENVIAR AL BACKEND
        // =====================================================

        try {
            const response =
                await axios.post(
                    "/api/paquetes/agregar",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );

            if (
                response.status === 200 ||
                response.status === 201
            ) {
                setLoading(false);

                Swal.fire({
                    icon: "success",
                    title: "Paquete creado",
                    text: `El paquete "${nombre}" se ha creado correctamente.`,
                    confirmButtonColor:
                        "#28a745",
                });

                // -------------------------------------------------
                // RESETEAR FORMULARIO
                // -------------------------------------------------

                setNombre("");
                setLugar("");
                setFechaInicio("");
                setFechaFin("");
                setPrecio("");
                setTipoViaje("");
                setOferta("");
                setOfertaInicio("");
                setOfertaFin("");

                // Estado vuelve a Disponible
                setEstado("disponible");

                setDescripcion("");
                setFoto(null);
                setPreviewFotos([]);
                setPlazas("");

                setViajerosFijos("");
                setTieneViajerosFijos(
                    false
                );

                setServiciosIncluidos([
                    {
                        descripcion: "",
                        precio: "",
                    },
                ]);

                setServiciosNoIncluidos([
                    "",
                ]);

                setGaleria(
                    Array(6).fill(null)
                );

                setPreviewGaleria(
                    Array(6).fill(null)
                );

                setPuntosMapa([
                    {
                        nombre: "",
                        latitud: "",
                        longitud: "",
                        descripcion: "",
                    },
                ]);

                setItinerario([
                    {
                        dia: 1,
                        fecha: "",
                        descripcion: "",
                    },
                ]);
            }
        } catch (error) {
            setLoading(false);

            console.error(
                "Error al crear paquete:",
                error
            );

            if (
                error.response &&
                error.response.data &&
                error.response.data.errors
            ) {
                Swal.fire({
                    icon: "error",
                    title: "Error de validación",
                    html: Object.values(
                        error.response.data
                            .errors
                    )
                        .flat()
                        .join("<br>"),
                    confirmButtonColor:
                        "#d33",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Hubo un problema al crear el paquete. Inténtalo de nuevo.",
                    confirmButtonColor:
                        "#d33",
                });
            }
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">

                    {/* TÍTULO */}
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Crear Experiencia
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white p-5 rounded-5 shadow-lg col-12 col-md-12 col-lg-10 mx-auto"
                        style={{
                            maxWidth: "1000px",
                        }}
                    >
                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            encType="multipart/form-data"
                        >
                            {/* =================================================
                                EXPERIENCIA
                            ================================================= */}

                            <label className="form-label fw-bold text-center d-block fs-3">
                                Experiencia
                            </label>

                            {/* NOMBRE */}
                            <div className="mb-3">
                                <label
                                    htmlFor="nombre"
                                    className="form-label"
                                >
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    id="nombre"
                                    className="form-control"
                                    value={nombre}
                                    onChange={(e) =>
                                        setNombre(
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            {/* LUGAR */}
                            <div className="mb-3">
                                <label
                                    htmlFor="lugar"
                                    className="form-label"
                                >
                                    Lugar
                                </label>

                                <input
                                    type="text"
                                    id="lugar"
                                    className="form-control"
                                    value={lugar}
                                    onChange={(e) =>
                                        setLugar(
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            {/* FECHAS */}
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label
                                        htmlFor="fechaInicio"
                                        className="form-label"
                                    >
                                        Fecha Inicio
                                    </label>

                                    <input
                                        type="date"
                                        id="fechaInicio"
                                        className="form-control"
                                        value={
                                            fechaInicio
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setFechaInicio(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label
                                        htmlFor="fechaFin"
                                        className="form-label"
                                    >
                                        Fecha Fin
                                    </label>

                                    <input
                                        type="date"
                                        id="fechaFin"
                                        className="form-control"
                                        value={
                                            fechaFin
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setFechaFin(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            {/* PRECIO */}
                            <div className="mb-3">
                                <label
                                    htmlFor="precio"
                                    className="form-label"
                                >
                                    Precio (€)
                                </label>

                                <input
                                    type="number"
                                    id="precio"
                                    className="form-control"
                                    min="0"
                                    step="0.01"
                                    value={precio}
                                    onChange={(e) =>
                                        setPrecio(
                                            e.target
                                                .value
                                        )
                                    }
                                    required
                                />
                            </div>

                            {/* TIPO DE VIAJE */}
                            <div className="mb-3">
                                <label
                                    htmlFor="tipoViaje"
                                    className="form-label"
                                >
                                    Tipo de viaje
                                </label>

                                <input
                                    type="text"
                                    id="tipoViaje"
                                    className="form-control"
                                    value={
                                        tipoViaje
                                    }
                                    onChange={(e) =>
                                        setTipoViaje(
                                            e.target
                                                .value
                                        )
                                    }
                                    required
                                />
                            </div>

                            {/* =================================================
                                ESTADO
                            ================================================= */}

                            <div className="mb-3">
                                <label
                                    htmlFor="estado"
                                    className="form-label"
                                >
                                    Estado
                                </label>

                                <select
                                    id="estado"
                                    className="form-select"
                                    value={estado}
                                    onChange={(e) =>
                                        setEstado(
                                            e.target
                                                .value
                                        )
                                    }
                                    required
                                    style={{
                                        height: "42px",
                                        minHeight:
                                            "42px",
                                        lineHeight:
                                            "1.5",
                                        paddingTop:
                                            "0.375rem",
                                        paddingBottom:
                                            "0.375rem",
                                    }}
                                >
                                    {estados.map(
                                        ({
                                            key,
                                            label,
                                        }) => (
                                            <option
                                                key={
                                                    key
                                                }
                                                value={
                                                    key
                                                }
                                            >
                                                {label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* =================================================
                                OFERTA / CAMPAÑA
                            ================================================= */}

                            <div className="mb-3">
                                <label
                                    htmlFor="oferta"
                                    className="form-label"
                                >
                                    Oferta / Campaña
                                </label>

                                <select
                                    id="oferta"
                                    className="form-select"
                                    value={oferta}
                                    onChange={(e) =>
                                        setOferta(
                                            e.target
                                                .value
                                        )
                                    }
                                    style={{
                                        height: "42px",
                                        minHeight:
                                            "42px",
                                        lineHeight:
                                            "1.5",
                                        paddingTop:
                                            "0.375rem",
                                        paddingBottom:
                                            "0.375rem",
                                        overflow:
                                            "visible",
                                    }}
                                >
                                    {ofertas.map(
                                        ({
                                            key,
                                            label,
                                        }) => (
                                            <option
                                                key={
                                                    key
                                                }
                                                value={
                                                    key
                                                }
                                            >
                                                {label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* FECHAS DE OFERTA */}
                            {oferta && (
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label
                                            htmlFor="ofertaInicio"
                                            className="form-label"
                                        >
                                            Inicio de la oferta
                                        </label>

                                        <input
                                            type="datetime-local"
                                            id="ofertaInicio"
                                            className="form-control"
                                            value={
                                                ofertaInicio
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setOfertaInicio(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label
                                            htmlFor="ofertaFin"
                                            className="form-label"
                                        >
                                            Fin de la oferta
                                        </label>

                                        <input
                                            type="datetime-local"
                                            id="ofertaFin"
                                            className="form-control"
                                            value={
                                                ofertaFin
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setOfertaFin(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* DESCRIPCIÓN */}
                            <div className="mb-3">
                                <label
                                    htmlFor="descripcion"
                                    className="form-label"
                                >
                                    Descripción
                                </label>

                                <textarea
                                    id="descripcion"
                                    className="form-control"
                                    rows="4"
                                    value={
                                        descripcion
                                    }
                                    onChange={(e) =>
                                        setDescripcion(
                                            e.target
                                                .value
                                        )
                                    }
                                    required
                                />
                            </div>

                            {/* FOTO PORTADA */}
                            <div className="mb-3">
                                <label
                                    className="form-label"
                                    htmlFor="foto"
                                >
                                    Foto de Portada
                                </label>

                                <input
                                    type="file"
                                    id="foto"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={
                                        handleFotosChange
                                    }
                                    required
                                />
                            </div>

                            {previewFotos.length >
                                0 && (
                                <div className="mb-3 d-flex flex-wrap gap-2">
                                    {previewFotos.map(
                                        (
                                            src,
                                            index
                                        ) => (
                                            <img
                                                key={
                                                    index
                                                }
                                                src={
                                                    src
                                                }
                                                alt={`Previsualización ${
                                                    index +
                                                    1
                                                }`}
                                                style={{
                                                    maxWidth:
                                                        "150px",
                                                    maxHeight:
                                                        "150px",
                                                    borderRadius:
                                                        "8px",
                                                }}
                                            />
                                        )
                                    )}
                                </div>
                            )}

                            {/* PLAZAS */}
                            <div className="mb-3">
                                <label
                                    htmlFor="plazas"
                                    className="form-label"
                                >
                                    Plazas
                                </label>

                                <input
                                    type="number"
                                    id="plazas"
                                    className="form-control"
                                    min="1"
                                    value={plazas}
                                    onChange={(e) =>
                                        setPlazas(
                                            e.target
                                                .value
                                        )
                                    }
                                    required
                                />
                            </div>

                            {/* =================================================
                                VIAJEROS FIJOS
                            ================================================= */}

                            <div className="mb-4 p-3 border rounded-3 bg-light">
                                <div className="form-check form-switch mb-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="switchViajerosFijos"
                                        checked={
                                            tieneViajerosFijos
                                        }
                                        onChange={(
                                            e
                                        ) => {
                                            setTieneViajerosFijos(
                                                e
                                                    .target
                                                    .checked
                                            );

                                            if (
                                                !e
                                                    .target
                                                    .checked
                                            ) {
                                                setViajerosFijos(
                                                    ""
                                                );
                                            }
                                        }}
                                    />

                                    <label
                                        className="form-check-label fw-bold"
                                        htmlFor="switchViajerosFijos"
                                    >
                                        Número fijo de
                                        viajeros por
                                        reserva
                                    </label>
                                </div>

                                <small className="text-muted d-block mb-2">
                                    Activa esta opción si
                                    cada reserva debe
                                    incluir exactamente
                                    un número determinado
                                    de viajeros (p. ej.
                                    parejas → 2).
                                </small>

                                {tieneViajerosFijos && (
                                    <div className="mt-2">
                                        <label
                                            htmlFor="viajerosFijos"
                                            className="form-label"
                                        >
                                            Número de
                                            viajeros por
                                            reserva
                                        </label>

                                        <input
                                            type="number"
                                            id="viajerosFijos"
                                            className="form-control"
                                            min="1"
                                            step="1"
                                            placeholder="Ej: 2"
                                            value={
                                                viajerosFijos
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setViajerosFijos(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            </div>

                            {/* =================================================
                                SERVICIOS INCLUIDOS
                            ================================================= */}

                            <div className="mb-4">
                                <label className="form-label fw-bold text-center d-block fs-3">
                                    Servicios
                                </label>

                                <label className="form-label fw-bold">
                                    Servicios incluidos
                                </label>

                                {serviciosIncluidos.map(
                                    (
                                        servicio,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
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
                                                        e
                                                    ) =>
                                                        cambiarServicioIncluido(
                                                            index,
                                                            "descripcion",
                                                            e
                                                                .target
                                                                .value
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
                                                        e
                                                    ) =>
                                                        cambiarServicioIncluido(
                                                            index,
                                                            "precio",
                                                            e
                                                                .target
                                                                .value
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
                                                            index
                                                        )
                                                    }
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}

                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={
                                        agregarServicioIncluido
                                    }
                                >
                                    + Añadir servicio
                                    incluido
                                </button>
                            </div>

                            {/* =================================================
                                SERVICIOS NO INCLUIDOS
                            ================================================= */}

                            <div className="mb-4">
                                <label className="form-label fw-bold">
                                    Servicios no incluidos
                                </label>

                                {serviciosNoIncluidos.map(
                                    (
                                        servicio,
                                        index
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
                                                placeholder={`Servicio no incluido #${
                                                    index +
                                                    1
                                                }`}
                                                value={
                                                    servicio
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    cambiarServicioNoIncluido(
                                                        index,
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() =>
                                                    eliminarServicioNoIncluido(
                                                        index
                                                    )
                                                }
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    )
                                )}

                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={
                                        agregarServicioNoIncluido
                                    }
                                >
                                    + Añadir servicio no
                                    incluido
                                </button>
                            </div>

                            {/* =================================================
                                GALERÍA
                            ================================================= */}

                            <div className="mb-4">
                                <label className="form-label fw-bold text-center d-block fs-3">
                                    Galería (6 imágenes)
                                </label>

                                {galeria.map(
                                    (
                                        img,
                                        index
                                    ) => {
                                        let sizeText =
                                            "";

                                        if (
                                            [0].includes(
                                                index
                                            )
                                        ) {
                                            sizeText =
                                                "(300px ancho X 500px alto)";
                                        }

                                        if (
                                            [
                                                1,
                                                2,
                                                4,
                                                5,
                                            ].includes(
                                                index
                                            )
                                        ) {
                                            sizeText =
                                                "(300px ancho X 120px alto)";
                                        }

                                        if (
                                            index ===
                                            3
                                        ) {
                                            sizeText =
                                                "(600px ancho X 180px alto)";
                                        }

                                        return (
                                            <div
                                                key={
                                                    index
                                                }
                                                className="mb-3"
                                            >
                                                <label className="form-label">
                                                    Imagen{" "}
                                                    {index +
                                                        1}{" "}
                                                    <span className="text-muted">
                                                        {
                                                            sizeText
                                                        }
                                                    </span>
                                                </label>

                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        handleGaleriaChange(
                                                            index,
                                                            e
                                                                .target
                                                                .files[0]
                                                        )
                                                    }
                                                    required
                                                />

                                                {previewGaleria[
                                                    index
                                                ] && (
                                                    <img
                                                        src={
                                                            previewGaleria[
                                                                index
                                                            ]
                                                        }
                                                        alt={`Vista previa ${
                                                            index +
                                                            1
                                                        }`}
                                                        style={{
                                                            maxWidth:
                                                                "150px",
                                                            maxHeight:
                                                                "150px",
                                                            marginTop:
                                                                "10px",
                                                            borderRadius:
                                                                "8px",
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    }
                                )}
                            </div>

                            {/* =================================================
                                PUNTOS DEL MAPA
                            ================================================= */}

                            <div className="mb-4">
                                <label className="form-label fw-bold text-center d-block fs-3">
                                    Puntos del Mapa
                                </label>

                                {puntosMapa.map(
                                    (
                                        punto,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
                                            className="mb-3 border rounded p-3"
                                        >
                                            <label className="form-label fw-bold">
                                                Punto #
                                                {index +
                                                    1}
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                placeholder="Nombre del lugar"
                                                value={
                                                    punto.nombre
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    cambiarPuntoMapa(
                                                        index,
                                                        "nombre",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />

                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                placeholder="Latitud"
                                                value={
                                                    punto.latitud
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    cambiarPuntoMapa(
                                                        index,
                                                        "latitud",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />

                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                placeholder="Longitud"
                                                value={
                                                    punto.longitud
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    cambiarPuntoMapa(
                                                        index,
                                                        "longitud",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />

                                            <textarea
                                                className="form-control mb-2"
                                                placeholder="Ubicación (Nombre, ej: Madrid)"
                                                value={
                                                    punto.descripcion
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    cambiarPuntoMapa(
                                                        index,
                                                        "descripcion",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                rows={
                                                    2
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() =>
                                                    eliminarPuntoMapa(
                                                        index
                                                    )
                                                }
                                            >
                                                &times;
                                                {" "}
                                                Eliminar
                                                punto
                                            </button>
                                        </div>
                                    )
                                )}

                                <button
                                    type="button"
                                    className="btn btn-outline-success"
                                    onClick={
                                        agregarPuntoMapa
                                    }
                                >
                                    + Añadir punto del
                                    mapa
                                </button>
                            </div>

                            {/* =================================================
                                ITINERARIO
                            ================================================= */}

                            <div className="mb-4">
                                <label className="form-label fw-bold text-center d-block fs-3">
                                    Itinerario
                                </label>

                                {itinerario.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
                                            className="mb-3 border rounded p-3"
                                        >
                                            <label className="form-label fw-bold">
                                                Día
                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                className="form-control mb-2"
                                                placeholder="Día"
                                                value={
                                                    item.dia
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    cambiarItinerario(
                                                        index,
                                                        "dia",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />

                                            <input
                                                type="date"
                                                className="form-control mb-2"
                                                value={
                                                    item.fecha
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    cambiarItinerario(
                                                        index,
                                                        "fecha",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />

                                            <textarea
                                                className="form-control mb-2"
                                                placeholder="Descripción"
                                                value={
                                                    item.descripcion
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    cambiarItinerario(
                                                        index,
                                                        "descripcion",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                rows={
                                                    3
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() =>
                                                    eliminarItinerario(
                                                        index
                                                    )
                                                }
                                            >
                                                &times;
                                                {" "}
                                                Eliminar
                                                día
                                            </button>
                                        </div>
                                    )
                                )}

                                <button
                                    type="button"
                                    className="btn btn-outline-success"
                                    onClick={
                                        agregarItinerario
                                    }
                                >
                                    + Añadir día al
                                    itinerario
                                </button>
                            </div>

                            {/* =================================================
                                BOTÓN CREAR
                            ================================================= */}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-success w-100 text-white d-flex justify-content-center align-items-center"
                                style={{
                                    fontWeight: "600",
                                    fontSize: "18px",
                                    height: "45px",
                                }}
                            >
                                {loading ? (
                                    <div
                                        className="spinner-border spinner-border-sm text-light"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Cargando...
                                        </span>
                                    </div>
                                ) : (
                                    "Crear paquete"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearPaquete;