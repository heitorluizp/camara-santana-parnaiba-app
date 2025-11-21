import { useEffect, useState } from "react";

const API = "http://localhost:3000/api";

function AdminOrdemDia() {
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    numero_sessao: "",
    data_sessao: "",
    tipo: "ordinaria",
    status: "agendada",
    observacoes: "",
    itens: ""
  });

  const tiposSessao = [
    { value: "ordinaria", label: "Sessão Ordinária" },
    { value: "extraordinaria", label: "Sessão Extraordinária" },
    { value: "solene", label: "Sessão Solene" },
    { value: "especial", label: "Sessão Especial" }
  ];

  const statusOptions = [
    { value: "agendada", label: "Agendada" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "concluida", label: "Concluída" },
    { value: "cancelada", label: "Cancelada" },
    { value: "adiada", label: "Adiada" }
  ];

  useEffect(() => {
    carregarSessoes();
  }, []);

  async function carregarSessoes() {
    try {
      setLoading(true);
      const token = localStorage.getItem('app_token');
      console.log('Carregando sessões... Token:', token ? 'Presente' : 'Ausente');
      
      const response = await fetch(`${API}/admin/ordem-dia`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Sessões carregadas:', data);
        setSessoes(data);
        setError("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na resposta:', response.status, errorData);
        if (response.status === 403) {
          setError('Token expirado. Faça login novamente.');
        } else {
          setError('Erro ao carregar sessões');
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
    if (!form.numero_sessao.trim() || !form.data_sessao) {
      setError('Número da sessão e data são obrigatórios');
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('app_token');
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `${API}/admin/ordem-dia/${form.id}` : `${API}/admin/ordem-dia`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numero_sessao: form.numero_sessao,
          data_sessao: form.data_sessao,
          tipo: form.tipo,
          status: form.status,
          observacoes: form.observacoes,
          itens: form.itens
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          setError('Token expirado. Faça login novamente.');
        } else {
          setError(error.error || 'Erro ao salvar sessão');
        }
        return;
      }

      setSuccess(form.id ? 'Sessão atualizada com sucesso' : 'Sessão criada com sucesso');
      setShowForm(false);
      await carregarSessoes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError('Erro de conexão');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Tem certeza que deseja excluir esta sessão?')) {
      return;
    }

    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/admin/ordem-dia/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setSessoes(sessoes.filter(s => s.id !== id));
        setSuccess('Sessão excluída com sucesso');
        if (form.id === id) {
          setShowForm(false);
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const error = await response.json();
        if (response.status === 403) {
          setError('Token expirado. Faça login novamente.');
        } else {
          setError(error.error || 'Erro ao excluir sessão');
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
      numero_sessao: "",
      data_sessao: "",
      tipo: "ordinaria",
      status: "agendada",
      observacoes: "",
      itens: ""
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function handleEdit(sessao) {
    setForm({
      id: sessao.id,
      numero_sessao: sessao.numero_sessao,
      data_sessao: sessao.data_sessao ? sessao.data_sessao.split('T')[0] : "",
      tipo: sessao.tipo,
      status: sessao.status,
      observacoes: sessao.observacoes || "",
      itens: sessao.itens || ""
    });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function getTipoLabel(tipo) {
    const tipoObj = tiposSessao.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  function getStatusLabel(status) {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  function getStatusColor(status) {
    switch(status) {
      case 'concluida': return { bg: '#f0fdf4', color: '#16a34a' };
      case 'em_andamento': return { bg: '#e0e7ff', color: '#3730a3' };
      case 'agendada': return { bg: '#fef3c7', color: '#d97706' };
      case 'cancelada': return { bg: '#fef2f2', color: '#dc2626' };
      case 'adiada': return { bg: '#f3f4f6', color: '#6b7280' };
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

  if (loading) return <div style={{ padding: 24 }}>Carregando sessões...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          Gerenciar Ordem do Dia
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
          + Nova Sessão
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
            {form.id ? 'Editar Sessão' : 'Nova Sessão'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                  Número da Sessão *
                </label>
                <input
                  name="numero_sessao"
                  placeholder="Ex: 001"
                  value={form.numero_sessao}
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
                  Data da Sessão *
                </label>
                <input
                  name="data_sessao"
                  type="datetime-local"
                  value={form.data_sessao}
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
                  {tiposSessao.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
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
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Itens da Ordem do Dia
              </label>
              <textarea
                name="itens"
                placeholder="Lista de itens que serão tratados na sessão (um por linha)"
                value={form.itens}
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Observações
              </label>
              <textarea
                name="observacoes"
                placeholder="Observações gerais sobre a sessão"
                value={form.observacoes}
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
                {saving ? "Salvando..." : (form.id ? "Salvar Alterações" : "Criar Sessão")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de sessões */}
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
                Número
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Data/Hora
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Tipo
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Status
              </th>
              <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Itens
              </th>
              <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {sessoes.map((sessao, index) => {
              const statusColor = getStatusColor(sessao.status);
              return (
                <tr key={sessao.id} style={{ borderTop: index > 0 ? "1px solid #e5e7eb" : "none" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {sessao.numero_sessao}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                    {sessao.data_sessao ? new Date(sessao.data_sessao).toLocaleString('pt-BR') : '-'}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                    {getTipoLabel(sessao.tipo)}
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
                      {getStatusLabel(sessao.status)}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, color: "#6b7280", maxWidth: "200px" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sessao.itens ? `${sessao.itens.split('\n').length} itens` : '-'}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button
                        onClick={() => handleEdit(sessao)}
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
                        onClick={() => handleDelete(sessao.id)}
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
            {sessoes.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "24px 16px", textAlign: "center", color: "#6b7280" }}>
                  Nenhuma sessão cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrdemDia;
