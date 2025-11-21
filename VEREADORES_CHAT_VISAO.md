# 👥 VISÃO DOS VEREADORES: Como Funciona o Chat

## 🎯 Resumo Executivo

Os **vereadores** têm uma experiência diferente dos cidadãos no chat:
- ✅ **Recebem** mensagens de cidadãos
- ✅ **Respondem** às conversas existentes  
- ❌ **NÃO podem** iniciar novas conversas
- 📱 **Interface adaptada** para mostrar informações dos cidadãos

## 📱 Interface do Vereador

### 🏠 Tela Principal (`/conversas`)
```
┌─────────────────────────────────────┐
│ 📥 Mensagens Recebidas        [   ] │
├─────────────────────────────────────┤
│ [JC] José Cidadão                   │
│      Problema na minha rua          │
│      Há 3 horas                     │
├─────────────────────────────────────┤
│ [MS] Maria Silva                    │
│      Dúvida sobre projeto           │
│      Ontem 14:30                    │
└─────────────────────────────────────┘
```

### 💬 Conversa Aberta
```
┌─────────────────────────────────────┐
│ ← José Cidadão                      │
│   Problema na minha rua             │
├─────────────────────────────────────┤
│ José (Hoje 15:27)                   │
│ 💬 Olá Vereador João, preciso falar │
│     sobre um buraco na minha rua... │
│                                     │
│ José (Hoje 18:37)                   │
│ 💬 Por favor, me respondam quando   │
│     puderem. É urgente!             │
│                                     │
│                      João (Agora)   │
│  Olá José! Já encaminhei sua 💬     │
│  solicitação para a equipe...       │
├─────────────────────────────────────┤
│ [Digite sua mensagem...]      [📤] │
└─────────────────────────────────────┘
```

## 🔧 Diferenças Técnicas

### 🔍 API do Vereador

#### Lista de Conversas:
```http
GET /api/conversas
Authorization: Bearer [token-vereador]

Response:
[
  {
    "id": 1,
    "titulo": "Problema na minha rua",
    "cidadao_nome": "José Cidadão",     // ← Nome do CIDADÃO
    "cidadao_foto": null,               // ← Foto do CIDADÃO  
    "ultima_mensagem_data": "...",
    "mensagens": [...] 
  }
]
```

#### Responder Mensagem:
```http
POST /api/conversas/1/mensagens
Authorization: Bearer [token-vereador]

Body: { "mensagem": "Resposta do vereador..." }
```

### 🎨 Interface Adaptada

#### Header da Conversa:
- **Cidadão vê**: "João Silva (PT)" 
- **Vereador vê**: "José Cidadão"

#### Lista de Conversas:
- **Cidadão vê**: "Minhas Conversas" + botão "+ Nova"
- **Vereador vê**: "Mensagens Recebidas" (sem botão Nova)

#### Avatares e Nomes:
- **Cidadão vê**: Avatar e nome do vereador
- **Vereador vê**: Avatar e nome do cidadão

## 🧪 Dados de Teste

### Login do Vereador:
- **Email**: `joao.silva@camara.sp.gov.br`
- **Senha**: `123456`
- **Tipo**: `vereador`

### Outros Vereadores:
- **Maria Santos**: `maria.santos@camara.sp.gov.br` / `123456`
- **Carlos Oliveira**: `carlos.oliveira@camara.sp.gov.br` / `123456`

## 📊 Exemplo de Uso Real

### 1. **Cidadão José** inicia conversa:
```
📱 José acessa /conversas → + Nova → Seleciona "João Silva"
📝 Título: "Problema na minha rua"  
💬 Mensagem: "Olá Vereador João, preciso falar sobre..."
```

### 2. **Vereador João** recebe e vê:
```
📱 João acessa /conversas
📥 Vê: "José Cidadão - Problema na minha rua - Há 10 min"
👆 Clica na conversa
📖 Lê as mensagens do José
✍️ Responde: "Olá José! Já encaminhei sua solicitação..."
```

### 3. **Cidadão José** vê a resposta:
```
📱 José volta em /conversas
📬 Vê conversa atualizada
📖 Lê resposta do vereador
💬 Pode continuar a conversa
```

## 🎯 Melhorias na Interface Mobile

### ✅ Implementadas:
1. **Layout responsivo** - Desktop: 2 colunas, Mobile: 1 coluna
2. **Botão voltar** - Mobile tem "←" para voltar à lista
3. **Tela cheia** - Mobile usa tela toda para chat ativo
4. **Touch otimizado** - Botões maiores, fácil de tocar

### 📱 Como Fica no Mobile:

#### Lista (Mobile):
```
┌─────────────────────┐
│ Mensagens Recebidas │
│ ─────────────────── │
│ [JC] José Cidadão   │
│      Problema...    │
│      Há 3h          │
│ ─────────────────── │
│ [MS] Maria Silva    │
│      Dúvida...      │
│      Ontem          │
└─────────────────────┘
```

#### Chat Ativo (Mobile):
```
┌─────────────────────┐
│ ← José Cidadão      │
│ ─────────────────── │
│ José (15:27)        │
│ 💬 Mensagem...      │
│                     │
│      João (Agora)   │
│   Resposta... 💬    │
│ ─────────────────── │
│ [Mensagem...] [📤]  │
└─────────────────────┘
```

## 🚀 Como Testar

### Para Vereadores:
1. **Login**: `joao.silva@camara.sp.gov.br` / `123456`
2. **Acesse**: `/conversas` 
3. **Veja**: Mensagens de "José Cidadão"
4. **Clique**: Na conversa para abrir
5. **Responda**: Digite e envie mensagem
6. **Mobile**: Use botão "←" para voltar

### Para Cidadãos:
1. **Login**: `cidadao@teste.com` / `123456`
2. **Acesse**: `/conversas`
3. **Veja**: Resposta do vereador na conversa
4. **Continue**: A conversa normalmente

---

**🎯 RESULTADO: Vereadores podem receber e responder mensagens dos cidadãos com interface adaptada e mobile otimizada!**
