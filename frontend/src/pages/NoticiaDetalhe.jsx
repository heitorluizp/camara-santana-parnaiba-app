import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API = "http://localhost:3000/api";

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

  function processarConteudoComImagens(conteudo, imagens) {
    if (!imagens || imagens.length === 0) return conteudo;
    
    let conteudoProcessado = conteudo;
    
    imagens.forEach((imagem, index) => {
      const placeholder = `[IMAGEM-${index + 1}]`;
      const imagemHtml = `<div style="margin: 24px 0; text-align: center;">
        <img src="${imagem.url_imagem}" alt="${imagem.descricao || `Imagem ${index + 1}`}" 
             style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer;" 
             onclick="window.open('${imagem.url_imagem}', '_blank')" />
        ${imagem.descricao ? `<p style="margin-top: 12px; font-size: 14px; color: #6b7280; font-style: italic; max-width: 500px; margin-left: auto; margin-right: auto;">${imagem.descricao}</p>` : ''}
      </div>`;
      
      // Escapar caracteres especiais da regex nos colchetes
      const placeholderEscapado = placeholder.replace(/[[\]]/g, '\\$&');
      conteudoProcessado = conteudoProcessado.replace(new RegExp(placeholderEscapado, 'g'), imagemHtml);
    });
    
    return conteudoProcessado;
  }

  if (loading) return <p>Carregando...</p>;
  if (!noticia) return <p>Notícia não encontrada.</p>;

  return (
    <div>
      <Link to="/" style={{ color: "#0af" }}>← Voltar</Link>
      <h2 style={{ marginTop: 16 }}>{noticia.titulo}</h2>
      
      {/* Imagem principal */}
      {noticia.imagemUrl && (
        <img
          src={noticia.imagemUrl}
          alt={noticia.titulo}
          style={{ width: "100%", borderRadius: 6, marginBottom: 16 }}
        />
      )}
      
      <p style={{ opacity: 0.8, marginBottom: 16 }}>{noticia.resumo}</p>
      
      {/* Conteúdo processado com imagens nos placeholders */}
      <div 
        style={{ marginBottom: 24, lineHeight: "1.7" }}
        dangerouslySetInnerHTML={{
          __html: processarConteudoComImagens(
            noticia.conteudo.replace(/\n/g, '<br>'),
            noticia.imagens || []
          )
        }}
      />
      
      {/* Galeria de imagens não utilizadas no texto */}
      {(() => {
        if (!noticia.imagens || noticia.imagens.length === 0) return null;
        
        // Identificar quais imagens não foram usadas como placeholders no conteúdo
        const imagensNaoUsadas = noticia.imagens.filter((imagem, index) => {
          const placeholder = `[IMAGEM-${index + 1}]`;
          return !noticia.conteudo.includes(placeholder);
        });
        
        if (imagensNaoUsadas.length === 0) return null;
        
        return (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              Galeria de Imagens
            </h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
              gap: 16 
            }}>
              {imagensNaoUsadas.map((imagem, index) => (
              <div key={imagem.id} style={{ position: "relative" }}>
                <img
                  src={imagem.url_imagem}
                  alt={imagem.descricao || `Imagem ${index + 1}`}
                  style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    // Abrir imagem em modal ou nova aba
                    window.open(imagem.url_imagem, '_blank');
                  }}
                />
                {imagem.descricao && (
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                    color: "white",
                    padding: "12px 8px 8px",
                    borderRadius: "0 0 8px 8px",
                    fontSize: 14
                  }}>
                    {imagem.descricao}
                  </div>
                )}
              </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default NoticiaDetalhe;
