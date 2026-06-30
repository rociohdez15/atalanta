import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Loader } from "lucide-react";

const PublicRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await axios.get("/api/auth/yo", { withCredentials: true });
                setUser(res.data.user || null);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (loading)
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <Loader size={64} className="spin" color="#000000" />
            </div>
        );

    // Si es admin, redirige a dashboard
    if (user?.rol === "ADMIN") return <Navigate to="/dashboard-admin" replace />;
    

    // Si es otro tipo de usuario logueado, opcionalmente podrías redirigir a /profile
    // if (user) return <Navigate to="/profile" replace />;

    return children;
};

export default PublicRoute;
