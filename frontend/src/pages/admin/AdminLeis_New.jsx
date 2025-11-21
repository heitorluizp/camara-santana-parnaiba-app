import { useEffect, useState } from "react";

const AdminLeis = () => {
  const [leis, setLeis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLei, setEditingLei] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    ano: new Date().getFullYear(),
    tipo: 'lei_ordinaria',
    titulo: '',
    ementa: '',
    texto_completo: '',
    status: 'tramitacao',
    data_publicacao: ''
  });

  useEffect(() => {
    fetchLeis();
  }, []);

  const fetchLeis = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('app_token');
      
      const response = await fetch('http://localhost:3000/api/admin/leis', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeis(data);
        setError("");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError('Erro ao carregar leis');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError("");
      
      const token = localStorage.getItem('app_token');
      const url = editingLei 
        ? `http://localhost:3000/api/admin/leis/${editingLei.id}`
        : 'http://localhost:3000/api/admin/leis';
      
      const method = editingLei ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(editingLei ? 'Lei atualizada com sucesso!' : 'Lei criada com sucesso!');
        setShowForm(false);
        setEditingLei(null);
        resetForm();
        fetchLeis();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro desconhecido');
      }
    } catch (error) {
      setError('Erro ao salvar lei');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lei) => {
    setEditingLei(lei);
    setFormData({
      numero: lei.numero,
      ano: lei.ano,
      tipo: lei.tipo,
      titulo: lei.titulo,
      ementa: lei.ementa || '',
      texto_completo: lei.texto_completo || '',
      status: lei.status,
      data_publicacao: lei.data_publicacao ? lei.data_publicacao.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta lei?')) return;

    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`http://localhost:3000/api/admin/leis/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccess('Lei excluída com sucesso!');
        fetchLeis();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError('Erro ao excluir lei');
      }
    } catch (error) {
      setError('Erro ao excluir lei');
    }
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      ano: new Date().getFullYear(),
      tipo: 'lei_ordinaria',
      titulo: '',
      ementa: '',
      texto_completo: '',
      status: 'tramitacao',
      data_publicacao: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLei(null);
    resetForm();
  };

  const getStatusLabel = (status) => {
    const labels = {
      'tramitacao': 'Em Tramitação',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'sancionado': 'Sancionado'
    };
    return labels[status] || status;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'lei_ordinaria': 'Lei Ordinária',
      'lei_complementar': 'Lei Complementar',
      'decreto': 'Decreto',
      'resolucao': 'Resolução'
    };
    return labels[tipo] || tipo;
  };

  const getStatusColor = (status) => {
    const colors = {
      'tramitacao': { bg: '#fef3c7', color: '#d97706' },
      'aprovado': { bg: '#dcfce7', color: '#16a34a' },
      'rejeitado': { bg: '#fee2e2', color: '#dc2626' },
      'sancionado': { bg: '#dbeafe', color: '#2563eb' }
    };
    return colors[status] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "400px",
        color: "#e5e7eb" 
      }}>
        Carregando leis...
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "20px" 
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px"
      }}>
        <div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#f9fafb",
            margin: 0
          }}>
            📚 Leis Municipais
          </h1>
          <p style={{
            fontSize: 14,
            color: "#9ca3af",
            margin: "4px 0 0 0"
          }}>
            Gerencie as leis e decretos do município
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
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
          ➕ Nova Lei
        </button>
      </div>

      {/* Mensagens */}
      {error && (
        <div style={{
          padding: "12px 16px",
          marginBottom: "16px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 6,
          color: "#dc2626",
          fontSize: 14
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: "12px 16px",
          marginBottom: "16px",
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: 6,
          color: "#0369a1",
          fontSize: 14
        }}>
          {success}
        </div>
      )}

      {/* Modal do Formulário */}
      {showForm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 8,
            padding: "24px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <h2 style={{
              margin: "0 0 20px 0",
              fontSize: 20,
              fontWeight: 600,
              color: "#111827"
            }}>
              {editingLei ? '✏️ Editar Lei' : '➕ Nova Lei'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "6px"
                  }}>
                    Número *
                  </label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({...formData, numero: e.target.value})}
                    required
                    placeholder="Ex: 001"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "6px"
                  }}>
                    Ano *
                  </label>
                  <input
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value)})}
                    required
                    min="1990"
                    max="2030"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "6px"
                  }}>
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="lei_ordinaria">Lei Ordinária</option>
                    <option value="lei_complementar">Lei Complementar</option>
                    <option value="decreto">Decreto</option>
                    <option value="resolucao">Resolução</option>
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "6px"
                  }}>
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: 14,
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="tramitacao">Em Tramitação</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="rejeitado">Rejeitado</option>
                    <option value="sancionado">Sancionado</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "6px"
                }}>
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                  placeholder="Título da lei"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "6px"
                }}>
                  Ementa
                </label>
                <textarea
                  value={formData.ementa}
                  onChange={(e) => setFormData({...formData, ementa: e.target.value})}
                  placeholder="Resumo do que trata a lei"
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: "border-box",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "6px"
                }}>
                  Texto Completo
                </label>
                <textarea
                  value={formData.texto_completo}
                  onChange={(e) => setFormData({...formData, texto_completo: e.target.value})}
                  placeholder="Texto completo da lei"
                  rows="8"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: "border-box",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "6px"
                }}>
                  Data de Publicação
                </label>
                <input
                  type="date"
                  value={formData.data_publicacao}
                  onChange={(e) => setFormData({...formData, data_publicacao: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: "border-box"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleCancel}
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
                  {saving ? "Salvando..." : (editingLei ? "Atualizar" : "Criar")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabela de Leis */}
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
            {leis.length === 0 ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#6b7280'}}>
                  Nenhuma lei cadastrada ainda.
                </td>
              </tr>
            ) : (
              leis.map((lei, index) => {
                const statusColor = getStatusColor(lei.status);
                return (
                  <tr key={lei.id} style={{ borderTop: index > 0 ? "1px solid #e5e7eb" : "none" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 14 }}>
                      {lei.numero}/{lei.ano}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151" }}>
                      {getTipoLabel(lei.tipo)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 14, color: "#374151", maxWidth: "300px" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lei.titulo}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "4px 8px",
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLeis;
