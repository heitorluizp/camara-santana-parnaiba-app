import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API = "http://localhost:3000/api";

function AdminNoticias() {
  const { user } = useAuth();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagensAdicionais, setImagensAdicionais] = useState([]);
  const [conteudoTextareaRef, setConteudoTextareaRef] = useState(null);
  const [form, setForm] = useState({
    id: null,
    titulo: "",
    resumo: "",
    conteudo: "",
    imagem_url: "",
    publicado: false,
    destaque: false
  });

  useEffect(() => {
    carregarNoticias();
  }, []);

  async function carregarNoticias() {
    try {
      setLoading(true);
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/admin/noticias`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNoticias(data);
      } else {
        setError('Erro ao carregar notícias');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  }

  function handleNova() {
    setForm({
      id: null,
      titulo: "",
      resumo: "",
      conteudo: "",
      imagem_url: "",
      publicado: false,
      destaque: false
    });
    setSelectedImage(null);
    setSelectedImages([]);
    setImagensAdicionais([]);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function handleEdit(noticia) {
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/admin/noticias/${noticia.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setForm({
          id: data.id,
          titulo: data.titulo,
          resumo: data.resumo,
          conteudo: data.conteudo || "",
          imagem_url: data.imagem_url || "",
          publicado: data.publicado || false,
          destaque: data.destaque || false
        });

        // Carregar imagens adicionais
        const imagensResponse = await fetch(`${API}/admin/noticias/${noticia.id}/imagens`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (imagensResponse.ok) {
          const imagensData = await imagensResponse.json();
          setImagensAdicionais(imagensData);
        }

        setSelectedImages([]);
        setShowForm(true);
        setError("");
        setSuccess("");
      } else {
        setError('Erro ao carregar notícia para edição');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return;
    
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/admin/noticias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setNoticias(noticias.filter(n => n.id !== id));
        setSuccess('Notícia excluída com sucesso');
        if (form.id === id) {
          setShowForm(false);
        }
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao excluir notícia');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    }
  }

  async function handleImageUpload(file) {
    if (!file) return null;

    try {
      const formData = new FormData();
      formData.append('imagem', file);
      
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/admin/upload-imagem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.url;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro no upload da imagem');
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      throw err;
    }
  }

  async function handleMultipleImageUpload(files) {
    if (!files || files.length === 0) return [];

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('imagens', file);
      });
      
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/admin/upload-imagens-multiplas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.imagens;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro no upload das imagens');
      }
    } catch (err) {
      console.error('Erro no upload múltiplo:', err);
      throw err;
    }
  }

  async function addImagesToNoticia(noticiaId, imagens) {
    try {
      const token = localStorage.getItem('app_token');
      const imagensData = imagens.map((img, index) => ({
        url_imagem: img.url,
        descricao: '',
        ordem: index
      }));

      const response = await fetch(`${API}/admin/noticias/${noticiaId}/imagens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imagens: imagensData })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao adicionar imagens');
      }
    } catch (err) {
      console.error('Erro ao adicionar imagens:', err);
      throw err;
    }
  }

  async function removeImagemAdicional(noticiaId, imagemId) {
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/admin/noticias/${noticiaId}/imagens/${imagemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setImagensAdicionais(prev => prev.filter(img => img.id !== imagemId));
        setSuccess('Imagem removida com sucesso');
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao remover imagem');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    }
  }

  function inserirImagemNoTexto(indiceImagem) {
    if (!conteudoTextareaRef) return;

    const textarea = conteudoTextareaRef;
    const cursorPos = textarea.selectionStart;
    const textoBefore = form.conteudo.substring(0, cursorPos);
    const textoAfter = form.conteudo.substring(cursorPos);
    const placeholder = `[IMAGEM-${indiceImagem + 1}]`;
    
    const novoConteudo = textoBefore + placeholder + textoAfter;
    
    setForm(prev => ({ ...prev, conteudo: novoConteudo }));
    
    // Restaurar posição do cursor após o placeholder
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos + placeholder.length, cursorPos + placeholder.length);
    }, 0);
  }

  function processarConteudoComImagens(conteudo, todasImagens) {
    // Se não há conteúdo, retorna vazio
    if (!conteudo) return '';
    
    let conteudoProcessado = conteudo;
    
    // Se há imagens, processa os placeholders
    if (todasImagens && todasImagens.length > 0) {
      todasImagens.forEach((imagem, index) => {
        const placeholder = `[IMAGEM-${index + 1}]`;
        const imagemHtml = `<div style="margin: 20px 0; text-align: center;">
          <img src="${imagem.url_imagem || imagem.url}" alt="${imagem.descricao || `Imagem ${index + 1}`}" 
               style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
          ${imagem.descricao ? `<p style="margin-top: 8px; font-size: 14px; color: #6b7280; font-style: italic;">${imagem.descricao}</p>` : ''}
        </div>`;
        
        // Escapar caracteres especiais da regex nos colchetes
        const placeholderEscapado = placeholder.replace(/[[\]]/g, '\\$&');
        conteudoProcessado = conteudoProcessado.replace(new RegExp(placeholderEscapado, 'g'), imagemHtml);
      });
    }
    
    return conteudoProcessado;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.resumo.trim() || !form.conteudo.trim()) {
      setError('Título, resumo e conteúdo são obrigatórios');
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl = form.imagem_url;
      
      // Se uma nova imagem foi selecionada, fazer upload primeiro
      if (selectedImage) {
        try {
          imageUrl = await handleImageUpload(selectedImage);
        } catch (uploadError) {
          setError('Erro no upload da imagem: ' + uploadError.message);
          setSaving(false);
          return;
        }
      }

      const token = localStorage.getItem('app_token');
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `${API}/admin/noticias/${form.id}` : `${API}/admin/noticias`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: form.titulo,
          resumo: form.resumo,
          conteudo: form.conteudo,
          imagem_url: imageUrl,
          publicado: form.publicado,
          destaque: form.destaque
        })
      });
      
      if (response.ok) {
        const responseData = await response.json();
        const noticiaId = form.id || responseData.id;

        // Upload de imagens adicionais se houver
        if (selectedImages.length > 0) {
          try {
            const imagensUpload = await handleMultipleImageUpload(selectedImages);
            await addImagesToNoticia(noticiaId, imagensUpload);
          } catch (uploadError) {
            setError('Notícia salva, mas erro ao adicionar imagens: ' + uploadError.message);
            setSaving(false);
            return;
          }
        }

        setSuccess(form.id ? 'Notícia atualizada com sucesso' : 'Notícia criada com sucesso');
        setShowForm(false);
        await carregarNoticias();
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao salvar notícia');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Carregando notícias...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          Gerenciar Notícias
        </h2>
        <button
          onClick={handleNova}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          + Nova Notícia
        </button>
      </div>

      {/* Mensagens de erro/sucesso */}
      {error && (
        <div style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fca5a5",
          color: "#dc2626",
          padding: "12px 16px",
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          color: "#16a34a",
          padding: "12px 16px",
          borderRadius: 6,
          marginBottom: 16,
          fontSize: 14
        }}>
          {success}
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 24,
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>
              {form.id ? "Editar Notícia" : "Nova Notícia"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#6b7280"
              }}
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                  Título *
                </label>
                <input
                  name="titulo"
                  placeholder="Título da notícia"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 14
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                  Imagem da Notícia
                </label>
                <div style={{ display: "grid", gap: 8 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 14
                    }}
                  />
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Ou inserir URL da imagem:
                  </div>
                  <input
                    name="imagem_url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={form.imagem_url}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 4,
                      border: "1px solid #d1d5db",
                      fontSize: 13
                    }}
                  />
                  {(selectedImage || form.imagem_url) && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                        Preview:
                      </div>
                      <img
                        src={selectedImage ? URL.createObjectURL(selectedImage) : form.imagem_url}
                        alt="Preview"
                        style={{
                          maxWidth: 200,
                          maxHeight: 150,
                          borderRadius: 4,
                          border: "1px solid #e5e7eb"
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Imagens Adicionais */}
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                Imagens Adicionais
              </label>
              <div style={{ display: "grid", gap: 12 }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      // Adicionar novas imagens às já selecionadas
                      const novasImagens = Array.from(e.target.files);
                      const imagensExistentes = Array.from(selectedImages);
                      const todasImagens = [...imagensExistentes, ...novasImagens];
                      
                      // Converter de volta para FileList-like object
                      const dt = new DataTransfer();
                      todasImagens.forEach(file => dt.items.add(file));
                      setSelectedImages(dt.files);
                    }
                    // Limpar o input para permitir selecionar os mesmos arquivos novamente
                    e.target.value = '';
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 14
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    Selecione múltiplas imagens (máximo 10) - {selectedImages.length} selecionadas
                  </div>
                  {selectedImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedImages([])}
                      style={{
                        padding: "4px 8px",
                        fontSize: 11,
                        border: "1px solid #dc2626",
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        borderRadius: 4,
                        cursor: "pointer"
                      }}
                    >
                      Limpar todas ({selectedImages.length})
                    </button>
                  )}
                </div>

                {/* Preview das novas imagens selecionadas */}
                {selectedImages.length > 0 && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                      Novas imagens selecionadas:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                      {Array.from(selectedImages).map((file, index) => (
                        <div key={index} style={{ position: "relative" }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: "100%",
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 4,
                              border: "1px solid #e5e7eb"
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const novasImagens = Array.from(selectedImages).filter((_, i) => i !== index);
                              const dt = new DataTransfer();
                              novasImagens.forEach(file => dt.items.add(file));
                              setSelectedImages(dt.files);
                            }}
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              background: "#dc2626",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              fontSize: 12,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            ×
                          </button>
                          <div style={{ fontSize: 12, color: "#6b7280", padding: "4px 0" }}>
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Imagens já existentes (no modo edição) */}
                {imagensAdicionais.length > 0 && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                      Imagens existentes:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                      {imagensAdicionais.map((imagem) => (
                        <div key={imagem.id} style={{ position: "relative" }}>
                          <img
                            src={imagem.url_imagem}
                            alt={imagem.descricao || 'Imagem da notícia'}
                            style={{
                              width: "100%",
                              height: 100,
                              objectFit: "cover",
                              borderRadius: 4,
                              border: "1px solid #e5e7eb"
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImagemAdicional(form.id, imagem.id)}
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              background: "#dc2626",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              fontSize: 12,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                Resumo *
              </label>
              <textarea
                name="resumo"
                placeholder="Resumo da notícia (será exibido na listagem)"
                value={form.resumo}
                onChange={handleChange}
                required
                rows={2}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                  resize: "vertical"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                Conteúdo *
              </label>
              <textarea
                ref={setConteudoTextareaRef}
                name="conteudo"
                placeholder="Conteúdo completo da notícia&#10;&#10;Dica: Use [IMAGEM-1], [IMAGEM-2], etc. para inserir imagens no texto ou use os botões abaixo."
                value={form.conteudo}
                onChange={handleChange}
                required
                rows={8}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                  resize: "vertical"
                }}
              />
              
              {/* Botões para inserir imagens no texto */}
              {(selectedImages.length > 0 || imagensAdicionais.length > 0) && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    Clique para inserir imagem na posição do cursor:
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {/* Imagens novas selecionadas */}
                    {Array.from(selectedImages).map((file, index) => (
                      <button
                        key={`new-${index}`}
                        type="button"
                        onClick={() => inserirImagemNoTexto(imagensAdicionais.length + index)}
                        style={{
                          padding: "6px 12px",
                          border: "1px solid #3b82f6",
                          backgroundColor: "#eff6ff",
                          color: "#3b82f6",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                        title={file.name}
                      >
                        🖼️ Nova {imagensAdicionais.length + index + 1}
                      </button>
                    ))}
                    
                    {/* Imagens já existentes */}
                    {imagensAdicionais.map((imagem, index) => (
                      <button
                        key={`existing-${imagem.id}`}
                        type="button"
                        onClick={() => inserirImagemNoTexto(index)}
                        style={{
                          padding: "6px 12px",
                          border: "1px solid #16a34a",
                          backgroundColor: "#f0fdf4",
                          color: "#16a34a",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                        title={imagem.descricao || `Imagem ${index + 1}`}
                      >
                        🖼️ Img {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview do conteúdo */}
            {form.conteudo && (
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                  Preview do Conteúdo
                </label>
                <div style={{
                  padding: "16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  backgroundColor: "#f9fafb",
                  fontSize: 14,
                  lineHeight: "1.6",
                  maxHeight: "400px",
                  overflowY: "auto"
                }}>
                  <div 
                    style={{ color: "#374151" }}
                    dangerouslySetInnerHTML={{
                      __html: processarConteudoComImagens(
                        form.conteudo.replace(/\n/g, '<br>'),
                        [
                          ...imagensAdicionais,
                          ...Array.from(selectedImages).map((file, index) => ({
                            url: URL.createObjectURL(file),
                            descricao: file.name
                          }))
                        ]
                      )
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 24 }}>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8, 
                fontSize: 14,
                color: "#374151",
                cursor: "pointer",
                userSelect: "none"
              }}>
                <input
                  type="checkbox"
                  name="publicado"
                  checked={form.publicado}
                  onChange={handleChange}
                  style={{
                    width: 16,
                    height: 16,
                    cursor: "pointer"
                  }}
                />
                <span>Publicar notícia</span>
              </label>
              
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8, 
                fontSize: 14,
                color: "#374151",
                cursor: "pointer",
                userSelect: "none"
              }}>
                <input
                  type="checkbox"
                  name="destaque"
                  checked={form.destaque}
                  onChange={handleChange}
                  style={{
                    width: 16,
                    height: 16,
                    cursor: "pointer"
                  }}
                />
                <span>Marcar como destaque</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: 14
                }}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: saving ? "#9ca3af" : "#2563eb",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: 14
                }}
              >
                {saving ? "Salvando..." : (form.id ? "Salvar Alterações" : "Criar Notícia")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de notícias */}
      <div style={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f9fafb" }}>
            <tr>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Título
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Status
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Autor
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Data
              </th>
              <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {noticias.map((n, index) => (
              <tr key={n.id} style={{ borderTop: index > 0 ? "1px solid #e5e7eb" : "none" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{n.titulo}</div>
                    <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
                      {n.resumo?.length > 80 ? n.resumo.substring(0, 80) + "..." : n.resumo}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: n.publicado ? "#dcfce7" : "#fee2e2",
                      color: n.publicado ? "#16a34a" : "#dc2626"
                    }}>
                      {n.publicado ? "Publicado" : "Rascunho"}
                    </span>
                    {n.destaque && (
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: "#fef3c7",
                        color: "#d97706"
                      }}>
                        Destaque
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>
                  {n.autor}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>
                  {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button
                      onClick={() => handleEdit(n)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 4,
                        border: "1px solid #d1d5db",
                        background: "#fff",
                        color: "#374151",
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 4,
                        border: "none",
                        background: "#dc2626",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: 12
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {noticias.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280" }}>
                  Nenhuma notícia cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminNoticias;
