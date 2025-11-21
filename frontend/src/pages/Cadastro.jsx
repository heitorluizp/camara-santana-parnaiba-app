import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Cadastro() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    telefone: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    login(form.name, form.email);
    navigate("/");
  }

  return (
    <div style={{ padding: 32, maxWidth: 380, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Criar conta</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <input
          name="name"
          placeholder="Seu nome"
          value={form.name}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          name="email"
          type="email"
          placeholder="Seu e-mail"
          value={form.email}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          name="telefone"
          placeholder="Seu telefone"
          value={form.telefone}
          onChange={handleChange}
          style={inputStyle}
        />

        <button style={buttonStyle}>Criar conta</button>
      </form>
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

export default Cadastro;
