import React, { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";

const categorias = [
    { key: "todas", label: "Todas" },
    { key: "Aventura", label: "Aventura" },
    { key: "Deporte", label: "Deporte" },
    { key: "Cultura", label: "Cultura" },
    { key: "Slow", label: "Slow Travel" },
    { key: "Playa", label: "Escapadas al Mar" },
];

const ExperienciaFilter = ({ selected, onChange }) => {
    const [open, setOpen] = useState(false);

    const selectedLabel =
        categorias.find((c) => c.key === selected)?.label || "Todas";

    return (
        <div
            className="position-relative"
            style={{
                width: "260px",
                minWidth: "260px",
            }}
        >
            {/* BOTÓN PRINCIPAL */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="d-flex align-items-center justify-content-between w-100 px-3 rounded-3"
                style={{
                    height: "44px",
                    backgroundColor: "#000000",
                    color: "#ffffff",
                    border: "none",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    cursor: "pointer",
                }}
            >
                <div className="d-flex align-items-center gap-2">
                    <Filter size={16} />
                    <span>Filtrar por categoría</span>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <span
                        style={{
                            fontSize: "12px",
                            opacity: 0.9,
                        }}
                    >
                        {selectedLabel}
                    </span>

                    <ChevronDown
                        size={15}
                        style={{
                            transform: open
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                        }}
                    />
                </div>
            </button>

            {/* DROPDOWN */}
            {open && (
                <div
                    className="position-absolute w-100 mt-2 rounded-3 shadow-sm"
                    style={{
                        top: "100%",
                        left: 0,
                        backgroundColor: "#ffffff",
                        border: "1px solid rgba(0,0,0,0.08)",
                        zIndex: 1000,
                        overflow: "hidden",
                    }}
                >
                    {categorias.map((cat) => (
                        <div
                            key={cat.key}
                            onClick={() => {
                                onChange(cat.key);
                                setOpen(false);
                            }}
                            style={{
                                padding: "10px 12px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontFamily: "Inter, sans-serif",
                                color:
                                    selected === cat.key
                                        ? "#000000"
                                        : "#333333",
                                backgroundColor:
                                    selected === cat.key
                                        ? "rgba(138,119,90,0.08)"
                                        : "transparent",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "rgba(138,119,90,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                if (selected !== cat.key) {
                                    e.currentTarget.style.backgroundColor =
                                        "transparent";
                                }
                            }}
                        >
                            {cat.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExperienciaFilter;