import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CrearProveedor = () => {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [notas, setNotas] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre.trim()) {
            return Swal.fire({
                icon: "error",
                title: "Campo obligatorio",
                text: "El nombre es obligatorio",
                confirmButtonColor: "#d33",
            });
        }

        setLoading(true);

        try {
            const res = await axios.post("/api/proveedores", {
                nombre,
                email,
                telefono,
                notas,
            });

            if (res.status === 200 || res.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Proveedor creado",
                    text: `El proveedor "${nombre}" se ha creado correctamente.`,
                    confirmButtonColor: "#28a745",
                });

                setNombre("");
                setEmail("");
                setTelefono("");
                setNotas("");
            }
        } catch (error) {
            let mensaje = "No se pudo crear el proveedor.";

            if (error.response?.data?.message) {
                mensaje = error.response.data.message;
            }

            Swal.fire({
                icon: "error",
                title: "Error",
                text: mensaje,
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
                                    Crear Proveedor
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white p-5 rounded-5 shadow-lg col-12 col-md-10 mx-auto"
                        style={{ maxWidth: "900px" }}
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
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Teléfono</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Notas</label>
                                <textarea
                                    className="form-control"
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100"
                                disabled={loading}
                                style={{ fontWeight: "600", fontSize: "18px" }}
                            >
                                {loading ? "Creando..." : "Crear proveedor"}
                            </button>

                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CrearProveedor;