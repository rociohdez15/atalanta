import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Principal = () => {
    const navigate = useNavigate();

    const handleRowClick = (id) => {
        navigate(`/paquete/${id}`);
    };

    /*
    |--------------------------------------------------------------------------
    | ESTADOS
    |--------------------------------------------------------------------------
    */

    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    const [loading, setLoading] = useState(true);
    const [paquetes, setPaquetes] = useState([]);
    const [paquetesFiltrados, setPaquetesFiltrados] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    /*
    |--------------------------------------------------------------------------
    | CARGAR TODOS LOS PAQUETES
    |--------------------------------------------------------------------------
    */

    const cargarPaquetes = async () => {
        setLoading(true);

        try {
            const res = await axios.get("/api/paquetes/admin", {
                params: {
                    page: 0,
                    size: 1000,
                },
            });

            let data = [];

            if (Array.isArray(res.data)) {
                data = res.data;
            } else if (Array.isArray(res.data.content)) {
                data = res.data.content;
            } else if (Array.isArray(res.data.data)) {
                data = res.data.data;
            }

            setPaquetes(data);
            setPaquetesFiltrados(data);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error cargando paquetes:", error);
            console.error("Respuesta:", error.response?.data);

            setPaquetes([]);
            setPaquetesFiltrados([]);

            Swal.fire(
                "Error",
                "No se pudieron cargar los paquetes.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | CARGAR AL INICIAR
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        cargarPaquetes();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | BÚSQUEDA
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            const termino = searchTerm.trim();

            if (termino === "") {
                setPaquetesFiltrados(paquetes);
                setCurrentPage(1);
                return;
            }

            try {
                const res = await axios.get("/api/paquetes/buscar", {
                    params: {
                        input: termino,
                    },
                });

                let data = [];

                if (Array.isArray(res.data)) {
                    data = res.data;
                } else if (Array.isArray(res.data.content)) {
                    data = res.data.content;
                } else if (Array.isArray(res.data.data)) {
                    data = res.data.data;
                } else if (res.data) {
                    data = [res.data];
                }

                setPaquetesFiltrados(data);
                setCurrentPage(1);
            } catch (error) {
                console.error("Error buscando paquetes:", error);
                console.error("Respuesta:", error.response?.data);

                setPaquetesFiltrados([]);
                setCurrentPage(1);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, paquetes]);

    /*
    |--------------------------------------------------------------------------
    | PAGINACIÓN LOCAL
    |--------------------------------------------------------------------------
    */

    const indexOfLastPackage = currentPage * entriesPerPage;
    const indexOfFirstPackage = indexOfLastPackage - entriesPerPage;

    const currentPackages = paquetesFiltrados.slice(
        indexOfFirstPackage,
        indexOfLastPackage
    );

    /*
    |--------------------------------------------------------------------------
    | TOTAL DE PÁGINAS
    |--------------------------------------------------------------------------
    */

    const totalPages = Math.max(
        1,
        Math.ceil(paquetesFiltrados.length / entriesPerPage)
    );

    /*
    |--------------------------------------------------------------------------
    | NÚMEROS DE PÁGINA
    |--------------------------------------------------------------------------
    */

    const pageNumbers = [];

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    /*
    |--------------------------------------------------------------------------
    | CAMBIAR DE PÁGINA
    |--------------------------------------------------------------------------
    */

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) {
            return;
        }

        setCurrentPage(pageNumber);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    /*
    |--------------------------------------------------------------------------
    | ELIMINAR
    |--------------------------------------------------------------------------
    */

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar paquete?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (!result.isConfirmed) {
                return;
            }

            try {
                await axios.delete(`/api/paquetes/eliminar/${id}`);

                setPaquetes((prev) =>
                    prev.filter((paquete) => paquete.id !== id)
                );

                setPaquetesFiltrados((prev) =>
                    prev.filter((paquete) => paquete.id !== id)
                );

                setCurrentPage((prevPage) => {
                    const nuevosTotalPages = Math.max(
                        1,
                        Math.ceil(
                            (paquetesFiltrados.length - 1) /
                                entriesPerPage
                        )
                    );

                    return Math.min(prevPage, nuevosTotalPages);
                });

                Swal.fire(
                    "Eliminado",
                    "El paquete ha sido eliminado correctamente.",
                    "success"
                );
            } catch (error) {
                console.error("Error eliminando paquete:", error);
                console.error("Respuesta:", error.response?.data);

                Swal.fire(
                    "Error",
                    "No se pudo eliminar el paquete.",
                    "error"
                );
            }
        });
    };

    /*
    |--------------------------------------------------------------------------
    | EDITAR
    |--------------------------------------------------------------------------
    */

    const handleEdit = async (id) => {
        const paquete = paquetes.find((p) => p.id === id);

        if (!paquete) {
            return;
        }

        let selectedImage = null;

        const baseImageUrl = `/storage/paquetes/portada/${paquete.id}/${paquete.foto}`;

        await Swal.fire({
            title: "Editar Paquete",

            html: `
                <input
                    id="swal-nombre"
                    class="swal2-input"
                    placeholder="Nombre"
                    value="${paquete.nombre || ""}"
                >

                <input
                    id="swal-fecha-inicio"
                    type="date"
                    class="swal2-input"
                    value="${
                        paquete.fecha_inicio
                            ? String(paquete.fecha_inicio).slice(0, 10)
                            : ""
                    }"
                >

                <input
                    id="swal-fecha-fin"
                    type="date"
                    class="swal2-input"
                    value="${
                        paquete.fecha_fin
                            ? String(paquete.fecha_fin).slice(0, 10)
                            : ""
                    }"
                >

                <input
                    id="swal-precio"
                    type="number"
                    step="0.01"
                    class="swal2-input"
                    placeholder="Precio"
                    value="${paquete.precio || ""}"
                >

                <input
                    id="swal-tipo"
                    class="swal2-input"
                    placeholder="Tipo de viaje"
                    value="${paquete.tipo_viaje || ""}"
                >

                <!-- ESTADO -->

                <select
                    id="swal-estado"
                    class="swal2-select"
                    style="
                        width: 80%;
                        margin: 1em auto;
                    "
                >
                    <option
                        value="proximamente"
                        ${
                            paquete.estado === "proximamente"
                                ? "selected"
                                : ""
                        }
                    >
                        Próximamente
                    </option>

                    <option
                        value="disponible"
                        ${
                            !paquete.estado ||
                            paquete.estado === "disponible"
                                ? "selected"
                                : ""
                        }
                    >
                        Disponible
                    </option>
                </select>

                <!-- OFERTA -->

                <select
                    id="swal-oferta"
                    class="swal2-select"
                    style="
                        width: 80%;
                        margin: 1em auto;
                    "
                >
                    <option
                        value=""
                        ${!paquete.oferta ? "selected" : ""}
                    >
                        Sin oferta
                    </option>

                    <option
                        value="navidad"
                        ${
                            paquete.oferta === "navidad"
                                ? "selected"
                                : ""
                        }
                    >
                        Navidad
                    </option>

                    <option
                        value="verano"
                        ${
                            paquete.oferta === "verano"
                                ? "selected"
                                : ""
                        }
                    >
                        Verano
                    </option>

                    <option
                        value="san_valentin"
                        ${
                            paquete.oferta === "san_valentin"
                                ? "selected"
                                : ""
                        }
                    >
                        San Valentín
                    </option>

                    <option
                        value="black_friday"
                        ${
                            paquete.oferta === "black_friday"
                                ? "selected"
                                : ""
                        }
                    >
                        Black Friday
                    </option>

                    <option
                        value="cyber_monday"
                        ${
                            paquete.oferta === "cyber_monday"
                                ? "selected"
                                : ""
                        }
                    >
                        Cyber Monday
                    </option>

                    <option
                        value="bajada_precio"
                        ${
                            paquete.oferta === "bajada_precio"
                                ? "selected"
                                : ""
                        }
                    >
                        Bajada de precio
                    </option>
                </select>

                <div
                    style="
                        width: 80%;
                        margin: 15px auto;
                        text-align: left;
                    "
                >
                    <label
                        for="swal-oferta-inicio"
                        style="
                            display: block;
                            margin-bottom: 5px;
                            font-weight: 600;
                        "
                    >
                        Inicio de la oferta
                    </label>

                    <input
                        id="swal-oferta-inicio"
                        type="datetime-local"
                        class="swal2-input"
                        style="
                            width: 100%;
                            margin: 0;
                        "
                        value="${
                            paquete.oferta_inicio
                                ? String(
                                      paquete.oferta_inicio
                                  ).slice(0, 16)
                                : ""
                        }"
                    >
                </div>

                <div
                    style="
                        width: 80%;
                        margin: 15px auto;
                        text-align: left;
                    "
                >
                    <label
                        for="swal-oferta-fin"
                        style="
                            display: block;
                            margin-bottom: 5px;
                            font-weight: 600;
                        "
                    >
                        Fin de la oferta
                    </label>

                    <input
                        id="swal-oferta-fin"
                        type="datetime-local"
                        class="swal2-input"
                        style="
                            width: 100%;
                            margin: 0;
                        "
                        value="${
                            paquete.oferta_fin
                                ? String(
                                      paquete.oferta_fin
                                  ).slice(0, 16)
                                : ""
                        }"
                    >
                </div>

                <textarea
                    id="swal-desc"
                    class="swal2-textarea"
                    placeholder="Descripción"
                >${paquete.descripcion || ""}</textarea>

                <!-- FOTO -->

                <input
                    id="swal-foto"
                    type="file"
                    class="swal2-file"
                    accept="image/jpeg,image/png,image/webp"
                >

                <small
                    style="
                        display: block;
                        width: 80%;
                        margin: 5px auto 0;
                        color: #777;
                        text-align: left;
                    "
                >
                    JPG, JPEG, PNG o WEBP. Máximo 5 MB.
                </small>

                <img
                    id="preview-image"
                    src="${baseImageUrl}"
                    alt="Vista previa"
                    style="
                        max-width: 100%;
                        max-height: 250px;
                        object-fit: contain;
                        margin-top: 10px;
                    "
                />

                <input
                    id="swal-plazas"
                    type="number"
                    class="swal2-input"
                    placeholder="Plazas"
                    value="${paquete.plazas ?? ""}"
                >
            `,

            /*
            |--------------------------------------------------------------------------
            | SELECCIONAR IMAGEN
            |--------------------------------------------------------------------------
            */

            didOpen: () => {
                const fileInput = document.getElementById("swal-foto");
                const preview = document.getElementById("preview-image");

                if (!fileInput || !preview) {
                    return;
                }

                fileInput.addEventListener("change", (e) => {
                    const file = e.target.files[0];

                    if (!file) {
                        selectedImage = null;
                        return;
                    }

                    /*
                    |------------------------------------------------------------------
                    | VALIDAR TIPO
                    |------------------------------------------------------------------
                    */

                    const tiposPermitidos = [
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                    ];

                    if (!tiposPermitidos.includes(file.type)) {
                        selectedImage = null;
                        fileInput.value = "";

                        Swal.fire({
                            title: "Imagen no válida",
                            text: "Solo se permiten imágenes JPG, JPEG, PNG o WEBP.",
                            icon: "error",
                        });

                        return;
                    }

                    /*
                    |------------------------------------------------------------------
                    | VALIDAR TAMAÑO
                    |------------------------------------------------------------------
                    */

                    const maxSize = 5 * 1024 * 1024;

                    if (file.size > maxSize) {
                        selectedImage = null;
                        fileInput.value = "";

                        Swal.fire({
                            title: "Imagen demasiado grande",
                            text: "La imagen no puede superar los 5 MB.",
                            icon: "error",
                        });

                        return;
                    }

                    /*
                    |------------------------------------------------------------------
                    | GUARDAR IMAGEN
                    |------------------------------------------------------------------
                    */

                    selectedImage = file;

                    /*
                    |------------------------------------------------------------------
                    | PREVISUALIZACIÓN
                    |------------------------------------------------------------------
                    */

                    const reader = new FileReader();

                    reader.onload = (event) => {
                        preview.src = event.target.result;
                    };

                    reader.readAsDataURL(file);
                });
            },

            focusConfirm: false,

            confirmButtonText: "Guardar cambios",

            /*
            |--------------------------------------------------------------------------
            | PRECONFIRM
            |--------------------------------------------------------------------------
            */

            preConfirm: () => {
                const estado = document.getElementById(
                    "swal-estado"
                ).value;

                const oferta = document.getElementById(
                    "swal-oferta"
                ).value;

                const ofertaInicio = document.getElementById(
                    "swal-oferta-inicio"
                ).value;

                const ofertaFin = document.getElementById(
                    "swal-oferta-fin"
                ).value;

                /*
                |------------------------------------------------------------------
                | VALIDAR BLACK FRIDAY
                |------------------------------------------------------------------
                */

                if (oferta === "black_friday") {
                    if (!ofertaInicio || !ofertaFin) {
                        Swal.showValidationMessage(
                            "Debes indicar el inicio y el fin de la oferta Black Friday."
                        );

                        return false;
                    }

                    const inicio = new Date(ofertaInicio);
                    const fin = new Date(ofertaFin);

                    if (fin <= inicio) {
                        Swal.showValidationMessage(
                            "La fecha de fin debe ser posterior a la fecha de inicio."
                        );

                        return false;
                    }
                }

                /*
                |------------------------------------------------------------------
                | DEVOLVER DATOS
                |------------------------------------------------------------------
                */

                return {
                    nombre: document.getElementById("swal-nombre").value,

                    fecha_inicio: document.getElementById(
                        "swal-fecha-inicio"
                    ).value,

                    fecha_fin: document.getElementById(
                        "swal-fecha-fin"
                    ).value,

                    precio: parseFloat(
                        document.getElementById("swal-precio").value
                    ),

                    tipo_viaje: document.getElementById(
                        "swal-tipo"
                    ).value,

                    estado,

                    oferta,

                    oferta_inicio: ofertaInicio || null,

                    oferta_fin: ofertaFin || null,

                    descripcion: document.getElementById(
                        "swal-desc"
                    ).value,

                    fotoFile: selectedImage,

                    plazas: parseInt(
                        document.getElementById("swal-plazas").value
                    ),
                };
            },
        }).then(async (result) => {
            if (!result.isConfirmed || !result.value) {
                return;
            }

            const formValues = result.value;

            /*
            |--------------------------------------------------------------------------
            | CREAR FORMDATA
            |--------------------------------------------------------------------------
            */

            const formData = new FormData();

            formData.append("_method", "PUT");

            formData.append(
                "nombre",
                formValues.nombre
            );

            formData.append(
                "fecha_inicio",
                formValues.fecha_inicio
            );

            formData.append(
                "fecha_fin",
                formValues.fecha_fin
            );

            formData.append(
                "precio",
                formValues.precio
            );

            formData.append(
                "tipo_viaje",
                formValues.tipo_viaje
            );

            formData.append(
                "estado",
                formValues.estado
            );

            formData.append(
                "oferta",
                formValues.oferta
            );

            if (formValues.oferta_inicio) {
                formData.append(
                    "oferta_inicio",
                    formValues.oferta_inicio
                );
            }

            if (formValues.oferta_fin) {
                formData.append(
                    "oferta_fin",
                    formValues.oferta_fin
                );
            }

            formData.append(
                "descripcion",
                formValues.descripcion
            );

            formData.append(
                "plazas",
                formValues.plazas
            );

            /*
            |--------------------------------------------------------------------------
            | AÑADIR FOTO SOLAMENTE SI SE HA CAMBIADO
            |--------------------------------------------------------------------------
            */

            if (formValues.fotoFile instanceof File) {
                formData.append(
                    "foto",
                    formValues.fotoFile
                );
            }

            /*
            |--------------------------------------------------------------------------
            | DEBUG DE LA FOTO
            |--------------------------------------------------------------------------
            */

            if (formValues.fotoFile instanceof File) {
                console.log("Imagen enviada:");
                console.log("Nombre:", formValues.fotoFile.name);
                console.log("Tipo:", formValues.fotoFile.type);
                console.log(
                    "Tamaño:",
                    (
                        formValues.fotoFile.size /
                        1024 /
                        1024
                    ).toFixed(2) + " MB"
                );
            } else {
                console.log("No se ha cambiado la imagen.");
            }

            /*
            |--------------------------------------------------------------------------
            | ACTUALIZAR
            |--------------------------------------------------------------------------
            */

            try {
                const res = await axios.post(
                    `/api/paquetes/editar/${id}`,
                    formData
                );

                Swal.fire(
                    "Éxito",
                    "El paquete se actualizó correctamente",
                    "success"
                );

                const updatedData =
                    res.data.paquete || res.data;

                /*
                |------------------------------------------------------------------
                | ACTUALIZAR TODOS LOS PAQUETES
                |------------------------------------------------------------------
                */

                setPaquetes((prev) =>
                    prev.map((p) =>
                        p.id === id
                            ? {
                                  ...p,
                                  ...updatedData,
                              }
                            : p
                    )
                );

                /*
                |------------------------------------------------------------------
                | ACTUALIZAR LISTA VISIBLE
                |------------------------------------------------------------------
                */

                setPaquetesFiltrados((prev) =>
                    prev.map((p) =>
                        p.id === id
                            ? {
                                  ...p,
                                  ...updatedData,
                              }
                            : p
                    )
                );
            } catch (error) {
                console.error(
                    "Error actualizando paquete:",
                    error
                );

                console.error(
                    "Status:",
                    error.response?.status
                );

                console.error(
                    "Respuesta Laravel:",
                    error.response?.data
                );

                console.error(
                    "Errores de validación:",
                    error.response?.data?.errors
                );

                /*
                |------------------------------------------------------------------
                | MOSTRAR ERROR DE VALIDACIÓN
                |------------------------------------------------------------------
                */

                const errores =
                    error.response?.data?.errors;

                let mensaje =
                    error.response?.data?.message ||
                    "No se pudo actualizar el paquete.";

                if (errores) {
                    const mensajesErrores =
                        Object.values(errores)
                            .flat()
                            .join("<br>");

                    mensaje = mensajesErrores;
                }

                Swal.fire({
                    title: "Error",
                    html: mensaje,
                    icon: "error",
                });
            }
        });
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">

                    {/* TÍTULO */}

                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Listado de Paquetes
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* TABLA */}

                    <div className="container-fluid p-3">

                        {/* BUSCADOR */}

                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">

                            <div className="d-flex align-items-center mb-2 mb-md-0">
                            </div>

                            <div className="d-flex align-items-center">

                                <label
                                    htmlFor="searchInput"
                                    className="me-2 mb-0"
                                >
                                    Buscar:
                                </label>

                                <input
                                    id="searchInput"
                                    type="search"
                                    className="form-control form-control-sm"
                                    style={{
                                        width: 150,
                                    }}
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>
                        </div>

                        {/* TABLA */}

                        <div className="table-responsive p-3">

                            {loading ? (
                                <div className="text-center mt-5">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <table className="table table-sm table-bordered align-middle mb-0">

                                    <thead>
                                        <tr className="text-secondary text-nowrap">

                                            <th className="text-start">
                                                ID
                                            </th>

                                            <th className="text-start">
                                                Nombre
                                            </th>

                                            <th className="text-start">
                                                Fecha Inicio
                                            </th>

                                            <th className="text-start">
                                                Fecha Fin
                                            </th>

                                            <th className="text-start">
                                                Precio
                                            </th>

                                            <th className="text-start">
                                                Tipo de Viaje
                                            </th>

                                            <th className="text-start">
                                                Estado
                                            </th>

                                            <th className="text-start">
                                                Oferta
                                            </th>

                                            <th className="text-start">
                                                Inicio Oferta
                                            </th>

                                            <th className="text-start">
                                                Fin Oferta
                                            </th>

                                            <th className="text-start">
                                                Descripción
                                            </th>

                                            <th className="text-start">
                                                Foto
                                            </th>

                                            <th className="text-start">
                                                Plazas
                                            </th>

                                            <th className="text-start">
                                                Operaciones
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {currentPackages.length > 0 ? (
                                            currentPackages.map(
                                                (paquete) => (
                                                    <tr
                                                        key={paquete.id}
                                                        onClick={() =>
                                                            handleRowClick(
                                                                paquete.id
                                                            )
                                                        }
                                                        style={{
                                                            cursor: "pointer",
                                                            position: "relative",
                                                            backgroundColor:
                                                                paquete.is_read
                                                                    ? "transparent"
                                                                    : "#f2f2f2",
                                                        }}
                                                    >

                                                        <td
                                                            style={{
                                                                paddingLeft:
                                                                    "25px",
                                                                position:
                                                                    "relative",
                                                            }}
                                                        >
                                                            {paquete.id}
                                                        </td>

                                                        <td>
                                                            {paquete.nombre}
                                                        </td>

                                                        <td>
                                                            {paquete.fecha_inicio
                                                                ? new Date(
                                                                      paquete.fecha_inicio
                                                                  ).toLocaleDateString(
                                                                      "es-ES"
                                                                  )
                                                                : "Sin datos"}
                                                        </td>

                                                        <td>
                                                            {paquete.fecha_fin
                                                                ? new Date(
                                                                      paquete.fecha_fin
                                                                  ).toLocaleDateString(
                                                                      "es-ES"
                                                                  )
                                                                : "Sin datos"}
                                                        </td>

                                                        <td>
                                                            {paquete.precio} €
                                                        </td>

                                                        <td>
                                                            {paquete.tipo_viaje}
                                                        </td>

                                                        {/* ESTADO */}

                                                        <td>
                                                            {paquete.estado ===
                                                            "proximamente"
                                                                ? "Próximamente"
                                                                : "Disponible"}
                                                        </td>

                                                        <td>
                                                            {paquete.oferta ||
                                                                "Sin oferta"}
                                                        </td>

                                                        <td>
                                                            {paquete.oferta_inicio
                                                                ? new Date(
                                                                      paquete.oferta_inicio
                                                                  ).toLocaleString(
                                                                      "es-ES"
                                                                  )
                                                                : "—"}
                                                        </td>

                                                        <td>
                                                            {paquete.oferta_fin
                                                                ? new Date(
                                                                      paquete.oferta_fin
                                                                  ).toLocaleString(
                                                                      "es-ES"
                                                                  )
                                                                : "—"}
                                                        </td>

                                                        <td>
                                                            {paquete.descripcion}
                                                        </td>

                                                        <td>
                                                            <img
                                                                src={`/storage/paquetes/portada/${paquete.id}/${paquete.foto}`}
                                                                alt={
                                                                    paquete.foto ||
                                                                    "Foto del paquete"
                                                                }
                                                                style={{
                                                                    width: 80,
                                                                    height: 50,
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                        </td>

                                                        <td>
                                                            {paquete.plazas}
                                                        </td>

                                                        <td>

                                                            <button
                                                                className="btn btn-warning btn-sm me-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();

                                                                    handleEdit(
                                                                        paquete.id
                                                                    );
                                                                }}
                                                            >
                                                                <i className="fas fa-pencil-alt"></i>
                                                            </button>

                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();

                                                                    handleDelete(
                                                                        paquete.id
                                                                    );
                                                                }}
                                                            >
                                                                <i className="fas fa-trash-alt"></i>
                                                            </button>

                                                        </td>

                                                    </tr>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="14"
                                                    className="text-center text-muted"
                                                >
                                                    No se encontraron
                                                    resultados.
                                                </td>
                                            </tr>
                                        )}

                                    </tbody>

                                </table>
                            )}

                        </div>

                        {/* PAGINACIÓN */}

                        {!loading &&
                            paquetesFiltrados.length > 0 && (
                                <div
                                    className="d-flex justify-content-center align-items-center mt-3 text-secondary"
                                    style={{
                                        fontSize: "0.75rem",
                                    }}
                                >

                                    <nav>
                                        <ul className="pagination mb-0">

                                            {/* ANTERIOR */}

                                            <li
                                                className={`page-item ${
                                                    currentPage === 1
                                                        ? "disabled"
                                                        : ""
                                                }`}
                                            >

                                                <button
                                                    className="page-link"
                                                    aria-label="Previous"
                                                    onClick={() =>
                                                        paginate(
                                                            currentPage - 1
                                                        )
                                                    }
                                                    disabled={
                                                        currentPage === 1
                                                    }
                                                >
                                                    <i className="fas fa-chevron-left" />
                                                </button>

                                            </li>

                                            {/* NÚMEROS */}

                                            {pageNumbers.map(
                                                (number) => (
                                                    <li
                                                        key={number}
                                                        className={`page-item ${
                                                            number ===
                                                            currentPage
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                    >

                                                        <button
                                                            className="page-link"
                                                            onClick={() =>
                                                                paginate(
                                                                    number
                                                                )
                                                            }
                                                        >
                                                            {number}
                                                        </button>

                                                    </li>
                                                )
                                            )}

                                            {/* SIGUIENTE */}

                                            <li
                                                className={`page-item ${
                                                    currentPage ===
                                                    totalPages
                                                        ? "disabled"
                                                        : ""
                                                }`}
                                            >

                                                <button
                                                    className="page-link"
                                                    aria-label="Next"
                                                    onClick={() =>
                                                        paginate(
                                                            currentPage + 1
                                                        )
                                                    }
                                                    disabled={
                                                        currentPage ===
                                                        totalPages
                                                    }
                                                >
                                                    <i className="fas fa-chevron-right" />
                                                </button>

                                            </li>

                                        </ul>
                                    </nav>

                                </div>
                            )}

                        {/* INFORMACIÓN DE RESULTADOS */}

                        {!loading &&
                            paquetesFiltrados.length > 0 && (
                                <div className="text-center text-muted mt-2">

                                    Mostrando{" "}
                                    {indexOfFirstPackage + 1} -{" "}
                                    {Math.min(
                                        indexOfLastPackage,
                                        paquetesFiltrados.length
                                    )}{" "}
                                    de{" "}
                                    {paquetesFiltrados.length} paquetes

                                </div>
                            )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Principal;