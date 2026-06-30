import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CrearCliente = () => {
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [dni, setDni] = useState("");
    const [direccion, setDireccion] = useState("");
    const [telefono, setTelefono] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    // 🔥 VALIDAR DNI
    const validarDNI = (dni) => {
        const dniRegex = /^\d{8}[A-Za-z]$/;
        if (!dniRegex.test(dni)) return false;

        const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
        const numero = parseInt(dni.substring(0, 8), 10);
        const letra = dni.substring(8).toUpperCase();

        return letras[numero % 23] === letra;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dniUpper = dni.toUpperCase();

        if (
            !nombre.trim() ||
            !apellidos.trim() ||
            !dniUpper ||
            !direccion.trim() ||
            !telefono.trim() ||
            !fechaNacimiento 
        ) {
            return Swal.fire({
                icon: "error",
                title: "Campos incompletos",
                text: "Todos los campos son obligatorios.",
                confirmButtonColor: "#d33",
            });
        }

        // 🔥 VALIDACIÓN DNI AQUÍ
        if (!validarDNI(dniUpper)) {
            return Swal.fire({
                icon: "error",
                title: "DNI inválido",
                text: "El DNI no es válido. Debe tener formato correcto y letra válida.",
                confirmButtonColor: "#d33",
            });
        }

        setLoading(true);

        try {
            const res = await axios.post("/api/auth/register-cliente", {
                nombre,
                apellidos,
                dni: dniUpper,
                direccion,
                telefono,
                fechaNacimiento,
                email,
                password,
            });

            if (res.status === 200 || res.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Cliente creado",
                    text: `El cliente "${nombre} ${apellidos}" se ha creado correctamente.`,
                    confirmButtonColor: "#28a745",
                });

                // limpiar formulario
                setNombre("");
                setApellidos("");
                setDni("");
                setDireccion("");
                setTelefono("");
                setFechaNacimiento("");
                setEmail("");
                setPassword("");
            }
        } catch (error) {
            let mensaje = "No se pudo crear el cliente.";

            if (error.response?.data?.error) {
                const errores = error.response.data.error;

                // Convertir objeto de errores en texto legible
                mensaje = Object.values(errores).flat().join("\n");
            }

            Swal.fire({
                icon: "error",
                title: "Error",
                html: mensaje.replace(/\n/g, "<br>"),
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Crear Cliente
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white p-5 rounded-5 shadow-lg col-12 col-md-12 col-lg-10 mx-auto"
                        style={{ maxWidth: "1000px" }}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Apellidos</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={apellidos}
                                    onChange={(e) =>
                                        setApellidos(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {/* 🔥 DNI con uppercase automático */}
                            <div className="mb-3">
                                <label className="form-label">DNI</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={dni}
                                    onChange={(e) =>
                                        setDni(e.target.value.toUpperCase())
                                    }
                                    maxLength={9}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Dirección</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={direccion}
                                    onChange={(e) =>
                                        setDireccion(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Teléfono</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={telefono}
                                    onChange={(e) =>
                                        setTelefono(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Fecha de nacimiento
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={fechaNacimiento}
                                    onChange={(e) =>
                                        setFechaNacimiento(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100 d-flex justify-content-center align-items-center"
                                style={{ fontWeight: "600", fontSize: "18px" }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Creando...
                                    </>
                                ) : (
                                    "Crear cliente"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearCliente;
