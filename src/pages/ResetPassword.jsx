import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../api/api";

const resetStyles = `
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
        transition: background 0.15s;
    }
    .pf-submit-btn:hover:not(:disabled) { background: #1e40af; }
    .pf-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .pf-back-link {
        color: #94a3b8; font-size: 13px; text-decoration: none;
        display: inline-flex; align-items: center; gap: 5px;
        transition: color 0.15s;
    }
    .pf-back-link:hover { color: #475569; }
`;

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
        if (form.password.length < 12) { setError("Le mot de passe doit contenir au moins 12 caractères."); return; }
        if (form.password !== form.password_confirmation) { setError("Les mots de passe ne correspondent pas."); return; }
        setLoading(true);
        try {
            await API.post("/auth/reset-password", { email, token, ...form });
            navigate("/", { state: { message: "Mot de passe réinitialisé ! Vous pouvez vous connecter." } });
        } catch (err) {
            setError(err.response?.data?.message ?? "Token invalide ou expiré.");
        } finally { setLoading(false); }
    };

    const pageWrapper = {
        minHeight: "100vh", background: "#f8fafc",
        backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, 'Inter', sans-serif",
    };

    if (!email || !token) return (
        <>
            <style>{resetStyles}</style>
            <div style={pageWrapper}>
                <div style={{
                    textAlign: "center", padding: "40px 32px",
                    background: "white", borderRadius: "12px",
                    border: "1px solid #e2e8f0", maxWidth: "360px", width: "100%", margin: "0 24px",
                }}>
                    <div style={{
                        width: "48px", height: "48px", borderRadius: "10px",
                        background: "#fef2f2", border: "1px solid #fecaca",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 16px",
                    }}>
                        <svg width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <p style={{ color: "#b91c1c", marginBottom: "16px", fontSize: "14px", fontWeight: "500" }}>
                        Lien invalide ou expiré
                    </p>
                    <Link to="/" className="pf-back-link">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </>
    );

    const labelStyle = { display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "12.5px", color: "#475569" };

    return (
        <>
            <style>{resetStyles}</style>
            <div style={pageWrapper}>
                <div style={{ width: "100%", maxWidth: "380px", padding: "0 24px" }}>

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
                            Nouveau mot de passe
                        </p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                            Choisissez un mot de passe sécurisé.
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
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={labelStyle}>Nouveau mot de passe</label>
                                <input className="pf-input" type="password" placeholder="12 caractères minimum"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Confirmer le mot de passe</label>
                                <input className="pf-input" type="password" placeholder="Répétez le mot de passe"
                                    value={form.password_confirmation} onChange={e => setForm({ ...form, password_confirmation: e.target.value })} required />
                            </div>
                            <button type="submit" disabled={loading} className="pf-submit-btn">
                                {loading ? (
                                    <>
                                        <div style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                        Réinitialisation...
                                    </>
                                ) : "Réinitialiser le mot de passe"}
                            </button>
                        </form>
                    </div>

                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <Link to="/" className="pf-back-link">
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}