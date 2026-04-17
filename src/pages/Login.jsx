import { useState} from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
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

            // Sauvegarde user ET token dans AuthContext + localStorage
            login(res.data.user, res.data.token);

            navigate("/dashboard");

        } catch (err) {
            setError("Email ou mot de passe incorrect.");
            console.log(err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "100px auto", padding: "24px" }}>
            <h2>Connexion à ProjectFlow</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />

                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: "12px", background: "#1e293b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
                >
                    {loading ? "Connexion..." : "Se connecter"}
                </button>

                <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b", marginTop: "16px" }}>
                    Pas encore de compte ?{" "}
                    <Link to="/register" style={{ color: "#3b82f6", textDecoration: "none" }}>
                        S'inscrire
                    </Link>
                </p>

            </form>
        </div>
    );
}