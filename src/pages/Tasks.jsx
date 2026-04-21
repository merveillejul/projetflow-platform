import { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";

const STATUT_CONFIG = {
    a_faire:  { label: "À faire",  color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    en_cours: { label: "En cours", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    termine:  { label: "Terminé",  color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
};

const taskStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .pf-task-card {
        background: white; border: 1px solid #e2e8f0;
        border-radius: 10px; padding: 16px 20px;
        transition: box-shadow 0.15s ease, border-color 0.15s ease;
    }
    .pf-task-card:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        border-color: #cbd5e1;
    }
    .pf-statut-btn {
        padding: 5px 12px; border-radius: 6px;
        font-size: 12px; font-weight: 500; cursor: pointer;
        transition: all 0.15s ease;
    }
`;

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("tous");

    useEffect(() => { loadTasks(); }, []);

    const loadTasks = async () => {
        try {
            const res = await API.get("/my-tasks");
            setTasks(res.data.map(t => ({
                ...t,
                projectTitre: t.project?.titre ?? "Projet inconnu",
            })));
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

    if (loading) return (
        <Layout>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "13.5px" }}>
                <div style={{ width: "14px", height: "14px", border: "2px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Chargement...
            </div>
        </Layout>
    );

    return (
        <Layout>
            <style>{taskStyles}</style>

            {/* EN-TÊTE */}
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                    Mes tâches
                </h1>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                    {tasks.length} tâche{tasks.length !== 1 ? "s" : ""} assignée{tasks.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* FILTRES PAR STATUT */}
            {tasks.length > 0 && (
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {[
                        { value: "tous", label: "Toutes" },
                        { value: "a_faire",  ...STATUT_CONFIG.a_faire },
                        { value: "en_cours", ...STATUT_CONFIG.en_cours },
                        { value: "termine",  ...STATUT_CONFIG.termine },
                    ].map(s => {
                        const isActive = filter === s.value;
                        return (
                            <button key={s.value} className="pf-statut-btn"
                                onClick={() => setFilter(s.value)}
                                style={{
                                    background: isActive
                                        ? (s.value === "tous" ? "#0f172a" : s.bg)
                                        : "white",
                                    color: isActive
                                        ? (s.value === "tous" ? "white" : s.color)
                                        : "#64748b",
                                    border: `1px solid ${isActive
                                        ? (s.value === "tous" ? "#0f172a" : s.border)
                                        : "#e2e8f0"}`,
                                }}
                            >
                                {s.label ?? "Toutes"}
                                <span style={{
                                    marginLeft: "5px", fontSize: "11px",
                                    background: isActive
                                        ? "rgba(255,255,255,0.25)"
                                        : "#f1f5f9",
                                    color: isActive
                                        ? (s.value === "tous" ? "white" : s.color)
                                        : "#64748b",
                                    padding: "0px 5px", borderRadius: "10px",
                                }}>
                                    {counts[s.value]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* LISTE */}
            {filtered.length === 0 ? (
                <div style={{
                    background: "white", border: "1px dashed #e2e8f0",
                    borderRadius: "12px", padding: "52px", textAlign: "center",
                }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "10px",
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 10px",
                    }}>
                        <svg width="17" height="17" fill="none" stroke="#cbd5e1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="9 11 12 14 22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                    </div>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "13.5px" }}>
                        {filter === "tous" ? "Aucune tâche assignée pour le moment." : "Aucune tâche dans cette catégorie."}
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                    {filtered.map(task => {
                        const conf = STATUT_CONFIG[task.statut];
                        return (
                            <div key={task.id} className="pf-task-card"
                                style={{ borderLeft: `3px solid ${conf?.color ?? "#e2e8f0"}` }}>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {/* PROJET */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                                            <svg width="11" height="11" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                                            </svg>
                                            <span style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: "500" }}>
                                                {task.projectTitre}
                                            </span>
                                        </div>
                                        {/* TITRE */}
                                        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.1px" }}>
                                            {task.titre}
                                        </h3>
                                        {task.description && (
                                            <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
                                                {task.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* BADGE STATUT */}
                                    {conf && (
                                        <span style={{
                                            background: conf.bg, color: conf.color,
                                            border: `1px solid ${conf.border}`,
                                            padding: "2px 9px", borderRadius: "20px",
                                            fontSize: "11.5px", fontWeight: "600",
                                            flexShrink: 0, marginLeft: "12px",
                                        }}>
                                            {conf.label}
                                        </span>
                                    )}
                                </div>

                                {/* ÉCHÉANCE */}
                                {task.date_echeance && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "12px" }}>
                                        <svg width="11" height="11" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                                            Échéance : {task.date_echeance}
                                        </span>
                                    </div>
                                )}

                                {/* BOUTONS STATUT */}
                                <div style={{ display: "flex", gap: "5px" }}>
                                    {Object.entries(STATUT_CONFIG).map(([key, c]) => {
                                        const isActive = task.statut === key;
                                        return (
                                            <button key={key} className="pf-statut-btn"
                                                onClick={() => !isActive && updateStatut(task.id, key)}
                                                style={{
                                                    background: isActive ? c.bg : "white",
                                                    color: isActive ? c.color : "#94a3b8",
                                                    border: `1px solid ${isActive ? c.border : "#e2e8f0"}`,
                                                    cursor: isActive ? "default" : "pointer",
                                                    display: "flex", alignItems: "center", gap: "4px",
                                                }}
                                            >
                                                {isActive && (
                                                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                        <polyline points="20 6 9 17 4 12"/>
                                                    </svg>
                                                )}
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
        </Layout>
    );
}