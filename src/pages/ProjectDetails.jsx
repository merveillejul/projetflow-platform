import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function ProjectDetails() {

    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [project, setProject]       = useState(null);
    const [tasks, setTasks]           = useState([]);
    const [members, setMembers]       = useState([]);
    const [users, setUsers]           = useState([]);
    const [files, setFiles]           = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [newTask, setNewTask] = useState({ titre: "", date_echeance: "", assigne_a: "" });
    const [loading, setLoading]       = useState(true);

    const isChefOrAdmin = user?.role === "chef" || user?.role === "admin";

    useEffect(() => {
        fetchAll();
    }, [id]);

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

            if (isChefOrAdmin) {
                const usersRes = await API.get("/users");
                setUsers(usersRes.data);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // TÂCHES
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

    // MEMBRES
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

    // FICHIERS
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

    if (loading) return <div><Navbar /><p style={{ padding: "24px" }}>Chargement...</p></div>;
    if (!project) return <div><Navbar /><p style={{ padding: "24px" }}>Projet introuvable.</p></div>;

    return (
        <div>
            <Navbar />
            <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>

                {/* EN-TÊTE PROJET */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                    <div>
                        <button onClick={() => navigate("/projects")} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", marginBottom: "8px" }}>
                            ← Retour aux projets
                        </button>
                        <h1 style={{ margin: 0 }}>{project.titre}</h1>
                        <p style={{ color: "#64748b", margin: "8px 0" }}>{project.description}</p>
                        <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                            📅 {project.date_debut} → {project.date_fin}
                        </p>
                        {project.technologies && (
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                                {project.technologies.map((tech, i) => (
                                    <span key={i} style={{ background: "#e2e8f0", padding: "3px 10px", borderRadius: "20px", fontSize: "12px" }}>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* TÂCHES */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                    <h2 style={{ marginTop: 0 }}>Tâches</h2>

                    {isChefOrAdmin && (
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
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
                                value={newTask.assigned_to}
                                onChange={e => setNewTask({ ...newTask, assigne_a: e.target.value })}
                                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            >
                                <option value="">Assigner à...</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.nom}</option>
                                ))}
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
                            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                                <span style={{ background: getStatutColor(task.statut), color: "white", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", flexShrink: 0 }}>
                                    {task.statut?.replace("_", " ")}
                                </span>
                                <span style={{ flex: 1 }}>{task.titre}</span>
                                {task.date_echeance && (
                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>📅 {task.date_echeance}</span>
                                )}
                                <select
                                    value={task.statut}
                                    onChange={e => updateTaskStatus(task.id, e.target.value)}
                                    style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                                >
                                    <option value="a_faire">À faire</option>
                                    <option value="en_cours">En cours</option>
                                    <option value="termine">Terminé</option>
                                </select>
                                {isChefOrAdmin && (
                                    <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "16px" }}>
                                        🗑
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* MEMBRES */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                    <h2 style={{ marginTop: 0 }}>Équipe</h2>

                    {isChefOrAdmin && (
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                            <select
                                value={selectedUser}
                                onChange={e => setSelectedUser(e.target.value)}
                                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            >
                                <option value="">Choisir un utilisateur...</option>
                                {users.filter(u => !members.find(m => m.id === u.id)).map(u => (
                                    <option key={u.id} value={u.id}>{u.nom} ({u.role})</option>
                                ))}
                            </select>
                            <button onClick={addMember} style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                + Ajouter
                            </button>
                        </div>
                    )}

                    {members.length === 0 ? (
                        <p style={{ color: "#94a3b8" }}>Aucun membre dans ce projet.</p>
                    ) : (
                        members.map(member => (
                            <div key={member.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "500" }}>
                                    {member.nom?.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "500" }}>{member.nom}</div>
                                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{member.role}</div>
                                </div>
                                {isChefOrAdmin && (
                                    <button onClick={() => removeMember(member.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
                                        Retirer
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* FICHIERS */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                    <h2 style={{ marginTop: 0 }}>Fichiers</h2>

                    {isChefOrAdmin && (
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
                                {isChefOrAdmin && (
                                    <button onClick={() => deleteFile(file.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
                                        🗑
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}