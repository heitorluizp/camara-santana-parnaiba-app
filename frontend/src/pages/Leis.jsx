import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:3000/api";

function Leis() {
  const [leis, setLeis] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`${API}/leis?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => setLeis(data))
      .catch(err => console.error(err));
  }, [q]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'sancionado': return '#10b981';
      case 'aprovado': return '#3b82f6';
      case 'tramitacao': return '#f59e0b';
      case 'rejeitado': return '#ef4444';
      case 'vetado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'sancionado': return 'Sancionado';
      case 'aprovado': return 'Aprovado';
      case 'tramitacao': return 'Em Tramitação';
      case 'rejeitado': return 'Rejeitado';
      case 'vetado': return 'Vetado';
      default: return status;
    }
  };

  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'lei_ordinaria': return 'Lei Ordinária';
      case 'lei_complementar': return 'Lei Complementar';
      case 'decreto': return 'Decreto';
      case 'emenda': return 'Emenda';
      case 'resolucao': return 'Resolução';
      default: return tipo;
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
        Leis Municipais
      </h2>

      <input
        placeholder="Buscar por número, ano, título..."
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
        {leis.map(lei => (
          <div
            key={lei.id}
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
              📄
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
                  {lei.titulo}
                </div>
                <div
                  style={{
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: `${getStatusColor(lei.status)}20`,
                    color: getStatusColor(lei.status),
                    marginLeft: 8,
                    whiteSpace: "nowrap"
                  }}
                >
                  {getStatusLabel(lei.status)}
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
                  Nº {lei.numero}/{lei.ano}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  {getTipoLabel(lei.tipo)}
                </span>
                {lei.data_publicacao && (
                  <span
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    {new Date(lei.data_publicacao).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
              
              {lei.ementa && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#4b5563",
                    lineHeight: 1.4,
                  }}
                >
                  {lei.ementa}
                </div>
              )}
            </div>
          </div>
        ))}
        {leis.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: 32,
            color: "#6b7280",
            fontSize: 14
          }}>
            {q ? "Nenhuma lei encontrada com os termos pesquisados." : "Nenhuma lei cadastrada."}
          </div>
        )}
      </div>
    </div>
  );
}

export default Leis;
