import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:3000";

function Home() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/noticias`)
      .then(res => res.json())
      .then(data => setNoticias(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando notícias...</p>;

  return (
    <div>
      <h2>Notícias</h2>
      <div style={{ display: "grid", gap: 16 }}>
        {noticias.map(n => (
          <Link
            key={n.id}
            to={`/noticia/${n.id}`}
            style={{
                backgroundColor: "#ffffff",
                border: "1px solid #d1d5db",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                color: "#1f2933",

            }}
          >
            {n.imagemUrl && (
              <img
                src={n.imagemUrl}
                alt={n.titulo}
                style={{ width: "100%", borderRadius: 6, marginBottom: 8 }}
              />
            )}
            <h3 style={{ marginBottom: 4 }}>{n.titulo}</h3>
            <p style={{ opacity: 0.8 }}>{n.resumo}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
