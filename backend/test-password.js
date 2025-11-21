const bcrypt = require('bcryptjs');

const hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4wjx9J8K.2';
const senha = '123456';

console.log('Testando senha "123456" contra o hash...');
console.log('Hash:', hash);

bcrypt.compare(senha, hash, (err, result) => {
  if (err) {
    console.error('Erro:', err);
  } else {
    console.log('Senha válida:', result);
  }
});

// Testar também com password123
bcrypt.compare('password123', hash, (err, result) => {
  if (err) {
    console.error('Erro:', err);
  } else {
    console.log('Senha "password123" válida:', result);
  }
});

// Gerar um novo hash para 123456
bcrypt.hash('123456', 12, (err, newHash) => {
  if (err) {
    console.error('Erro ao gerar hash:', err);
  } else {
    console.log('Novo hash para "123456":', newHash);
  }
});
