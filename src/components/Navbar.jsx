import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";

export default function Navbar() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await API.get("/notifications/unread-count");
                setCount(res.data.count ?? 0);
            } catch (err) {
                // pas connecté ou erreur silencieuse
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        await API.post("/logout");
        logout();
        navigate("/");
    };

    return (
        <nav style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 24px",
            background: "#1e293b",
            color: "white"
        }}>
            <Link to="/dashboard" style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}>
                ProjectFlow
            </Link>

            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>

                <Link to="/dashboard" style={{ color: "white" }}>Dashboard</Link>
                <Link to="/projects" style={{ color: "white" }}>Projets</Link>
                <Link to="/tasks" style={{ color: "white" }}>Tâches</Link>
                {user?.role === "admin" && (<Link to="/members" style={{ color: "white" }}>Admin</Link>)}

                <Link to="/notifications" style={{ color: "white", position: "relative" }}>
                    🔔
                    {count > 0 && (
                        <span style={{
                            position: "absolute",
                            top: "-5px",
                            right: "-10px",
                            background: "red",
                            borderRadius: "50%",
                            padding: "2px 6px",
                            fontSize: "11px"
                        }}>
                            {count}
                        </span>
                    )}
                </Link>

                <Link to="/profile" style={{ color: "white" }}>
                    👤 {user?.nom}
                </Link>

                <button onClick={handleLogout} style={{
                    background: "transparent",
                    border: "1px solid white",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "6px",
                    cursor: "pointer"
                }}>
                    Déconnexion
                </button>

            </div>
        </nav>
    );
}