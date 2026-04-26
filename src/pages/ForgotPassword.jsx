import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .fp-root {
    min-height:100vh; background:#F8FAFC;
    background-image:radial-gradient(#E2E8F0 1px, transparent 1px);
    background-size:24px 24px;
    display:flex; align-items:center; justify-content:center;
    font-family:'DM Sans',system-ui,sans-serif;
  }
  .fp-wrap { width:100%; max-width:380px; padding:0 24px; animation:fadeUp 0.35s ease; }
  .fp-input {
    width:100%; padding:10px 14px; border-radius:10px;
    border:1px solid #E2E8F0; box-sizing:border-box;
    font-size:13.5px; outline:none; color:#1E293B;
    background:#FAFAFA; font-family:'DM Sans',sans-serif;
    transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
  }
  .fp-input:focus { border-color:#6366F1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); background:#fff; }
  .fp-input::placeholder { color:#CBD5E1; }
  .fp-btn {
    width:100%; padding:11px; background:#0F172A; color:#fff;
    border:none; border-radius:10px; cursor:pointer;
    font-size:13.5px; font-weight:600; font-family:'DM Sans',sans-serif;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:background 0.15s,transform 0.1s;
    box-shadow:0 2px 8px rgba(15,23,42,0.18); letter-spacing:-0.1px;
  }
  .fp-btn:hover:not(:disabled) { background:#1E293B; transform:translateY(-1px); }
  .fp-btn:disabled { opacity:0.65; cursor:not-allowed; transform:none; }
  .fp-card { background:#fff; border:1px solid #E2E8F0; border-radius:16px; padding:28px; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
  .fp-back { color:#94A3B8; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:5px; transition:color 0.15s; font-family:'DM Sans',sans-serif; }
  .fp-back:hover { color:#475569; }
`;

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch { setError("Une erreur est survenue. Veuillez réessayer."); }
    finally { setLoading(false); }
  };

  if (success) return (
    <>
      <style>{css}</style>
      <div className="fp-root">
        <div style={{ maxWidth:380, width:"100%", padding:"0 24px", textAlign:"center", animation:"fadeUp 0.35s ease" }}>
          <div className="fp-card" style={{ padding:"44px 36px" }}>
            <div style={{ width:56, height:56, borderRadius:14, background:"#ECFDF5", border:"1px solid #A7F3D0", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
              <svg width="24" height="24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 style={{ margin:"0 0 8px", fontSize:17, fontWeight:700, color:"#0F172A", letterSpacing:"-0.2px" }}>Email envoyé</h2>
            <p style={{ color:"#64748B", margin:"0 0 26px", lineHeight:1.65, fontSize:13.5 }}>
              Si cet email est enregistré dans notre système, vous recevrez un lien de réinitialisation dans quelques instants.
            </p>
            <Link to="/" style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"10px 22px", background:"#0F172A", color:"white", borderRadius:10, textDecoration:"none", fontSize:13.5, fontWeight:600, boxShadow:"0 2px 8px rgba(15,23,42,0.18)" }}>
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="fp-root">
        <div className="fp-wrap">

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
            <p style={{ margin:"0 0 4px", fontSize:15, fontWeight:600, color:"#0F172A", letterSpacing:"-0.2px" }}>Mot de passe oublié</p>
            <p style={{ margin:0, fontSize:13, color:"#64748B" }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
          </div>

          {error && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:8, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"10px 13px", marginBottom:16 }}>
              <svg width="15" height="15" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ color:"#B91C1C", fontSize:13 }}>{error}</span>
            </div>
          )}

          <div className="fp-card">
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div>
                <label style={{ display:"block", marginBottom:6, fontWeight:500, fontSize:12.5, color:"#475569" }}>Adresse email</label>
                <input className="fp-input" type="email" placeholder="votre@email.fr" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="fp-btn">
                {loading ? (
                  <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />Envoi en cours...</>
                ) : "Envoyer le lien"}
              </button>
            </form>
          </div>

          <div style={{ textAlign:"center", marginTop:20 }}>
            <Link to="/" className="fp-back">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Retour à la connexion
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}