import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .lg-root {
    min-height:100vh; background:#F8FAFC;
    background-image:radial-gradient(#E2E8F0 1px, transparent 1px);
    background-size:24px 24px;
    display:flex; align-items:center; justify-content:center;
    font-family:'DM Sans',system-ui,sans-serif;
  }
  .lg-wrap { width:100%; max-width:380px; padding:0 24px; animation:fadeUp 0.35s ease; }
  .lg-input {
    width:100%; padding:10px 14px; border-radius:10px;
    border:1px solid #E2E8F0; box-sizing:border-box;
    font-size:13.5px; outline:none; color:#1E293B;
    background:#FAFAFA; font-family:'DM Sans',sans-serif;
    transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
  }
  .lg-input:focus { border-color:#6366F1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); background:#fff; }
  .lg-input:disabled { background:#F1F5F9; color:#94A3B8; cursor:not-allowed; }
  .lg-input::placeholder { color:#CBD5E1; }
  .lg-btn {
    width:100%; padding:11px; background:#0F172A; color:#fff;
    border:none; border-radius:10px; cursor:pointer;
    font-size:13.5px; font-weight:600; font-family:'DM Sans',sans-serif;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:background 0.15s,transform 0.1s;
    box-shadow:0 2px 8px rgba(15,23,42,0.18);
    letter-spacing:-0.1px;
  }
  .lg-btn:hover:not(:disabled) { background:#1E293B; transform:translateY(-1px); box-shadow:0 4px 14px rgba(15,23,42,0.22); }
  .lg-btn:disabled { opacity:0.65; cursor:not-allowed; transform:none; background:#94A3B8; }
  .lg-card {
    background:#fff; border:1px solid #E2E8F0;
    border-radius:16px; padding:28px;
    box-shadow:0 1px 4px rgba(0,0,0,0.04);
  }
  .lg-eye {
    position:absolute; right:11px; top:50%; transform:translateY(-50%);
    background:none; border:none; cursor:pointer; color:#94A3B8;
    padding:4px; display:flex; align-items:center; transition:color 0.15s;
  }
  .lg-eye:hover { color:#475569; }
  .lg-error {
    display:flex; align-items:flex-start; gap:8px;
    background:#FEF2F2; border:1px solid #FECACA;
    border-radius:10px; padding:10px 13px; margin-bottom:16px;
  }
  .lg-warning {
    display:flex; align-items:flex-start; gap:8px;
    background:#FFFBEB; border:1px solid #FDE68A;
    border-radius:10px; padding:10px 13px; margin-bottom:16px;
  }
  .lg-lock {
    background:#FEF2F2; border:1px solid #FECACA;
    border-radius:10px; padding:12px 14px; margin-bottom:16px;
  }
  .lg-forgot { font-size:12px; color:#94A3B8; text-decoration:none; transition:color 0.15s; }
  .lg-forgot:hover { color:#475569; }
`;

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // ✅ États brute force
  const [isLocked, setIsLocked]   = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [remaining, setRemaining] = useState(null);

  // ✅ Décompte en temps réel
  useEffect(() => {
    if (!isLocked || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLocked(false);
          setError("");
          setRemaining(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLocked, countdown]);

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (isLocked) return;
    setLoading(true);

    try {
      const res = await API.post("/login", { email, password });
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");

    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message ?? "Identifiants incorrects.";

      // ✅ Compte bloqué
      if (status === 429) {
        setIsLocked(true);
        setCountdown(15 * 60);
        setError(message);

      // ✅ Mauvais mot de passe
      } else if (status === 401) {
        setError(message);
        const match = message.match(/(\d+) tentative/);
        if (match) setRemaining(parseInt(match[1]));

      } else {
        setError(message);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="lg-root">
        <div className="lg-wrap">

          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:18 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:"#0F172A", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(15,23,42,0.2)" }}>
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <span style={{ fontSize:17, fontWeight:700, color:"#0F172A", letterSpacing:"-0.4px" }}>ProjectFlow</span>
            </div>
            <p style={{ margin:"0 0 4px", fontSize:15, fontWeight:600, color:"#0F172A", letterSpacing:"-0.2px" }}>Connexion</p>
            <p style={{ margin:0, fontSize:13, color:"#64748B" }}>Connectez-vous à votre espace de travail</p>
          </div>

          {/* ✅ Bannière blocage */}
          {isLocked && (
            <div className="lg-lock">
              <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:700, color:"#B91C1C" }}>
                Compte temporairement bloqué
              </p>
              <p style={{ margin:0, fontSize:12.5, color:"#B91C1C" }}>
                Réessayez dans {formatCountdown(countdown)}
              </p>
            </div>
          )}

          {/* ✅ Erreur standard */}
          {error && !isLocked && (
            <div className="lg-error">
              <svg width="15" height="15" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ color:"#B91C1C", fontSize:13, lineHeight:1.45 }}>{error}</span>
            </div>
          )}

          {/* ✅ Avertissement tentatives restantes */}
          {remaining !== null && remaining <= 2 && !isLocked && (
            <div className="lg-warning">
              <span style={{ color:"#92400E", fontSize:13 }}>
                ⚠️ Plus que {remaining} tentative{remaining > 1 ? "s" : ""} avant blocage temporaire
              </span>
            </div>
          )}

          {/* Carte */}
          <div className="lg-card">
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>

              <div>
                <label style={{ display:"block", marginBottom:6, fontWeight:500, fontSize:12.5, color:"#475569" }}>
                  Adresse email
                </label>
                <input className="lg-input" type="email" placeholder="votre@email.fr"
                  value={email} onChange={e => setEmail(e.target.value)}
                  disabled={isLocked} required />
              </div>

              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <label style={{ fontWeight:500, fontSize:12.5, color:"#475569" }}>Mot de passe</label>
                  <Link to="/forgot-password" className="lg-forgot">Mot de passe oublié ?</Link>
                </div>
                <div style={{ position:"relative" }}>
                  <input className="lg-input" type={showPwd ? "text" : "password"}
                    placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLocked} required style={{ paddingRight:40 }} />
                  <button type="button" className="lg-eye" onClick={() => setShowPwd(s => !s)}>
                    {showPwd ? (
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading || isLocked} className="lg-btn">
                {loading ? (
                  <>
                    <div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                    Connexion en cours...
                  </>
                ) : isLocked ? (
                  `Bloqué — ${formatCountdown(countdown)}`
                ) : (
                  "Se connecter"
                )}
              </button>

            </form>
          </div>

          <p style={{ textAlign:"center", fontSize:13, color:"#64748B", marginTop:20 }}>
            Pas encore de compte ?{" "}
            <Link to="/register" style={{ color:"#6366F1", textDecoration:"none", fontWeight:600 }}>Créer un compte</Link>
          </p>

        </div>
      </div>
    </>
  );
}