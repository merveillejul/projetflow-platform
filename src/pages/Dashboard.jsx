import { useEffect, useState } from "react";
import { getDashboardStats } from "../api/dashboardApi";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLOR_MAP = {
  "À faire":  "#F97316",
  "En cours": "#6366F1",
  "Terminé":  "#10B981",
};

const CARD_CONFIG = [
  { label: "Projets",   key: "projects", accent: "#6366F1", light: "#EEF2FF", text: "#4338CA",
    icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  { label: "À faire",   key: "todo",     accent: "#F97316", light: "#FFF7ED", text: "#C2410C",
    icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { label: "En cours",  key: "progress", accent: "#6366F1", light: "#EEF2FF", text: "#4338CA",
    icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> },
  { label: "Terminées", key: "done",     accent: "#10B981", light: "#ECFDF5", text: "#047857",
    icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", fontSize: 12.5, fontFamily: "inherit", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
      <span style={{ color: COLOR_MAP[name], fontWeight: 700, marginRight: 6 }}>●</span>
      <span style={{ color: "#F1F5F9", fontWeight: 500 }}>{name}</span>
      <span style={{ color: "#64748B", marginLeft: 8 }}>{value} tâche{value > 1 ? "s" : ""}</span>
    </div>
  );
};

const CustomLegend = ({ payload, total }) => (
  <div style={{ display: "flex", justifyContent: "center", gap: 22, flexWrap: "wrap", marginTop: 16 }}>
    {payload.map((entry) => {
      const pct = total > 0 ? Math.round((entry.payload.value / total) * 100) : 0;
      return (
        <div key={entry.value} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "#64748B" }}>{entry.value}</span>
          <span style={{ fontSize: 11, color: "#94A3B8", background: "#F1F5F9", padding: "1px 6px", borderRadius: 20 }}>{pct}%</span>
        </div>
      );
    })}
  </div>
);

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .db-root { font-family:'DM Sans',system-ui,sans-serif; animation:fadeUp 0.3s ease; }
  .db-stat-card {
    background:#fff; border:1px solid #E2E8F0; border-radius:14px;
    padding:20px 22px; position:relative; overflow:hidden;
    transition:transform 0.18s,box-shadow 0.18s; cursor:default;
  }
  .db-stat-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:var(--ca); border-radius:14px 14px 0 0;
  }
  .db-stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.07); }
  .db-chart-card {
    background:#fff; border:1px solid #E2E8F0; border-radius:16px;
    padding:26px 28px 22px;
  }
`;

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats().then(res => setStats(res.data)).catch(console.log);
  }, []);

  if (!stats) return (
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:10, color:"#94A3B8", fontSize:13.5, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:16, height:16, border:"2px solid #E2E8F0", borderTopColor:"#6366F1", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        Chargement...
      </div>
    </Layout>
  );

  const pieData = [
    { name: "À faire",  value: stats.todo     ?? 0 },
    { name: "En cours", value: stats.progress ?? 0 },
    { name: "Terminé",  value: stats.done      ?? 0 },
  ].filter(d => d.value > 0);

  const total = (stats.todo ?? 0) + (stats.progress ?? 0) + (stats.done ?? 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <Layout>
      <style>{css}</style>
      <div className="db-root">

        {/* En-tête */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: "0 0 5px", fontSize: 20, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.4px" }}>
            Tableau de bord
          </h1>
          <p style={{ margin: 0, color: "#64748B", fontSize: 13.5 }}>
            {greeting}{user?.nom ? `, ${user.nom}` : ""} — voici un aperçu de votre activité
          </p>
        </div>

        {/* Cards métriques */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14, marginBottom:28 }}>
          {CARD_CONFIG.map((card, idx) => (
            <div key={card.key} className="db-stat-card"
              style={{ "--ca": card.accent, animation:`fadeUp 0.35s ease both`, animationDelay:`${idx*0.07}s` }}>
              <div style={{ width:32, height:32, borderRadius:9, background:card.light, color:card.text, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                {card.icon}
              </div>
              <p style={{ margin:"0 0 4px", fontSize:30, fontWeight:700, color:"#0F172A", lineHeight:1, letterSpacing:"-1px" }}>
                {stats[card.key] ?? 0}
              </p>
              <p style={{ margin:0, fontSize:12.5, fontWeight:500, color:"#94A3B8" }}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Graphique */}
        <div className="db-chart-card">
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:4 }}>
            <div>
              <h2 style={{ margin:"0 0 3px", fontSize:15, fontWeight:600, color:"#0F172A", letterSpacing:"-0.2px" }}>
                Répartition des tâches
              </h2>
              <p style={{ margin:0, fontSize:12.5, color:"#94A3B8" }}>Distribution par statut</p>
            </div>
            {total > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:20, padding:"5px 12px" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#6366F1" }} />
                <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{total} tâche{total > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
          <div style={{ height:1, background:"#F1F5F9", margin:"16px 0 4px" }} />

          {total === 0 ? (
            <div style={{ textAlign:"center", padding:"52px 0", border:"1.5px dashed #E2E8F0", borderRadius:12, marginTop:16 }}>
              <p style={{ margin:0, fontSize:13.5, color:"#94A3B8" }}>Aucune tâche pour le moment</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={108} innerRadius={72} paddingAngle={3} strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={COLOR_MAP[entry.name]} />)}
                </Pie>
                <text x="50%" y="43%" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize:28, fontWeight:700, fill:"#0F172A", fontFamily:"'DM Sans',sans-serif", letterSpacing:"-1px" }}>
                  {total}
                </text>
                <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize:11.5, fill:"#94A3B8", fontFamily:"'DM Sans',sans-serif" }}>
                  tâches
                </text>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={(props) => <CustomLegend {...props} total={total} />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </Layout>
  );
}