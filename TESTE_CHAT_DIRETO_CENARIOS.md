# Teste do Chat Direto com Vereador - Cenários ✅

## Data: 21 de novembro de 2024

## Cenários de Teste

### 📋 Base de Dados Atual
```json
Conversas existentes:
- ID 4: cidadao(6) ↔ vereador(1) - "Administrador"
- ID 3: cidadao(6) ↔ vereador(4) - "Maria Santos"  
- ID 2: cidadao(6) ↔ vereador(5) - "Carlos Oliveira"
- ID 1: cidadao(6) ↔ vereador(3) - "João Silva"

Usuario logado: José Cidadão (ID: 6, tipo: cidadao)
```

### 🧪 Cenário 1: Conversa EXISTENTE
**Teste**: Acessar `/vereadores/1` e clicar "Ir para o Chat"
**Esperado**: 
- Alert: "Conversa existente encontrada! Abrindo conversa com Administrador"
- Navegar para: `/conversas/4`
- Abrir conversa diretamente (SEM modal)

### 🧪 Cenário 2: Conversa NÃO EXISTENTE  
**Teste**: Acessar `/vereadores/2` e clicar "Ir para o Chat"
**Esperado**:
- Alert: "Criando nova conversa com {nome do vereador 2}"
- Navegar para: `/conversas` 
- Abrir modal com vereador pré-selecionado

### 🧪 Cenário 3: Navegação Direta
**Teste**: Acessar diretamente `/conversas/4`
**Esperado**:
- Abrir conversa específica automaticamente
- Mostrar histórico de mensagens

## 🔍 Debug Logs Esperados

### VereadorDetalhe.jsx
```
🔍 handleIrParaChat chamado - dados do vereador: {id: 1, nome: "Administrador"...}
🔑 Token encontrado: true
📡 Response status: 200
💬 Conversas encontradas: 4
🔍 Conversa existente: {id: 4, vereador_id: 1...}
➡️ Navegando para conversa existente: 4
```

### Chat.jsx
```
🔍 Chat: Verificando conversa específica
🔍 conversaId: "4"
🔍 conversas.length: 4
🔍 Conversa encontrada: {id: 4, vereador_id: 1...}
✅ Setando conversa ativa: 4
```

## ✅ Checklist de Teste
- [ ] Login como cidadão (cidadao@teste.com / 123456)
- [ ] Testar vereador COM conversa existente (ID 1, 3, 4, 5)
- [ ] Testar vereador SEM conversa existente (ID 2, 6, etc)
- [ ] Verificar alerts corretos
- [ ] Verificar navegação correta
- [ ] Verificar abertura de modal vs conversa direta
- [ ] Testar URL direta `/conversas/4`

## 🐛 Possíveis Problemas
1. **Token não sendo salvo**: Verificar localStorage
2. **Conversa não encontrada**: Verificar comparação de IDs (string vs number)
3. **Modal não abrindo**: Verificar estado da navegação
4. **Conversa não carregando**: Verificar useEffect dependencies

## 🎯 Resultado Esperado
- **Fluxo otimizado**: 1 click para conversa existente
- **UX intuitiva**: Modal pré-preenchido para nova conversa  
- **Navegação inteligente**: Sistema detecta contexto automaticamente
