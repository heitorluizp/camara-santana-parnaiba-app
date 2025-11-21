import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    login(name.trim(), email.trim());
    navigate("/");
  }

  return (
    <div style={{ padding: 32, maxWidth: 380, margin: "0 auto" }}>
      {/* LOGO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: "#fbbf24",
            fontSize: 28,
            fontWeight: 700,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#1f2937",
          }}
        >
          C
        </div>

        <div>
          <div style={{ fontSize: 14 }}>Câmara Municipal</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            Santana de Parnaíba
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Entrar</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <input
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Seu e-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <button style={buttonStyle}>
          Entrar
        </button>
      </form>

      {/* Criar conta */}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <a
          href="/cadastro"
          style={{
            fontSize: 14,
            color: "#2563eb",
            textDecoration: "none",
          }}
        >
          Não sou registrado — criar conta
        </a>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 14,
};

const buttonStyle = {
  padding: "10px 12px",
  backgroundColor: "#2563eb",
  borderRadius: 6,
  border: "none",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

export default Login;
