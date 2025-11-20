# Câmara de Santana de Parnaíba - App

Aplicativo oficial da Câmara Municipal de Santana de Parnaíba.

## Estrutura do Projeto

- **backend/**: API REST em Node.js/Express
- **frontend/**: Interface em React/Vite

## Como rodar o projeto

### Backend
```bash
cd backend
npm install
npm start
```
A API rodará em `http://localhost:3000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
O frontend rodará em `http://localhost:5173`

## Funcionalidades

- ✅ Listagem de notícias
- ✅ Detalhes de notícias
- ✅ Listagem de vereadores
- ✅ Detalhes de vereadores
- ✅ Envio de mensagens para vereadores

## API Endpoints

- `GET /ping` - Teste da API
- `GET /noticias` - Lista todas as notícias
- `GET /noticias/:id` - Detalhes de uma notícia
- `GET /vereadores` - Lista todos os vereadores
- `GET /vereadores/:id` - Detalhes de um vereador
- `POST /vereadores/:id/mensagens` - Enviar mensagem para um vereador

## Tecnologias

- **Backend**: Node.js, Express, CORS
- **Frontend**: React, Vite, CSS
