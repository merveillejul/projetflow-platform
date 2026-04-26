import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/api";

const NAV_ITEMS = [
    {
        to: "/dashboard",
        label: "Tableau de bord",
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
        ),
    },
    {
        to: "/projects",
        label: "Projets",
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
        ),
    },
    {
        to: "/tasks",
        label: "Mes tâches",
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
        ),
    },
    {
        to: "/planning",
        label: "Planning",
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
        ),
    },
    {
        to: "/notifications",
        label: "Notifications",
        badge: true,
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
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
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        ),
    },
    {
        tab: "projets",
        to: "/admin?tab=projets",
        label: "Projets",
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
        ),
    },
];

const ROLE_CONFIG = {
    admin:  { color: "#f87171", bg: "rgba(248,113,113,0.15)", label: "Administrateur" },
    chef:   { color: "#60a5fa", bg: "rgba(96,165,250,0.15)",  label: "Chef de projet" },
    membre: { color: "#34d399", bg: "rgba(52,211,153,0.15)",  label: "Membre" },
};
const getRoleConfig = (role) =>
    ROLE_CONFIG[role] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.15)", label: role };

const sidebarStyles = `
    .pf-nav-item {
        display: flex; align-items: center; gap: 10px;
        padding: 8px 12px; border-radius: 8px; margin-bottom: 2px;
        text-decoration: none; font-size: 13.5px; font-weight: 400;
        color: rgba(255,255,255,0.65); background: transparent;
        transition: background 0.15s ease, color 0.15s ease;
        border-left: 2px solid transparent;
    }
    .pf-nav-item:hover {
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.95);
    }
    .pf-nav-item.active {
        background: rgba(255,255,255,0.12);
        color: #ffffff;
        border-left: 2px solid #60a5fa;
        font-weight: 500;
    }
    .pf-logout-btn {
        width: 100%; display: flex; align-items: center; gap: 10px;
        padding: 8px 12px; border-radius: 8px; border: none;
        background: transparent; cursor: pointer; font-size: 13.5px;
        color: rgba(255,255,255,0.4);
        font-family: 'Inter', sans-serif;
        transition: background 0.15s ease, color 0.15s ease;
        text-align: left;
    }
    .pf-logout-btn:hover {
        background: rgba(239,68,68,0.15);
        color: #f87171;
    }
    .pf-profile-link {
        display: flex; align-items: center; gap: 10px;
        padding: 10px 12px; border-radius: 8px; margin-bottom: 4px;
        background: rgba(255,255,255,0.06); cursor: pointer;
        text-decoration: none;
        transition: background 0.15s ease;
        border: 1px solid rgba(255,255,255,0.08);
    }
    .pf-profile-link:hover { background: rgba(255,255,255,0.1); }
    .pf-profile-link.active { background: rgba(255,255,255,0.12); border-color: rgba(96,165,250,0.4); }
    @keyframes pf-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .pf-sidebar { transform: translateX(0); }
    @media (max-width: 768px) {
        .pf-sidebar { transform: translateX(-100%); }
        .pf-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.3); }
    }
    .pf-section-label {
        font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3);
        text-transform: uppercase; letter-spacing: 0.1em;
        padding: 0 12px; margin: 0 0 6px;
    }
    .pf-divider {
        height: 1px; background: rgba(255,255,255,0.08); margin: 0 12px 12px;
    }
`;

