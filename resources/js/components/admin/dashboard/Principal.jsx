import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ApexCharts from "react-apexcharts";
import ReactApexChart2 from "react-apexcharts";
import { Outlet } from "react-router-dom";
import { Loader } from "lucide-react";

const Principal = () => {
    /* Hacer una solicitud a la API para saber el número total de proveedores. */
    const [totalProveedores, setTotalProveedores] = useState(null);

    useEffect(() => {
        const fetchTotalProveedores = async () => {
            try {
                const response = await axios.get(
                    "/api/admin/total-proveedores",
                );
                setTotalProveedores(
                    response.data.totalProveedores ?? response.data,
                ); // Por si devuelves un JSON o solo el número
            } catch (error) {
                console.error("");
            }
        };

        fetchTotalProveedores();
    }, []);

    /* Hacer una solicitud a la API para saber la cantidad de ingresos de esta semana. */
    const [totalIngresosSemanaActual, setTotalIngresosSemanaActual] =
        useState(null);

    useEffect(() => {
        const fetchTotalIngresosSemanaActual = async () => {
            try {
                const response = await axios.get(
                    "/api/admin/ingresos-semana-actual",
                );
                setTotalIngresosSemanaActual(
                    response.data.totalIngresosSemanaActual ?? response.data,
                ); // Por si devuelves un JSON o solo el número
            } catch (error) {
                console.error("");
            }
        };

        fetchTotalIngresosSemanaActual();
    }, []);

    /* Hacer una solicitud a la API para saber la cantidad de ingresos de esta semana. */
    const [totalIngresosSemanaAnterior, setTotalIngresosSemanaAnterior] =
        useState(null);

    useEffect(() => {
        const fetchTotalIngresosSemanaAnterior = async () => {
            try {
                const response = await axios.get(
                    "/api/admin/ingresos-semana-anterior",
                );
                setTotalIngresosSemanaAnterior(
                    response.data.totalIngresosSemanaAnterior ?? response.data,
                ); // Por si devuelves un JSON o solo el número
            } catch (error) {
                console.error("");
            }
        };

        fetchTotalIngresosSemanaAnterior();
    }, []);
    /* Hacer una solicitud a la API para calcular el total de ingresos. */
    const [totalIngresos, setTotalIngresos] = useState(null);

    useEffect(() => {
        const fecthTotalIngresos = async () => {
            try {
                const response = await axios.get("/api/admin/total-ingresos");
                setTotalIngresos(response.data.totalIngresos ?? response.data); // Por si devuelves un JSON o solo el número
            } catch (error) {
                console.error("");
            }
        };

        fecthTotalIngresos();
    }, []);

    /* Hacer una solicitud a la API para calcular el número total de reservas. */
    const [totalReservas, setTotalReservas] = useState(null);

    useEffect(() => {
        const fecthTotalReservas = async () => {
            try {
                const response = await axios.get("/api/admin/total-reservas");
                setTotalReservas(response.data.totalReservas ?? response.data); // Por si devuelves un JSON o solo el número
            } catch (error) {
                console.error("");
            }
        };

        fecthTotalReservas();
    }, []);

    /* Hacer una solicitud a la API para calcular los ingresos del primer trimestre. */
    const [totalPrimerTrimestre, setTotalPrimerTrismestre] = useState(null);

    useEffect(() => {
        const fecthTotalPrimerTrismestre = async () => {
            try {
                const response = await axios.get(
                    "/api/admin/ingresos-primer-trimestre",
                );
                setTotalPrimerTrismestre(
                    response.data.totalPrimerTrismestre ?? response.data,
                ); // Por si devuelves un JSON o solo el número
            } catch (error) {
                console.error("");
            }
        };

        fecthTotalPrimerTrismestre();
    }, []);

    /* Hacer una solicitud a la API para calcular los ingresos del segundo trimestre. */
    const [totalSegundoTrimestre, setTotalSegundoTrismestre] = useState(null);

    useEffect(() => {
        const fecthTotalSegundoTrismestre = async () => {
            try {
                const response = await axios.get(
                    "/api/admin/ingresos-segundo-trimestre",
                );
                setTotalSegundoTrismestre(
                    response.data.totalSegundoTrimestre ?? response.data,
                ); // Por si devuelves un JSON o solo el número
            } catch (error) {
                console.error("");
            }
        };

        fecthTotalSegundoTrismestre();
    }, []);

    /* Hacer una solicitud a la API para calcular los ingresos del tercer trimestre. */
    const [totalTercerTrimestre, setTotalTercerTrismestre] = useState(null);

    useEffect(() => {
        const fecthTotalTercerTrismestre = async () => {
            try {
                const response = await axios.get(
                    "/api/admin/ingresos-tercer-trimestre",
                );
                setTotalTercerTrismestre(
                    response.data.totalTercerTrimestre ?? response.data,
                ); // Por si devuelves un JSON o solo el número
            } catch (error) {
                console.error("");
            }
        };

        fecthTotalTercerTrismestre();
    }, []);

    /* Hacer una solicitud a la API para calcular el número total de usuarios. */
    const [totalUsuarios, setTotalUsuarios] = useState(null);

    useEffect(() => {
        const fecthTotalUsuarios = async () => {
            try {
                const response = await axios.get("/api/admin/total-usuarios");
                setTotalUsuarios(response.data.totalUsuarios ?? response.data); // Por si devuelves un JSON o solo el número
            } catch (error) {
                console.error("");
            }
        };

        fecthTotalUsuarios();
    }, []);

    /*Gráfico de ingresos por semana.*/
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchIngresosYReservas = async () => {
            try {
                const response = await axios.get(
                    "/api/admin/ingresos-y-ventas-semana",
                );

                // Convertir las ventas de cadenas a números
                const ingresos = response.data.ingresos;
                const ventas = response.data.ventas.map((venta) =>
                    Number(venta),
                ); // Convertir ventas a números

                setData({
                    ingresos,
                    ventas,
                });
            } catch (error) {
                console.error("");
            }
        };

        fetchIngresosYReservas();
    }, []);

    // Configuración de los gráficos

    const opciones = {
        chart: {
            id: "grafico-semana",
            type: "bar",
            height: 350,
        },
        plotOptions: {
            bar: {
                horizontal: false, // Esto asegura que las barras sean verticales
                columnWidth: "50%", // Ajusta el ancho de las barras
                endingShape: "rounded", // Forma redondeada en los extremos
            },
        },
        stroke: {
            show: true,
            width: 3,
            colors: ["transparent"],
        },
        xaxis: {
            categories: [
                "Lunes",
                "Martes",
                "Miércoles",
                "Jueves",
                "Viernes",
                "Sábado",
                "Domingo",
            ],
        },
        title: {
            text: "Ingresos y Ventas por Día de la Semana",
            align: "center",
        },
        yaxis: [
            {
                title: {
                    text: "Ingresos (€)",
                },
            },
            {
                opposite: true,
                title: {
                    text: "Ventas",
                },
            },
        ],
        tooltip: {
            shared: true, // Esto hace que el tooltip sea común para ambas barras
            intersect: false,
        },
    };

    const series = data
        ? [
              {
                  name: "Ingresos",
                  data: data.ingresos,
              },
              {
                  name: "Ventas",
                  data: data.ventas,
              },
          ]
        : null;

    const [ventas, setVentas] = useState([]);
    const [meses, setMeses] = useState([]);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const response = await axios.get("/api/admin/ventas-anuales");

                const data = response.data;
                const labels = Object.keys(data); // ["enero", "febrero", ...]
                const valores = Object.values(data); // [10, 15, ...]

                setMeses(labels);
                setVentas(valores);
            } catch (error) {
                console.error("");
            }
        };

        fetchVentas();
    }, []);

    const opciones2 = {
        chart: {
            type: "line",
            height: 250,
        },
        xaxis: {
            categories: meses,
        },
        stroke: {
            curve: "smooth",
        },
        title: {
            text: "Ventas Anuales",
            align: "left",
        },
    };

    const series2 = [
        {
            name: "Ventas",
            data: ventas,
        },
    ];

    const getBadgeClass = (estado) => {
        switch (estado) {
            case "Completado":
                return "bg-info-subtle text-info";
            case "Pendiente":
                return "bg-pink-subtle text-pink";
            case "En Progreso":
                return "bg-purple-subtle text-purple";
            default:
                return "bg-secondary-subtle text-secondary";
        }
    };

    const [proyectos, setProyectos] = useState([]);

    useEffect(() => {
        axios
            .get("/api/admin/obtener-proyectos")
            .then((res) => setProyectos(res.data));
    }, []);

    const formatearFecha = (fecha) => {
        if (!fecha) return "";
        const dateObj = new Date(fecha);
        if (isNaN(dateObj)) return "";

        const dia = String(dateObj.getDate()).padStart(2, "0");
        const mes = String(dateObj.getMonth() + 1).padStart(2, "0");
        const anio = dateObj.getFullYear();

        return `${dia}/${mes}/${anio}`;
    };

    const [currentDate, setCurrentDate] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [eventos, setEventos] = useState([]);

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Obtener eventos del backend
    const [cargandoEventos, setCargandoEventos] = useState(true); // 👈 añade esto

    useEffect(() => {
        axios
            .get("/api/eventos/obtener-eventos")
            .then((response) => {
                const data = response.data;
                const grouped = {};

                data.forEach((evento) => {
                    const key = evento.fecha;
                    if (!grouped[key]) grouped[key] = [];
                    grouped[key].push(`${evento.nombre} - ${evento.hora}`);
                });

                setEventos(grouped);
                setCargandoEventos(false); // 👈 marca como cargado
            })
            .catch(() => {
                setCargandoEventos(false); // 👈 también en caso de error
            });
    }, []);

    // Generar los días del mes para mostrar en el calendario
    useEffect(() => {
        const days = [];
        const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < adjustedFirstDay; i++) {
            days.push("");
        }

        for (let i = 1; i <= totalDays; i++) {
            days.push(i);
        }

        setDaysInMonth(days);
    }, [currentMonth, currentYear]);

    // Manejar el cambio de mes
    const handlePrevMonth = () => {
        const newDate = new Date(currentYear, currentMonth - 1, 1);
        setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentYear, currentMonth + 1, 1);
        setCurrentDate(newDate);
    };

    // Función para obtener los eventos de un día específico
    const getEventosDelDia = (day) => {
        const key = `${currentYear}-${String(currentMonth + 1).padStart(
            2,
            "0",
        )}-${String(day).padStart(2, "0")}`;
        return eventos[key] || [];
    };

    const [verTodos, setVerTodos] = useState(false);

    return (
        <div className="content-page flex-grow-1">
            <div className="content">
                {/* Start Content*/}
                <div className="container-fluid">
                    {/* start page title */}
                    <div className="row">
                        <div className="col-12" style={{ marginLeft: "20px" }}>
                            <div className="page-title-box">
                                <h4 className="page-title">¡Bienvenido!</h4>
                            </div>
                        </div>
                    </div>
                    {/* end page title */}
                    <div className="row">
                        <div className="col-xxl-3 col-sm-6">
                            <div
                                className="card widget-flat text-bg-pink"
                                style={{ marginLeft: "20px" }}
                            >
                                <div className="card-body">
                                    <div className="float-end">
                                        <i className="ri-store-2-line widget-icon" />
                                    </div>
                                    <h6
                                        className="text-uppercase mt-0"
                                        title="Customers"
                                    >
                                        Total Proveedores
                                    </h6>
                                    <h2 className="my-2">
                                        {totalProveedores === null ? (
                                            <Loader
                                                size={32}
                                                className="spin"
                                                color="#ffffff"
                                            />
                                        ) : (
                                            totalProveedores
                                        )}
                                    </h2>
                                </div>
                            </div>
                        </div>{" "}
                        {/* end col*/}
                        <div className="col-xxl-3 col-sm-6">
                            <div className="card widget-flat text-bg-purple">
                                <div className="card-body">
                                    <div className="float-end">
                                        <i className="ri-wallet-2-line widget-icon" />
                                    </div>
                                    <h6
                                        className="text-uppercase mt-0"
                                        title="Customers"
                                    >
                                        Total Ingresos
                                    </h6>

                                    <h2 className="my-2">
                                        {totalIngresos === null ? (
                                            <Loader
                                                size={32}
                                                className="spin"
                                                color="#ffffff"
                                            />
                                        ) : (
                                            <>
                                                {totalIngresos.toString()
                                                    .length > 6
                                                    ? totalIngresos
                                                          .toString()
                                                          .slice(0, 3) + "..."
                                                    : totalIngresos}{" "}
                                                €
                                            </>
                                        )}
                                    </h2>
                                </div>
                            </div>
                        </div>{" "}
                        {/* end col*/}
                        <div className="col-xxl-3 col-sm-6">
                            <div className="card widget-flat text-bg-info">
                                <div className="card-body">
                                    <div className="float-end">
                                        <i className="ri-shopping-basket-line widget-icon" />
                                    </div>
                                    <h6
                                        className="text-uppercase mt-0"
                                        title="Customers"
                                    >
                                        Total de Reservas
                                    </h6>
                                    <h2 className="my-2">
                                        {totalReservas === null ? (
                                            <Loader
                                                size={32}
                                                className="spin"
                                                color="#ffffff"
                                            />
                                        ) : (
                                            totalReservas
                                        )}
                                    </h2>
                                </div>
                            </div>
                        </div>{" "}
                        {/* end col*/}
                        <div className="col-xxl-3 col-sm-6">
                            <div className="card widget-flat text-bg-primary">
                                <div className="card-body">
                                    <div className="float-end">
                                        <i className="ri-group-2-line widget-icon" />
                                    </div>
                                    <h6
                                        className="text-uppercase mt-0"
                                        title="Customers"
                                    >
                                        Total Usuarios
                                    </h6>
                                    <h2 className="my-2">
                                        {totalUsuarios === null ? (
                                            <Loader
                                                size={32}
                                                className="spin"
                                                color="#ffffff"
                                            />
                                        ) : (
                                            totalUsuarios
                                        )}
                                    </h2>
                                </div>
                            </div>
                        </div>{" "}
                        {/* end col*/}
                    </div>
                    <div className="row">
                        <div className="col-lg-8">
                            <div
                                className="card"
                                style={{ marginLeft: "20px" }}
                            >
                                <div className="card-body">
                                    <div className="card-widgets">
                                        <a
                                            href="javascript:;"
                                            data-bs-toggle="reload"
                                        >
                                            <i className="ri-refresh-line" />
                                        </a>
                                        <a
                                            data-bs-toggle="collapse"
                                            href="#weeklysales-collapse"
                                            role="button"
                                            aria-expanded="false"
                                            aria-controls="weeklysales-collapse"
                                        >
                                            <i className="ri-subtract-line" />
                                        </a>
                                        <a href="#" data-bs-toggle="remove">
                                            <i className="ri-close-line" />
                                        </a>
                                    </div>

                                    <h5 className="header-title mb-0">
                                        Informe semanal de ventas
                                    </h5>

                                    <div
                                        id="weeklysales-collapse"
                                        className="collapse pt-3 show"
                                    >
                                        {/* Gráfico */}
                                        <div dir="ltr">
                                            <div
                                                id="revenue-chart"
                                                className="apex-charts"
                                                style={{
                                                    minHeight: 377,
                                                    position: "relative",
                                                }}
                                            >
                                                {series === null ? (
                                                    <div
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            top: "50%",
                                                            left: "50%",
                                                            transform:
                                                                "translate(-50%, -50%)",
                                                        }}
                                                    >
                                                        <Loader
                                                            size={48}
                                                            className="spin"
                                                            color="#8a775a"
                                                        />
                                                    </div>
                                                ) : (
                                                    <ApexCharts
                                                        options={opciones}
                                                        series={series}
                                                        type="bar"
                                                        height={350}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Totales debajo del gráfico */}
                                        <div className="row text-center">
                                            {/* Semana Actual */}
                                            <div className="col">
                                                <p className="text-muted mt-3">
                                                    Semana Actual
                                                </p>
                                                <h3 className="mb-0">
                                                    {totalIngresosSemanaActual ===
                                                    null ? (
                                                        <Loader
                                                            size={20}
                                                            className="spin"
                                                            color="#8a775a"
                                                        />
                                                    ) : (
                                                        <span>
                                                            {
                                                                totalIngresosSemanaActual
                                                            }{" "}
                                                            €
                                                        </span>
                                                    )}
                                                </h3>
                                            </div>

                                            {/* Semana Anterior */}
                                            <div className="col">
                                                <p className="text-muted mt-3">
                                                    Semana Anterior
                                                </p>
                                                <h3 className="mb-0">
                                                    {totalIngresosSemanaAnterior ===
                                                    null ? (
                                                        <Loader
                                                            size={20}
                                                            className="spin"
                                                            color="#8a775a"
                                                        />
                                                    ) : (
                                                        <span>
                                                            {
                                                                totalIngresosSemanaAnterior
                                                            }{" "}
                                                            €
                                                        </span>
                                                    )}
                                                </h3>
                                            </div>

                                            {/* Clientes */}
                                            <div className="col">
                                                <p className="text-muted mt-3">
                                                    Clientes
                                                </p>
                                                <h3 className="mb-0">
                                                    {totalUsuarios === null ? (
                                                        <Loader
                                                            size={20}
                                                            className="spin"
                                                            color="#8a775a"
                                                        />
                                                    ) : (
                                                        <span>
                                                            {totalUsuarios}
                                                        </span>
                                                    )}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* end card-body*/}
                            </div>{" "}
                            {/* end card*/}
                        </div>{" "}
                        {/* end col*/}
                        <div className="col-lg-4">
                            <div className="card">
                                <div className="card-body">
                                    <div className="card-widgets">
                                        <a
                                            href="javascript:;"
                                            data-bs-toggle="reload"
                                        >
                                            <i className="ri-refresh-line" />
                                        </a>
                                        <a
                                            data-bs-toggle="collapse"
                                            href="#yearly-sales-collapse"
                                            role="button"
                                            aria-expanded="false"
                                            aria-controls="yearly-sales-collapse"
                                        >
                                            <i className="ri-subtract-line" />
                                        </a>
                                        <a href="#" data-bs-toggle="remove">
                                            <i className="ri-close-line" />
                                        </a>
                                    </div>

                                    <h5 className="header-title mb-0">
                                        Informe de ventas anual
                                    </h5>

                                    <div
                                        id="yearly-sales-collapse"
                                        className="collapse pt-3 show"
                                    >
                                        {/* Gráfico */}
                                        <div dir="ltr">
                                            <div
                                                dir="ltr"
                                                style={{
                                                    minHeight: 250,
                                                    position: "relative",
                                                }}
                                            >
                                                <div
                                                    dir="ltr"
                                                    style={{
                                                        minHeight: 250,
                                                        position: "relative",
                                                    }}
                                                >
                                                    {ventas.length === 0 ? (
                                                        <div
                                                            className="d-flex justify-content-center align-items-center"
                                                            style={{
                                                                height: 250,
                                                            }}
                                                        >
                                                            <Loader
                                                                size={48}
                                                                className="spin"
                                                                color="#8a775a"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <ReactApexChart2
                                                            options={opciones2}
                                                            series={[
                                                                {
                                                                    name: "Ventas",
                                                                    data: ventas,
                                                                },
                                                            ]}
                                                            type="line"
                                                            height={250}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Totales */}
                                        <div className="row text-center">
                                            <div className="col">
                                                <p className="text-muted mt-3 mb-2">
                                                    Cuatrimestre 1
                                                </p>
                                                <h4 className="mb-0">
                                                    {totalPrimerTrimestre ===
                                                    null ? (
                                                        <Loader
                                                            size={20}
                                                            className="spin"
                                                            color="#8a775a"
                                                        />
                                                    ) : (
                                                        <span>
                                                            {
                                                                totalPrimerTrimestre
                                                            }
                                                            €
                                                        </span>
                                                    )}
                                                </h4>
                                            </div>
                                            <div className="col">
                                                <p className="text-muted mt-3 mb-2">
                                                    Cuatrimestre 2
                                                </p>
                                                <h4 className="mb-0">
                                                    {totalSegundoTrimestre ===
                                                    null ? (
                                                        <Loader
                                                            size={20}
                                                            className="spin"
                                                            color="#8a775a"
                                                        />
                                                    ) : (
                                                        <span>
                                                            {
                                                                totalSegundoTrimestre
                                                            }
                                                            €
                                                        </span>
                                                    )}
                                                </h4>
                                            </div>
                                            <div className="col">
                                                <p className="text-muted mt-3 mb-2">
                                                    Cuatrimestre 3
                                                </p>
                                                <h4 className="mb-0">
                                                    {totalTercerTrimestre ===
                                                    null ? (
                                                        <Loader
                                                            size={20}
                                                            className="spin"
                                                            color="#8a775a"
                                                        />
                                                    ) : (
                                                        <span>
                                                            {
                                                                totalTercerTrimestre
                                                            }
                                                            €
                                                        </span>
                                                    )}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* end card-body*/}
                            </div>{" "}
                            {/* end card*/}
                            <div className="card"></div> {/* end card*/}
                        </div>{" "}
                        {/* end col*/}
                    </div>
                    {/* end row */}
                    <div className="row">
                        <div className="col-xl-4">
                            {/* Calendario */}
                            <div
                                className="card"
                                style={{ marginLeft: "20px" }}
                            >
                                <div className="card-body p-0">
                                    <div className="p-3 d-flex justify-content-between align-items-center">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={handlePrevMonth}
                                        >
                                            Anterior
                                        </button>
                                        <h5 className="header-title mb-0 text-center">
                                            Calendario {currentMonth + 1}/
                                            {currentYear}
                                        </h5>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={handleNextMonth}
                                        >
                                            Siguiente
                                        </button>
                                    </div>

                                    {/* Spinner mientras carga */}
                                    {cargandoEventos ? ( // 👈 antes era Object.keys(eventos).length === 0
                                        <div
                                            className="d-flex justify-content-center align-items-center"
                                            style={{ height: 300 }}
                                        >
                                            <Loader
                                                size={48}
                                                className="spin"
                                                color="#8a775a"
                                            />
                                        </div>
                                    ) : (
                                        <div className="table-responsive mx-2">
                                            <table className="table table-bordered text-center align-middle">
                                                <thead>
                                                    <tr className="bg-primary text-white">
                                                        {[
                                                            "L",
                                                            "M",
                                                            "X",
                                                            "J",
                                                            "V",
                                                            "S",
                                                            "D",
                                                        ].map((day, i) => (
                                                            <th
                                                                key={i}
                                                                className="text-white"
                                                            >
                                                                {day}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.from(
                                                        { length: 6 },
                                                        (_, rowIndex) => (
                                                            <tr key={rowIndex}>
                                                                {Array.from(
                                                                    {
                                                                        length: 7,
                                                                    },
                                                                    (
                                                                        _,
                                                                        colIndex,
                                                                    ) => {
                                                                        const dayIndex =
                                                                            rowIndex *
                                                                                7 +
                                                                            colIndex;
                                                                        const day =
                                                                            dayIndex <
                                                                            daysInMonth.length
                                                                                ? daysInMonth[
                                                                                      dayIndex
                                                                                  ]
                                                                                : "";
                                                                        const dayKey = `${currentYear}-${String(
                                                                            currentMonth +
                                                                                1,
                                                                        ).padStart(
                                                                            2,
                                                                            "0",
                                                                        )}-${String(
                                                                            day,
                                                                        ).padStart(
                                                                            2,
                                                                            "0",
                                                                        )}`;
                                                                        const dayEvents =
                                                                            eventos[
                                                                                dayKey
                                                                            ] ||
                                                                            [];

                                                                        return (
                                                                            <td
                                                                                key={
                                                                                    colIndex
                                                                                }
                                                                                style={{
                                                                                    verticalAlign:
                                                                                        "top",
                                                                                    padding:
                                                                                        "4px",
                                                                                    minWidth:
                                                                                        "35px",
                                                                                    maxWidth:
                                                                                        "40px",
                                                                                    height: "60px",
                                                                                    overflow:
                                                                                        "hidden",
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    style={{
                                                                                        fontSize:
                                                                                            "0.8rem",
                                                                                        lineHeight:
                                                                                            "1.2",
                                                                                        overflow:
                                                                                            "hidden",
                                                                                        textOverflow:
                                                                                            "ellipsis",
                                                                                    }}
                                                                                    title={dayEvents.join(
                                                                                        ", ",
                                                                                    )}
                                                                                >
                                                                                    <strong>
                                                                                        {
                                                                                            day
                                                                                        }
                                                                                    </strong>
                                                                                    {getEventosDelDia(
                                                                                        day,
                                                                                    ).map(
                                                                                        (
                                                                                            eventText,
                                                                                            i,
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    i
                                                                                                }
                                                                                                style={{
                                                                                                    color: "red",
                                                                                                    fontSize:
                                                                                                        "0.7rem",
                                                                                                    whiteSpace:
                                                                                                        "nowrap",
                                                                                                    overflow:
                                                                                                        "hidden",
                                                                                                    textOverflow:
                                                                                                        "ellipsis",
                                                                                                }}
                                                                                            >
                                                                                                {
                                                                                                    eventText
                                                                                                }
                                                                                            </div>
                                                                                        ),
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                        );
                                                                    },
                                                                )}
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* end col*/}
                        <div className="col-xl-8">
                            {/* Colaboraciones */}
                            <div className="card">
                                <div className="card-body p-0">
                                    <div className="p-3">
                                        <div className="card-widgets">
                                            <a
                                                href="javascript:;"
                                                data-bs-toggle="reload"
                                            >
                                                <i className="ri-refresh-line" />
                                            </a>
                                            <a
                                                data-bs-toggle="collapse"
                                                href="https://techzaa.in/velonic/layouts/index.html#yearly-sales-collapse"
                                                role="button"
                                                aria-expanded="false"
                                                aria-controls="yearly-sales-collapse"
                                            >
                                                <i className="ri-subtract-line" />
                                            </a>
                                            <a
                                                href="https://techzaa.in/velonic/layouts/index.html#"
                                                data-bs-toggle="remove"
                                            >
                                                <i className="ri-close-line" />
                                            </a>
                                        </div>
                                        <h5 className="header-title mb-0">
                                            Colaboraciones
                                        </h5>
                                    </div>

                                    <div
                                        id="yearly-sales-collapse"
                                        className="collapse show"
                                    >
                                        {/* Spinner mientras cargan los proyectos */}
                                        {proyectos.length === 0 ? (
                                            <div
                                                className="d-flex justify-content-center align-items-center"
                                                style={{ height: 200 }}
                                            >
                                                <Loader
                                                    size={48}
                                                    className="spin"
                                                    color="#8a775a"
                                                />
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-nowrap table-hover mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>ID</th>
                                                            <th>Nombre</th>
                                                            <th>
                                                                Fecha Inicio
                                                            </th>
                                                            <th>Fecha Fin</th>
                                                            <th>Web</th>
                                                            <th>Descripción</th>
                                                            <th>Foto</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(verTodos
                                                            ? proyectos
                                                            : proyectos.slice(
                                                                  0,
                                                                  10,
                                                              )
                                                        ).map(
                                                            (
                                                                proyecto,
                                                                index,
                                                            ) => (
                                                                <tr
                                                                    key={
                                                                        proyecto.id
                                                                    }
                                                                >
                                                                    <td>
                                                                        {index +
                                                                            1}
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            proyecto.nombre
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {formatearFecha(
                                                                            proyecto.fecha_inicio,
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {formatearFecha(
                                                                            proyecto.fecha_fin,
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            proyecto.web
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {proyecto
                                                                            .descripcion
                                                                            .length >
                                                                        20
                                                                            ? proyecto.descripcion.slice(
                                                                                  0,
                                                                                  20,
                                                                              ) +
                                                                              "..."
                                                                            : proyecto.descripcion}
                                                                    </td>

                                                                    <td>
                                                                        {proyecto.foto ? (
                                                                            <img
                                                                                src={`/storage/colaboraciones/portada/${proyecto.id}/${proyecto.foto}`}
                                                                                alt={
                                                                                    proyecto.nombre
                                                                                }
                                                                                style={{
                                                                                    width: "50px",
                                                                                    height: "50px",
                                                                                    objectFit:
                                                                                        "cover",
                                                                                    borderRadius:
                                                                                        "4px",
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <span>
                                                                                No
                                                                                hay
                                                                                foto
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                                {proyectos.length > 10 && (
                                                    <div className="text-center mt-2">
                                                        <a
                                                            href="/proyectos"
                                                            className="text-primary fw-bold text-decoration-underline"
                                                        >
                                                            Ver más
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* end card*/}
                        </div>{" "}
                        {/* end col*/}
                    </div>
                    {/* end row */}
                </div>
                {/* container */}
            </div>
        </div>
    );
};

export default Principal;
