import { useEffect, useState } from "react";

const API = "http://localhost:3000/api";

function AdminLeis() {
  const [leis, setLeis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    numero: "",
    ano: new Date().getFullYear(),
    tipo: "lei_ordinaria",
    titulo: "",
    ementa: "",
    texto_completo: "",
    status: "tramitacao",
    data_publicacao: ""
  });

  const tiposLei = [
    { value: "lei_ordinaria", label: "Lei Ordinária" },
    { value: "lei_complementar", label: "Lei Complementar" },
    { value: "decreto", label: "Decreto" },
    { value: "emenda", label: "Emenda" },
    { value: "resolucao", label: "Resolução" }
  ];

  const statusOptions = [
    { value: "tramitacao", label: "Em Tramitação" },
    { value: "aprovado", label: "Aprovado" },
    { value: "rejeitado", label: "Rejeitado" },
    { value: "sancionado", label: "Sancionado" },
    { value: "vetado", label: "Vetado" }
  ];

  useEffect(() => {
    carregarLeis();
  }, []);

  async function carregarLeis() {
    try {
      setLoading(true);
      const token = localStorage.getItem('app_token');
      console.log('Carregando leis... Token:', token ? 'Presente' : 'Ausente');
      
      const response = await fetch(`${API}/admin/leis`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Leis carregadas:', data);
        setLeis(data);
        setError("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na resposta:', response.status, errorData);
        if (response.status === 403) {
          setError('Token expirado. Faça login novamente.');
        } else {
          setError('Erro ao carregar leis');
        }
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.numero.trim() || !form.titulo.trim()) {
      setError('Número e título são obrigatórios');
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('app_token');
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `${API}/admin/leis/${form.id}` : `${API}/admin/leis`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numero: form.numero,
          ano: form.ano,
          tipo: form.tipo,
          titulo: form.titulo,
          ementa: form.ementa,
          texto_completo: form.texto_completo,
          status: form.status,
          data_publicacao: form.data_publicacao
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          setError('Token expirado. Faça login novamente.');
        } else {
          setError(error.error || 'Erro ao salvar lei');
        }
        return;
      }

      setSuccess(form.id ? 'Lei atualizada com sucesso' : 'Lei criada com sucesso');
      setShowForm(false);
      await carregarLeis();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Tem certeza que deseja excluir esta lei?')) {
      return;
    }

    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/admin/leis/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setLeis(leis.filter(l => l.id !== id));
        setSuccess('Lei excluída com sucesso');
        if (form.id === id) {
          setShowForm(false);
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const error = await response.json();
        if (response.status === 403) {
          setError('Token expirado. Faça login novamente.');
        } else {
          setError(error.error || 'Erro ao excluir lei');
        }
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    }
  }

  function handleNovo() {
    setForm({
      id: null,
      numero: "",
      ano: new Date().getFullYear(),
      tipo: "lei_ordinaria",
      titulo: "",
      ementa: "",
      texto_completo: "",
      status: "tramitacao",
      data_publicacao: ""
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function handleEdit(lei) {
    setForm({
      id: lei.id,
      numero: lei.numero,
      ano: lei.ano,
      tipo: lei.tipo,
      titulo: lei.titulo,
      ementa: lei.ementa || "",
      texto_completo: lei.texto_completo || "",
      status: lei.status,
      data_publicacao: lei.data_publicacao ? lei.data_publicacao.split('T')[0] : ""
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function getTipoLabel(tipo) {
    const tipoObj = tiposLei.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  function getStatusLabel(status) {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  function getStatusColor(status) {
    switch(status) {
      case 'sancionado': return { bg: '#f0fdf4', color: '#16a34a' };
      case 'aprovado': return { bg: '#e0e7ff', color: '#3730a3' };
      case 'tramitacao': return { bg: '#fef3c7', color: '#d97706' };
      case 'rejeitado': return { bg: '#fef2f2', color: '#dc2626' };
      case 'vetado': return { bg: '#fef2f2', color: '#dc2626' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  if (loading) return <div style={{ padding: 24 }}>Carregando leis...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          Gerenciar Leis
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
          + Nova Lei
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
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: "#111827" }}>
            {form.id ? 'Editar Lei' : 'Nova Lei'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Número *
                </label>
                <input
                  name="numero"
                  placeholder="Ex: 001"
                  value={form.numero}
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
                  Ano *
                </label>
                <input
                  name="ano"
                  type="number"
                  min="1990"
                  max="2030"
                  value={form.ano}
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
                  Tipo *
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
                  {tiposLei.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    backgroundColor: "#fff"
                  }}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Data de Publicação
                </label>
                <input
                  name="data_publicacao"
                  type="date"
                  value={form.data_publicacao}
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Título *
              </label>
              <input
                name="titulo"
                placeholder="Título da lei"
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Ementa
              </label>
              <textarea
                name="ementa"
                placeholder="Resumo do que trata a lei"
                value={form.ementa}
                onChange={handleChange}
                rows="3"
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Texto Completo
              </label>
              <textarea
                name="texto_completo"
                placeholder="Texto completo da lei"
                value={form.texto_completo}
                onChange={handleChange}
                rows="6"
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
                {saving ? "Salvando..." : (form.id ? "Salvar Alterações" : "Criar Lei")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de leis */}
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
                Número/Ano
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Tipo
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Título
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Status
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Data Publicação
              </th>
              <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {leis.map((lei, index) => {
              const statusColor = getStatusColor(lei.status);
              return (
                <tr key={lei.id} style={{ borderTop: index > 0 ? "1px solid #e5e7eb" : "none" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {lei.numero}/{lei.ano}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                    {getTipoLabel(lei.tipo)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151", maxWidth: "200px" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lei.titulo}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: statusColor.bg,
                      color: statusColor.color
                    }}>
                      {getStatusLabel(lei.status)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280" }}>
                    {lei.data_publicacao ? new Date(lei.data_publicacao).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button
                        onClick={() => handleEdit(lei)}
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
                        onClick={() => handleDelete(lei.id)}
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
              );
            })}
            {leis.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280" }}>
                  Nenhuma lei cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminLeis;
