import { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";

const STATUT_CONFIG = {
  a_faire:  { label:"À faire",  color:"#D97706", bg:"#FFFBEB", border:"#FDE68A", dot:"#F59E0B" },
  en_cours: { label:"En cours", color:"#4F46E5", bg:"#EEF2FF", border:"#C7D2FE", dot:"#6366F1" },
  termine:  { label:"Terminé",  color:"#059669", bg:"#ECFDF5", border:"#A7F3D0", dot:"#10B981" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .tk-root { font-family:'DM Sans',system-ui,sans-serif; }
  .tk-card {
    background:#fff; border:1px solid #E2E8F0; border-radius:14px;
    padding:18px 22px 18px 26px; position:relative; overflow:hidden;
    transition:box-shadow 0.2s,border-color 0.2s,transform 0.15s;
    animation:fadeUp 0.28s ease both;
  }
  .tk-card:hover { box-shadow:0 6px 24px rgba(0,0,0,0.07); border-color:#C7D2FE; transform:translateY(-1px); }
  .tk-accent { position:absolute; left:0; top:0; bottom:0; width:3px; border-radius:0; }
  .tk-filter {
    display:flex; align-items:center; gap:6px;
    padding:7px 14px; border-radius:9px; font-size:12.5px; font-weight:500;
    cursor:pointer; border:1px solid #E2E8F0; background:#fff; color:#64748B;
    font-family:'DM Sans',sans-serif; transition:all 0.15s;
  }
  .tk-filter:hover { background:#F8FAFC; }
  .tk-s-btn {
    display:flex; align-items:center; gap:5px;
    padding:5px 11px; border-radius:7px; font-size:12px; font-weight:500;
    cursor:pointer; border:1px solid #E2E8F0; background:#fff; color:#94A3B8;
    font-family:'DM Sans',sans-serif; transition:all 0.15s;
  }
  .tk-s-btn:hover:not(.active) { background:#F8FAFC; }
  .tk-empty { background:#fff; border:1.5px dashed #E2E8F0; border-radius:16px; padding:56px; text-align:center; }
`;

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const res = await API.get("/my-tasks");
      setTasks(res.data.map(t => ({ ...t, projectTitre: t.project?.titre ?? "Projet inconnu" })));
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const updateStatut = async (taskId, statut) => {
    await API.put(`/tasks/${taskId}`, { statut });
    loadTasks();
  };

  const filtered = filter === "tous" ? tasks : tasks.filter(t => t.statut === filter);
  const counts = {
    tous:     tasks.length,
    a_faire:  tasks.filter(t => t.statut === "a_faire").length,
    en_cours: tasks.filter(t => t.statut === "en_cours").length,
    termine:  tasks.filter(t => t.statut === "termine").length,
  };

  const filterOptions = [
    { value:"tous",     label:"Toutes",   dot:"#94A3B8", activeBg:"#0F172A",   activeColor:"#fff",    activeBorder:"#0F172A" },
    { value:"a_faire",  label:"À faire",  dot:"#F59E0B", activeBg:"#FFFBEB",   activeColor:"#D97706", activeBorder:"#FDE68A" },
    { value:"en_cours", label:"En cours", dot:"#6366F1", activeBg:"#EEF2FF",   activeColor:"#4F46E5", activeBorder:"#C7D2FE" },
    { value:"termine",  label:"Terminé",  dot:"#10B981", activeBg:"#ECFDF5",   activeColor:"#059669", activeBorder:"#A7F3D0" },
  ];

  if (loading) return (
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:10, color:"#94A3B8", fontSize:13.5, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:16, height:16, border:"2px solid #E2E8F0", borderTopColor:"#6366F1", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        Chargement...
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{css}</style>
      <div className="tk-root">

        <div style={{ marginBottom:32 }}>
          <h1 style={{ margin:"0 0 5px", fontSize:20, fontWeight:700, color:"#0F172A", letterSpacing:"-0.4px" }}>Mes tâches</h1>
          <p style={{ margin:0, color:"#64748B", fontSize:13.5 }}>
            {tasks.length} tâche{tasks.length !== 1 ? "s" : ""} assignée{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>

        {tasks.length > 0 && (
          <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
            {filterOptions.map(f => {
              const isActive = filter === f.value;
              return (
                <button key={f.value} className="tk-filter" onClick={() => setFilter(f.value)}
                  style={isActive ? { background:f.activeBg, color:f.activeColor, border:`1px solid ${f.activeBorder}`, fontWeight:600 } : {}}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background: isActive ? (f.value==="tous" ? "rgba(255,255,255,0.5)" : f.dot) : f.dot, flexShrink:0 }} />
                  {f.label}
                  <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:18, height:18, padding:"0 5px", borderRadius:20, fontSize:10.5, fontWeight:700, background: isActive ? "rgba(0,0,0,0.08)" : "#F1F5F9", color: isActive ? f.activeColor : "#64748B" }}>
                    {counts[f.value]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="tk-empty">
            <div style={{ width:44, height:44, borderRadius:12, background:"#F8FAFC", border:"1px solid #E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
              <svg width="18" height="18" fill="none" stroke="#CBD5E1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <p style={{ margin:0, color:"#94A3B8", fontSize:13.5 }}>
              {filter === "tous" ? "Aucune tâche assignée pour le moment." : "Aucune tâche dans cette catégorie."}
            </p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {filtered.map((task, idx) => {
              const conf = STATUT_CONFIG[task.statut];
              return (
                <div key={task.id} className="tk-card" style={{ animationDelay:`${idx*0.05}s` }}>
                  <div className="tk-accent" style={{ background: conf?.dot ?? "#E2E8F0" }} />

                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div style={{ flex:1, minWidth:0, paddingRight:14 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                        <svg width="10" height="10" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        <span style={{ fontSize:11.5, color:"#94A3B8", fontWeight:500 }}>{task.projectTitre}</span>
                      </div>
                      <h3 style={{ margin:0, fontSize:14.5, fontWeight:600, color:"#0F172A", letterSpacing:"-0.2px" }}>{task.titre}</h3>
                      {task.description && <p style={{ margin:"4px 0 0", fontSize:13, color:"#64748B", lineHeight:1.55 }}>{task.description}</p>}
                    </div>
                    {conf && (
                      <span style={{ background:conf.bg, color:conf.color, border:`1px solid ${conf.border}`, padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:600, flexShrink:0 }}>
                        {conf.label}
                      </span>
                    )}
                  </div>

                  {task.date_echeance && (
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:14 }}>
                      <svg width="11" height="11" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span style={{ fontSize:12, color:"#94A3B8" }}>Échéance : {task.date_echeance}</span>
                    </div>
                  )}

                  <div style={{ height:1, background:"#F1F5F9", marginBottom:12 }} />

                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {Object.entries(STATUT_CONFIG).map(([key, c]) => {
                      const isActive = task.statut === key;
                      return (
                        <button key={key} className={`tk-s-btn${isActive ? " active" : ""}`}
                          onClick={() => !isActive && updateStatut(task.id, key)}
                          style={isActive ? { background:c.bg, color:c.color, border:`1px solid ${c.border}`, fontWeight:600, cursor:"default" } : {}}>
                          {isActive && <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>}
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}