require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createConnection, getConnection } = require('./database/connection');
const { authenticateToken, requireUser, requireAdmin } = require('./middleware/auth');

// Rotas
const authRoutes = require('./routes/auth');

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seudominio.com'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'capacitor://localhost', 'http://localhost'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Inicializar conexão com banco de dados
async function initializeDatabase() {
  try {
    await createConnection();
    console.log('✅ Base de dados inicializada');
  } catch (error) {
    console.error('❌ Erro ao inicializar base de dados:', error);
    process.exit(1);
  }
}

// === ROTAS DA API ===

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// === ROTAS PÚBLICAS ===

// Listar notícias
app.get("/api/noticias", async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute(
      `SELECT n.id, n.titulo, n.resumo, n.imagem_url as imagemUrl, n.views, 
              n.created_at as createdAt, u.nome as autor
       FROM noticias n 
       LEFT JOIN usuarios u ON n.autor_id = u.id 
       WHERE n.publicado = true 
       ORDER BY n.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar notícia por ID
app.get("/api/noticias/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const connection = getConnection();
    
    // Buscar notícia
    const [rows] = await connection.execute(
      `SELECT n.*, u.nome as autor
       FROM noticias n 
       LEFT JOIN usuarios u ON n.autor_id = u.id 
       WHERE n.id = ? AND n.publicado = true`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Notícia não encontrada" });
    }

    // Incrementar visualizações
    await connection.execute(
      'UPDATE noticias SET views = views + 1 WHERE id = ?',
      [id]
    );

    const noticia = rows[0];
    noticia.imagemUrl = noticia.imagem_url; // Compatibilidade com frontend
    
    res.json(noticia);
  } catch (error) {
    console.error('Erro ao buscar notícia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar vereadores
app.get("/api/vereadores", async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute(
      `SELECT u.id, u.nome, u.foto_url as foto, v.descricao, 
              v.contato_publico as contato, v.dados_publicos as dadosPublicos,
              v.partido, v.gabinete
       FROM usuarios u 
       JOIN vereadores v ON u.id = v.usuario_id 
       WHERE u.tipo = 'vereador' AND u.ativo = true
       ORDER BY u.nome`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar vereadores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar vereador por ID
app.get("/api/vereadores/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const connection = getConnection();
    
    const [rows] = await connection.execute(
      `SELECT u.id, u.nome, u.foto_url as foto, v.descricao, 
              v.contato_publico as contato, v.dados_publicos as dadosPublicos,
              v.partido, v.gabinete, v.comissoes
       FROM usuarios u 
       JOIN vereadores v ON u.id = v.usuario_id 
       WHERE u.id = ? AND u.tipo = 'vereador' AND u.ativo = true`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Vereador não encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar vereador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// === ROTAS PROTEGIDAS ===

// Enviar mensagem para vereador (requer autenticação)
app.post("/api/vereadores/:id/mensagens", authenticateToken, async (req, res) => {
  try {
    const vereadorId = Number(req.params.id);
    const { assunto, mensagem } = req.body;
    const remetenteId = req.user.id;

    if (!assunto || !mensagem) {
      return res.status(400).json({ error: "Assunto e mensagem são obrigatórios" });
    }

    const connection = getConnection();

    // Verificar se o vereador existe
    const [vereador] = await connection.execute(
      'SELECT id FROM usuarios WHERE id = ? AND tipo = "vereador" AND ativo = true',
      [vereadorId]
    );

    if (vereador.length === 0) {
      return res.status(404).json({ error: "Vereador não encontrado" });
    }

    // Inserir mensagem
    await connection.execute(
      'INSERT INTO mensagens (remetente_id, destinatario_id, assunto, mensagem) VALUES (?, ?, ?, ?)',
      [remetenteId, vereadorId, assunto, mensagem]
    );

    res.status(201).json({ message: "Mensagem enviada com sucesso" });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar conversas do usuário
app.get("/api/conversas", authenticateToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const connection = getConnection();

    const [rows] = await connection.execute(
      `SELECT DISTINCT 
         CASE 
           WHEN m.remetente_id = ? THEN m.destinatario_id 
           ELSE m.remetente_id 
         END as outro_usuario_id,
         u.nome as outro_usuario_nome,
         u.foto_url as outro_usuario_foto,
         (SELECT mensagem FROM mensagens 
          WHERE (remetente_id = ? AND destinatario_id = outro_usuario_id) 
             OR (remetente_id = outro_usuario_id AND destinatario_id = ?) 
          ORDER BY created_at DESC LIMIT 1) as ultima_mensagem,
         (SELECT created_at FROM mensagens 
          WHERE (remetente_id = ? AND destinatario_id = outro_usuario_id) 
             OR (remetente_id = outro_usuario_id AND destinatario_id = ?) 
          ORDER BY created_at DESC LIMIT 1) as ultima_data
       FROM mensagens m
       JOIN usuarios u ON u.id = CASE 
         WHEN m.remetente_id = ? THEN m.destinatario_id 
         ELSE m.remetente_id 
       END
       WHERE m.remetente_id = ? OR m.destinatario_id = ?
       ORDER BY ultima_data DESC`,
      [usuarioId, usuarioId, usuarioId, usuarioId, usuarioId, usuarioId, usuarioId, usuarioId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar leis (com filtro opcional)
app.get("/api/leis", async (req, res) => {
  try {
    const q = (req.query.q || "").toLowerCase();
    const connection = getConnection();
    
    let query = `SELECT id, numero, ano, tipo, titulo, ementa, status, data_publicacao 
                 FROM leis WHERE status = 'sancionado'`;
    let params = [];
    
    if (q) {
      query += ` AND (numero LIKE ? OR CAST(ano AS CHAR) LIKE ? OR titulo LIKE ? OR ementa LIKE ?)`;
      params = [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`];
    }
    
    query += ` ORDER BY ano DESC, numero DESC`;
    
    const [rows] = await connection.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar leis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar propostas (com filtro opcional)
