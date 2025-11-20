import { useEffect, useState } from "react";

const API = "http://localhost:3000";

function Propostas() {
  const [propostas, setPropostas] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`${API}/propostas?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => setPropostas(data))
      .catch(err => console.error(err));
  }, [q]);

  return (
    <div>
      <h2>Proposituras</h2>
      <input
        placeholder="Buscar por tipo, autor, número..."
        value={q}
        onChange={e => setQ(e.target.value)}
        style={{ padding: 8, width: "100%", maxWidth: 400, borderRadius: 4, border: "1px solid #444", marginBottom: 16 }}
      />
      <div style={{ display: "grid", gap: 12 }}>
        {propostas.map(p => (
          <div
            key={p.id}
            style={{ backgroundColor: "#ffffff",
border: "1px solid #d1d5db",
boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
color: "#1f2933",
 }}
          >
            <strong>{p.titulo}</strong>
            <p style={{ margin: "4px 0" }}>
              {p.tipo} - Nº {p.numero}/{p.ano}
            </p>
            <p style={{ opacity: 0.8 }}>Autor: {p.autor}</p>
          </div>
        ))}
        {propostas.length === 0 && <p>Nenhuma proposta encontrada.</p>}
      </div>
    </div>
  );
}

export default Propostas;
