import React, { useState } from "react";
import { Tag, ChevronDown } from "lucide-react";

const ofertas = [
    { key: "navidad", label: "Navidad" },
    { key: "verano", label: "Verano" },
    { key: "san_valentin", label: "San Valentín" },
    { key: "black_friday", label: "Black Friday" },
    { key: "cyber_monday", label: "Cyber Monday" },
    { key: "bajada_precio", label: "Bajada de precio" },
        { key: "sin_oferta", label: "Sin oferta" },
];

const OfertaFilter = ({ selected, onChange }) => {
    const [open, setOpen] = useState(false);

    const selectedLabel =
        ofertas.find((o) => o.key === selected)?.label ||
        "Sin oferta";

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
                    <Tag size={16} />

                    <span>
                        Filtrar por oferta
                    </span>
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
                    {ofertas.map((oferta) => (
                        <div
                            key={oferta.key}
                            onClick={() => {
                                onChange(oferta.key);
                                setOpen(false);
                            }}
                            style={{
                                padding: "10px 12px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontFamily: "Inter, sans-serif",
                                color:
                                    selected === oferta.key
                                        ? "#000000"
                                        : "#333333",
                                backgroundColor:
                                    selected === oferta.key
                                        ? "rgba(138,119,90,0.08)"
                                        : "transparent",
                                transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "rgba(138,119,90,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                if (selected !== oferta.key) {
                                    e.currentTarget.style.backgroundColor =
                                        "transparent";
                                }
                            }}
                        >
                            {oferta.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OfertaFilter;