app.get("/api/propostas", async (req, res) => {
  try {
    const q = (req.query.q || "").toLowerCase();
    const connection = getConnection();
    
    let query = `SELECT p.id, p.numero, p.ano, p.tipo, p.titulo, p.resumo, p.status, 
                        u.nome as autor, p.data_protocolo
                 FROM propostas p
                 LEFT JOIN usuarios u ON p.autor_id = u.id`;
    let params = [];
    
    if (q) {
      query += ` WHERE (p.numero LIKE ? OR CAST(p.ano AS CHAR) LIKE ? OR p.tipo LIKE ? 
                        OR p.titulo LIKE ? OR u.nome LIKE ?)`;
      params = [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`];
    }
    
    query += ` ORDER BY p.ano DESC, p.numero DESC`;
    
    const [rows] = await connection.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar ordem do dia
app.get("/api/ordem-dia", async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute(
      `SELECT id, data_sessao as dataSessao, numero_sessao as numeroSessao, 
              tipo_sessao as tipoSessao, hora_inicio as horaInicio, 
              local, pauta, status
       FROM ordem_dia 
       WHERE data_sessao >= CURDATE() OR status = 'em_andamento'
       ORDER BY data_sessao ASC, hora_inicio ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar ordem do dia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// === ROTAS ADMIN ===

// Listar todas as notícias (admin)
app.get("/api/admin/noticias", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute(
      `SELECT n.id, n.titulo, n.resumo, n.publicado, n.destaque, n.views,
              n.created_at as createdAt, u.nome as autor
       FROM noticias n 
       LEFT JOIN usuarios u ON n.autor_id = u.id 
       ORDER BY n.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar notícias admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar notícia (admin)
app.post("/api/admin/noticias", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titulo, resumo, conteudo, imagem_url, publicado = false, destaque = false } = req.body;
    const autorId = req.user.id;

    if (!titulo || !resumo || !conteudo) {
      return res.status(400).json({ error: 'Título, resumo e conteúdo são obrigatórios' });
    }

    const connection = getConnection();
    const [result] = await connection.execute(
      'INSERT INTO noticias (titulo, resumo, conteudo, imagem_url, autor_id, publicado, destaque) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titulo, resumo, conteudo, imagem_url || null, autorId, publicado, destaque]
    );

    res.status(201).json({ 
      message: 'Notícia criada com sucesso',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Erro ao criar notícia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware para tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 API rodando na porta ${PORT}`);
      console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();
