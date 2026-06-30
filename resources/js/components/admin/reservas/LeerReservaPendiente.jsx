import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const ParticipantesReserva = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [participantes, setParticipantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get(`/api/participantes/reserva/${id}`)
            .then((res) => {
                setParticipantes(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al obtener los viajeros.");
                setLoading(false);
            });
    }, [id]);

    const volver = () => navigate("/reservas-pendientes");

    const handleEdit = (participante) => {
        Swal.fire({
            title: `Editar Participante ID ${participante.id}`,
            html: `
        <style>
            .swal-form-row { display: flex; align-items: center; margin-bottom: 10px; }
            .swal-form-row label { width: 120px; text-align: right; margin-right: 10px; font-weight: bold; }
            .swal-form-row input, .swal-form-row textarea { flex: 1; }
        </style>
        ${[
            "nombre",
            "apellidos",
            "email",
            "dni",
            "telefono",
            "direccion",
            "ciudad",
            "provincia",
            "fecha_nacimiento",
            "experiencia",
            "motivacion",
            "info_relevante",
        ]
            .map(
                (field) => `
            <div class="swal-form-row">
                <label for="${field}">${field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                ${
                    field.includes("experiencia") ||
                    field.includes("motivacion") ||
                    field.includes("info")
                        ? `<textarea id="${field}" class="swal2-textarea">${participante[field] || ""}</textarea>`
                        : `<input id="${field}" class="swal2-input" type="${field === "fecha_nacimiento" ? "date" : "text"}" value="${field === "fecha_nacimiento" ? participante[field]?.slice(0, 10) || "" : participante[field] || ""}">`
                }
            </div>
        `,
            )
            .join("")}
        `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                const getValue = (id) =>
                    document.getElementById(id)?.value.trim() || "";
                const email = getValue("email");
                const dni = getValue("dni").toUpperCase();

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (email && !emailRegex.test(email)) {
                    Swal.showValidationMessage("El email no es válido.");
                    return false;
                }

                const dniRegex = /^(\d{8})([A-Z])$/;
                if (dni) {
                    if (!dniRegex.test(dni)) {
                        Swal.showValidationMessage(
                            "El DNI debe tener 8 números y una letra mayúscula.",
                        );
                        return false;
                    }
                    const letrasValidas = "TRWAGMYFPDXBNJZSQVHLCKE";
                    const letrasProhibidas = ["I", "O", "U", "Ñ"];
                    const letra = dni.charAt(8);
                    const numeros = dni.substr(0, 8);
                    if (letrasProhibidas.includes(letra)) {
                        Swal.showValidationMessage(
                            `La letra '${letra}' no es válida en un DNI.`,
                        );
                        return false;
                    }
                    const letraCorrecta = letrasValidas.charAt(
                        parseInt(numeros, 10) % 23,
                    );
                    if (letra !== letraCorrecta) {
                        Swal.showValidationMessage(
                            "La letra del DNI es incorrecta.",
                        );
                        return false;
                    }
                }

                return [
                    "nombre",
                    "apellidos",
                    "email",
                    "dni",
                    "telefono",
                    "direccion",
                    "ciudad",
                    "provincia",
                    "fecha_nacimiento",
                    "experiencia",
                    "motivacion",
                    "info_relevante",
                ].reduce(
                    (obj, field) => ({ ...obj, [field]: getValue(field) }),
                    {},
                );
            },
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .put(`/api/participantes/${participante.id}`, result.value)
                    .then((res) => {
                        setParticipantes((prev) =>
                            prev.map((p) =>
                                p.id === res.data.id ? res.data : p,
                            ),
                        );
                        Swal.fire(
                            "Actualizado",
                            "Participante actualizado correctamente",
                            "success",
                        );
                    })
                    .catch(() => {
                        Swal.fire(
                            "Error",
                            "No se pudo actualizar el participante",
                            "error",
                        );
                    });
            }
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "¿Eliminar participante?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`/api/participantes/${id}`)
                    .then(() => {
                        setParticipantes((prev) =>
                            prev.filter((p) => p.id !== id),
                        );
                        Swal.fire(
                            "Eliminado",
                            "Participante eliminado correctamente",
                            "success",
                        );
                    })
                    .catch(() => {
                        Swal.fire(
                            "Error",
                            "No se pudo eliminar el participante",
                            "error",
                        );
                    });
            }
        });
    };

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Viajeros de la reserva
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive p-3">
                        {loading ? (
                            <div className="text-center mt-5">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : (
                            <table className="table table-sm table-bordered align-middle mb-0">
                                <thead>
                                    <tr className="text-secondary text-nowrap">
                                        <th className="text-start">ID</th>
                                        <th className="text-start">Nombre</th>
                                        <th className="text-start">
                                            Apellidos
                                        </th>
                                        <th className="text-start">Email</th>
                                        <th className="text-start">DNI</th>
                                        <th className="text-start">Teléfono</th>
                                        <th className="text-start">
                                            Dirección
                                        </th>
                                        <th className="text-start">Ciudad</th>
                                        <th className="text-start">
                                            Provincia
                                        </th>
                                        <th className="text-start">
                                            Fecha Nac.
                                        </th>
                                        <th className="text-start">
                                            Experiencia
                                        </th>
                                        <th className="text-start">
                                            Motivación
                                        </th>
                                        <th className="text-start">
                                            Info Relevante
                                        </th>
                                        <th className="text-start">
                                            Operaciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participantes.length > 0 ? (
                                        participantes.map((p) => (
                                            <tr
                                                key={p.id}
                                                style={{
                                                    cursor: "pointer",
                                                    position: "relative",
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        paddingLeft: "25px",
                                                    }}
                                                >
                                                    {p.id}
                                                </td>
                                                <td>{p.nombre}</td>
                                                <td>{p.apellidos}</td>
                                                <td>{p.email}</td>
                                                <td>{p.dni}</td>
                                                <td>{p.telefono}</td>
                                                <td>{p.direccion}</td>
                                                <td>{p.ciudad}</td>
                                                <td>{p.provincia}</td>
                                                <td>
                                                    {p.fecha_nacimiento
                                                        ? new Date(
                                                              p.fecha_nacimiento,
                                                          ).toLocaleDateString(
                                                              "es-ES",
                                                          )
                                                        : ""}
                                                </td>
                                                <td>{p.experiencia}</td>
                                                <td>{p.motivacion}</td>
                                                <td>{p.info_relevante}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-warning btn-sm me-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(p);
                                                        }}
                                                    >
                                                        <i className="fas fa-pencil-alt"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(p.id);
                                                        }}
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="14"
                                                className="text-center text-muted"
                                            >
                                                No se encontraron viajeros.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="text-center mt-4">
                        <button className="btn btn-secondary" onClick={volver}>
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParticipantesReserva;
