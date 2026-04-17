import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

export default function EditProject() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        titre: "",
        description: "",
        technologies: "",
        date_debut: "",
        date_fin: "",
        budget: "",
        statut: "en_cours"
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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            await API.put(`/projects/${id}`, {
                ...form,
                technologies: form.technologies
                    .split(",")
                    .map(t => t.trim())
                    .filter(t => t !== "")
            });
            setSuccess("Projet modifié avec succès !");
            setTimeout(() => navigate("/projects"), 1000);
        } catch (err) {
            // Affiche le message d'erreur de l'API
            setError(err.response?.data?.message ?? "Erreur lors de la modification.");
        } finally {
            setSaving(false);
        }
    };

    const getStatutColor = (statut) => ({
        en_attente: "#f59e0b",
        en_cours:   "#3b82f6",
        termine:    "#10b981",
        suspendu:   "#ef4444",
    }[statut] ?? "#6b7280");

    const inputStyle = {
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        boxSizing: "border-box",
        fontSize: "14px",
        color: "#1e293b",
        background: "white",
        outline: "none"
    };

    const labelStyle = {
        display: "block",
        marginBottom: "6px",
        fontWeight: "500",
        fontSize: "14px",
        color: "#374151"
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />
            <p style={{ padding: "24px", color: "#64748b" }}>Chargement...</p>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />

            <div style={{ maxWidth: "680px", margin: "40px auto", padding: "0 24px" }}>

                {/* EN-TÊTE */}
                <button
                    onClick={() => navigate("/projects")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", marginBottom: "16px", fontSize: "14px", padding: 0 }}
                >
                    ← Retour aux projets
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h1 style={{ margin: 0, fontSize: "24px", color: "#1e293b" }}>Modifier le projet</h1>
                    <span style={{
                        background: getStatutColor(form.statut),
                        color: "white", padding: "4px 14px",
                        borderRadius: "20px", fontSize: "13px"
                    }}>
                        {form.statut?.replace("_", " ")}
                    </span>
                </div>

                {error && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#ef4444" }}>
                        ❌ {error}
                    </div>
                )}
                {success && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#10b981" }}>
                        ✅ {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* INFORMATIONS GÉNÉRALES */}
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
                        <h3 style={{ margin: "0 0 16px", color: "#1e293b", fontSize: "16px" }}>Informations générales</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={labelStyle}>Titre *</label>
                                <input name="titre" value={form.titre} onChange={handleChange} required style={inputStyle} placeholder="Nom du projet" />
                            </div>

                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={3}
                                    style={{ ...inputStyle, resize: "vertical" }}
                                    placeholder="Description du projet"
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>Technologies</label>
                                <input
                                    name="technologies"
                                    value={form.technologies}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    placeholder="Laravel, React JS, MySQL (séparées par des virgules)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* PLANNING */}
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
                        <h3 style={{ margin: "0 0 16px", color: "#1e293b", fontSize: "16px" }}>Planning & Budget</h3>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            <div>
                                <label style={labelStyle}>Date de début *</label>
                                <input type="date" name="date_debut" value={form.date_debut} onChange={handleChange} required style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Date de fin *</label>
                                <input type="date" name="date_fin" value={form.date_fin} onChange={handleChange} required style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Budget (€)</label>
                            <input type="number" name="budget" value={form.budget} onChange={handleChange} style={inputStyle} placeholder="0" />
                        </div>
                    </div>

                    {/* STATUT */}
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
                        <h3 style={{ margin: "0 0 16px", color: "#1e293b", fontSize: "16px" }}>Statut du projet</h3>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                            {[
                                { value: "en_attente", label: "En attente", color: "#f59e0b" },
                                { value: "en_cours",   label: "En cours",   color: "#3b82f6" },
                                { value: "termine",    label: "Terminé",    color: "#10b981" },
                                { value: "suspendu",   label: "Suspendu",   color: "#ef4444" },
                            ].map(s => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setForm({ ...form, statut: s.value })}
                                    style={{
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: `2px solid ${form.statut === s.value ? s.color : "#e2e8f0"}`,
                                        background: form.statut === s.value ? s.color : "white",
                                        color: form.statut === s.value ? "white" : "#64748b",
                                        cursor: "pointer",
                                        fontSize: "13px",
                                        fontWeight: form.statut === s.value ? "600" : "400",
                                        transition: "all 0.15s"
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* BOUTONS */}
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{ flex: 1, padding: "14px", background: "#1e293b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "500" }}
                        >
                            {saving ? "Enregistrement..." : "💾 Enregistrer les modifications"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/projects")}
                            style={{ padding: "14px 24px", background: "transparent", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontSize: "15px", color: "#64748b" }}
                        >
                            Annuler
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}