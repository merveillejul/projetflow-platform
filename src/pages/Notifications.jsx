import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllRead } from "../api/notificationApi";
import Layout from "../components/Layout";
import { formatDateTime } from "../utils/date";
import API from "../api/api";

const TYPE_CONFIG = {
    task_assigned:   { label: "Tâche assignée",      color: "#6366f1", bg: "#eef2ff" },
    task_updated:    { label: "Tâche mise à jour",    color: "#3b82f6", bg: "#eff6ff" },
    comment_added:   { label: "Commentaire",          color: "#f59e0b", bg: "#fffbeb" },
    project_updated: { label: "Projet mis à jour",    color: "#10b981", bg: "#f0fdf4" },
};

const notifStyles = `
    .pf-notif-item {
        border-radius: 10px; padding: 13px 16px;
        display: flex; align-items: center; gap: 13px;
        transition: box-shadow 0.15s ease;
        border: 1px solid #e2e8f0;
        background: white;
    }
    .pf-notif-item.unread {
        background: #fafbff;
        border-color: #dbeafe;
    }
    .pf-notif-item:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .pf-btn-read {
        padding: 4px 10px; border-radius: 6px;
        border: 1px solid #e2e8f0; color: #475569;
        background: white; cursor: pointer; font-size: 11.5px; font-weight: 500;
        transition: background 0.15s, border-color 0.15s;
        white-space: nowrap;
    }
    .pf-btn-read:hover { background: #f1f5f9; border-color: #cbd5e1; }
    .pf-btn-delete {
        padding: 4px 10px; border-radius: 6px;
        border: 1px solid #fecaca; color: #ef4444;
        background: white; cursor: pointer; font-size: 11.5px; font-weight: 500;
        transition: background 0.15s;
        white-space: nowrap;
    }
    .pf-btn-delete:hover { background: #fef2f2; }
    .pf-btn-markall {
        padding: 7px 14px; background: white;
        border: 1px solid #e2e8f0; border-radius: 8px;
        cursor: pointer; font-size: 12.5px; font-weight: 500; color: #475569;
        transition: background 0.15s, border-color 0.15s;
    }
    .pf-btn-markall:hover { background: #f8fafc; border-color: #cbd5e1; }
`;

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try { const res = await getNotifications(); setNotifications(res.data); }
        catch (err) { console.log(err); }
        finally { setLoading(false); }
    };

    const handleRead    = async (id) => { await markAsRead(id); load(); };
    const handleReadAll = async ()   => { await markAllRead(); load(); };
    const deleteNotif   = async (id) => { await API.delete(`/notifications/${id}`); load(); };

    const unreadCount = notifications.filter(n => !n.is_read).length;

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
            <style>{notifStyles}</style>

            {/* EN-TÊTE */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <h1 style={{ margin: 0, fontSize: "19px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
                            <span style={{
                                background: "#ef4444", color: "white",
                                borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                                padding: "2px 8px", lineHeight: 1.6,
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                        {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est à jour"}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button className="pf-btn-markall" onClick={handleReadAll}>
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div style={{
                    background: "white", border: "1px dashed #e2e8f0",
                    borderRadius: "12px", padding: "56px", textAlign: "center",
                }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "10px",
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 10px",
                    }}>
                        <svg width="17" height="17" fill="none" stroke="#cbd5e1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </div>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "13.5px" }}>Aucune notification</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {notifications.map(n => {
                        const typeConf = TYPE_CONFIG[n.type] ?? { label: "Notification", color: "#6b7280", bg: "#f9fafb" };
                        return (
                            <div key={n.id} className={`pf-notif-item${!n.is_read ? " unread" : ""}`}>

                                {/* INDICATEUR */}
                                <div style={{
                                    width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0,
                                    background: n.is_read ? "#e2e8f0" : "#3b82f6",
                                }} />

                                {/* CONTENU */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        margin: "0 0 4px", fontSize: "13px",
                                        color: n.is_read ? "#64748b" : "#0f172a",
                                        fontWeight: n.is_read ? "400" : "500",
                                        lineHeight: 1.45,
                                    }}>
                                        {n.message}
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span style={{
                                            fontSize: "11px", fontWeight: "500",
                                            color: typeConf.color, background: typeConf.bg,
                                            padding: "1px 7px", borderRadius: "4px",
                                        }}>
                                            {typeConf.label}
                                        </span>
                                        <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                                            {formatDateTime(n.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                                    {!n.is_read && (
                                        <button className="pf-btn-read" onClick={() => handleRead(n.id)}>
                                            Marquer lu
                                        </button>
                                    )}
                                    <button className="pf-btn-delete" onClick={() => deleteNotif(n.id)}>
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
}