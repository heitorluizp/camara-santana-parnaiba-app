import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API = "http://localhost:3000";

function NoticiaDetalhe() {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/noticias/${id}`)
      .then(res => res.json())
      .then(data => setNoticia(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (!noticia) return <p>Notícia não encontrada.</p>;

  return (
    <div>
      <Link to="/" style={{ color: "#0af" }}>← Voltar</Link>
      <h2 style={{ marginTop: 16 }}>{noticia.titulo}</h2>
      {noticia.imagemUrl && (
        <img
          src={noticia.imagemUrl}
          alt={noticia.titulo}
          style={{ width: "100%", borderRadius: 6, marginBottom: 16 }}
        />
      )}
      <p style={{ opacity: 0.8, marginBottom: 16 }}>{noticia.resumo}</p>
      <p>{noticia.conteudo}</p>
    </div>
  );
}

export default NoticiaDetalhe;