export default function Sidebar({ isOpen, onClose }) {
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

    const isActive = (to) =>
        location.pathname === to || location.pathname.startsWith(to + "/");
    const currentTab = new URLSearchParams(location.search).get("tab") ?? "dashboard";
    const isAdminTabActive = (tab) =>
        location.pathname === "/admin" && currentTab === tab;
    const roleConfig = getRoleConfig(user?.role);

    useEffect(() => {
        if (onClose) onClose();
    }, [location.pathname, location.search]);

    return (
        <>
            <style>{sidebarStyles}</style>
            <aside
                className={isOpen ? "pf-sidebar open" : "pf-sidebar"}
                style={{
                    width: "232px",
                    minHeight: "100vh",
                    /* ✅ Gradient bleu professionnel */
                    background: "linear-gradient(180deg, #1e3a5f 0%, #162d4a 100%)",
                    borderRight: "none",
                    display: "flex",
                    flexDirection: "column",
                    position: "fixed",
                    top: 0, left: 0,
                    zIndex: 100,
                    fontFamily: "'Inter', sans-serif",
                    transition: "transform 0.25s ease",
                }}
            >
                {/* LOGO */}
                <div style={{ padding: "20px 16px 16px" }}>
                    <Link
                        to={isAdmin ? "/admin" : "/dashboard"}
                        style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}
                    >
                        <div style={{
                            width: "28px", height: "28px", borderRadius: "8px",
                            background: "#3b82f6",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 2px 8px rgba(59,130,246,0.4)",
                        }}>
                            <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.2"
                                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                        </div>
                        <span style={{
                            fontSize: "15px", fontWeight: "700",
                            color: "#ffffff", letterSpacing: "-0.3px",
                        }}>
                            ProjectFlow
                        </span>
                    </Link>
                </div>

                <div className="pf-divider" />

                {/* NAVIGATION */}
                <nav style={{ flex: 1, padding: "0 8px", overflowY: "auto" }}>
                    {!isAdmin && (
                        <>
                            <p className="pf-section-label">Menu</p>
                            {NAV_ITEMS.map(item => {
                                const active = isActive(item.to);
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={`pf-nav-item${active ? " active" : ""}`}
                                    >
                                        <span style={{
                                            color: active ? "#60a5fa" : "rgba(255,255,255,0.45)",
                                            flexShrink: 0, display: "flex",
                                            transition: "color 0.15s",
                                        }}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                        {item.badge && count > 0 && (
                                            <span style={{
                                                marginLeft: "auto",
                                                background: "#ef4444",
                                                color: "white",
                                                borderRadius: "20px",
                                                fontSize: "10.5px",
                                                fontWeight: "700",
                                                padding: "1px 6px",
                                                minWidth: "17px",
                                                textAlign: "center",
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

                    {isAdmin && (
                        <>
                            <p className="pf-section-label">Administration</p>
                            {ADMIN_NAV_ITEMS.map(item => {
                                const active = isAdminTabActive(item.tab);
                                return (
                                    <Link
                                        key={item.tab}
                                        to={item.to}
                                        className={`pf-nav-item${active ? " active" : ""}`}
                                    >
                                        <span style={{
                                            color: active ? "#60a5fa" : "rgba(255,255,255,0.45)",
                                            flexShrink: 0, display: "flex",
                                            transition: "color 0.15s",
                                        }}>
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
                <div style={{
                    padding: "10px 8px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                }}>
                    <Link
                        to="/profile"
                        className={`pf-profile-link${isActive("/profile") ? " active" : ""}`}
                    >
                        <div style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            background: roleConfig.color,
                            color: "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "13px", fontWeight: "700", flexShrink: 0,
                        }}>
                            {user?.nom?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: "hidden", flex: 1 }}>
                            <div style={{
                                fontSize: "13px", fontWeight: "500",
                                color: "#ffffff",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                                {user?.nom}
                            </div>
                            <span style={{
                                display: "inline-block", fontSize: "10.5px", fontWeight: "600",
                                color: roleConfig.color, background: roleConfig.bg,
                                padding: "1px 6px", borderRadius: "4px", marginTop: "2px",
                            }}>
                                {roleConfig.label}
                            </span>
                        </div>
                        <svg width="13" height="13" fill="none" stroke="rgba(255,255,255,0.3)"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </Link>

                    <button onClick={handleLogout} className="pf-logout-btn">
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75"
                            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Déconnexion
                    </button>
                </div>
            </aside>
        </>
    );
}