require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createConnection, getConnection } = require('./database/connection');
const { authenticateToken, requireUser, requireAdmin } = require('./middleware/auth');

// Rotas
const authRoutes = require('./routes/auth');

const app = express();

// Middlewares de segurança
// Configuração dinâmica para desenvolvimento
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(helmet({
  contentSecurityPolicy: isDevelopment ? false : {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seudominio.com'] 
    : (origin, callback) => {
        // Em desenvolvimento, permitir qualquer localhost
        if (!origin || origin.startsWith('http://localhost') || origin === 'capacitor://localhost') {
          callback(null, true);
        } else {
          callback(new Error('Não permitido pelo CORS'));
        }
      },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (imagens) com headers CORS
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/noticias');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Gerar nome único: timestamp + nome original limpo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '').replace(ext, '');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Configuração específica para fotos de perfil de vereadores
const perfilStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/perfil');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Gerar nome único: timestamp + nome original limpo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '').replace(ext, '');
    cb(null, `vereador-${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('O arquivo deve ser uma imagem (jpg, png, gif, etc.)'), false);
    }
  }
});

const uploadPerfil = multer({ 
  storage: perfilStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: function (req, file, cb) {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('O arquivo deve ser uma imagem (jpg, png, gif, etc.)'), false);
    }
  }
});



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
    
    // Buscar notícias
    const [rows] = await connection.execute(
      `SELECT n.id, n.titulo, n.resumo, n.imagem_url as imagemUrl, n.views, 
              n.created_at as createdAt, u.nome as autor
       FROM noticias n 
       LEFT JOIN usuarios u ON n.autor_id = u.id 
       WHERE n.publicado = true 
       ORDER BY n.created_at DESC`
    );

    // Para cada notícia, buscar suas imagens adicionais
    for (let noticia of rows) {
      const [imagens] = await connection.execute(
        'SELECT id, url_imagem, descricao, ordem FROM noticia_imagens WHERE noticia_id = ? ORDER BY ordem, created_at',
        [noticia.id]
      );
      noticia.imagens = imagens;
    }

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

    // Buscar imagens adicionais
    const [imagens] = await connection.execute(
      'SELECT id, url_imagem, descricao, ordem FROM noticia_imagens WHERE noticia_id = ? ORDER BY ordem, created_at',
      [id]
    );
    noticia.imagens = imagens;
    
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

// Rota antiga removida - usando nova rota de conversas com JSON

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

// Upload de imagem para notícias (admin)
app.post("/api/admin/upload-imagem", authenticateToken, requireAdmin, upload.single('imagem'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    // Construir URL da imagem
    const imageUrl = `http://localhost:${process.env.PORT || 3000}/uploads/noticias/${req.file.filename}`;
    
    res.json({ 
      message: 'Imagem enviada com sucesso',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload múltiplo de imagens para notícias (admin)
app.post("/api/admin/upload-imagens-multiplas", authenticateToken, requireAdmin, upload.array('imagens', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    const imagensUrls = req.files.map(file => ({
      url: `http://localhost:${process.env.PORT || 3000}/uploads/noticias/${file.filename}`,
      filename: file.filename
    }));
    
    res.json({ 
      message: 'Imagens enviadas com sucesso',
      imagens: imagensUrls
    });
  } catch (error) {
    console.error('Erro no upload das imagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

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

// Editar notícia (admin)
app.put("/api/admin/noticias/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, resumo, conteudo, imagem_url, publicado, destaque } = req.body;

    if (!titulo || !resumo || !conteudo) {
      return res.status(400).json({ error: 'Título, resumo e conteúdo são obrigatórios' });
    }

    const connection = getConnection();
    const [result] = await connection.execute(
      'UPDATE noticias SET titulo = ?, resumo = ?, conteudo = ?, imagem_url = ?, publicado = ?, destaque = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [titulo, resumo, conteudo, imagem_url || null, publicado || false, destaque || false, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada' });
    }

    res.json({ message: 'Notícia atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao editar notícia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar notícia (admin)
app.delete("/api/admin/noticias/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM noticias WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada' });
    }

    res.json({ message: 'Notícia deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar notícia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter notícia específica para edição (admin)
app.get("/api/admin/noticias/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = getConnection();
    
    const [rows] = await connection.execute(
      `SELECT n.*, u.nome as autor
       FROM noticias n 
       LEFT JOIN usuarios u ON n.autor_id = u.id 
       WHERE n.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar notícia:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload de imagem para notícias (admin)
app.post("/api/admin/upload-imagem", authenticateToken, requireAdmin, upload.single('imagem'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    // Construir URL da imagem
    const imageUrl = `http://localhost:${process.env.PORT || 3000}/uploads/noticias/${req.file.filename}`;
    
    res.json({ 
      message: 'Imagem enviada com sucesso',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload múltiplo de imagens para notícias (admin)
app.post("/api/admin/upload-imagens-multiplas", authenticateToken, requireAdmin, upload.array('imagens', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    const imagensUrls = req.files.map(file => ({
      url: `http://localhost:${process.env.PORT || 3000}/uploads/noticias/${file.filename}`,
      filename: file.filename
    }));
    
    res.json({ 
      message: 'Imagens enviadas com sucesso',
      imagens: imagensUrls
    });
  } catch (error) {
    console.error('Erro no upload das imagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Adicionar imagens a uma notícia (admin)
app.post("/api/admin/noticias/:id/imagens", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const noticiaId = Number(req.params.id);
    const { imagens } = req.body; // Array de {url_imagem, descricao, ordem}

    if (!imagens || !Array.isArray(imagens)) {
      return res.status(400).json({ error: 'Array de imagens é obrigatório' });
    }

    const connection = getConnection();
    
    // Verificar se a notícia existe
    const [noticia] = await connection.execute(
      'SELECT id FROM noticias WHERE id = ?',
      [noticiaId]
    );

    if (noticia.length === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada' });
    }

    // Inserir as imagens
    for (let i = 0; i < imagens.length; i++) {
      const img = imagens[i];
      await connection.execute(
        'INSERT INTO noticia_imagens (noticia_id, url_imagem, descricao, ordem) VALUES (?, ?, ?, ?)',
        [noticiaId, img.url_imagem, img.descricao || '', img.ordem || i]
      );
    }

    res.json({ message: 'Imagens adicionadas com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar imagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar imagens de uma notícia (admin)
app.get("/api/admin/noticias/:id/imagens", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const noticiaId = Number(req.params.id);
    const connection = getConnection();
    
    const [rows] = await connection.execute(
      'SELECT * FROM noticia_imagens WHERE noticia_id = ? ORDER BY ordem, created_at',
      [noticiaId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remover imagem de uma notícia (admin)
app.delete("/api/admin/noticias/:noticiaId/imagens/:imagemId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { noticiaId, imagemId } = req.params;
    const connection = getConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM noticia_imagens WHERE id = ? AND noticia_id = ?',
      [imagemId, noticiaId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    res.json({ message: 'Imagem removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//=============================================================================
// ROTAS DE USUÁRIOS (ADMIN)
//=============================================================================

// Listar todos os usuários
app.get("/api/admin/usuarios", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getConnection();
    
    const [usuarios] = await db.execute(`
      SELECT id, nome, email, telefone, tipo, created_at as createdAt, updated_at as updatedAt
      FROM usuarios 
      ORDER BY nome ASC
    `);

    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo usuário
app.post("/api/admin/usuarios", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nome, email, telefone, tipo, senha } = req.body;

    if (!nome || !email || !tipo || !senha) {
      return res.status(400).json({ error: 'Nome, email, tipo e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const db = await getConnection();
    const [existing] = await db.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Hash da senha
    const bcrypt = require('bcryptjs');
    const senhaHash = await bcrypt.hash(senha, 12);

    const [result] = await db.execute(`
      INSERT INTO usuarios (nome, email, telefone, senha_hash, tipo) 
      VALUES (?, ?, ?, ?, ?)
    `, [nome, email, telefone || null, senhaHash, tipo]);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Usuário criado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email já está em uso' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// Atualizar usuário
app.put("/api/admin/usuarios/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, tipo, senha } = req.body;

    if (!nome || !email || !tipo) {
      return res.status(400).json({ error: 'Nome, email e tipo são obrigatórios' });
    }

    const db = await getConnection();
    
    // Verificar se email já existe (exceto para o próprio usuário)
    const [existing] = await db.execute(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    let query = `UPDATE usuarios SET nome = ?, email = ?, telefone = ?, tipo = ?`;
    let params = [nome, email, telefone || null, tipo];

    // Se uma nova senha foi fornecida, incluir na atualização
    if (senha && senha.trim() !== '') {
      const bcrypt = require('bcryptjs');
      const senhaHash = await bcrypt.hash(senha, 12);
      query += `, senha_hash = ?`;
      params.push(senhaHash);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email já está em uso' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// Excluir usuário
app.delete("/api/admin/usuarios/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir que o admin exclua a si mesmo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário' });
    }

    const db = await getConnection();
    const [result] = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Upload de foto de perfil de usuário
app.post("/api/admin/usuarios/:id/foto", authenticateToken, requireAdmin, uploadPerfil.single('foto'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fotoUrl = `http://localhost:3000/uploads/perfil/${req.file.filename}`;
    
    const db = await getConnection();
    const [result] = await db.execute(
      'UPDATE usuarios SET foto_url = ? WHERE id = ?',
      [fotoUrl, id]
    );

    if (result.affectedRows === 0) {
      // Remover arquivo se usuário não foi encontrado
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ 
      message: 'Foto atualizada com sucesso',
      foto_url: fotoUrl
    });
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    // Remover arquivo em caso de erro
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar dados completos de um usuário (incluindo dados de vereador se aplicável)
app.get("/api/admin/usuarios/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    
    // Buscar dados do usuário
    const [usuario] = await db.execute(`
      SELECT id, nome, email, telefone, tipo, foto_url, created_at as createdAt, updated_at as updatedAt
      FROM usuarios 
      WHERE id = ?
    `, [id]);

    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    let dadosCompletos = usuario[0];

    // Se for vereador, buscar dados específicos
    if (usuario[0].tipo === 'vereador') {
      const [vereador] = await db.execute(`
        SELECT descricao, mandato_inicio, mandato_fim, partido, dados_publicos, 
               contato_publico, gabinete, comissoes
        FROM vereadores 
        WHERE usuario_id = ?
      `, [id]);

      if (vereador.length > 0) {
        dadosCompletos.dadosVereador = vereador[0];
      }
    }

    res.json(dadosCompletos);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar dados específicos de vereador
app.put("/api/admin/usuarios/:id/vereador", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, mandato_inicio, mandato_fim, partido, dados_publicos, contato_publico, gabinete, comissoes } = req.body;

    // Formatar datas para MySQL (apenas YYYY-MM-DD)
    const formatarData = (data) => {
      if (!data) return null;
      const d = new Date(data);
      return d.toISOString().split('T')[0]; // Pega apenas a parte YYYY-MM-DD
    };

    const mandatoInicioFormatado = formatarData(mandato_inicio);
    const mandatoFimFormatado = formatarData(mandato_fim);

    const db = await getConnection();
    
    // Verificar se o usuário existe e é vereador
    const [usuario] = await db.execute(
      'SELECT id, tipo FROM usuarios WHERE id = ?',
      [id]
    );

    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (usuario[0].tipo !== 'vereador') {
      return res.status(400).json({ error: 'Usuário não é um vereador' });
    }

    // Verificar se já existe registro na tabela vereadores
    const [vereadorExistente] = await db.execute(
      'SELECT id FROM vereadores WHERE usuario_id = ?',
      [id]
    );

    if (vereadorExistente.length === 0) {
      // Inserir novo registro
      await db.execute(`
        INSERT INTO vereadores (usuario_id, descricao, mandato_inicio, mandato_fim, partido, dados_publicos, contato_publico, gabinete, comissoes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, descricao, mandatoInicioFormatado, mandatoFimFormatado, partido, dados_publicos, contato_publico, gabinete, comissoes]);
    } else {
      // Atualizar registro existente
      await db.execute(`
        UPDATE vereadores 
        SET descricao = ?, mandato_inicio = ?, mandato_fim = ?, partido = ?, dados_publicos = ?, contato_publico = ?, gabinete = ?, comissoes = ?
        WHERE usuario_id = ?
      `, [descricao, mandatoInicioFormatado, mandatoFimFormatado, partido, dados_publicos, contato_publico, gabinete, comissoes, id]);
    }

    res.json({ message: 'Dados do vereador atualizados com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar dados do vereador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//=============================================================================
// ROTAS DE CHAT/CONVERSAS
//=============================================================================

// Listar vereadores disponíveis para chat
app.get("/api/vereadores-chat", authenticateToken, async (req, res) => {
  try {
    const db = await getConnection();
    
    const [vereadores] = await db.execute(`
      SELECT u.id, u.nome, u.foto_url, v.partido, v.gabinete
      FROM usuarios u
      INNER JOIN vereadores v ON u.id = v.usuario_id
      WHERE u.tipo = 'vereador' AND u.ativo = true
      ORDER BY u.nome ASC
    `);

    res.json(vereadores);
  } catch (error) {
    console.error('Erro ao buscar vereadores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar conversas do usuário logado
app.get("/api/conversas", authenticateToken, async (req, res) => {
  try {
    const db = await getConnection();
    const userId = req.user.id;
    
    let query;
    let params;
    
    if (req.user.tipo === 'vereador') {
      // Vereador vê conversas onde ele é o destinatário
      query = `
        SELECT c.*, 
               u.nome as cidadao_nome, 
               u.foto_url as cidadao_foto
        FROM conversas c
        INNER JOIN usuarios u ON c.cidadao_id = u.id
        WHERE c.vereador_id = ? AND c.status = 'ativa'
        ORDER BY c.ultima_mensagem_data DESC
      `;
      params = [userId];
    } else {
      // Cidadão vê suas conversas com vereadores
      query = `
        SELECT c.*, 
               u.nome as vereador_nome, 
               u.foto_url as vereador_foto,
               v.partido
        FROM conversas c
        INNER JOIN usuarios u ON c.vereador_id = u.id
        LEFT JOIN vereadores v ON u.id = v.usuario_id
        WHERE c.cidadao_id = ? AND c.status = 'ativa'
        ORDER BY c.ultima_mensagem_data DESC
      `;
      params = [userId];
    }

    const [conversas] = await db.execute(query, params);
    
    // Processar mensagens JSON
    const conversasProcessadas = conversas.map(conversa => ({
      ...conversa,
      mensagens: typeof conversa.mensagens === 'string' 
        ? JSON.parse(conversa.mensagens || '[]')
        : (conversa.mensagens || [])
    }));

    res.json(conversasProcessadas);
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar uma conversa específica
app.get("/api/conversas/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const db = await getConnection();
    
    const [conversas] = await db.execute(`
      SELECT c.*, 
             uc.nome as cidadao_nome, 
             uc.foto_url as cidadao_foto,
             uv.nome as vereador_nome, 
             uv.foto_url as vereador_foto,
             v.partido
      FROM conversas c
      INNER JOIN usuarios uc ON c.cidadao_id = uc.id
      INNER JOIN usuarios uv ON c.vereador_id = uv.id
      LEFT JOIN vereadores v ON uv.id = v.usuario_id
      WHERE c.id = ? AND (c.cidadao_id = ? OR c.vereador_id = ?)
    `, [id, userId, userId]);

    if (conversas.length === 0) {
      return res.status(404).json({ error: 'Conversa não encontrada' });
    }

    const conversa = {
      ...conversas[0],
      mensagens: typeof conversas[0].mensagens === 'string' 
        ? JSON.parse(conversas[0].mensagens || '[]')
        : (conversas[0].mensagens || [])
    };

    res.json(conversa);
  } catch (error) {
    console.error('Erro ao buscar conversa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar nova conversa (apenas cidadãos)
app.post("/api/conversas", authenticateToken, async (req, res) => {
  try {
    const { vereadorId, titulo, mensagem } = req.body;
    const cidadaoId = req.user.id;

    if (req.user.tipo !== 'cidadao') {
      return res.status(403).json({ error: 'Apenas cidadãos podem iniciar conversas' });
    }

    if (!vereadorId || !titulo || !mensagem) {
      return res.status(400).json({ error: 'Vereador, título e mensagem são obrigatórios' });
    }

    const db = await getConnection();
    
    // Verificar se já existe conversa entre eles
    const [existente] = await db.execute(`
      SELECT id FROM conversas 
      WHERE cidadao_id = ? AND vereador_id = ? AND status = 'ativa'
    `, [cidadaoId, vereadorId]);

    if (existente.length > 0) {
      return res.status(400).json({ error: 'Já existe uma conversa ativa com este vereador' });
    }

    // Criar primeira mensagem
    const primeiraMensagem = {
      id: 1,
      remetente_id: cidadaoId,
      remetente_tipo: 'cidadao',
      mensagem: mensagem,
      data: new Date().toISOString()
    };

    const mensagensJson = JSON.stringify([primeiraMensagem]);

    const [result] = await db.execute(`
      INSERT INTO conversas (cidadao_id, vereador_id, titulo, mensagens, ultima_mensagem_data) 
      VALUES (?, ?, ?, ?, NOW())
    `, [cidadaoId, vereadorId, titulo, mensagensJson]);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Conversa iniciada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao iniciar conversa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Enviar mensagem em uma conversa
app.post("/api/conversas/:id/mensagens", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { mensagem } = req.body;
    const userId = req.user.id;

    if (!mensagem || !mensagem.trim()) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    const db = await getConnection();
    
    // Buscar conversa e verificar permissão
    const [conversas] = await db.execute(`
      SELECT * FROM conversas 
      WHERE id = ? AND (cidadao_id = ? OR vereador_id = ?) AND status = 'ativa'
    `, [id, userId, userId]);

    if (conversas.length === 0) {
      return res.status(404).json({ error: 'Conversa não encontrada ou sem permissão' });
    }

    const conversa = conversas[0];
    const mensagensExistentes = typeof conversa.mensagens === 'string' 
      ? JSON.parse(conversa.mensagens || '[]')
      : (conversa.mensagens || []);
    
    // Criar nova mensagem
    const novaMensagem = {
      id: mensagensExistentes.length + 1,
      remetente_id: userId,
      remetente_tipo: req.user.tipo,
      mensagem: mensagem.trim(),
      data: new Date().toISOString()
    };

    const novasMensagens = [...mensagensExistentes, novaMensagem];
    const mensagensJson = JSON.stringify(novasMensagens);

    await db.execute(`
      UPDATE conversas 
      SET mensagens = ?, ultima_mensagem_data = NOW(), atualizada_em = NOW()
      WHERE id = ?
    `, [mensagensJson, id]);

    res.json({ 
      message: 'Mensagem enviada com sucesso',
      mensagem: novaMensagem
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//=============================================================================
// ROTAS ADMIN - LEIS MUNICIPAIS
//=============================================================================

// Listar todas as leis (admin)
app.get("/api/admin/leis", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getConnection();
    const [leis] = await db.execute(`
      SELECT l.*, u.nome as autor_nome
      FROM leis l
      LEFT JOIN usuarios u ON l.autor_id = u.id
      ORDER BY l.ano DESC, l.numero DESC
    `);
    res.json(leis);
  } catch (error) {
    console.error('Erro ao buscar leis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova lei (admin)
app.post("/api/admin/leis", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { numero, ano, tipo, titulo, ementa, texto_completo, status, data_publicacao } = req.body;
    const autorId = req.user.id;

    if (!numero || !ano || !titulo || !tipo) {
      return res.status(400).json({ error: 'Número, ano, título e tipo são obrigatórios' });
    }

    const db = await getConnection();
    
    // Verificar se já existe lei com mesmo número/ano/tipo
    const [existing] = await db.execute(
      'SELECT id FROM leis WHERE numero = ? AND ano = ? AND tipo = ?',
      [numero, ano, tipo]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Já existe uma lei com este número, ano e tipo' });
    }

    const [result] = await db.execute(`
      INSERT INTO leis (numero, ano, tipo, titulo, ementa, texto_completo, autor_id, status, data_publicacao) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [numero, ano, tipo, titulo, ementa || null, texto_completo || null, autorId, status || 'tramitacao', data_publicacao || null]);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Lei criada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar lei:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Já existe uma lei com este número, ano e tipo' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// Buscar lei específica (admin)
app.get("/api/admin/leis/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    
    const [leis] = await db.execute(`
      SELECT l.*, u.nome as autor_nome
      FROM leis l
      LEFT JOIN usuarios u ON l.autor_id = u.id
      WHERE l.id = ?
    `, [id]);

    if (leis.length === 0) {
      return res.status(404).json({ error: 'Lei não encontrada' });
    }

    res.json(leis[0]);
  } catch (error) {
    console.error('Erro ao buscar lei:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar lei (admin)
app.put("/api/admin/leis/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, ano, tipo, titulo, ementa, texto_completo, status, data_publicacao } = req.body;

    if (!numero || !ano || !titulo || !tipo) {
      return res.status(400).json({ error: 'Número, ano, título e tipo são obrigatórios' });
    }

    const db = await getConnection();
    
    // Verificar se já existe outra lei com mesmo número/ano/tipo
    const [existing] = await db.execute(
      'SELECT id FROM leis WHERE numero = ? AND ano = ? AND tipo = ? AND id != ?',
      [numero, ano, tipo, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Já existe outra lei com este número, ano e tipo' });
    }

    const [result] = await db.execute(`
      UPDATE leis 
      SET numero = ?, ano = ?, tipo = ?, titulo = ?, ementa = ?, texto_completo = ?, status = ?, data_publicacao = ?
      WHERE id = ?
    `, [numero, ano, tipo, titulo, ementa || null, texto_completo || null, status, data_publicacao || null, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lei não encontrada' });
    }

    res.json({ message: 'Lei atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar lei:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Já existe outra lei com este número, ano e tipo' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// Excluir lei (admin)
app.delete("/api/admin/leis/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    
    const [result] = await db.execute('DELETE FROM leis WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lei não encontrada' });
    }

    res.json({ message: 'Lei excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir lei:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//=============================================================================
// ROTAS ADMIN - PROPOSTAS/PROPOSITURAS
//=============================================================================

// Listar todas as propostas (admin)
app.get("/api/admin/propostas", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getConnection();
    const [propostas] = await db.execute(`
      SELECT p.*, u.nome as autor_nome
      FROM propostas p
      LEFT JOIN usuarios u ON p.autor_id = u.id
      ORDER BY p.ano DESC, p.numero DESC
    `);
    res.json(propostas);
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova proposta (admin)
app.post("/api/admin/propostas", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { numero, ano, tipo, titulo, resumo, justificativa, autor_id, status, data_protocolo } = req.body;

    if (!numero || !ano || !titulo || !tipo || !autor_id) {
      return res.status(400).json({ error: 'Número, ano, título, tipo e autor são obrigatórios' });
    }

    const db = await getConnection();
    
    // Verificar se já existe proposta com mesmo número/ano/tipo
    const [existing] = await db.execute(
      'SELECT id FROM propostas WHERE numero = ? AND ano = ? AND tipo = ?',
      [numero, ano, tipo]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Já existe uma proposta com este número, ano e tipo' });
    }

    const [result] = await db.execute(`
      INSERT INTO propostas (numero, ano, tipo, titulo, resumo, justificativa, autor_id, status, data_protocolo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [numero, ano, tipo, titulo, resumo || null, justificativa || null, autor_id, status || 'protocolado', data_protocolo || null]);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Proposta criada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Já existe uma proposta com este número, ano e tipo' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// Buscar proposta específica (admin)
app.get("/api/admin/propostas/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    
    const [propostas] = await db.execute(`
      SELECT p.*, u.nome as autor_nome
      FROM propostas p
      LEFT JOIN usuarios u ON p.autor_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (propostas.length === 0) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    res.json(propostas[0]);
  } catch (error) {
    console.error('Erro ao buscar proposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar proposta (admin)
app.put("/api/admin/propostas/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, ano, tipo, titulo, resumo, justificativa, autor_id, status, data_protocolo } = req.body;

    if (!numero || !ano || !titulo || !tipo || !autor_id) {
      return res.status(400).json({ error: 'Número, ano, título, tipo e autor são obrigatórios' });
    }

    const db = await getConnection();
    
    // Verificar se já existe outra proposta com mesmo número/ano/tipo
    const [existing] = await db.execute(
      'SELECT id FROM propostas WHERE numero = ? AND ano = ? AND tipo = ? AND id != ?',
      [numero, ano, tipo, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Já existe outra proposta com este número, ano e tipo' });
    }

    const [result] = await db.execute(`
      UPDATE propostas 
      SET numero = ?, ano = ?, tipo = ?, titulo = ?, resumo = ?, justificativa = ?, autor_id = ?, status = ?, data_protocolo = ?
      WHERE id = ?
    `, [numero, ano, tipo, titulo, resumo || null, justificativa || null, autor_id, status, data_protocolo || null, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    res.json({ message: 'Proposta atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar proposta:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Já existe outra proposta com este número, ano e tipo' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

// Excluir proposta (admin)
app.delete("/api/admin/propostas/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    
    const [result] = await db.execute('DELETE FROM propostas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    res.json({ message: 'Proposta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir proposta:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//=============================================================================
// ROTAS ADMIN - ORDEM DO DIA
//=============================================================================

// Listar todas as sessões (admin)
app.get("/api/admin/ordem-dia", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const db = await getConnection();
    const [sessoes] = await db.execute(`
      SELECT * FROM ordem_dia 
      ORDER BY data_sessao DESC, hora_inicio DESC
    `);
    res.json(sessoes);
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova sessão (admin)
app.post("/api/admin/ordem-dia", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data_sessao, numero_sessao, tipo_sessao, hora_inicio, local, pauta, status } = req.body;

    if (!data_sessao || !numero_sessao || !tipo_sessao) {
      return res.status(400).json({ error: 'Data, número e tipo da sessão são obrigatórios' });
    }

    const db = await getConnection();
    
    const [result] = await db.execute(`
      INSERT INTO ordem_dia (data_sessao, numero_sessao, tipo_sessao, hora_inicio, local, pauta, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [data_sessao, numero_sessao, tipo_sessao, hora_inicio || null, local || 'Plenário da Câmara Municipal', pauta || null, status || 'agendada']);

    res.status(201).json({ 
      id: result.insertId,
      message: 'Sessão criada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar sessão específica (admin)
app.get("/api/admin/ordem-dia/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    
    const [sessoes] = await db.execute(`
      SELECT * FROM ordem_dia WHERE id = ?
    `, [id]);

    if (sessoes.length === 0) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    res.json(sessoes[0]);
  } catch (error) {
    console.error('Erro ao buscar sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar sessão (admin)
app.put("/api/admin/ordem-dia/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data_sessao, numero_sessao, tipo_sessao, hora_inicio, local, pauta, ata, status } = req.body;

    if (!data_sessao || !numero_sessao || !tipo_sessao) {
      return res.status(400).json({ error: 'Data, número e tipo da sessão são obrigatórios' });
    }

    const db = await getConnection();
    
    const [result] = await db.execute(`
      UPDATE ordem_dia 
      SET data_sessao = ?, numero_sessao = ?, tipo_sessao = ?, hora_inicio = ?, local = ?, pauta = ?, ata = ?, status = ?
      WHERE id = ?
    `, [data_sessao, numero_sessao, tipo_sessao, hora_inicio || null, local || 'Plenário da Câmara Municipal', pauta || null, ata || null, status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    res.json({ message: 'Sessão atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Excluir sessão (admin)
app.delete("/api/admin/ordem-dia/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    
    const [result] = await db.execute('DELETE FROM ordem_dia WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    res.json({ message: 'Sessão excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir sessão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//=============================================================================
// ROTAS DE RELATÓRIOS
//=============================================================================

// Gerar relatório de atividades (admin)
app.post("/api/admin/relatorios/atividades", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { usuario_id, data_inicio, data_fim } = req.body;

    if (!usuario_id || !data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Usuário, data de início e data de fim são obrigatórios' });
    }

    const db = await getConnection();
    
    // Buscar usuário
    const [usuario] = await db.execute(
      'SELECT id, nome, email FROM usuarios WHERE id = ?',
      [usuario_id]
    );

    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar atividades (notícias, propostas, leis)
    const [atividades] = await db.execute(`
      SELECT 'noticia' as tipo, n.id, n.titulo, n.created_at as data_atividade, n.autor_id
      FROM noticias n
      WHERE n.autor_id = ? AND n.created_at BETWEEN ? AND ?
      
      UNION ALL
      
      SELECT 'proposta' as tipo, p.id, p.titulo, p.created_at as data_atividade, p.autor_id
      FROM propostas p
      WHERE p.autor_id = ? AND p.created_at BETWEEN ? AND ?
      
      UNION ALL
      
      SELECT 'lei' as tipo, l.id, l.titulo, l.data_publicacao as data_atividade, l.autor_id
      FROM leis l
      WHERE l.autor_id = ? AND l.data_publicacao BETWEEN ? AND ?
      
      ORDER BY data_atividade DESC
    `, [usuario_id, data_inicio, data_fim, usuario_id, data_inicio, data_fim, usuario_id, data_inicio, data_fim]);

    res.json({ 
      usuario: usuario[0],
      atividades 
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de atividades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerar relatório de mensagens trocadas (admin)
app.post("/api/admin/relatorios/mensagens", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { usuario_id, data_inicio, data_fim } = req.body;

    if (!usuario_id || !data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Usuário, data de início e data de fim são obrigatórios' });
    }

    const db = await getConnection();
    
    // Buscar usuário
    const [usuario] = await db.execute(
      'SELECT id, nome, email FROM usuarios WHERE id = ?',
      [usuario_id]
    );

    if (usuario.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar mensagens enviadas e recebidas
    const [mensagens] = await db.execute(`
      SELECT m.*, 
             u.nome as usuario_nome, 
             u.email as usuario_email,
             CASE 
               WHEN m.remetente_id = ? THEN 'enviada'
               WHEN m.destinatario_id = ? THEN 'recebida'
             END as tipo_mensagem
      FROM mensagens m
      INNER JOIN usuarios u ON (m.remetente_id = u.id OR m.destinatario_id = u.id)
      WHERE (m.remetente_id = ? OR m.destinatario_id = ?) 
        AND m.data_envio BETWEEN ? AND ?
      ORDER BY m.data_envio DESC
    `, [usuario_id, usuario_id, usuario_id, usuario_id, data_inicio, data_fim]);

    res.json({ 
      usuario: usuario[0],
      mensagens 
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware para tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas (removido temporariamente para evitar erro de path-to-regexp)

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
