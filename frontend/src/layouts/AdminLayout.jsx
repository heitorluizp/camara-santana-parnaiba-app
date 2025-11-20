import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div
      style={{
        background: "#020617",
        color: "#f9fafb",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER ADMIN */}
      <header
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.3)",
          background: "linear-gradient(90deg, #020617, #0f172a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            Painel da Câmara
          </div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            Administração Interna
          </div>
        </div>

        <Link
          to="/"
          style={{
            fontSize: 13,
            color: "#e5e7eb",
            textDecoration: "none",
            border: "1px solid rgba(148, 163, 184, 0.6)",
            borderRadius: 999,
            padding: "6px 10px",
          }}
        >
          ← Voltar ao app
        </Link>
      </header>

      {/* CONTEÚDO COM SIDEBAR */}
      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
        }}
      >
        <AdminSidebar />

        <main
          style={{
            flex: 1,
            padding: 20,
            overflow: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
