import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const adminStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .pf-tab-btn {
        padding: 8px 16px; background: none; border: none;
        cursor: pointer; font-size: 13.5px; font-weight: 400;
        color: #64748b; border-bottom: 2px solid transparent;
        margin-bottom: -1px; display: flex; align-items: center; gap: 6px;
        transition: color 0.15s;
    }
    .pf-tab-btn:hover { color: #0f172a; }
    .pf-tab-btn.active { font-weight: 600; color: #0f172a; border-bottom: 2px solid #1d4ed8; }
    .pf-stat-card {
        background: white; border: 1px solid #e2e8f0; border-radius: 10px;
        padding: 16px 18px; transition: transform 0.15s, box-shadow 0.15s;
    }
    .pf-stat-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
    .pf-filter-btn {
        padding: 6px 12px; border-radius: 7px; cursor: pointer;
        font-size: 12.5px; font-weight: 500; border: 1px solid #e2e8f0;
        background: white; color: #64748b; transition: all 0.15s;
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
    .pf-btn-validate {
        padding: 6px 14px; background: #10b981; color: white;
        border: none; border-radius: 6px; cursor: pointer; font-size: 12.5px; font-weight: 500;
        transition: background 0.15s; white-space: nowrap;
    }
    .pf-btn-validate:hover { background: #059669; }
    .pf-btn-reject {
        padding: 6px 14px; background: white;
        border: 1px solid #fecaca; color: #ef4444;
        border-radius: 6px; cursor: pointer; font-size: 12.5px; font-weight: 500;
        transition: background 0.15s; white-space: nowrap;
    }
    .pf-btn-reject:hover { background: #fef2f2; }
    .pf-btn-del {
        padding: 4px 10px; background: white; border: 1px solid #fecaca;
        color: #ef4444; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;
        transition: background 0.15s;
    }
    .pf-btn-del:hover { background: #fef2f2; }
    .pf-select {
        padding: 4px 8px; border-radius: 6px; font-size: 12px;
        background: transparent; cursor: pointer; outline: none;
        transition: border-color 0.15s;
    }
    .pf-project-card {
        background: white; border: 1px solid #e2e8f0; border-radius: 10px;
        padding: 16px 20px; transition: box-shadow 0.15s, border-color 0.15s;
    }
    .pf-project-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); border-color: #cbd5e1; }
    .pf-table-row { border-top: 1px solid #f1f5f9; transition: background 0.1s; }
    .pf-table-row:hover { background: #fafbff; }
`;

const USER_STATUT_CONFIG = {
    actif:       { label: "Actif",       color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
    en_attente:  { label: "En attente",  color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    suspendu:    { label: "Suspendu",    color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
};

const ROLE_CONFIG = {
    admin:  { label: "Admin",  color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
    chef:   { label: "Chef",   color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    membre: { label: "Membre", color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
};

const PROJET_STATUT_CONFIG = {
    en_attente: { label: "En attente", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    en_cours:   { label: "En cours",   color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    termine:    { label: "Terminé",    color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
    suspendu:   { label: "Suspendu",   color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
};

const Badge = ({ conf }) => conf ? (
    <span style={{
        background: conf.bg, color: conf.color, border: `1px solid ${conf.border}`,
        padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", flexShrink: 0,
    }}>
        {conf.label}
    </span>
) : null;

const Avatar = ({ name, color = "#e0e7ff", textColor = "#3730a3", size = 30 }) => (
    <div style={{
        width: size, height: size, borderRadius: "50%",
        background: color, color: textColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4, fontWeight: "600", flexShrink: 0,
    }}>
        {name?.charAt(0).toUpperCase()}
    </div>
);

const SectionDivider = () => <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0 14px" }} />;

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // L'onglet actif est piloté par l'URL — synchronisé avec la sidebar
    const activeTab = searchParams.get("tab") ?? "dashboard";
    const setActiveTab = (tab) => setSearchParams({ tab });

    const [users, setUsers]     = useState([]);
    const [projets, setProjets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError]     = useState("");

    const [searchUser, setSearchUser]                   = useState("");
    const [filterRole, setFilterRole]                   = useState("tous");
    const [filterStatut, setFilterStatut]               = useState("tous");
    const [searchProjet, setSearchProjet]               = useState("");
    const [filterProjetStatut, setFilterProjetStatut]   = useState("tous");

    useEffect(() => {
        if (user && user.role !== "admin") navigate("/dashboard");
    }, [user]);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [usersRes, projetsRes] = await Promise.all([
                API.get("/users"),
                API.get("/projects"),
            ]);
            setUsers([...usersRes.data]);
            setProjets([...projetsRes.data]);
        } catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    const flash = (msg, isError = false) => {
        isError ? setError(msg) : setSuccess(msg);
        setTimeout(() => isError ? setError("") : setSuccess(""), 3000);
    };

    const updateStatut = async (userId, statut) => {
        try { await API.patch(`/users/${userId}/validate`, { statut }); flash("Statut mis à jour !"); await fetchAll(); }
        catch { flash("Erreur lors de la mise à jour.", true); }
    };
    const updateRole = async (userId, role) => {
        try { await API.put(`/users/${userId}/role`, { role }); flash("Rôle mis à jour !"); await fetchAll(); }
        catch (err) { console.log(err); }
    };
    const deleteUser = async (userId) => {
        if (!window.confirm("Supprimer cet utilisateur définitivement ?")) return;
        try { await API.delete(`/users/${userId}`); flash("Utilisateur supprimé."); await fetchAll(); }
        catch (err) { console.log(err); }
    };

    const enAttente     = users.filter(u => u.statut === "en_attente");
    const actifs        = users.filter(u => u.statut === "actif");
    const projetsActifs = projets.filter(p => p.statut === "en_cours");

    const filteredUsers = users.filter(u => {
        const matchSearch = u.nom.toLowerCase().includes(searchUser.toLowerCase()) ||
            u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
            u.username.toLowerCase().includes(searchUser.toLowerCase());
        return matchSearch
            && (filterRole === "tous" || u.role === filterRole)
            && (filterStatut === "tous" || u.statut === filterStatut);
    });

    const filteredProjets = projets.filter(p => {
        const matchSearch = p.titre.toLowerCase().includes(searchProjet.toLowerCase()) ||
            (p.description ?? "").toLowerCase().includes(searchProjet.toLowerCase());
        return matchSearch && (filterProjetStatut === "tous" || p.statut === filterProjetStatut);
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

    const TABS = [
        { key: "dashboard", label: "Vue d'ensemble", icon: (
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
        )},
        { key: "users", label: "Utilisateurs", badge: enAttente.length, icon: (
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        )},
        { key: "projets", label: "Projets", icon: (
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
        )},
    ];

    const STAT_CARDS = [
        { label: "Utilisateurs",   value: users.length,         accent: "#6366f1", bg: "#eef2ff", icon: (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        )},
        { label: "En attente",     value: enAttente.length,     accent: "#f59e0b", bg: "#fffbeb", icon: (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
        )},
        { label: "Actifs",         value: actifs.length,        accent: "#10b981", bg: "#f0fdf4", icon: (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
        )},
        { label: "Projets actifs", value: projetsActifs.length, accent: "#3b82f6", bg: "#eff6ff", icon: (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
        )},
    ];

    return (
        <Layout>
            <style>{adminStyles}</style>

            {/* EN-TÊTE */}
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                    Administration
                </h1>
                <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "13px" }}>
                    Gérez les utilisateurs et les projets de la plateforme.
                </p>

                {/* ONGLETS */}
                <div style={{ display: "flex", gap: "2px", borderBottom: "1px solid #e2e8f0" }}>
                    {TABS.map(tab => (
                        <button key={tab.key}
                            className={`pf-tab-btn${activeTab === tab.key ? " active" : ""}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <span style={{ opacity: activeTab === tab.key ? 1 : 0.6 }}>{tab.icon}</span>
                            {tab.label}
                            {tab.badge > 0 && (
                                <span style={{
                                    background: "#ef4444", color: "white",
                                    borderRadius: "20px", fontSize: "10.5px",
                                    fontWeight: "600", padding: "1px 6px",
                                }}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* FLASH MESSAGES */}
            {success && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "9px 12px", marginBottom: "14px" }}>
                    <svg width="14" height="14" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ color: "#065f46", fontSize: "13px", fontWeight: "500" }}>{success}</span>
                </div>
            )}
            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "9px 12px", marginBottom: "14px" }}>
                    <svg width="14" height="14" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span style={{ color: "#b91c1c", fontSize: "13px", fontWeight: "500" }}>{error}</span>
                </div>
            )}

            {/* ===== VUE D'ENSEMBLE ===== */}
            {activeTab === "dashboard" && (
                <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                        {STAT_CARDS.map(card => (
                            <div key={card.label} className="pf-stat-card" style={{ borderTop: `3px solid ${card.accent}` }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                    <p style={{ margin: 0, color: "#64748b", fontSize: "12px", fontWeight: "500" }}>{card.label}</p>
                                    <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: card.bg, color: card.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        {card.icon}
                                    </div>
                                </div>
                                <p style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#0f172a", lineHeight: 1, letterSpacing: "-0.5px" }}>
                                    {card.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* COMPTES EN ATTENTE */}
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "12px" }}>
                        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                                <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "#fffbeb", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                </div>
                                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a" }}>
                                    Comptes en attente de validation
                                </span>
                            </div>
                            {enAttente.length > 0 && (
                                <span style={{ background: "#fffbeb", color: "#f59e0b", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
                                    {enAttente.length}
                                </span>
                            )}
                        </div>

                        {enAttente.length === 0 ? (
                            <div style={{ padding: "28px", textAlign: "center" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                                    <svg width="15" height="15" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <p style={{ color: "#94a3b8", margin: 0, fontSize: "13.5px" }}>Aucun compte en attente.</p>
                            </div>
                        ) : enAttente.map(u => (
                            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 18px", borderBottom: "1px solid #f8fafc" }}>
                                <Avatar name={u.nom} color="#fde68a" textColor="#92400e" />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: "600", fontSize: "13.5px", color: "#0f172a" }}>{u.nom}</div>
                                    <div style={{ fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {u.email} · @{u.username}
                                    </div>
                                </div>
                                <button className="pf-btn-validate" onClick={() => updateStatut(u.id, "actif")}>Valider</button>
                                <button className="pf-btn-reject" onClick={() => updateStatut(u.id, "suspendu")}>Rejeter</button>
                            </div>
                        ))}
                    </div>

                    {/* RÉPARTITION */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 18px" }}>
                            <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Répartition par rôle</p>
                            <SectionDivider />
                            {Object.entries(ROLE_CONFIG).map(([key, conf]) => {
                                const count = users.filter(u => u.role === key).length;
                                const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                                return (
                                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                                        <span style={{ width: "52px", fontSize: "12px", color: "#64748b", fontWeight: "500" }}>{conf.label}</span>
                                        <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                                            <div style={{ width: `${pct}%`, height: "100%", background: conf.color, borderRadius: "10px", transition: "width 0.5s ease" }} />
                                        </div>
                                        <span style={{ width: "24px", fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 18px" }}>
                            <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>Projets par statut</p>
                            <SectionDivider />
                            {Object.entries(PROJET_STATUT_CONFIG).map(([key, conf]) => {
                                const count = projets.filter(p => p.statut === key).length;
                                const pct = projets.length > 0 ? Math.round((count / projets.length) * 100) : 0;
                                return (
                                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                                        <span style={{ width: "68px", fontSize: "12px", color: "#64748b", fontWeight: "500" }}>{conf.label}</span>
                                        <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                                            <div style={{ width: `${pct}%`, height: "100%", background: conf.color, borderRadius: "10px", transition: "width 0.5s ease" }} />
                                        </div>
                                        <span style={{ width: "24px", fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== UTILISATEURS ===== */}
            {activeTab === "users" && (
                <div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                            <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                                style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input className="pf-search" type="text" placeholder="Rechercher un utilisateur..."
                                value={searchUser} onChange={e => setSearchUser(e.target.value)} />
                        </div>
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {[
                                { value: "tous", label: "Tous rôles" },
                                { value: "admin", label: "Admin" },
                                { value: "chef", label: "Chef" },
                                { value: "membre", label: "Membre" },
                            ].map(r => {
                                const conf = ROLE_CONFIG[r.value];
                                const isActive = filterRole === r.value;
                                return (
                                    <button key={r.value} className="pf-filter-btn" onClick={() => setFilterRole(r.value)}
                                        style={isActive ? {
                                            background: r.value === "tous" ? "#0f172a" : conf.bg,
                                            color: r.value === "tous" ? "white" : conf.color,
                                            border: `1px solid ${r.value === "tous" ? "#0f172a" : conf.border}`,
                                        } : {}}>
                                        {r.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {[
                                { value: "tous", label: "Tous statuts" },
                                { value: "actif", label: "Actifs" },
                                { value: "en_attente", label: "En attente" },
                                { value: "suspendu", label: "Suspendus" },
                            ].map(s => {
                                const conf = USER_STATUT_CONFIG[s.value];
                                const isActive = filterStatut === s.value;
                                return (
                                    <button key={s.value} className="pf-filter-btn" onClick={() => setFilterStatut(s.value)}
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

                    <p style={{ fontSize: "12.5px", color: "#94a3b8", marginBottom: "10px" }}>
                        {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? "s" : ""}
                    </p>

                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    {["Utilisateur", "Email", "Rôle", "Statut", "Actions"].map(h => (
                                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="pf-table-row">
                                        <td style={{ padding: "11px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <Avatar name={u.nom} color={ROLE_CONFIG[u.role]?.bg ?? "#f1f5f9"} textColor={ROLE_CONFIG[u.role]?.color ?? "#64748b"} />
                                                <div>
                                                    <div style={{ fontWeight: "600", color: "#0f172a", fontSize: "13px" }}>{u.nom}</div>
                                                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>@{u.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "11px 16px", color: "#64748b", fontSize: "12.5px" }}>{u.email}</td>
                                        <td style={{ padding: "11px 16px" }}>
                                            <select className="pf-select" value={u.role}
                                                onChange={e => updateRole(u.id, e.target.value)}
                                                disabled={u.id === user?.id}
                                                style={{
                                                    border: `1px solid ${ROLE_CONFIG[u.role]?.border ?? "#e2e8f0"}`,
                                                    color: ROLE_CONFIG[u.role]?.color ?? "#64748b",
                                                    cursor: u.id === user?.id ? "not-allowed" : "pointer",
                                                    background: ROLE_CONFIG[u.role]?.bg ?? "white",
                                                }}>
                                                <option value="admin">Admin</option>
                                                <option value="chef">Chef</option>
                                                <option value="membre">Membre</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: "11px 16px" }}>
                                            <select className="pf-select" value={u.statut}
                                                onChange={e => updateStatut(u.id, e.target.value)}
                                                disabled={u.id === user?.id}
                                                style={{
                                                    border: `1px solid ${USER_STATUT_CONFIG[u.statut]?.border ?? "#e2e8f0"}`,
                                                    color: USER_STATUT_CONFIG[u.statut]?.color ?? "#64748b",
                                                    cursor: u.id === user?.id ? "not-allowed" : "pointer",
                                                    background: USER_STATUT_CONFIG[u.statut]?.bg ?? "white",
                                                }}>
                                                <option value="actif">Actif</option>
                                                <option value="en_attente">En attente</option>
                                                <option value="suspendu">Suspendu</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: "11px 16px" }}>
                                            {u.id !== user?.id && (
                                                <button className="pf-btn-del" onClick={() => deleteUser(u.id)}>
                                                    Supprimer
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                                            Aucun utilisateur ne correspond aux filtres.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ===== PROJETS ===== */}
            {activeTab === "projets" && (
                <div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                            <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                                style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input className="pf-search" type="text" placeholder="Rechercher un projet..."
                                value={searchProjet} onChange={e => setSearchProjet(e.target.value)} />
                        </div>
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {[
                                { value: "tous", label: "Tous" },
                                { value: "en_attente", label: "En attente" },
                                { value: "en_cours", label: "En cours" },
                                { value: "termine", label: "Terminé" },
                                { value: "suspendu", label: "Suspendu" },
                            ].map(s => {
                                const conf = PROJET_STATUT_CONFIG[s.value];
                                const isActive = filterProjetStatut === s.value;
                                return (
                                    <button key={s.value} className="pf-filter-btn" onClick={() => setFilterProjetStatut(s.value)}
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

                    <p style={{ fontSize: "12.5px", color: "#94a3b8", marginBottom: "10px" }}>
                        {filteredProjets.length} projet{filteredProjets.length !== 1 ? "s" : ""}
                    </p>

                    {filteredProjets.length === 0 ? (
                        <div style={{ background: "white", border: "1px dashed #e2e8f0", borderRadius: "12px", padding: "48px", textAlign: "center" }}>
                            <p style={{ color: "#94a3b8", margin: 0, fontSize: "13.5px" }}>Aucun projet ne correspond.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                            {filteredProjets.map(projet => {
                                const conf = PROJET_STATUT_CONFIG[projet.statut];
                                return (
                                    <div key={projet.id} className="pf-project-card"
                                        style={{ borderLeft: `3px solid ${conf?.color ?? "#e2e8f0"}` }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ margin: "0 0 3px", fontSize: "14px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.1px" }}>
                                                    {projet.titre}
                                                </h3>
                                                {projet.description && (
                                                    <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 4px", lineHeight: 1.5 }}>
                                                        {projet.description}
                                                    </p>
                                                )}
                                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <svg width="11" height="11" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                                    </svg>
                                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                                                        {projet.date_debut} — {projet.date_fin}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge conf={conf} />
                                        </div>
                                        {projet.members?.length > 0 && (
                                            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "8px" }}>
                                                {projet.members.map(m => {
                                                    const roleConf = ROLE_CONFIG[m.role];
                                                    return (
                                                        <span key={m.id} style={{
                                                            display: "flex", alignItems: "center", gap: "4px",
                                                            background: "#f8fafc", border: "1px solid #f1f5f9",
                                                            padding: "2px 8px", borderRadius: "5px",
                                                            fontSize: "11.5px", color: "#475569",
                                                        }}>
                                                            {m.nom}
                                                            <span style={{
                                                                color: roleConf?.color ?? "#64748b",
                                                                background: roleConf?.bg ?? "#f1f5f9",
                                                                padding: "0px 5px", borderRadius: "3px",
                                                                fontSize: "10.5px", fontWeight: "600",
                                                            }}>
                                                                {roleConf?.label ?? m.role}
                                                            </span>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </Layout>
    );
}