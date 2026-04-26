import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../api/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .rp-root {
    min-height:100vh; background:#F8FAFC;
    background-image:radial-gradient(#E2E8F0 1px, transparent 1px);
    background-size:24px 24px;
    display:flex; align-items:center; justify-content:center;
    font-family:'DM Sans',system-ui,sans-serif;
  }
  .rp-wrap { width:100%; max-width:380px; padding:0 24px; animation:fadeUp 0.35s ease; }
  .rp-input {
    width:100%; padding:10px 14px; border-radius:10px;
    border:1px solid #E2E8F0; box-sizing:border-box;
    font-size:13.5px; outline:none; color:#1E293B;
    background:#FAFAFA; font-family:'DM Sans',sans-serif;
    transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
  }
  .rp-input:focus { border-color:#6366F1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); background:#fff; }
  .rp-input::placeholder { color:#CBD5E1; }
  .rp-btn {
    width:100%; padding:11px; background:#0F172A; color:#fff;
    border:none; border-radius:10px; cursor:pointer;
    font-size:13.5px; font-weight:600; font-family:'DM Sans',sans-serif;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:background 0.15s,transform 0.1s;
    box-shadow:0 2px 8px rgba(15,23,42,0.18); letter-spacing:-0.1px;
  }
  .rp-btn:hover:not(:disabled) { background:#1E293B; transform:translateY(-1px); }
  .rp-btn:disabled { opacity:0.65; cursor:not-allowed; transform:none; }
  .rp-card { background:#fff; border:1px solid #E2E8F0; border-radius:16px; padding:28px; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
  .rp-back { color:#94A3B8; font-size:13px; text-decoration:none; display:inline-flex; align-items:center; gap:5px; transition:color 0.15s; font-family:'DM Sans',sans-serif; }
  .rp-back:hover { color:#475569; }
`;

const lbl = { display:"block", marginBottom:6, fontWeight:500, fontSize:12.5, color:"#475569" };

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [form, setForm]     = useState({ password:"", password_confirmation:"" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (form.password.length < 12) { setError("Le mot de passe doit contenir au moins 12 caractères."); return; }
    if (form.password !== form.password_confirmation) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      await API.post("/auth/reset-password", { email, token, ...form });
      navigate("/", { state:{ message:"Mot de passe réinitialisé ! Vous pouvez vous connecter." } });
    } catch (err) {
      setError(err.response?.data?.message ?? "Token invalide ou expiré.");
    } finally { setLoading(false); }
  };

  if (!email || !token) return (
    <>
      <style>{css}</style>
      <div className="rp-root">
        <div style={{ maxWidth:360, width:"100%", margin:"0 24px", animation:"fadeUp 0.35s ease" }}>
          <div className="rp-card" style={{ textAlign:"center", padding:"44px 36px" }}>
            <div style={{ width:52, height:52, borderRadius:12, background:"#FEF2F2", border:"1px solid #FECACA", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="22" height="22" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p style={{ color:"#B91C1C", marginBottom:18, fontSize:14, fontWeight:600 }}>Lien invalide ou expiré</p>
            <Link to="/" className="rp-back">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
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
      <div className="rp-root">
        <div className="rp-wrap">

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
            <p style={{ margin:"0 0 4px", fontSize:15, fontWeight:600, color:"#0F172A", letterSpacing:"-0.2px" }}>Nouveau mot de passe</p>
            <p style={{ margin:0, fontSize:13, color:"#64748B" }}>Choisissez un mot de passe sécurisé.</p>
          </div>

          {error && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:8, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"10px 13px", marginBottom:16 }}>
              <svg width="15" height="15" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ color:"#B91C1C", fontSize:13 }}>{error}</span>
            </div>
          )}

          <div className="rp-card">
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={lbl}>Nouveau mot de passe</label>
                <input className="rp-input" type="password" placeholder="12 caractères minimum"
                  value={form.password} onChange={e => setForm({ ...form, password:e.target.value })} required />
              </div>
              <div>
                <label style={lbl}>Confirmer le mot de passe</label>
                <input className="rp-input" type="password" placeholder="Répétez le mot de passe"
                  value={form.password_confirmation} onChange={e => setForm({ ...form, password_confirmation:e.target.value })} required />
                {form.password_confirmation && (
                  <p style={{ fontSize:11, marginTop:4, color: form.password === form.password_confirmation ? "#10B981" : "#EF4444" }}>
                    {form.password === form.password_confirmation ? "✓ Correspondent" : "✗ Ne correspondent pas"}
                  </p>
                )}
              </div>
              <button type="submit" disabled={loading} className="rp-btn">
                {loading ? (
                  <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />Réinitialisation...</>
                ) : "Réinitialiser le mot de passe"}
              </button>
            </form>
          </div>

          <div style={{ textAlign:"center", marginTop:20 }}>
            <Link to="/" className="rp-back">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Retour à la connexion
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}