import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllRead } from "../api/notificationApi";
import Layout from "../components/Layout";
import { formatDateTime } from "../utils/date";
import API from "../api/api";

const TYPE_CONFIG = {
  task_assigned:   { label:"Tâche assignée",    color:"#4F46E5", bg:"#EEF2FF" },
  task_updated:    { label:"Tâche mise à jour",  color:"#4F46E5", bg:"#EEF2FF" },
  comment_added:   { label:"Commentaire",         color:"#D97706", bg:"#FFFBEB" },
  project_updated: { label:"Projet mis à jour",   color:"#059669", bg:"#ECFDF5" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .nt-root { font-family:'DM Sans',system-ui,sans-serif; }
  .nt-item {
    display:flex; align-items:center; gap:14px;
    padding:14px 18px; border-radius:12px;
    border:1px solid #E2E8F0; background:#fff;
    transition:box-shadow 0.18s,border-color 0.18s,transform 0.15s;
    animation:fadeUp 0.25s ease both; position:relative; overflow:hidden;
  }
  .nt-item:hover { box-shadow:0 4px 16px rgba(0,0,0,0.06); border-color:#C7D2FE; transform:translateY(-1px); }
  .nt-item.unread { background:#FAFBFF; border-color:#C7D2FE; }
  .nt-item.unread::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#6366F1; border-radius:0; }
  .nt-btn-read {
    padding:5px 11px; border-radius:7px; border:1px solid #E2E8F0;
    color:#475569; background:#FAFAFA; cursor:pointer;
    font-size:12px; font-weight:500; font-family:'DM Sans',sans-serif;
    transition:all 0.15s; white-space:nowrap;
  }
  .nt-btn-read:hover { background:#F1F5F9; border-color:#CBD5E1; }
  .nt-btn-del {
    padding:5px 11px; border-radius:7px; border:1px solid #FECACA;
    color:#EF4444; background:#fff; cursor:pointer;
    font-size:12px; font-weight:500; font-family:'DM Sans',sans-serif;
    transition:background 0.15s; white-space:nowrap;
  }
  .nt-btn-del:hover { background:#FEF2F2; }
  .nt-btn-all {
    display:flex; align-items:center; gap:6px;
    padding:8px 16px; background:#fff; border:1px solid #E2E8F0;
    border-radius:10px; cursor:pointer; font-size:13px; font-weight:500;
    color:#475569; font-family:'DM Sans',sans-serif; transition:all 0.15s;
  }
  .nt-btn-all:hover { background:#F8FAFC; border-color:#CBD5E1; }
  .nt-empty { background:#fff; border:1.5px dashed #E2E8F0; border-radius:16px; padding:64px; text-align:center; }
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:10, color:"#94A3B8", fontSize:13.5, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:16, height:16, border:"2px solid #E2E8F0", borderTopColor:"#6366F1", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        Chargement...
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{css}</style>
      <div className="nt-root">

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
              <h1 style={{ margin:0, fontSize:20, fontWeight:700, color:"#0F172A", letterSpacing:"-0.4px" }}>Notifications</h1>
              {unreadCount > 0 && (
                <span style={{ background:"#6366F1", color:"#fff", borderRadius:20, fontSize:11, fontWeight:700, padding:"2px 9px", lineHeight:1.6 }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <p style={{ margin:0, color:"#64748B", fontSize:13.5 }}>
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est à jour"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="nt-btn-all" onClick={handleReadAll}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              Tout marquer comme lu
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="nt-empty">
            <div style={{ width:48, height:48, borderRadius:14, background:"#F8FAFC", border:"1px solid #E2E8F0", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
              <svg width="20" height="20" fill="none" stroke="#CBD5E1" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:600, color:"#475569" }}>Aucune notification</p>
            <p style={{ margin:0, fontSize:13, color:"#94A3B8" }}>Vous êtes à jour !</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {notifications.map((n, idx) => {
              const tc = TYPE_CONFIG[n.type] ?? { label:"Notification", color:"#64748B", bg:"#F9FAFB" };
              return (
                <div key={n.id} className={`nt-item${!n.is_read ? " unread" : ""}`} style={{ animationDelay:`${idx*0.04}s` }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:n.is_read?"#E2E8F0":"#6366F1", flexShrink:0, boxShadow:n.is_read?"none":"0 0 0 3px rgba(99,102,241,0.15)" }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:"0 0 5px", fontSize:13.5, color:n.is_read?"#64748B":"#0F172A", fontWeight:n.is_read?400:500, lineHeight:1.45 }}>
                      {n.message}
                    </p>
                    <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
                      <span style={{ fontSize:11, fontWeight:600, color:tc.color, background:tc.bg, padding:"2px 8px", borderRadius:5 }}>{tc.label}</span>
                      <span style={{ fontSize:11.5, color:"#94A3B8" }}>{formatDateTime(n.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                    {!n.is_read && <button className="nt-btn-read" onClick={() => handleRead(n.id)}>Marquer lu</button>}
                    <button className="nt-btn-del" onClick={() => deleteNotif(n.id)}>Supprimer</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}