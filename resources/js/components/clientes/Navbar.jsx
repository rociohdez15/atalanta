import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp && payload.exp < Math.floor(Date.now() / 1000);
    } catch {
        return true;
    }
}

const LanguageFlags = () => (
    <div className="d-flex align-items-center gap-2 me-3">
        <img
            src="/images/flags/es.png"
            alt="Español"
            title="Español"
            style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                objectFit: "cover",
            }}
        />
        <img
            src="/images/flags/gb.jpg"
            alt="English"
            title="English"
            style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                objectFit: "cover",
            }}
        />
    </div>
);

const Navbar = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Detectar scroll
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const refreshToken = async () => {
        try {
            const res = await fetch("/api/auth/refresh", {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) throw new Error("No se pudo refrescar el token");

            const data = await res.json();
            setUser(data.user);
            return true;
        } catch {
            setUser(null);
            return false;
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                let res = await fetch("/api/auth/yo", {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    const refreshed = await refreshToken();
                    if (!refreshed) {
                        setUser(null);
                        setLoadingUser(false);
                        return;
                    }
                    return;
                }

                const data = await res.json();
                setUser(data.user);
            } catch {
                setUser(null);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, []);

    const toggleMenu = () => setIsNavOpen((prev) => !prev);
    const closeMenu = () => setIsNavOpen(false);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });

        setUser(null);
        navigate("/login");
        closeMenu();
    };

    const isHome = pathname === "/";

    return (
        <header
            className="u-header fixed-top"
            style={{
                backgroundColor: isHome
                    ? isScrolled
                        ? "#000000"
                        : "transparent"
                    : "#000000",
                width: "100%",
                left: 0,
                right: 0,
                padding: "0.25rem 1rem",
                height: "80px",
                display: "flex",
                alignItems: "center",
                zIndex: 999,
            }}
        >
            <div className="container-fluid d-flex justify-content-between align-items-center flex-wrap">
                {/* Logo */}
                <Link to="/" className="u-image u-logo ms-3">
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                            src="/images/logo_atalanta1.png"
                            alt="Logo"
                            style={{
                                width: "70px",
                                height: "70px",
                                borderRadius: "10%",
                                marginTop: "0px",
                            }}
                        />
                        <img
                            src="/images/titulo_atalanta1.png"
                            alt="Logo Texto"
                            style={{
                                width: "110px",
                                height: "30px",
                                objectFit: "contain",
                                marginLeft: "-15px",
                                marginTop: "0px",
                            }}
                        />
                    </div>
                </Link>

                {/* Botón hamburguesa mobile */}
                <button
                    className="d-lg-none btn"
                    onClick={toggleMenu}
                    style={{
                        backgroundColor: "#ffffff",
                        borderColor: "#ffffff",
                    }}
                >
                    {isNavOpen ? (
                        <X color="#000000" size={24} />
                    ) : (
                        <Menu color="#000000" size={24} />
                    )}
                </button>

                {/* Menú mobile */}
                <div
                    className={`d-lg-none position-absolute top-100 start-0 w-100 ${
                        isNavOpen ? "d-block" : "d-none"
                    }`}
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        marginTop: "0.5rem",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        paddingBottom: "1rem",
                    }}
                >
                    <ul className="navbar-nav text-center p-0 mb-1">
                        {/* Flags */}
                        <li className="nav-item d-flex justify-content-center my-2 gap-2">
                            <img
                                src="/images/flags/es.png"
                                alt="Español"
                                title="Español"
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                            <img
                                src="/images/flags/gb.jpg"
                                alt="English"
                                title="English"
                                style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                        </li>

                        {/* Enlaces principales */}
                        <li className="nav-item">
                            <Link
                                to="/"
                                className="nav-link p-nosotros"
                                onClick={closeMenu}
                                style={{
                                    color: "#000000",
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                Inicio
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                to="/contacto"
                                className="nav-link p-nosotros"
                                onClick={closeMenu}
                                style={{
                                    color: "#000000",
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                Contacto
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                to="/colaboraciones"
                                className="nav-link p-nosotros"
                                onClick={closeMenu}
                                style={{
                                    color: "#000000",
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                Colaboraciones
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                to="/descuentos"
                                className="nav-link p-nosotros"
                                onClick={closeMenu}
                                style={{
                                    color: "#000000",
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                Descuentos
                            </Link>
                        </li>

                        <li
                            className="border-top"
                            style={{
                                borderColor: "#000000",
                                margin: "0.5rem auto",
                                width: "90%",
                            }}
                        ></li>

                        {/* User / Login */}
                        {loadingUser ? (
                            <li className="nav-item text-center my-2">
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                    style={{ width: "24px", height: "24px" }}
                                >
                                    <span className="visually-hidden">
                                        Cargando...
                                    </span>
                                </div>
                            </li>
                        ) : user ? (
                            <>
                                <li className="nav-item">
                                    <Link
                                        to="/profile"
                                        className="nav-link p-nosotros"
                                        onClick={closeMenu}
                                        style={{
                                            backgroundColor: "#ffffff",
                                            color: "#000000",
                                            borderColor: "#ffffff",
                                            fontSize: "16px",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        <User size={18} className="me-2" /> Ver
                                        perfil
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className="nav-link p-nosotros btn w-100 text-center"
                                        onClick={handleLogout}
                                        style={{
                                            backgroundColor: "#ffffff",
                                            color: "#000000",
                                            borderColor: "#ffffff",
                                            fontSize: "16px",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        <LogOut size={18} className="me-2" />{" "}
                                        Cerrar sesión
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link
                                    to="/login"
                                    className="nav-link p-nosotros"
                                    onClick={closeMenu}
                                    style={{
                                        color: "#ffffff",
                                        backgroundColor: "#000000",
                                        margin: "0.5rem auto",
                                        width: "90%",
                                        borderRadius: "12px",
                                        fontFamily: "Inter, sans-serif",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "0.5rem",
                                    }}
                                >
                                    Iniciar sesión
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Menú desktop */}
                <div className="d-none d-lg-flex flex-grow-1 align-items-center">
                    <ul className="navbar-nav d-flex flex-row">
                        <li className="nav-item px-2">
                            <Link
                                to="/"
                                className="nav-link p-nosotros"
                                onClick={closeMenu}
                                style={{
                                    color: "#ffffff",
                                    fontSize: "15px",
                                    marginTop: "5px",
                                    fontFamily: "Inter, sans-serif",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = "#d5d2d2")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = "#ffffff")
                                }
                            >
                                Inicio
                            </Link>
                        </li>
                        <li className="nav-item px-2">
                            <Link
                                to="/contacto"
                                className="nav-link p-nosotros"
                                onClick={closeMenu}
                                style={{
                                    color: "#ffffff",
                                    fontSize: "15px",
                                    marginTop: "5px",
                                    fontFamily: "Inter, sans-serif",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = "#d5d2d2")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = "#ffffff")
                                }
                            >
                                Contacto
                            </Link>
                        </li>
                        <li className="nav-item px-2">
                            <Link
                                to="/colaboraciones"
                                className="nav-link p-nosotros"
                                onClick={closeMenu}
                                style={{
                                    color: "#ffffff",
                                    fontSize: "15px",
                                    marginTop: "5px",
                                    fontFamily: "Inter, sans-serif",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = "#d5d2d2")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = "#ffffff")
                                }
                            >
                                Colaboraciones
                            </Link>
                        </li>
                        <li className="nav-item px-2">
                            <Link
                                to="/descuentos"
                                className="nav-link p-nosotros"
                                onClick={closeMenu}
                                style={{
                                    color: "#ffffff",
                                    fontSize: "15px",
                                    marginTop: "5px",
                                    fontFamily: "Inter, sans-serif",
                                    marginRight: "70px",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = "#d5d2d2")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = "#ffffff")
                                }
                            >
                                Descuentos
                            </Link>
                        </li>
                    </ul>

                    {/* Botón a la derecha */}
                    <div className="ms-auto d-flex align-items-center">
                        <LanguageFlags />

                        {loadingUser ? (
                            <div
                                className="spinner-border spinner-border-sm text-white"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Cargando...
                                </span>
                            </div>
                        ) : user ? (
                            <div className="dropdown">
                                <button
                                    className="btn p-nosotros btn-outline-primary dropdown-toggle rounded-2"
                                    data-bs-toggle="dropdown"
                                    style={{
                                        backgroundColor: "#ffffff",
                                        color: "#000000",
                                        borderColor: "#ffffff",
                                        fontSize: "12px",
                                        fontFamily: "Inter, sans-serif",
                                    }}
                                >
                                    <User size={18} className="me-2" />
                                    {user.name}
                                </button>

                                <ul
                                    className="dropdown-menu dropdown-menu-end"
                                    style={{
                                        backgroundColor: "#ffffff",
                                        color: "#000000",
                                        borderColor: "#ffffff",
                                        fontSize: "12px",
                                        fontFamily: "Inter, sans-serif",
                                    }}
                                >
                                    <li>
                                        <Link
                                            to="/profile"
                                            className="dropdown-item p-nosotros"
                                            style={{ fontSize: "12px" }}
                                        >
                                            <User size={18} className="me-2" />
                                            Ver perfil
                                        </Link>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item p-nosotros"
                                            onClick={handleLogout}
                                            style={{ fontSize: "12px" }}
                                        >
                                            <LogOut
                                                size={18}
                                                className="me-2"
                                            />
                                            Cerrar sesión
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="btn rounded-top-2 p-nosotros"
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
                            >
                                Iniciar sesión
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
