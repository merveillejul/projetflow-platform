import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Projects() {

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const isChef = user?.role === "chef";

    useEffect(() => {
        API.get("/projects")
            .then(res => setProjects(res.data))
            .catch(err => console.log(err))
            .finally(() => setLoading(false));
    }, []);

    const deleteProject = async (id) => {
        if (!window.confirm("Supprimer ce projet ?")) return;
        await API.delete(`/projects/${id}`);
        setProjects(projects.filter(p => p.id !== id));
    };

    const getStatutColor = (statut) => ({
        en_attente: "#f59e0b",
        en_cours:   "#3b82f6",
        termine:    "#10b981",
        suspendu:   "#ef4444",
    }[statut] ?? "#6b7280");

    if (loading) return <div><Navbar /><p style={{ padding: "24px" }}>Chargement...</p></div>;

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />

            <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <div>
                        <h1 style={{ margin: 0 }}>Mes Projets</h1>
                        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
                            {user?.role === "membre"
                                ? "Projets auxquels vous participez"
                                : "Projets que vous gérez"
                            }
                        </p>
                    </div>

                    {/* Bouton visible seulement pour le chef */}
                    {isChef && (
                        <button
                            onClick={() => navigate("/create-project")}
                            style={{
                                background: "#3b82f6", color: "white",
                                border: "none", padding: "10px 20px",
                                borderRadius: "8px", cursor: "pointer", fontSize: "14px"
                            }}
                        >
                            + Nouveau Projet
                        </button>
                    )}
                </div>

                {projects.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📁</div>
                        <p>Aucun projet pour le moment.</p>
                        {isChef && (
                            <button
                                onClick={() => navigate("/create-project")}
                                style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
                            >
                                Créer mon premier projet
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                        {projects.map(project => (
                            <div key={project.id} style={{
                                background: "white", border: "1px solid #e2e8f0",
                                borderRadius: "12px", padding: "20px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                    <h3 style={{ margin: 0, fontSize: "16px" }}>
                                        <Link to={`/projects/${project.id}`} style={{ color: "#1e293b", textDecoration: "none" }}>
                                            {project.titre}
                                        </Link>
                                    </h3>
                                    <span style={{
                                        background: getStatutColor(project.statut),
                                        color: "white", padding: "3px 10px",
                                        borderRadius: "20px", fontSize: "11px", flexShrink: 0, marginLeft: "8px"
                                    }}>
                                        {project.statut?.replace("_", " ")}
                                    </span>
                                </div>

                                <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 8px" }}>
                                    {project.description ?? "Aucune description"}
                                </p>

                                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px" }}>
                                    📅 {project.date_debut} → {project.date_fin}
                                </p>

                                {/* Technologies */}
                                {project.technologies && project.technologies.length > 0 && (
                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                                        {project.technologies.map((tech, i) => (
                                            <span key={i} style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", color: "#475569" }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Membres */}
                                {project.members && project.members.length > 0 && (
                                    <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
                                        {project.members.slice(0, 4).map(m => (
                                            <div key={m.id} title={m.nom} style={{
                                                width: "28px", height: "28px", borderRadius: "50%",
                                                background: "#1e293b", color: "white",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "11px", fontWeight: "500"
                                            }}>
                                                {m.nom?.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {project.members.length > 4 && (
                                            <div style={{
                                                width: "28px", height: "28px", borderRadius: "50%",
                                                background: "#e2e8f0", color: "#64748b",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "11px"
                                            }}>
                                                +{project.members.length - 4}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Boutons chef seulement */}
                                {isChef && (
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                            onClick={() => navigate(`/edit-project/${project.id}`)}
                                            style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #3b82f6", color: "#3b82f6", background: "transparent", cursor: "pointer", fontSize: "13px" }}
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => deleteProject(project.id)}
                                            style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #ef4444", color: "#ef4444", background: "transparent", cursor: "pointer", fontSize: "13px" }}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                )}

                                {/* Membre → juste voir le détail */}
                                {user?.role === "membre" && (
                                    <Link
                                        to={`/projects/${project.id}`}
                                        style={{ display: "block", textAlign: "center", padding: "8px", background: "#f8fafc", borderRadius: "6px", color: "#3b82f6", textDecoration: "none", fontSize: "13px" }}
                                    >
                                        Voir le projet →
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}