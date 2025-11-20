import { useEffect, useState } from "react";

function App() {
  const [mensagem, setMensagem] = useState("Carregando...");

  useEffect(() => {
    fetch("http://localhost:3000/ping")
      .then((res) => res.json())
      .then((data) => setMensagem(data.message))
      .catch((err) => {
        console.error(err);
        setMensagem("Erro ao conectar com a API");
      });
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>App da Câmara - MVP</h1>
      <p>Resposta do backend: {mensagem}</p>
    </div>
  );
}

export default App;
