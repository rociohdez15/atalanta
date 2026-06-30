import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const CrearHotel = () => {
    const [nombre, setNombre] = useState("");
    const [lugar, setLugar] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre.trim()) {
            return Swal.fire({
                icon: "error",
                title: "Campo obligatorio",
                text: "El nombre del hotel es obligatorio.",
                confirmButtonColor: "#d33",
            });
        }

        setLoading(true);

        try {
            const res = await axios.post("/api/hoteles/crear", {
                nombre,
                lugar,
                email,
                telefono,
            });

            if (res.status === 200 || res.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Hotel creado",
                    text: `El hotel "${nombre}" se ha creado correctamente.`,
                    confirmButtonColor: "#28a745",
                });

                // LIMPIAR FORMULARIO
                setNombre("");
                setLugar("");
                setEmail("");
                setTelefono("");
            }
        } catch (error) {
            let mensaje = "No se pudo crear el hotel.";

            if (error.response?.data?.errors) {
                const errores = error.response.data.errors;
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
                                    Crear Hotel
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white p-5 rounded-5 shadow-lg col-12 col-md-12 col-lg-10 mx-auto"
                        style={{ maxWidth: "1000px" }}
                    >
                        <form onSubmit={handleSubmit}>
                            {/* NOMBRE */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Nombre del hotel
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={nombre}
                                    onChange={(e) =>
                                        setNombre(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {/* LUGAR */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Lugar
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={lugar}
                                    onChange={(e) =>
                                        setLugar(e.target.value)
                                    }
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                />
                            </div>

                            {/* TELEFONO */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={telefono}
                                    onChange={(e) =>
                                        setTelefono(e.target.value)
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100 d-flex justify-content-center align-items-center"
                                style={{
                                    fontWeight: "600",
                                    fontSize: "18px",
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Creando...
                                    </>
                                ) : (
                                    "Crear hotel"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrearHotel;