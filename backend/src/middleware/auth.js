const jwt = require('jsonwebtoken');
const { getConnection } = require('../database/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_aqui';

// Middleware para verificar token JWT
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se o token ainda está válido na base de dados
    const connection = getConnection();
    const [rows] = await connection.execute(
      'SELECT u.*, s.expires_at FROM usuarios u JOIN sessoes s ON u.id = s.usuario_id WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.ativo = true',
      [token.substring(0, 64)] // Usar parte do token como hash
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      tipo: decoded.tipo,
      nome: rows[0].nome
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
}

// Middleware para verificar tipos específicos de usuário
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!roles.includes(req.user.tipo)) {
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }

    next();
  };
}

// Middleware específico para admin
const requireAdmin = requireRole(['admin']);

// Middleware específico para vereador
const requireVereador = requireRole(['vereador', 'admin']);

// Middleware que permite cidadão, vereador ou admin
const requireUser = requireRole(['cidadao', 'vereador', 'admin']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireVereador,
  requireUser,
  JWT_SECRET
};
