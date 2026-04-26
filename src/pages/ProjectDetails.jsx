import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { formatDateTime } from "../utils/date";

const STATUT_CONFIG = {
  a_faire:  { label:"À faire",  color:"#D97706", bg:"#FFFBEB", border:"#FDE68A" },
  en_cours: { label:"En cours", color:"#4F46E5", bg:"#EEF2FF", border:"#C7D2FE" },
  termine:  { label:"Terminé",  color:"#059669", bg:"#ECFDF5", border:"#A7F3D0" },
};

const PROJET_STATUT_CONFIG = {
  en_attente: { label:"En attente", color:"#D97706", bg:"#FFFBEB", border:"#FDE68A" },
  en_cours:   { label:"En cours",   color:"#4F46E5", bg:"#EEF2FF", border:"#C7D2FE" },
  termine:    { label:"Terminé",    color:"#059669", bg:"#ECFDF5", border:"#A7F3D0" },
  suspendu:   { label:"Suspendu",   color:"#DC2626", bg:"#FEF2F2", border:"#FECACA" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .pd-root { font-family:'DM Sans',system-ui,sans-serif; animation:fadeUp 0.3s ease; }
  .pd-card { background:#fff; border:1px solid #E2E8F0; border-radius:14px; padding:22px 24px; margin-bottom:14px; }
  .pd-section-head { display:flex; align-items:center; gap:9px; margin:0 0 14px; font-size:13.5px; font-weight:600; color:#0F172A; }
  .pd-section-icon { width:26px; height:26px; border-radius:7px; background:#EEF2FF; color:#6366F1; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .pd-divider { height:1px; background:#F1F5F9; margin-bottom:16px; }
  .pd-input {
    padding:8px 12px; border-radius:8px; border:1px solid #E2E8F0;
    font-size:13px; outline:none; background:#FAFAFA; color:#0F172A;
    font-family:'DM Sans',sans-serif; transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
  }
  .pd-input:focus { border-color:#6366F1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); background:#fff; }
  .pd-input::placeholder { color:#CBD5E1; }
  .pd-btn-primary { padding:8px 16px; background:#0F172A; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; transition:background 0.15s; white-space:nowrap; }
  .pd-btn-primary:hover { background:#1E293B; }
  .pd-btn-success { padding:8px 16px; background:#10B981; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; transition:background 0.15s; white-space:nowrap; }
  .pd-btn-success:hover { background:#059669; }
  .pd-btn-info { padding:8px 16px; background:#6366F1; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; transition:background 0.15s; white-space:nowrap; }
  .pd-btn-info:hover { background:#4F46E5; }
  .pd-btn-ghost { padding:5px 11px; background:#FAFAFA; border:1px solid #E2E8F0; border-radius:7px; cursor:pointer; font-size:12px; color:#475569; font-family:'DM Sans',sans-serif; transition:background 0.15s; white-space:nowrap; }
  .pd-btn-ghost:hover { background:#F1F5F9; }
  .pd-btn-danger { background:none; border:none; cursor:pointer; color:#EF4444; font-size:12.5px; padding:4px 7px; border-radius:6px; font-family:'DM Sans',sans-serif; transition:background 0.15s; }
  .pd-btn-danger:hover { background:#FEF2F2; }
  .pd-back { background:none; border:none; cursor:pointer; padding:0; display:flex; align-items:center; gap:6px; font-size:13px; color:#94A3B8; font-family:'DM Sans',sans-serif; margin-bottom:18px; transition:color 0.15s; }
  .pd-back:hover { color:#475569; }
  .pd-task-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #F1F5F9; }
  .pd-task-row:last-child { border-bottom:none; }
  .pd-member-row { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid #F1F5F9; }
  .pd-member-row:last-child { border-bottom:none; }
  .pd-comment { background:#F8FAFC; border:1px solid #F1F5F9; border-radius:10px; padding:11px 14px; margin-bottom:8px; }
  .pd-send-btn { padding:8px 15px; background:#0F172A; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:12.5px; font-weight:600; font-family:'DM Sans',sans-serif; transition:background 0.15s; }
  .pd-send-btn:hover { background:#1E293B; }
  .pd-new-task-bar { display:flex; gap:7px; margin-bottom:16px; flex-wrap:wrap; background:#F8FAFC; padding:12px; border-radius:10px; border:1px solid #F1F5F9; }
`;

const StatutBadge = ({ statut, config }) => {
  const c = config[statut]; if (!c) return null;
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, padding:"2px 9px", borderRadius:20, fontSize:11.5, fontWeight:600, flexShrink:0 }}>{c.label}</span>;
};

const Avatar = ({ name, color="#E2E8F0", textColor="#475569", size=32 }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:color, color:textColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.38, fontWeight:600, flexShrink:0 }}>
    {name?.charAt(0).toUpperCase()}
  </div>
);

function CommentSection({ task }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => { loadComments(); }, [task.id]);

  const loadComments = async () => {
    try { const res = await API.get(`/tasks/${task.id}/comments`); setComments(res.data); }
    catch (err) { console.log(err); }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    await API.post(`/tasks/${task.id}/comments`, { content: newComment });
    setNewComment(""); loadComments();
  };

  const deleteComment = async (id) => {
    await API.delete(`/comments/${id}`); loadComments();
  };

  return (
    <div style={{ marginBottom:22, paddingBottom:22, borderBottom:"1px solid #F1F5F9" }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
        <p style={{ margin:0, fontSize:12.5, fontWeight:600, color:"#0F172A" }}>{task.titre}</p>
        <StatutBadge statut={task.statut} config={STATUT_CONFIG} />
      </div>
      {comments.length === 0 ? (
        <p style={{ fontSize:12.5, color:"#94A3B8", margin:"0 0 10px" }}>Aucun commentaire pour cette tâche.</p>
      ) : comments.map(c => (
        <div key={c.id} className="pd-comment">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Avatar name={c.user?.nom ?? "?"} color="#E0E7FF" textColor="#4338CA" size={24} />
              <span style={{ fontWeight:600, fontSize:12.5, color:"#0F172A" }}>{c.user?.nom ?? "Utilisateur"}</span>
              <span style={{ fontSize:11, color:"#94A3B8" }}>{formatDateTime(c.created_at)}</span>
            </div>
            {(user?.role === "chef" || c.user_id === user?.id) && (
              <button className="pd-btn-danger" onClick={() => deleteComment(c.id)}>Supprimer</button>
            )}
          </div>
          <p style={{ margin:0, fontSize:13, color:"#475569", lineHeight:1.55 }}>{c.content}</p>
        </div>
      ))}
      <div style={{ display:"flex", gap:7, marginTop:8 }}>
        <input className="pd-input" placeholder="Ajouter un commentaire..." value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addComment()}
          style={{ flex:1 }} />
        <button className="pd-send-btn" onClick={addComment}>Envoyer</button>
      </div>
    </div>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [members, setMembers] = useState([]);
  const [users, setUsers]     = useState([]);
  const [files, setFiles]     = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [newTask, setNewTask] = useState({ titre:"", date_echeance:"", assigne_a:"" });
  const [loading, setLoading] = useState(true);

  const isChef   = user?.role === "chef";
  const isMembre = user?.role === "membre";

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [projRes, taskRes, memberRes, filesRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/projects/${id}/tasks`),
        API.get(`/projects/${id}/members`),
        API.get(`/projects/${id}/files`),
      ]);
      setProject(projRes.data); setTasks(taskRes.data);
      setMembers(memberRes.data); setFiles(filesRes.data);
      if (isChef) { const usersRes = await API.get("/users"); setUsers(usersRes.data); }
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const createTask       = async () => { if (!newTask.titre.trim()) return; await API.post("/tasks", { ...newTask, project_id:id }); setNewTask({ titre:"", date_echeance:"", assigne_a:"" }); fetchAll(); };
  const deleteTask       = async (tid) => { if (!window.confirm("Supprimer cette tâche ?")) return; await API.delete(`/tasks/${tid}`); fetchAll(); };
  const updateTaskStatus = async (tid, statut) => { await API.put(`/tasks/${tid}`, { statut }); fetchAll(); };
  const addMember        = async () => { if (!selectedUser) return; await API.post(`/projects/${id}/members`, { user_id:selectedUser }); setSelectedUser(""); fetchAll(); };
  const removeMember     = async (uid) => { await API.delete(`/projects/${id}/members/${uid}`); fetchAll(); };
  const uploadFile       = async () => { if (!selectedFile) return; const fd = new FormData(); fd.append("file", selectedFile); await API.post(`/projects/${id}/files`, fd); setSelectedFile(null); fetchAll(); };
  const downloadFile     = (fid) => window.open(`http://localhost:8000/api/files/${fid}/download`, "_blank");
  const deleteFile       = async (fid) => { await API.delete(`/files/${fid}`); fetchAll(); };

  if (loading) return (
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:10, color:"#94A3B8", fontSize:13.5, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:16, height:16, border:"2px solid #E2E8F0", borderTopColor:"#6366F1", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        Chargement...
      </div>
    </Layout>
  );
  if (!project) return <Layout><p style={{ color:"#94A3B8", fontSize:13.5, fontFamily:"'DM Sans',sans-serif" }}>Projet introuvable.</p></Layout>;

  const projetConf = PROJET_STATUT_CONFIG[project.statut];

  return (
    <Layout>
      <style>{css}</style>
      <div className="pd-root">

        <button className="pd-back" onClick={() => navigate("/projects")}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Retour aux projets
        </button>

        {/* En-tête projet */}
        <div className="pd-card" style={{ borderTop: projetConf ? `3px solid ${projetConf.color}` : undefined }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <h1 style={{ margin:0, fontSize:18, fontWeight:700, color:"#0F172A", letterSpacing:"-0.3px" }}>{project.titre}</h1>
            <StatutBadge statut={project.statut} config={PROJET_STATUT_CONFIG} />
          </div>
          {project.description && <p style={{ color:"#64748B", fontSize:13.5, margin:"0 0 10px", lineHeight:1.55 }}>{project.description}</p>}
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", fontSize:12, color:"#94A3B8", marginBottom: project.technologies?.length > 0 ? 10 : 0 }}>
            <span>{project.date_debut} — {project.date_fin}</span>
            {project.budget && <span>Budget : {project.budget} €</span>}
          </div>
          {project.technologies?.length > 0 && (
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {project.technologies.map((tech, i) => (
                <span key={i} style={{ background:"#EEF2FF", color:"#4F46E5", border:"1px solid #C7D2FE", padding:"2px 8px", borderRadius:5, fontSize:11.5, fontWeight:500 }}>{tech}</span>
              ))}
            </div>
          )}
        </div>

        {/* Tâches */}
        <div className="pd-card">
          <h3 className="pd-section-head">
            <span className="pd-section-icon"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>
            Tâches
            <span style={{ marginLeft:"auto", fontSize:12, color:"#94A3B8", fontWeight:400 }}>{tasks.length} tâche{tasks.length !== 1 ? "s" : ""}</span>
          </h3>
          <div className="pd-divider" />

          {isChef && (
            <div className="pd-new-task-bar">
              <input className="pd-input" placeholder="Titre de la tâche" value={newTask.titre}
                onChange={e => setNewTask({ ...newTask, titre:e.target.value })} style={{ flex:1, minWidth:130 }} />
              <input className="pd-input" type="date" value={newTask.date_echeance}
                onChange={e => setNewTask({ ...newTask, date_echeance:e.target.value })} />
              <select className="pd-input" value={newTask.assigne_a}
                onChange={e => setNewTask({ ...newTask, assigne_a:e.target.value })}>
                <option value="">Assigner à...</option>
                {project.owner && <option value={project.owner.id}>{project.owner.nom} (Chef)</option>}
                {members.filter(m => m.id !== project.owner?.id).map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
              <button className="pd-btn-primary" onClick={createTask}>+ Ajouter</button>
            </div>
          )}

          {tasks.length === 0 ? (
            <p style={{ color:"#94A3B8", fontSize:13 }}>Aucune tâche pour ce projet.</p>
          ) : tasks.map(task => (
            <div key={task.id} className="pd-task-row">
              <div style={{ flex:1 }}>
                <span style={{ fontSize:13.5, fontWeight:500, color:"#0F172A" }}>{task.titre}</span>
                {task.date_echeance && <span style={{ fontSize:11.5, color:"#94A3B8", marginLeft:8 }}>{task.date_echeance}</span>}
              </div>
              <StatutBadge statut={task.statut} config={STATUT_CONFIG} />
              {(isChef || (isMembre && Number(task.assigne_a) === Number(user?.id))) && (
                <select className="pd-input" value={task.statut}
                  onChange={e => updateTaskStatus(task.id, e.target.value)}
                  style={{ padding:"4px 8px", fontSize:12 }}>
                  <option value="a_faire">À faire</option>
                  <option value="en_cours">En cours</option>
                  <option value="termine">Terminé</option>
                </select>
              )}
              {isChef && <button className="pd-btn-danger" onClick={() => deleteTask(task.id)}>Supprimer</button>}
            </div>
          ))}
        </div>

        {/* Équipe */}
        <div className="pd-card">
          <h3 className="pd-section-head">
            <span className="pd-section-icon"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
            Équipe
            <span style={{ marginLeft:"auto", fontSize:12, color:"#94A3B8", fontWeight:400 }}>{members.length + (project.owner ? 1 : 0)} membre{members.length + (project.owner ? 1 : 0) !== 1 ? "s" : ""}</span>
          </h3>
          <div className="pd-divider" />

          {project.owner && (
            <div className="pd-member-row">
              <Avatar name={project.owner?.nom} color="#DBEAFE" textColor="#1D4ED8" />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13.5, fontWeight:500, color:"#0F172A" }}>{project.owner?.nom}</div>
                <div style={{ fontSize:11.5, color:"#6366F1" }}>Chef de projet</div>
              </div>
              <span style={{ fontSize:11, background:"#EEF2FF", color:"#4F46E5", border:"1px solid #C7D2FE", padding:"2px 8px", borderRadius:5, fontWeight:500 }}>Propriétaire</span>
            </div>
          )}

          {isChef && (
            <div style={{ display:"flex", gap:7, margin:"12px 0" }}>
              <select className="pd-input" value={selectedUser} onChange={e => setSelectedUser(e.target.value)} style={{ flex:1 }}>
                <option value="">Ajouter un membre...</option>
                {users.filter(u => u.role === "membre").filter(u => !members.find(m => m.id === u.id)).filter(u => u.id !== project.owner?.id).map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
              </select>
              <button className="pd-btn-success" onClick={addMember}>Ajouter</button>
            </div>
          )}

          {members.filter(m => m.id !== project.owner?.id).length === 0 ? (
            <p style={{ color:"#94A3B8", fontSize:13 }}>Aucun membre dans l'équipe.</p>
          ) : members.filter(m => m.id !== project.owner?.id).map(member => (
            <div key={member.id} className="pd-member-row">
              <Avatar name={member.nom} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13.5, fontWeight:500, color:"#0F172A" }}>{member.nom}</div>
                <div style={{ fontSize:11.5, color:"#94A3B8" }}>Membre</div>
              </div>
              {isChef && <button className="pd-btn-danger" onClick={() => removeMember(member.id)}>Retirer</button>}
            </div>
          ))}
        </div>

        {/* Fichiers */}
        <div className="pd-card">
          <h3 className="pd-section-head">
            <span className="pd-section-icon"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg></span>
            Fichiers
            <span style={{ marginLeft:"auto", fontSize:12, color:"#94A3B8", fontWeight:400 }}>{files.length} fichier{files.length !== 1 ? "s" : ""}</span>
          </h3>
          <div className="pd-divider" />

          {isChef && (
            <div style={{ display:"flex", gap:7, marginBottom:14, alignItems:"center" }}>
              <input type="file" onChange={e => setSelectedFile(e.target.files[0])} style={{ flex:1, fontSize:12.5, color:"#64748B", fontFamily:"'DM Sans',sans-serif" }} />
              <button className="pd-btn-info" onClick={uploadFile}>Upload</button>
            </div>
          )}

          {files.length === 0 ? (
            <p style={{ color:"#94A3B8", fontSize:13 }}>Aucun fichier joint.</p>
          ) : files.map(file => (
            <div key={file.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid #F1F5F9" }}>
              <div style={{ width:30, height:30, borderRadius:7, background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="13" height="13" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
              </div>
              <span style={{ flex:1, fontSize:13, color:"#0F172A", fontWeight:500 }}>{file.nom}</span>
              <button className="pd-btn-ghost" onClick={() => downloadFile(file.id)}>Télécharger</button>
              {isChef && <button className="pd-btn-danger" onClick={() => deleteFile(file.id)}>Supprimer</button>}
            </div>
          ))}
        </div>

        {/* Commentaires */}
        <div className="pd-card">
          <h3 className="pd-section-head">
            <span className="pd-section-icon"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
            Commentaires par tâche
          </h3>
          <div className="pd-divider" />
          {tasks.length === 0 ? (
            <p style={{ color:"#94A3B8", fontSize:13 }}>Aucune tâche pour commenter.</p>
          ) : tasks.map(task => <CommentSection key={task.id} task={task} />)}
        </div>

      </div>
    </Layout>
  );
}