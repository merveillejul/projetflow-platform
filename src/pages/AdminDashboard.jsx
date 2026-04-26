import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const USER_STATUT_CONFIG = {
  actif:      { label:"Actif",      color:"#059669", bg:"#ECFDF5", border:"#A7F3D0" },
  en_attente: { label:"En attente", color:"#D97706", bg:"#FFFBEB", border:"#FDE68A" },
  suspendu:   { label:"Suspendu",   color:"#DC2626", bg:"#FEF2F2", border:"#FECACA" },
};

const ROLE_CONFIG = {
  admin:  { label:"Admin",  color:"#DC2626", bg:"#FEF2F2", border:"#FECACA" },
  chef:   { label:"Chef",   color:"#4F46E5", bg:"#EEF2FF", border:"#C7D2FE" },
  membre: { label:"Membre", color:"#059669", bg:"#ECFDF5", border:"#A7F3D0" },
};

const PROJET_STATUT_CONFIG = {
  en_attente: { label:"En attente", color:"#D97706", bg:"#FFFBEB", border:"#FDE68A", dot:"#F59E0B" },
  en_cours:   { label:"En cours",   color:"#4F46E5", bg:"#EEF2FF", border:"#C7D2FE", dot:"#6366F1" },
  termine:    { label:"Terminé",    color:"#059669", bg:"#ECFDF5", border:"#A7F3D0", dot:"#10B981" },
  suspendu:   { label:"Suspendu",   color:"#DC2626", bg:"#FEF2F2", border:"#FECACA", dot:"#EF4444" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  @keyframes spin   { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .ad-root { font-family:'DM Sans',system-ui,sans-serif; animation:fadeUp 0.3s ease; }

  /* Tabs */
  .ad-tab {
    padding:9px 16px; background:none; border:none; cursor:pointer;
    font-size:13.5px; font-weight:400; color:#64748B;
    border-bottom:2px solid transparent; margin-bottom:-1px;
    display:flex; align-items:center; gap:6px;
    transition:color 0.15s; font-family:'DM Sans',sans-serif;
  }
  .ad-tab:hover { color:#0F172A; }
  .ad-tab.active { font-weight:600; color:#0F172A; border-bottom:2px solid #6366F1; }

  /* Stat cards */
  .ad-stat {
    background:#fff; border:1px solid #E2E8F0; border-radius:14px;
    padding:18px 20px; transition:transform 0.15s,box-shadow 0.15s;
    position:relative; overflow:hidden;
  }
  .ad-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--ca); border-radius:14px 14px 0 0; }
  .ad-stat:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(0,0,0,0.07); }

  /* Cards */
  .ad-card { background:#fff; border:1px solid #E2E8F0; border-radius:14px; overflow:hidden; margin-bottom:12px; }
  .ad-card-head { padding:14px 18px; border-bottom:1px solid #F1F5F9; display:flex; align-items:center; justify-content:space-between; }

  /* Table */
  .ad-table { width:100%; border-collapse:collapse; font-size:13px; }
  .ad-th { padding:10px 16px; text-align:left; font-size:11px; font-weight:600; color:#64748B; text-transform:uppercase; letter-spacing:0.06em; background:#F8FAFC; }
  .ad-tr { border-top:1px solid #F1F5F9; transition:background 0.1s; }
  .ad-tr:hover { background:#FAFBFF; }
  .ad-td { padding:11px 16px; }

  /* Boutons */
  .ad-btn-validate { padding:6px 14px; background:#10B981; color:#fff; border:none; border-radius:7px; cursor:pointer; font-size:12.5px; font-weight:500; font-family:'DM Sans',sans-serif; transition:background 0.15s; white-space:nowrap; }
  .ad-btn-validate:hover { background:#059669; }
  .ad-btn-reject { padding:6px 14px; background:#fff; border:1px solid #FECACA; color:#EF4444; border-radius:7px; cursor:pointer; font-size:12.5px; font-weight:500; font-family:'DM Sans',sans-serif; transition:background 0.15s; white-space:nowrap; }
  .ad-btn-reject:hover { background:#FEF2F2; }
  .ad-btn-del { padding:4px 10px; background:#fff; border:1px solid #FECACA; color:#EF4444; border-radius:6px; cursor:pointer; font-size:12px; font-weight:500; font-family:'DM Sans',sans-serif; transition:background 0.15s; }
  .ad-btn-del:hover { background:#FEF2F2; }

  /* Search */
  .ad-search {
    width:100%; padding:9px 14px 9px 38px; border-radius:10px;
    border:1px solid #E2E8F0; font-size:13px; outline:none;
    background:#FAFAFA; color:#0F172A; font-family:'DM Sans',sans-serif;
    transition:border-color 0.15s,box-shadow 0.15s,background 0.15s;
  }
  .ad-search:focus { border-color:#6366F1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); background:#fff; }
  .ad-search::placeholder { color:#CBD5E1; }

  /* Filter chips */
  .ad-filter { padding:6px 12px; border-radius:8px; cursor:pointer; font-size:12.5px; font-weight:500; border:1px solid #E2E8F0; background:#fff; color:#64748B; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
  .ad-filter:hover { background:#F8FAFC; border-color:#CBD5E1; }

  /* Select inline */
  .ad-select { padding:4px 8px; border-radius:6px; font-size:12px; background:transparent; cursor:pointer; outline:none; transition:border-color 0.15s; font-family:'DM Sans',sans-serif; }

  /* Projet card */
  .ad-proj-card { background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:16px 20px; transition:box-shadow 0.15s,border-color 0.15s; position:relative; overflow:hidden; }
  .ad-proj-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.06); border-color:#CBD5E1; }
  .ad-proj-accent { position:absolute; left:0; top:0; bottom:0; width:3px; border-radius:0; }

  /* Flash */
  .ad-flash-ok { display:flex; align-items:center; gap:8px; background:#ECFDF5; border:1px solid #A7F3D0; border-radius:10px; padding:9px 14px; margin-bottom:14px; }
  .ad-flash-err { display:flex; align-items:center; gap:8px; background:#FEF2F2; border:1px solid #FECACA; border-radius:10px; padding:9px 14px; margin-bottom:14px; }

  /* Bar chart */
  .ad-bar-wrap { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .ad-bar-label { width:60px; font-size:12px; color:#64748B; font-weight:500; }
  .ad-bar-track { flex:1; height:6px; background:#F1F5F9; border-radius:10px; overflow:hidden; }
  .ad-bar-fill { height:100%; border-radius:10px; transition:width 0.5s ease; }
  .ad-bar-count { width:22px; font-size:12px; color:#94A3B8; text-align:right; }
`;

const Badge = ({ conf }) => conf ? (
  <span style={{ background:conf.bg, color:conf.color, border:`1px solid ${conf.border}`, padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600, flexShrink:0 }}>
    {conf.label}
  </span>
) : null;

const Avatar = ({ name, color="#E0E7FF", textColor="#3730A3", size=30 }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:color, color:textColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.4, fontWeight:600, flexShrink:0 }}>
    {name?.charAt(0).toUpperCase()}
  </div>
);

const SectionDivider = () => <div style={{ height:1, background:"#F1F5F9", margin:"4px 0 14px" }} />;

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "dashboard";
  const setActiveTab = (tab) => setSearchParams({ tab });

  const [users, setUsers]     = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  const [searchUser, setSearchUser]                 = useState("");
  const [filterRole, setFilterRole]                 = useState("tous");
  const [filterStatut, setFilterStatut]             = useState("tous");
  const [searchProjet, setSearchProjet]             = useState("");
  const [filterProjetStatut, setFilterProjetStatut] = useState("tous");

  useEffect(() => { if (user && user.role !== "admin") navigate("/dashboard"); }, [user]);
  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [usersRes, projetsRes] = await Promise.all([API.get("/users"), API.get("/projects")]);
      setUsers([...usersRes.data]); setProjets([...projetsRes.data]);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const flash = (msg, isError = false) => {
    isError ? setError(msg) : setSuccess(msg);
    setTimeout(() => isError ? setError("") : setSuccess(""), 3000);
  };

  const updateStatut = async (userId, statut) => {
    try { await API.patch(`/users/${userId}/validate`, { statut }); flash("Statut mis à jour !"); await fetchAll(); }
    catch { flash("Erreur lors de la mise à jour.", true); }
  };
  const updateRole = async (userId, role) => {
    try { await API.put(`/users/${userId}/role`, { role }); flash("Rôle mis à jour !"); await fetchAll(); }
    catch (err) { console.log(err); }
  };
  const deleteUser = async (userId) => {
    if (!window.confirm("Supprimer cet utilisateur définitivement ?")) return;
    try { await API.delete(`/users/${userId}`); flash("Utilisateur supprimé."); await fetchAll(); }
    catch (err) { console.log(err); }
  };

  const enAttente     = users.filter(u => u.statut === "en_attente");
  const actifs        = users.filter(u => u.statut === "actif");
  const projetsActifs = projets.filter(p => p.statut === "en_cours");

  const filteredUsers = users.filter(u => {
    const match = u.nom.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username.toLowerCase().includes(searchUser.toLowerCase());
    return match && (filterRole === "tous" || u.role === filterRole) && (filterStatut === "tous" || u.statut === filterStatut);
  });

  const filteredProjets = projets.filter(p => {
    const match = p.titre.toLowerCase().includes(searchProjet.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(searchProjet.toLowerCase());
    return match && (filterProjetStatut === "tous" || p.statut === filterProjetStatut);
  });

  if (loading) return (
    <Layout>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display:"flex", alignItems:"center", gap:10, color:"#94A3B8", fontSize:13.5, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ width:16, height:16, border:"2px solid #E2E8F0", borderTopColor:"#6366F1", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        Chargement...
      </div>
    </Layout>
  );

  const TABS = [
    { key:"dashboard", label:"Vue d'ensemble", icon:<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
    { key:"users",     label:"Utilisateurs",   badge:enAttente.length, icon:<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { key:"projets",   label:"Projets",         icon:<svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  ];

  const STAT_CARDS = [
    { label:"Utilisateurs",   value:users.length,         accent:"#6366F1", light:"#EEF2FF", text:"#4F46E5", icon:<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label:"En attente",     value:enAttente.length,     accent:"#F59E0B", light:"#FFFBEB", text:"#D97706", icon:<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label:"Actifs",         value:actifs.length,        accent:"#10B981", light:"#ECFDF5", text:"#059669", icon:<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    { label:"Projets actifs", value:projetsActifs.length, accent:"#6366F1", light:"#EEF2FF", text:"#4F46E5", icon:<svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  ];

  return (
    <Layout>
      <style>{css}</style>
      <div className="ad-root">

        {/* En-tête */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ margin:"0 0 4px", fontSize:20, fontWeight:700, color:"#0F172A", letterSpacing:"-0.4px" }}>Administration</h1>
          <p style={{ margin:"0 0 20px", color:"#94A3B8", fontSize:13 }}>Gérez les utilisateurs et les projets de la plateforme.</p>

          {/* Onglets */}
          <div style={{ display:"flex", gap:2, borderBottom:"1px solid #E2E8F0" }}>
            {TABS.map(tab => (
              <button key={tab.key} className={`ad-tab${activeTab === tab.key ? " active" : ""}`} onClick={() => setActiveTab(tab.key)}>
                <span style={{ opacity: activeTab === tab.key ? 1 : 0.6 }}>{tab.icon}</span>
                {tab.label}
                {tab.badge > 0 && (
                  <span style={{ background:"#EF4444", color:"#fff", borderRadius:20, fontSize:10.5, fontWeight:700, padding:"1px 6px" }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Flash */}
        {success && (
          <div className="ad-flash-ok">
            <svg width="14" height="14" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ color:"#065F46", fontSize:13, fontWeight:500 }}>{success}</span>
          </div>
        )}
        {error && (
          <div className="ad-flash-err">
            <svg width="14" height="14" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ color:"#B91C1C", fontSize:13, fontWeight:500 }}>{error}</span>
          </div>
        )}

        {/* ══ VUE D'ENSEMBLE ══ */}
        {activeTab === "dashboard" && (
          <div>
            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))", gap:12, marginBottom:20 }}>
              {STAT_CARDS.map(card => (
                <div key={card.label} className="ad-stat" style={{ "--ca":card.accent }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                    <p style={{ margin:0, color:"#64748B", fontSize:12, fontWeight:500 }}>{card.label}</p>
                    <div style={{ width:28, height:28, borderRadius:7, background:card.light, color:card.text, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {card.icon}
                    </div>
                  </div>
                  <p style={{ margin:0, fontSize:28, fontWeight:700, color:"#0F172A", lineHeight:1, letterSpacing:"-0.5px" }}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Comptes en attente */}
            <div className="ad-card">
              <div className="ad-card-head">
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{ width:26, height:26, borderRadius:6, background:"#FFFBEB", color:"#F59E0B", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <span style={{ fontSize:13.5, fontWeight:600, color:"#0F172A" }}>Comptes en attente de validation</span>
                </div>
                {enAttente.length > 0 && (
                  <span style={{ background:"#FFFBEB", color:"#D97706", border:"1px solid #FDE68A", padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600 }}>
                    {enAttente.length}
                  </span>
                )}
              </div>

              {enAttente.length === 0 ? (
                <div style={{ padding:28, textAlign:"center" }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:"#ECFDF5", border:"1px solid #A7F3D0", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>
                    <svg width="15" height="15" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p style={{ color:"#94A3B8", margin:0, fontSize:13.5 }}>Aucun compte en attente.</p>
                </div>
              ) : enAttente.map(u => (
                <div key={u.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 18px", borderBottom:"1px solid #F8FAFC" }}>
                  <Avatar name={u.nom} color="#FDE68A" textColor="#92400E" />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13.5, color:"#0F172A" }}>{u.nom}</div>
                    <div style={{ fontSize:12, color:"#94A3B8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email} · @{u.username}</div>
                  </div>
                  <button className="ad-btn-validate" onClick={() => updateStatut(u.id, "actif")}>Valider</button>
                  <button className="ad-btn-reject"   onClick={() => updateStatut(u.id, "suspendu")}>Rejeter</button>
                </div>
              ))}
            </div>

            {/* Répartition */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {/* Rôles */}
              <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:12, padding:"16px 18px" }}>
                <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:600, color:"#0F172A" }}>Répartition par rôle</p>
                <SectionDivider />
                {Object.entries(ROLE_CONFIG).map(([key, conf]) => {
                  const count = users.filter(u => u.role === key).length;
                  const pct   = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                  return (
                    <div key={key} className="ad-bar-wrap">
                      <span className="ad-bar-label">{conf.label}</span>
                      <div className="ad-bar-track"><div className="ad-bar-fill" style={{ width:`${pct}%`, background:conf.color }} /></div>
                      <span className="ad-bar-count">{count}</span>
                    </div>
                  );
                })}
              </div>
              {/* Projets */}
              <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:12, padding:"16px 18px" }}>
                <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:600, color:"#0F172A" }}>Projets par statut</p>
                <SectionDivider />
                {Object.entries(PROJET_STATUT_CONFIG).map(([key, conf]) => {
                  const count = projets.filter(p => p.statut === key).length;
                  const pct   = projets.length > 0 ? Math.round((count / projets.length) * 100) : 0;
                  return (
                    <div key={key} className="ad-bar-wrap">
                      <span style={{ width:68, fontSize:12, color:"#64748B", fontWeight:500 }}>{conf.label}</span>
                      <div className="ad-bar-track"><div className="ad-bar-fill" style={{ width:`${pct}%`, background:conf.color }} /></div>
                      <span className="ad-bar-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ UTILISATEURS ══ */}
        {activeTab === "users" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
              <div style={{ position:"relative", flex:1, minWidth:200 }}>
                <svg width="14" height="14" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                  style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input className="ad-search" type="text" placeholder="Rechercher un utilisateur..." value={searchUser} onChange={e => setSearchUser(e.target.value)} />
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {[{value:"tous",label:"Tous rôles"},{value:"admin",label:"Admin"},{value:"chef",label:"Chef"},{value:"membre",label:"Membre"}].map(r => {
                  const conf = ROLE_CONFIG[r.value];
                  const isActive = filterRole === r.value;
                  return (
                    <button key={r.value} className="ad-filter" onClick={() => setFilterRole(r.value)}
                      style={isActive ? { background:r.value==="tous"?"#0F172A":conf.bg, color:r.value==="tous"?"#fff":conf.color, border:`1px solid ${r.value==="tous"?"#0F172A":conf.border}`, fontWeight:600 } : {}}>
                      {r.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {[{value:"tous",label:"Tous statuts"},{value:"actif",label:"Actifs"},{value:"en_attente",label:"En attente"},{value:"suspendu",label:"Suspendus"}].map(s => {
                  const conf = USER_STATUT_CONFIG[s.value];
                  const isActive = filterStatut === s.value;
                  return (
                    <button key={s.value} className="ad-filter" onClick={() => setFilterStatut(s.value)}
                      style={isActive ? { background:s.value==="tous"?"#0F172A":conf.bg, color:s.value==="tous"?"#fff":conf.color, border:`1px solid ${s.value==="tous"?"#0F172A":conf.border}`, fontWeight:600 } : {}}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p style={{ fontSize:12.5, color:"#94A3B8", marginBottom:10 }}>
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? "s" : ""}
            </p>

            <div className="ad-card">
              <table className="ad-table">
                <thead>
                  <tr>
                    {["Utilisateur","Email","Rôle","Statut","Actions"].map(h => (
                      <th key={h} className="ad-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="ad-tr">
                      <td className="ad-td">
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <Avatar name={u.nom} color={ROLE_CONFIG[u.role]?.bg ?? "#F1F5F9"} textColor={ROLE_CONFIG[u.role]?.color ?? "#64748B"} />
                          <div>
                            <div style={{ fontWeight:600, color:"#0F172A", fontSize:13 }}>{u.nom}</div>
                            <div style={{ fontSize:11, color:"#94A3B8" }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="ad-td" style={{ color:"#64748B", fontSize:12.5 }}>{u.email}</td>
                      <td className="ad-td">
                        <select className="ad-select" value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                          disabled={u.id === user?.id}
                          style={{ border:`1px solid ${ROLE_CONFIG[u.role]?.border ?? "#E2E8F0"}`, color:ROLE_CONFIG[u.role]?.color ?? "#64748B", background:ROLE_CONFIG[u.role]?.bg ?? "#fff", cursor:u.id === user?.id ? "not-allowed" : "pointer" }}>
                          <option value="admin">Admin</option>
                          <option value="chef">Chef</option>
                          <option value="membre">Membre</option>
                        </select>
                      </td>
                      <td className="ad-td">
                        <select className="ad-select" value={u.statut} onChange={e => updateStatut(u.id, e.target.value)}
                          disabled={u.id === user?.id}
                          style={{ border:`1px solid ${USER_STATUT_CONFIG[u.statut]?.border ?? "#E2E8F0"}`, color:USER_STATUT_CONFIG[u.statut]?.color ?? "#64748B", background:USER_STATUT_CONFIG[u.statut]?.bg ?? "#fff", cursor:u.id === user?.id ? "not-allowed" : "pointer" }}>
                          <option value="actif">Actif</option>
                          <option value="en_attente">En attente</option>
                          <option value="suspendu">Suspendu</option>
                        </select>
                      </td>
                      <td className="ad-td">
                        {u.id !== user?.id && <button className="ad-btn-del" onClick={() => deleteUser(u.id)}>Supprimer</button>}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding:32, textAlign:"center", color:"#94A3B8", fontSize:13 }}>
                        Aucun utilisateur ne correspond aux filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ PROJETS ══ */}
        {activeTab === "projets" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
              <div style={{ position:"relative", flex:1, minWidth:200 }}>
                <svg width="14" height="14" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
                  style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input className="ad-search" type="text" placeholder="Rechercher un projet..." value={searchProjet} onChange={e => setSearchProjet(e.target.value)} />
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {[{value:"tous",label:"Tous"},{value:"en_attente",label:"En attente"},{value:"en_cours",label:"En cours"},{value:"termine",label:"Terminé"},{value:"suspendu",label:"Suspendu"}].map(s => {
                  const conf = PROJET_STATUT_CONFIG[s.value];
                  const isActive = filterProjetStatut === s.value;
                  return (
                    <button key={s.value} className="ad-filter" onClick={() => setFilterProjetStatut(s.value)}
                      style={isActive ? { background:s.value==="tous"?"#0F172A":conf.bg, color:s.value==="tous"?"#fff":conf.color, border:`1px solid ${s.value==="tous"?"#0F172A":conf.border}`, fontWeight:600 } : {}}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <p style={{ fontSize:12.5, color:"#94A3B8", marginBottom:10 }}>
              {filteredProjets.length} projet{filteredProjets.length !== 1 ? "s" : ""}
            </p>

            {filteredProjets.length === 0 ? (
              <div style={{ background:"#fff", border:"1.5px dashed #E2E8F0", borderRadius:14, padding:48, textAlign:"center" }}>
                <p style={{ color:"#94A3B8", margin:0, fontSize:13.5 }}>Aucun projet ne correspond.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {filteredProjets.map(projet => {
                  const conf = PROJET_STATUT_CONFIG[projet.statut];
                  return (
                    <div key={projet.id} className="ad-proj-card">
                      <div className="ad-proj-accent" style={{ background:conf?.dot ?? "#E2E8F0" }} />
                      <div style={{ paddingLeft:12 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <h3 style={{ margin:"0 0 3px", fontSize:14, fontWeight:600, color:"#0F172A", letterSpacing:"-0.1px" }}>{projet.titre}</h3>
                            {projet.description && <p style={{ color:"#64748B", fontSize:13, margin:"0 0 4px", lineHeight:1.5 }}>{projet.description}</p>}
                            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                              <svg width="11" height="11" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                              <span style={{ fontSize:12, color:"#94A3B8" }}>{projet.date_debut} — {projet.date_fin}</span>
                            </div>
                          </div>
                          <Badge conf={conf} />
                        </div>
                        {projet.members?.length > 0 && (
                          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:8 }}>
                            {projet.members.map(m => {
                              const rc = ROLE_CONFIG[m.role];
                              return (
                                <span key={m.id} style={{ display:"flex", alignItems:"center", gap:4, background:"#F8FAFC", border:"1px solid #F1F5F9", padding:"2px 8px", borderRadius:5, fontSize:11.5, color:"#475569" }}>
                                  {m.nom}
                                  <span style={{ color:rc?.color ?? "#64748B", background:rc?.bg ?? "#F1F5F9", padding:"0 5px", borderRadius:3, fontSize:10.5, fontWeight:600 }}>{rc?.label ?? m.role}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}