import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { formatDateTime } from "../utils/date";

const detailStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .pf-card { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 22px; margin-bottom: 12px; }
    .pf-section-title {
        display: flex; align-items: center; gap: 9px;
        margin: 0 0 16px; font-size: 13px; font-weight: 600; color: #0f172a;
    }
    .pf-section-icon {
        width: 24px; height: 24px; border-radius: 6px;
        background: #eff6ff; color: #3b82f6;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .pf-input {
        padding: 8px 11px; border-radius: 7px;
        border: 1px solid #e2e8f0; font-size: 13px; outline: none;
        background: white; color: #0f172a;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    .pf-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .pf-input::placeholder { color: #cbd5e1; }
    .pf-btn-primary {
        padding: 8px 16px; background: #1d4ed8; color: white;
        border: none; border-radius: 7px; cursor: pointer; font-size: 13px; font-weight: 500;
        transition: background 0.15s; white-space: nowrap;
    }
    .pf-btn-primary:hover { background: #1e40af; }
    .pf-btn-success {
        padding: 8px 16px; background: #10b981; color: white;
        border: none; border-radius: 7px; cursor: pointer; font-size: 13px; font-weight: 500;
        transition: background 0.15s; white-space: nowrap;
    }
    .pf-btn-success:hover { background: #059669; }
    .pf-btn-info {
        padding: 8px 16px; background: #3b82f6; color: white;
        border: none; border-radius: 7px; cursor: pointer; font-size: 13px; font-weight: 500;
        transition: background 0.15s; white-space: nowrap;
    }
    .pf-btn-info:hover { background: #2563eb; }
    .pf-btn-ghost {
        padding: 5px 10px; background: white; border: 1px solid #e2e8f0;
        border-radius: 6px; cursor: pointer; font-size: 12px; color: #475569;
        transition: background 0.15s; white-space: nowrap;
    }
    .pf-btn-ghost:hover { background: #f8fafc; }
    .pf-btn-danger {
        background: none; border: none; cursor: pointer;
        color: #ef4444; font-size: 12.5px; padding: 4px 6px;
        border-radius: 5px; transition: background 0.15s;
    }
    .pf-btn-danger:hover { background: #fef2f2; }
    .pf-back-btn {
        background: none; border: none; cursor: pointer; padding: 0;
        display: flex; align-items: center; gap: 6px;
        font-size: 13px; color: #94a3b8; margin-bottom: 16px;
        transition: color 0.15s;
    }
    .pf-back-btn:hover { color: #475569; }
    .pf-task-row {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 0; border-bottom: 1px solid #f1f5f9;
        transition: background 0.1s;
    }
    .pf-task-row:last-child { border-bottom: none; }
    .pf-member-row {
        display: flex; align-items: center; gap: 10px;
        padding: 9px 0; border-bottom: 1px solid #f1f5f9;
    }
    .pf-member-row:last-child { border-bottom: none; }
    .pf-comment-bubble {
        background: #f8fafc; border: 1px solid #f1f5f9;
        border-radius: 8px; padding: 10px 12px; margin-bottom: 7px;
    }
    .pf-send-btn {
        padding: 8px 14px; background: #0f172a; color: white;
        border: none; border-radius: 7px; cursor: pointer; font-size: 12.5px;
        transition: background 0.15s;
    }
    .pf-send-btn:hover { background: #1e293b; }
`;

const STATUT_CONFIG = {
    a_faire:  { label: "À faire",  color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    en_cours: { label: "En cours", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    termine:  { label: "Terminé",  color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
};

const PROJET_STATUT_CONFIG = {
    en_attente: { label: "En attente", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    en_cours:   { label: "En cours",   color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    termine:    { label: "Terminé",    color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
    suspendu:   { label: "Suspendu",   color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
};

const StatutBadge = ({ statut, config }) => {
    const conf = config[statut];
    if (!conf) return null;
    return (
        <span style={{
            background: conf.bg, color: conf.color,
            border: `1px solid ${conf.border}`,
            padding: "2px 9px", borderRadius: "20px",
            fontSize: "11.5px", fontWeight: "600", flexShrink: 0,
        }}>
            {conf.label}
        </span>
    );
};

const Avatar = ({ name, color = "#e2e8f0", textColor = "#475569", size = 32 }) => (
    <div style={{
        width: size, height: size, borderRadius: "50%",
        background: color, color: textColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: "600", flexShrink: 0,
    }}>
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
        <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
                <p style={{ margin: 0, fontSize: "12.5px", fontWeight: "600", color: "#0f172a" }}>
                    {task.titre}
                </p>
                <StatutBadge statut={task.statut} config={STATUT_CONFIG} />
            </div>
            {comments.length === 0 ? (
                <p style={{ fontSize: "12.5px", color: "#94a3b8", margin: "0 0 10px" }}>
                    Aucun commentaire pour cette tâche.
                </p>
            ) : comments.map(c => (
                <div key={c.id} className="pf-comment-bubble">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <Avatar name={c.user?.nom ?? "?"} color="#e0e7ff" textColor="#4338ca" size={24} />
                            <span style={{ fontWeight: "600", fontSize: "12.5px", color: "#0f172a" }}>
                                {c.user?.nom ?? "Utilisateur"}
                            </span>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                {formatDateTime(c.created_at)}
                            </span>
                        </div>
                        {(user?.role === "chef" || c.user_id === user?.id) && (
                            <button className="pf-btn-danger" onClick={() => deleteComment(c.id)}>
                                Supprimer
                            </button>
                        )}
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>{c.content}</p>
                </div>
            ))}
            <div style={{ display: "flex", gap: "7px", marginTop: "8px" }}>
                <input
                    className="pf-input"
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addComment()}
                    style={{ flex: 1 }}
                />
                <button className="pf-send-btn" onClick={addComment}>Envoyer</button>
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
    const [newTask, setNewTask] = useState({ titre: "", date_echeance: "", assigne_a: "" });
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

    const createTask       = async () => { if (!newTask.titre.trim()) return; await API.post("/tasks", { ...newTask, project_id: id }); setNewTask({ titre: "", date_echeance: "", assigne_a: "" }); fetchAll(); };
    const deleteTask       = async (taskId) => { if (!window.confirm("Supprimer cette tâche ?")) return; await API.delete(`/tasks/${taskId}`); fetchAll(); };
    const updateTaskStatus = async (taskId, statut) => { await API.put(`/tasks/${taskId}`, { statut }); fetchAll(); };
    const addMember        = async () => { if (!selectedUser) return; await API.post(`/projects/${id}/members`, { user_id: selectedUser }); setSelectedUser(""); fetchAll(); };
    const removeMember     = async (userId) => { await API.delete(`/projects/${id}/members/${userId}`); fetchAll(); };
    const uploadFile       = async () => { if (!selectedFile) return; const fd = new FormData(); fd.append("file", selectedFile); await API.post(`/projects/${id}/files`, fd); setSelectedFile(null); fetchAll(); };
    const downloadFile     = (fileId) => window.open(`http://localhost:8000/api/files/${fileId}/download`, "_blank");
    const deleteFile       = async (fileId) => { await API.delete(`/files/${fileId}`); fetchAll(); };

    if (loading) return (
        <Layout>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "13.5px" }}>
                <div style={{ width: "14px", height: "14px", border: "2px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Chargement...
            </div>
        </Layout>
    );
    if (!project) return <Layout><p style={{ color: "#94a3b8", fontSize: "13.5px" }}>Projet introuvable.</p></Layout>;

    const projetConf = PROJET_STATUT_CONFIG[project.statut];

    return (
        <Layout>
            <style>{detailStyles}</style>

            {/* RETOUR */}
            <button className="pf-back-btn" onClick={() => navigate("/projects")}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
                Retour aux projets
            </button>

            {/* EN-TÊTE PROJET */}
            <div className="pf-card" style={{ borderTop: projetConf ? `3px solid ${projetConf.color}` : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                        {project.titre}
                    </h1>
                    <StatutBadge statut={project.statut} config={PROJET_STATUT_CONFIG} />
                </div>
                {project.description && (
                    <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 10px", lineHeight: 1.55 }}>
                        {project.description}
                    </p>
                )}
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12px", color: "#94a3b8", marginBottom: project.technologies?.length > 0 ? "10px" : 0 }}>
                    <span>{project.date_debut} — {project.date_fin}</span>
                    {project.budget && <span>Budget : {project.budget} €</span>}
                </div>
                {project.technologies?.length > 0 && (
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        {project.technologies.map((tech, i) => (
                            <span key={i} style={{
                                background: "#eff6ff", color: "#1d4ed8",
                                border: "1px solid #bfdbfe",
                                padding: "2px 8px", borderRadius: "4px",
                                fontSize: "11.5px", fontWeight: "500",
                            }}>{tech}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* TÂCHES */}
            <div className="pf-card">
                <h3 className="pf-section-title">
                    <span className="pf-section-icon">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                    </span>
                    Tâches
                    <span style={{ marginLeft: "auto", fontSize: "12px", color: "#94a3b8", fontWeight: "400" }}>
                        {tasks.length} tâche{tasks.length !== 1 ? "s" : ""}
                    </span>
                </h3>
                <div style={{ height: "1px", background: "#f1f5f9", marginBottom: "14px" }} />

                {isChef && (
                    <div style={{
                        display: "flex", gap: "7px", marginBottom: "14px",
                        flexWrap: "wrap", background: "#f8fafc",
                        padding: "12px", borderRadius: "8px",
                        border: "1px solid #f1f5f9",
                    }}>
                        <input className="pf-input" placeholder="Titre de la tâche" value={newTask.titre}
                            onChange={e => setNewTask({ ...newTask, titre: e.target.value })}
                            style={{ flex: 1, minWidth: "130px" }} />
                        <input className="pf-input" type="date" value={newTask.date_echeance}
                            onChange={e => setNewTask({ ...newTask, date_echeance: e.target.value })} />
                        <select className="pf-input" value={newTask.assigne_a}
                            onChange={e => setNewTask({ ...newTask, assigne_a: e.target.value })}>
                            <option value="">Assigner à...</option>
                            {project.owner && <option value={project.owner.id}>{project.owner.nom} (Chef)</option>}
                            {members.filter(m => m.id !== project.owner?.id).map(m => (
                                <option key={m.id} value={m.id}>{m.nom}</option>
                            ))}
                        </select>
                        <button className="pf-btn-primary" onClick={createTask}>+ Ajouter</button>
                    </div>
                )}

                {tasks.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "13px" }}>Aucune tâche pour ce projet.</p>
                ) : tasks.map(task => (
                    <div key={task.id} className="pf-task-row">
                        <div style={{ flex: 1 }}>
                            <span style={{ fontSize: "13.5px", fontWeight: "500", color: "#0f172a" }}>{task.titre}</span>
                            {task.date_echeance && (
                                <span style={{ fontSize: "11.5px", color: "#94a3b8", marginLeft: "8px" }}>
                                    {task.date_echeance}
                                </span>
                            )}
                        </div>
                        <StatutBadge statut={task.statut} config={STATUT_CONFIG} />
                        {(isChef || (isMembre && Number(task.assigne_a) === Number(user?.id))) && (
                            <select className="pf-input" value={task.statut}
                                onChange={e => updateTaskStatus(task.id, e.target.value)}
                                style={{ padding: "4px 8px", fontSize: "12px" }}>
                                <option value="a_faire">À faire</option>
                                <option value="en_cours">En cours</option>
                                <option value="termine">Terminé</option>
                            </select>
                        )}
                        {isChef && (
                            <button className="pf-btn-danger" onClick={() => deleteTask(task.id)}>
                                Supprimer
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* ÉQUIPE */}
            <div className="pf-card">
                <h3 className="pf-section-title">
                    <span className="pf-section-icon">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </span>
                    Équipe
                    <span style={{ marginLeft: "auto", fontSize: "12px", color: "#94a3b8", fontWeight: "400" }}>
                        {members.length + (project.owner ? 1 : 0)} membre{members.length + (project.owner ? 1 : 0) !== 1 ? "s" : ""}
                    </span>
                </h3>
                <div style={{ height: "1px", background: "#f1f5f9", marginBottom: "14px" }} />

                {project.owner && (
                    <div className="pf-member-row">
                        <Avatar name={project.owner?.nom} color="#dbeafe" textColor="#1d4ed8" />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13.5px", fontWeight: "500", color: "#0f172a" }}>{project.owner?.nom}</div>
                            <div style={{ fontSize: "11.5px", color: "#3b82f6" }}>Chef de projet</div>
                        </div>
                        <span style={{ fontSize: "11px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: "4px", fontWeight: "500" }}>
                            Propriétaire
                        </span>
                    </div>
                )}

                {isChef && (
                    <div style={{ display: "flex", gap: "7px", margin: "12px 0" }}>
                        <select className="pf-input" value={selectedUser}
                            onChange={e => setSelectedUser(e.target.value)} style={{ flex: 1 }}>
                            <option value="">Ajouter un membre...</option>
                            {users.filter(u => u.role === "membre")
                                .filter(u => !members.find(m => m.id === u.id))
                                .filter(u => u.id !== project.owner?.id)
                                .map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
                        </select>
                        <button className="pf-btn-success" onClick={addMember}>Ajouter</button>
                    </div>
                )}

                {members.filter(m => m.id !== project.owner?.id).length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "13px" }}>Aucun membre dans l'équipe.</p>
                ) : members.filter(m => m.id !== project.owner?.id).map(member => (
                    <div key={member.id} className="pf-member-row">
                        <Avatar name={member.nom} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13.5px", fontWeight: "500", color: "#0f172a" }}>{member.nom}</div>
                            <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>Membre</div>
                        </div>
                        {isChef && (
                            <button className="pf-btn-danger" onClick={() => removeMember(member.id)}>
                                Retirer
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* FICHIERS */}
            <div className="pf-card">
                <h3 className="pf-section-title">
                    <span className="pf-section-icon">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                            <polyline points="13 2 13 9 20 9"/>
                        </svg>
                    </span>
                    Fichiers
                    <span style={{ marginLeft: "auto", fontSize: "12px", color: "#94a3b8", fontWeight: "400" }}>
                        {files.length} fichier{files.length !== 1 ? "s" : ""}
                    </span>
                </h3>
                <div style={{ height: "1px", background: "#f1f5f9", marginBottom: "14px" }} />

                {isChef && (
                    <div style={{ display: "flex", gap: "7px", marginBottom: "14px", alignItems: "center" }}>
                        <input type="file" onChange={e => setSelectedFile(e.target.files[0])}
                            style={{ flex: 1, fontSize: "12.5px", color: "#64748b" }} />
                        <button className="pf-btn-info" onClick={uploadFile}>Upload</button>
                    </div>
                )}

                {files.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "13px" }}>Aucun fichier joint.</p>
                ) : files.map(file => (
                    <div key={file.id} style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "9px 0", borderBottom: "1px solid #f1f5f9",
                    }}>
                        <div style={{
                            width: "30px", height: "30px", borderRadius: "7px",
                            background: "#f1f5f9", display: "flex", alignItems: "center",
                            justifyContent: "center", flexShrink: 0,
                        }}>
                            <svg width="13" height="13" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                                <polyline points="13 2 13 9 20 9"/>
                            </svg>
                        </div>
                        <span style={{ flex: 1, fontSize: "13px", color: "#0f172a", fontWeight: "500" }}>{file.nom}</span>
                        <button className="pf-btn-ghost" onClick={() => downloadFile(file.id)}>
                            Télécharger
                        </button>
                        {isChef && (
                            <button className="pf-btn-danger" onClick={() => deleteFile(file.id)}>
                                Supprimer
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* COMMENTAIRES */}
            <div className="pf-card">
                <h3 className="pf-section-title">
                    <span className="pf-section-icon">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </span>
                    Commentaires par tâche
                </h3>
                <div style={{ height: "1px", background: "#f1f5f9", marginBottom: "14px" }} />
                {tasks.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "13px" }}>Aucune tâche pour commenter.</p>
                ) : tasks.map(task => (
                    <CommentSection key={task.id} task={task} />
                ))}
            </div>

        </Layout>
    );
}