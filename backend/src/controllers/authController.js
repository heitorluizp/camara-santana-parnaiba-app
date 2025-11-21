const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/connection');
const { JWT_SECRET } = require('../middleware/auth');
const Joi = require('joi');

// Schemas de validação
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  nome: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required(),
  telefone: Joi.string().optional()
});

// Função para gerar tokens
function generateTokens(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    tipo: user.tipo,
    nome: user.nome
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

  return { accessToken, refreshToken };
}

// Registro de novo usuário (cidadão)
async function register(req, res) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { nome, email, senha, telefone } = value;
    const connection = getConnection();

    // Verificar se email já existe
    const [existingUser] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Inserir usuário
    const [result] = await connection.execute(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo, telefone) 
       VALUES (?, ?, ?, 'cidadao', ?)`,
      [nome, email, senhaHash, telefone || null]
    );

    const userId = result.insertId;

    // Gerar tokens
    const user = { id: userId, email, tipo: 'cidadao', nome };
    const { accessToken, refreshToken } = generateTokens(user);

    // Salvar sessão na base de dados
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    await connection.execute(
      'INSERT INTO sessoes (usuario_id, token_hash, refresh_token_hash, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, accessToken.substring(0, 64), refreshToken.substring(0, 64), req.headers['user-agent'] || '', req.ip, expiresAt]
    );

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      user: {
        id: userId,
        nome,
        email,
        tipo: 'cidadao'
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Login de usuário
async function login(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, senha } = value;
    const connection = getConnection();

    // Buscar usuário
    const [users] = await connection.execute(
      'SELECT id, nome, email, senha_hash, tipo, ativo FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const user = users[0];

    if (!user.ativo) {
      return res.status(401).json({ error: 'Conta desativada. Entre em contato com o suporte.' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Salvar sessão na base de dados
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    await connection.execute(
      'INSERT INTO sessoes (usuario_id, token_hash, refresh_token_hash, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, accessToken.substring(0, 64), refreshToken.substring(0, 64), req.headers['user-agent'] || '', req.ip, expiresAt]
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
      },
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Logout
async function logout(req, res) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const connection = getConnection();
      await connection.execute(
        'DELETE FROM sessoes WHERE token_hash = ?',
        [token.substring(0, 64)]
      );
    }

    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Refresh token
async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requerido' });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const connection = getConnection();

    // Verificar se o refresh token existe na base de dados
    const [sessions] = await connection.execute(
      'SELECT u.* FROM usuarios u JOIN sessoes s ON u.id = s.usuario_id WHERE s.refresh_token_hash = ? AND s.expires_at > NOW() AND u.ativo = true',
      [refreshToken.substring(0, 64)]
    );

    if (sessions.length === 0) {
      return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
    }

    const user = sessions[0];

    // Gerar novos tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Atualizar sessão na base de dados
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await connection.execute(
      'UPDATE sessoes SET token_hash = ?, refresh_token_hash = ?, expires_at = ? WHERE refresh_token_hash = ?',
      [accessToken.substring(0, 64), newRefreshToken.substring(0, 64), expiresAt, refreshToken.substring(0, 64)]
    );

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Erro no refresh token:', error);
    res.status(401).json({ error: 'Refresh token inválido' });
  }
}

// Verificar se o usuário está autenticado
async function me(req, res) {
  try {
    const connection = getConnection();
    const [users] = await connection.execute(
      'SELECT id, nome, email, tipo, foto_url, telefone, created_at FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  me
};
