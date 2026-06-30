import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Loader } from "lucide-react";

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get("/api/auth/yo", { withCredentials: true });
        setUser(res.data.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Loader size={64} className="spin" color="#000000" />
      </div>
    );
  }

  // No logueado o no ADMIN → redirige a /
  if (!user || user.rol !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // ✅ Admin
  return children;
};

export default AdminRoute;
