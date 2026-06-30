import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const Crear = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [emailExists, setEmailExists] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error2, setError2] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const generarPassword = () => {
            const caracteres =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            return Array.from(
                { length: 12 },
                () => caracteres[Math.floor(Math.random() * caracteres.length)],
            ).join("");
        };
        setPassword(generarPassword());
    }, []);

    const handleChangeEmail = async (e) => {
        const value = e.target.value;
        setEmail(value);

        if (value.includes("@")) {
            try {
                const response = await axios.get(
                    `/api/rol-admin/existe?email=${value}`,
                );
                const data = response.data;
                setEmailExists(data.exists);
            } catch (error) {
                console.error("");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // <-- aquí activas el spinner

        if (!name.trim()) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "El nombre es obligatorio",
                confirmButtonColor: "#d33",
            });
            setLoading(false); // <-- no olvides desactivarlo
            return;
        }

        if (emailExists) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "El correo ya está registrado",
                confirmButtonColor: "#d33",
            });
            setLoading(false); // <-- desactivar spinner
            return;
        }

        try {
            const url = `/api/rol-admin/alta?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

            const response = await axios.post(url);

            if (response.status === 200) {
                Swal.fire({
                    icon: "success",
                    title: "Administrador creado con éxito",
                    text: `El administrador con el correo ${email} ha sido creado correctamente.`,
                    confirmButtonColor: "#28a745",
                });

                setName("");
                setEmail("");
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un problema al dar de alta al administrador.",
                confirmButtonColor: "#d33",
            });
        } finally {
            setLoading(false); // <-- siempre se ejecuta al final
        }
    };

    useEffect(() => {
        if (error2) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error2,
                confirmButtonColor: "#d33",
            });
        }
    }, [error2]);

    return (
        <div className="content-page">
            <div className="content">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title text-center">
                                    Alta de Administradores
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-5 shadow-lg col-12 col-md-8 col-lg-6 mx-auto">
                        {error2 && (
                            <div className="alert alert-danger p-nosotros">
                                {error2}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label
                                    className="form-label p-nosotros"
                                    htmlFor="name"
                                >
                                    Nombre completo
                                </label>
                                <input
                                    className="form-control"
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label
                                    className="form-label p-nosotros"
                                    htmlFor="email"
                                >
                                    Correo electrónico
                                </label>
                                <input
                                    className={`form-control ${emailExists ? "is-invalid" : ""}`}
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={handleChangeEmail}
                                    required
                                />
                                {emailExists && (
                                    <div className="invalid-feedback">
                                        Este correo ya está registrado.
                                    </div>
                                )}
                            </div>
                            <div className="mb-3">
                                <label
                                    className="form-label p-nosotros"
                                    htmlFor="password"
                                >
                                    Contraseña generada
                                </label>
                                <div className="input-group">
                                    <input
                                        className="form-control"
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        readOnly
                                    />
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? "Ocultar" : "Mostrar"}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-success w-100 text-white d-flex justify-content-center align-items-center"
                                style={{ fontWeight: "600", fontSize: "18px" }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                    </>
                                ) : (
                                    "Dar de alta"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Crear;
