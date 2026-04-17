import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {

    const { user } = useAuth();

    // Redirige vers "/" (Login) et non "/login" qui n'existe pas
    if (!user) {
        return <Navigate to="/" />;
    }

    return children;
}