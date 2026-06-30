import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Leer = () => {
    const { id } = useParams();
    const [paquete, setPaquete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get(`/api/paquetes/paquete/${id}`, { withCredentials: true })
            .then((res) => {
                setPaquete(res.data);
                setLoading(false);
            })
            .catch((err) => {
                setError("Error al obtener el paquete.");
                setLoading(false);
            });
    }, [id]);

    // ------------------------- Servicios Incluidos -------------------------
    const handleEditServicioIncluido = async (servicio) => {
        const { value: descripcion } = await Swal.fire({
            title: "Editar Servicio Incluido",
            input: "text",
            inputValue: servicio.descripcion,
            inputLabel: "Descripción",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            inputValidator: (value) => {
                if (!value) {
                    return "La descripción no puede estar vacía";
                }
            },
        });

        if (descripcion) {
            try {
                await axios.put(`/api/incluye/${servicio.id}`, { descripcion });
                Swal.fire(
                    "Actualizado",
                    "Servicio incluido actualizado",
                    "success",
                );

                setPaquete((prev) => ({
                    ...prev,
                    servicios_incluidos: prev.servicios_incluidos.map((s) =>
                        s.id === servicio.id ? { ...s, descripcion } : s,
                    ),
                }));
            } catch (error) {
                Swal.fire("Error", "No se pudo actualizar", "error");
            }
        }
    };

    const handleDeleteServicioIncluido = async (idServicio) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará el servicio incluido.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/incluye/${idServicio}`);
                Swal.fire(
                    "Eliminado",
                    "El servicio ha sido eliminado",
                    "success",
                );

                setPaquete((prev) => ({
                    ...prev,
                    servicios_incluidos: prev.servicios_incluidos.filter(
                        (s) => s.id !== idServicio,
                    ),
                }));
            } catch (error) {
                Swal.fire("Error", "No se pudo eliminar el servicio", "error");
            }
        }
    };

    // ------------------------- Servicios No Incluidos -------------------------
    const handleEditServicioNoIncluido = async (servicio) => {
        const { value: descripcion } = await Swal.fire({
            title: "Editar Servicio No Incluido",
            input: "text",
            inputValue: servicio.descripcion,
            inputLabel: "Descripción",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            inputValidator: (value) => {
                if (!value) {
                    return "La descripción no puede estar vacía";
                }
            },
        });

        if (descripcion) {
            try {
                await axios.put(`/api/no-incluye/${servicio.id}`, {
                    descripcion,
                });
                Swal.fire(
                    "Actualizado",
                    "Servicio no incluido actualizado",
                    "success",
                );

                setPaquete((prev) => ({
                    ...prev,
                    servicios_no_incluidos: prev.servicios_no_incluidos.map(
                        (s) =>
                            s.id === servicio.id ? { ...s, descripcion } : s,
                    ),
                }));
            } catch (error) {
                Swal.fire("Error", "No se pudo actualizar", "error");
            }
        }
    };

    const handleDeleteServicioNoIncluido = async (idServicio) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará el servicio no incluido.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/no-incluye/${idServicio}`);
                Swal.fire(
                    "Eliminado",
                    "El servicio ha sido eliminado",
                    "success",
                );

                setPaquete((prev) => ({
                    ...prev,
                    servicios_no_incluidos: prev.servicios_no_incluidos.filter(
                        (s) => s.id !== idServicio,
                    ),
                }));
            } catch (error) {
                Swal.fire("Error", "No se pudo eliminar el servicio", "error");
            }
        }
    };

    // ------------------------- Galería -------------------------
    const handleEditImagenGaleria = async (imagen) => {
        const { value: file } = await Swal.fire({
            title: "Editar Imagen",
            input: "file",
            inputAttributes: {
                accept: "image/*",
                "aria-label": "Sube una imagen",
            },
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            preConfirm: (file) => {
                if (!file) {
                    Swal.showValidationMessage("Debes seleccionar una imagen");
                }
                return file;
            },
        });

        if (file) {
            const formData = new FormData();
            formData.append("_method", "PUT"); // IMPORTANTE para Laravel
            formData.append("imagen", file); // tu campo debe llamarse 'imagen' para que coincida con backend

            try {
                const res = await axios.post(
                    `/api/galeria/${imagen.id}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    },
                );

                Swal.fire(
                    "Actualizado",
                    "Imagen actualizada correctamente",
                    "success",
                );

                // Actualiza el estado con la nueva imagen recibida (res.data)
                setPaquete((prev) => ({
                    ...prev,
                    imagenes: prev.imagenes.map((img) =>
                        img.id === imagen.id ? res.data : img,
                    ),
                }));
            } catch (error) {
                Swal.fire("Error", "No se pudo actualizar la imagen", "error");
            }
        }
    };

    // Función para editar punto del mapa
    const handleEditPuntoMapa = async (punto) => {
        const { value: formValues } = await Swal.fire({
            title: "Editar Punto del Mapa",
            html:
                `<input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${
                    punto.nombre || ""
                }">` +
                `<input id="swal-lat" class="swal2-input" placeholder="Latitud" value="${
                    punto.latitud || ""
                }">` +
                `<input id="swal-lng" class="swal2-input" placeholder="Longitud" value="${
                    punto.longitud || ""
                }">` +
                `<input id="swal-desc" class="swal2-input" placeholder="Descripción" value="${
                    punto.descripcion || ""
                }">`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                const nombre = document
                    .getElementById("swal-nombre")
                    .value.trim();
                const lat = document.getElementById("swal-lat").value.trim();
                const lng = document.getElementById("swal-lng").value.trim();
                const desc = document.getElementById("swal-desc").value.trim();

                if (!nombre || !lat || !lng || !desc) {
                    Swal.showValidationMessage(
                        "Por favor rellena todos los campos",
                    );
                }

                return {
                    nombre,
                    latitud: lat,
                    longitud: lng,
                    descripcion: desc,
                };
            },
        });

        if (formValues) {
            try {
                await axios.put(`/api/mapa/${punto.id}`, formValues);
                Swal.fire(
                    "Actualizado",
                    "Punto del mapa actualizado correctamente",
                    "success",
                );

                // Actualiza el estado local (suponiendo que tienes setPaquete)
                setPaquete((prev) => ({
                    ...prev,
                    puntos_mapa: prev.puntos_mapa.map((p) =>
                        p.id === punto.id ? { ...p, ...formValues } : p,
                    ),
                }));
            } catch (error) {
                Swal.fire(
                    "Error",
                    "No se pudo actualizar el punto del mapa",
                    "error",
                );
            }
        }
    };

    // Función para eliminar punto del mapa
    const handleDeletePuntoMapa = async (id) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará el punto del mapa.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/mapa/${id}`);
                Swal.fire(
                    "Eliminado",
                    "Punto del mapa eliminado correctamente",
                    "success",
                );

                setPaquete((prev) => ({
                    ...prev,
                    puntos_mapa: prev.puntos_mapa.filter((p) => p.id !== id),
                }));
            } catch (error) {
                Swal.fire(
                    "Error",
                    "No se pudo eliminar el punto del mapa",
                    "error",
                );
            }
        }
    };

    // Editar itinerario
    const handleEditItinerario = async (iti) => {
        const { value: formValues } = await Swal.fire({
            title: "Editar Itinerario",
            html:
                `<input id="swal-dia" type="number" min="1" class="swal2-input" placeholder="Día" value="${
                    iti.dia || ""
                }">` +
                `<input id="swal-fecha" type="date" class="swal2-input" placeholder="Fecha" value="${
                    iti.fecha?.split("T")[0] || ""
                }">` +
                `<textarea id="swal-desc" class="swal2-textarea" placeholder="Descripción">${
                    iti.descripcion || ""
                }</textarea>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                const dia = document.getElementById("swal-dia").value.trim();
                const fecha = document
                    .getElementById("swal-fecha")
                    .value.trim();
                const descripcion = document
                    .getElementById("swal-desc")
                    .value.trim();

                if (!dia || !fecha || !descripcion) {
                    Swal.showValidationMessage(
                        "Por favor rellena todos los campos",
                    );
                    return false;
                }

                return { dia, fecha, descripcion };
            },
        });

        if (formValues) {
            // Validar que la fecha esté dentro del rango del paquete
            const fechaItinerario = new Date(formValues.fecha);
            const fechaInicio = new Date(paquete.fecha_inicio);
            const fechaFin = new Date(paquete.fecha_fin);

            if (fechaItinerario < fechaInicio || fechaItinerario > fechaFin) {
                Swal.fire(
                    "Error",
                    `La fecha del itinerario debe estar entre ${fechaInicio.toLocaleDateString()} y ${fechaFin.toLocaleDateString()}`,
                    "error",
                );
                return; // No continúa con la actualización
            }

            try {
                await axios.put(`/api/itinerario/${iti.id}`, formValues);
                Swal.fire(
                    "Actualizado",
                    "Itinerario actualizado correctamente",
                    "success",
                );

                setPaquete((prev) => ({
                    ...prev,
                    itinerario: prev.itinerario.map((item) =>
                        item.id === iti.id ? { ...item, ...formValues } : item,
                    ),
                }));
            } catch (error) {
                Swal.fire(
                    "Error",
                    "No se pudo actualizar el itinerario",
                    "error",
                );
            }
        }
    };

    // Eliminar itinerario
    const handleDeleteItinerario = async (id) => {
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará el itinerario.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/itinerario/${id}`);
                Swal.fire(
                    "Eliminado",
                    "Itinerario eliminado correctamente",
                    "success",
                );

                setPaquete((prev) => ({
                    ...prev,
                    itinerario: prev.itinerario.filter(
                        (item) => item.id !== id,
                    ),
                }));
            } catch (error) {
                Swal.fire(
                    "Error",
                    "No se pudo eliminar el itinerario",
                    "error",
                );
            }
        }
    };

    const handleAddItinerario = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Añadir Itinerario",
            html:
                `<input id="swal-dia" type="number" min="1" class="swal2-input" placeholder="Día">` +
                `<input id="swal-fecha" type="date" class="swal2-input" placeholder="Fecha">` +
                `<textarea id="swal-desc" class="swal2-textarea" placeholder="Descripción"></textarea>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                const dia = document.getElementById("swal-dia").value.trim();
                const fecha = document
                    .getElementById("swal-fecha")
                    .value.trim();
                const descripcion = document
                    .getElementById("swal-desc")
                    .value.trim();

                if (!dia || !fecha || !descripcion) {
                    Swal.showValidationMessage(
                        "Por favor rellena todos los campos",
                    );
                    return false;
                }

                return { dia, fecha, descripcion };
            },
        });

        if (formValues) {
            // Validar que la fecha esté dentro del rango del paquete
            const fechaItinerario = new Date(formValues.fecha);
            const fechaInicio = new Date(paquete.fecha_inicio);
            const fechaFin = new Date(paquete.fecha_fin);

            if (fechaItinerario < fechaInicio || fechaItinerario > fechaFin) {
                Swal.fire(
                    "Error",
                    `La fecha del itinerario debe estar entre ${fechaInicio.toLocaleDateString()} y ${fechaFin.toLocaleDateString()}`,
                    "error",
                );
                return; // No continúa con la creación
            }

            try {
                const response = await axios.post(
                    `/api/paquetes/${paquete.id}/itinerario`,
                    formValues,
                );

                Swal.fire(
                    "Añadido",
                    "Itinerario agregado correctamente",
                    "success",
                );

                // Actualiza el estado del paquete con el nuevo itinerario
                setPaquete((prev) => ({
                    ...prev,
                    itinerario: [...prev.itinerario, response.data],
                }));
            } catch (error) {
                Swal.fire("Error", "No se pudo añadir el itinerario", "error");
            }
        }
    };

    const handleAddPuntoMapa = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Añadir Punto del Mapa",
            html:
                `<input id="swal-nombre" class="swal2-input" placeholder="Nombre">` +
                `<input id="swal-latitud" type="text" class="swal2-input" placeholder="Latitud">` +
                `<input id="swal-longitud" type="text" class="swal2-input" placeholder="Longitud">` +
                `<textarea id="swal-desc" class="swal2-textarea" placeholder="Ubicación (Nombre, ej: Madrid)"></textarea>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                const nombre = document
                    .getElementById("swal-nombre")
                    .value.trim();
                const latitud = document
                    .getElementById("swal-latitud")
                    .value.trim();
                const longitud = document
                    .getElementById("swal-longitud")
                    .value.trim();
                const descripcion = document
                    .getElementById("swal-desc")
                    .value.trim();

                if (!nombre || !latitud || !longitud || !descripcion) {
                    Swal.showValidationMessage(
                        "Por favor rellena todos los campos",
                    );
                }

                return { nombre, latitud, longitud, descripcion };
            },
        });

        if (formValues) {
            try {
                const response = await axios.post(
                    `/api/paquetes/${paquete.id}/mapa`,
                    formValues,
                );

                Swal.fire(
                    "Añadido",
                    "Punto del mapa agregado correctamente",
                    "success",
                );

                // Actualiza el estado del paquete con el nuevo punto
                setPaquete((prev) => ({
                    ...prev,
                    puntos_mapa: [...prev.puntos_mapa, response.data],
                }));
            } catch (error) {
                Swal.fire(
                    "Error",
                    "No se pudo añadir el punto del mapa",
                    "error",
                );
            }
        }
    };

    const handleAddServicioNoIncluido = async () => {
        const { value: descripcion } = await Swal.fire({
            title: "Añadir Servicio No Incluido",
            input: "textarea",
            inputPlaceholder: "Descripción del servicio",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            inputValidator: (value) => {
                if (!value.trim()) {
                    return "La descripción es obligatoria";
                }
            },
        });

        if (descripcion) {
            try {
                const response = await axios.post(
                    `/api/paquetes/${paquete.id}/no-incluye`,
                    { descripcion },
                );

                Swal.fire(
                    "Añadido",
                    "Servicio no incluido agregado correctamente",
                    "success",
                );

                setPaquete((prev) => ({
                    ...prev,
                    servicios_no_incluidos: [
                        ...prev.servicios_no_incluidos,
                        response.data,
                    ],
                }));
            } catch (error) {
                Swal.fire(
                    "Error",
                    "No se pudo añadir el servicio no incluido",
                    "error",
                );
            }
        }
    };

    const handleAddServicioIncluido = async () => {
        const { value: descripcion } = await Swal.fire({
            title: "Añadir Servicio Incluido",
            input: "textarea",
            inputPlaceholder: "Descripción del servicio",
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            inputValidator: (value) => {
                if (!value.trim()) {
                    return "La descripción es obligatoria";
                }
            },
        });

        if (descripcion) {
            try {
                const response = await axios.post(
                    `/api/paquetes/${paquete.id}/incluye`,
                    { descripcion },
                );

                Swal.fire(
                    "Añadido",
                    "Servicio incluido agregado correctamente",
                    "success",
                );

                setPaquete((prev) => ({
                    ...prev,
                    servicios_incluidos: [
                        ...prev.servicios_incluidos,
                        response.data,
                    ],
                }));
            } catch (error) {
                Swal.fire(
                    "Error",
                    "No se pudo añadir el servicio incluido",
                    "error",
                );
            }
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center mt-5 text-danger">{error}</div>;
    }

    if (!paquete) {
        return (
            <div className="text-center mt-5 text-secondary">
                No se encontró el paquete.
            </div>
        );
    }

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box text-center">
                                <h4 className="page-title fs-2">
                                    Detalle de la experiencia
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Servicios incluidos */}
                    <div className="mb-4">
                        <h5 className="text-center fs-3">
                            Servicios incluidos
                        </h5>
                        <table className="table table-sm table-bordered align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Descripción</th>
                                    <th>Operaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paquete.servicios_incluidos?.map(
                                    (servicio) => (
                                        <tr key={servicio.id}>
                                            <td>{servicio.id}</td>
                                            <td>{servicio.descripcion}</td>
                                            <td>
                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() =>
                                                        handleEditServicioIncluido(
                                                            servicio,
                                                        )
                                                    }
                                                    title="Editar"
                                                >
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() =>
                                                        handleDeleteServicioIncluido(
                                                            servicio.id,
                                                        )
                                                    }
                                                    title="Eliminar"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                        <div className="text-end mt-3">
                            <button
                                className="btn btn-success"
                                onClick={() => handleAddServicioIncluido(true)}
                            >
                                <i className="fas fa-plus me-2"></i>Agregar
                                Servicio Incluido
                            </button>
                        </div>
                    </div>

                    {/* Servicios no incluidos */}
                    <div className="mb-4">
                        <h5 className="text-center fs-3">
                            Servicios no incluidos
                        </h5>
                        <table className="table table-sm table-bordered align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Descripción</th>
                                    <th>Operaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paquete.servicios_no_incluidos?.map(
                                    (servicio) => (
                                        <tr key={servicio.id}>
                                            <td>{servicio.id}</td>
                                            <td>{servicio.descripcion}</td>
                                            <td>
                                                <button
                                                    className="btn btn-warning btn-sm me-2"
                                                    onClick={() =>
                                                        handleEditServicioNoIncluido(
                                                            servicio,
                                                        )
                                                    }
                                                    title="Editar"
                                                >
                                                    <i className="fas fa-pencil-alt"></i>
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() =>
                                                        handleDeleteServicioNoIncluido(
                                                            servicio.id,
                                                        )
                                                    }
                                                    title="Eliminar"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                        <div className="text-end mt-3">
                            <button
                                className="btn btn-success"
                                onClick={() =>
                                    handleAddServicioNoIncluido(true)
                                }
                            >
                                <i className="fas fa-plus me-2"></i>Agregar
                                Servicio No Incluido
                            </button>
                        </div>
                    </div>

                    {/* Galería de imágenes */}
                    <div className="mb-4">
                        <h5 className="text-center fs-3">
                            Galería de imágenes
                        </h5>
                        <table className="table table-sm table-bordered align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Imagen</th>
                                    <th>Operaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paquete.imagenes?.map((img) => (
                                    <tr key={img.id}>
                                        <td>{img.id}</td>
                                        <td>
                                            <img
                                                src={`/storage/paquetes/${paquete.id}/images/${img.ruta_imagen}`}
                                                alt={`Galería ${img.id}`}
                                                style={{
                                                    width: 150,
                                                    height: 100,
                                                    objectFit: "cover",
                                                    borderRadius: 8,
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    handleEditImagenGaleria(img)
                                                }
                                                title="Editar"
                                            >
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Puntos del mapa */}
                    <div className="mb-4">
                        <h5 className="text-center fs-3">Puntos del Mapa</h5>
                        <table className="table table-sm table-bordered align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Latitud</th>
                                    <th>Longitud</th>
                                    <th>Ubicación</th>
                                    <th>Operaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paquete.puntos_mapa?.map((punto) => (
                                    <tr key={punto.id}>
                                        <td>{punto.id}</td>
                                        <td>{punto.nombre}</td>
                                        <td>{punto.latitud}</td>
                                        <td>{punto.longitud}</td>
                                        <td>{punto.descripcion}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    handleEditPuntoMapa(punto)
                                                }
                                                title="Editar"
                                            >
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDeletePuntoMapa(
                                                        punto.id,
                                                    )
                                                }
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="d-flex justify-content-end mt-2">
                            <button
                                className="btn btn-success"
                                onClick={() => handleAddPuntoMapa()}
                            >
                                <i className="fas fa-plus me-1"></i> Añadir
                                Punto del Mapa
                            </button>
                        </div>
                    </div>

                    {/* Itinerarios */}
                    <div className="mb-4">
                        <h5 className="text-center fs-3">Itinerarios</h5>
                        <table className="table table-sm table-bordered align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Día</th>
                                    <th>Descripción</th>
                                    <th>Operaciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paquete.itinerario?.map((iti) => (
                                    <tr key={iti.id}>
                                        <td>{iti.id}</td>
                                        <td>{iti.dia}</td>
                                        <td>{iti.descripcion}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    handleEditItinerario(iti)
                                                }
                                                title="Editar"
                                            >
                                                <i className="fas fa-pencil-alt"></i>
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDeleteItinerario(
                                                        iti.id,
                                                    )
                                                }
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="d-flex justify-content-end mt-2">
                            <button
                                className="btn btn-success"
                                onClick={() => handleAddItinerario()}
                            >
                                <i className="fas fa-plus me-1"></i> Añadir
                                Itinerario
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leer;
