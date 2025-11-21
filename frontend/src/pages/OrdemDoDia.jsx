import { useEffect, useState } from "react";

const API = "http://localhost:3000/api";

function OrdemDia() {
  const [sessoes, setSessoes] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`${API}/ordem-dia?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => setSessoes(data))
      .catch(err => console.error(err));
  }, [q]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'concluida': return '#10b981';
      case 'em_andamento': return '#3b82f6';
      case 'agendada': return '#f59e0b';
      case 'cancelada': return '#ef4444';
      case 'adiada': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'concluida': return 'Concluída';
      case 'em_andamento': return 'Em Andamento';
      case 'agendada': return 'Agendada';
      case 'cancelada': return 'Cancelada';
      case 'adiada': return 'Adiada';
      default: return status;
    }
  };

  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'ordinaria': return 'Sessão Ordinária';
      case 'extraordinaria': return 'Sessão Extraordinária';
      case 'solene': return 'Sessão Solene';
      case 'especial': return 'Sessão Especial';
      default: return tipo;
    }
  };

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'ordinaria': return '📅';
      case 'extraordinaria': return '⚡';
      case 'solene': return '🎖️';
      case 'especial': return '⭐';
      default: return '📋';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const countItens = (itens) => {
    if (!itens) return 0;
    return itens.split('\n').filter(item => item.trim()).length;
  };

  return (
    <div>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2933",
          marginBottom: 16,
        }}
      >
        Ordem do Dia
      </h2>

      <input
        placeholder="Buscar por número, tipo, data..."
        value={q}
        onChange={e => setQ(e.target.value)}
        style={{
          padding: 12,
          width: "100%",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          marginBottom: 16,
          fontSize: 14,
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)"
        }}
      />

      <div style={{ display: "grid", gap: 12 }}>
        {sessoes.map(sessao => (
          <div
            key={sessao.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: 16,
              borderRadius: 12,
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
              color: "#1f2933",
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
            }}>
              {getTipoIcon(sessao.tipo)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    lineHeight: 1.3,
                    marginBottom: 4,
                  }}
                >
                  {getTipoLabel(sessao.tipo)} Nº {sessao.numero_sessao}
                </div>
                <div
                  style={{
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: `${getStatusColor(sessao.status)}20`,
                    color: getStatusColor(sessao.status),
                    marginLeft: 8,
                    whiteSpace: "nowrap"
                  }}
                >
                  {getStatusLabel(sessao.status)}
                </div>
              </div>
              
              <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    fontWeight: 500,
                  }}
                >
                  📅 {formatDateTime(sessao.data_sessao)}
                </span>
                {sessao.itens && (
                  <span
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    📋 {countItens(sessao.itens)} itens
                  </span>
                )}
              </div>
              
              {sessao.itens && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#4b5563",
                    lineHeight: 1.4,
                    marginBottom: 8,
                  }}
                >
                  <strong>Itens da ordem do dia:</strong>
                  <div style={{ marginTop: 4 }}>
                    {sessao.itens.split('\n').slice(0, 3).map((item, index) => (
                      item.trim() && (
                        <div key={index} style={{ marginBottom: 2 }}>
                          • {item.trim()}
                        </div>
                      )
                    ))}
                    {countItens(sessao.itens) > 3 && (
                      <div style={{ color: "#6b7280", fontStyle: "italic" }}>
                        ... e mais {countItens(sessao.itens) - 3} itens
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {sessao.observacoes && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#4b5563",
                    lineHeight: 1.4,
                    backgroundColor: "#f9fafb",
                    padding: 8,
                    borderRadius: 6,
                    border: "1px solid #f3f4f6"
                  }}
                >
                  <strong>Observações:</strong> {sessao.observacoes}
                </div>
              )}
            </div>
          </div>
        ))}
        {sessoes.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: 32,
            color: "#6b7280",
            fontSize: 14
          }}>
            {q ? "Nenhuma sessão encontrada com os termos pesquisados." : "Nenhuma sessão agendada."}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdemDia;
