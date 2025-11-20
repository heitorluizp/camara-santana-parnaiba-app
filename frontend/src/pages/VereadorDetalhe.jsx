import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = "http://localhost:3000";

function VereadorDetalhe() {
  const { id } = useParams();
  const [vereador, setVereador] = useState(null);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    texto: ""
  });

  useEffect(() => {
    fetch(`${API}/vereadores/${id}`)
      .then(res => res.json())
      .then(data => setVereador(data))
      .catch(err => console.error(err));
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("enviando...");
    try {
      const resp = await fetch(`${API}/vereadores/${id}/mensagens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!resp.ok) {
        const body = await resp.json();
        throw new Error(body.error || "Erro ao enviar");
      }

      setStatus("Mensagem enviada com sucesso!");
      setForm({ nome: "", email: "", texto: "" });
    } catch (err) {
      console.error(err);
      setStatus("Erro ao enviar mensagem.");
    }
  }

  if (!vereador) return <p>Carregando...</p>;

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <img
          src={vereador.foto}
          alt={vereador.nome}
          style={{ width: 96, height: 96, borderRadius: "50%" }}
        />
        <div>
          <h2>{vereador.nome}</h2>
          <p>{vereador.descricao}</p>
          <p style={{ opacity: 0.8 }}>Contato: {vereador.contato}</p>
          <p style={{ opacity: 0.8 }}>{vereador.dadosPublicos}</p>
        </div>
      </div>

      <h3>Fale com {vereador.nome}</h3>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 12, maxWidth: 480 }}
      >
        <input
          name="nome"
          placeholder="Seu nome"
          value={form.nome}
          onChange={handleChange}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #444" }}
        />
        <input
          name="email"
          placeholder="Seu e-mail"
          value={form.email}
          onChange={handleChange}
          style={{ padding: 8, borderRadius: 4, border: "1px solid #444" }}
        />
        <textarea
          name="texto"
          placeholder="Sua mensagem"
          value={form.texto}
          onChange={handleChange}
          rows={4}
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
          Enviar mensagem
        </button>
      </form>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}

export default VereadorDetalhe;
