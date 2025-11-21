import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:3000";

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

      <div style={{ display: "grid", gap: 12 }}>
        {noticias.map((n) => (
          <Link
            key={n.id}
            to={`/noticia/${n.id}`}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "stretch",
              padding: 12,
              backgroundColor: "#ffffff",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              textDecoration: "none",
              color: "#1f2933",
              boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
            }}
          >
            {n.imagemUrl && (
              <img
                src={n.imagemUrl}
                alt={n.titulo}
                style={{
                  width: 96,
                  height: 64,
                  borderRadius: 4,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            )}

            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {n.titulo}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#4b5563",
                }}
              >
                {n.resumo}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
