# Sistema de Múltiplas Imagens por Notícia

## ✅ Implementado

### Backend
- **Tabela `noticia_imagens`**: Criada para armazenar múltiplas imagens por notícia
- **Endpoints API**:
  - `POST /api/admin/upload-imagens-multiplas` - Upload de até 10 imagens
  - `POST /api/admin/noticias/:id/imagens` - Adicionar imagens a uma notícia
  - `GET /api/admin/noticias/:id/imagens` - Listar imagens de uma notícia
  - `DELETE /api/admin/noticias/:noticiaId/imagens/:imagemId` - Remover imagem
- **CORS atualizado**: Adicionada porta 5176 para desenvolvimento
- **Configuração multer**: Suporte para upload múltiplo com limite de 10 imagens

### Frontend Admin (AdminNoticias.jsx)
- **Estados adicionados**:
  - `selectedImages`: Para novas imagens selecionadas
  - `imagensAdicionais`: Para imagens já existentes da notícia
- **Interface de upload múltiplo**:
  - Campo de input com `multiple` para selecionar várias imagens
  - Preview das imagens selecionadas antes do upload
  - Exibição das imagens já existentes com botão de remoção
- **Funções implementadas**:
  - `handleMultipleImageUpload()`: Upload de múltiplas imagens
  - `addImagesToNoticia()`: Adicionar imagens à notícia
  - `removeImagemAdicional()`: Remover imagens existentes

### Frontend Público (NoticiaDetalhe.jsx)
- **Galeria de imagens**: Exibe todas as imagens adicionais da notícia
- **Layout responsivo**: Grid que se adapta ao tamanho da tela
- **Interatividade**: Click nas imagens para abrir em nova aba
- **Descrições**: Suporte para legendas nas imagens

### Banco de Dados
```sql
CREATE TABLE noticia_imagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    noticia_id INT NOT NULL,
    url_imagem VARCHAR(500) NOT NULL,
    descricao VARCHAR(255),
    ordem INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (noticia_id) REFERENCES noticias(id) ON DELETE CASCADE,
    INDEX idx_noticia_id (noticia_id),
    INDEX idx_ordem (ordem)
);
```

## 🎯 Como Usar

### No Backoffice (Admin)
1. Acesse `/admin/noticias`
2. Faça login com admin@camara.sp.gov.br / 123456
3. Clique em "Nova Notícia" ou "Editar" uma notícia existente
4. Na seção "Imagens Adicionais":
   - Selecione múltiplas imagens (máximo 10)
   - Veja o preview das imagens selecionadas
   - Salve a notícia para fazer upload
5. Para remover imagens existentes, clique no "×" sobre a imagem

### No App Público
1. Acesse uma notícia que tenha imagens adicionais
2. Role até a seção "Galeria de Imagens"
3. Clique em qualquer imagem para abri-la em tamanho maior

## 🔧 Características Técnicas

- **Limite**: Máximo 10 imagens por upload
- **Formatos**: Suporte para jpg, png, gif, etc.
- **Tamanho**: Limite de 5MB por imagem
- **Armazenamento**: Local em `/uploads/noticias/`
- **Preview**: Visualização antes do upload
- **Ordenação**: Imagens são ordenadas por campo `ordem` e data de criação
- **Remoção**: Delete em cascata quando notícia é removida

## 🚀 Status

✅ **Implementação Completa**
- Backend com todos os endpoints funcionando
- Frontend admin com interface completa
- Frontend público exibindo galeria
- Banco de dados estruturado
- CORS configurado corretamente
- Docker funcionando

## 🔍 Testes Realizados

- ✅ Login de admin funcionando
- ✅ Backend rodando na porta 3000
- ✅ Frontend rodando na porta 5176
- ✅ MySQL configurado via Docker
- ✅ Endpoints de API testados via curl
- ✅ Interface admin acessível

## 📝 Próximos Passos (Opcionais)

- [ ] Implementar reordenação de imagens via drag & drop
- [ ] Adicionar modal/lightbox para visualização de imagens
- [ ] Otimização de imagens (resize, compressão)
- [ ] Upload via drag & drop
- [ ] Progress bar durante upload
