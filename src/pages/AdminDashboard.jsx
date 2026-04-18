import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [projets, setProjets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("dashboard");

    // Filtres utilisateurs
    const [searchUser, setSearchUser] = useState("");
    const [filterRole, setFilterRole] = useState("tous");
    const [filterStatut, setFilterStatut] = useState("tous");

    // Filtres projets
    const [searchProjet, setSearchProjet] = useState("");
    const [filterProjetStatut, setFilterProjetStatut] = useState("tous");

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [usersRes, statsRes, projetsRes] = await Promise.all([
                API.get("/users"),
                API.get("/dashboard/stats"),
                API.get("/projects")
            ]);
            setUsers([...usersRes.data]);
            setStats({ ...statsRes.data });
            setProjets([...projetsRes.data]);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatut = async (userId, statut) => {
        try {
            await API.patch(`/users/${userId}/validate`, { statut });
            await fetchAll();
            setSuccess("Statut mis à jour !");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Erreur lors de la mise à jour.");
            setTimeout(() => setError(""), 3000);
        }
    };

    const updateRole = async (userId, role) => {
        try {
            await API.put(`/users/${userId}/role`, { role });
            setSuccess("Rôle mis à jour !");
            setTimeout(() => setSuccess(""), 3000);
            await fetchAll();
        } catch (err) { console.log(err); }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Supprimer cet utilisateur définitivement ?")) return;
        try {
            await API.delete(`/users/${userId}`);
            setSuccess("Utilisateur supprimé.");
            setTimeout(() => setSuccess(""), 3000);
            await fetchAll();
        } catch (err) { console.log(err); }
    };

    const handleLogout = async () => {
        await API.post("/logout");
        logout();
        navigate("/");
    };

    const getStatutColor = (statut) => ({
        actif:      "#10b981",
        en_attente: "#f59e0b",
        suspendu:   "#ef4444",
    }[statut] ?? "#6b7280");

    const getRoleColor = (role) => ({
        admin:  "#7c3aed",
        chef:   "#2563eb",
        membre: "#059669",
    }[role] ?? "#6b7280");

    const getProjetStatutColor = (statut) => ({
        en_attente: "#f59e0b",
        en_cours:   "#3b82f6",
        termine:    "#10b981",
        suspendu:   "#ef4444",
    }[statut] ?? "#6b7280");

    const enAttente = users.filter(u => u.statut === "en_attente");

    // Filtrage utilisateurs
    const filteredUsers = users.filter(u => {
        const matchSearch = u.nom.toLowerCase().includes(searchUser.toLowerCase()) ||
            u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
            u.username.toLowerCase().includes(searchUser.toLowerCase());
        const matchRole = filterRole === "tous" || u.role === filterRole;
        const matchStatut = filterStatut === "tous" || u.statut === filterStatut;
        return matchSearch && matchRole && matchStatut;
    });

    // Filtrage projets
    const filteredProjets = projets.filter(p => {
        const matchSearch = p.titre.toLowerCase().includes(searchProjet.toLowerCase()) ||
            (p.description ?? "").toLowerCase().includes(searchProjet.toLowerCase());
        const matchStatut = filterProjetStatut === "tous" || p.statut === filterProjetStatut;
        return matchSearch && matchStatut;
    });

    const navBtn = (tab, label, badge = null) => (
        <button
            onClick={() => setActiveTab(tab)}
            style={{
                background: "none", border: "none", cursor: "pointer", fontSize: "14px",
                color: activeTab === tab ? "white" : "rgba(255,255,255,0.7)",
                fontWeight: activeTab === tab ? "600" : "400",
                borderBottom: activeTab === tab ? "2px solid white" : "2px solid transparent",
                padding: "0 4px", height: "60px"
            }}
        >
            {label} {badge}
        </button>
    );

    const inputStyle = {
        padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0",
        fontSize: "14px", background: "white", outline: "none"
    };

    const filterBtnStyle = (active, color = "#1e293b") => ({
        padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px",
        border: active ? `2px solid ${color}` : "1px solid #e2e8f0",
        background: active ? color : "white",
        color: active ? "white" : "#64748b",
        fontWeight: active ? "600" : "400"
    });

    if (loading) return <div style={{ padding: "24px" }}>Chargement...</div>;

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

            <nav style={{
                background: "#7c3aed", color: "white", padding: "0 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "18px" }}>ProjectFlow — Admin</span>
                    {navBtn("dashboard", "Tableau de bord")}
                    {navBtn("users", "Utilisateurs",
                        enAttente.length > 0 && (
                            <span style={{ background: "#ef4444", borderRadius: "50%", padding: "1px 6px", fontSize: "11px" }}>
                                {enAttente.length}
                            </span>
                        )
                    )}
                    {navBtn("projets", "Projets")}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button onClick={() => navigate("/profile")}
                        style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "14px" }}>
                        👤 {user?.nom}
                    </button>
                    <button onClick={handleLogout}
                        style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "6px 14px", borderRadius: "6px", cursor: "pointer" }}>
                        Déconnexion
                    </button>
                </div>
            </nav>

            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>

                {success && <div style={{ background: "#f0fdf4", color: "#10b981", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px" }}>✅ {success}</div>}
                {error && <div style={{ background: "#fef2f2", color: "#ef4444", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px" }}>❌ {error}</div>}

                {/* DASHBOARD */}
                {activeTab === "dashboard" && stats && (
                    <div>
                        <h1 style={{ marginBottom: "24px" }}>Tableau de bord administrateur</h1>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                            {[
                                { label: "Utilisateurs total", value: users.length, color: "#7c3aed" },
                                { label: "En attente", value: enAttente.length, color: "#f59e0b" },
                                { label: "Actifs", value: users.filter(u => u.statut === "actif").length, color: "#10b981" },
                                { label: "Projets total", value: projets.length, color: "#3b82f6" },
                            ].map((card, i) => (
                                <div key={i} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", borderLeft: `4px solid ${card.color}` }}>
                                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{card.label}</p>
                                    <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "500", color: card.color }}>{card.value}</p>
                                </div>
                            ))}
                        </div>

                        {enAttente.length > 0 ? (
                            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "20px" }}>
                                <h2 style={{ marginTop: 0, color: "#92400e" }}>⏳ Comptes en attente ({enAttente.length})</h2>
                                {enAttente.map(u => (
                                    <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #fde68a" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: "500" }}>{u.nom}</div>
                                            <div style={{ fontSize: "13px", color: "#92400e" }}>{u.email}</div>
                                            <div style={{ fontSize: "12px", color: "#b45309" }}>@{u.username} — {u.role}</div>
                                        </div>
                                        <button onClick={() => updateStatut(u.id, "actif")}
                                            style={{ padding: "8px 16px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
                                            ✓ Valider
                                        </button>
                                        <button onClick={() => updateStatut(u.id, "suspendu")}
                                            style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
                                            ✗ Rejeter
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
                                <p style={{ color: "#10b981", margin: 0 }}>✅ Aucun compte en attente de validation.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* UTILISATEURS */}
                {activeTab === "users" && (
                    <div>
                        <h1 style={{ marginBottom: "24px" }}>Gestion des utilisateurs ({filteredUsers.length}/{users.length})</h1>

                        {/* FILTRES UTILISATEURS */}
                        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                            <input
                                type="text"
                                placeholder="🔍 Rechercher par nom, email, username..."
                                value={searchUser}
                                onChange={e => setSearchUser(e.target.value)}
                                style={{ ...inputStyle, flex: 1, minWidth: "220px" }}
                            />
                            <div style={{ display: "flex", gap: "6px" }}>
                                {["tous", "admin", "chef", "membre"].map(r => (
                                    <button key={r} onClick={() => setFilterRole(r)}
                                        style={filterBtnStyle(filterRole === r, getRoleColor(r) === "#6b7280" ? "#1e293b" : getRoleColor(r))}>
                                        {r === "tous" ? "Tous rôles" : r.charAt(0).toUpperCase() + r.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                                {["tous", "actif", "en_attente", "suspendu"].map(s => (
                                    <button key={s} onClick={() => setFilterStatut(s)}
                                        style={filterBtnStyle(filterStatut === s, getStatutColor(s) === "#6b7280" ? "#1e293b" : getStatutColor(s))}>
                                        {s === "tous" ? "Tous statuts" : s.replace("_", " ")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredUsers.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                <p>Aucun utilisateur ne correspond à votre recherche.</p>
                                <button onClick={() => { setSearchUser(""); setFilterRole("tous"); setFilterStatut("tous"); }}
                                    style={{ padding: "8px 16px", background: "transparent", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", color: "#64748b" }}>
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        ) : (
                            <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                                            {["Nom", "Email", "Rôle", "Statut", "Actions"].map(h => (
                                                <th key={h} style={{ padding: "10px 8px", color: "#64748b" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                <td style={{ padding: "12px 8px", fontWeight: "500" }}>
                                                    {u.nom}
                                                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>@{u.username}</div>
                                                </td>
                                                <td style={{ padding: "12px 8px", color: "#64748b" }}>{u.email}</td>
                                                <td style={{ padding: "12px 8px" }}>
                                                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                                                        disabled={u.id === user?.id}
                                                        style={{ padding: "4px 8px", borderRadius: "6px", border: `1px solid ${getRoleColor(u.role)}`, color: getRoleColor(u.role), background: "transparent", cursor: "pointer" }}>
                                                        <option value="admin">Admin</option>
                                                        <option value="chef">Chef</option>
                                                        <option value="membre">Membre</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: "12px 8px" }}>
                                                    <select value={u.statut} onChange={e => updateStatut(u.id, e.target.value)}
                                                        disabled={u.id === user?.id}
                                                        style={{ padding: "4px 8px", borderRadius: "6px", border: `1px solid ${getStatutColor(u.statut)}`, color: getStatutColor(u.statut), background: "transparent", cursor: "pointer" }}>
                                                        <option value="actif">Actif</option>
                                                        <option value="en_attente">En attente</option>
                                                        <option value="suspendu">Suspendu</option>
                                                    </select>
                                                </td>
                                                <td style={{ padding: "12px 8px" }}>
                                                    {u.id !== user?.id && (
                                                        <button onClick={() => deleteUser(u.id)}
                                                            style={{ padding: "4px 12px", background: "none", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
                                                            Supprimer
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* PROJETS */}
                {activeTab === "projets" && (
                    <div>
                        <h1 style={{ marginBottom: "24px" }}>Supervision des projets ({filteredProjets.length}/{projets.length})</h1>

                        {/* FILTRES PROJETS */}
                        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
                            <input
                                type="text"
                                placeholder="🔍 Rechercher un projet..."
                                value={searchProjet}
                                onChange={e => setSearchProjet(e.target.value)}
                                style={{ ...inputStyle, flex: 1, minWidth: "220px" }}
                            />
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                {[
                                    { value: "tous", label: "Tous" },
                                    { value: "en_attente", label: "En attente" },
                                    { value: "en_cours", label: "En cours" },
                                    { value: "termine", label: "Terminé" },
                                    { value: "suspendu", label: "Suspendu" },
                                ].map(s => (
                                    <button key={s.value} onClick={() => setFilterProjetStatut(s.value)}
                                        style={filterBtnStyle(filterProjetStatut === s.value, getProjetStatutColor(s.value) === "#6b7280" ? "#1e293b" : getProjetStatutColor(s.value))}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredProjets.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                <p>Aucun projet ne correspond à votre recherche.</p>
                                <button onClick={() => { setSearchProjet(""); setFilterProjetStatut("tous"); }}
                                    style={{ padding: "8px 16px", background: "transparent", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", color: "#64748b" }}>
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        ) : (
                            filteredProjets.map(projet => (
                                <div key={projet.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                        <div>
                                            <h3 style={{ margin: "0 0 4px" }}>{projet.titre}</h3>
                                            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 4px" }}>{projet.description}</p>
                                            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>📅 {projet.date_debut} → {projet.date_fin}</p>
                                        </div>
                                        <span style={{ background: getProjetStatutColor(projet.statut), color: "white", padding: "3px 12px", borderRadius: "20px", fontSize: "12px", flexShrink: 0 }}>
                                            {projet.statut?.replace("_", " ")}
                                        </span>
                                    </div>
                                    {projet.members && projet.members.length > 0 ? (
                                        <div>
                                            <p style={{ fontSize: "13px", fontWeight: "500", color: "#64748b", margin: "0 0 8px" }}>
                                                👥 Équipe ({projet.members.length} membres) :
                                            </p>
                                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                {projet.members.map(m => (
                                                    <span key={m.id} style={{ background: "#f1f5f9", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", color: "#475569" }}>
                                                        {m.nom} <span style={{ color: getRoleColor(m.role) }}>({m.role})</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Aucun membre dans ce projet.</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}