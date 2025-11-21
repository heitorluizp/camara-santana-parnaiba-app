import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:3000/api";

function Home() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/noticias`)
      .then((res) => res.json())
      .then((data) => setNoticias(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando notícias...</p>;

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
        Notícias
      </h2>

      <div style={{ display: "grid", gap: 16 }}>
        {noticias.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: 48,
            color: "#6b7280",
            backgroundColor: "#f9fafb",
            borderRadius: 8,
            border: "1px solid #e5e7eb"
          }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>📰</p>
            <p>Nenhuma notícia disponível no momento.</p>
          </div>
        ) : (
          noticias.map((n) => (
          <Link
            key={n.id}
            to={`/noticia/${n.id}`}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
              padding: 16,
              backgroundColor: "#ffffff",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              textDecoration: "none",
              color: "#1f2933",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
          >
            {n.imagemUrl && (
              <img
                src={n.imagemUrl}
                alt={n.titulo}
                style={{
                  width: 120,
                  height: 80,
                  borderRadius: 6,
                  objectFit: "cover",
                  flexShrink: 0,
                  border: "1px solid #e5e7eb",
                }}
              />
            )}

            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "#1f2937",
                  lineHeight: "1.4",
                }}
              >
                {n.titulo}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  lineHeight: "1.5",
                }}
              >
                {n.resumo}
              </p>
            </div>
          </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
