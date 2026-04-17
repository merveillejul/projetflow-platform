import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

export default function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await API.post("/auth/forgot-password", { email });
            setSuccess(true);
        } catch (err) {
            setError("Une erreur est survenue. Réessayez.");
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: "400px", width: "100%", textAlign: "center", padding: "40px 24px", background: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📧</div>
                <h2 style={{ margin: "0 0 12px", color: "#1e293b" }}>Email envoyé !</h2>
                <p style={{ color: "#64748b", marginBottom: "24px", lineHeight: "1.6" }}>
                    Si cet email existe dans notre système, vous recevrez un lien de réinitialisation dans quelques instants.
                </p>
                <Link to="/" style={{ display: "inline-block", padding: "12px 24px", background: "#7c3aed", color: "white", borderRadius: "8px", textDecoration: "none" }}>
                    Retour à la connexion
                </Link>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: "420px", width: "100%", padding: "40px 24px" }}>

                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1 style={{ color: "#7c3aed", margin: "0 0 8px" }}>ProjectFlow</h1>
                    <h2 style={{ color: "#1e293b", margin: "0 0 8px", fontSize: "20px" }}>Mot de passe oublié</h2>
                    <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
                        Entrez votre email pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                {error && <p style={{ color: "#ef4444", background: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Adresse email</label>
                        <input
                            type="email"
                            placeholder="votre@email.fr"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box", fontSize: "15px" }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: "12px", background: "#7c3aed", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "500" }}
                    >
                        {loading ? "Envoi..." : "Envoyer le lien"}
                    </button>

                    <Link to="/" style={{ textAlign: "center", color: "#64748b", fontSize: "14px", textDecoration: "none" }}>
                        ← Retour à la connexion
                    </Link>
                </form>
            </div>
        </div>
    );
}