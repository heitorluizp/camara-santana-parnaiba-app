import { useState } from "react";
import Container from "../components/Container";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        color: "#1f2933",
      }}
    >
      {/* Header fixo */}
      <Header onMenuClick={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

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
