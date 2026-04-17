import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/dashboardApi";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981"];

export default function Dashboard() {

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

    return (
        <div>
            <Navbar />

            <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>

                <h1>Tableau de bord</h1>

                {/* CARDS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Projets</p>
                        <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "500" }}>{stats.projects ?? 0}</p>
                    </div>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Total tâches</p>
                        <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "500" }}>{stats.total_tasks ?? 0}</p>
                    </div>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>À faire</p>
                        <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "500", color: "#f59e0b" }}>{stats.todo ?? 0}</p>
                    </div>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>En cours</p>
                        <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "500", color: "#3b82f6" }}>{stats.progress ?? 0}</p>
                    </div>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Terminées</p>
                        <p style={{ margin: "8px 0 0", fontSize: "32px", fontWeight: "500", color: "#10b981" }}>{stats.done ?? 0}</p>
                    </div>
                </div>

                {/* GRAPHIQUE */}
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px" }}>
                    <h2 style={{ marginTop: 0 }}>Répartition des tâches</h2>
                    <PieChart width={400} height={300}>
                        <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
                            {data.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

            </div>
        </div>
    );
}