import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import Navbar from "../components/Navbar";

export default function EditProject() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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
                titre: p.titre ?? "",
                description: p.description ?? "",
                technologies: Array.isArray(p.technologies) ? p.technologies.join(", ") : "",
                date_debut: p.date_debut ?? "",
                date_fin: p.date_fin ?? "",
                budget: p.budget ?? "",
                statut: p.statut ?? "en_cours"
            });
        }).finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await API.put(`/projects/${id}`, {
                ...form,
                technologies: form.technologies
                    .split(",")
                    .map(t => t.trim())
                    .filter(t => t !== "")
            });
            navigate("/projects");
        } catch (err) {
            setError("Erreur lors de la modification.");
            console.log(err.response?.data);
        }
    };

    if (loading) return <div><Navbar /><p style={{ padding: "24px" }}>Chargement...</p></div>;

    return (
        <div>
            <Navbar />
            <div style={{ maxWidth: "600px", margin: "40px auto", padding: "24px" }}>
                <button
                    onClick={() => navigate("/projects")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", marginBottom: "16px" }}
                >
                    ← Retour aux projets
                </button>

                <h1>Modifier le projet</h1>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Titre *</label>
                        <input
                            name="titre"
                            value={form.titre}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Technologies</label>
                        <input
                            name="technologies"
                            value={form.technologies}
                            onChange={handleChange}
                            placeholder="Laravel, React JS, MySQL"
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Date début *</label>
                            <input
                                type="date"
                                name="date_debut"
                                value={form.date_debut}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Date fin *</label>
                            <input
                                type="date"
                                name="date_fin"
                                value={form.date_fin}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Statut</label>
                        <select
                            name="statut"
                            value={form.statut}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        >
                            <option value="en_attente">En attente</option>
                            <option value="en_cours">En cours</option>
                            <option value="termine">Terminé</option>
                            <option value="suspendu">Suspendu</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Budget (€)</label>
                        <input
                            type="number"
                            name="budget"
                            value={form.budget}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", boxSizing: "border-box" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            type="submit"
                            style={{ flex: 1, padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}
                        >
                            Enregistrer
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/projects")}
                            style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}
                        >
                            Annuler
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}