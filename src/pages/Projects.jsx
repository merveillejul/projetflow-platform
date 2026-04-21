import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const STATUT_CONFIG = {
    en_attente: { label: "En attente", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    en_cours:   { label: "En cours",   color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    termine:    { label: "Terminé",    color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
    suspendu:   { label: "Suspendu",   color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
};

const projectStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .pf-project-card {
        background: white; border: 1px solid #e2e8f0;
        border-radius: 10px; padding: 16px 20px;
        transition: box-shadow 0.15s ease, border-color 0.15s ease;
    }
    .pf-project-card:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        border-color: #cbd5e1;
    }
    .pf-filter-btn {
        padding: 6px 13px; border-radius: 7px; cursor: pointer;
        font-size: 12.5px; font-weight: 500; border: 1px solid #e2e8f0;
        background: white; color: #64748b;
        transition: all 0.15s ease;
    }
    .pf-filter-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
    .pf-search {
        flex: 1; min-width: 200px; padding: 8px 12px 8px 36px;
        border-radius: 8px; border: 1px solid #e2e8f0;
        font-size: 13px; outline: none; background: white; color: #0f172a;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    .pf-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .pf-search::placeholder { color: #cbd5e1; }
    .pf-btn-new {
        display: flex; align-items: center; gap: 6px;
        background: #1d4ed8; color: white; border: none;
        padding: 8px 16px; border-radius: 8px; cursor: pointer;
        font-size: 13px; font-weight: 500; white-space: nowrap;
        transition: background 0.15s;
    }
    .pf-btn-new:hover { background: #1e40af; }
    .pf-btn-edit {
        padding: 5px 11px; border-radius: 6px;
        border: 1px solid #e2e8f0; color: #475569;
        background: white; cursor: pointer; font-size: 12px; font-weight: 500;
        transition: background 0.15s, border-color 0.15s;
    }
    .pf-btn-edit:hover { background: #f8fafc; border-color: #cbd5e1; }
    .pf-btn-del {
        padding: 5px 11px; border-radius: 6px;
        border: 1px solid #fecaca; color: #ef4444;
        background: white; cursor: pointer; font-size: 12px; font-weight: 500;
        transition: background 0.15s;
    }
    .pf-btn-del:hover { background: #fef2f2; }
`;

const StatutBadge = ({ statut }) => {
    const conf = STATUT_CONFIG[statut];
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

const STATUTS = [
    { value: "tous",       label: "Tous" },
    { value: "en_attente", label: "En attente" },
    { value: "en_cours",   label: "En cours" },
    { value: "termine",    label: "Terminé" },
    { value: "suspendu",   label: "Suspendu" },
];

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatut, setFilterStatut] = useState("tous");
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

    const filtered = projects.filter(p => {
        const matchSearch = p.titre.toLowerCase().includes(search.toLowerCase()) ||
            (p.description ?? "").toLowerCase().includes(search.toLowerCase());
        return matchSearch && (filterStatut === "tous" || p.statut === filterStatut);
    });

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
            <style>{projectStyles}</style>

            {/* EN-TÊTE */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
                <div>
                    <h1 style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                        Mes projets
                    </h1>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                        {user?.role === "membre" ? "Projets auxquels vous participez" : "Projets que vous gérez"}
                    </p>
                </div>
                {isChef && (
                    <button className="pf-btn-new" onClick={() => navigate("/create-project")}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Nouveau projet
                    </button>
                )}
            </div>

            {/* RECHERCHE + FILTRES */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                    <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                        style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input className="pf-search" type="text" placeholder="Rechercher un projet..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {STATUTS.map(s => {
                        const conf = STATUT_CONFIG[s.value];
                        const isActive = filterStatut === s.value;
                        return (
                            <button key={s.value} className="pf-filter-btn"
                                onClick={() => setFilterStatut(s.value)}
                                style={isActive ? {
                                    background: s.value === "tous" ? "#0f172a" : conf.bg,
                                    color: s.value === "tous" ? "white" : conf.color,
                                    border: `1px solid ${s.value === "tous" ? "#0f172a" : conf.border}`,
                                } : {}}>
                                {s.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* COMPTEUR */}
            <p style={{ color: "#94a3b8", fontSize: "12.5px", marginBottom: "14px", fontWeight: "400" }}>
                {filtered.length} projet{filtered.length !== 1 ? "s" : ""}
                {search && <span style={{ color: "#64748b" }}> pour « {search} »</span>}
            </p>

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
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <p style={{ margin: "0 0 14px", color: "#94a3b8", fontSize: "13.5px" }}>
                        Aucun projet ne correspond à votre recherche.
                    </p>
                    <button onClick={() => { setSearch(""); setFilterStatut("tous"); }} style={{
                        padding: "7px 16px", background: "white",
                        border: "1px solid #e2e8f0", borderRadius: "7px",
                        cursor: "pointer", color: "#475569", fontSize: "13px", fontWeight: "500",
                    }}>
                        Réinitialiser les filtres
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                    {filtered.map(project => (
                        <div key={project.id} className="pf-project-card"
                            style={{ borderLeft: `3px solid ${STATUT_CONFIG[project.statut]?.color ?? "#e2e8f0"}` }}>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Link to={`/projects/${project.id}`} style={{
                                        fontWeight: "600", fontSize: "14.5px", color: "#0f172a",
                                        textDecoration: "none", letterSpacing: "-0.1px",
                                        transition: "color 0.15s",
                                    }}
                                        onMouseEnter={e => e.target.style.color = "#1d4ed8"}
                                        onMouseLeave={e => e.target.style.color = "#0f172a"}
                                    >
                                        {project.titre}
                                    </Link>
                                    {project.description && (
                                        <p style={{
                                            margin: "3px 0 0", fontSize: "13px",
                                            color: "#64748b", lineHeight: 1.5,
                                            overflow: "hidden", textOverflow: "ellipsis",
                                            display: "-webkit-box", WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                        }}>
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                                <div style={{ marginLeft: "14px", flexShrink: 0 }}>
                                    <StatutBadge statut={project.statut} />
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>

                                {/* DATE */}
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                    <svg width="12" height="12" fill="none" stroke="#94a3b8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                                        {project.date_debut} — {project.date_fin}
                                    </span>
                                </div>

                                {/* TECHNOS */}
                                {project.technologies?.length > 0 && (
                                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                        {project.technologies.slice(0, 4).map((tech, i) => (
                                            <span key={i} style={{
                                                background: "#eff6ff", color: "#1d4ed8",
                                                border: "1px solid #bfdbfe",
                                                padding: "1px 7px", borderRadius: "4px",
                                                fontSize: "11px", fontWeight: "500",
                                            }}>
                                                {tech}
                                            </span>
                                        ))}
                                        {project.technologies.length > 4 && (
                                            <span style={{ fontSize: "11px", color: "#94a3b8", padding: "1px 4px" }}>
                                                +{project.technologies.length - 4}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* MEMBRES */}
                                {project.members?.length > 0 && (
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        {project.members.slice(0, 4).map((m, i) => (
                                            <div key={m.id} title={m.nom} style={{
                                                width: "22px", height: "22px", borderRadius: "50%",
                                                background: "#e0e7ff", color: "#3730a3",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: "9.5px", fontWeight: "700",
                                                border: "2px solid white",
                                                marginLeft: i > 0 ? "-6px" : 0,
                                                zIndex: 4 - i,
                                                position: "relative",
                                            }}>
                                                {m.nom?.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {project.members.length > 4 && (
                                            <span style={{ fontSize: "11.5px", color: "#94a3b8", marginLeft: "4px" }}>
                                                +{project.members.length - 4}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* ACTIONS */}
                                <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                                    {isChef && (
                                        <>
                                            <button className="pf-btn-edit" onClick={() => navigate(`/edit-project/${project.id}`)}>
                                                Modifier
                                            </button>
                                            <button className="pf-btn-del" onClick={() => deleteProject(project.id)}>
                                                Supprimer
                                            </button>
                                        </>
                                    )}
                                    {user?.role === "membre" && (
                                        <Link to={`/projects/${project.id}`} style={{
                                            padding: "5px 11px", borderRadius: "6px",
                                            border: "1px solid #e2e8f0", color: "#475569",
                                            background: "white", fontSize: "12px",
                                            fontWeight: "500", textDecoration: "none",
                                        }}>
                                            Voir
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}