import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

const fpStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .pf-input {
        width: 100%; padding: 9px 12px; border-radius: 8px;
        border: 1px solid #e2e8f0; box-sizing: border-box;
        font-size: 13.5px; outline: none; color: #1e293b; background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .pf-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .pf-input::placeholder { color: #cbd5e1; }
    .pf-submit-btn {
        width: 100%; padding: 10px;
        background: #1d4ed8; color: white;
        border: none; border-radius: 8px; cursor: pointer;
        font-size: 13.5px; font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: background 0.15s, transform 0.1s;
        display: flex; align-items: center; justify-content: center; gap: 8px;
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

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            await API.post("/auth/forgot-password", { email });
            setSuccess(true);
        } catch (err) {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const pageWrapper = {
        minHeight: "100vh",
        background: "#f8fafc",
        backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    };

    if (success) return (
        <>
            <style>{fpStyles}</style>
            <div style={pageWrapper}>
                <div style={{
                    maxWidth: "380px", width: "100%", padding: "0 24px", textAlign: "center",
                }}>
                    <div style={{
                        background: "white", border: "1px solid #e2e8f0", borderRadius: "14px",
                        padding: "40px 32px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                        <div style={{
                            width: "52px", height: "52px", borderRadius: "12px",
                            background: "#f0fdf4", border: "1px solid #bbf7d0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 18px",
                        }}>
                            <svg width="22" height="22" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                        </div>
                        <h2 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: "600", color: "#0f172a" }}>
                            Email envoyé
                        </h2>
                        <p style={{ color: "#64748b", margin: "0 0 24px", lineHeight: "1.6", fontSize: "13.5px" }}>
                            Si cet email est enregistré dans notre système, vous recevrez un lien de réinitialisation dans quelques instants.
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

    return (
        <>
            <style>{fpStyles}</style>
            <div style={pageWrapper}>
                <div style={{ maxWidth: "380px", width: "100%", padding: "0 24px" }}>

                    {/* LOGO */}
                    <div style={{ textAlign: "center", marginBottom: "28px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "9px", marginBottom: "16px" }}>
                            <div style={{
                                width: "30px", height: "30px", borderRadius: "8px", background: "#1d4ed8",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            </div>
                            <span style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                                ProjectFlow
                            </span>
                        </div>
                        <p style={{ margin: "0 0 3px", fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>
                            Mot de passe oublié
                        </p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                            Entrez votre email pour recevoir un lien de réinitialisation.
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
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "13px", color: "#374151" }}>
                                    Adresse email
                                </label>
                                <input className="pf-input" type="email" placeholder="votre@email.fr"
                                    value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <button type="submit" disabled={loading} className="pf-submit-btn">
                                {loading ? (
                                    <>
                                        <div style={{
                                            width: "13px", height: "13px",
                                            border: "2px solid rgba(255,255,255,0.35)",
                                            borderTopColor: "white", borderRadius: "50%",
                                            animation: "spin 0.7s linear infinite",
                                        }} />
                                        Envoi en cours...
                                    </>
                                ) : "Envoyer le lien"}
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