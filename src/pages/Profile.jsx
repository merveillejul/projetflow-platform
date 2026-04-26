import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const ROLE_CONFIG = {
  admin:  { color:"#DC2626", bg:"#FEF2F2", border:"#FECACA", label:"Administrateur", heroFrom:"#7F1D1D", heroTo:"#DC2626", avatarBg:"#B91C1C" },
  chef:   { color:"#4F46E5", bg:"#EEF2FF", border:"#C7D2FE", label:"Chef de projet",  heroFrom:"#1E1B4B", heroTo:"#4F46E5", avatarBg:"#4338CA" },
  membre: { color:"#059669", bg:"#ECFDF5", border:"#A7F3D0", label:"Membre",           heroFrom:"#064E3B", heroTo:"#059669", avatarBg:"#047857" },
};
const getRoleConfig = (r) => ROLE_CONFIG[r] ?? { color:"#475569", bg:"#F8FAFC", border:"#E2E8F0", label:r, heroFrom:"#0F172A", heroTo:"#334155", avatarBg:"#475569" };

const buildPhotoUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
  const path = photo.startsWith("storage/") ? photo : `storage/${photo}`;
  return `https://projetflow-platform-production.up.railway.app/${path}`;
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }

  .pr-root { font-family:'DM Sans',system-ui,sans-serif; animation:fadeUp 0.3s ease; }

  /* Input */
  .pr-input {
    width:100%; padding:10px 14px; border-radius:10px;
    border:1px solid #E2E8F0; box-sizing:border-box;
    font-size:13.5px; color:#1E293B; background:#FAFAFA; outline:none;
    font-family:'DM Sans',sans-serif;
    transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
  }
  .pr-input:focus { border-color:var(--role-color); box-shadow:0 0 0 3px var(--role-glow); background:#fff; }
  .pr-input::placeholder { color:#CBD5E1; }
  .pr-input:disabled { background:#F1F5F9; color:#94A3B8; cursor:not-allowed; }

  /* Card */
  .pr-card { background:#fff; border:1px solid #E2E8F0; border-radius:16px; overflow:hidden; }

  /* Hero */
  .pr-hero {
    padding:32px 28px 24px; position:relative; overflow:hidden;
    background:linear-gradient(135deg, var(--hero-from) 0%, var(--hero-to) 100%);
  }
  .pr-hero::before {
    content:''; position:absolute; top:-50px; right:-50px;
    width:180px; height:180px; border-radius:50%;
    background:rgba(255,255,255,0.06);
  }
  .pr-hero::after {
    content:''; position:absolute; bottom:-30px; left:50px;
    width:100px; height:100px; border-radius:50%;
    background:rgba(255,255,255,0.04);
  }

  /* Avatar */
  .pr-avatar-ring {
    width:72px; height:72px; border-radius:50%;
    border:3px solid rgba(255,255,255,0.25);
    position:relative; flex-shrink:0;
    transition:border-color 0.2s;
  }
  .pr-avatar-ring:hover { border-color:rgba(255,255,255,0.5); }
  .pr-avatar-img { width:100%; height:100%; border-radius:50%; object-fit:cover; }
  .pr-avatar-placeholder {
    width:100%; height:100%; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:26px; font-weight:700; color:white;
  }
  .pr-avatar-edit {
    position:absolute; bottom:-2px; right:-2px;
    width:24px; height:24px; border-radius:50%;
    background:white; border:2px solid rgba(255,255,255,0.4);
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    padding:0; transition:transform 0.15s,box-shadow 0.15s;
    box-shadow:0 2px 6px rgba(0,0,0,0.15);
  }
  .pr-avatar-edit:hover { transform:scale(1.12); box-shadow:0 4px 10px rgba(0,0,0,0.2); }

  /* Section header */
  .pr-section-head {
    padding:14px 20px; border-bottom:1px solid #F1F5F9;
    display:flex; align-items:center; gap:9px;
  }
  .pr-section-icon {
    width:26px; height:26px; border-radius:7px;
    background:var(--role-bg); color:var(--role-color);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .pr-section-title { font-size:13px; font-weight:600; color:#0F172A; margin:0; }

  /* Body */
  .pr-body { padding:20px; }

  /* Label */
  .pr-label {
    display:block; margin-bottom:6px;
    font-weight:500; font-size:11.5px; color:#64748B;
    text-transform:uppercase; letter-spacing:0.05em;
  }
  .pr-field { margin-bottom:16px; }
  .pr-field:last-of-type { margin-bottom:0; }

  /* Buttons */
  .pr-btn {
    display:flex; align-items:center; justify-content:center; gap:6px;
    padding:10px 18px; border-radius:10px; border:none;
    font-size:13px; font-weight:600; cursor:pointer;
    font-family:'DM Sans',sans-serif; transition:all 0.15s; white-space:nowrap;
  }
  .pr-btn-primary {
    background:var(--role-color); color:white;
    box-shadow:0 2px 8px var(--role-glow);
  }
  .pr-btn-primary:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 4px 14px var(--role-glow); }
  .pr-btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .pr-btn-full { width:100%; }
  .pr-btn-logout {
    background:rgba(255,255,255,0.12);
    border:1px solid rgba(255,255,255,0.2);
    color:white; padding:7px 14px; font-size:12.5px;
  }
  .pr-btn-logout:hover { background:rgba(255,255,255,0.2); }

  /* Password */
  .pr-pwd-wrap { position:relative; }
  .pr-pwd-eye {
    position:absolute; right:10px; top:50%; transform:translateY(-50%);
    background:none; border:none; cursor:pointer; color:#94A3B8; padding:4px;
    display:flex; align-items:center; transition:color 0.15s;
  }
  .pr-pwd-eye:hover { color:#475569; }

  /* Strength checks */
  .pr-check-ok   { color:#10B981; font-size:11px; font-weight:500; }
  .pr-check-fail { color:#94A3B8; font-size:11px; }

  /* Alert */
  .pr-alert {
    display:flex; align-items:center; gap:8px;
    padding:9px 13px; border-radius:10px; margin-bottom:14px;
    font-size:13px; font-weight:500; animation:fadeIn 0.2s ease;
  }
  .pr-alert-success { background:#ECFDF5; border:1px solid #A7F3D0; color:#065F46; }
  .pr-alert-error   { background:#FEF2F2; border:1px solid #FECACA; color:#B91C1C; }

  /* Info strip */
  .pr-info-strip {
    display:flex; border-top:1px solid #F1F5F9;
  }
  .pr-info-cell {
    flex:1; padding:10px 16px;
    border-right:1px solid #F1F5F9;
    display:flex; flex-direction:column; gap:1px;
  }
  .pr-info-cell:last-child { border-right:none; }
  .pr-info-key { font-size:10.5px; color:#94A3B8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
  .pr-info-val { font-size:12.5px; color:#0F172A; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  /* Badge */
  .pr-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }

  /* Grid */
  .pr-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; align-items:start; }
  .pr-grid-full { grid-column:1 / -1; }
  @media (max-width:640px) {
    .pr-grid { grid-template-columns:1fr; }
    .pr-grid-full { grid-column:1; }
    .pr-hero { padding:22px 18px 18px; }
  }
`;

/* ─── Helpers ───────────────────────────────────────────────────── */
function Alert({ type, message }) {
  return (
    <div className={`pr-alert pr-alert-${type}`}>
      {type === "success"
        ? <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      {message}
    </div>
  );
}

function Spinner() {
  return <div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />;
}

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function PasswordInput({ value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pr-pwd-wrap">
      <input className="pr-input" type={show ? "text" : "password"}
        placeholder="••••••••" value={value} onChange={onChange}
        style={{ paddingRight:38 }} />
      <button type="button" className="pr-pwd-eye" onClick={() => setShow(s => !s)}>
        <EyeIcon visible={show} />
      </button>
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    { label:"12 caractères min.", ok: password.length >= 12 },
    { label:"Majuscule",          ok: /[A-Z]/.test(password) },
    { label:"Minuscule",          ok: /[a-z]/.test(password) },
    { label:"Chiffre",            ok: /[0-9]/.test(password) },
    { label:"Caractère spécial",  ok: /[@$!%*#?&^_\-+=]/.test(password) },
  ];
  if (!password) return null;
  const score = checks.filter(c => c.ok).length;
  const colors = ["#EF4444","#F97316","#EAB308","#22C55E","#10B981"];
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:"flex", gap:3, marginBottom:6 }}>
        {checks.map((_, i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i < score ? colors[score-1] : "#E2E8F0", transition:"background 0.2s" }} />
        ))}
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 12px" }}>
        {checks.map(c => (
          <span key={c.label} className={c.ok ? "pr-check-ok" : "pr-check-fail"}>
            {c.ok ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChangePasswordForm({ roleColor, roleGlow }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [form, setForm] = useState({ current_password:"", password:"", password_confirmation:"" });
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.current_password) return "Saisissez votre mot de passe actuel.";
    if (form.password.length < 12) return "12 caractères minimum.";
    if (!/[A-Z]/.test(form.password)) return "Ajoutez une majuscule.";
    if (!/[a-z]/.test(form.password)) return "Ajoutez une minuscule.";
    if (!/[0-9]/.test(form.password)) return "Ajoutez un chiffre.";
    if (!/[@$!%*#?&^_\-+=]/.test(form.password)) return "Ajoutez un caractère spécial.";
    if (form.password !== form.password_confirmation) return "Les mots de passe ne correspondent pas.";
    return null;
  };

  const handleSubmit = async () => {
    setSuccess(""); setError("");
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await API.post("/auth/change-password", form);
      setSuccess("Mot de passe mis à jour. Reconnexion dans 3s…");
      setTimeout(() => { logout(); navigate("/"); }, 3000);
    } catch (e) {
      setError(e.response?.data?.message ?? "Erreur lors du changement.");
    } finally { setLoading(false); }
  };

  return (
    <>
      {success && <Alert type="success" message={success} />}
      {error   && <Alert type="error"   message={error} />}
      <div className="pr-field">
        <label className="pr-label">Mot de passe actuel</label>
        <PasswordInput value={form.current_password} onChange={e => setForm({ ...form, current_password:e.target.value })} />
      </div>
      <div className="pr-field">
        <label className="pr-label">Nouveau mot de passe</label>
        <PasswordInput value={form.password} onChange={e => setForm({ ...form, password:e.target.value })} />
        <PasswordStrength password={form.password} />
      </div>
      <div className="pr-field" style={{ marginBottom:18 }}>
        <label className="pr-label">Confirmation</label>
        <PasswordInput value={form.password_confirmation} onChange={e => setForm({ ...form, password_confirmation:e.target.value })} />
        {form.password_confirmation && (
          <p style={{ fontSize:11, marginTop:4, color: form.password === form.password_confirmation ? "#10B981" : "#EF4444" }}>
            {form.password === form.password_confirmation ? "✓ Correspondent" : "✗ Ne correspondent pas"}
          </p>
        )}
      </div>
      <button className="pr-btn pr-btn-primary pr-btn-full" onClick={handleSubmit} disabled={loading}
        style={{ background:roleColor, boxShadow:`0 2px 8px ${roleGlow}` }}>
        {loading ? <><Spinner />Mise à jour…</> : "Changer le mot de passe"}
      </button>
    </>
  );
}

/* ─── Page principale ───────────────────────────────────────────── */
export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm]           = useState({ nom:"", email:"" });
  const [success, setSuccess]     = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoUrl, setPhotoUrl]   = useState(null);

  const roleConf = getRoleConfig(user?.role);
  // Couleur CSS var pour glow semi-transparent
  const roleGlow = roleConf.color + "33";

  useEffect(() => {
    API.get("/user").then(res => {
      setForm({ nom:res.data.nom || "", email:res.data.email || "" });
      setPhotoUrl(buildPhotoUrl(res.data.photo));
    });
  }, []);

  const updateProfile = async () => {
    setSuccess(""); setError(""); setLoading(true);
    try {
      await API.put("/user", form);
      setSuccess("Profil mis à jour.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message ?? "Erreur.");
    } finally { setLoading(false); }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (!["image/jpeg","image/png","image/jpg","image/webp"].includes(file.type)) { setError("Format non supporté. JPG, PNG ou WebP."); return; }
    if (file.size > 2*1024*1024) { setError("2 Mo maximum."); return; }
    setPhotoLoading(true);
    try {
      const fd = new FormData(); fd.append("photo", file);
      const res = await API.post("/user/photo", fd, { headers:{ "Content-Type":"multipart/form-data" } });
      setPhotoUrl(res.data.photo);
      setSuccess("Photo mise à jour !"); setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Erreur lors de l'upload."); }
    finally { setPhotoLoading(false); e.target.value = ""; }
  };

  const handleLogout = async () => {
    try { await API.post("/logout"); } catch {}
    finally { logout(); navigate("/"); }
  };

  // CSS variables injectées dynamiquement selon le rôle
  const roleVars = {
    "--role-color": roleConf.color,
    "--role-bg":    roleConf.bg,
    "--role-glow":  roleGlow,
    "--hero-from":  roleConf.heroFrom,
    "--hero-to":    roleConf.heroTo,
  };

  return (
    <Layout>
      <style>{css}</style>
      <div className="pr-root" style={roleVars}>

        <div style={{ marginBottom:28 }}>
          <h1 style={{ margin:"0 0 5px", fontSize:20, fontWeight:700, color:"#0F172A", letterSpacing:"-0.4px" }}>Mon profil</h1>
          <p style={{ margin:0, color:"#64748B", fontSize:13.5 }}>Gérez vos informations et votre sécurité.</p>
        </div>

        {/* Alertes globales */}
        {success && <Alert type="success" message={success} />}
        {error   && <Alert type="error"   message={error} />}

        <div style={{ maxWidth:700 }}>
          <div className="pr-grid">

            {/* ── Hero ── */}
            <div className="pr-card pr-grid-full">
              <div className="pr-hero">
                <div style={{ display:"flex", alignItems:"center", gap:18, position:"relative", zIndex:1 }}>

                  {/* Avatar */}
                  <div className="pr-avatar-ring">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Photo" className="pr-avatar-img" onError={() => setPhotoUrl(null)} />
                    ) : (
                      <div className="pr-avatar-placeholder" style={{ background:roleConf.avatarBg }}>
                        {user?.nom?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button className="pr-avatar-edit" onClick={() => fileInputRef.current?.click()} disabled={photoLoading} title="Changer la photo">
                      {photoLoading
                        ? <div style={{ width:8, height:8, border:"1.5px solid #94A3B8", borderTopColor:roleConf.color, borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                        : <svg width="10" height="10" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      }
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handlePhotoChange} style={{ display:"none" }} />
                  </div>

                  {/* Infos hero */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:18, fontWeight:700, color:"white", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", letterSpacing:"-0.3px" }}>
                      {user?.nom}
                    </div>
                    <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.55)", marginBottom:10 }}>
                      @{user?.username}
                    </div>
                    <span className="pr-badge" style={{ background:"rgba(255,255,255,0.15)", color:"white", border:"1px solid rgba(255,255,255,0.2)" }}>
                      {roleConf.label}
                    </span>
                  </div>

                  {/* Bouton déconnexion */}
                  <button className="pr-btn pr-btn-logout" onClick={handleLogout} style={{ flexShrink:0 }}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Déconnexion
                  </button>
                </div>
              </div>

              {/* Info strip */}
              <div className="pr-info-strip">
                {[
                  { key:"Email",  val: user?.email ?? "—" },
                  { key:"Rôle",   val: roleConf.label },
                  { key:"Statut", val: "Actif" },
                ].map(item => (
                  <div key={item.key} className="pr-info-cell">
                    <span className="pr-info-key">{item.key}</span>
                    <span className="pr-info-val">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Informations ── */}
            <div className="pr-card">
              <div className="pr-section-head">
                <span className="pr-section-icon">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <p className="pr-section-title">Informations personnelles</p>
              </div>
              <div className="pr-body">
                <div className="pr-field">
                  <label className="pr-label">Nom complet</label>
                  <input className="pr-input" value={form.nom} onChange={e => setForm({ ...form, nom:e.target.value })} />
                </div>
                <div className="pr-field">
                  <label className="pr-label">Email</label>
                  <input className="pr-input" type="email" value={form.email} onChange={e => setForm({ ...form, email:e.target.value })} />
                </div>
                <div className="pr-field" style={{ marginBottom:18 }}>
                  <label className="pr-label">Username</label>
                  <input className="pr-input" value={user?.username ?? ""} disabled />
                  <p style={{ fontSize:11, color:"#94A3B8", margin:"3px 0 0" }}>Non modifiable</p>
                </div>
                <button className="pr-btn pr-btn-primary pr-btn-full" onClick={updateProfile} disabled={loading}>
                  {loading ? <><Spinner />Enregistrement…</> : "Enregistrer"}
                </button>
              </div>
            </div>

            {/* ── Sécurité ── */}
            <div className="pr-card">
              <div className="pr-section-head">
                <span className="pr-section-icon">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <p className="pr-section-title">Sécurité</p>
              </div>
              <div className="pr-body">
                <ChangePasswordForm roleColor={roleConf.color} roleGlow={roleGlow} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}