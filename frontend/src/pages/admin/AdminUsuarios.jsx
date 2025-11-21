import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API = "http://localhost:3000/api";

function AdminUsuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    nome: "",
    email: "",
    telefone: "",
    tipo: "cidadao",
    senha: "123456", // senha padrão
    foto_url: "",
    // Campos específicos de vereador
    descricao: "",
    mandato_inicio: "",
    mandato_fim: "",
    partido: "",
    dados_publicos: "",
    contato_publico: "",
    gabinete: "",
    comissoes: ""
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const tiposUsuario = [
    { value: "cidadao", label: "Cidadão" },
    { value: "vereador", label: "Vereador" },
    { value: "admin", label: "Administrador" }
  ];

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      setLoading(true);
      const token = localStorage.getItem('app_token');
      console.log('Carregando usuários... Token:', token ? 'Presente' : 'Ausente');
      
      const response = await fetch(`${API}/admin/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Usuários carregados:', data);
        setUsuarios(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na resposta:', response.status, errorData);
        setError('Erro ao carregar usuários');
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      // Validar tamanho (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setError('A foto deve ter no máximo 2MB');
        return;
      }
      
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Arquivo deve ser uma imagem');
        return;
      }
      
      setFotoFile(file);
      setError('');
    }
  }

  async function uploadFoto(usuarioId) {
    if (!fotoFile) return null;

    setUploadingFoto(true);
    try {
      const token = localStorage.getItem('app_token');
      const formData = new FormData();
      formData.append('foto', fotoFile);

      const response = await fetch(`${API}/admin/usuarios/${usuarioId}/foto`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        return result.foto_url;
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro no upload da foto');
      }
    } catch (err) {
      throw err;
    } finally {
      setUploadingFoto(false);
    }
  }

  async function salvarDadosVereador(usuarioId) {
    if (form.tipo !== 'vereador') return;

    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/admin/usuarios/${usuarioId}/vereador`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          descricao: form.descricao,
          mandato_inicio: form.mandato_inicio || null,
          mandato_fim: form.mandato_fim || null,
          partido: form.partido,
          dados_publicos: form.dados_publicos,
          contato_publico: form.contato_publico,
          gabinete: form.gabinete,
          comissoes: form.comissoes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar dados do vereador');
      }
    } catch (err) {
      throw err;
    }
  }

  function handleNovo() {
    setForm({
      id: null,
      nome: "",
      email: "",
      telefone: "",
      tipo: "cidadao",
      senha: "123456",
      foto_url: "",
      // Campos específicos de vereador
      descricao: "",
      mandato_inicio: "",
      mandato_fim: "",
      partido: "",
      dados_publicos: "",
      contato_publico: "",
      gabinete: "",
      comissoes: ""
    });
    setFotoFile(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function handleEdit(usuario) {
    try {
      // Buscar dados completos do usuário
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/admin/usuarios/${usuario.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const dadosCompletos = await response.json();
        
        setForm({
          id: dadosCompletos.id,
          nome: dadosCompletos.nome,
          email: dadosCompletos.email,
          telefone: dadosCompletos.telefone || "",
          tipo: dadosCompletos.tipo,
          senha: "123456", // manter senha padrão na edição
          foto_url: dadosCompletos.foto_url || "",
          // Campos específicos de vereador
          descricao: dadosCompletos.dadosVereador?.descricao || "",
          mandato_inicio: dadosCompletos.dadosVereador?.mandato_inicio || "",
          mandato_fim: dadosCompletos.dadosVereador?.mandato_fim || "",
          partido: dadosCompletos.dadosVereador?.partido || "",
          dados_publicos: dadosCompletos.dadosVereador?.dados_publicos || "",
          contato_publico: dadosCompletos.dadosVereador?.contato_publico || "",
          gabinete: dadosCompletos.dadosVereador?.gabinete || "",
          comissoes: dadosCompletos.dadosVereador?.comissoes || ""
        });
        setFotoFile(null);
      } else {
        setError('Erro ao carregar dados do usuário');
        return;
      }
    } catch (err) {
      setError('Erro de conexão');
      return;
    }
    
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  async function handleDelete(id) {
    if (id === user?.id) {
      setError('Você não pode excluir seu próprio usuário');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setUsuarios(usuarios.filter(u => u.id !== id));
        setSuccess('Usuário excluído com sucesso');
        if (form.id === id) {
          setShowForm(false);
        }
      } else {
        const error = await response.json();
        setError(error.error || 'Erro ao excluir usuário');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim()) {
      setError('Nome e email são obrigatórios');
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('app_token');
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `${API}/admin/usuarios/${form.id}` : `${API}/admin/usuarios`;
      
      // 1. Primeiro salvar/atualizar o usuário básico
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          telefone: form.telefone,
          tipo: form.tipo,
          senha: form.senha
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        setError(error.error || 'Erro ao salvar usuário');
        return;
      }

      const result = await response.json();
      const usuarioId = form.id || result.id;

      // 2. Se houver foto para upload, fazer upload
      if (fotoFile) {
        try {
          await uploadFoto(usuarioId);
        } catch (err) {
          setError(`Usuário salvo, mas erro no upload da foto: ${err.message}`);
          setSaving(false);
          return;
        }
      }

      // 3. Se for vereador, salvar dados específicos
      if (form.tipo === 'vereador') {
        try {
          await salvarDadosVereador(usuarioId);
        } catch (err) {
          setError(`Usuário salvo, mas erro nos dados do vereador: ${err.message}`);
          setSaving(false);
          return;
        }
      }

      setSuccess(form.id ? 'Usuário atualizado com sucesso' : 'Usuário criado com sucesso');
      setShowForm(false);
      await carregarUsuarios();
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function getTipoLabel(tipo) {
    const tipoObj = tiposUsuario.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  function getTipoColor(tipo) {
    switch(tipo) {
      case 'admin': return { bg: '#fef3c7', color: '#d97706' };
      case 'vereador': return { bg: '#e0e7ff', color: '#3730a3' };
      case 'cidadao': return { bg: '#f0fdf4', color: '#16a34a' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Carregando usuários...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          Gerenciar Usuários
        </h2>
        <button
          onClick={handleNovo}
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
          + Novo Usuário
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
              {form.id ? "Editar Usuário" : "Novo Usuário"}
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
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Nome Completo *
                </label>
                <input
                  name="nome"
                  placeholder="Nome completo do usuário"
                  value={form.nome}
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
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
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
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Telefone
                </label>
                <input
                  name="telefone"
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={handleChange}
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
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Tipo de Usuário *
                </label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    backgroundColor: "#fff"
                  }}
                >
                  {tiposUsuario.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Senha Padrão
                </label>
                <input
                  name="senha"
                  type="password"
                  value={form.senha}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    backgroundColor: "#f9fafb"
                  }}
                />
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  Padrão: 123456
                </div>
              </div>
            </div>

            {/* Upload de foto de perfil */}
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                📷 Foto de Perfil
              </label>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {form.foto_url && (
                  <div style={{ position: "relative" }}>
                    <img 
                      src={form.foto_url} 
                      alt="Foto atual" 
                      style={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: "50%", 
                        objectFit: "cover",
                        border: "3px solid #e5e7eb",
                        backgroundColor: "#f3f4f6"
                      }} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div style={{ 
                      fontSize: 11, 
                      color: "#16a34a", 
                      textAlign: "center", 
                      marginTop: 4,
                      fontWeight: 500
                    }}>
                      Foto atual
                    </div>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 6,
                      border: "2px dashed #d1d5db",
                      fontSize: 14,
                      backgroundColor: "#fff",
                      cursor: "pointer"
                    }}
                  />
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                    📎 Máximo 2MB • Formatos: JPG, PNG, GIF
                    {fotoFile && (
                      <div style={{ color: "#16a34a", marginTop: 2 }}>
                        ✅ Arquivo selecionado: {fotoFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Campos específicos de vereador */}
            {form.tipo === 'vereador' && (
              <>
                <div style={{ 
                  borderTop: "1px solid #e5e7eb", 
                  marginTop: 20, 
                  paddingTop: 20,
                  marginBottom: 10
                }}>
                  <h4 style={{ margin: 0, fontSize: 16, color: "#374151", marginBottom: 16 }}>
                    📋 Dados Específicos do Vereador
                  </h4>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                      Descrição/Biografia
                    </label>
                    <textarea
                      name="descricao"
                      placeholder="Breve descrição ou biografia do vereador"
                      value={form.descricao}
                      onChange={handleChange}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                        fontSize: 14,
                        resize: "vertical",
                        fontFamily: "inherit"
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                      Partido
                    </label>
                    <input
                      name="partido"
                      placeholder="Ex: PSDB, PT, MDB..."
                      value={form.partido}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                        fontSize: 14
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                      Gabinete
                    </label>
                    <input
                      name="gabinete"
                      placeholder="Ex: Gabinete 15"
                      value={form.gabinete}
                      onChange={handleChange}
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
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                      Mandato Início
                    </label>
                    <input
                      name="mandato_inicio"
                      type="date"
                      value={form.mandato_inicio}
                      onChange={handleChange}
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
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                      Mandato Fim
                    </label>
                    <input
                      name="mandato_fim"
                      type="date"
                      value={form.mandato_fim}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                        fontSize: 14
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                      Contato Público
                    </label>
                    <input
                      name="contato_publico"
                      placeholder="Email ou telefone público"
                      value={form.contato_publico}
                      onChange={handleChange}
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
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                      Comissões
                    </label>
                    <input
                      name="comissoes"
                      placeholder="Ex: Educação, Saúde..."
                      value={form.comissoes}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                        fontSize: 14
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                    Dados Públicos do Mandato
                  </label>
                  <textarea
                    name="dados_publicos"
                    placeholder="Informações detalhadas sobre o mandato, projetos, histórico político..."
                    value={form.dados_publicos}
                    onChange={handleChange}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 6,
                      border: "1px solid #d1d5db",
                      fontSize: 14,
                      resize: "vertical",
                      fontFamily: "inherit"
                    }}
                  />
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    Essas informações aparecerão na página pública do vereador
                  </div>
                </div>
              </>
            )}

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
                {saving ? "Salvando..." : (form.id ? "Salvar Alterações" : "Criar Usuário")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuários */}
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
                Nome
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Email
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Telefone
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Tipo
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Data de Cadastro
              </th>
              <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario, index) => {
              const tipoColor = getTipoColor(usuario.tipo);
              return (
                <tr key={usuario.id} style={{ borderTop: index > 0 ? "1px solid #e5e7eb" : "none" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {usuario.nome}
                      {usuario.id === user?.id && (
                        <span style={{ 
                          fontSize: 12, 
                          color: "#3b82f6", 
                          marginLeft: 8,
                          fontWeight: 400 
                        }}>
                          (Você)
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                    {usuario.email}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>
                    {usuario.telefone || "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: tipoColor.bg,
                      color: tipoColor.color
                    }}>
                      {getTipoLabel(usuario.tipo)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>
                    {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button
                        onClick={() => handleEdit(usuario)}
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
                      {usuario.id !== user?.id && (
                        <button
                          onClick={() => handleDelete(usuario.id)}
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
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280" }}>
                  Nenhum usuário cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsuarios;
