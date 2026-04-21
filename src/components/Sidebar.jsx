import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";

const NAV_ITEMS = [
    {
        to: "/dashboard",
        label: "Tableau de bord",
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
        ),
    },
    {
        to: "/projects",
        label: "Projets",
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    {
        to: "/tasks",
        label: "Mes tâches",
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
    },
    {
        to: "/notifications",
        label: "Notifications",
        badge: true,
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        ),
    },
];

const ADMIN_NAV_ITEMS = [
    {
        tab: "dashboard",
        to: "/admin",
        label: "Vue d'ensemble",
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
        ),
    },
    {
        tab: "users",
        to: "/admin?tab=users",
        label: "Utilisateurs",
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        ),
    },
    {
        tab: "projets",
        to: "/admin?tab=projets",
        label: "Projets",
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
        ),
    },
];

const ROLE_CONFIG = {
    admin:  { color: "#ef4444", bg: "#fef2f2", label: "Administrateur" },
    chef:   { color: "#3b82f6", bg: "#eff6ff", label: "Chef de projet" },
    membre: { color: "#10b981", bg: "#f0fdf4", label: "Membre" },
};

const getRoleConfig = (role) => ROLE_CONFIG[role] ?? { color: "#6b7280", bg: "#f9fafb", label: role };

const sidebarStyles = `
    .pf-nav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 10px;
        border-radius: 7px;
        margin-bottom: 1px;
        text-decoration: none;
        font-size: 13.5px;
        font-weight: 400;
        color: #4b5563;
        background: transparent;
        transition: background 0.15s ease, color 0.15s ease;
        position: relative;
        border-left: 2px solid transparent;
    }
    .pf-nav-item:hover { background: #f9fafb; color: #111827; }
    .pf-nav-item.active {
        background: #f0f4ff;
        color: #1d4ed8;
        border-left: 2px solid #3b82f6;
        font-weight: 500;
    }
    .pf-logout-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 7px 10px;
        border-radius: 7px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 13.5px;
        color: #9ca3af;
        font-family: 'Inter', -apple-system, sans-serif;
        transition: background 0.15s ease, color 0.15s ease;
        border-left: 2px solid transparent;
        text-align: left;
    }
    .pf-logout-btn:hover { background: #fef2f2; color: #ef4444; }
    .pf-profile-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 7px;
        margin-bottom: 2px;
        background: transparent;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.15s ease;
        border-left: 2px solid transparent;
    }
    .pf-profile-link:hover { background: #f9fafb; }
    .pf-profile-link.active { background: #f0f4ff; border-left: 2px solid #3b82f6; }
    @keyframes pf-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
`;

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [count, setCount] = useState(0);

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        if (isAdmin) return;
        const fetchCount = async () => {
            try {
                const res = await API.get("/notifications/unread-count");
                setCount(res.data.count ?? 0);
            } catch (err) {}
        };
        fetchCount();
        const interval = setInterval(fetchCount, 5000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    const handleLogout = async () => {
        try { await API.post("/logout"); } catch (err) {}
        finally { logout(); navigate("/"); }
    };

    const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "/");

    const currentTab = new URLSearchParams(location.search).get("tab") ?? "dashboard";
    const isAdminTabActive = (tab) => location.pathname === "/admin" && currentTab === tab;

    const roleConfig = getRoleConfig(user?.role);

    return (
        <>
            <style>{sidebarStyles}</style>
            <aside style={{
                width: "232px",
                minHeight: "100vh",
                background: "#ffffff",
                borderRight: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                top: 0, left: 0, zIndex: 100,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}>

                {/* LOGO */}
                <div style={{ padding: "18px 16px 14px" }}>
                    <Link to={isAdmin ? "/admin" : "/dashboard"} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "9px" }}>
                        <div style={{
                            width: "26px", height: "26px", borderRadius: "7px",
                            background: "#1d4ed8",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </div>
                        <span style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                            ProjectFlow
                        </span>
                    </Link>
                </div>

                <div style={{ height: "1px", background: "#f3f4f6", margin: "0 16px 10px" }} />

                {/* NAVIGATION */}
                <nav style={{ flex: 1, padding: "0 10px", overflowY: "auto" }}>

                    {/* Nav utilisateur (chef / membre) */}
                    {!isAdmin && (
                        <>
                            <p style={{
                                fontSize: "10.5px", fontWeight: "600", color: "#9ca3af",
                                textTransform: "uppercase", letterSpacing: "0.09em",
                                padding: "0 10px", margin: "0 0 6px",
                            }}>
                                Menu
                            </p>
                            {NAV_ITEMS.map(item => {
                                const active = isActive(item.to);
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={`pf-nav-item${active ? " active" : ""}`}
                                    >
                                        <span style={{ color: active ? "#3b82f6" : "#9ca3af", flexShrink: 0, transition: "color 0.15s", display: "flex" }}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                        {item.badge && count > 0 && (
                                            <span style={{
                                                marginLeft: "auto",
                                                background: "#ef4444", color: "white",
                                                borderRadius: "20px", fontSize: "10.5px", fontWeight: "600",
                                                padding: "1px 6px", minWidth: "17px", textAlign: "center",
                                                animation: "pf-pulse 2s ease-in-out infinite",
                                            }}>
                                                {count > 9 ? "9+" : count}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </>
                    )}

                    {/* Nav admin */}
                    {isAdmin && (
                        <>
                            <p style={{
                                fontSize: "10.5px", fontWeight: "600", color: "#9ca3af",
                                textTransform: "uppercase", letterSpacing: "0.09em",
                                padding: "0 10px", margin: "0 0 6px",
                            }}>
                                Admin
                            </p>
                            {ADMIN_NAV_ITEMS.map(item => {
                                const active = isAdminTabActive(item.tab);
                                return (
                                    <Link
                                        key={item.tab}
                                        to={item.to}
                                        className={`pf-nav-item${active ? " active" : ""}`}
                                    >
                                        <span style={{ color: active ? "#3b82f6" : "#9ca3af", flexShrink: 0, transition: "color 0.15s", display: "flex" }}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </>
                    )}
                </nav>

                {/* PROFIL + DÉCONNEXION */}
                <div style={{ padding: "10px", borderTop: "1px solid #f3f4f6" }}>
                    <Link to="/profile" className={`pf-profile-link${isActive("/profile") ? " active" : ""}`}>
                        <div style={{
                            width: "30px", height: "30px", borderRadius: "8px",
                            background: roleConfig.color, color: "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "12px", fontWeight: "600", flexShrink: 0,
                        }}>
                            {user?.nom?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: "hidden", flex: 1 }}>
                            <div style={{ fontSize: "13px", fontWeight: "500", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {user?.nom}
                            </div>
                            <span style={{
                                display: "inline-block", fontSize: "10.5px", fontWeight: "500",
                                color: roleConfig.color, background: roleConfig.bg,
                                padding: "1px 6px", borderRadius: "4px", marginTop: "1px",
                            }}>
                                {roleConfig.label}
                            </span>
                        </div>
                        <svg width="13" height="13" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>

                    <button onClick={handleLogout} className="pf-logout-btn">
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Déconnexion
                    </button>
                </div>
            </aside>
        </>
    );
}