import { useEffect, useState } from "react";

const API = "http://localhost:3000/api";

function Propostas() {
  const [propostas, setPropostas] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`${API}/propostas?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => setPropostas(data))
      .catch(err => console.error(err));
  }, [q]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'aprovado': return '#10b981';
      case 'tramitacao': return '#f59e0b';
      case 'rejeitado': return '#ef4444';
      case 'arquivado': return '#6b7280';
      case 'retirado': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'aprovado': return 'Aprovado';
      case 'tramitacao': return 'Em Tramitação';
      case 'rejeitado': return 'Rejeitado';
      case 'arquivado': return 'Arquivado';
      case 'retirado': return 'Retirado';
      default: return status;
    }
  };

  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'projeto_lei': return 'Projeto de Lei';
      case 'emenda': return 'Emenda';
      case 'indicacao': return 'Indicação';
      case 'requerimento': return 'Requerimento';
      case 'mocao': return 'Moção';
      default: return tipo;
    }
  };

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'projeto_lei': return '📜';
      case 'emenda': return '✏️';
      case 'indicacao': return '👉';
      case 'requerimento': return '📋';
      case 'mocao': return '💬';
      default: return '📄';
    }
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
        Proposituras
      </h2>

      <input
        placeholder="Buscar por tipo, autor, número..."
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
        {propostas.map(proposta => (
          <div
            key={proposta.id}
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
              {getTipoIcon(proposta.tipo)}
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
                  {proposta.titulo}
                </div>
                <div
                  style={{
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: `${getStatusColor(proposta.status)}20`,
                    color: getStatusColor(proposta.status),
                    marginLeft: 8,
                    whiteSpace: "nowrap"
                  }}
                >
                  {getStatusLabel(proposta.status)}
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
                  Nº {proposta.numero}/{proposta.ano}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  {getTipoLabel(proposta.tipo)}
                </span>
                {proposta.data_apresentacao && (
                  <span
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    {new Date(proposta.data_apresentacao).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
              
              {proposta.autor && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#4b5563",
                    marginBottom: 4,
                  }}
                >
                  <strong>Autor:</strong> {proposta.autor}
                </div>
              )}
              
              {proposta.ementa && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#4b5563",
                    lineHeight: 1.4,
                  }}
                >
                  {proposta.ementa}
                </div>
              )}
            </div>
          </div>
        ))}
        {propostas.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: 32,
            color: "#6b7280",
            fontSize: 14
          }}>
            {q ? "Nenhuma proposta encontrada com os termos pesquisados." : "Nenhuma proposta cadastrada."}
          </div>
        )}
      </div>
    </div>
  );
}

export default Propostas;
