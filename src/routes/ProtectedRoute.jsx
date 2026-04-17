import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {

    const { user } = useAuth();

    if (!user) return <Navigate to="/" />;

    // Page admin → seulement admin
    if (adminOnly && user.role !== "admin") {
        return <Navigate to="/dashboard" />;
    }

    // Pages normales → admin redirigé vers /admin SAUF pour /profile
    if (!adminOnly && user.role === "admin" && window.location.pathname !== "/profile") {
        return <Navigate to="/admin" />;
    }

    return children;
}