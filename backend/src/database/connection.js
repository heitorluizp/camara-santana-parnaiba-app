const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'camara_user',
  password: process.env.DB_PASSWORD || 'camara_password',
  database: process.env.DB_NAME || 'camara_db',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  typeCast: function (field, next) {
    if (field.type === 'VAR_STRING') {
      return field.string();
    }
    return next();
  }
};

let pool;

async function createConnection() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Conexão com MySQL estabelecida');
    return pool;
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error);
    throw error;
  }
}

function getConnection() {
  if (!pool) {
    throw new Error('Pool de conexões não foi inicializado');
  }
  return pool;
}

module.exports = {
  createConnection,
  getConnection
};
