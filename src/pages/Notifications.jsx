import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllRead } from "../api/notificationApi";
import Navbar from "../components/Navbar";

export default function Notifications() {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (id) => {
        await markAsRead(id);
        load();
    };

    const handleReadAll = async () => {
        await markAllRead();
        load();
    };

    const getTypeIcon = (type) => {
        const icons = {
            task_assigned: "📋",
            task_updated:  "🔄",
            comment_added: "💬",
            project_updated: "📁",
        };
        return icons[type] ?? "🔔";
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) return <div><Navbar /><p style={{ padding: "24px" }}>Chargement...</p></div>;

    return (
        <div>
            <Navbar />

            <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 24px" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <div>
                        <h1 style={{ margin: 0 }}>Notifications</h1>
                        {unreadCount > 0 && (
                            <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px" }}>
                                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                            </p>
                        )}
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleReadAll}
                            style={{ padding: "8px 16px", background: "transparent", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}
                        >
                            Tout marquer lu
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔔</div>
                        <p>Aucune notification pour le moment.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {notifications.map(n => (
                            <div key={n.id} style={{
                                background: n.is_read ? "white" : "#eff6ff",
                                border: `1px solid ${n.is_read ? "#e2e8f0" : "#bfdbfe"}`,
                                borderRadius: "12px",
                                padding: "16px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px"
                            }}>
                                <span style={{ fontSize: "24px", flexShrink: 0 }}>
                                    {getTypeIcon(n.type)}
                                </span>

                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: "14px", color: n.is_read ? "#64748b" : "#1e293b", fontWeight: n.is_read ? "400" : "500" }}>
                                        {n.message}
                                    </p>
                                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                                        {new Date(n.created_at).toLocaleDateString("fr-FR", {
                                            day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
                                        })}
                                    </p>
                                </div>

                                {!n.is_read && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }} />
                                        <button
                                            onClick={() => handleRead(n.id)}
                                            style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid #3b82f6", color: "#3b82f6", background: "transparent", cursor: "pointer", fontSize: "12px" }}
                                        >
                                            Marquer lu
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