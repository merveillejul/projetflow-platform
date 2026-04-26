import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import Layout from "../components/Layout";

const STATUTS = [
  { value:"en_attente", label:"En attente", color:"#D97706", bg:"#FFFBEB", border:"#FDE68A" },
  { value:"en_cours",   label:"En cours",   color:"#4F46E5", bg:"#EEF2FF", border:"#C7D2FE" },
  { value:"termine",    label:"Terminé",    color:"#059669", bg:"#ECFDF5", border:"#A7F3D0" },
  { value:"suspendu",   label:"Suspendu",   color:"#DC2626", bg:"#FEF2F2", border:"#FECACA" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .ep-root { font-family:'DM Sans',system-ui,sans-serif; animation:fadeUp 0.3s ease; }
  .ep-section { background:#fff; border:1px solid #E2E8F0; border-radius:14px; padding:24px 26px; margin-bottom:14px; }
  .ep-section-head { display:flex; align-items:center; gap:10px; margin:0 0 6px; font-size:13.5px; font-weight:600; color:#0F172A; }
  .ep-section-icon { width:28px; height:28px; border-radius:8px; background:#EEF2FF; color:#6366F1; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .ep-divider { height:1px; background:#F1F5F9; margin:14px 0 20px; }
  .ep-input {
    width:100%; padding:10px 14px; border-radius:10px;
    border:1px solid #E2E8F0; box-sizing:border-box;
    font-size:13.5px; color:#1E293B; background:#FAFAFA; outline:none;
    font-family:'DM Sans',sans-serif;
    transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
  }
  .ep-input:focus { border-color:#6366F1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); background:#fff; }
  .ep-input::placeholder { color:#CBD5E1; }
  .ep-btn-primary {
    flex:1; padding:12px 20px; background:#0F172A; color:#fff;
    border:none; border-radius:10px; cursor:pointer;
    font-size:13.5px; font-weight:600; font-family:'DM Sans',sans-serif;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:background 0.15s,transform 0.1s; box-shadow:0 2px 8px rgba(15,23,42,0.15);
  }
  .ep-btn-primary:hover:not(:disabled) { background:#1E293B; transform:translateY(-1px); }
  .ep-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
  .ep-btn-secondary {
    padding:12px 24px; background:#fff; border:1px solid #E2E8F0;
    border-radius:10px; cursor:pointer; font-size:13.5px; color:#64748B;
    font-family:'DM Sans',sans-serif; transition:all 0.15s;
  }
  .ep-btn-secondary:hover { background:#F8FAFC; border-color:#CBD5E1; }
  .ep-back {
    background:none; border:none; cursor:pointer; padding:0;
    display:flex; align-items:center; gap:6px; font-size:13px;
    color:#94A3B8; font-family:'DM Sans',sans-serif;
    margin-bottom:18px; transition:color 0.15s;
  }
  .ep-back:hover { color:#475569; }
  .ep-statut-btn {
    padding:10px; border-radius:9px; cursor:pointer; font-size:12.5px;
    font-weight:500; text-align:center; border:1px solid #E2E8F0;
    background:#FAFAFA; color:#64748B; font-family:'DM Sans',sans-serif;
    transition:all 0.15s; display:flex; align-items:center; justify-content:center; gap:5px;
  }
  .ep-statut-btn:hover:not(.active) { border-color:#CBD5E1; background:#F1F5F9; }
  .ep-tech { background:#EEF2FF; color:#4F46E5; border:1px solid #C7D2FE; border-radius:6px; padding:3px 9px; font-size:11.5px; font-weight:500; }
`;

const lbl = { display:"block", marginBottom:7, fontWeight:500, fontSize:12.5, color:"#475569" };

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ titre:"", description:"", technologies:"", date_debut:"", date_fin:"", budget:"", statut:"en_cours" });

  useEffect(() => {
    API.get(`/projects/${id}`).then(res => {
      const p = res.data;
      setForm({ titre:p.titre??"", description:p.description??"", technologies:Array.isArray(p.technologies)?p.technologies.join(", "):"", date_debut:p.date_debut??"", date_fin:p.date_fin??"", budget:p.budget??"", statut:p.statut??"en_cours" });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      await API.put(`/projects/${id}`, { ...form, technologies: form.technologies.split(",").map(t => t.trim()).filter(Boolean) });
      setSuccess("Projet modifié avec succès !");
      setTimeout(() => navigate("/projects"), 1000);
    } catch (err) {
      setError(err.response?.data?.message ?? "Erreur lors de la modification.");
    } finally { setSaving(false); }
  };

  const techTags      = form.technologies.split(",").map(t => t.trim()).filter(Boolean);
  const currentStatut = STATUTS.find(s => s.value === form.statut);

  if (loading) return (
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:10, color:"#94A3B8", fontSize:14, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:16, height:16, border:"2px solid #E2E8F0", borderTopColor:"#6366F1", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        Chargement...
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{css}</style>
      <div className="ep-root">

        <button className="ep-back" onClick={() => navigate("/projects")}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Retour aux projets
        </button>

        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
            <h1 style={{ margin:0, fontSize:20, fontWeight:700, color:"#0F172A", letterSpacing:"-0.4px" }}>Modifier le projet</h1>
            {currentStatut && (
              <span style={{ background:currentStatut.bg, color:currentStatut.color, border:`1px solid ${currentStatut.border}`, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600 }}>
                {currentStatut.label}
              </span>
            )}
          </div>
        </div>

        <div style={{ maxWidth:620 }}>

          {error && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:9, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"11px 14px", marginBottom:16 }}>
              <svg width="15" height="15" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ color:"#B91C1C", fontSize:13 }}>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ display:"flex", alignItems:"center", gap:9, background:"#ECFDF5", border:"1px solid #A7F3D0", borderRadius:10, padding:"11px 14px", marginBottom:16 }}>
              <svg width="15" height="15" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ color:"#065F46", fontSize:13, fontWeight:500 }}>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Informations générales */}
            <div className="ep-section">
              <h3 className="ep-section-head">
                <span className="ep-section-icon">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </span>
                Informations générales
              </h3>
              <div className="ep-divider" />
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div>
                  <label style={lbl}>Titre <span style={{ color:"#EF4444" }}>*</span></label>
                  <input className="ep-input" name="titre" value={form.titre} onChange={handleChange} required />
                </div>
                <div>
                  <label style={lbl}>Description</label>
                  <textarea className="ep-input" name="description" value={form.description} onChange={handleChange} rows={3} style={{ resize:"vertical", fontFamily:"inherit" }} />
                </div>
                <div>
                  <label style={lbl}>Technologies</label>
                  <input className="ep-input" name="technologies" value={form.technologies} onChange={handleChange} placeholder="Laravel, React, MySQL..." />
                  {techTags.length > 0 ? (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:9 }}>
                      {techTags.map((t, i) => <span key={i} className="ep-tech">{t}</span>)}
                    </div>
                  ) : (
                    <p style={{ margin:"6px 0 0", fontSize:12, color:"#94A3B8" }}>Séparez chaque technologie par une virgule</p>
                  )}
                </div>
              </div>
            </div>

            {/* Planning & Budget */}
            <div className="ep-section">
              <h3 className="ep-section-head">
                <span className="ep-section-icon">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                Planning & Budget
              </h3>
              <div className="ep-divider" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
                <div>
                  <label style={lbl}>Date de début <span style={{ color:"#EF4444" }}>*</span></label>
                  <input className="ep-input" type="date" name="date_debut" value={form.date_debut} onChange={handleChange} required />
                </div>
                <div>
                  <label style={lbl}>Date de fin <span style={{ color:"#EF4444" }}>*</span></label>
                  <input className="ep-input" type="date" name="date_fin" value={form.date_fin} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label style={lbl}>Budget (€)</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"#94A3B8", pointerEvents:"none" }}>€</span>
                  <input className="ep-input" type="number" name="budget" value={form.budget} onChange={handleChange} placeholder="0" style={{ paddingLeft:28 }} />
                </div>
              </div>
            </div>

            {/* Statut */}
            <div className="ep-section">
              <h3 className="ep-section-head">
                <span className="ep-section-icon">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                Statut du projet
              </h3>
              <div className="ep-divider" />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {STATUTS.map(s => {
                  const isActive = form.statut === s.value;
                  return (
                    <button key={s.value} type="button"
                      className={`ep-statut-btn${isActive ? " active" : ""}`}
                      onClick={() => setForm({ ...form, statut:s.value })}
                      style={isActive ? { border:`1.5px solid ${s.color}`, background:s.bg, color:s.color, fontWeight:600 } : {}}>
                      {isActive && <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <button type="submit" disabled={saving} className="ep-btn-primary">
                {saving ? (
                  <><div style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />Enregistrement...</>
                ) : (
                  <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Enregistrer les modifications</>
                )}
              </button>
              <button type="button" onClick={() => navigate("/projects")} className="ep-btn-secondary">Annuler</button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
}