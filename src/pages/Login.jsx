import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {

    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await API.post("/login", { email, password });
            login(res.data.user, res.data.token);
            navigate("/dashboard");
        } catch (err) {
            const msg = err.response?.data?.message ?? "Identifiants incorrects.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: "420px", width: "100%", padding: "40px 24px" }}>

                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1 style={{ color: "#7c3aed", margin: "0 0 8px" }}>ProjectFlow</h1>
                    <p style={{ color: "#64748b", margin: 0 }}>Connexion à votre espace</p>
                </div>

                {error && <p style={{ color: "#ef4444", background: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Nom d'utilisateur</label>
                        <input
                            type="email"
                            placeholder="votre@email.fr"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <label style={{ fontWeight: "500", fontSize: "14px" }}>Mot de passe</label>
                            <Link to="/forgot-password" style={{ fontSize: "13px", color: "#7c3aed", textDecoration: "none" }}>
                                Mot de passe oublié ?
                            </Link>
                        </div>
                        <input
                            type="password"
                            placeholder="Votre mot de passe"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box", fontSize: "15px" }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: "12px", background: "#1e293b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "500" }}
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>

                    <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b" }}>
                        Pas encore de compte ?{" "}
                        <Link to="/register" style={{ color: "#7c3aed", textDecoration: "none" }}>S'inscrire</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}