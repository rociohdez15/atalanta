import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";

const Leftsidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname.startsWith(path);

    const [isOpen, setIsOpen] = useState(false); // Control sidebar en móvil

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button
                onClick={toggleSidebar}
                className="sidebar-toggle-btn"
                aria-label="Toggle Sidebar"
                style={{ backgroundColor: "#000000" }}
            >
                <i className="ri-menu-line" style={{ fontSize: "24px" }}></i>
            </button>
            <div
                className={`leftside-menu menuitem-active ${
                    isOpen ? "open" : ""
                }`}
            >
                {/* Brand Logo Light */}
                {/* Brand Logo Light actualizado */}
                <Link to="/dashboard-admin" className="u-image u-logo ms-3">
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                            src="/images/logo_atalanta1.png" // logo principal
                            alt="Logo"
                            style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "10%",
                                marginTop: "10px",
                            }}
                        />
                        <img
                            src="/images/titulo_atalanta1.png" // texto del logo
                            alt="Logo Texto"
                            style={{
                                width: "110px",
                                height: "30px",
                                objectFit: "contain",
                                marginLeft: "-15px",
                                marginTop: "7px",
                            }}
                        />
                    </div>
                </Link>

                {/* Sidebar -left */}
                <div
                    className=" show"
                    id="leftside-menu-container"
                    data-simplebar="init"
                    style={{ backgroundColor: "#000000" }}
                >
                    <div className="simplebar-wrapper" style={{ margin: 0 }}>
                        <div className="simplebar-height-auto-observer-wrapper">
                            <div className="simplebar-height-auto-observer" />
                        </div>
                        <div className="simplebar-mask">
                            <div
                                className="simplebar-offset"
                                style={{ right: 0, bottom: 0 }}
                            >
                                <div
                                    className="simplebar-content-wrapper text-white"
                                    tabIndex={0}
                                    role="region"
                                    aria-label="scrollable content"
                                    style={{ height: "100%", overflow: "auto" }}
                                >
                                    <div
                                        className="simplebar-content"
                                        style={{ padding: "0 0 80px 0" }}
                                    >
                                        {/*- Sidemenu */}
                                        <ul className="side-nav">
                                            <li className="side-nav-item menuitem-active">
                                                <Link
                                                    to="/dashboard-admin"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/dashboard-admin",
                                                        )
                                                            ? "active-link"
                                                            : ""
                                                    }`}
                                                >
                                                    <i className="ri-dashboard-3-line" />
                                                    <span
                                                        style={{
                                                            fontWeight: 400,
                                                        }}
                                                    >
                                                        {" "}
                                                        Dashboard{" "}
                                                    </span>
                                                </Link>
                                            </li>

                                            <li className="side-nav-item menuitem-active">
                                                <Link
                                                    to="/resenas"
                                                    className={`side-nav-link ${
                                                        isActive("/resenas")
                                                            ? "active-link"
                                                            : ""
                                                    }`}
                                                >
                                                    <i className="ri-chat-3-line" />
                                                    <span
                                                        style={{
                                                            fontWeight: 400,
                                                        }}
                                                    >
                                                        {" "}
                                                        Reseñas{" "}
                                                    </span>
                                                </Link>
                                            </li>
                                            <li className="side-nav-item menuitem-active">
                                                <Link
                                                    to="/publicidad"
                                                    className={`side-nav-link ${
                                                        isActive("/publicidad")
                                                            ? "active-link"
                                                            : ""
                                                    }`}
                                                >
                                                    <i className="bi bi-megaphone" />
                                                    <span
                                                        style={{
                                                            fontWeight: 400,
                                                        }}
                                                    >
                                                        {" "}
                                                        Publicidad{" "}
                                                    </span>
                                                </Link>
                                            </li>

                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarCampanas"
                                                    aria-expanded={
                                                        isActive(
                                                            "/listado-campanas",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-campanas",
                                                        )
                                                    }
                                                    aria-controls="sidebarCampanas"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/listado-campanas",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-campanas",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-advertisement-line" />
                                                    <span> Campañas </span>
                                                    <span className="menu-arrow" />
                                                </a>

                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/listado-campanas",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-campanas",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarCampanas"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/listado-campanas"
                                                                className={
                                                                    isActive(
                                                                        "/listado-campanas",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Listado de
                                                                campañas
                                                            </Link>
                                                        </li>

                                                        <li>
                                                            <Link
                                                                to="/agregar-campanas"
                                                                className={
                                                                    isActive(
                                                                        "/agregar-campanas",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Agregar campaña
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>
                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarProveedores"
                                                    aria-expanded={
                                                        isActive(
                                                            "/listado-proveedores",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-proveedores",
                                                        )
                                                    }
                                                    aria-controls="sidebarProveedores"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/listado-proveedores",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-proveedores",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-truck-line" />
                                                    <span> Proveedores </span>
                                                    <span className="menu-arrow" />
                                                </a>

                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/listado-proveedores",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-proveedores",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarProveedores"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/listado-proveedores"
                                                                className={
                                                                    isActive(
                                                                        "/listado-proveedores",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Listado de
                                                                proveedores
                                                            </Link>
                                                        </li>

                                                        <li>
                                                            <Link
                                                                to="/agregar-proveedores"
                                                                className={
                                                                    isActive(
                                                                        "/agregar-proveedores",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Agregar
                                                                proveedor
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>

                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarHoteles"
                                                    aria-expanded={
                                                        isActive(
                                                            "/listado-hoteles",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-hoteles",
                                                        )
                                                    }
                                                    aria-controls="sidebarHoteles"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/listado-hoteles",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-hoteles",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-hotel-line" />
                                                    <span> Hoteles </span>
                                                    <span className="menu-arrow" />
                                                </a>

                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/listado-hoteles",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-hoteles",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarHoteles"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/listado-hoteles"
                                                                className={
                                                                    isActive(
                                                                        "/listado-hoteles",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Listado de
                                                                hoteles
                                                            </Link>
                                                        </li>

                                                        <li>
                                                            <Link
                                                                to="/agregar-hoteles"
                                                                className={
                                                                    isActive(
                                                                        "/agregar-hoteles",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Agregar hotel
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>

                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarClientes"
                                                    aria-expanded={
                                                        isActive(
                                                            "/listado-clientes",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-cliente",
                                                        )
                                                    }
                                                    aria-controls="sidebarClientes"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/listado-clientes",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-cliente",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-group-line" />
                                                    <span> Clientes </span>
                                                    <span className="menu-arrow" />
                                                </a>

                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/listado-clientes",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-cliente",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarClientes"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/listado-clientes"
                                                                className={
                                                                    isActive(
                                                                        "/listado-clientes",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Listado de
                                                                clientes
                                                            </Link>
                                                        </li>

                                                        <li>
                                                            <Link
                                                                to="/agregar-cliente"
                                                                className={
                                                                    isActive(
                                                                        "/agregar-cliente",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Agregar cliente
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>
                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarColaboraciones"
                                                    aria-expanded={
                                                        isActive(
                                                            "/listado-colaboraciones",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-colaboracion",
                                                        )
                                                    }
                                                    aria-controls="sidebarColaboraciones"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/listado-colaboraciones",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-colaboracion",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-team-line" />
                                                    <span>
                                                        {" "}
                                                        Colaboraciones{" "}
                                                    </span>
                                                    <span className="menu-arrow" />
                                                </a>
                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/listado-colaboraciones",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-colaboracion",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarColaboraciones"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/listado-colaboraciones"
                                                                className={
                                                                    isActive(
                                                                        "/listado-colaboraciones",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Todas las
                                                                colaboraciones
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to="/agregar-colaboracion"
                                                                className={
                                                                    isActive(
                                                                        "/agregar-colaboracion",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Agregar
                                                                colaboración
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>
                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarDescuentos"
                                                    aria-expanded={
                                                        isActive(
                                                            "/listado-descuentos",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-descuentos",
                                                        )
                                                    }
                                                    aria-controls="sidebarDescuentos"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/listado-descuentos",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-descuentos",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-price-tag-3-line" />
                                                    <span> Descuentos </span>
                                                    <span className="menu-arrow" />
                                                </a>
                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/listado-descuentos",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-descuentos",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarDescuentos"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/listado-descuentos"
                                                                className={
                                                                    isActive(
                                                                        "/listado-descuentos",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Todos los
                                                                descuentos
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to="/agregar-descuentos"
                                                                className={
                                                                    isActive(
                                                                        "/agregar-descuentos",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Agregar
                                                                descuento
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>
                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarFacturas"
                                                    aria-expanded={
                                                        isActive(
                                                            "/facturas-clientes",
                                                        ) ||
                                                        isActive(
                                                            "/facturas-proveedores",
                                                        )
                                                    }
                                                    aria-controls="sidebarFacturas"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/facturas-clientes",
                                                        ) ||
                                                        isActive(
                                                            "/facturas-proveedores",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-pages-line" />
                                                    <span> Facturas </span>
                                                    <span className="menu-arrow" />
                                                </a>
                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/facturas-clientes",
                                                        ) ||
                                                        isActive(
                                                            "/facturas-proveedores",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarFacturas"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/facturas-clientes"
                                                                className={
                                                                    isActive(
                                                                        "/facturas-clientes",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Facturas
                                                                clientes
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to="/facturas-atalanta"
                                                                className={
                                                                    isActive(
                                                                        "/facturas-atalanta",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Facturas
                                                                Atalanta
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>

                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarPagesAuth"
                                                    aria-expanded={
                                                        isActive(
                                                            "/paquetes-listado",
                                                        ) ||
                                                        isActive(
                                                            "/paquetes-agregar",
                                                        )
                                                    }
                                                    aria-controls="sidebarPagesAuth"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/paquetes-listado",
                                                        ) ||
                                                        isActive(
                                                            "/paquetes-agregar",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-earth-line" />
                                                    <span> Paquetes </span>
                                                    <span className="menu-arrow" />
                                                </a>
                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/paquetes-listado",
                                                        ) ||
                                                        isActive(
                                                            "/paquetes-agregar",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarPagesAuth"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/paquetes-listado"
                                                                className={
                                                                    isActive(
                                                                        "/paquetes-listado",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Listado de
                                                                experiencias
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to="/paquetes-agregar"
                                                                className={
                                                                    isActive(
                                                                        "/paquetes-agregar",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Agregar
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>

                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarLayouts"
                                                    aria-expanded={
                                                        isActive(
                                                            "/blog-listado",
                                                        ) ||
                                                        isActive(
                                                            "/blog-agregar",
                                                        )
                                                    }
                                                    aria-controls="sidebarLayouts"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/blog-listado",
                                                        ) ||
                                                        isActive(
                                                            "/blog-agregar",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-layout-line" />
                                                    <span> Blog </span>
                                                    <span className="menu-arrow" />
                                                </a>

                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/blog-listado",
                                                        ) ||
                                                        isActive(
                                                            "/blog-agregar",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarLayouts"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/blog-listado"
                                                                className={
                                                                    isActive(
                                                                        "/blog-listado",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Listado
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to="/blog-agregar"
                                                                className={
                                                                    isActive(
                                                                        "/blog-agregar",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Agregar entradas
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>

                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarBaseUI"
                                                    aria-expanded={
                                                        isActive(
                                                            "/reservas-confirmadas",
                                                        ) ||
                                                        isActive(
                                                            "/reservas-pendientes",
                                                        ) ||
                                                        isActive(
                                                            "/reservas-canceladas",
                                                        )
                                                    }
                                                    aria-controls="sidebarBaseUI"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/reservas-confirmadas",
                                                        ) ||
                                                        isActive(
                                                            "/reservas-pendientes",
                                                        ) ||
                                                        isActive(
                                                            "/reservas-canceladas",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-briefcase-line" />
                                                    <span> Reservas </span>
                                                    <span className="menu-arrow" />
                                                </a>
                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/reservas-confirmadas",
                                                        ) ||
                                                        isActive(
                                                            "/reservas-pendientes",
                                                        ) ||
                                                        isActive(
                                                            "/crear-reserva",
                                                        ) ||
                                                        isActive(
                                                            "/reservas-canceladas",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarBaseUI"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/crear-reserva"
                                                                className={
                                                                    isActive(
                                                                        "/crear-reserva",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Crear reserva
                                                            </Link>
                                                            <Link
                                                                to="/reservas-confirmadas"
                                                                className={
                                                                    isActive(
                                                                        "/reservas-confirmadas",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Confirmadas
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to="/reservas-pendientes"
                                                                className={
                                                                    isActive(
                                                                        "/reservas-pendientes",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Pendientes
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to="/reservas-canceladas"
                                                                className={
                                                                    isActive(
                                                                        "/reservas-canceladas",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Canceladas
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>

                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarExtendedUI"
                                                    aria-expanded={
                                                        isActive("/admin") ||
                                                        isActive("/admin-alta")
                                                    }
                                                    aria-controls="sidebarExtendedUI"
                                                    className={`side-nav-link ${
                                                        isActive("/admin") ||
                                                        isActive("/admin-alta")
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-user-line" />
                                                    <span>
                                                        {" "}
                                                        Administradores{" "}
                                                    </span>
                                                    <span className="menu-arrow" />
                                                </a>
                                                <div
                                                    className={`collapse ${
                                                        isActive("/admin") ||
                                                        isActive("/admin-alta")
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarExtendedUI"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/admin-todos"
                                                                className={`${
                                                                    isActive(
                                                                        "/admin-todos",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }`}
                                                            >
                                                                Todos
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to="/admin-alta"
                                                                className={`${
                                                                    isActive(
                                                                        "/admin-alta",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }`}
                                                            >
                                                                Alta Usuarios
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>

                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarIcons"
                                                    aria-expanded={
                                                        isActive(
                                                            "/eventos-todos",
                                                        ) ||
                                                        isActive(
                                                            "/crear-eventos",
                                                        )
                                                    }
                                                    aria-controls="sidebarIcons"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/eventos-todos",
                                                        ) ||
                                                        isActive(
                                                            "/crear-eventos",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-pencil-ruler-2-line" />
                                                    <span> Eventos </span>
                                                    <span className="menu-arrow" />
                                                </a>
                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/eventos-todos",
                                                        ) ||
                                                        isActive(
                                                            "/crear-eventos",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarIcons"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/eventos-todos"
                                                                className={
                                                                    isActive(
                                                                        "/eventos-todos",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Listado
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to="/crear-eventos"
                                                                className={
                                                                    isActive(
                                                                        "/crear-eventos",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Agregar eventos
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>

                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarMessages"
                                                    aria-expanded={isActive(
                                                        "/mensajes",
                                                    )}
                                                    aria-controls="sidebarMessages"
                                                    className={`side-nav-link ${
                                                        isActive("/mensajes")
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-message-3-line" />
                                                    <span> Mensajes </span>
                                                    <span className="menu-arrow" />
                                                </a>
                                                <div
                                                    className={`collapse ${
                                                        isActive("/mensajes")
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarMessages"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/mensajes"
                                                                className={
                                                                    isActive(
                                                                        "/mensajes",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Todos los
                                                                mensajes
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>

                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarNotifications"
                                                    aria-expanded={isActive(
                                                        "/notificaciones",
                                                    )}
                                                    aria-controls="sidebarNotifications"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/notificaciones",
                                                        )
                                                            ? "active-link"
                                                            : ""
                                                    }`}
                                                >
                                                    <i className="ri-notification-3-line" />
                                                    <span>
                                                        {" "}
                                                        Notificaciones{" "}
                                                    </span>
                                                    <span className="menu-arrow" />
                                                </a>
                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/notificaciones",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarNotifications"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/notificaciones"
                                                                className={
                                                                    isActive(
                                                                        "/notificaciones",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Todas las
                                                                notificaciones
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>

                                            <li className="side-nav-item">
                                                <a
                                                    data-bs-toggle="collapse"
                                                    href="#sidebarGaleria"
                                                    aria-expanded={isActive(
                                                        "/galeria-listado",
                                                    )}
                                                    aria-controls="sidebarGaleria"
                                                    className={`side-nav-link ${
                                                        isActive(
                                                            "/galeria-listado",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-imagen",
                                                        )
                                                            ? "active-link"
                                                            : "collapsed"
                                                    }`}
                                                >
                                                    <i className="ri-image-line" />
                                                    <span> Galería </span>
                                                    <span className="menu-arrow" />
                                                </a>
                                                <div
                                                    className={`collapse ${
                                                        isActive(
                                                            "/galeria-listado",
                                                        ) ||
                                                        isActive(
                                                            "/agregar-imagen",
                                                        )
                                                            ? "show"
                                                            : ""
                                                    }`}
                                                    id="sidebarGaleria"
                                                >
                                                    <ul className="side-nav-second-level">
                                                        <li>
                                                            <Link
                                                                to="/galeria-listado"
                                                                className={
                                                                    isActive(
                                                                        "/galeria-listado",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Listado de
                                                                imágenes
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to="/agregar-imagen"
                                                                className={
                                                                    isActive(
                                                                        "/agregar-imagen",
                                                                    )
                                                                        ? "active-link2"
                                                                        : ""
                                                                }
                                                            >
                                                                Agregar imagen
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </li>
                                        </ul>
                                        {/*- End Sidemenu */}
                                        <div className="clearfix" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="simplebar-placeholder"
                            style={{
                                width: "auto",
                                height: 900,
                                backgroundColor: "#000000",
                            }}
                        />
                    </div>
                    <div
                        className="simplebar-track simplebar-horizontal"
                        style={{
                            visibility: "hidden",
                            backgroundColor: "#000000",
                        }}
                    >
                        <div
                            className="simplebar-scrollbar"
                            style={{
                                width: 0,
                                display: "none",
                                transform: "translate3d(0px, 0px, 0px)",
                                backgroundColor: "#000000",
                            }}
                        />
                    </div>
                    <div
                        className="simplebar-track simplebar-vertical"
                        style={{
                            visibility: "hidden",
                            backgroundColor: "#000000",
                        }}
                    >
                        <div
                            className="simplebar-scrollbar"
                            style={{
                                height: 0,
                                transform: "translate3d(0px, 0px, 0px)",
                                display: "none",
                            }}
                        />
                    </div>
                </div>
                <style>{`
  /* Botón toggle solo visible en pantallas pequeñas */
  .sidebar-toggle-btn {
    display: none;
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 1050;
    background:  #000000;
    border: none;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
  }

  /* Mostrar botón toggle en pantallas menores a 992px */
  @media (max-width: 991px) {
    .sidebar-toggle-btn {
      display: block;
    }

    /* Sidebar hidden by default in small screens */
    .leftside-menu {
      position: fixed;
      top: 0;
      left: 0;
      width: 260px;
      height: 100vh;
      background-color:  #000000;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 1040;
      overflow-y: auto;
    }

    /* Cuando está abierto */
    .leftside-menu.open {
      transform: translateX(0);
    }

    /* En móvil, contenido ocupa todo el ancho */
    .main-content {
      margin-left: 0;
      transition: margin-left 0.3s ease;
    }
  }

  /* En pantallas grandes mostrar sidebar siempre y ajustar contenido */
  @media (min-width: 992px) {
    .leftside-menu {
      position: fixed; /* fijo a la izquierda */
      top: 0;
      left: 0;
      width: 260px;
      height: 100vh;
      background-color:  #000000;
      overflow-y: auto;
      transform: none !important;
      transition: none !important;
      z-index: 1040;
    }

    .main-content {
      margin-left: 260px; /* espacio para sidebar */
      transition: margin-left 0.3s ease;
    }
  }
`}</style>
            </div>
        </>
    );
};

export default Leftsidebar;
