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

    const getStatutColor = (statut) => {
        const colors = {
            en_attente: "#f59e0b",
            en_cours:   "#3b82f6",
            termine:    "#10b981",
            suspendu:   "#ef4444",
        };
        return colors[statut] ?? "#6b7280";
    };

    if (loading) return (
        <div>
            <Navbar />
            <p style={{ padding: "24px" }}>Chargement...</p>
        </div>
    );

    return (
        <div>
            <Navbar />

            <div style={{ padding: "24px" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h1>Mes Projets</h1>

                    {/* Bouton visible seulement pour chef et admin */}
                    {(user?.role === "chef" || user?.role === "admin") && (
                        <button
                            onClick={() => navigate("/create-project")}
                            style={{
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px"
                            }}
                        >
                            + Nouveau Projet
                        </button>
                    )}
                </div>

                {projects.length === 0 ? (
                    <p>Aucun projet pour le moment.</p>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                        {projects.map(project => (
                            <div key={project.id} style={{
                                background: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <h3 style={{ margin: 0 }}>
                                        <Link to={`/projects/${project.id}`} style={{ color: "#1e293b", textDecoration: "none" }}>
                                            {project.titre}
                                        </Link>
                                    </h3>
                                    <span style={{
                                        background: getStatutColor(project.statut),
                                        color: "white",
                                        padding: "3px 10px",
                                        borderRadius: "20px",
                                        fontSize: "12px"
                                    }}>
                                        {project.statut?.replace("_", " ")}
                                    </span>
                                </div>

                                <p style={{ color: "#64748b", fontSize: "14px", margin: "8px 0" }}>
                                    {project.description ?? "Aucune description"}
                                </p>

                                <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                                    📅 {project.date_debut} → {project.date_fin}
                                </p>

                                {(user?.role === "chef" || user?.role === "admin") && (
                                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                        <button
                                            onClick={() => navigate(`/edit-project/${project.id}`)}
                                            style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #3b82f6", color: "#3b82f6", background: "transparent", cursor: "pointer" }}
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => deleteProject(project.id)}
                                            style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #ef4444", color: "#ef4444", background: "transparent", cursor: "pointer" }}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}