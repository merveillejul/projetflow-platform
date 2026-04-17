import { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Tasks() {

    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const res = await API.get("/my-tasks");
            const formatted = res.data.map(t => ({
                ...t,
                projectTitre: t.project?.titre ?? "Projet inconnu",
                projectId: t.project_id
            }));
            setTasks(formatted);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatut = async (taskId, statut) => {
        await API.put(`/tasks/${taskId}`, { statut });
        loadTasks();
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

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />
            <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>

                <h1 style={{ marginBottom: "8px" }}>Mes tâches</h1>
                <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
                    Tâches qui vous sont assignées
                </p>

                {tasks.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                        <p>Aucune tâche assignée pour le moment.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {tasks.map(task => (
                            <div key={task.id} style={{
                                background: "white", border: "1px solid #e2e8f0",
                                borderRadius: "12px", padding: "20px",
                                borderLeft: `4px solid ${getStatutColor(task.statut)}`
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                    <div>
                                        <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#94a3b8" }}>
                                            📁 {task.projectTitre}
                                        </p>
                                        <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b" }}>{task.titre}</h3>
                                        {task.description && (
                                            <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#64748b" }}>{task.description}</p>
                                        )}
                                    </div>
                                    <span style={{
                                        background: getStatutColor(task.statut),
                                        color: "white", padding: "4px 12px",
                                        borderRadius: "20px", fontSize: "12px", flexShrink: 0, marginLeft: "12px"
                                    }}>
                                        {statutLabel(task.statut)}
                                    </span>
                                </div>

                                {task.date_echeance && (
                                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: "8px 0" }}>
                                        📅 Échéance : {task.date_echeance}
                                    </p>
                                )}

                                {/* Changer statut — membre peut mettre à jour ses propres tâches */}
                                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                    {["a_faire", "en_cours", "termine"].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => updateStatut(task.id, s)}
                                            style={{
                                                padding: "6px 14px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
                                                background: task.statut === s ? getStatutColor(s) : "transparent",
                                                color: task.statut === s ? "white" : getStatutColor(s),
                                                border: `1px solid ${getStatutColor(s)}`,
                                                fontWeight: task.statut === s ? "600" : "400"
                                            }}
                                        >
                                            {statutLabel(s)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}