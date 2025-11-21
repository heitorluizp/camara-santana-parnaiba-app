# API Câmara de Santana de Parnaíba

Sistema completo com backend API, banco de dados MySQL e autenticação JWT para o aplicativo da Câmara Municipal.

## 🚀 Início Rápido

### Pré-requisitos
- Docker e Docker Compose instalados
- Git

### Executar o sistema

```bash
# 1. Clonar e navegar para o diretório
cd camara-santana-parnaiba-app

# 2. Iniciar ambiente completo
./start-dev.sh
```

O script irá:
- Inicializar MySQL com dados de exemplo
- Subir a API backend na porta 3000
- Configurar todas as tabelas necessárias

## 📋 Endpoints da API

### Autenticação

```http
POST /api/auth/register    # Cadastro de cidadão
POST /api/auth/login       # Login
POST /api/auth/logout      # Logout
POST /api/auth/refresh-token # Renovar token
GET  /api/auth/me          # Dados do usuário logado
```

### Públicas

```http
GET /api/noticias          # Listar notícias
GET /api/noticias/:id      # Buscar notícia por ID
GET /api/vereadores        # Listar vereadores
GET /api/vereadores/:id    # Buscar vereador por ID
GET /api/leis?q=termo      # Buscar leis (com filtro opcional)
GET /api/propostas?q=termo # Buscar propostas (com filtro opcional)
GET /api/ordem-dia         # Ordem do dia das sessões
```

### Protegidas (requer autenticação)

```http
POST /api/vereadores/:id/mensagens  # Enviar mensagem para vereador
GET  /api/conversas                 # Listar conversas do usuário
```

### Admin (requer admin)

```http
GET    /api/admin/noticias        # Listar todas as notícias (publicadas e rascunhos)
POST   /api/admin/noticias        # Criar nova notícia
GET    /api/admin/noticias/:id    # Obter notícia específica para edição
PUT    /api/admin/noticias/:id    # Editar notícia existente
DELETE /api/admin/noticias/:id    # Excluir notícia
POST   /api/admin/upload-imagem   # Upload de imagem para notícias
```

### Upload de Imagens

O endpoint `/api/admin/upload-imagem` aceita:
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Field**: `imagem` (arquivo de imagem)
- **Limite**: 5MB
- **Formatos**: jpg, png, gif, webp, etc.
- **Retorno**: `{ "url": "http://localhost:3000/uploads/noticias/filename.jpg" }`

Imagens são salvas em `/uploads/noticias/` e acessíveis via URL pública.

## 🗄️ Estrutura do Banco de Dados

### Tabelas principais:

- **usuarios**: Cidadãos, vereadores e admins
- **vereadores**: Dados específicos dos vereadores
- **sessoes**: Controle de tokens JWT
- **noticias**: Notícias da câmara
- **leis**: Leis municipais
- **propostas**: Projetos de lei, emendas, etc.
- **mensagens**: Chat entre cidadãos e vereadores
- **ordem_dia**: Pautas das sessões
- **notificacoes**: Sistema de notificações

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) com:

- **Access Token**: 24 horas de validade
- **Refresh Token**: 30 dias de validade
- **Controle de sessões**: Tokens armazenados no banco
- **Tipos de usuário**: cidadao, vereador, admin

### Dados de teste:

**Admin:**
- Email: admin@camara.sp.gov.br
- Senha: 123456

**Vereadores:**
- Email: joao.silva@camara.sp.gov.br / maria.souza@camara.sp.gov.br
- Senha: 123456

## 📱 Integração Mobile

A API está preparada para aplicativos **Android** e **iOS** com:

- CORS configurado para Capacitor
- Autenticação JWT stateless
- Endpoints RESTful
- Tratamento adequado de erros
- Rate limiting de segurança

## 🛠️ Desenvolvimento

### Estrutura de arquivos:

```
backend/
├── src/
│   ├── controllers/        # Lógica de negócio
│   ├── database/          # Conexão com MySQL
│   ├── middleware/        # Middlewares (auth, etc)
│   ├── routes/           # Definição de rotas
│   └── server.js         # Servidor principal
├── database/
│   └── init.sql          # Script de inicialização
├── Dockerfile
└── package.json
```

### Comandos úteis:

```bash
# Ver logs do backend
docker-compose logs -f backend

# Ver logs do MySQL
docker-compose logs -f mysql

# Acessar MySQL
docker-compose exec mysql mysql -u camara_user -p camara_db

# Parar tudo
docker-compose down

# Rebuild completo
docker-compose down && docker-compose up --build
```

## 🔧 Configuração

Principais variáveis de ambiente (`.env`):

```env
DB_HOST=mysql
DB_PORT=3306
DB_NAME=camara_db
DB_USER=camara_user
DB_PASSWORD=camara_password
JWT_SECRET=seu_jwt_secret_super_seguro
PORT=3000
```

## 🚨 Segurança

- Senhas hasheadas com bcrypt (12 rounds)
- JWT com refresh tokens
- Helmet.js para headers de segurança
- Validação de entrada com Joi
- Rate limiting implementado
- CORS restrito por ambiente

## 📝 Próximos passos

Para o frontend mobile (React Native/Capacitor), use os endpoints acima com:

1. Armazenar tokens no storage seguro
2. Interceptors para renovação automática
3. Tratamento de offline/online
4. Push notifications integration

---

**Desenvolvido para Câmara Municipal de Santana de Parnaíba** 🏛️
