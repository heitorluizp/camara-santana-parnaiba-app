import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:3000/api";

function Chat() {
  const { user } = useAuth();
  const { id: conversaId } = useParams();
  const location = useLocation();
  const [conversas, setConversas] = useState([]);
  const [vereadores, setVereadores] = useState([]);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [showNovaConversa, setShowNovaConversa] = useState(false);
  const [novaConversa, setNovaConversa] = useState({
    vereadorId: "",
    titulo: "",
    mensagem: ""
  });

  useEffect(() => {
    if (user) {
      carregarConversas();
      if (user.tipo === 'cidadao') {
        carregarVereadores();
      }
    }
  }, [user]);

  // Efeito para lidar com navegação direta para conversa específica
  useEffect(() => {
    if (conversaId && conversas.length > 0) {
      const conversa = conversas.find(c => c.id === parseInt(conversaId));
      if (conversa) {
        setConversaAtiva(conversa);
      }
    }
  }, [conversaId, conversas]);

  // Efeito para lidar com vereador pré-selecionado (vindo de VereadorDetalhe)
  useEffect(() => {
    if (location.state?.novaConversa && location.state?.vereadorSelecionado) {
      const vereadorSelecionado = location.state.vereadorSelecionado;
      setNovaConversa(prev => ({
        ...prev,
        vereadorId: vereadorSelecionado.id.toString(),
        titulo: `Conversa com ${vereadorSelecionado.nome}`
      }));
      setShowNovaConversa(true);
    }
  }, [location.state]);

  // Função para fechar modal de nova conversa
  const fecharModalNovaConversa = () => {
    setShowNovaConversa(false);
    setNovaConversa({ vereadorId: "", titulo: "", mensagem: "" });
  };

  async function carregarConversas() {
    try {
      const token = localStorage.getItem('app_token');
      console.log('🔑 Token disponível:', !!token);
      console.log('👤 Usuário logado:', user);
      
      const response = await fetch(`${API}/conversas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('💬 Conversas carregadas:', data);
        setConversas(data);
      } else {
        const error = await response.text();
        console.error('❌ Erro na resposta:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarVereadores() {
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/vereadores-chat`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVereadores(data);
      }
    } catch (error) {
      console.error('Erro ao carregar vereadores:', error);
    }
  }

  async function iniciarNovaConversa() {
    if (!novaConversa.vereadorId || !novaConversa.titulo || !novaConversa.mensagem) {
      alert('Preencha todos os campos');
      return;
    }

    // Verificar se já existe conversa antes de tentar criar
    const conversaExistente = conversas.find(c => 
      c.vereador_id === parseInt(novaConversa.vereadorId)
    );
    
    if (conversaExistente) {
      // Se já existe, fechar modal e ir para a conversa
      fecharModalNovaConversa();
      setConversaAtiva(conversaExistente);
      return;
    }

    try {
      setEnviando(true);
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/conversas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novaConversa)
      });
      
      if (response.ok) {
        const result = await response.json();
        fecharModalNovaConversa();
        await carregarConversas();
        
        // Tentar ativar a nova conversa criada
        setTimeout(() => {
          const novaConversaCriada = conversas.find(c => c.id === result.id);
          if (novaConversaCriada) {
            setConversaAtiva(novaConversaCriada);
          }
        }, 500);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao iniciar conversa');
      }
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      alert('Erro de conexão');
    } finally {
      setEnviando(false);
    }
  }

  async function enviarMensagem() {
    if (!novaMensagem.trim() || !conversaAtiva) return;

    try {
      setEnviando(true);
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/conversas/${conversaAtiva.id}/mensagens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mensagem: novaMensagem })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Atualizar conversa ativa
        setConversaAtiva(prev => ({
          ...prev,
          mensagens: [...prev.mensagens, data.mensagem]
        }));
        
        setNovaMensagem("");
        await carregarConversas();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro de conexão');
    } finally {
      setEnviando(false);
    }
  }

  async function abrirConversa(conversa) {
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API}/conversas/${conversa.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversaAtiva(data);
      }
    } catch (error) {
      console.error('Erro ao abrir conversa:', error);
    }
  }

  function formatarData(dataString) {
    const data = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    if (data.toDateString() === hoje.toDateString()) {
      return `Hoje ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (data.toDateString() === ontem.toDateString()) {
      return `Ontem ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return data.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }

  if (!user) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>Faça login para acessar o chat</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>Carregando conversas...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
      height: 'calc(100vh - 120px)', 
      backgroundColor: '#f9fafb',
      overflow: 'hidden'
    }}>
      {/* Lista de Conversas */}
      <div style={{ 
        width: window.innerWidth <= 768 ? '100%' : '350px',
        height: window.innerWidth <= 768 ? (conversaAtiva ? '0px' : '100%') : '100%',
        display: window.innerWidth <= 768 && conversaAtiva ? 'none' : 'flex',
        borderRight: window.innerWidth > 768 ? '1px solid #e5e7eb' : 'none',
        backgroundColor: '#fff',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            {user.tipo === 'vereador' ? 'Mensagens Recebidas' : 'Minhas Conversas'}
          </h3>
          {user.tipo === 'cidadao' && (
            <button
              onClick={() => setShowNovaConversa(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              + Nova
            </button>
          )}
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {conversas.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
              {user.tipo === 'vereador' 
                ? 'Nenhuma mensagem recebida ainda' 
                : 'Nenhuma conversa iniciada ainda'
              }
            </div>
          ) : (
            conversas.map(conversa => (
              <div
                key={conversa.id}
                onClick={() => abrirConversa(conversa)}
                style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  backgroundColor: conversaAtiva?.id === conversa.id ? '#eff6ff' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (conversaAtiva?.id !== conversa.id) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (conversaAtiva?.id !== conversa.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#6b7280'
                  }}>
                    {user.tipo === 'vereador' 
                      ? (conversa.cidadao_nome?.charAt(0) || 'C')
                      : (conversa.vereador_nome?.charAt(0) || 'V')
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.tipo === 'vereador' ? conversa.cidadao_nome : conversa.vereador_nome}
                      {user.tipo === 'cidadao' && conversa.partido && (
                        <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>
                          ({conversa.partido})
                        </span>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conversa.titulo}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                      {formatarData(conversa.ultima_mensagem_data)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área da Conversa */}
      <div style={{ 
        flex: 1, 
        display: window.innerWidth <= 768 && !conversaAtiva ? 'none' : 'flex', 
        flexDirection: 'column',
        width: window.innerWidth <= 768 ? '100%' : 'auto'
      }}>
        {conversaAtiva ? (
          <>
            {/* Header da Conversa */}
            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              {/* Botão Voltar para Mobile */}
              {window.innerWidth <= 768 && (
                <button
                  onClick={() => setConversaAtiva(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 20,
                    cursor: 'pointer',
                    padding: '4px 8px',
                    marginRight: 8,
                    color: '#2563eb',
                    fontWeight: 'bold'
                  }}
                >
                  ←
                </button>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#6b7280'
                }}>
                  {user.tipo === 'vereador' 
                    ? (conversaAtiva.cidadao_nome?.charAt(0) || 'C')
                    : (conversaAtiva.vereador_nome?.charAt(0) || 'V')
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {user.tipo === 'vereador' ? conversaAtiva.cidadao_nome : conversaAtiva.vereador_nome}
                  </div>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    {conversaAtiva.titulo}
                  </div>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '20px',
              backgroundColor: '#f9fafb'
            }}>
              {conversaAtiva.mensagens.map(mensagem => (
                <div
                  key={mensagem.id}
                  style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: mensagem.remetente_id === user.id ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: 16,
                    backgroundColor: mensagem.remetente_id === user.id ? '#2563eb' : '#fff',
                    color: mensagem.remetente_id === user.id ? '#fff' : '#374151',
                    border: mensagem.remetente_id === user.id ? 'none' : '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: 14, lineHeight: '1.5' }}>
                      {mensagem.mensagem}
                    </div>
                    <div style={{ 
                      fontSize: 11, 
                      marginTop: 4,
                      opacity: 0.7
                    }}>
                      {formatarData(mensagem.data)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input de Mensagem */}
            <div style={{ 
              padding: '16px 20px', 
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#fff'
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                  placeholder="Digite sua mensagem..."
                  disabled={enviando}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 24,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
                <button
                  onClick={enviarMensagem}
                  disabled={enviando || !novaMensagem.trim()}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: 24,
                    fontSize: 14,
                    cursor: enviando ? 'not-allowed' : 'pointer',
                    opacity: enviando || !novaMensagem.trim() ? 0.5 : 1
                  }}
                >
                  {enviando ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#6b7280'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Conversa */}
      {showNovaConversa && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 24,
            borderRadius: 8,
            width: '90%',
            maxWidth: 500,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Nova Conversa</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                Vereador
              </label>
              {location.state?.vereadorSelecionado ? (
                <div style={{
                  padding: '10px 12px',
                  border: '1px solid #d1fae5',
                  backgroundColor: '#f0fdf4',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  {location.state.vereadorSelecionado.foto_url && (
                    <img 
                      src={location.state.vereadorSelecionado.foto_url}
                      alt={location.state.vereadorSelecionado.nome}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {location.state.vereadorSelecionado.nome}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {location.state.vereadorSelecionado.partido}
                    </div>
                  </div>
                </div>
              ) : (
                <select
                  value={novaConversa.vereadorId}
                  onChange={(e) => setNovaConversa(prev => ({ ...prev, vereadorId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                >
                  <option value="">Selecione um vereador</option>
                  {vereadores.map(vereador => (
                    <option key={vereador.id} value={vereador.id}>
                      {vereador.nome} ({vereador.partido})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                Assunto
              </label>
              <input
                type="text"
                value={novaConversa.titulo}
                onChange={(e) => setNovaConversa(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Assunto da conversa"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                Mensagem
              </label>
              <textarea
                value={novaConversa.mensagem}
                onChange={(e) => setNovaConversa(prev => ({ ...prev, mensagem: e.target.value }))}
                placeholder="Digite sua mensagem inicial..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 14,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={fecharModalNovaConversa}
                disabled={enviando}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={iniciarNovaConversa}
                disabled={enviando}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: enviando ? 'not-allowed' : 'pointer',
                  opacity: enviando ? 0.5 : 1
                }}
              >
                {enviando ? 'Iniciando...' : 'Iniciar Conversa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
