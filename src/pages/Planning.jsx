import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Layout from "../components/Layout";

const STATUT = {
    a_faire:  { label:"À faire",  color:"#92400e", bg:"#fef3c7", border:"#fde68a", dot:"#f59e0b" },
    en_cours: { label:"En cours", color:"#1e40af", bg:"#dbeafe", border:"#bfdbfe", dot:"#3b82f6" },
    termine:  { label:"Terminé",  color:"#065f46", bg:"#d1fae5", border:"#a7f3d0", dot:"#10b981" },
};

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_DESKTOP = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const DAYS_MOBILE  = ["L","M","M","J","V","S","D"];

const css = `
    @keyframes spin   { to { transform:rotate(360deg); } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }

    .cal { width:100%; border-collapse:collapse; table-layout:fixed; }
    .cal-th {
        padding:11px 0; font-size:11.5px; font-weight:600; color:#64748b;
        text-align:center; background:#f8fafc; border-bottom:2px solid #e2e8f0;
        letter-spacing:0.04em; text-transform:uppercase;
    }
    .cal-th.we { color:#cbd5e1; }
    .cal-td {
        height:110px; vertical-align:top; padding:7px 6px;
        border:1px solid #f1f5f9; background:white; transition:background 0.1s;
    }
    .cal-td:hover { background:#fafbff; }
    .cal-td.out   { background:#f8fafc; }
    .cal-td.we    { background:#fafafa; }
    .cal-td.now   { background:#eff6ff; outline:2px solid #3b82f6; outline-offset:-1px; }

    .ev {
        display:flex; flex-direction:column; padding:3px 6px;
        border-radius:5px; margin-bottom:3px; cursor:pointer;
        border-left:3px solid; transition:filter 0.1s, transform 0.1s;
        animation:fadeUp 0.18s ease; overflow:hidden;
    }
    .ev:hover { filter:brightness(0.96); transform:translateY(-1px); }
    .ev-title { font-size:11px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .ev-sub   { font-size:10px; opacity:0.7; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }

    .chip {
        display:inline-flex; align-items:center; gap:5px;
        padding:5px 12px; border-radius:20px; cursor:pointer;
        font-size:12px; font-weight:500; border:1.5px solid;
        transition:all 0.15s; background:white;
    }
    .arr {
        width:32px; height:32px; border-radius:8px; background:white;
        border:1px solid #e2e8f0; cursor:pointer; font-size:18px;
        color:#374151; display:flex; align-items:center; justify-content:center;
        transition:background 0.12s;
    }
    .arr:hover { background:#f1f5f9; }
    .overlay {
        position:fixed; inset:0; background:rgba(15,23,42,0.45);
        display:flex; align-items:center; justify-content:center;
        z-index:300; backdrop-filter:blur(3px); animation:fadeUp 0.15s ease;
    }
    .modal {
        background:white; border-radius:18px; width:100%;
        max-width:420px; margin:0 16px; overflow:hidden;
        box-shadow:0 30px 80px rgba(0,0,0,0.2); animation:fadeUp 0.2s ease;
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 768px) {
        .cal-th { font-size:10px; padding:8px 0; }
        .cal-td { height:72px; padding:4px 3px; }
        .ev { padding:2px 4px; margin-bottom:2px; border-left-width:2px; }
        .ev-title { font-size:9.5px; }
        .ev-sub   { display:none; }
        .pf-plan-header { flex-direction:column !important; align-items:flex-start !important; gap:10px !important; }
        .pf-plan-stats  { flex-wrap:wrap; gap:6px !important; }
        .pf-plan-nav    { flex-direction:column !important; align-items:flex-start !important; gap:8px !important; }
        .pf-plan-chips  { flex-wrap:wrap; }
        .pf-month-label { min-width:120px !important; font-size:15px !important; }
    }
    @media (max-width: 480px) {
        .cal-td { height:58px; padding:3px 2px; }
        .ev-title { font-size:8.5px; }
    }
`;

const IconProject = () => (
    <svg width="13" height="13" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
);

const IconUser = ({ color = "#10b981" }) => (
    <svg width="13" height="13" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);

const IconCalendar = () => (
    <svg width="13" height="13" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);

