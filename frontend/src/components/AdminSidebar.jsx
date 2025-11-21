import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/admin/noticias", label: "Notícias" },
  { to: "/admin/usuarios", label: "Usuários" },
  // Futuro: { to: "/admin/mensagens", label: "Mensagens" },
  // Futuro: { to: "/admin/leis", label: "Leis" },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside
      style={{
        width: 220,
        background: "#050816",
        borderRight: "1px solid rgba(148, 163, 184, 0.3)",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          marginBottom: 12,
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          color: "#e5e7eb",
        }}
      >
        Administração
      </div>

      {items.map((item) => {
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 14,
              color: active ? "#0f172a" : "#e5e7eb",
              background: active
                ? "linear-gradient(90deg, #38bdf8, #a5b4fc)"
                : "transparent",
              fontWeight: active ? 600 : 400,
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
