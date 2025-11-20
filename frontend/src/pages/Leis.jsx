import { useEffect, useState } from "react";

const API = "http://localhost:3000";

function Leis() {
  const [leis, setLeis] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`${API}/leis?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => setLeis(data))
      .catch(err => console.error(err));
  }, [q]);

  return (
    <div>
      <h2>Leis Municipais</h2>
      <input
        placeholder="Buscar por número, ano, título..."
        value={q}
        onChange={e => setQ(e.target.value)}
        style={{ padding: 8, width: "100%", maxWidth: 400, borderRadius: 4, border: "1px solid #444", marginBottom: 16 }}
      />
      <div style={{ display: "grid", gap: 12 }}>
        {leis.map(lei => (
          <div
            key={lei.id}
            style={{ backgroundColor: "#ffffff",
                    border: "1px solid #d1d5db",
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                    color: "#1f2933",
                    }}
          >
            <strong>{lei.titulo}</strong>
            <p style={{ margin: "4px 0" }}>
              Nº {lei.numero}/{lei.ano}
            </p>
            <p style={{ opacity: 0.8 }}>{lei.ementa}</p>
          </div>
        ))}
        {leis.length === 0 && <p>Nenhuma lei encontrada.</p>}
      </div>
    </div>
  );
}

export default Leis;
