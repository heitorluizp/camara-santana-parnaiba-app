import Container from "../components/Container";
import BottomNav from "../components/BottomNav";

export default function AppLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6", // fundo clarinho, igual portal
        color: "#1f2933",
      }}
    >
      {/* HEADER APP – faixa azul tipo site da Câmara */}
      <header
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(15, 23, 42, 0.15)",
          backgroundColor: "#003b74",  // azul principal
          color: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#fbbf24", // amarelo/dourado
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: "#1f2937",
            }}
          >
            C
          </div>

          <div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              Câmara Municipal
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              Santana de Parnaíba
            </div>
          </div>

          <div
            style={{
              marginLeft: "auto",
              fontSize: 12,
              opacity: 0.9,
              textAlign: "right",
            }}
          >
            App oficial
          </div>
        </div>
      </header>

      <main>
        <Container>{children}</Container>
      </main>

      <BottomNav />
    </div>
  );
}
