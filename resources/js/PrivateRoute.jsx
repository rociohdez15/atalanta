import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Loader } from "lucide-react";

const PrivateRouteUser = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 🔐 El backend valida la cookie HttpOnly
        const res = await axios.get("/api/auth/yo", { withCredentials: true });
        setUser(res.data.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ⏳ Esperando respuesta del backend
  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Loader size={64} className="spin" color="#000000" />
      </div>
    );

  // 🚫 No autenticado → login
  if (!user) return <Navigate to="/login" replace />;

  // 🚫 Usuario con rol ADMIN → redirigir a dashboard-admin
  if (user.rol === "ADMIN") return <Navigate to="/dashboard-admin" replace />;

  // ✅ Usuario con rol USER → renderiza la ruta
  return children;
};

export default PrivateRouteUser;
