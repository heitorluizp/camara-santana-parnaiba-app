# Upload de Perfil e Edição de Vereadores - Implementação Completa

## Resumo das Alterações

Implementação completa do sistema de upload de foto de perfil e edição de dados específicos de vereadores no backoffice/admin.

## Backend - Alterações em `backend/src/server.js`

### 1. Nova Configuração de Upload para Perfil
```javascript
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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '').replace(ext, '');
    cb(null, `vereador-${name}-${uniqueSuffix}${ext}`);
  }
});

const uploadPerfil = multer({ 
  storage: perfilStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('O arquivo deve ser uma imagem (jpg, png, gif, etc.)'), false);
    }
  }
});
```

### 2. Novas Rotas Implementadas

#### Upload de Foto de Perfil
- **POST** `/api/admin/usuarios/:id/foto`
- Middleware: `authenticateToken`, `requireAdmin`, `uploadPerfil.single('foto')`
- Funcionalidade: Upload de foto de perfil para qualquer usuário
- Validações: Tamanho máximo 2MB, apenas imagens
- Retorna: URL da foto salva

#### Buscar Dados Completos de Usuário
- **GET** `/api/admin/usuarios/:id`
- Middleware: `authenticateToken`, `requireAdmin`
- Funcionalidade: Busca dados do usuário + dados específicos de vereador (se aplicável)
- Retorna: Dados completos incluindo `dadosVereador` se o tipo for 'vereador'

#### Atualizar Dados Específicos de Vereador
- **PUT** `/api/admin/usuarios/:id/vereador`
- Middleware: `authenticateToken`, `requireAdmin`
- Funcionalidade: Criar/atualizar registro na tabela `vereadores`
- Campos suportados:
  - `descricao`: Biografia/descrição do vereador
  - `mandato_inicio`: Data de início do mandato
  - `mandato_fim`: Data de fim do mandato
  - `partido`: Partido político
  - `dados_publicos`: Informações detalhadas do mandato
  - `contato_publico`: Email/telefone público
  - `gabinete`: Número/nome do gabinete
  - `comissoes`: Comissões que participa

## Frontend - Alterações em `frontend/src/pages/admin/AdminUsuarios.jsx`

### 1. Novos Estados
```javascript
const [form, setForm] = useState({
  // ... campos existentes
  foto_url: "",
  // Campos específicos de vereador
  descricao: "",
  mandato_inicio: "",
  mandato_fim: "",
  partido: "",
  dados_publicos: "",
  contato_publico: "",
  gabinete: "",
  comissoes: ""
});
const [fotoFile, setFotoFile] = useState(null);
const [uploadingFoto, setUploadingFoto] = useState(false);
```

### 2. Novas Funções

#### Upload de Foto
```javascript
async function uploadFoto(usuarioId) {
  // Validação: máximo 2MB, apenas imagens
  // Upload via FormData para /api/admin/usuarios/:id/foto
  // Retorna URL da foto salva
}
```

#### Salvar Dados de Vereador
```javascript
async function salvarDadosVereador(usuarioId) {
  // Salva dados específicos na tabela vereadores
  // Apenas executado se tipo === 'vereador'
}
```

#### Buscar Dados Completos
```javascript
async function handleEdit(usuario) {
  // Busca dados completos via GET /api/admin/usuarios/:id
  // Popula formulário com dados básicos + dados de vereador
}
```

### 3. Interface Atualizada

#### Campo de Upload de Foto
- Preview da foto atual (se existir)
- Input de upload com validação
- Máximo 2MB, formatos: JPG, PNG, GIF

#### Campos Específicos de Vereador
Aparecem condicionalmente quando `tipo === 'vereador'`:
- **Descrição/Biografia**: Textarea para biografia
- **Partido**: Campo de texto
- **Gabinete**: Número/nome do gabinete
- **Mandato Início/Fim**: Campos de data
- **Contato Público**: Email/telefone público
- **Comissões**: Comissões que participa
- **Dados Públicos do Mandato**: Textarea para informações detalhadas

