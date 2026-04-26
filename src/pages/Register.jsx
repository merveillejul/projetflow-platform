import { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .rg-root {
    min-height:100vh; background:#F8FAFC;
    background-image:radial-gradient(#E2E8F0 1px, transparent 1px);
    background-size:24px 24px;
    display:flex; align-items:center; justify-content:center;
    padding:40px 24px; font-family:'DM Sans',system-ui,sans-serif;
  }
  .rg-wrap { width:100%; max-width:400px; animation:fadeUp 0.35s ease; }
  .rg-input {
    width:100%; padding:10px 14px; border-radius:10px;
    border:1px solid #E2E8F0; box-sizing:border-box;
    font-size:13.5px; outline:none; color:#1E293B;
    background:#FAFAFA; font-family:'DM Sans',sans-serif;
    transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
  }
  .rg-input:focus { border-color:#6366F1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); background:#fff; }
  .rg-input::placeholder { color:#CBD5E1; }
  .rg-btn {
    width:100%; padding:11px; background:#0F172A; color:#fff;
    border:none; border-radius:10px; cursor:pointer;
    font-size:13.5px; font-weight:600; font-family:'DM Sans',sans-serif;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:background 0.15s,transform 0.1s;
    box-shadow:0 2px 8px rgba(15,23,42,0.18); letter-spacing:-0.1px;
  }
  .rg-btn:hover:not(:disabled) { background:#1E293B; transform:translateY(-1px); }
  .rg-btn:disabled { opacity:0.65; cursor:not-allowed; transform:none; }
  .rg-card { background:#fff; border:1px solid #E2E8F0; border-radius:16px; padding:28px; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
  .rg-error { display:flex; align-items:flex-start; gap:8px; background:#FEF2F2; border:1px solid #FECACA; border-radius:10px; padding:10px 13px; margin-bottom:16px; }
`;

const lbl = { display:"block", marginBottom:6, fontWeight:500, fontSize:12.5, color:"#475569" };

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:"", nom:"", email:"", password:"", password_confirmation:"" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (form.password !== form.password_confirmation) { setError("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 12) { setError("Le mot de passe doit contenir au moins 12 caractères."); return; }
    setLoading(true);
    try {
      await API.post("/register", { username:form.username, nom:form.nom, email:form.email, password:form.password });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.errors ? Object.values(data.errors)[0][0] : data?.message ?? "Erreur lors de l'inscription.");
    } finally { setLoading(false); }
  };

  if (success) return (
    <>
      <style>{css}</style>
      <div className="rg-root">
        <div style={{ maxWidth:380, width:"100%", textAlign:"center", animation:"fadeUp 0.35s ease" }}>
          <div className="rg-card" style={{ padding:"44px 36px" }}>
            <div style={{ width:56, height:56, borderRadius:14, background:"#ECFDF5", border:"1px solid #A7F3D0", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
              <svg width="24" height="24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ margin:"0 0 8px", fontSize:17, fontWeight:700, color:"#0F172A", letterSpacing:"-0.2px" }}>Demande envoyée</h2>
            <p style={{ color:"#64748B", margin:"0 0 24px", lineHeight:1.65, fontSize:13.5 }}>
              Votre compte est en attente de validation par un administrateur. Vous recevrez vos accès par email une fois validé.
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
      <div className="rg-root">
        <div className="rg-wrap">

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
            <p style={{ margin:"0 0 4px", fontSize:15, fontWeight:600, color:"#0F172A", letterSpacing:"-0.2px" }}>Créer un compte</p>
            <p style={{ margin:0, fontSize:13, color:"#64748B" }}>Rejoignez votre espace de travail</p>
          </div>

          {error && (
            <div className="rg-error">
              <svg width="15" height="15" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ color:"#B91C1C", fontSize:13 }}>{error}</span>
            </div>
          )}

          <div className="rg-card">
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={lbl}>Nom complet <span style={{ color:"#EF4444" }}>*</span></label>
                <input className="rg-input" name="nom" placeholder="Jean Dupont" value={form.nom} onChange={handleChange} required />
              </div>
              <div>
                <label style={lbl}>Nom d'utilisateur <span style={{ color:"#EF4444" }}>*</span></label>
                <input className="rg-input" name="username" placeholder="jean.dupont" value={form.username} onChange={handleChange} required autoCapitalize="none" />
              </div>
              <div>
                <label style={lbl}>Email <span style={{ color:"#EF4444" }}>*</span></label>
                <input className="rg-input" name="email" type="email" placeholder="jean@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label style={lbl}>Mot de passe <span style={{ color:"#EF4444" }}>*</span></label>
                <input className="rg-input" name="password" type="password" placeholder="12 caractères minimum" value={form.password} onChange={handleChange} required />
              </div>
              <div>
                <label style={lbl}>Confirmer le mot de passe <span style={{ color:"#EF4444" }}>*</span></label>
                <input className="rg-input" name="password_confirmation" type="password" placeholder="Répétez votre mot de passe" value={form.password_confirmation} onChange={handleChange} required />
              </div>

              {/* Avertissement */}
              <div style={{ display:"flex", alignItems:"flex-start", gap:8, background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, padding:"10px 12px" }}>
                <svg width="14" height="14" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p style={{ margin:0, fontSize:12, color:"#92400E", lineHeight:1.55 }}>
                  Votre compte sera <strong>en attente</strong> jusqu'à validation par un administrateur.
                </p>
              </div>

              <button type="submit" disabled={loading} className="rg-btn">
                {loading ? (
                  <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />Création en cours...</>
                ) : "Créer mon compte"}
              </button>
            </form>
          </div>

          <p style={{ textAlign:"center", fontSize:13, color:"#64748B", marginTop:20 }}>
            Déjà un compte ?{" "}
            <Link to="/" style={{ color:"#6366F1", textDecoration:"none", fontWeight:600 }}>Se connecter</Link>
          </p>

        </div>
      </div>
    </>
  );
}