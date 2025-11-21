# 🐳 Instruções para Inicializar o Ambiente

## ⚠️ Pré-requisitos
1. **Instalar Docker Desktop**: https://www.docker.com/products/docker-desktop
2. **Iniciar Docker Desktop** e aguardar ele ficar disponível

## 🚀 Como executar

### Opção 1: Script automático
```bash
cd camara-santana-parnaiba-app
./start-dev.sh
```

### Opção 2: Comandos manuais
```bash
cd camara-santana-parnaiba-app

# Iniciar ambiente
docker-compose up --build -d

# Aguardar 15-20 segundos para MySQL inicializar

# Verificar se está funcionando
docker-compose ps
curl http://localhost:3000/api/noticias
```

## 📊 Verificar logs
```bash
# Logs do backend
docker-compose logs -f backend

# Logs do MySQL
docker-compose logs -f mysql

# Todos os logs
docker-compose logs -f
```

## 🔍 Testar API

### 1. Registrar usuário:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Teste",
    "email": "joao@teste.com",
    "senha": "123456789"
  }'
```

### 2. Fazer login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "senha": "123456789"
  }'
```

### 3. Buscar notícias:
```bash
curl http://localhost:3000/api/noticias
```

### 4. Buscar vereadores:
```bash
curl http://localhost:3000/api/vereadores
```

## 🛑 Parar ambiente
```bash
docker-compose down
```

## 🗄️ Acessar MySQL diretamente
```bash
docker-compose exec mysql mysql -u camara_user -p
# Senha: camara_password

# Dentro do MySQL:
USE camara_db;
SHOW TABLES;
SELECT * FROM usuarios;
```

---

**⚡ Depois que o ambiente estiver rodando, você pode atualizar o frontend para usar as novas rotas da API!**
