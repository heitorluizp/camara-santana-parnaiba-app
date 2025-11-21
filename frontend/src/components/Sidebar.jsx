import { Link, useLocation } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    {
      path: "/",
      label: "Início",
      icon: "🏠"
    },
    {
      path: "/vereadores",
      label: "Vereadores",
      icon: "👥"
    },
    {
      path: "/leis",
      label: "Leis",
      icon: "📄"
    },
    {
      path: "/propostas",
      label: "Propostas",
      icon: "📜"
    },
    {
      path: "/ordem-do-dia",
      label: "Ordem do Dia",
      icon: "📋"
    },
    {
      path: "/conversas",
      label: "Chat",
      icon: "💬"
    },
    {
      path: "/tv",
      label: "TV Câmara",
      icon: "📺"
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            display: window.innerWidth <= 768 ? "block" : "none"
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? 0 : "-280px",
          width: "280px",
          height: "100vh",
          backgroundColor: "#ffffff",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          transition: "left 0.3s ease-in-out",
          overflowY: "auto"
        }}
      >
        {/* Header do Sidebar */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#f8fafc"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1f2937",
                  margin: 0,
                  marginBottom: 4
                }}
              >
                Câmara Municipal
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  margin: 0
                }}
              >
                Santana de Parnaíba
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#6b7280",
                padding: 4
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav style={{ padding: "16px 0" }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 20px",
                textDecoration: "none",
                color: isActive(item.path) ? "#2563eb" : "#374151",
                backgroundColor: isActive(item.path) ? "#eff6ff" : "transparent",
                borderRight: isActive(item.path) ? "3px solid #2563eb" : "3px solid transparent",
                transition: "all 0.2s ease"
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: isActive(item.path) ? 600 : 400
                }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Footer do Sidebar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 20px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#f8fafc"
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: "#9ca3af",
              margin: 0,
              textAlign: "center"
            }}
          >
            © 2024 Câmara Municipal
            <br />
            Santana de Parnaíba
          </p>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