export default function Planning() {
    const navigate = useNavigate();
    const [tasks, setTasks]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [sel, setSel]         = useState(null);
    const [today]               = useState(new Date());
    const [cur, setCur]         = useState(new Date());
    const [filter, setFilter]   = useState("tous");

    useEffect(() => {
        (async () => {
            try {
                const { data: projects } = await API.get("/projects");
                const arrays = await Promise.all(
                    projects.map(p =>
                        API.get(`/projects/${p.id}/tasks`)
                           .then(r => r.data.map(t => ({ ...t, projectTitre: p.titre, projectId: p.id })))
                           .catch(() => [])
                    )
                );
                setTasks(arrays.flat().filter(t => t.date_echeance));
            } catch(e) { console.log(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const year = cur.getFullYear(), month = cur.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    let   dow      = firstDay.getDay() - 1;
    if (dow < 0) dow = 6;

    const days = [];
    for (let i = dow - 1; i >= 0; i--)
        days.push({ date: new Date(year, month, -i), cur: false });
    for (let i = 1; i <= lastDay.getDate(); i++)
        days.push({ date: new Date(year, month, i), cur: true });
    while (days.length < 42)
        days.push({ date: new Date(year, month + 1, days.length - dow - lastDay.getDate() + 1), cur: false });

    const visible = filter === "tous" ? tasks : tasks.filter(t => t.statut === filter);
    const forDay  = d => visible.filter(t => new Date(t.date_echeance + "T00:00:00").toDateString() === d.toDateString());
    const isToday   = d => d.toDateString() === today.toDateString();
    const isWeekend = d => d.getDay() === 0 || d.getDay() === 6;
    const getAssigne = t => t.assignedUser?.nom || t.assigned_user?.nom || null;

    const monthTasks = tasks.filter(t => {
        const d = new Date(t.date_echeance + "T00:00:00");
        return d.getMonth() === month && d.getFullYear() === year;
    });

    if (loading) return (
        <Layout>
            <style>{css}</style>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60vh", gap:"12px" }}>
                <div style={{ width:"20px", height:"20px", border:"2.5px solid #e2e8f0", borderTopColor:"#3b82f6", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                <span style={{ color:"#94a3b8", fontSize:"13.5px" }}>Chargement du planning...</span>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <style>{css}</style>

            {/* TITRE + STATS */}
            <div className="pf-plan-header" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"20px", gap:"12px" }}>
                <div>
                    <h1 style={{ margin:"0 0 3px", fontSize:"22px", fontWeight:"700", color:"#0f172a", letterSpacing:"-0.4px" }}>
                        Planning
                    </h1>
                    <p style={{ margin:0, fontSize:"13px", color:"#94a3b8" }}>
                        {monthTasks.length} tâche{monthTasks.length !== 1 ? "s" : ""} ce mois · {tasks.length} au total
                    </p>
                </div>
                <div className="pf-plan-stats" style={{ display:"flex", gap:"8px" }}>
                    {Object.entries(STATUT).map(([k, c]) => {
                        const n = monthTasks.filter(t => t.statut === k).length;
                        return (
                            <div key={k} style={{ display:"flex", alignItems:"center", gap:"6px", background:"white", border:`1px solid ${c.border}`, borderRadius:"8px", padding:"5px 11px" }}>
                                <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:c.dot }} />
                                <span style={{ fontSize:"12px", color:c.color, fontWeight:"600" }}>{n}</span>
                                <span style={{ fontSize:"11.5px", color:"#94a3b8" }}>{c.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* NAV + FILTRES */}
            <div className="pf-plan-nav" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px", gap:"10px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <button className="arr" onClick={() => setCur(new Date(year, month - 1, 1))}>‹</button>
                    <span className="pf-month-label" style={{ fontSize:"17px", fontWeight:"700", color:"#0f172a", minWidth:"155px", textAlign:"center" }}>
                        {MONTHS[month]} {year}
                    </span>
                    <button className="arr" onClick={() => setCur(new Date(year, month + 1, 1))}>›</button>
                    <button onClick={() => setCur(new Date())} style={{
                        padding:"5px 13px", borderRadius:"8px", fontSize:"12px", fontWeight:"500",
                        background:"white", border:"1px solid #e2e8f0", cursor:"pointer", color:"#1d4ed8",
                    }}>
                        Aujourd'hui
                    </button>
                </div>
                <div className="pf-plan-chips" style={{ display:"flex", gap:"6px" }}>
                    {[
                        { val:"tous",     label:"Tous",     dot:"#94a3b8", ac:"#0f172a" },
                        { val:"a_faire",  label:"À faire",  dot:"#f59e0b", ac:"#f59e0b" },
                        { val:"en_cours", label:"En cours", dot:"#3b82f6", ac:"#3b82f6" },
                        { val:"termine",  label:"Terminé",  dot:"#10b981", ac:"#10b981" },
                    ].map(f => (
                        <button key={f.val} className="chip"
                            onClick={() => setFilter(f.val)}
                            style={{
                                background:  filter === f.val ? f.ac : "white",
                                borderColor: filter === f.val ? f.ac : "#e2e8f0",
                                color:       filter === f.val ? "white" : "#64748b",
                            }}
                        >
                            <div style={{ width:"7px", height:"7px", borderRadius:"50%", background: filter === f.val ? "white" : f.dot }} />
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* CALENDRIER */}
            <div style={{ background:"white", borderRadius:"14px", border:"1px solid #e2e8f0", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <table className="cal">
                    <thead>
                        <tr>
                            {DAYS_DESKTOP.map((d, i) => (
                                <th key={d} className={`cal-th${i >= 5 ? " we" : ""}`}>
                                    <span className="hide-mobile">{d}</span>
                                    <span className="show-mobile">{DAYS_MOBILE[i]}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length:6 }, (_, w) => (
                            <tr key={w}>
                                {days.slice(w*7, w*7+7).map((day, i) => {
                                    const dt  = forDay(day.date);
                                    const now = isToday(day.date);
                                    const we  = isWeekend(day.date);
                                    return (
                                        <td key={i} className={["cal-td", !day.cur?"out":"", we&&!now?"we":"", now?"now":""].filter(Boolean).join(" ")}>
                                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"4px" }}>
                                                <div style={{
                                                    width:"22px", height:"22px", borderRadius:"50%",
                                                    display:"flex", alignItems:"center", justifyContent:"center",
                                                    background: now ? "#1d4ed8" : "transparent",
                                                    fontSize:"12px",
                                                    fontWeight: now ? "700" : day.cur ? "500" : "400",
                                                    color: now ? "white" : day.cur ? "#0f172a" : "#cbd5e1",
                                                }}>
                                                    {day.date.getDate()}
                                                </div>
                                                {dt.length > 0 && (
                                                    <span style={{ fontSize:"9.5px", fontWeight:"700", color:"#94a3b8", background:"#f1f5f9", padding:"1px 5px", borderRadius:"10px" }}>
                                                        {dt.length}
                                                    </span>
                                                )}
                                            </div>
                                            {dt.slice(0,3).map(t => {
                                                const c = STATUT[t.statut] || STATUT.a_faire;
                                                const a = getAssigne(t);
                                                return (
                                                    <div key={t.id} className="ev"
                                                        style={{ background:c.bg, borderLeftColor:c.dot, color:c.color }}
                                                        onClick={() => setSel(t)}
                                                        title={`${t.projectTitre} · ${t.titre}`}
                                                    >
                                                        <span className="ev-title">{t.titre}</span>
                                                        <span className="ev-sub">{t.projectTitre}{a ? ` · ${a}` : ""}</span>
                                                    </div>
                                                );
                                            })}
                                            {dt.length > 3 && (
                                                <div style={{ fontSize:"10px", color:"#94a3b8", paddingLeft:"4px", fontWeight:"600" }}>
                                                    +{dt.length - 3}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Vide */}
            {tasks.length === 0 && (
                <div style={{ textAlign:"center", padding:"60px 0" }}>
                    <div style={{ width:"48px", height:"48px", borderRadius:"12px", background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                        <IconCalendar />
                    </div>
                    <p style={{ fontSize:"14.5px", fontWeight:"600", color:"#475569", margin:"0 0 6px" }}>Aucune tâche avec date d'échéance</p>
                    <p style={{ fontSize:"13px", color:"#94a3b8", margin:0 }}>Ajoutez des dates d'échéance à vos tâches pour les voir ici</p>
                </div>
            )}

            {/* MODAL */}
            {sel && (
                <div className="overlay" onClick={() => setSel(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div style={{ background: STATUT[sel.statut]?.bg, padding:"20px 22px 16px", borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                                <div style={{ flex:1, marginRight:"12px" }}>
                                    <span style={{ fontSize:"10.5px", fontWeight:"700", color:STATUT[sel.statut]?.dot, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                                        {STATUT[sel.statut]?.label}
                                    </span>
                                    <h3 style={{ margin:"4px 0 0", fontSize:"18px", fontWeight:"700", color:"#0f172a", lineHeight:1.3 }}>
                                        {sel.titre}
                                    </h3>
                                </div>
                                <button onClick={() => setSel(null)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"22px", color:"#94a3b8", lineHeight:1, padding:0 }}>×</button>
                            </div>
                        </div>
                        <div style={{ padding:"18px 22px 22px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"9px 13px", background:"#f8fafc", borderRadius:"10px", marginBottom:"10px" }}>
                                <IconProject />
                                <span style={{ fontSize:"13px", fontWeight:"600", color:"#374151" }}>{sel.projectTitre}</span>
                            </div>
                            {getAssigne(sel) && (
                                <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"9px 13px", background:"#f0fdf4", borderRadius:"10px", marginBottom:"10px" }}>
                                    <IconUser />
                                    <span style={{ fontSize:"13px", fontWeight:"600", color:"#065f46" }}>Assigné à : {getAssigne(sel)}</span>
                                </div>
                            )}
                            {sel.description && (
                                <p style={{ fontSize:"13px", color:"#64748b", margin:"0 0 12px", lineHeight:1.6 }}>{sel.description}</p>
                            )}
                            {[
                                { label:"Priorité", value:
                                    sel.priorite === "haute"   ? "Haute" :
                                    sel.priorite === "normale" ? "Normale" : "Basse"
                                },
                                { label:"Échéance", value: sel.date_echeance },
                            ].map(r => (
                                <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #f1f5f9" }}>
                                    <span style={{ fontSize:"12.5px", color:"#94a3b8" }}>{r.label}</span>
                                    <span style={{ fontSize:"13px", fontWeight:"500", color:"#374151" }}>{r.value}</span>
                                </div>
                            ))}
                            <button onClick={() => { navigate(`/projects/${sel.projectId}`); setSel(null); }}
                                style={{ width:"100%", marginTop:"16px", padding:"12px", background:"#0f172a", color:"white", border:"none", borderRadius:"10px", cursor:"pointer", fontSize:"13.5px", fontWeight:"600" }}>
                                Voir le projet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}