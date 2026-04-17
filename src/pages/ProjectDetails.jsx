import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { formatDateTime } from "../utils/date";

function CommentSection({ task }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => { loadComments(); }, [task.id]);

    const loadComments = async () => {
        try {
            const res = await API.get(`/tasks/${task.id}/comments`);
            setComments(res.data);
        } catch (err) { console.log(err); }
    };

    const addComment = async () => {
        if (!newComment.trim()) return;
        await API.post(`/tasks/${task.id}/comments`, { content: newComment });
        setNewComment("");
        loadComments();
    };

    const deleteComment = async (commentId) => {
        await API.delete(`/comments/${commentId}`);
        loadComments();
    };

    return (
        <div style={{ marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
            <h4 style={{ margin: "0 0 10px", color: "#1e293b" }}>💬 {task.titre}</h4>
            {comments.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>Aucun commentaire.</p>
            ) : (
                comments.map(c => (
                    <div key={c.id} style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px 12px", marginBottom: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <span style={{ fontWeight: "500", fontSize: "13px", color: "#1e293b" }}>{c.user?.nom ?? "Utilisateur"}</span>
                                <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "8px" }}>{formatDateTime(c.created_at)}</span>
                            </div>
                            {/* Seul le chef ou l'auteur du commentaire peut supprimer */}
                            {(user?.role === 'chef' || c.user_id === user?.id) && (
                                <button
                                    onClick={() => deleteComment(c.id)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "12px" }}
                                >
                                    Supprimer
                                </button>
                            )}
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b" }}>{c.content}</p>
                    </div>
                ))
            )}
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <input
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addComment()}
                    style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <button onClick={addComment} style={{ padding: "8px 16px", background: "#1e293b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                    Envoyer
                </button>
            </div>
        </div>
    );
}

