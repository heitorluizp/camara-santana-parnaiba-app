import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/", label: "Início", icon: "🏠" },
  { to: "/vereadores", label: "Vereadores", icon: "👥" },
  { to: "/leis", label: "Leis", icon: "📜" },
  { to: "/tv", label: "TV", icon: "📺" },
  { to: "/propostas", label: "Propostas", icon: "📂" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: "#002a5c", // azul mais escuro, bem institucional
        borderTop: "1px solid rgba(15, 23, 42, 0.4)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "0 8px",
        zIndex: 50,
      }}
    >
      {items.map((item) => {
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            style={{
              flex: 1,
              textAlign: "center",
              textDecoration: "none",
              fontSize: 11,
              color: active ? "#fbbf24" : "#e5e7eb", // ativo dourado, inativo cinza claro
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 2 }}>{item.icon}</div>
            <span
              style={{
                display: "block",
                fontWeight: active ? 600 : 400,
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
