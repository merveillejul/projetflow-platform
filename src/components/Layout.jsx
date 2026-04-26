import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <style>{`
                /* ✅ On cible l'ID — spécificité suffisante pour battre l'inline style */
                @media (max-width: 768px) {
                    #pf-burger-btn  { display: flex !important; }
                    #pf-main-content {
                        margin-left: 0 !important;
                        padding: 16px !important;
                        padding-top: 68px !important; /* Espace pour le burger */
                    }
                }
                #pf-burger-btn {
                    display: none;
                    position: fixed;
                    top: 14px; left: 14px;
                    z-index: 98;
                    background: #1e3a5f;      /* ✅ Même couleur que la sidebar */
                    border: none;
                    border-radius: 8px;
                    padding: 9px;
                    cursor: pointer;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    transition: background 0.15s;
                }
                #pf-burger-btn:hover { background: #162d4a; }
            `}</style>

            {/* ✅ Overlay cliquable pour fermer la sidebar sur mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed", inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        zIndex: 99,
                        backdropFilter: "blur(2px)", /* Effet moderne */
                    }}
                />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main style={{ flex: 1, minHeight: "100vh", boxSizing: "border-box" }}>
                {/* Bouton burger — visible uniquement sur mobile via CSS */}
                <button id="pf-burger-btn" onClick={() => setSidebarOpen(true)}>
                    <svg width="18" height="18" fill="none" stroke="white"
                        strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>

                <div
                    id="pf-main-content"
                    style={{
                        marginLeft: "232px",
                        padding: "32px",
                        boxSizing: "border-box",
                        minHeight: "100vh",
                    }}
                >
                    {children}
                </div>
            </main>
        </div>
    );
}