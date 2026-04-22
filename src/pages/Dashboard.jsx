import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/dashboardApi";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLOR_MAP = {
    "À faire":  "#f59e0b",
    "En cours": "#3b82f6",
    "Terminé":  "#10b981",
};

const CARD_CONFIG = [
    { label: "Projets",   key: "projects", accent: "#6366f1", bg: "#eef2ff", icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
    )},
    { label: "À faire",   key: "todo",     accent: "#f59e0b", bg: "#fffbeb", icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )},
    { label: "En cours",  key: "progress", accent: "#3b82f6", bg: "#eff6ff", icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
    )},
    { label: "Terminées", key: "done",     accent: "#10b981", bg: "#f0fdf4", icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )},
];

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
        <div style={{
            background: "white", border: "1px solid #e5e7eb", borderRadius: "8px",
            padding: "8px 12px", fontSize: "13px",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}>
            <span style={{ color: COLOR_MAP[name], fontWeight: 600, marginRight: 6 }}>●</span>
            <span style={{ color: "#374151", fontWeight: 500 }}>{name}</span>
            <span style={{ color: "#6b7280", marginLeft: 8 }}>{value} tâche{value > 1 ? "s" : ""}</span>
        </div>
    );
};

const CustomLegend = ({ payload, total }) => (
    <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "12px" }}>
        {payload.map((entry) => {
            const pct = total > 0 ? Math.round((entry.payload.value / total) * 100) : 0;
            return (
                <div key={entry.value} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "12.5px", color: "#6b7280" }}>{entry.value}</span>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{pct}%</span>
                </div>
            );
        })}
    </div>
);

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getDashboardStats()
            .then(res => setStats(res.data))
            .catch(err => console.log(err));
    }, []);

    if (!stats) return (
        <Layout>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af", fontSize: "14px" }}>
                <div style={{
                    width: "14px", height: "14px", border: "2px solid #e5e7eb",
                    borderTopColor: "#3b82f6", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                }} />
                Chargement...
            </div>
        </Layout>
    );

    const pieData = [
        { name: "À faire",  value: stats.todo     ?? 0 },
        { name: "En cours", value: stats.progress  ?? 0 },
        { name: "Terminé",  value: stats.done      ?? 0 },
    ].filter(d => d.value > 0);

    const totalTaches = (stats.todo ?? 0) + (stats.progress ?? 0) + (stats.done ?? 0);

    return (
        <Layout>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .pf-stat-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
                .pf-stat-card:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
            `}</style>

            {/* EN-TÊTE */}
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                    Tableau de bord
                </h1>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "13.5px" }}>
                    Bonjour {user?.nom} — voici un aperçu de votre activité
                </p>
            </div>

            {/* CARDS MÉTRIQUES */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px",
                marginBottom: "24px",
            }}>
                {CARD_CONFIG.map(card => {
                    const value = stats[card.key] ?? 0;
                    return (
                        <div key={card.label} className="pf-stat-card" style={{
                            background: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px",
                            padding: "16px 18px",
                            borderTop: `3px solid ${card.accent}`,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                                <p style={{ margin: 0, color: "#6b7280", fontSize: "12.5px", fontWeight: "500" }}>
                                    {card.label}
                                </p>
                                <div style={{
                                    width: "26px", height: "26px", borderRadius: "6px",
                                    background: card.bg, color: card.accent,
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                }}>
                                    {card.icon}
                                </div>
                            </div>
                            <p style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#0f172a", lineHeight: 1 }}>
                                {value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* GRAPHIQUE DONUT */}
            <div style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "22px 24px 18px",
            }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div>
                        <h2 style={{ margin: "0 0 3px", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                            Répartition des tâches
                        </h2>
                        <p style={{ margin: 0, fontSize: "12.5px", color: "#9ca3af" }}>
                            Distribution par statut
                        </p>
                    </div>
                    {totalTaches > 0 && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: "5px",
                            background: "#f8fafc", border: "1px solid #e5e7eb",
                            borderRadius: "20px", padding: "4px 10px",
                        }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6" }} />
                            <span style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>
                                {totalTaches} tâche{totalTaches > 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                </div>

                {totalTaches === 0 ? (
                    <div style={{
                        textAlign: "center", padding: "48px 0",
                        border: "1px dashed #e5e7eb", borderRadius: "8px", margin: "16px 0 0",
                    }}>
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "8px",
                            background: "#f3f4f6", margin: "0 auto 10px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <p style={{ margin: 0, fontSize: "13.5px", color: "#9ca3af" }}>Aucune tâche pour le moment</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={105}
                                innerRadius={68}
                                paddingAngle={3}
                                strokeWidth={0}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={index} fill={COLOR_MAP[entry.name]} />
                                ))}
                            </Pie>
                            <text
                                x="50%"
                                y="44%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: "26px", fontWeight: "700", fill: "#0f172a", fontFamily: "'Inter', sans-serif" }}
                            >
                                {totalTaches}
                            </text>
                            <text
                                x="50%"
                                y="54%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: "12px", fill: "#9ca3af", fontFamily: "'Inter', sans-serif" }}
                            >
                                tâches
                            </text>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={(props) => <CustomLegend {...props} total={totalTaches} />} />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

        </Layout>
    );
}