import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBanner from "../components/NotificationBanner";

function Perfil() {
  const { user, logout } = useAuth();
  const [notif, setNotif] = useState("");

  function simulateNotification() {
    setNotif("📢 Nova notícia: Sessão de hoje às 19h.");
    setTimeout(() => setNotif(""), 3000);
  }

  return (
    <div style={{ padding: 24 }}>
      <NotificationBanner message={notif} />

      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Meu Perfil
      </h2>

      <p><b>Nome:</b> {user?.name}</p>
      <p style={{ marginBottom: 12 }}><b>E-mail:</b> {user?.email}</p>

      <button
        onClick={simulateNotification}
        style={{
          padding: "10px 12px",
          backgroundColor: "#2563eb",
          borderRadius: 6,
          border: "none",
          color: "#fff",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        Simular notificação
      </button>

      <button
        onClick={logout}
        style={{
          padding: "10px 12px",
          backgroundColor: "#dc2626",
          borderRadius: 6,
          border: "none",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Sair
      </button>
    </div>
  );
}

export default Perfil;
