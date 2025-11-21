function Header({ onMenuClick }) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        zIndex: 900,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}
    >
      {/* Botão do Menu */}
      <button
        onClick={onMenuClick}
        style={{
          background: "none",
          border: "none",
          fontSize: 20,
          cursor: "pointer",
          color: "#374151",
          padding: 8,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        ☰
      </button>

      {/* Logo/Título */}
      <div style={{ marginLeft: 16 }}>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#1f2937",
            margin: 0
          }}
        >
          Câmara de Santana de Parnaíba
        </h1>
      </div>

      {/* Espaço flexível */}
      <div style={{ flex: 1 }} />

      {/* Botão de perfil/login (opcional) */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16
        }}
      >
        👤
      </div>
    </header>
  );
}

export default Header;
