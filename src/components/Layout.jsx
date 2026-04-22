import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <style>{`
                @media (max-width: 768px) {
                    #pf-burger-btn { display: flex !important; }
                    #pf-main-content { margin-left: 0 !important; padding: 16px !important; padding-top: 64px !important; }
                }
            `}</style>

            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.3)",
                    zIndex: 99,
                }} />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main style={{ flex: 1, minHeight: "100vh", boxSizing: "border-box" }}>
                <button
                    id="pf-burger-btn"
                    onClick={() => setSidebarOpen(true)}
                    style={{
                        display: "none",
                        position: "fixed",
                        top: "14px", left: "14px",
                        zIndex: 98,
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "8px",
                        cursor: "pointer",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    }}
                >
                    <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>

                <div id="pf-main-content" style={{
                    marginLeft: "232px",
                    padding: "32px",
                    boxSizing: "border-box",
                    minHeight: "100vh",
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
}