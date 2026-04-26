import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Layout from "../components/Layout";

const STATUT = {
  a_faire:  { label:"À faire",  color:"#D97706", bg:"#FFFBEB", border:"#FDE68A", dot:"#F59E0B" },
  en_cours: { label:"En cours", color:"#4F46E5", bg:"#EEF2FF", border:"#C7D2FE", dot:"#6366F1" },
  termine:  { label:"Terminé",  color:"#059669", bg:"#ECFDF5", border:"#A7F3D0", dot:"#10B981" },
};

const MONTHS       = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_DESKTOP = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const DAYS_MOBILE  = ["L","M","M","J","V","S","D"];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
  @keyframes modalIn { from { opacity:0; transform:scale(0.97) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
  .pl-root { font-family:'DM Sans',system-ui,sans-serif; }
  .cal { width:100%; border-collapse:collapse; table-layout:fixed; }
  .cal-th {
    padding:11px 0; font-size:11px; font-weight:600; color:#94A3B8;
    text-align:center; background:#F8FAFC;
    border-bottom:1px solid #E2E8F0;
    letter-spacing:0.06em; text-transform:uppercase;
  }
  .cal-th.we { color:#CBD5E1; }
  .cal-td {
    height:112px; vertical-align:top; padding:8px 7px;
    border:1px solid #F1F5F9; background:#fff;
    transition:background 0.1s;
  }
  .cal-td:hover { background:#FAFBFF; }
  .cal-td.out { background:#F8FAFC; }
  .cal-td.we  { background:#FAFAFA; }
  .cal-td.now { background:#EEF2FF; outline:2px solid #6366F1; outline-offset:-1px; }
  .day-num {
    width:22px; height:22px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:12px; line-height:1;
  }
  .ev {
    display:flex; flex-direction:column; padding:3px 6px;
    border-radius:5px; margin-bottom:3px; cursor:pointer;
    border-left:3px solid; transition:filter 0.1s,transform 0.1s;
    animation:fadeUp 0.18s ease; overflow:hidden;
  }
  .ev:hover { filter:brightness(0.96); transform:translateY(-1px); }
  .ev-title { font-size:11px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ev-sub   { font-size:10px; opacity:0.65; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }
  .chip {
    display:inline-flex; align-items:center; gap:5px;
    padding:6px 13px; border-radius:20px; cursor:pointer;
    font-size:12px; font-weight:500; border:1px solid;
    transition:all 0.15s; background:#fff;
    font-family:'DM Sans',sans-serif;
  }
  .arr {
    width:32px; height:32px; border-radius:8px; background:#fff;
    border:1px solid #E2E8F0; cursor:pointer; font-size:16px;
    color:#374151; display:flex; align-items:center; justify-content:center;
    transition:background 0.12s; font-family:'DM Sans',sans-serif;
  }
  .arr:hover { background:#F1F5F9; }
  .overlay {
    position:fixed; inset:0; background:rgba(15,23,42,0.5);
    display:flex; align-items:center; justify-content:center;
    z-index:300; backdrop-filter:blur(4px);
  }
  .modal {
    background:#fff; border-radius:18px; width:100%;
    max-width:420px; margin:0 16px; overflow:hidden;
    box-shadow:0 30px 80px rgba(0,0,0,0.2);
    animation:modalIn 0.22s ease;
  }
  .today-btn {
    padding:6px 14px; border-radius:8px; font-size:12px; font-weight:500;
    background:#fff; border:1px solid #E2E8F0; cursor:pointer;
    color:#4F46E5; font-family:'DM Sans',sans-serif; transition:all 0.15s;
  }
  .today-btn:hover { background:#EEF2FF; border-color:#C7D2FE; }
`;

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
              .then(r => r.data.map(t => ({ ...t, projectTitre:p.titre, projectId:p.id })))
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
  let dow = firstDay.getDay() - 1;
  if (dow < 0) dow = 6;

  const days = [];
  for (let i = dow - 1; i >= 0; i--) days.push({ date:new Date(year, month, -i), cur:false });
  for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date:new Date(year, month, i), cur:true });
  while (days.length < 42) days.push({ date:new Date(year, month+1, days.length-dow-lastDay.getDate()+1), cur:false });

  const visible   = filter === "tous" ? tasks : tasks.filter(t => t.statut === filter);
  const forDay    = d => visible.filter(t => new Date(t.date_echeance+"T00:00:00").toDateString() === d.toDateString());
  const isToday   = d => d.toDateString() === today.toDateString();
  const isWeekend = d => d.getDay() === 0 || d.getDay() === 6;
  const getAssigne = t => t?.assignedUser?.nom || t?.assigned_user?.nom || null;

  const monthTasks = tasks.filter(t => {
    const d = new Date(t.date_echeance+"T00:00:00");
    return d.getMonth() === month && d.getFullYear() === year;
  });

  if (loading) return (
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60vh", gap:12 }}>
        <div style={{ width:20, height:20, border:"2.5px solid #E2E8F0", borderTopColor:"#6366F1", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        <span style={{ color:"#94A3B8", fontSize:13.5, fontFamily:"'DM Sans',sans-serif" }}>Chargement du planning...</span>
      </div>
    </Layout>
  );

  const filterOptions = [
    { val:"tous",     label:"Tous",     dot:"#94A3B8", ac:"#0F172A" },
    { val:"a_faire",  label:"À faire",  dot:"#F59E0B", ac:"#F59E0B" },
    { val:"en_cours", label:"En cours", dot:"#6366F1", ac:"#6366F1" },
    { val:"termine",  label:"Terminé",  dot:"#10B981", ac:"#10B981" },
  ];

  return (
    <Layout>
      <style>{css}</style>
      <div className="pl-root">

        {/* En-tête */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ margin:"0 0 4px", fontSize:20, fontWeight:700, color:"#0F172A", letterSpacing:"-0.4px" }}>Planning</h1>
            <p style={{ margin:0, fontSize:13, color:"#64748B" }}>
            {monthTasks.length} tâche{monthTasks.length !== 1 ? "s" : ""} ce mois · {tasks.length} au total
          </p>
        </div>

        {/* Nav + filtres */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, gap:10, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button className="arr" onClick={() => setCur(new Date(year, month-1, 1))}>‹</button>
            <span style={{ fontSize:16, fontWeight:700, color:"#0F172A", minWidth:155, textAlign:"center", letterSpacing:"-0.3px" }}>
              {MONTHS[month]} {year}
            </span>
            <button className="arr" onClick={() => setCur(new Date(year, month+1, 1))}>›</button>
            <button className="today-btn" onClick={() => setCur(new Date())}>Aujourd'hui</button>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {filterOptions.map(f => (
              <button key={f.val} className="chip"
                onClick={() => setFilter(f.val)}
                style={{
                  background:  filter === f.val ? f.ac : "#fff",
                  borderColor: filter === f.val ? f.ac : "#E2E8F0",
                  color:       filter === f.val ? "#fff" : "#64748B",
                }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background: filter === f.val ? "rgba(255,255,255,0.6)" : f.dot }} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendrier */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #E2E8F0", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <table className="cal">
            <thead>
              <tr>
                {DAYS_DESKTOP.map((d, i) => (
                  <th key={i} className={`cal-th${i >= 5 ? " we" : ""}`}>{d}</th>
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
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                          <div className="day-num" style={{
                            background: now ? "#6366F1" : "transparent",
                            fontWeight: now ? 700 : day.cur ? 500 : 400,
                            color: now ? "#fff" : day.cur ? "#0F172A" : "#CBD5E1",
                          }}>
                            {day.date.getDate()}
                          </div>
                          {dt.length > 0 && (
                            <span style={{ fontSize:9.5, fontWeight:700, color:"#94A3B8", background:"#F1F5F9", padding:"1px 5px", borderRadius:10 }}>
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
                              title={`${t.projectTitre} · ${t.titre}`}>
                              <span className="ev-title">{t.titre}</span>
                              <span className="ev-sub">{t.projectTitre}{a ? ` · ${a}` : ""}</span>
                            </div>
                          );
                        })}
                        {dt.length > 3 && (
                          <div style={{ fontSize:10, color:"#94A3B8", paddingLeft:4, fontWeight:600 }}>+{dt.length-3}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <p style={{ fontSize:14.5, fontWeight:600, color:"#475569", margin:"0 0 6px" }}>Aucune tâche avec date d'échéance</p>
            <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Ajoutez des dates d'échéance à vos tâches pour les voir ici</p>
          </div>
        )}

        {/* Modal */}
        {sel && (
          <div className="overlay" onClick={() => setSel(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div style={{ background:STATUT[sel.statut]?.bg ?? "#F8FAFC", padding:"20px 22px 16px", borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1, marginRight:12 }}>
                    <span style={{ fontSize:10.5, fontWeight:700, color:STATUT[sel.statut]?.dot, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                      {STATUT[sel.statut]?.label}
                    </span>
                    <h3 style={{ margin:"4px 0 0", fontSize:18, fontWeight:700, color:"#0F172A", lineHeight:1.3, letterSpacing:"-0.3px" }}>
                      {sel.titre}
                    </h3>
                  </div>
                  <button onClick={() => setSel(null)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:"#94A3B8", lineHeight:1, padding:0, fontFamily:"inherit" }}>×</button>
                </div>
              </div>
              <div style={{ padding:"18px 22px 22px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 13px", background:"#F8FAFC", borderRadius:10, marginBottom:10 }}>
                  <svg width="13" height="13" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{sel.projectTitre}</span>
                </div>
                {getAssigne(sel) && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 13px", background:"#ECFDF5", borderRadius:10, marginBottom:10 }}>
                    <svg width="13" height="13" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span style={{ fontSize:13, fontWeight:600, color:"#065F46" }}>Assigné à : {getAssigne(sel)}</span>
                  </div>
                )}
                {sel.description && (
                  <p style={{ fontSize:13, color:"#64748B", margin:"0 0 12px", lineHeight:1.6 }}>{sel.description}</p>
                )}
                {[
                  { label:"Priorité", value: sel.priorite === "haute" ? "Haute" : sel.priorite === "normale" ? "Normale" : "Basse" },
                  { label:"Échéance", value: sel.date_echeance },
                ].map(r => (
                  <div key={r.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #F1F5F9" }}>
                    <span style={{ fontSize:12.5, color:"#94A3B8" }}>{r.label}</span>
                    <span style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{r.value}</span>
                  </div>
                ))}
                <button
                  onClick={() => { navigate(`/projects/${sel.projectId}`); setSel(null); }}
                  style={{ width:"100%", marginTop:16, padding:12, background:"#0F172A", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontSize:13.5, fontWeight:600, fontFamily:"'DM Sans',sans-serif", letterSpacing:"-0.1px" }}>
                  Voir le projet
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}