export default function ProjectDetails() {

    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [project, setProject]   = useState(null);
    const [tasks, setTasks]       = useState([]);
    const [members, setMembers]   = useState([]);
    const [users, setUsers]       = useState([]);
    const [files, setFiles]       = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [newTask, setNewTask]   = useState({ titre: "", date_echeance: "", assigne_a: "" });
    const [loading, setLoading]   = useState(true);

    const isChef = user?.role === "chef";
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
            setProject(projRes.data);
            setTasks(taskRes.data);
            setMembers(memberRes.data);
            setFiles(filesRes.data);

            if (isChef) {
                const usersRes = await API.get("/users");
                setUsers(usersRes.data);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const createTask = async () => {
        if (!newTask.titre.trim()) return;
        await API.post("/tasks", { ...newTask, project_id: id });
        setNewTask({ titre: "", date_echeance: "", assigne_a: "" });
        fetchAll();
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm("Supprimer cette tâche ?")) return;
        await API.delete(`/tasks/${taskId}`);
        fetchAll();
    };

    const updateTaskStatus = async (taskId, statut) => {
        await API.put(`/tasks/${taskId}`, { statut });
        fetchAll();
    };

    const addMember = async () => {
        if (!selectedUser) return;
        await API.post(`/projects/${id}/members`, { user_id: selectedUser });
        setSelectedUser("");
        fetchAll();
    };

    const removeMember = async (userId) => {
        await API.delete(`/projects/${id}/members/${userId}`);
        fetchAll();
    };

    const uploadFile = async () => {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append("file", selectedFile);
        await API.post(`/projects/${id}/files`, formData);
        setSelectedFile(null);
        fetchAll();
    };

    const downloadFile = (fileId) => {
        window.open(`http://localhost:8000/api/files/${fileId}/download`, "_blank");
    };

    const deleteFile = async (fileId) => {
        await API.delete(`/files/${fileId}`);
        fetchAll();
    };

    const getStatutColor = (statut) => ({
        a_faire:  "#f59e0b",
        en_cours: "#3b82f6",
        termine:  "#10b981",
    }[statut] ?? "#6b7280");

    const statutLabel = (statut) => ({
        a_faire:  "À faire",
        en_cours: "En cours",
        termine:  "Terminé",
    }[statut] ?? statut);

    if (loading) return <div><Navbar /><p style={{ padding: "24px" }}>Chargement...</p></div>;
    if (!project) return <div><Navbar /><p style={{ padding: "24px" }}>Projet introuvable.</p></div>;

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />
            <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>

                {/* EN-TÊTE */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                    <button onClick={() => navigate("/projects")} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", marginBottom: "12px", padding: 0 }}>
                        ← Retour aux projets
                    </button>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h1 style={{ margin: "0 0 8px" }}>{project.titre}</h1>
                        <span style={{ background: getStatutColor(project.statut), color: "white", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", flexShrink: 0, marginLeft: "12px" }}>
                            {statutLabel(project.statut) ?? project.statut?.replace("_", " ")}
                        </span>
                    </div>
                    <p style={{ color: "#64748b", margin: "0 0 8px" }}>{project.description}</p>
                    <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 12px" }}>📅 {project.date_debut} → {project.date_fin}</p>
                    {project.budget && (
                        <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 12px" }}>💰 Budget : {project.budget} €</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {project.technologies.map((tech, i) => (
                                <span key={i} style={{ background: "#e2e8f0", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", color: "#475569" }}>
                                    {tech}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* TÂCHES */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                    <h2 style={{ marginTop: 0 }}>Tâches</h2>

                    {/* Formulaire création — chef seulement */}
                    {isChef && (
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                            <input
                                placeholder="Titre de la tâche"
                                value={newTask.titre}
                                onChange={e => setNewTask({ ...newTask, titre: e.target.value })}
                                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", minWidth: "150px" }}
                            />
                            <input
                                type="date"
                                value={newTask.date_echeance}
                                onChange={e => setNewTask({ ...newTask, date_echeance: e.target.value })}
                                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            />
                            <select
                                value={newTask.assigne_a}
                                onChange={e => setNewTask({ ...newTask, assigne_a: e.target.value })}
                                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            >
                                <option value="">Assigner à...</option>
                                {/* Chef propriétaire */}
                                {project.owner && (
                                    <option value={project.owner.id}>{project.owner.nom} (Chef)</option>
                                )}
                                {/* Membres de l'équipe */}
                                {members
                                    .filter(m => m.id !== project.owner?.id)
                                    .map(m => (
                                        <option key={m.id} value={m.id}>{m.nom} (Membre)</option>
                                    ))
                                }
                            </select>
                            <button onClick={createTask} style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                + Ajouter
                            </button>
                        </div>
                    )}

                    {tasks.length === 0 ? (
                        <p style={{ color: "#94a3b8" }}>Aucune tâche pour ce projet.</p>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ background: getStatutColor(task.statut), color: "white", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", flexShrink: 0 }}>
                                    {statutLabel(task.statut)}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontWeight: "500" }}>{task.titre}</span>
                                    {task.date_echeance && (
                                        <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "8px" }}>📅 {task.date_echeance}</span>
                                    )}
                                </div>
                                {/* Membre peut changer le statut de ses propres tâches, chef peut tout changer */}
                                {(isChef || (isMembre && Number(task.assigne_a) === Number(user?.id))) && (
                                    <select
                                        value={task.statut}
                                        onChange={e => updateTaskStatus(task.id, e.target.value)}
                                        style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                                    >
                                        <option value="a_faire">À faire</option>
                                        <option value="en_cours">En cours</option>
                                        <option value="termine">Terminé</option>
                                    </select>
                                )}
                                {isChef && (
                                    <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "16px" }}>
                                        🗑
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* ÉQUIPE */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                    <h2 style={{ marginTop: 0 }}>Équipe</h2>

                    {/* Chef propriétaire — affiché séparément */}
                    {project.owner && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f1f5f9", marginBottom: "8px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "500" }}>
                                {project.owner?.nom?.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: "500" }}>{project.owner?.nom}</div>
                                <div style={{ fontSize: "12px", color: "#2563eb" }}>Chef de projet</div>
                            </div>
                            <span style={{ fontSize: "11px", background: "#eff6ff", color: "#2563eb", padding: "3px 10px", borderRadius: "10px" }}>Propriétaire</span>
                        </div>
                    )}

                    {/* Formulaire ajout membre — chef seulement */}
                    {isChef && (
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                            <select
                                value={selectedUser}
                                onChange={e => setSelectedUser(e.target.value)}
                                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            >
                                <option value="">Ajouter un membre...</option>
                                {users
                                    .filter(u => u.role === "membre")
                                    .filter(u => !members.find(m => m.id === u.id))
                                    .filter(u => u.id !== project.owner?.id)
                                    .map(u => (
                                        <option key={u.id} value={u.id}>{u.nom}</option>
                                    ))
                                }
                            </select>
                            <button onClick={addMember} style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                + Ajouter
                            </button>
                        </div>
                    )}

                    {/* Liste membres */}
                    {members.filter(m => m.id !== project.owner?.id).length === 0 ? (
                        <p style={{ color: "#94a3b8", fontSize: "14px" }}>Aucun membre dans l'équipe.</p>
                    ) : (
                        members
                            .filter(m => m.id !== project.owner?.id)
                            .map(member => (
                                <div key={member.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "500" }}>
                                        {member.nom?.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: "500" }}>{member.nom}</div>
                                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>Membre</div>
                                    </div>
                                    {isChef && (
                                        <button onClick={() => removeMember(member.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "13px" }}>
                                            Retirer
                                        </button>
                                    )}
                                </div>
                            ))
                    )}
                </div>

                {/* FICHIERS */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                    <h2 style={{ marginTop: 0 }}>Fichiers</h2>
                    {isChef && (
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                            <input type="file" onChange={e => setSelectedFile(e.target.files[0])} />
                            <button onClick={uploadFile} style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                Upload
                            </button>
                        </div>
                    )}
                    {files.length === 0 ? (
                        <p style={{ color: "#94a3b8" }}>Aucun fichier joint.</p>
                    ) : (
                        files.map(file => (
                            <div key={file.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ flex: 1 }}>📎 {file.nom}</span>
                                <button onClick={() => downloadFile(file.id)} style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid #3b82f6", color: "#3b82f6", background: "none", cursor: "pointer" }}>
                                    Télécharger
                                </button>
                                {isChef && (
                                    <button onClick={() => deleteFile(file.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
                                        🗑
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* COMMENTAIRES */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                    <h2 style={{ marginTop: 0 }}>Commentaires par tâche</h2>
                    {tasks.length === 0 ? (
                        <p style={{ color: "#94a3b8" }}>Aucune tâche pour commenter.</p>
                    ) : (
                        tasks.map(task => (
                            <CommentSection key={task.id} task={task} />
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}