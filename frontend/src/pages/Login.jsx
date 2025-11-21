import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    if (!formData.email.trim() || !formData.senha.trim()) {
      setError("Email e senha são obrigatórios");
      return;
    }

    if (isRegister && !formData.nome.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let result;
      if (isRegister) {
        result = await register(formData.nome, formData.email, formData.senha, formData.telefone);
      } else {
        result = await login(formData.email, formData.senha);
      }

      if (result.success) {
        navigate("/");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
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

      <h2 style={{ fontSize: 22, marginBottom: 16 }}>
        {isRegister ? "Criar Conta" : "Entrar"}
      </h2>

      {error && (
        <div style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fca5a5",
          color: "#dc2626",
          padding: "8px 12px",
          borderRadius: 6,
          fontSize: 14,
          marginBottom: 16
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        {isRegister && (
          <input
            name="nome"
            placeholder="Seu nome completo"
            value={formData.nome}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
        )}

        <input
          name="email"
          placeholder="Seu e-mail"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          style={inputStyle}
          required
        />

        <input
          name="senha"
          placeholder="Sua senha"
          type="password"
          value={formData.senha}
          onChange={handleInputChange}
          style={inputStyle}
          required
        />

        {isRegister && (
          <input
            name="telefone"
            placeholder="Seu telefone (opcional)"
            type="tel"
            value={formData.telefone}
            onChange={handleInputChange}
            style={inputStyle}
          />
        )}

        <button 
          type="submit" 
          style={{
            ...buttonStyle,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
          disabled={loading}
        >
          {loading ? "Aguarde..." : (isRegister ? "Criar Conta" : "Entrar")}
        </button>
      </form>

      {/* Toggle entre login e cadastro */}
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
            setFormData({
              nome: "",
              email: "",
              senha: "",
              telefone: ""
            });
          }}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            color: "#2563eb",
            textDecoration: "underline",
            cursor: "pointer"
          }}
        >
          {isRegister 
            ? "Já tenho conta — fazer login" 
            : "Não sou registrado — criar conta"
          }
        </button>
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
