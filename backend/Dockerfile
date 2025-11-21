FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema para MySQL
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Script para aguardar o MySQL inicializar
CMD ["sh", "-c", "sleep 10 && npm start"]
