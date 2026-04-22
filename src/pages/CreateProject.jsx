import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const formStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .pf-input {
        width: 100%; padding: 9px 13px; border-radius: 8px;
        border: 1px solid #e2e8f0; box-sizing: border-box;
        font-size: 13.5px; color: #1e293b; background: white; outline: none;
        font-family: 'Inter', sans-serif;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .pf-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }
    .pf-input::placeholder { color: #cbd5e1; }
    .pf-btn-primary {
        flex: 1; padding: 11px 16px;
        background: #1d4ed8; color: white;
        border: none; border-radius: 8px; cursor: pointer;
        font-size: 13.5px; font-weight: 500;
        font-family: 'Inter', sans-serif;
        transition: background 0.15s ease, transform 0.1s ease;
        display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .pf-btn-primary:hover:not(:disabled) { background: #1e40af; }
    .pf-btn-primary:active:not(:disabled) { transform: scale(0.99); }
    .pf-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
    .pf-btn-secondary {
        padding: 11px 22px; background: white;
        border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;
        font-size: 13.5px; color: #64748b;
        font-family: 'Inter', sans-serif;
        transition: background 0.15s ease, border-color 0.15s ease;
    }
    .pf-btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
    .pf-back-btn {
        background: none; border: none; cursor: pointer; padding: 0;
        display: flex; align-items: center; gap: 6px;
        font-size: 13px; color: #94a3b8;
        font-family: 'Inter', sans-serif;
        margin-bottom: 14px; transition: color 0.15s;
    }
    .pf-back-btn:hover { color: #475569; }
    .pf-section { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px 24px; margin-bottom: 12px; }
    .pf-section-title {
        display: flex; align-items: center; gap: 9px;
        margin: 0 0 18px; font-size: 13px; font-weight: 600;
        color: #0f172a; letter-spacing: -0.1px;
    }
    .pf-section-icon {
        width: 26px; height: 26px; border-radius: 6px;
        background: #eff6ff; color: #3b82f6;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
`;

const SectionDivider = () => (
    <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0 16px" }} />
);

export default function CreateProject() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        titre: "", description: "", technologies: "",
        date_debut: "", date_fin: "", budget: ""
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const payload = {
                ...form,
                technologies: form.technologies.split(",").map(t => t.trim()).filter(t => t !== "")
            };
            await API.post("/projects", payload);
            navigate("/projects");
        } catch (err) {
            setError("Erreur lors de la création du projet.");
        } finally {
            setLoading(false);
        }
    };

    const techTags = form.technologies
        .split(",").map(t => t.trim()).filter(t => t !== "");

    const labelStyle = {
        display: "block", marginBottom: "6px",
        fontWeight: "500", fontSize: "12.5px", color: "#475569"
    };

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
                <h1 style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                    Créer un projet
                </h1>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#94a3b8" }}>
                    Remplissez les informations pour initialiser un nouveau projet.
                </p>
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
                                <label style={labelStyle}>
                                    Titre <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input className="pf-input" name="titre" placeholder="Nom du projet" onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    className="pf-input" name="description"
                                    placeholder="Décrivez les objectifs et le périmètre du projet..."
                                    onChange={handleChange} rows={3}
                                    style={{ resize: "vertical", fontFamily: "inherit" }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Technologies</label>
                                <input
                                    className="pf-input" name="technologies"
                                    placeholder="Laravel, React, MySQL..."
                                    onChange={handleChange}
                                />
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
                                <input className="pf-input" type="date" name="date_debut" onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Date de fin <span style={{ color: "#ef4444" }}>*</span></label>
                                <input className="pf-input" type="date" name="date_fin" onChange={handleChange} required />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Budget (€)</label>
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                                    fontSize: "13px", color: "#94a3b8", pointerEvents: "none",
                                }}>€</span>
                                <input className="pf-input" type="number" name="budget" placeholder="0"
                                    onChange={handleChange} style={{ paddingLeft: "26px" }} />
                            </div>
                        </div>
                    </div>

                    {/* BOUTONS */}
                    <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                        <button type="submit" disabled={loading} className="pf-btn-primary">
                            {loading ? (
                                <>
                                    <div style={{
                                        width: "13px", height: "13px",
                                        border: "2px solid rgba(255,255,255,0.35)",
                                        borderTopColor: "white", borderRadius: "50%",
                                        animation: "spin 0.7s linear infinite",
                                    }} />
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    Créer le projet
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