import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

const loginStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .pf-input {
        width: 100%; padding: 9px 12px; border-radius: 8px;
        border: 1px solid #e5e7eb; box-sizing: border-box;
        font-size: 13.5px; outline: none; color: #111827;
        background: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .pf-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    }
    .pf-input::placeholder { color: #d1d5db; }
    .pf-submit-btn {
        width: 100%; padding: 10px;
        background: #1d4ed8; color: white;
        border: none; border-radius: 8px; cursor: pointer;
        font-size: 14px; font-weight: 500; margin-top: 4px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: background 0.15s ease, transform 0.1s ease;
        display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .pf-submit-btn:hover:not(:disabled) { background: #1e40af; }
    .pf-submit-btn:active:not(:disabled) { transform: scale(0.99); }
    .pf-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .pf-forgot:hover { color: #111827; }
`;

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
            setError(err.response?.data?.message ?? "Identifiants incorrects.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{loginStyles}</style>
            <div style={{
                minHeight: "100vh",
                background: "#f8fafc",
                backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}>
                <div style={{ width: "100%", maxWidth: "380px", padding: "0 24px" }}>

                    {/* LOGO */}
                    <div style={{ textAlign: "center", marginBottom: "28px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "9px", marginBottom: "16px" }}>
                            <div style={{
                                width: "30px", height: "30px", borderRadius: "8px",
                                background: "#1d4ed8",
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
                            Connexion
                        </p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                            Connectez-vous à votre espace de travail
                        </p>
                    </div>

                    {/* ERREUR */}
                    {error && (
                        <div style={{
                            display: "flex", alignItems: "flex-start", gap: "8px",
                            background: "#fef2f2", border: "1px solid #fecaca",
                            borderRadius: "8px", padding: "10px 12px", marginBottom: "14px",
                        }}>
                            <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: "1px" }}>
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span style={{ color: "#b91c1c", fontSize: "13px", lineHeight: 1.4 }}>{error}</span>
                        </div>
                    )}

                    {/* CARTE */}
                    <div style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "24px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "13px", color: "#374151" }}>
                                    Adresse email
                                </label>
                                <input
                                    className="pf-input"
                                    type="email"
                                    placeholder="votre@email.fr"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                    <label style={{ fontWeight: "500", fontSize: "13px", color: "#374151" }}>
                                        Mot de passe
                                    </label>
                                    <Link to="/forgot-password" className="pf-forgot" style={{ fontSize: "12px", color: "#6b7280", textDecoration: "none", transition: "color 0.15s" }}>
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                                <div style={{ position: "relative" }}>
                                    <input
                                        className="pf-input"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        style={{ paddingRight: "40px" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: "absolute", right: "10px", top: "50%",
                                            transform: "translateY(-50%)", background: "none",
                                            border: "none", cursor: "pointer", color: "#9ca3af",
                                            padding: "4px", display: "flex", alignItems: "center",
                                        }}
                                    >
                                        {showPassword ? (
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="pf-submit-btn">
                                {loading ? (
                                    <>
                                        <div style={{
                                            width: "14px", height: "14px",
                                            border: "2px solid rgba(255,255,255,0.4)",
                                            borderTopColor: "white",
                                            borderRadius: "50%",
                                            animation: "spin 0.7s linear infinite",
                                        }} />
                                        Connexion en cours...
                                    </>
                                ) : "Se connecter"}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: "center", fontSize: "13px", color: "#6b7280", marginTop: "20px" }}>
                        Pas encore de compte ?{" "}
                        <Link to="/register" style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: "500" }}>
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}