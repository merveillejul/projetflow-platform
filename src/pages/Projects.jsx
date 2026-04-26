import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const STATUT_CONFIG = {
  en_attente: { label:"En attente", color:"#D97706", bg:"#FFFBEB", border:"#FDE68A", dot:"#F59E0B" },
  en_cours:   { label:"En cours",   color:"#4F46E5", bg:"#EEF2FF", border:"#C7D2FE", dot:"#6366F1" },
  termine:    { label:"Terminé",    color:"#059669", bg:"#ECFDF5", border:"#A7F3D0", dot:"#10B981" },
  suspendu:   { label:"Suspendu",   color:"#DC2626", bg:"#FEF2F2", border:"#FECACA", dot:"#EF4444" },
};

const STATUTS = [
  { value:"tous",       label:"Tous" },
  { value:"en_attente", label:"En attente" },
  { value:"en_cours",   label:"En cours" },
  { value:"termine",    label:"Terminé" },
  { value:"suspendu",   label:"Suspendu" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .pj-root { font-family:'DM Sans',system-ui,sans-serif; }
  .pj-card {
    background:#fff; border:1px solid #E2E8F0; border-radius:14px;
    padding:18px 22px 18px 26px; position:relative; overflow:hidden;
    transition:box-shadow 0.2s,border-color 0.2s,transform 0.15s;
    animation:fadeUp 0.28s ease both;
  }
  .pj-card:hover { box-shadow:0 6px 24px rgba(0,0,0,0.07); border-color:#C7D2FE; transform:translateY(-1px); }
  .pj-accent { position:absolute; left:0; top:0; bottom:0; width:3px; border-radius:0; }
  .pj-btn-new {
    display:flex; align-items:center; gap:7px;
    background:#0F172A; color:#fff; border:none;
    padding:9px 18px; border-radius:10px; cursor:pointer;
    font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif;
    white-space:nowrap; letter-spacing:-0.1px;
    transition:background 0.15s,transform 0.1s;
    box-shadow:0 2px 8px rgba(15,23,42,0.15);
  }
  .pj-btn-new:hover { background:#1E293B; transform:translateY(-1px); }
  .pj-btn-edit {
    padding:5px 12px; border-radius:7px; border:1px solid #E2E8F0;
    color:#475569; background:#FAFAFA; cursor:pointer;
    font-size:12px; font-weight:500; font-family:'DM Sans',sans-serif;
    transition:background 0.15s,border-color 0.15s;
  }
  .pj-btn-edit:hover { background:#F1F5F9; border-color:#CBD5E1; }
  .pj-btn-del {
    padding:5px 12px; border-radius:7px; border:1px solid #FECACA;
    color:#EF4444; background:#fff; cursor:pointer;
    font-size:12px; font-weight:500; font-family:'DM Sans',sans-serif;
    transition:background 0.15s;
  }
  .pj-btn-del:hover { background:#FEF2F2; }
  .pj-search {
    width:100%; padding:9px 14px 9px 38px; border-radius:10px;
    border:1px solid #E2E8F0; font-size:13px; outline:none;
    background:#FAFAFA; color:#0F172A; font-family:'DM Sans',sans-serif;
    transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
  }
  .pj-search:focus { border-color:#6366F1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); background:#fff; }
  .pj-search::placeholder { color:#CBD5E1; }
  .pj-filter {
    padding:6px 13px; border-radius:8px; cursor:pointer;
    font-size:12.5px; font-weight:500; border:1px solid #E2E8F0;
    background:#fff; color:#64748B; font-family:'DM Sans',sans-serif;
    transition:all 0.15s;
  }
  .pj-filter:hover { background:#F8FAFC; border-color:#CBD5E1; }
  .pj-tech { background:#EEF2FF; color:#4F46E5; border:1px solid #C7D2FE; padding:2px 8px; border-radius:5px; font-size:11px; font-weight:500; }
  .pj-link-btn { padding:5px 12px; border-radius:7px; border:1px solid #E2E8F0; color:#475569; background:#FAFAFA; font-size:12px; font-weight:500; text-decoration:none; white-space:nowrap; transition:background 0.15s; font-family:'DM Sans',sans-serif; }
  .pj-link-btn:hover { background:#F1F5F9; }
  .pj-empty { background:#fff; border:1.5px dashed #E2E8F0; border-radius:16px; padding:56px; text-align:center; }
`;

const StatutBadge = ({ statut }) => {
  const c = STATUT_CONFIG[statut]; if (!c) return null;
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, padding:"3px 10px", borderRadius:20, fontSize:11.5, fontWeight:600, flexShrink:0 }}>{c.label}</span>;
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("tous");
  const { user } = useAuth();
  const navigate = useNavigate();
  const isChef = user?.role === "chef";

  useEffect(() => {
    API.get("/projects").then(res => setProjects(res.data)).catch(console.log).finally(() => setLoading(false));
  }, []);

  const deleteProject = async (id) => {
    if (!window.confirm("Supprimer ce projet ?")) return;
    await API.delete(`/projects/${id}`);
    setProjects(projects.filter(p => p.id !== id));
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.titre.toLowerCase().includes(search.toLowerCase()) || (p.description ?? "").toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterStatut === "tous" || p.statut === filterStatut);
  });

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
      <div className="pj-root">

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
          <div>
            <h1 style={{ margin:"0 0 5px", fontSize:20, fontWeight:700, color:"#0F172A", letterSpacing:"-0.4px" }}>Mes projets</h1>
            <p style={{ margin:0, color:"#64748B", fontSize:13.5 }}>
              {user?.role === "membre" ? "Projets auxquels vous participez" : "Projets que vous gérez"}
            </p>
          </div>
          {isChef && (
            <button className="pj-btn-new" onClick={() => navigate("/create-project")}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nouveau projet
            </button>
          )}
        </div>

        <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <svg width="14" height="14" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
              style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="pj-search" type="text" placeholder="Rechercher un projet..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {STATUTS.map(s => {
              const c = STATUT_CONFIG[s.value];
              const isActive = filterStatut === s.value;
              return (
                <button key={s.value} className="pj-filter" onClick={() => setFilterStatut(s.value)}
                  style={isActive ? { background:s.value==="tous"?"#0F172A":c.bg, color:s.value==="tous"?"#fff":c.color, border:`1px solid ${s.value==="tous"?"#0F172A":c.border}`, fontWeight:600 } : {}}>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <p style={{ color:"#94A3B8", fontSize:12.5, marginBottom:16 }}>
          {filtered.length} projet{filtered.length !== 1 ? "s" : ""}
          {search && <span style={{ color:"#64748B" }}> · « {search} »</span>}
        </p>

        {filtered.length === 0 ? (
          <div className="pj-empty">
            <p style={{ margin:"0 0 16px", color:"#94A3B8", fontSize:13.5 }}>Aucun projet ne correspond à votre recherche.</p>
            <button onClick={() => { setSearch(""); setFilterStatut("tous"); }}
              style={{ padding:"8px 18px", background:"#fff", border:"1px solid #E2E8F0", borderRadius:8, cursor:"pointer", color:"#475569", fontSize:13, fontWeight:500, fontFamily:"'DM Sans',sans-serif" }}>
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {filtered.map((project, idx) => {
              const sc = STATUT_CONFIG[project.statut];
              return (
                <div key={project.id} className="pj-card" style={{ animationDelay:`${idx*0.05}s` }}>
                  <div className="pj-accent" style={{ background: sc?.dot ?? "#E2E8F0" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ flex:1, minWidth:0, paddingRight:16 }}>
                      <Link to={`/projects/${project.id}`}
                        style={{ fontWeight:600, fontSize:14.5, color:"#0F172A", textDecoration:"none", letterSpacing:"-0.2px", transition:"color 0.15s" }}
                        onMouseEnter={e => e.target.style.color="#6366F1"}
                        onMouseLeave={e => e.target.style.color="#0F172A"}>
                        {project.titre}
                      </Link>
                      {project.description && (
                        <p style={{ margin:"4px 0 0", fontSize:13, color:"#64748B", lineHeight:1.55, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                    <StatutBadge statut={project.statut} />
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <svg width="11" height="11" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span style={{ fontSize:12, color:"#94A3B8" }}>{project.date_debut} — {project.date_fin}</span>
                    </div>
                    {project.technologies?.length > 0 && (
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {project.technologies.slice(0,4).map((t,i) => <span key={i} className="pj-tech">{t}</span>)}
                        {project.technologies.length > 4 && <span style={{ fontSize:11, color:"#94A3B8", padding:"2px 4px" }}>+{project.technologies.length-4}</span>}
                      </div>
                    )}
                    {project.members?.length > 0 && (
                      <div style={{ display:"flex", alignItems:"center" }}>
                        {project.members.slice(0,4).map((m,i) => (
                          <div key={m.id} title={m.nom} style={{ width:22, height:22, borderRadius:"50%", background:"#E0E7FF", color:"#3730A3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9.5, fontWeight:700, border:"2px solid #fff", marginLeft:i>0?-6:0, zIndex:4-i, position:"relative" }}>
                            {m.nom?.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project.members.length > 4 && <span style={{ fontSize:11, color:"#94A3B8", marginLeft:5 }}>+{project.members.length-4}</span>}
                      </div>
                    )}
                    <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                      {isChef && (
                        <>
                          <button className="pj-btn-edit" onClick={() => navigate(`/edit-project/${project.id}`)}>Modifier</button>
                          <button className="pj-btn-del" onClick={() => deleteProject(project.id)}>Supprimer</button>
                        </>
                      )}
                      {user?.role === "membre" && <Link to={`/projects/${project.id}`} className="pj-link-btn">Voir</Link>}
                    </div>
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