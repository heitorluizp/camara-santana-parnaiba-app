const mysql = require('mysql2/promise');

async function limparConversas() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'camara_user',
    password: process.env.DB_PASSWORD || 'camara_password',
    database: process.env.DB_NAME || 'camara_db'
  });

  try {
    console.log('🔄 Conectando ao banco de dados...');
    
    // Verificar total antes da limpeza
    const [before] = await connection.execute('SELECT COUNT(*) as total FROM conversas');
    console.log(`📊 Total de conversas antes da limpeza: ${before[0].total}`);
    
    // Verificar estrutura da tabela
    const [columns] = await connection.execute('DESCRIBE conversas');
    console.log('📋 Estrutura da tabela conversas:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
    // Verificar se existe campo 'lida'
    const temCampoLida = columns.some(col => col.Field === 'lida');
    if (temCampoLida) {
      console.log('⚠️  ATENÇÃO: Campo "lida" ainda existe na tabela!');
    } else {
      console.log('✅ Campo "lida" não existe na tabela (correto)');
    }
    
    // Limpar todas as conversas
    console.log('🗑️  Limpando todas as conversas...');
    await connection.execute('DELETE FROM conversas');
    
    // Resetar AUTO_INCREMENT
    console.log('🔄 Resetando AUTO_INCREMENT...');
    await connection.execute('ALTER TABLE conversas AUTO_INCREMENT = 1');
    
    // Verificar total após limpeza
    const [after] = await connection.execute('SELECT COUNT(*) as total FROM conversas');
    console.log(`📊 Total de conversas após limpeza: ${after[0].total}`);
    
    console.log('✅ Limpeza concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error.message);
  } finally {
    await connection.end();
  }
}

limparConversas();
