import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../api/api";

export default function ResetPassword() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    const [form, setForm] = useState({ password: "", password_confirmation: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password.length < 12) {
            setError("Le mot de passe doit contenir au moins 12 caractères.");
            return;
        }
        if (form.password !== form.password_confirmation) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        try {
            await API.post("/auth/reset-password", {
                email,
                token,
                password: form.password,
                password_confirmation: form.password_confirmation,
            });
            navigate("/", { state: { message: "Mot de passe réinitialisé ! Vous pouvez vous connecter." } });
        } catch (err) {
            setError(err.response?.data?.message ?? "Token invalide ou expiré.");
        } finally {
            setLoading(false);
        }
    };

    if (!email || !token) return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#ef4444" }}>Lien invalide.</p>
                <Link to="/" style={{ color: "#7c3aed" }}>Retour à la connexion</Link>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: "420px", width: "100%", padding: "40px 24px" }}>

                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1 style={{ color: "#7c3aed", margin: "0 0 8px" }}>ProjectFlow</h1>
                    <h2 style={{ color: "#1e293b", margin: "0 0 8px", fontSize: "20px" }}>Nouveau mot de passe</h2>
                    <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
                        Choisissez un nouveau mot de passe sécurisé.
                    </p>
                </div>

                {error && <p style={{ color: "#ef4444", background: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Nouveau mot de passe</label>
                        <input
                            type="password"
                            placeholder="12 caractères minimum"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Confirmer le mot de passe</label>
                        <input
                            type="password"
                            placeholder="Répétez le mot de passe"
                            value={form.password_confirmation}
                            onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: "12px", background: "#7c3aed", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "500" }}
                    >
                        {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                    </button>
                </form>
            </div>
        </div>
    );
}