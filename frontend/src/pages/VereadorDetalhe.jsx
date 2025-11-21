import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:3000";

function VereadorDetalhe() {
  const { id } = useParams();
  const { user } = useAuth();
  const [vereador, setVereador] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    fetch(`${API}/vereadores/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setVereador(data);
        // histórico bem simples (mock)
        setMensagens([
          { id: 1, de: "vereador", texto: `Olá, sou ${data.nome}.` },
          {
            id: 2,
            de: "cidadao",
            texto: "Olá, gostaria de enviar uma mensagem.",
          },
        ]);
      })
      .catch(console.error);
  }, [id]);

  function enviarMensagem(e) {
    e.preventDefault();
    if (!texto.trim()) return;

    setMensagens((anteriores) => [
      ...anteriores,
      { id: anteriores.length + 1, de: "cidadao", texto: texto.trim() },
    ]);

    setTexto("");
  }

  if (!vereador) return <p>Carregando...</p>;

  return (
    <div>
      {/* Cabeçalho do vereador */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <img
          src={vereador.foto}
          alt={vereador.nome}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>{vereador.nome}</h2>
          <p style={{ fontSize: 13 }}>{vereador.descricao}</p>
          <p style={{ fontSize: 12, color: "#4b5563" }}>
            Contato: {vereador.contato}
          </p>
        </div>
      </div>

      <h3
        style={{
          fontSize: 18,
          marginBottom: 4,
        }}
      >
        Fale com {vereador.nome}
      </h3>

      <p
        style={{
          fontSize: 12,
          color: "#6b7280",
          marginBottom: 8,
        }}
      >
        Você está conversando como: <b>{user?.name}</b>
      </p>

      {/* Caixa simples de mensagens */}
      <div
        style={{
          border: "1px solid #d1d5db",
          borderRadius: 8,
          backgroundColor: "#ffffff",
          padding: 10,
          minHeight: 160,
          maxHeight: 260,
          overflowY: "auto",
          marginBottom: 8,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {mensagens.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.de === "cidadao" ? "flex-end" : "flex-start",
              backgroundColor: m.de === "cidadao" ? "#dbeafe" : "#e5e7eb",
              padding: "6px 8px",
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            {m.texto}
          </div>
        ))}
      </div>

      {/* Input simples */}
      <form
        onSubmit={enviarMensagem}
        style={{ display: "flex", gap: 8, marginTop: 4 }}
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Digite sua mensagem..."
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#2563eb",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

export default VereadorDetalhe;
