import { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {

    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        nom: "",
        email: "",
        password: "",
        password_confirmation: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.password_confirmation) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (form.password.length < 12) {
            setError("Le mot de passe doit contenir au moins 12 caractères.");
            return;
        }

        setLoading(true);
        try {
            await API.post("/register", {
                username: form.username,
                nom:      form.nom,
                email:    form.email,
                password: form.password,
            });
            setSuccess(true);
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                const firstError = Object.values(data.errors)[0][0];
                setError(firstError);
            } else {
                setError(data?.message ?? "Erreur lors de l'inscription.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: "400px", width: "100%", textAlign: "center", padding: "40px 24px", background: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                <h2 style={{ margin: "0 0 12px", color: "#1e293b" }}>Demande envoyée !</h2>
                <p style={{ color: "#64748b", marginBottom: "24px", lineHeight: "1.6" }}>
                    Votre compte a été créé et est en attente de validation par un administrateur.
                    Vous recevrez vos identifiants par email une fois votre compte validé.
                </p>
                <Link to="/" style={{ display: "inline-block", padding: "12px 24px", background: "#1e293b", color: "white", borderRadius: "8px", textDecoration: "none" }}>
                    Retour à la connexion
                </Link>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ maxWidth: "440px", width: "100%", padding: "40px 24px" }}>

                <h1 style={{ textAlign: "center", color: "#1e293b", marginBottom: "4px" }}>ProjectFlow</h1>
                <p style={{ textAlign: "center", color: "#64748b", marginBottom: "32px" }}>Créer un compte</p>

                {error && (
                    <p style={{ color: "#ef4444", background: "#fef2f2", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Nom complet *</label>
                        <input
                            name="nom"
                            placeholder="Jean Dupont"
                            value={form.nom}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Nom d'utilisateur *</label>
                        <input
                            name="username"
                            placeholder="jean.dupont"
                            value={form.username}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Email *</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="jean@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Mot de passe *</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="8 caractères minimum"
                            value={form.password}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>Confirmer le mot de passe *</label>
                        <input
                            name="password_confirmation"
                            type="password"
                            placeholder="Répète ton mot de passe"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px" }}>
                        <p style={{ margin: 0, fontSize: "13px", color: "#92400e" }}>
                            ⚠️ Votre compte sera créé avec le statut <strong>en attente</strong>. Un administrateur devra valider votre inscription avant que vous puissiez vous connecter.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: "12px", background: "#1e293b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}
                    >
                        {loading ? "Création..." : "Créer mon compte"}
                    </button>

                    <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b" }}>
                        Déjà un compte ?{" "}
                        <Link to="/" style={{ color: "#3b82f6", textDecoration: "none" }}>Se connecter</Link>
                    </p>

                </form>
            </div>
        </div>
    );
}