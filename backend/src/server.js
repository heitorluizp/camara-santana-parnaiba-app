const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// --- MOCK DE DADOS (depois a gente joga pra banco) ---

let noticias = [
  {
    id: 1,
    titulo: "Sessão Ordinária discute orçamento municipal",
    resumo: "Vereadores debatem prioridades para o próximo ano.",
    imagemUrl: "https://via.placeholder.com/600x300?text=Noticia+1",
    conteudo: "Texto completo da notícia 1...",
    createdAt: new Date()
  },
  {
    id: 2,
    titulo: "Câmara lança aplicativo oficial para população",
    resumo: "Novo app facilita acesso às notícias e aos vereadores.",
    imagemUrl: "https://via.placeholder.com/600x300?text=Noticia+2",
    conteudo: "Texto completo da notícia 2...",
    createdAt: new Date()
  }
];

let vereadores = [
  {
    id: 1,
    nome: "Vereador João Silva",
    foto: "https://via.placeholder.com/200?text=Joao",
    descricao: "Atua nas áreas de educação e saúde.",
    contato: "joao.silva@camara.sp.gov.br",
    dadosPublicos: "Mandato 2025-2028"
  },
  {
    id: 2,
    nome: "Vereadora Maria Souza",
    foto: "https://via.placeholder.com/200?text=Maria",
    descricao: "Atuação voltada para políticas sociais.",
    contato: "maria.souza@camara.sp.gov.br",
    dadosPublicos: "Mandato 2025-2028"
  }
];

let mensagens = []; // aqui vamos só empilhar as mensagens recebidas

// --- ROTAS ---

// teste
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

// lista de notícias
app.get("/noticias", (req, res) => {
  res.json(noticias);
});

// notícia por id
app.get("/noticias/:id", (req, res) => {
  const id = Number(req.params.id);
  const noticia = noticias.find(n => n.id === id);
  if (!noticia) return res.status(404).json({ error: "Notícia não encontrada" });
  res.json(noticia);
});

// lista de vereadores
app.get("/vereadores", (req, res) => {
  res.json(vereadores);
});

// vereador por id
app.get("/vereadores/:id", (req, res) => {
  const id = Number(req.params.id);
  const vereador = vereadores.find(v => v.id === id);
  if (!vereador) return res.status(404).json({ error: "Vereador não encontrado" });
  res.json(vereador);
});

// enviar mensagem para vereador
app.post("/vereadores/:id/mensagens", (req, res) => {
  const id = Number(req.params.id);
  const vereador = vereadores.find(v => v.id === id);
  if (!vereador) return res.status(404).json({ error: "Vereador não encontrado" });

  const { nome, email, texto } = req.body;

  if (!nome || !email || !texto) {
    return res.status(400).json({ error: "nome, email e texto são obrigatórios" });
  }

  const msg = {
    id: mensagens.length + 1,
    vereadorId: id,
    nome,
    email,
    texto,
    createdAt: new Date()
  };

  mensagens.push(msg);

  res.status(201).json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
