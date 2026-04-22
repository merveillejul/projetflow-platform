import { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";

const registerStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .pf-input {
        width: 100%; padding: 9px 12px; border-radius: 8px;
        border: 1px solid #e2e8f0; box-sizing: border-box;
        font-size: 13.5px; outline: none; color: #0f172a; background: white;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .pf-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .pf-input::placeholder { color: #cbd5e1; }
    .pf-submit-btn {
        width: 100%; padding: 10px; background: #1d4ed8; color: white;
        border: none; border-radius: 8px; cursor: pointer;
        font-size: 13.5px; font-weight: 500;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        transition: background 0.15s, transform 0.1s;
    }
    .pf-submit-btn:hover:not(:disabled) { background: #1e40af; }
    .pf-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
`;

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", nom: "", email: "", password: "", password_confirmation: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.password_confirmation) { setError("Les mots de passe ne correspondent pas."); return; }
        if (form.password.length < 12) { setError("Le mot de passe doit contenir au moins 12 caractères."); return; }
        setLoading(true);
        try {
            await API.post("/register", { username: form.username, nom: form.nom, email: form.email, password: form.password });
            setSuccess(true);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.errors ? Object.values(data.errors)[0][0] : data?.message ?? "Erreur lors de l'inscription.");
        } finally { setLoading(false); }
    };

    const pageWrapper = {
        minHeight: "100vh", background: "#f8fafc",
        backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "Inter, 'Inter', sans-serif",
    };

    if (success) return (
        <>
            <style>{registerStyles}</style>
            <div style={pageWrapper}>
                <div style={{ maxWidth: "380px", width: "100%", textAlign: "center" }}>
                    <div style={{
                        background: "white", border: "1px solid #e2e8f0",
                        borderRadius: "14px", padding: "40px 32px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                        <div style={{
                            width: "52px", height: "52px", borderRadius: "12px",
                            background: "#f0fdf4", border: "1px solid #bbf7d0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 18px",
                        }}>
                            <svg width="22" height="22" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <h2 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: "600", color: "#0f172a" }}>
                            Demande envoyée
                        </h2>
                        <p style={{ color: "#64748b", margin: "0 0 24px", lineHeight: 1.6, fontSize: "13.5px" }}>
                            Votre compte est en attente de validation par un administrateur. Vous recevrez vos accès par email une fois validé.
                        </p>
                        <Link to="/" style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            padding: "9px 20px", background: "#1d4ed8", color: "white",
                            borderRadius: "8px", textDecoration: "none",
                            fontSize: "13.5px", fontWeight: "500",
                        }}>
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );

    const labelStyle = { display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "12.5px", color: "#475569" };

    return (
        <>
            <style>{registerStyles}</style>
            <div style={pageWrapper}>
                <div style={{ width: "100%", maxWidth: "400px" }}>

                    {/* LOGO */}
                    <div style={{ textAlign: "center", marginBottom: "28px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "9px", marginBottom: "16px" }}>
                            <div style={{
                                width: "30px", height: "30px", borderRadius: "8px", background: "#1d4ed8",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                </svg>
                            </div>
                            <span style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                                ProjectFlow
                            </span>
                        </div>
                        <p style={{ margin: "0 0 3px", fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>
                            Créer un compte
                        </p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                            Rejoignez votre espace de travail
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            display: "flex", alignItems: "flex-start", gap: "8px",
                            background: "#fef2f2", border: "1px solid #fecaca",
                            borderRadius: "8px", padding: "10px 12px", marginBottom: "14px",
                        }}>
                            <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: "1px" }}>
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span style={{ color: "#b91c1c", fontSize: "13px" }}>{error}</span>
                        </div>
                    )}

                    <div style={{
                        background: "white", border: "1px solid #e2e8f0",
                        borderRadius: "12px", padding: "24px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                            <div>
                                <label style={labelStyle}>Nom complet <span style={{ color: "#ef4444" }}>*</span></label>
                                <input className="pf-input" name="nom" placeholder="Jean Dupont" value={form.nom} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Nom d'utilisateur <span style={{ color: "#ef4444" }}>*</span></label>
                                <input className="pf-input" name="username" placeholder="jean.dupont" value={form.username} onChange={handleChange} required autoCapitalize="none" />
                            </div>
                            <div>
                                <label style={labelStyle}>Email <span style={{ color: "#ef4444" }}>*</span></label>
                                <input className="pf-input" name="email" type="email" placeholder="jean@example.com" value={form.email} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Mot de passe <span style={{ color: "#ef4444" }}>*</span></label>
                                <input className="pf-input" name="password" type="password" placeholder="12 caractères minimum" value={form.password} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Confirmer le mot de passe <span style={{ color: "#ef4444" }}>*</span></label>
                                <input className="pf-input" name="password_confirmation" type="password" placeholder="Répétez votre mot de passe" value={form.password_confirmation} onChange={handleChange} required />
                            </div>

                            {/* AVERTISSEMENT */}
                            <div style={{
                                display: "flex", alignItems: "flex-start", gap: "8px",
                                background: "#fffbeb", border: "1px solid #fde68a",
                                borderRadius: "8px", padding: "9px 11px",
                            }}>
                                <svg width="14" height="14" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: "1px" }}>
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                <p style={{ margin: 0, fontSize: "12px", color: "#92400e", lineHeight: 1.5 }}>
                                    Votre compte sera <strong>en attente</strong> jusqu'à validation par un administrateur.
                                </p>
                            </div>

                            <button type="submit" disabled={loading} className="pf-submit-btn">
                                {loading ? (
                                    <>
                                        <div style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                        Création en cours...
                                    </>
                                ) : "Créer mon compte"}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", marginTop: "20px" }}>
                        Déjà un compte ?{" "}
                        <Link to="/" style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: "500" }}>
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}