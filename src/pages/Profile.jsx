import { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ nom: "", email: "" });
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        API.get("/user").then(res => {
            setForm({
                nom:   res.data.nom   || "",
                email: res.data.email || "",
            });
        });
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const updateProfile = async () => {
        setSuccess("");
        setError("");
        setLoading(true);
        try {
            await API.put("/user", form);
            setSuccess("Profil mis à jour avec succès !");
        } catch (err) {
            setError("Erreur lors de la mise à jour.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await API.post("/logout");
        logout();
        navigate("/");
    };

    const getRoleLabel = (role) => ({
        admin: "Administrateur",
        chef:  "Chef de projet",
        membre: "Membre",
    }[role] ?? role);

    const getRoleColor = (role) => ({
        admin:  "#7c3aed",
        chef:   "#2563eb",
        membre: "#059669",
    }[role] ?? "#6b7280");

    return (
        <div>
            <Navbar />

            <div style={{ maxWidth: "500px", margin: "40px auto", padding: "0 24px" }}>

                {/* AVATAR + INFO */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        width: "80px", height: "80px", borderRadius: "50%",
                        background: "#1e293b", color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "32px", fontWeight: "500", margin: "0 auto 16px"
                    }}>
                        {user?.nom?.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ margin: "0 0 4px" }}>{user?.nom}</h2>
                    <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "14px" }}>
                        @{user?.username}
                    </p>
                    <span style={{
                        background: getRoleColor(user?.role),
                        color: "white", padding: "4px 14px",
                        borderRadius: "20px", fontSize: "13px"
                    }}>
                        {getRoleLabel(user?.role)}
                    </span>
                </div>

                {/* FORMULAIRE */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
                    <h3 style={{ marginTop: 0 }}>Modifier mon profil</h3>

                    {success && <p style={{ color: "#10b981", background: "#f0fdf4", padding: "10px", borderRadius: "8px" }}>{success}</p>}
                    {error && <p style={{ color: "#ef4444", background: "#fef2f2", padding: "10px", borderRadius: "8px" }}>{error}</p>}

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Nom complet</label>
                            <input
                                name="nom"
                                value={form.nom}
                                onChange={handleChange}
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Email</label>
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Username</label>
                            <input
                                value={user?.username}
                                disabled
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#94a3b8", boxSizing: "border-box" }}
                            />
                            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>Le username ne peut pas être modifié.</p>
                        </div>

                        <button
                            onClick={updateProfile}
                            disabled={loading}
                            style={{ padding: "12px", background: "#1e293b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}
                        >
                            {loading ? "Mise à jour..." : "Enregistrer les modifications"}
                        </button>
                    </div>
                </div>

                {/* DÉCONNEXION */}
                <button
                    onClick={handleLogout}
                    style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}
                >
                    Se déconnecter
                </button>

            </div>
        </div>
    );
}