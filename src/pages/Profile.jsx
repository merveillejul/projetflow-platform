import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const profileStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    .pf-input {
        width: 100%; padding: 9px 13px; border-radius: 8px;
        border: 1px solid #e2e8f0; box-sizing: border-box;
        font-size: 13.5px; color: #0f172a; background: white; outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    .pf-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .pf-input::placeholder { color: #cbd5e1; }
    .pf-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
    .pf-btn-save {
        width: 100%; padding: 10px; background: #1d4ed8; color: white;
        border: none; border-radius: 8px; cursor: pointer;
        font-size: 13.5px; font-weight: 500;
        display: flex; align-items: center; justify-content: center; gap: 7px;
        transition: background 0.15s, transform 0.1s;
    }
    .pf-btn-save:hover:not(:disabled) { background: #1e40af; }
    .pf-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }
    .pf-btn-logout {
        width: 100%; padding: 10px; background: transparent;
        border: 1px solid #fecaca; color: #ef4444;
        border-radius: 8px; cursor: pointer; font-size: 13.5px; font-weight: 500;
        display: flex; align-items: center; justify-content: center; gap: 7px;
        transition: background 0.15s;
    }
    .pf-btn-logout:hover { background: #fef2f2; }
    .pf-section { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px 24px; }
    .pf-section-title {
        display: flex; align-items: center; gap: 9px;
        margin: 0 0 18px; font-size: 13px; font-weight: 600; color: #0f172a;
    }
    .pf-section-icon {
        width: 26px; height: 26px; border-radius: 6px;
        background: #eff6ff; color: #3b82f6;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
`;

const ROLE_CONFIG = {
    admin:  { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", label: "Administrateur" },
    chef:   { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", label: "Chef de projet" },
    membre: { color: "#059669", bg: "#f0fdf4", border: "#bbf7d0", label: "Membre" },
};
const getRoleConfig = (r) => ROLE_CONFIG[r] ?? { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", label: r };

const SectionDivider = () => <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0 16px" }} />;

function Alert({ type, message }) {
    const isSuccess = type === "success";
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: isSuccess ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
            borderRadius: "8px", padding: "9px 12px", marginBottom: "14px",
        }}>
            {isSuccess
                ? <svg width="14" height="14" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="14" height="14" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            }
            <span style={{ fontSize: "13px", color: isSuccess ? "#065f46" : "#b91c1c", fontWeight: "500" }}>{message}</span>
        </div>
    );
}

function ChangePasswordForm() {
    const [form, setForm] = useState({ current_password: "", password: "", password_confirmation: "" });
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setSuccess(""); setError("");
        if (form.password !== form.password_confirmation) { setError("Les mots de passe ne correspondent pas."); return; }
        if (form.password.length < 12) { setError("Le mot de passe doit contenir au moins 12 caractères."); return; }
        setLoading(true);
        try {
            await API.post("/auth/change-password", form);
            setSuccess("Mot de passe mis à jour avec succès.");
            setForm({ current_password: "", password: "", password_confirmation: "" });
        } catch (err) {
            setError(err.response?.data?.message ?? "Erreur lors du changement.");
        } finally { setLoading(false); }
    };

    const fields = [
        { label: "Mot de passe actuel",               key: "current_password" },
        { label: "Nouveau mot de passe",              key: "password" },
        { label: "Confirmer le nouveau mot de passe", key: "password_confirmation" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
            {success && <Alert type="success" message={success} />}
            {error   && <Alert type="error"   message={error} />}
            {fields.map(f => (
                <div key={f.key}>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "12.5px", color: "#475569" }}>
                        {f.label}
                    </label>
                    <input className="pf-input" type="password"
                        value={form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    />
                </div>
            ))}
            <button className="pf-btn-save" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                    <>
                        <div style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Mise à jour...
                    </>
                ) : "Changer le mot de passe"}
            </button>
        </div>
    );
}

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({ nom: "", email: "" });
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);

    const roleConf = getRoleConfig(user?.role);

    useEffect(() => {
        API.get("/user").then(res => {
            setForm({ nom: res.data.nom || "", email: res.data.email || "" });
            if (res.data.photo) {
                setPhotoUrl(res.data.photo.startsWith("http") ? res.data.photo : `https://projetflow-platform-production.up.railway.app/storage/${res.data.photo}`);
            }
        });
    }, []);

    const updateProfile = async () => {
        setSuccess(""); setError(""); setLoading(true);
        try {
            await API.put("/user", form);
            setSuccess("Profil mis à jour avec succès.");
        } catch (err) {
            setError("Erreur lors de la mise à jour.");
        } finally { setLoading(false); }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoLoading(true);
        try {
            const formData = new FormData();
            formData.append("photo", file);
            const res = await API.post("/user/photo", formData, { headers: { "Content-Type": "multipart/form-data" } });
            setPhotoUrl(res.data.photo);
            setSuccess("Photo mise à jour !");
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError("Erreur lors de l'upload.");
        } finally { setPhotoLoading(false); }
    };

    const handleLogout = async () => {
        try { await API.post("/logout"); } catch (err) {}
        finally { logout(); navigate("/"); }
    };

    return (
        <Layout>
            <style>{profileStyles}</style>

            {/* EN-TÊTE */}
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: "600", color: "#0f172a", letterSpacing: "-0.3px" }}>
                    Mon profil
                </h1>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                    Gérez vos informations personnelles et votre sécurité.
                </p>
            </div>

            <div style={{ maxWidth: "520px", display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* CARTE IDENTITÉ */}
                <div className="pf-section" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        {photoUrl ? (
                            <img src={photoUrl} alt="Photo"
                                style={{ width: "68px", height: "68px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${roleConf.color}` }} />
                        ) : (
                            <div style={{
                                width: "68px", height: "68px", borderRadius: "50%",
                                background: roleConf.color, color: "white",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "26px", fontWeight: "600",
                            }}>
                                {user?.nom?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={photoLoading}
                            style={{
                                position: "absolute", bottom: "-2px", right: "-2px",
                                width: "24px", height: "24px", borderRadius: "50%",
                                background: "#0f172a", border: "2px solid white",
                                cursor: "pointer", display: "flex", alignItems: "center",
                                justifyContent: "center", padding: 0,
                            }}
                        >
                            {photoLoading
                                ? <div style={{ width: "10px", height: "10px", border: "1.5px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                : <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            }
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                    </div>
                    <div>
                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", marginBottom: "2px", letterSpacing: "-0.2px" }}>
                            {user?.nom}
                        </div>
                        <div style={{ fontSize: "12.5px", color: "#94a3b8", marginBottom: "8px" }}>
                            @{user?.username}
                        </div>
                        <span style={{
                            background: roleConf.bg, color: roleConf.color,
                            border: `1px solid ${roleConf.border}`,
                            padding: "2px 10px", borderRadius: "20px",
                            fontSize: "11.5px", fontWeight: "600",
                        }}>
                            {roleConf.label}
                        </span>
                    </div>
                </div>

                {/* INFORMATIONS PERSONNELLES */}
                <div className="pf-section">
                    <h3 className="pf-section-title">
                        <span className="pf-section-icon">
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </span>
                        Informations personnelles
                    </h3>
                    <SectionDivider />
                    {success && <Alert type="success" message={success} />}
                    {error   && <Alert type="error"   message={error} />}
                    <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "12.5px", color: "#475569" }}>Nom complet</label>
                            <input className="pf-input" name="nom" value={form.nom}
                                onChange={e => setForm({ ...form, nom: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "12.5px", color: "#475569" }}>Email</label>
                            <input className="pf-input" name="email" type="email" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "12.5px", color: "#475569" }}>Username</label>
                            <input className="pf-input" value={user?.username} disabled />
                            <p style={{ fontSize: "11.5px", color: "#94a3b8", margin: "4px 0 0" }}>Non modifiable.</p>
                        </div>
                        <button className="pf-btn-save" onClick={updateProfile} disabled={loading}>
                            {loading ? (
                                <>
                                    <div style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                    Enregistrement...
                                </>
                            ) : "Enregistrer les modifications"}
                        </button>
                    </div>
                </div>

                {/* SÉCURITÉ */}
                <div className="pf-section">
                    <h3 className="pf-section-title">
                        <span className="pf-section-icon">
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </span>
                        Sécurité
                    </h3>
                    <SectionDivider />
                    <ChangePasswordForm />
                </div>

                {/* DÉCONNEXION */}
                <button className="pf-btn-logout" onClick={handleLogout}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Se déconnecter
                </button>
            </div>
        </Layout>
    );
}