### 4. Fluxo de Salvamento Atualizado
1. Salvar/atualizar dados básicos do usuário
2. Se houver foto, fazer upload
3. Se for vereador, salvar dados específicos
4. Recarregar lista de usuários

## Estrutura de Banco de Dados

### Tabela `usuarios` (existente)
- `foto_url`: URL da foto de perfil

### Tabela `vereadores` (existente)
- `usuario_id`: FK para usuarios(id)
- `descricao`: Biografia/descrição
- `mandato_inicio`: Data início mandato
- `mandato_fim`: Data fim mandato
- `partido`: Partido político
- `dados_publicos`: Informações detalhadas
- `contato_publico`: Contato público
- `gabinete`: Gabinete
- `comissoes`: Comissões

## Arquivos Criados/Modificados

### Backend
- ✅ `backend/src/server.js`: Rotas de upload e dados de vereador
- ✅ Pasta `backend/uploads/perfil/`: Armazenamento de fotos

### Frontend
- ✅ `frontend/src/pages/admin/AdminUsuarios.jsx`: Interface completa

## Funcionalidades Implementadas

### ✅ Administração Completa de Vereadores
- Cadastro com dados básicos + específicos
- Upload de foto de perfil
- Edição de todos os campos
- Validações de upload (tamanho, tipo)
- Preview de foto atual

### ✅ Integração com App Público
- Fotos de perfil aparecem na listagem de vereadores
- Dados específicos aparecem na página de detalhes
- URL das fotos servida pelo backend

### ✅ Segurança e Validações
- Apenas admins podem gerenciar usuários
- Validação de tipo de arquivo (apenas imagens)
- Validação de tamanho (máximo 2MB)
- Limpeza de arquivos em caso de erro

## Como Usar

### 1. Acessar Admin
1. Entrar em `/admin`
2. Login com credenciais de admin
3. Ir em "Gerenciar Usuários"

### 2. Criar/Editar Vereador
1. Clicar em "Novo Usuário" ou "Editar" em um existente
2. Selecionar tipo "Vereador"
3. Preencher dados básicos (nome, email, telefone)
4. Fazer upload da foto de perfil
5. Preencher campos específicos do vereador
6. Salvar

### 3. Resultado no App
- Vereador aparece na listagem pública
- Foto de perfil é exibida
- Dados específicos aparecem na página de detalhes
- Sistema de chat funciona normalmente

## Arquivos de Exemplo

### URLs de Foto Geradas
```
http://localhost:3000/uploads/perfil/vereador-foto-1732188473628-123456789.jpg
```

### Estrutura de Dados Completos (GET /api/admin/usuarios/:id)
```json
{
  "id": 5,
  "nome": "João Silva",
  "email": "joao@vereador.com",
  "telefone": "(11) 99999-9999",
  "tipo": "vereador",
  "foto_url": "http://localhost:3000/uploads/perfil/vereador-foto-123.jpg",
  "createdAt": "2024-11-21T12:00:00.000Z",
  "updatedAt": "2024-11-21T12:30:00.000Z",
  "dadosVereador": {
    "descricao": "Vereador com foco em educação e saúde",
    "mandato_inicio": "2021-01-01",
    "mandato_fim": "2024-12-31",
    "partido": "PSDB",
    "dados_publicos": "Informações detalhadas do mandato...",
    "contato_publico": "joao.gabinete@camara.sp.gov.br",
    "gabinete": "Gabinete 15",
    "comissoes": "Educação, Saúde, Meio Ambiente"
  }
}
```

## Status: ✅ IMPLEMENTAÇÃO COMPLETA

Todas as funcionalidades solicitadas foram implementadas:
- ✅ Upload de foto de perfil para vereadores
- ✅ Edição completa de dados específicos de vereador
- ✅ Integração com app público
- ✅ Gerenciamento exclusivo pelo backoffice/admin
- ✅ Validações e segurança
- ✅ Interface amigável e responsiva

Pronto para uso e testes!
