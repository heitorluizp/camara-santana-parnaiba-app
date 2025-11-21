import React, { useState, useEffect } from 'react';

const AdminPropostas = () => {
  const [propostas, setPropostas] = useState([]);
  const [vereadores, setVereadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProposta, setEditingProposta] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    ano: new Date().getFullYear(),
    tipo: 'projeto_lei',
    titulo: '',
    resumo: '',
    justificativa: '',
    autor_id: '',
    status: 'protocolado',
    data_protocolo: ''
  });

  useEffect(() => {
    fetchPropostas();
    fetchVereadores();
  }, []);

  const fetchPropostas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/propostas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPropostas(data);
      } else {
        console.error('Erro ao buscar propostas');
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVereadores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const usuarios = await response.json();
        const vereadorList = usuarios.filter(u => u.tipo === 'vereador');
        setVereadores(vereadorList);
      }
    } catch (error) {
      console.error('Erro ao buscar vereadores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingProposta 
        ? `http://localhost:3000/api/admin/propostas/${editingProposta.id}`
        : 'http://localhost:3000/api/admin/propostas';
      
      const method = editingProposta ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingProposta ? 'Proposta atualizada com sucesso!' : 'Proposta criada com sucesso!');
        setShowForm(false);
        setEditingProposta(null);
        resetForm();
        fetchPropostas();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar proposta');
    }
  };

  const handleEdit = (proposta) => {
    setEditingProposta(proposta);
    setFormData({
      numero: proposta.numero,
      ano: proposta.ano,
      tipo: proposta.tipo,
      titulo: proposta.titulo,
      resumo: proposta.resumo || '',
      justificativa: proposta.justificativa || '',
      autor_id: proposta.autor_id,
      status: proposta.status,
      data_protocolo: proposta.data_protocolo ? proposta.data_protocolo.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/propostas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Proposta excluída com sucesso!');
        fetchPropostas();
      } else {
        alert('Erro ao excluir proposta');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao excluir proposta');
    }
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      ano: new Date().getFullYear(),
      tipo: 'projeto_lei',
      titulo: '',
      resumo: '',
      justificativa: '',
      autor_id: '',
      status: 'protocolado',
      data_protocolo: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProposta(null);
    resetForm();
  };

  const getStatusLabel = (status) => {
    const labels = {
      'protocolado': 'Protocolado',
      'comissao': 'Em Comissão',
      'plenario': 'No Plenário',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado'
    };
    return labels[status] || status;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'projeto_lei': 'Projeto de Lei',
      'emenda': 'Emenda',
      'indicacao': 'Indicação',
      'mocao': 'Moção',
      'requerimento': 'Requerimento'
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return <div className="loading">Carregando propostas...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>📝 Gerenciar Propostas</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Nova Proposta
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingProposta ? 'Editar Proposta' : 'Nova Proposta'}</h3>
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label style={{color: '#333'}}>Número:</label>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({...formData, numero: e.target.value})}
                    required
                    placeholder="Ex: 001"
                  />
                </div>
                
                <div className="form-group">
                  <label style={{color: '#333'}}>Ano:</label>
                  <input
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value)})}
                    required
                    min="1990"
                    max="2030"
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
                    <option value="projeto_lei">Projeto de Lei</option>
                    <option value="emenda">Emenda</option>
                    <option value="indicacao">Indicação</option>
                    <option value="mocao">Moção</option>
                    <option value="requerimento">Requerimento</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label style={{color: '#333'}}>Status:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="protocolado">Protocolado</option>
                    <option value="comissao">Em Comissão</option>
                    <option value="plenario">No Plenário</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="rejeitado">Rejeitado</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{color: '#333'}}>Autor (Vereador):</label>
                <select
                  value={formData.autor_id}
                  onChange={(e) => setFormData({...formData, autor_id: e.target.value})}
                  required
                >
                  <option value="">Selecione um vereador</option>
                  {vereadores.map(vereador => (
                    <option key={vereador.id} value={vereador.id}>
                      {vereador.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{color: '#333'}}>Título:</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                  placeholder="Título da proposta"
                />
              </div>

              <div className="form-group">
                <label style={{color: '#333'}}>Resumo:</label>
                <textarea
                  value={formData.resumo}
                  onChange={(e) => setFormData({...formData, resumo: e.target.value})}
                  placeholder="Resumo da proposta"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label style={{color: '#333'}}>Justificativa:</label>
                <textarea
                  value={formData.justificativa}
                  onChange={(e) => setFormData({...formData, justificativa: e.target.value})}
                  placeholder="Justificativa detalhada"
                  rows="5"
                />
              </div>

              <div className="form-group">
                <label style={{color: '#333'}}>Data de Protocolo:</label>
                <input
                  type="date"
                  value={formData.data_protocolo}
                  onChange={(e) => setFormData({...formData, data_protocolo: e.target.value})}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingProposta ? 'Atualizar' : 'Criar'}
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
              <th>Autor</th>
              <th>Status</th>
              <th>Data Protocolo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {propostas.length === 0 ? (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                  Nenhuma proposta cadastrada
                </td>
              </tr>
            ) : (
              propostas.map(proposta => (
                <tr key={proposta.id}>
                  <td>{proposta.numero}/{proposta.ano}</td>
                  <td>{getTipoLabel(proposta.tipo)}</td>
                  <td style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {proposta.titulo}
                  </td>
                  <td>{proposta.autor_nome}</td>
                  <td>
                    <span className={`status-badge status-${proposta.status}`}>
                      {getStatusLabel(proposta.status)}
                    </span>
                  </td>
                  <td>
                    {proposta.data_protocolo ? new Date(proposta.data_protocolo).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEdit(proposta)}
                      className="btn-edit"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(proposta.id)}
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

export default AdminPropostas;
