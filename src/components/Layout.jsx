import Sidebar from "./Sidebar";

export default function Layout({ children }) {
    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <Sidebar />
            <main style={{
                marginLeft: "240px",
                flex: 1,
                minHeight: "100vh",
                padding: "32px",
                boxSizing: "border-box",
            }}>
                {children}
            </main>
        </div>
    );
}