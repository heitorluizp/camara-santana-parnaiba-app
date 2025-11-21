#!/bin/bash

echo "🚀 Iniciando ambiente de desenvolvimento da Câmara de Santana de Parnaíba"

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes
echo "⏹️  Parando containers existentes..."
docker-compose down

# Construir e iniciar containers
echo "🏗️  Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar MySQL estar pronto
echo "⏳ Aguardando MySQL inicializar..."
sleep 15

# Verificar se tudo está funcionando
echo "🔍 Verificando status dos serviços..."
docker-compose ps

echo ""
echo "✅ Ambiente iniciado com sucesso!"
echo ""
echo "📋 Serviços disponíveis:"
echo "  • API Backend: http://localhost:3000"
echo "  • MySQL: localhost:3306"
echo ""
echo "📊 Para ver logs:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f mysql"
echo ""
echo "⏹️  Para parar:"
echo "  docker-compose down"
