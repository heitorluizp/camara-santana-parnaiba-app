# Sistema de Placeholders para Imagens em Notícias

## Como Funciona

O sistema permite ao administrador escolher exatamente onde as imagens aparecerão no texto da notícia usando placeholders no formato `[IMAGEM-X]`.

## Interface do Admin

### Upload de Imagens
1. **Imagem Principal**: Upload único via campo "Imagem da Notícia"
2. **Imagens Adicionais**: Upload múltiplo via campo "Imagens Adicionais"

### Inserção de Placeholders
- Após fazer upload das imagens, aparecem botões para cada imagem
- **Imagens Novas** (ainda não salvas): botões azuis "🖼️ Nova X" 
- **Imagens Existentes** (já salvas): botões verdes "🖼️ Img X"
- Clique no botão para inserir o placeholder `[IMAGEM-X]` na posição do cursor no texto

### Preview em Tempo Real
- Quando há placeholders no texto, aparece uma seção "Preview do Conteúdo"
- Mostra como o texto ficará com as imagens inseridas nos locais dos placeholders

## Como os Placeholders Funcionam

### Formato
- `[IMAGEM-1]` - Primeira imagem da lista
- `[IMAGEM-2]` - Segunda imagem da lista
- `[IMAGEM-3]` - Terceira imagem da lista
- E assim por diante...

### Processamento
1. **No Admin**: Preview em tempo real substitui placeholders por `<img>` tags
2. **No Frontend Público**: Função `processarConteudoComImagens()` substitui placeholders pelas imagens reais

### Exemplo de Uso

```
Este é o início da notícia com texto introdutório.

[IMAGEM-1]

Aqui continua o texto após a primeira imagem. Mais conteúdo explicativo.

[IMAGEM-2]

E aqui temos mais texto após a segunda imagem.

[IMAGEM-3]

Final da notícia.
```

## Galeria de Imagens

- **Frontend Público**: Apenas imagens SEM placeholders correspondentes aparecem na galeria
- **Evita Duplicação**: Imagens já exibidas no texto via placeholders não aparecem novamente na galeria
- **Organização**: Mantém o conteúdo limpo e bem estruturado

## Vantagens

1. **Controle Total**: Admin escolhe onde cada imagem aparece
2. **Flexibilidade**: Pode intercalar texto e imagens livremente  
3. **Preview**: Visualização em tempo real do resultado final
4. **Sem Duplicação**: Imagens usadas no texto não aparecem na galeria
5. **Responsivo**: Imagens se adaptam ao tamanho da tela
6. **Acessibilidade**: Suporte a alt text e descrições

## Estrutura Técnica

### Backend
- Tabela `noticia_imagens` armazena imagens adicionais
- Endpoint para upload múltiplo: `POST /api/admin/noticias/upload-multiplo`
- Endpoints CRUD para imagens: `POST/DELETE /api/admin/noticias/:id/imagens`

### Frontend
- `processarConteudoComImagens()` converte placeholders em HTML
- Preview em tempo real no admin
- Galeria inteligente que evita duplicações
- Upload com drag & drop e preview das imagens

## Correções Importantes

### Regex com Colchetes
Os placeholders contêm colchetes `[IMAGEM-X]` que são caracteres especiais em regex. Para evitar erros, é necessário escapar esses caracteres:

```javascript
// ❌ ERRO - causa "Range out of order in character class"
conteudoProcessado = conteudoProcessado.replace(new RegExp(placeholder, 'g'), imagemHtml);

// ✅ CORRETO - escapa os colchetes
const placeholderEscapado = placeholder.replace(/[[\]]/g, '\\$&');
conteudoProcessado = conteudoProcessado.replace(new RegExp(placeholderEscapado, 'g'), imagemHtml);
```
