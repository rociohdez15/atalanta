import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

const Register = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [showPassword, setShowPassword] = useState(true);
    const [showConfirmPassword, setShowConfirmPassword] = useState(true);
    const [rgpdAceptado, setRgpdAceptado] = useState(false);

    useEffect(() => {
        const token =
            sessionStorage.getItem("token") || localStorage.getItem("token");
        if (token) {
            navigate("/", { replace: true });
        }
    }, []);

    // Estados del formulario y error
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dni, setDni] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case "name":
                setName(value);
                break;
            case "lastName":
                setLastName(value);
                break;
            case "dni":
                setDni(value);
                break;
            case "address":
                setAddress(value);
                break;
            case "phone":
                setPhone(value);
                break;
            case "birthdate":
                setBirthdate(value);
                break;
            case "email":
                setEmail(value);
                break;
            case "password":
                setPassword(value);
                break;
            case "confirmPassword":
                setConfirmPassword(value);
                break;
            default:
                break;
        }
    };

    const validateForm = () => {
        const dniPattern = /^\d{8}[A-Za-z]$/;
        if (!dniPattern.test(dni)) {
            Swal.fire({
                icon: "error",
                title: "DNI inválido",
                text: "Introduce un DNI válido (8 números y una letra)",
                confirmButtonText: "Aceptar",
            });
            return false;
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            Swal.fire({
                icon: "error",
                title: "Correo inválido",
                text: "Introduce un correo electrónico válido",
                confirmButtonText: "Aceptar",
            });
            return false;
        }

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordPattern.test(password)) {
            Swal.fire({
                icon: "error",
                title: "Contraseña débil",
                text: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número",
                confirmButtonText: "Aceptar",
            });
            return false;
        }

        if (password !== confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Contraseñas no coinciden",
                text: "Verifica que ambas contraseñas sean iguales",
                confirmButtonText: "Aceptar",
            });
            return false;
        }

        const today = new Date();
        const birthDate = new Date(birthdate);
        const age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth() - birthDate.getMonth();
        if (age < 18 || (age === 18 && month < 0)) {
            Swal.fire({
                icon: "error",
                title: "Edad insuficiente",
                text: "Debes ser mayor de 18 años",
                confirmButtonText: "Aceptar",
            });
            return false;
        }

        if (!rgpdAceptado) {
            Swal.fire({
                icon: "error",
                title: "Política de Privacidad",
                text: "Debes aceptar la política de privacidad para registrarte",
                confirmButtonText: "Aceptar",
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        const userDetails = {
            nombre: name,
            apellidos: lastName,
            dni,
            direccion: address,
            telefono: phone,
            fechaNacimiento: birthdate,
            email,
            password,
            rgpd_aceptado: rgpdAceptado,
        };

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userDetails),
            });

            // Intentamos parsear JSON del backend
            let data = {};
            try {
                data = await response.json();
            } catch (err) {
                // Si no es JSON lo ignoramos
            }

            // Manejo de errores de validación
            if (!response.ok) {
                // DNI duplicado o letra incorrecta
                if (data?.error?.dni) {
                    throw new Error(data.error.dni[0]);
                }

                // Email duplicado
                if (data?.error?.email) {
                    throw new Error(data.error.email[0]);
                }

                // Otros errores del backend
                throw new Error("Error al registrar usuario.");
            }

            // Registro exitoso
            Swal.fire({
                icon: "success",
                title: "Registro exitoso",
                text: "¡Te has registrado correctamente! Ahora puedes iniciar sesión.",
                confirmButtonText: "Ir a Login",
            }).then(() => navigate("/login"));
        } catch (err) {
            // Mostrar cualquier error capturado
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message,
                confirmButtonText: "Aceptar",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-vh-100 py-5 px-3"
            style={{ backgroundColor: "#ffffff" }}
        >
            <div className="container d-flex justify-content-center align-items-center">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-opacity-75 rounded-4 p-4 shadow-lg"
                    style={{
                        backdropFilter: "blur(5px)",
                        backgroundColor: "#000000",
                        maxWidth: "900px", // más ancho
                        width: "100%",
                    }}
                >
                    {/* Volver */}
                    <motion.button
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="btn btn-link text-decoration-none mb-3 d-flex align-items-center"
                        style={{
                            color: " #ffffff",
                            fontFamily: "Inter, sans-serif",
                            fontSize: "10pt",
                        }}
                        onClick={() => window.history.back()}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#d5d2d2")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#ffffff")
                        }
                    >
                        <ArrowLeft size={18} className="me-2" />
                        Volver
                    </motion.button>

                    {/* Título */}
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-center mb-4"
                    >
                        <h4
                            className="fw-bold"
                            style={{
                                color: "#ffffff",
                                fontSize: "25px",
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            Registrarse
                        </h4>
                    </motion.div>

                    {/* Error */}
                    {error && (
                        <div
                            className="alert alert-danger text-center p-2"
                            style={{ fontSize: "14px" }}
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="row g-3">
                            {/* Nombre */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="col-md-4"
                            >
                                <label
                                    htmlFor="name"
                                    className="form-label"
                                    style={{ color: "#ffffff" }}
                                >
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    name="name"
                                    placeholder="Nombre"
                                    value={name}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        borderColor: "#ffffff",
                                        backgroundColor: "#ffffff",
                                        height: "30px",
                                        fontSize: "12px",
                                    }}
                                />
                            </motion.div>

                            {/* Apellidos */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="col-md-4"
                            >
                                <label
                                    htmlFor="lastName"
                                    className="form-label"
                                    style={{ color: "#ffffff" }}
                                >
                                    Apellidos
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="lastName"
                                    name="lastName"
                                    value={lastName}
                                    onChange={handleChange}
                                    placeholder="Apellidos"
                                    required
                                    style={{
                                        borderColor: "#ffffff",
                                        backgroundColor: "#ffffff",
                                        height: "30px",
                                        fontSize: "12px",
                                    }}
                                />
                            </motion.div>

                            {/* DNI */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="col-md-4"
                            >
                                <label
                                    htmlFor="dni"
                                    className="form-label"
                                    style={{ color: "#ffffff" }}
                                >
                                    DNI
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="dni"
                                    name="dni"
                                    value={dni}
                                    placeholder="DNI"
                                    onChange={handleChange}
                                    required
                                    style={{
                                        borderColor: "#ffffff",
                                        backgroundColor: "#ffffff",
                                        height: "30px",
                                        fontSize: "12px",
                                    }}
                                />
                            </motion.div>

                            {/* Dirección */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="col-md-6"
                            >
                                <label
                                    htmlFor="address"
                                    className="form-label"
                                    style={{ color: "#ffffff" }}
                                >
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="address"
                                    name="address"
                                    value={address}
                                    placeholder="Dirección"
                                    onChange={handleChange}
                                    required
                                    style={{
                                        borderColor: "#ffffff",
                                        backgroundColor: "#ffffff",
                                        height: "30px",
                                        fontSize: "12px",
                                    }}
                                />
                            </motion.div>

                            {/* Teléfono */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                                className="col-md-6"
                            >
                                <label
                                    htmlFor="phone"
                                    className="form-label"
                                    style={{ color: "#ffffff" }}
                                >
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="phone"
                                    name="phone"
                                    placeholder="Teléfono"
                                    value={phone}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        borderColor: "#ffffff",
                                        backgroundColor: "#ffffff",
                                        height: "30px",
                                        fontSize: "12px",
                                    }}
                                />
                            </motion.div>

                            {/* Fecha de nacimiento */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="col-md-4"
                            >
                                <label
                                    htmlFor="birthdate"
                                    className="form-label"
                                    style={{ color: "#ffffff" }}
                                >
                                    Fecha de nacimiento
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="birthdate"
                                    name="birthdate"
                                    placeholder="Fecha de nacimiento"
                                    value={birthdate}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        borderColor: "#ffffff",
                                        backgroundColor: "#ffffff",
                                        height: "30px",
                                        fontSize: "12px",
                                        color: "#716b61ff",
                                    }}
                                />
                            </motion.div>

                            {/* Email */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.5 }}
                                className="col-md-4"
                            >
                                <label
                                    htmlFor="email"
                                    className="form-label"
                                    style={{ color: "#ffffff" }}
                                >
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        borderColor: "#ffffff",
                                        backgroundColor: "#ffffff",
                                        height: "30px",
                                        fontSize: "12px",
                                    }}
                                />
                            </motion.div>

                            {/* Contraseña */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="col-md-4"
                            >
                                <label
                                    htmlFor="password"
                                    className="form-label"
                                    style={{ color: "#ffffff" }}
                                >
                                    Contraseña
                                </label>
                                <div className="position-relative">
                                    <input
                                        type={
                                            showPassword ? "password" : "text"
                                        }
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={password}
                                        placeholder="Contraseña"
                                        onChange={handleChange}
                                        required
                                        style={{
                                            borderColor: "#ffffff",
                                            backgroundColor: "#ffffff",
                                            height: "30px",
                                            fontSize: "12px",
                                            paddingRight: "2rem", // espacio para el icono
                                        }}
                                    />
                                    <span
                                        className="position-absolute top-50 end-0 translate-middle-y me-2"
                                        style={{
                                            cursor: "pointer",
                                            color: "#000000",
                                        }}
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </span>
                                </div>
                            </motion.div>

                            {/* Confirmar contraseña */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1.1, duration: 0.5 }}
                                className="col-md-12"
                            >
                                <label
                                    htmlFor="confirmPassword"
                                    className="form-label"
                                    style={{ color: "#ffffff" }}
                                >
                                    Confirmar contraseña
                                </label>
                                <div className="position-relative">
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "password"
                                                : "text"
                                        }
                                        className="form-control"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="Confirmar contraseña"
                                        value={confirmPassword}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            borderColor: "#ffffff",
                                            backgroundColor: "#ffffff",
                                            height: "30px",
                                            fontSize: "12px",
                                            paddingRight: "2rem",
                                        }}
                                    />
                                    <span
                                        className="position-absolute top-50 end-0 translate-middle-y me-2"
                                        style={{
                                            cursor: "pointer",
                                            color: "#000000",
                                        }}
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.15, duration: 0.5 }}
                            className="mt-3 d-flex align-items-start gap-2"
                        >
                            <input
                                type="checkbox"
                                id="rgpd"
                                checked={rgpdAceptado}
                                onChange={(e) =>
                                    setRgpdAceptado(e.target.checked)
                                }
                                style={{
                                    marginTop: "3px",
                                    cursor: "pointer",
                                }}
                            />
                            <label
                                htmlFor="rgpd"
                                style={{ color: "#ffffff", fontSize: "12px" }}
                            >
                                He leído y acepto la{" "}
                                <Link
                                    to="/politica"
                                    style={{
                                        color: "#f0e6d3",
                                        textDecoration: "underline",
                                        fontSize: "12px",
                                    }}
                                >
                                    Política de Privacidad
                                </Link>
                            </label>
                        </motion.div>

                        {/* Botón Registrar */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                            className="d-flex flex-column flex-sm-row mt-4 gap-2 w-100"
                        >
                            {/* Botón Registrar */}
                            <button
                                type="submit"
                                className="btn rounded-top-2 d-flex align-items-center justify-content-center"
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)",
                                    color: "#000000",
                                    border: "1px solid rgba(255,255,255,0.5)",
                                    minWidth: "110px",
                                    textAlign: "center",
                                    fontSize: "12px",
                                    transition: "all 0.3s ease",
                                    fontFamily: "Inter, sans-serif",
                                    flex: 1,
                                    height: "35px",
                                    opacity: loading || !rgpdAceptado ? 0.5 : 1,
                                    cursor:
                                        loading || !rgpdAceptado
                                            ? "not-allowed"
                                            : "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading && rgpdAceptado) {
                                        e.currentTarget.style.backgroundColor =
                                            "rgba(255, 255, 255, 0.2)";
                                        e.currentTarget.style.color = "#ffffff";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "rgba(255, 255, 255, 0.8)";
                                    e.currentTarget.style.color = "#000000";
                                }}
                                disabled={loading || !rgpdAceptado}
                            >
                                {loading ? (
                                    <div
                                        className="spinner-border spinner-border-sm text-white"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Cargando...
                                        </span>
                                    </div>
                                ) : (
                                    "Registrar"
                                )}
                            </button>

                            {/* Botón Ya tengo cuenta */}
                            <button
                                type="button"
                                className="btn rounded-top-2"
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)",
                                    color: "#000000",
                                    border: "1px solid rgba(255,255,255,0.5)",
                                    minWidth: "110px",
                                    textAlign: "center",
                                    fontSize: "12px",
                                    transition: "all 0.3s ease",
                                    fontFamily: "Inter, sans-serif",
                                    flex: 1,
                                    height: "35px",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "rgba(255, 255, 255, 0.2)";
                                    e.currentTarget.style.color = "#ffffff";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "rgba(255, 255, 255, 0.8)";
                                    e.currentTarget.style.color = "#000000";
                                }}
                                onClick={() => {
                                    navigate("/login");
                                }}
                            >
                                Ya tengo una cuenta
                            </button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
