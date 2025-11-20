import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ usuario: "", senha: "", codigo: "" });
  const [erro, setErro] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleLogin(e) {
    e.preventDefault();
    setErro("");

    // mock simples: usuário: admin / senha: 123456
    if (form.usuario === "admin" && form.senha === "123456") {
      setStep(2);
    } else {
      setErro("Usuário ou senha inválidos (use admin / 123456)");
    }
  }

  function handle2FA(e) {
    e.preventDefault();
    // mock: qualquer código de 6 dígitos
    if (form.codigo.length === 6) {
      navigate("/admin/noticias");
    } else {
      setErro("Informe um código de 6 dígitos (mock).");
    }
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <h2>Admin - Login</h2>
      {step === 1 && (
        <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
          <input
            name="usuario"
            placeholder="Usuário"
            value={form.usuario}
            onChange={handleChange}
            style={{ padding: 8, borderRadius: 4, border: "1px solid #444" }}
          />
          <input
            name="senha"
            type="password"
            placeholder="Senha"
            value={form.senha}
            onChange={handleChange}
            style={{ padding: 8, borderRadius: 4, border: "1px solid #444" }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 12px",
              borderRadius: 4,
              border: "none",
              background: "#0af",
              color: "#000",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Entrar
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handle2FA} style={{ display: "grid", gap: 12 }}>
          <p style={{ opacity: 0.8 }}>
            (Mock) Informe qualquer código de 6 dígitos para simular o 2FA.
          </p>
          <input
            name="codigo"
            placeholder="Código 2FA"
            value={form.codigo}
            onChange={handleChange}
            style={{ padding: 8, borderRadius: 4, border: "1px solid #444" }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 12px",
              borderRadius: 4,
              border: "none",
              background: "#0af",
              color: "#000",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Confirmar
          </button>
        </form>
      )}

      {erro && <p style={{ color: "#f55", marginTop: 12 }}>{erro}</p>}
    </div>
  );
}

export default AdminLogin;
