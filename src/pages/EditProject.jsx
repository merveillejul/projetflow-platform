import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import Layout from "../components/Layout";

const formStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .pf-input {
        width: 100%; padding: 9px 13px; border-radius: 8px;
        border: 1px solid #e2e8f0; box-sizing: border-box;
        font-size: 13.5px; color: #1e293b; background: white; outline: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .pf-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .pf-input::placeholder { color: #cbd5e1; }
    .pf-btn-primary {
        flex: 1; padding: 11px 16px; background: #1d4ed8; color: white;
        border: none; border-radius: 8px; cursor: pointer;
        font-size: 13.5px; font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: background 0.15s, transform 0.1s;
        display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .pf-btn-primary:hover:not(:disabled) { background: #1e40af; }
    .pf-btn-primary:active:not(:disabled) { transform: scale(0.99); }
    .pf-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
    .pf-btn-secondary {
        padding: 11px 22px; background: white;
        border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;
        font-size: 13.5px; color: #64748b;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: background 0.15s, border-color 0.15s;
    }
    .pf-btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
    .pf-back-btn {
        background: none; border: none; cursor: pointer; padding: 0;
        display: flex; align-items: center; gap: 6px;
        font-size: 13px; color: #94a3b8;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        margin-bottom: 14px; transition: color 0.15s;
    }
    .pf-back-btn:hover { color: #475569; }
    .pf-section { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px 24px; margin-bottom: 12px; }
    .pf-section-title {
        display: flex; align-items: center; gap: 9px;
        margin: 0 0 18px; font-size: 13px; font-weight: 600; color: #0f172a;
    }
    .pf-section-icon {
        width: 26px; height: 26px; border-radius: 6px;
        background: #eff6ff; color: #3b82f6;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .pf-statut-btn {
        padding: 9px 8px; border-radius: 8px; cursor: pointer;
        font-size: 12.5px; font-weight: 500; text-align: center;
        border: 1.5px solid #e2e8f0; background: white; color: #64748b;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: all 0.15s ease;
        display: flex; align-items: center; justify-content: center; gap: 5px;
    }
    .pf-statut-btn:hover { border-color: #cbd5e1; background: #f8fafc; }
`;

const SectionDivider = () => (
    <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0 16px" }} />
);

const STATUTS = [
    { value: "en_attente", label: "En attente", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
    { value: "en_cours",   label: "En cours",   color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
    { value: "termine",    label: "Terminé",     color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
    { value: "suspendu",   label: "Suspendu",    color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
];

export default function EditProject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        titre: "", description: "", technologies: "",
        date_debut: "", date_fin: "", budget: "", statut: "en_cours"
    });

    useEffect(() => {
        API.get(`/projects/${id}`).then(res => {
            const p = res.data;
            setForm({
                titre:        p.titre ?? "",
                description:  p.description ?? "",
                technologies: Array.isArray(p.technologies) ? p.technologies.join(", ") : "",
                date_debut:   p.date_debut ?? "",
                date_fin:     p.date_fin ?? "",
                budget:       p.budget ?? "",
                statut:       p.statut ?? "en_cours"
            });
        }).finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setSaving(true);
        try {
            await API.put(`/projects/${id}`, {
                ...form,
                technologies: form.technologies.split(",").map(t => t.trim()).filter(t => t !== "")
            });
            setSuccess("Projet modifié avec succès !");
            setTimeout(() => navigate("/projects"), 1000);
        } catch (err) {
            setError(err.response?.data?.message ?? "Erreur lors de la modification.");
        } finally {
            setSaving(false);
        }
    };

    const techTags = form.technologies.split(",").map(t => t.trim()).filter(t => t !== "");
    const currentStatut = STATUTS.find(s => s.value === form.statut);

    const labelStyle = {
        display: "block", marginBottom: "6px",
        fontWeight: "500", fontSize: "12.5px", color: "#475569"
    };

    if (loading) return (
        <Layout>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "14px" }}>
                <div style={{ width: "14px", height: "14px", border: "2px solid #e5e7eb", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Chargement...
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <style>{formStyles}</style>

            {/* EN-TÊTE */}
            <div style={{ marginBottom: "26px" }}>
                <button className="pf-back-btn" onClick={() => navigate("/projects")}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Retour aux projets
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h1 style={{ margin: 0, fontSize: "19px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                        Modifier le projet
                    </h1>
                    {currentStatut && (
                        <span style={{
                            background: currentStatut.bg, color: currentStatut.color,
                            border: `1px solid ${currentStatut.border}`,
                            padding: "2px 10px", borderRadius: "20px",
                            fontSize: "11.5px", fontWeight: "600",
                        }}>
                            {currentStatut.label}
                        </span>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: "620px" }}>

                {error && (
                    <div style={{
                        display: "flex", alignItems: "flex-start", gap: "8px",
                        background: "#fef2f2", border: "1px solid #fecaca",
                        borderRadius: "8px", padding: "10px 12px", marginBottom: "14px",
                    }}>
                        <svg width="15" height="15" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: "1px" }}>
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span style={{ color: "#b91c1c", fontSize: "13px" }}>{error}</span>
                    </div>
                )}
                {success && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                        borderRadius: "8px", padding: "10px 12px", marginBottom: "14px",
                    }}>
                        <svg width="15" height="15" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span style={{ color: "#065f46", fontSize: "13px", fontWeight: "500" }}>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* INFORMATIONS GÉNÉRALES */}
                    <div className="pf-section">
                        <h3 className="pf-section-title">
                            <span className="pf-section-icon">
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </span>
                            Informations générales
                        </h3>
                        <SectionDivider />
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={labelStyle}>Titre <span style={{ color: "#ef4444" }}>*</span></label>
                                <input className="pf-input" name="titre" value={form.titre} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea className="pf-input" name="description" value={form.description}
                                    onChange={handleChange} rows={3}
                                    style={{ resize: "vertical", fontFamily: "inherit" }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Technologies</label>
                                <input className="pf-input" name="technologies" value={form.technologies}
                                    onChange={handleChange} placeholder="Laravel, React, MySQL..." />
                                {techTags.length > 0 ? (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "8px" }}>
                                        {techTags.map((t, i) => (
                                            <span key={i} style={{
                                                background: "#eff6ff", color: "#1d4ed8",
                                                border: "1px solid #bfdbfe",
                                                borderRadius: "5px", padding: "2px 8px",
                                                fontSize: "11.5px", fontWeight: "500",
                                            }}>{t}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ margin: "5px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                                        Séparez chaque technologie par une virgule
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PLANNING & BUDGET */}
                    <div className="pf-section">
                        <h3 className="pf-section-title">
                            <span className="pf-section-icon">
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                            </span>
                            Planning & Budget
                        </h3>
                        <SectionDivider />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                            <div>
                                <label style={labelStyle}>Date de début <span style={{ color: "#ef4444" }}>*</span></label>
                                <input className="pf-input" type="date" name="date_debut" value={form.date_debut} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Date de fin <span style={{ color: "#ef4444" }}>*</span></label>
                                <input className="pf-input" type="date" name="date_fin" value={form.date_fin} onChange={handleChange} required />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Budget (€)</label>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#94a3b8", pointerEvents: "none" }}>€</span>
                                <input className="pf-input" type="number" name="budget" value={form.budget}
                                    onChange={handleChange} placeholder="0" style={{ paddingLeft: "26px" }} />
                            </div>
                        </div>
                    </div>

                    {/* STATUT */}
                    <div className="pf-section">
                        <h3 className="pf-section-title">
                            <span className="pf-section-icon">
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                            </span>
                            Statut du projet
                        </h3>
                        <SectionDivider />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                            {STATUTS.map(s => {
                                const isActive = form.statut === s.value;
                                return (
                                    <button
                                        key={s.value} type="button"
                                        className="pf-statut-btn"
                                        onClick={() => setForm({ ...form, statut: s.value })}
                                        style={isActive ? {
                                            border: `1.5px solid ${s.color}`,
                                            background: s.bg, color: s.color,
                                        } : {}}
                                    >
                                        {isActive && (
                                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        )}
                                        {s.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* BOUTONS */}
                    <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                        <button type="submit" disabled={saving} className="pf-btn-primary">
                            {saving ? (
                                <>
                                    <div style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                        <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                                    </svg>
                                    Enregistrer les modifications
                                </>
                            )}
                        </button>
                        <button type="button" onClick={() => navigate("/projects")} className="pf-btn-secondary">
                            Annuler
                        </button>
                    </div>

                </form>
            </div>
        </Layout>
    );
}