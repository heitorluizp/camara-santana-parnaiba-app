import React, { useState, useEffect } from 'react';

const AdminOrdemDia = () => {
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSessao, setEditingSessao] = useState(null);
  const [formData, setFormData] = useState({
    data_sessao: '',
    numero_sessao: '',
    tipo_sessao: 'ordinaria',
    hora_inicio: '',
    local: 'Plenário da Câmara Municipal',
    pauta: '',
    ata: '',
    status: 'agendada'
  });

  useEffect(() => {
    fetchSessoes();
  }, []);

  const fetchSessoes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/ordem-dia', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessoes(data);
      } else {
        console.error('Erro ao buscar sessões');
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingSessao 
        ? `http://localhost:3000/api/admin/ordem-dia/${editingSessao.id}`
        : 'http://localhost:3000/api/admin/ordem-dia';
      
      const method = editingSessao ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingSessao ? 'Sessão atualizada com sucesso!' : 'Sessão criada com sucesso!');
        setShowForm(false);
        setEditingSessao(null);
        resetForm();
        fetchSessoes();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar sessão');
    }
  };

  const handleEdit = (sessao) => {
    setEditingSessao(sessao);
    setFormData({
      data_sessao: sessao.data_sessao ? sessao.data_sessao.split('T')[0] : '',
      numero_sessao: sessao.numero_sessao,
      tipo_sessao: sessao.tipo_sessao,
      hora_inicio: sessao.hora_inicio || '',
      local: sessao.local || 'Plenário da Câmara Municipal',
      pauta: sessao.pauta || '',
      ata: sessao.ata || '',
      status: sessao.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta sessão?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/ordem-dia/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Sessão excluída com sucesso!');
        fetchSessoes();
      } else {
        alert('Erro ao excluir sessão');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir sessão');
    }
  };

  const resetForm = () => {
    setFormData({
      data_sessao: '',
      numero_sessao: '',
      tipo_sessao: 'ordinaria',
      hora_inicio: '',
      local: 'Plenário da Câmara Municipal',
      pauta: '',
      ata: '',
      status: 'agendada'
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSessao(null);
    resetForm();
  };

  const getStatusLabel = (status) => {
    const labels = {
      'agendada': 'Agendada',
      'em_andamento': 'Em Andamento',
      'finalizada': 'Finalizada',
      'cancelada': 'Cancelada'
    };
    return labels[status] || status;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'ordinaria': 'Ordinária',
      'extraordinaria': 'Extraordinária',
      'solene': 'Solene'
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return <div className="loading">Carregando sessões...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>📅 Gerenciar Ordem do Dia</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Nova Sessão
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingSessao ? 'Editar Sessão' : 'Nova Sessão'}</h3>
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label style={{color: '#333'}}>Data da Sessão:</label>
                  <input
                    type="date"
                    value={formData.data_sessao}
                    onChange={(e) => setFormData({...formData, data_sessao: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label style={{color: '#333'}}>Número da Sessão:</label>
                  <input
                    type="text"
                    value={formData.numero_sessao}
                    onChange={(e) => setFormData({...formData, numero_sessao: e.target.value})}
                    required
                    placeholder="Ex: 001/2024"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label style={{color: '#333'}}>Tipo:</label>
                  <select
                    value={formData.tipo_sessao}
                    onChange={(e) => setFormData({...formData, tipo_sessao: e.target.value})}
                    required
                  >
                    <option value="ordinaria">Ordinária</option>
                    <option value="extraordinaria">Extraordinária</option>
                    <option value="solene">Solene</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label style={{color: '#333'}}>Status:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="agendada">Agendada</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="finalizada">Finalizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label style={{color: '#333'}}>Hora de Início:</label>
                  <input
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label style={{color: '#333'}}>Local:</label>
                  <input
                    type="text"
                    value={formData.local}
                    onChange={(e) => setFormData({...formData, local: e.target.value})}
                    placeholder="Local da sessão"
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{color: '#333'}}>Pauta:</label>
                <textarea
                  value={formData.pauta}
                  onChange={(e) => setFormData({...formData, pauta: e.target.value})}
                  placeholder="Itens da pauta da sessão"
                  rows="6"
                />
              </div>

              {editingSessao && (
                <div className="form-group">
                  <label style={{color: '#333'}}>Ata:</label>
                  <textarea
                    value={formData.ata}
                    onChange={(e) => setFormData({...formData, ata: e.target.value})}
                    placeholder="Ata da sessão (após realização)"
                    rows="6"
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingSessao ? 'Atualizar' : 'Criar'}
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
              <th>Data</th>
              <th>Número</th>
              <th>Tipo</th>
              <th>Horário</th>
              <th>Local</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sessoes.length === 0 ? (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                  Nenhuma sessão cadastrada
                </td>
              </tr>
            ) : (
              sessoes.map(sessao => (
                <tr key={sessao.id}>
                  <td>
                    {sessao.data_sessao ? new Date(sessao.data_sessao).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td>{sessao.numero_sessao}</td>
                  <td>{getTipoLabel(sessao.tipo_sessao)}</td>
                  <td>{sessao.hora_inicio || '-'}</td>
                  <td style={{maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {sessao.local}
                  </td>
                  <td>
                    <span className={`status-badge status-${sessao.status}`}>
                      {getStatusLabel(sessao.status)}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEdit(sessao)}
                      className="btn-edit"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(sessao.id)}
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

export default AdminOrdemDia;
