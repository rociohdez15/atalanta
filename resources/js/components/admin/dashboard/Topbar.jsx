import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ApexCharts from "react-apexcharts";
import ReactApexChart2 from "react-apexcharts";
import { Outlet } from "react-router-dom";
import { Loader } from "lucide-react";

const Topbar = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    "/api/mensajes/obtener-mensajes",
                    {
                        withCredentials: true,
                    }
                );

                setMessages(response.data); // Asegúrate de que la estructura de datos sea la esperada
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    useEffect(() => {
        const link =
            document.querySelector("link[rel*='icon']") ||
            document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";
        link.href = "images/favicon.ico";
        document.getElementsByTagName("head")[0].appendChild(link);
    }, []);

    // Contar mensajes no leídos
    const unreadCount = messages.filter((message) => !message.is_read).length;

    const clearAllMessages = () => {
        // Vaciar el array de mensajes solo en el frontend
        setMessages([]);
    };

    const [showAll, setShowAll] = useState(false); // Para controlar la visualización de todos los mensajes

    // Controlar si se deben mostrar todos los mensajes o solo los primeros 4
    const displayedMessages = showAll ? messages : messages.slice(0, 4);

    const [notifications, setNotifications] = useState([]);
    const [loadingNotificaciones, setLoadingNotificaciones] = useState(true);
    const [errorNotificaciones, setErrorNotificaciones] = useState(null);
    const [verTodasNotificaciones, setVerTodasNotificaciones] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(
                    "/api/notificaciones/obtener-notificaciones",
                    { withCredentials: true } // importante si tu JWT está en cookie HTTP-only
                );
                setNotifications(response.data);
            } catch (err) {
                // Manejo correcto del error
                setErrorNotificaciones(
                    err.response?.data?.message || err.message
                );
            } finally {
                setLoadingNotificaciones(false);
            }
        };

        fetchNotifications();
    }, []);

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    const getNotificationText = (noti) => {
        const nombreCompleto = noti.cliente
            ? `${noti.cliente.nombre} ${noti.cliente.apellidos}`
            : "Alguien";
        switch (noti.tipo) {
            case "like":
                return `${nombreCompleto} ha dado like`;

            case "reseña":
                return `${nombreCompleto} ha dejado una reseña`;
            case "reserva":
                return `${nombreCompleto} ha realizado una reserva`;
            default:
                return `${nombreCompleto} ha realizado una acción`;
        }
    };

    const getNotificationIcon = (tipo) => {
        switch (tipo) {
            case "like":
                return {
                    icon: "mdi-heart",
                    bg: "bg-danger-subtle",
                    color: "text-danger",
                };
            case "reseña":
                return {
                    icon: "mdi-comment-account-outline",
                    bg: "bg-warning-subtle",
                    color: "text-warning",
                };
            case "reserva":
                return {
                    icon: "mdi-calendar-check",
                    bg: "bg-success-subtle",
                    color: "text-success",
                };
            default:
                return {
                    icon: "mdi-bell-outline",
                    bg: "bg-secondary-subtle",
                    color: "text-secondary",
                };
        }
    };

    const displayedNotifications = verTodasNotificaciones
        ? notifications
        : notifications.slice(0, 4);

    // Contar mensajes no leídos
    const unreadCountNoti = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const location = useLocation();

    // Carga inicial del usuario de localStorage o sessionStorage
    useEffect(() => {
        const storedUser =
            localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Escuchar cambios en localStorage/sessionStorage en otras pestañas
    useEffect(() => {
        const onStorageChange = () => {
            const updatedUser =
                localStorage.getItem("user") || sessionStorage.getItem("user");
            if (updatedUser) {
                setUser(JSON.parse(updatedUser));
            } else {
                setUser(null);
            }
        };
        window.addEventListener("storage", onStorageChange);
        return () => window.removeEventListener("storage", onStorageChange);
    }, []);

    const toggleMenu = () => setIsNavOpen((prev) => !prev);
    const closeMenu = () => setIsNavOpen(false);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            // crea este endpoint en backend
            method: "POST",
            credentials: "include",
        });

        setUser(null);
        navigate("/login");
        closeMenu();
    };

    const [verTodos, setVerTodos] = useState(false);

    return (
        <div className="navbar-custom bg-white">
            <div className="topbar container-fluid">
                <div className="d-flex align-items-center gap-1">
                    {/* Horizontal Menu Toggle Button */}
                    <button
                        className="navbar-toggle"
                        data-bs-toggle="collapse"
                        data-bs-target="#topnav-menu-content"
                    >
                        <div className="lines">
                            <span />
                            <span />
                            <span />
                        </div>
                    </button>
                </div>
                <ul className="topbar-menu d-flex align-items-center gap-3">
                    <li className="dropdown d-lg-none">
                        <a
                            className="nav-link dropdown-toggle arrow-none"
                            data-bs-toggle="dropdown"
                            href="https://techzaa.in/velonic/layouts/index.html#"
                            role="button"
                            aria-haspopup="false"
                            aria-expanded="false"
                        >
                            <i className="ri-search-line fs-22" />
                        </a>
                        <div className="dropdown-menu dropdown-menu-animated dropdown-lg p-0">
                            <form className="p-3">
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Search ..."
                                    aria-label="Recipient's username"
                                />
                            </form>
                        </div>
                    </li>

                    <li className="dropdown notification-list">
                        <a
                            className="nav-link dropdown-toggle arrow-none"
                            data-bs-toggle="dropdown"
                            href="https://techzaa.in/velonic/layouts/index.html#"
                            role="button"
                            aria-haspopup="false"
                            aria-expanded="false"
                        >
                            <i className="ri-mail-line fs-22" />
                            <span className="noti-icon-badge badge text-bg-purple">
                                {loading ? (
                                    <div
                                        className="d-flex justify-content-center align-items-center"
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                        }}
                                    >
                                        <Loader
                                            size={14}
                                            className="spin"
                                            color="#ffffff"
                                        />
                                    </div>
                                ) : (
                                    unreadCount
                                )}
                            </span>
                        </a>
                        <div className="dropdown-menu dropdown-menu-end dropdown-menu-animated dropdown-lg py-0">
                            <div className="p-2 border-top-0 border-start-0 border-end-0 border-dashed border">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <h6 className="m-0 fs-16 fw-semibold">
                                            Mensajes
                                        </h6>
                                    </div>
                                    <div className="col-auto">
                                        <button
                                            onClick={clearAllMessages}
                                            className="text-dark text-decoration-underline"
                                            style={{
                                                background: "none",
                                                border: "none",
                                            }}
                                        >
                                            <small>Limpiar Todo</small>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{ maxHeight: 300 }}
                                data-simplebar="init"
                            >
                                <div className="simplebar-content">
                                    {loading ? (
                                        <div className="text-center text-muted">
                                            Cargando mensajes...
                                        </div>
                                    ) : error ? (
                                        <div className="text-center text-danger">
                                            {error}
                                        </div>
                                    ) : messages.length > 0 ? (
                                        displayedMessages.map((message) => (
                                            <a
                                                key={message.id}
                                                href="javascript:void(0);"
                                                className={`dropdown-item p-0 notify-item is_read-noti card m-0 shadow-none ${
                                                    !message.is_read
                                                        ? "new-message"
                                                        : ""
                                                }`} // Aplica la clase "new-message" si el mensaje no ha sido leído
                                                style={{
                                                    backgroundColor:
                                                        !message.is_read
                                                            ? "#f0f0f0"
                                                            : "transparent", // Gris claro para mensajes no leídos
                                                    boxShadow: !message.is_read
                                                        ? "0 0 10px rgba(0, 0, 0, 0.1)"
                                                        : "none", // Sombra sutil
                                                    position: "relative", // Necesario para posicionar el punto
                                                    paddingLeft: "25px", // Añadido espacio para el punto
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        position: "absolute", // Para posicionar el punto
                                                        left: "10px", // Distancia desde la izquierda
                                                        top: "50%", // Centrar el punto verticalmente
                                                        transform:
                                                            "translateY(-50%)", // Ajustar para centrar exactamente
                                                        width: "8px", // Tamaño del punto
                                                        height: "8px", // Tamaño del punto
                                                        backgroundColor:
                                                            !message.is_read
                                                                ? "#007bff"
                                                                : "#ccc", // Color según si está leído
                                                        borderRadius: "50%", // Hacerlo redondo
                                                    }}
                                                />
                                                <div className="card-body">
                                                    <div className="d-flex align-items-center">
                                                        <div className="flex-grow-1 text-truncate ms-2">
                                                            <h5 className="noti-item-title fw-semibold fs-14">
                                                                {message.nombre}{" "}
                                                                <small className="fw-normal text-muted float-end ms-1">
                                                                    {new Date(
                                                                        message.fecha
                                                                    ).toLocaleDateString()}
                                                                </small>
                                                            </h5>
                                                            <small className="noti-item-subtitle text-muted">
                                                                {
                                                                    message.mensaje
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                        ))
                                    ) : (
                                        <div className="text-center text-muted">
                                            No hay mensajes
                                        </div>
                                    )}
                                </div>
                            </div>
                            {messages.length > 4 && !showAll && (
                                <a
                                    href="/mensajes"
                                    className="dropdown-item text-center text-primary text-decoration-underline fw-bold notify-item border-top border-light py-2"
                                >
                                    Ver Todos
                                </a>
                            )}
                        </div>
                    </li>
                    <li className="dropdown notification-list">
                        <a
                            className="nav-link dropdown-toggle arrow-none"
                            data-bs-toggle="dropdown"
                            href="https://techzaa.in/velonic/layouts/index.html#"
                            role="button"
                            aria-haspopup="false"
                            aria-expanded="false"
                        >
                            <i className="ri-notification-3-line fs-22" />
                            <span className="noti-icon-badge badge text-bg-pink">
                                {loadingNotificaciones ? (
                                    <div
                                        className="d-flex justify-content-center align-items-center"
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                        }}
                                    >
                                        <Loader
                                            size={14}
                                            className="spin"
                                            color="#ffffff"
                                        />
                                    </div>
                                ) : (
                                    unreadCountNoti
                                )}
                            </span>
                        </a>
                        <div className="dropdown-menu dropdown-menu-end dropdown-menu-animated dropdown-lg py-0">
                            <div className="p-2 border-top-0 border-start-0 border-end-0 border-dashed border">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <h6 className="m-0 fs-16 fw-semibold">
                                            Notificaciones
                                        </h6>
                                    </div>
                                    <div className="col-auto">
                                        <button
                                            onClick={clearAllNotifications}
                                            className="text-dark text-decoration-underline"
                                            style={{
                                                background: "none",
                                                border: "none",
                                            }}
                                        >
                                            <small>Limpiar Todo</small>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{ maxHeight: 300 }}
                                data-simplebar="init"
                            >
                                <div
                                    className="simplebar-content"
                                    style={{ padding: 0 }}
                                >
                                    {loadingNotificaciones ? (
                                        <p className="text-center my-3">
                                            Cargando...
                                        </p>
                                    ) : errorNotificaciones ? (
                                        <p className="text-danger text-center my-3">
                                            Error: {errorNotificaciones}
                                        </p>
                                    ) : (
                                        displayedNotifications.map((noti) => {
                                            const { icon, bg, color } =
                                                getNotificationIcon(noti.tipo);
                                            return (
                                                <div
                                                    key={noti.id}
                                                    className={`dropdown-item notify-item card m-0 shadow-none ${
                                                        !noti.is_read
                                                            ? "new-noti"
                                                            : ""
                                                    }`}
                                                    style={{
                                                        backgroundColor:
                                                            !noti.is_read
                                                                ? "#f0f0f0"
                                                                : "transparent",
                                                        boxShadow: !noti.is_read
                                                            ? "0 0 10px rgba(0, 0, 0, 0.1)"
                                                            : "none",
                                                        position: "relative",
                                                        paddingLeft: "25px",
                                                        cursor: "default", // No pointer cursor
                                                    }}
                                                    onClick={(e) =>
                                                        e.preventDefault()
                                                    } // Evita acción al click
                                                >
                                                    {!noti.is_read && (
                                                        <div
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                left: "10px",
                                                                top: "50%",
                                                                transform:
                                                                    "translateY(-50%)",
                                                                width: "8px",
                                                                height: "8px",
                                                                backgroundColor:
                                                                    "#007bff",
                                                                borderRadius:
                                                                    "50%",
                                                            }}
                                                        />
                                                    )}
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className={`notify-icon ${bg}`}
                                                        >
                                                            {loadingNotificaciones ? (
                                                                <Loader
                                                                    size={12}
                                                                    color="#fff"
                                                                />
                                                            ) : (
                                                                <i
                                                                    className={`mdi ${icon} ${color}`}
                                                                ></i>
                                                            )}
                                                        </div>

                                                        <p
                                                            className="notify-details mb-0 ms-2"
                                                            style={{
                                                                whiteSpace:
                                                                    "normal",
                                                                wordBreak:
                                                                    "break-word",
                                                                lineHeight:
                                                                    "1.3",
                                                                marginBottom: 0,
                                                                fontSize:
                                                                    "0.8rem",
                                                            }}
                                                        >
                                                            {getNotificationText(
                                                                noti
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {notifications.length > 4 &&
                                !verTodasNotificaciones && (
                                    <a
                                        href="/notificaciones"
                                        className="dropdown-item text-center text-primary text-decoration-underline fw-bold notify-item border-top border-light py-2"
                                    >
                                        Ver Todos
                                    </a>
                                )}
                        </div>
                    </li>

                    <li className="dropdown">
                        <a
                            className="nav-link dropdown-toggle arrow-none nav-user"
                            data-bs-toggle="dropdown"
                            href="https://techzaa.in/velonic/layouts/index.html#"
                            role="button"
                            aria-haspopup="false"
                            aria-expanded="false"
                        >
                            <span className="account-user-avatar">
                                <i className="ri-account-circle-line fs-24 align-middle me-1" />
                                <i className="ri-arrow-down-s-line d-none d-sm-inline-block align-middle" />
                            </span>
                        </a>
                        <div className="dropdown-menu dropdown-menu-end dropdown-menu-animated profile-dropdown">
                            <button
                                onClick={handleLogout}
                                className="dropdown-item"
                            >
                                <i className="ri-logout-box-line fs-18 align-middle me-1" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Topbar;
