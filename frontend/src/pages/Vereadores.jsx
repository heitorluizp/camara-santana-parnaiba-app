import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:3000/api";

function Vereadores() {
  const [vereadores, setVereadores] = useState([]);

  useEffect(() => {
    fetch(`${API}/vereadores`)
      .then((res) => res.json())
      .then((data) => setVereadores(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2933",
          marginBottom: 16,
        }}
      >
        Vereadores
      </h2>

      <div style={{ display: "grid", gap: 12 }}>
        {vereadores.map((v) => (
          <Link
            key={v.id}
            to={`/vereador/${v.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              textDecoration: "none",
              color: "#1f2933",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
            }}
          >
            <img
              src={v.foto}
              alt={v.nome}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 4,
                  fontSize: 15,
                }}
              >
                {v.nome}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#4b5563",
                }}
              >
                {v.descricao}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Vereadores;
