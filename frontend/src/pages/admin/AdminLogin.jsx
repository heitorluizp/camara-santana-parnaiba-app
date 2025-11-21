import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    email: "admin@camara.sp.gov.br", 
    senha: "123456" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return;

    if (!formData.email.trim() || !formData.senha.trim()) {
      setError("Email e senha são obrigatórios");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.senha);
      
      if (result.success) {
        // Verificar se o usuário é admin
        if (result.user?.tipo === 'admin') {
          navigate("/admin/noticias");
        } else {
          setError("Acesso negado. Apenas administradores podem acessar esta área.");
        }
      } else {
        setError(result.error || "Erro ao fazer login");
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "0 auto", padding: 32 }}>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>Admin - Login</h2>
      
      <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
        Use: admin@camara.sp.gov.br / 123456
      </p>

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

      <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
        <input
          name="email"
          type="email"
          placeholder="Email do administrador"
          value={formData.email}
          onChange={handleChange}
          style={{ 
            padding: "10px 12px", 
            borderRadius: 6, 
            border: "1px solid #d1d5db",
            fontSize: 14
          }}
          required
        />
        <input
          name="senha"
          type="password"
          placeholder="Senha"
          value={formData.senha}
          onChange={handleChange}
          style={{ 
            padding: "10px 12px", 
            borderRadius: 6, 
            border: "1px solid #d1d5db",
            fontSize: 14
          }}
          required
        />
        <button
          type="submit"
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            border: "none",
            background: loading ? "#6b7280" : "#2563eb",
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14
          }}
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
