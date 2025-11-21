import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:3000/api";

function VereadorDetalhe() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vereador, setVereador] = useState(null);

  useEffect(() => {
    fetch(`${API}/vereadores/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setVereador(data);
      })
      .catch(console.error);
  }, [id]);

  const handleIrParaChat = async () => {
    if (!user || !vereador) {
      return;
    }

    try {
      const token = localStorage.getItem('app_token');
      
      const response = await fetch(`${API}/conversas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const conversas = await response.json();
        
        // Procurar conversa existente com este vereador
        const conversaExistente = conversas.find(c => 
          c.vereador_id === parseInt(id)
        );

        if (conversaExistente) {
          // Se já existe conversa, ir direto para ela
          navigate(`/conversas/${conversaExistente.id}`);
        } else {
          // Se não existe, ir para a página de conversas com o vereador pré-selecionado
          navigate('/conversas', { 
            state: { 
              novaConversa: true, 
              vereadorSelecionado: {
                id: vereador.id,
                nome: vereador.nome,
                foto_url: vereador.foto,
                partido: vereador.partido || 'Sem partido'
              }
            }
          });
        }
      } else {
        // Em caso de erro, ir para conversas normalmente
        navigate('/conversas');
      }
    } catch (error) {
      console.error('Erro ao verificar conversas:', error);
      // Em caso de erro, ir para conversas normalmente
      navigate('/conversas');
    }
  };

  if (!vereador) return <p>Carregando...</p>;

  return (
    <div>
      {/* Cabeçalho do vereador */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <img
          src={vereador.foto}
          alt={vereador.nome}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>{vereador.nome}</h2>
          <p style={{ fontSize: 13 }}>{vereador.descricao}</p>
          <p style={{ fontSize: 12, color: "#4b5563" }}>
            Contato: {vereador.contato}
          </p>
        </div>
      </div>

      {/* Informações básicas */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
        gap: 12, 
        marginBottom: 20,
        padding: 16,
        backgroundColor: "#f9fafb",
        borderRadius: 8
      }}>
        {vereador.partido && (
          <div>
            <span style={{ fontSize: 12, color: "#6b7280", display: "block" }}>Partido</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{vereador.partido}</span>
          </div>
        )}
        {vereador.gabinete && (
          <div>
            <span style={{ fontSize: 12, color: "#6b7280", display: "block" }}>Gabinete</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{vereador.gabinete}</span>
          </div>
        )}
      </div>

      {/* Informações adicionais do vereador */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, marginBottom: 12, color: "#1f2937" }}>
          Informações do Mandato
        </h3>
        
        <div style={{ 
          backgroundColor: "#f9fafb", 
          padding: 16, 
          borderRadius: 8,
          lineHeight: 1.6
        }}>
          {vereador.dadosPublicos ? (
            <div dangerouslySetInnerHTML={{ __html: vereador.dadosPublicos }} />
          ) : (
            <p style={{ color: "#6b7280", fontSize: 14 }}>
              Informações detalhadas não disponíveis.
            </p>
          )}
        </div>
      </div>

      {/* Botão para conversar */}
      {user && user.tipo === 'cidadao' && (
        <div style={{ 
          backgroundColor: "#eff6ff", 
          border: "1px solid #dbeafe",
          borderRadius: 8, 
          padding: 20,
          textAlign: "center",
          marginTop: 20
        }}>
          <h4 style={{ fontSize: 16, marginBottom: 12, color: "#1e40af" }}>
            💬 Quer conversar com {vereador.nome}?
          </h4>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
            Use nosso sistema de chat para enviar mensagens diretas para o vereador.
            Suas conversas ficam salvas e você pode acompanhar as respostas.
          </p>
          <button
            onClick={handleIrParaChat}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#1d4ed8";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#2563eb";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Ir para o Chat 💬
          </button>
        </div>
      )}

      {!user && (
        <div style={{ 
          backgroundColor: "#fef3c7", 
          border: "1px solid #fbbf24",
          borderRadius: 8, 
          padding: 20,
          textAlign: "center",
          marginTop: 20
        }}>
          <p style={{ fontSize: 14, color: "#92400e" }}>
            Faça login para conversar com o vereador
          </p>
        </div>
      )}
    </div>
  );
}

export default VereadorDetalhe;
