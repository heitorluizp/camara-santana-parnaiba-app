#!/bin/bash

# Script para manter o frontend rodando automaticamente
# Uso: ./start-frontend.sh

FRONTEND_DIR="/Users/heitorluiz/dev/freelas/santana_parnaiba/camara-santana-parnaiba-app/frontend"
PORT=5173

echo "🚀 Iniciando monitoramento do frontend na porta $PORT"
echo "📁 Diretório: $FRONTEND_DIR"
echo "⏰ $(date)"
echo ""

# Função para verificar se a porta está em uso
check_port() {
    nc -z localhost $PORT >/dev/null 2>&1
    return $?
}

# Função para iniciar o frontend
start_frontend() {
    echo "▶️ Iniciando frontend..."
    cd "$FRONTEND_DIR"
    npm run dev &
    FRONTEND_PID=$!
    echo "🆔 PID do frontend: $FRONTEND_PID"
    sleep 5
}

# Função para parar o frontend
stop_frontend() {
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "⏹️ Parando frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
        sleep 2
    fi
    
    # Matar qualquer processo na porta
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    pkill -f "vite" 2>/dev/null
    sleep 1
}

# Trap para limpeza ao sair
trap 'echo "🛑 Parando monitoramento..."; stop_frontend; exit 0' INT TERM

# Loop principal de monitoramento
while true; do
    if ! check_port; then
        echo "❌ Frontend não está respondendo na porta $PORT"
        stop_frontend
        start_frontend
        
        # Aguardar um pouco para o frontend inicializar
        sleep 10
        
        if check_port; then
            echo "✅ Frontend reiniciado com sucesso!"
        else
            echo "⚠️ Frontend ainda não está respondendo, tentando novamente..."
        fi
    else
        echo "✅ Frontend está rodando normalmente ($(date))"
    fi
    
    # Verificar a cada 30 segundos
    sleep 30
done
