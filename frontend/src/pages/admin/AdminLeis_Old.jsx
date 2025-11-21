import { useEffect, useState } from "react";

const API = "http://localhost:3000/api";

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

  const tiposLei = [
    { value: 'lei_ordinaria', label: 'Lei Ordinária' },
    { value: 'lei_complementar', label: 'Lei Complementar' },
    { value: 'decreto', label: 'Decreto' },
    { value: 'emenda', label: 'Emenda' },
    { value: 'resolucao', label: 'Resolução' }
  ];

  const statusOptions = [
    { value: 'tramitacao', label: 'Em Tramitação' },
    { value: 'aprovado', label: 'Aprovado' },
    { value: 'rejeitado', label: 'Rejeitado' },
    { value: 'sancionado', label: 'Sancionado' },
    { value: 'vetado', label: 'Vetado' }
  ];

  useEffect(() => {
    fetchLeis();
  }, []);

  const fetchLeis = async () => {
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

      console.log('Response status:', response.status);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.numero.trim() || !formData.titulo.trim()) {
      setError('Número e título são obrigatórios');
      return;
    }
    
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      const token = localStorage.getItem('app_token');
      const url = editingLei 
        ? `${API}/admin/leis/${editingLei.id}`
        : `${API}/admin/leis`;
      
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
        if (response.status === 403) {
          setError('Token expirado. Faça login novamente.');
        } else {
          setError(errorData.error || 'Erro desconhecido');
        }
      }
    } catch (error) {
      console.error('Erro:', error);
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
        setSuccess('Lei excluída com sucesso!');
        fetchLeis();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          setError('Token expirado. Faça login novamente.');
        } else {
          setError(errorData.error || 'Erro ao excluir lei');
        }
      }
    } catch (error) {
      console.error('Erro:', error);
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

  const handleNovo = () => {
    resetForm();
    setEditingLei(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLei(null);
    resetForm();
    setError("");
    setSuccess("");
  };

  const getTipoLabel = (tipo) => {
    const tipoObj = tiposLei.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  const getStatusLabel = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'sancionado': return { bg: '#f0fdf4', color: '#16a34a' };
      case 'aprovado': return { bg: '#e0e7ff', color: '#3730a3' };
      case 'tramitacao': return { bg: '#fef3c7', color: '#d97706' };
      case 'rejeitado': return { bg: '#fef2f2', color: '#dc2626' };
      case 'vetado': return { bg: '#fef2f2', color: '#dc2626' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



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
          <h3 style={{ 
            fontSize: 18, 
            fontWeight: 600, 
            marginBottom: 20, 
            color: "#111827" 
          }}>
            {editingLei ? 'Editar Lei' : 'Nova Lei'}
          </h3>
            
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

              <div className="form-row">
                <div className="form-group">
                  <label style={{color: '#333'}}>Tipo:</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    required
                  >
                    <option value="lei_ordinaria">Lei Ordinária</option>
                    <option value="lei_complementar">Lei Complementar</option>
                    <option value="decreto">Decreto</option>
                    <option value="resolucao">Resolução</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label style={{color: '#333'}}>Status:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="tramitacao">Em Tramitação</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="rejeitado">Rejeitado</option>
                    <option value="sancionado">Sancionado</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{color: '#333'}}>Título:</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                  placeholder="Título da lei"
                />
              </div>

              <div className="form-group">
                <label style={{color: '#333'}}>Ementa:</label>
                <textarea
                  value={formData.ementa}
                  onChange={(e) => setFormData({...formData, ementa: e.target.value})}
                  placeholder="Resumo do que trata a lei"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label style={{color: '#333'}}>Texto Completo:</label>
                <textarea
                  value={formData.texto_completo}
                  onChange={(e) => setFormData({...formData, texto_completo: e.target.value})}
                  placeholder="Texto completo da lei"
                  rows="8"
                />
              </div>

              <div className="form-group">
                <label style={{color: '#333'}}>Data de Publicação:</label>
                <input
                  type="date"
                  value={formData.data_publicacao}
                  onChange={(e) => setFormData({...formData, data_publicacao: e.target.value})}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingLei ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Número/Ano</th>
              <th>Tipo</th>
              <th>Título</th>
              <th>Status</th>
              <th>Data Publicação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {leis.length === 0 ? (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                  Nenhuma lei cadastrada
                </td>
              </tr>
            ) : (
              leis.map(lei => (
                <tr key={lei.id}>
                  <td>{lei.numero}/{lei.ano}</td>
                  <td>{getTipoLabel(lei.tipo)}</td>
                  <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {lei.titulo}
                  </td>
                  <td>
                    <span className={`status-badge status-${lei.status}`}>
                      {getStatusLabel(lei.status)}
                    </span>
                  </td>
                  <td>
                    {lei.data_publicacao ? new Date(lei.data_publicacao).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEdit(lei)}
                      className="btn-edit"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(lei.id)}
                      className="btn-delete"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLeis;
