import { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Admin() {

    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState("");

    // Redirection si pas admin
    useEffect(() => {
        if (user && user.role !== "admin") {
            navigate("/dashboard");
        }
    }, [user]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get("/users");
            setUsers(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatut = async (userId, statut) => {
        await API.patch(`/users/${userId}/validate`, { statut });
        setSuccess("Statut mis à jour !");
        setTimeout(() => setSuccess(""), 3000);
        fetchUsers();
    };

    const updateRole = async (userId, role) => {
        await API.put(`/users/${userId}/role`, { role });
        setSuccess("Rôle mis à jour !");
        setTimeout(() => setSuccess(""), 3000);
        fetchUsers();
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Supprimer cet utilisateur définitivement ?")) return;
        await API.delete(`/users/${userId}`);
        setSuccess("Utilisateur supprimé.");
        setTimeout(() => setSuccess(""), 3000);
        fetchUsers();
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

    if (loading) return <div><Navbar /><p style={{ padding: "24px" }}>Chargement...</p></div>;

    const enAttente = users.filter(u => u.statut === "en_attente");
    const actifs = users.filter(u => u.statut !== "en_attente");

    return (
        <div>
            <Navbar />
            <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>

                <h1>Administration</h1>

                {success && (
                    <p style={{ background: "#f0fdf4", color: "#10b981", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>
                        ✅ {success}
                    </p>
                )}

                {/* COMPTES EN ATTENTE */}
                {enAttente.length > 0 && (
                    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                        <h2 style={{ marginTop: 0, color: "#92400e" }}>
                            ⏳ Comptes en attente ({enAttente.length})
                        </h2>
                        {enAttente.map(u => (
                            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #fde68a" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "500" }}>{u.nom}</div>
                                    <div style={{ fontSize: "13px", color: "#92400e" }}>{u.email}</div>
                                </div>
                                <button
                                    onClick={() => updateStatut(u.id, "actif")}
                                    style={{ padding: "6px 14px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                                >
                                    ✓ Valider
                                </button>
                                <button
                                    onClick={() => updateStatut(u.id, "suspendu")}
                                    style={{ padding: "6px 14px", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                                >
                                    ✗ Rejeter
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* TOUS LES UTILISATEURS */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                    <h2 style={{ marginTop: 0 }}>Tous les utilisateurs ({users.length})</h2>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                                <th style={{ padding: "10px 8px", color: "#64748b" }}>Nom</th>
                                <th style={{ padding: "10px 8px", color: "#64748b" }}>Email</th>
                                <th style={{ padding: "10px 8px", color: "#64748b" }}>Rôle</th>
                                <th style={{ padding: "10px 8px", color: "#64748b" }}>Statut</th>
                                <th style={{ padding: "10px 8px", color: "#64748b" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actifs.map(u => (
                                <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "12px 8px", fontWeight: "500" }}>
                                        {u.nom}
                                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>@{u.username}</div>
                                    </td>
                                    <td style={{ padding: "12px 8px", color: "#64748b" }}>{u.email}</td>
                                    <td style={{ padding: "12px 8px" }}>
                                        <select
                                            value={u.role}
                                            onChange={e => updateRole(u.id, e.target.value)}
                                            disabled={u.id === user?.id}
                                            style={{ padding: "4px 8px", borderRadius: "6px", border: `1px solid ${getRoleColor(u.role)}`, color: getRoleColor(u.role), background: "transparent", cursor: "pointer" }}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="chef">Chef</option>
                                            <option value="membre">Membre</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                        <select
                                            value={u.statut}
                                            onChange={e => updateStatut(u.id, e.target.value)}
                                            disabled={u.id === user?.id}
                                            style={{ padding: "4px 8px", borderRadius: "6px", border: `1px solid ${getStatutColor(u.statut)}`, color: getStatutColor(u.statut), background: "transparent", cursor: "pointer" }}
                                        >
                                            <option value="actif">Actif</option>
                                            <option value="en_attente">En attente</option>
                                            <option value="suspendu">Suspendu</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                        {u.id !== user?.id && (
                                            <button
                                                onClick={() => deleteUser(u.id)}
                                                style={{ padding: "4px 12px", background: "none", border: "1px solid #ef4444", color: "#ef4444", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}