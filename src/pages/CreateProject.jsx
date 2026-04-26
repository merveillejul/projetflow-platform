import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .cp-root { font-family:'DM Sans',system-ui,sans-serif; animation:fadeUp 0.3s ease; }
  .cp-section { background:#fff; border:1px solid #E2E8F0; border-radius:14px; padding:24px 26px; margin-bottom:14px; }
  .cp-section-head { display:flex; align-items:center; gap:10px; margin:0 0 6px; font-size:13.5px; font-weight:600; color:#0F172A; }
  .cp-section-icon { width:28px; height:28px; border-radius:8px; background:#EEF2FF; color:#6366F1; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .cp-divider { height:1px; background:#F1F5F9; margin:14px 0 20px; }
  .cp-input {
    width:100%; padding:10px 14px; border-radius:10px;
    border:1px solid #E2E8F0; box-sizing:border-box;
    font-size:13.5px; color:#1E293B; background:#FAFAFA; outline:none;
    font-family:'DM Sans',sans-serif;
    transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
  }
  .cp-input:focus { border-color:#6366F1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); background:#fff; }
  .cp-input::placeholder { color:#CBD5E1; }
  .cp-btn-primary {
    flex:1; padding:12px 20px; background:#0F172A; color:#fff;
    border:none; border-radius:10px; cursor:pointer;
    font-size:13.5px; font-weight:600; font-family:'DM Sans',sans-serif;
    letter-spacing:-0.1px; display:flex; align-items:center; justify-content:center; gap:8px;
    transition:background 0.15s,transform 0.1s; box-shadow:0 2px 8px rgba(15,23,42,0.15);
  }
  .cp-btn-primary:hover:not(:disabled) { background:#1E293B; transform:translateY(-1px); }
  .cp-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
  .cp-btn-secondary {
    padding:12px 24px; background:#fff; border:1px solid #E2E8F0;
    border-radius:10px; cursor:pointer; font-size:13.5px; color:#64748B;
    font-family:'DM Sans',sans-serif; transition:all 0.15s;
  }
  .cp-btn-secondary:hover { background:#F8FAFC; border-color:#CBD5E1; }
  .cp-back {
    background:none; border:none; cursor:pointer; padding:0;
    display:flex; align-items:center; gap:6px; font-size:13px;
    color:#94A3B8; font-family:'DM Sans',sans-serif;
    margin-bottom:18px; transition:color 0.15s;
  }
  .cp-back:hover { color:#475569; }
  .cp-tech { background:#EEF2FF; color:#4F46E5; border:1px solid #C7D2FE; border-radius:6px; padding:3px 9px; font-size:11.5px; font-weight:500; }
`;

const lbl = { display:"block", marginBottom:7, fontWeight:500, fontSize:12.5, color:"#475569" };

export default function CreateProject() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ titre:"", description:"", technologies:"", date_debut:"", date_fin:"", budget:"" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await API.post("/projects", { ...form, technologies: form.technologies.split(",").map(t => t.trim()).filter(Boolean) });
      navigate("/projects");
    } catch { setError("Erreur lors de la création du projet."); }
    finally { setLoading(false); }
  };

  const techTags = form.technologies.split(",").map(t => t.trim()).filter(Boolean);

  return (
    <Layout>
      <style>{css}</style>
      <div className="cp-root">

        <button className="cp-back" onClick={() => navigate("/projects")}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Retour aux projets
        </button>

        <div style={{ marginBottom:28 }}>
          <h1 style={{ margin:"0 0 5px", fontSize:20, fontWeight:700, color:"#0F172A", letterSpacing:"-0.4px" }}>Créer un projet</h1>
          <p style={{ margin:0, fontSize:13.5, color:"#64748B" }}>Remplissez les informations pour initialiser un nouveau projet.</p>
        </div>

        <div style={{ maxWidth:620 }}>
          {error && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:9, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"11px 14px", marginBottom:16 }}>
              <svg width="15" height="15" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ color:"#B91C1C", fontSize:13 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Informations générales */}
            <div className="cp-section">
              <h3 className="cp-section-head">
                <span className="cp-section-icon">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </span>
                Informations générales
              </h3>
              <div className="cp-divider" />
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div>
                  <label style={lbl}>Titre <span style={{ color:"#EF4444" }}>*</span></label>
                  <input className="cp-input" name="titre" placeholder="Nom du projet" onChange={handleChange} required />
                </div>
                <div>
                  <label style={lbl}>Description</label>
                  <textarea className="cp-input" name="description" placeholder="Décrivez les objectifs et le périmètre du projet..." onChange={handleChange} rows={3} style={{ resize:"vertical", fontFamily:"inherit" }} />
                </div>
                <div>
                  <label style={lbl}>Technologies</label>
                  <input className="cp-input" name="technologies" placeholder="Laravel, React, MySQL..." onChange={handleChange} />
                  {techTags.length > 0 ? (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:9 }}>
                      {techTags.map((t, i) => <span key={i} className="cp-tech">{t}</span>)}
                    </div>
                  ) : (
                    <p style={{ margin:"6px 0 0", fontSize:12, color:"#94A3B8" }}>Séparez chaque technologie par une virgule</p>
                  )}
                </div>
              </div>
            </div>

            {/* Planning & Budget */}
            <div className="cp-section">
              <h3 className="cp-section-head">
                <span className="cp-section-icon">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                Planning & Budget
              </h3>
              <div className="cp-divider" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
                <div>
                  <label style={lbl}>Date de début <span style={{ color:"#EF4444" }}>*</span></label>
                  <input className="cp-input" type="date" name="date_debut" onChange={handleChange} required />
                </div>
                <div>
                  <label style={lbl}>Date de fin <span style={{ color:"#EF4444" }}>*</span></label>
                  <input className="cp-input" type="date" name="date_fin" onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label style={lbl}>Budget (€)</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"#94A3B8", pointerEvents:"none" }}>€</span>
                  <input className="cp-input" type="number" name="budget" placeholder="0" onChange={handleChange} style={{ paddingLeft:28 }} />
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <button type="submit" disabled={loading} className="cp-btn-primary">
                {loading ? (
                  <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />Création en cours...</>
                ) : (
                  <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Créer le projet</>
                )}
              </button>
              <button type="button" onClick={() => navigate("/projects")} className="cp-btn-secondary">Annuler</button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
}