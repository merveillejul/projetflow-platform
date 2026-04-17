import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function CreateProject() {

    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        titre: "",
        description: "",
        technologies: "",
        date_debut: "",
        date_fin: "",
        budget: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // On convertit technologies en tableau (séparé par virgules)
            const payload = {
                ...form,
                technologies: form.technologies
                    .split(",")
                    .map(t => t.trim())
                    .filter(t => t !== "")
            };

            await API.post("/projects", payload);
            navigate("/projects");

        } catch (err) {
            setError("Erreur lors de la création du projet.");
            console.log(err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />

            <div style={{ maxWidth: "600px", margin: "40px auto", padding: "24px" }}>
                <h1>Créer un projet</h1>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Titre *</label>
                        <input
                            name="titre"
                            placeholder="Nom du projet"
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Description</label>
                        <textarea
                            name="description"
                            placeholder="Description du projet"
                            onChange={handleChange}
                            rows={3}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Technologies</label>
                        <input
                            name="technologies"
                            placeholder="Laravel, React JS, MySQL (séparées par des virgules)"
                            onChange={handleChange}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Date début *</label>
                            <input
                                type="date"
                                name="date_debut"
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Date fin *</label>
                            <input
                                type="date"
                                name="date_fin"
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Budget (€)</label>
                        <input
                            type="number"
                            name="budget"
                            placeholder="0"
                            onChange={handleChange}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ flex: 1, padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px" }}
                        >
                            {loading ? "Création..." : "Créer le projet"}
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