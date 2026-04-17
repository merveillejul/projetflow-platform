import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/dashboardApi";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLOR_MAP = {
    "À faire":  "#f59e0b",
    "En cours": "#3b82f6",
    "Terminé":  "#10b981",
};

export default function Dashboard() {

    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getDashboardStats()
            .then(res => setStats(res.data))
            .catch(err => console.log(err));
    }, []);

    if (!stats) return (
        <div>
            <Navbar />
            <p style={{ padding: "24px" }}>Chargement...</p>
        </div>
    );

    const data = [
        { name: "À faire",  value: stats.todo     ?? 0 },
        { name: "En cours", value: stats.progress  ?? 0 },
        { name: "Terminé",  value: stats.done      ?? 0 },
    ];

    const totalTaches = (stats.todo ?? 0) + (stats.progress ?? 0) + (stats.done ?? 0);

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />

            <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>

                <h1 style={{ marginBottom: "4px" }}>Tableau de bord</h1>
                <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
                    Bonjour {user?.nom} 👋 — {user?.role === "chef" ? "Vue chef de projet" : "Vue membre"}
                </p>

                {/* CARDS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", borderLeft: "4px solid #3b82f6" }}>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Projets</p>
                        <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "500" }}>{stats.projects ?? 0}</p>
                    </div>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", borderLeft: "4px solid #64748b" }}>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Total tâches</p>
                        <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "500" }}>{totalTaches}</p>
                    </div>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", borderLeft: "4px solid #f59e0b" }}>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>À faire</p>
                        <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "500", color: "#f59e0b" }}>{stats.todo ?? 0}</p>
                    </div>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", borderLeft: "4px solid #3b82f6" }}>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>En cours</p>
                        <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "500", color: "#3b82f6" }}>{stats.progress ?? 0}</p>
                    </div>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", borderLeft: "4px solid #10b981" }}>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Terminées</p>
                        <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "500", color: "#10b981" }}>{stats.done ?? 0}</p>
                    </div>
                </div>

                {/* GRAPHIQUE */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px" }}>
                    <h2 style={{ marginTop: 0, marginBottom: "24px" }}>Répartition des tâches</h2>
                    {totalTaches === 0 ? (
                        <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>
                            Aucune tâche pour le moment.
                        </p>
                    ) : (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <PieChart width={400} height={300}>
                                <Pie
                                    data={data.filter(d => d.value > 0)}
                                    dataKey="value"
                                    nameKey="name"
                                    outerRadius={110}
                                    innerRadius={50}
                                    paddingAngle={3}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {data.filter(d => d.value > 0).map((entry, index) => (
                                        <Cell key={index} fill={COLOR_MAP[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} tâche(s)`, ""]} />
                                <Legend />
                            </PieChart>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}