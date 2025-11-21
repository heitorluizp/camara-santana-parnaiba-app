import { Link } from "react-router-dom";

function MinhasConversas() {
  // MOCK super simples – só os vereadores com quem "conversou"
  const conversasMock = [
    { vereadorId: 1, nome: "Vereador João Silva" },
    { vereadorId: 2, nome: "Vereadora Maria Souza" },
  ];

  return (
    <div>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        Minhas conversas
      </h2>

      <div style={{ display: "grid", gap: 10 }}>
        {conversasMock.map((c) => (
          <Link
            key={c.vereadorId}
            to={`/vereador/${c.vereadorId}`}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: 10,
              textDecoration: "none",
              color: "#111827",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {c.nome}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MinhasConversas;
