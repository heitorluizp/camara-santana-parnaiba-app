-- Script para limpar completamente a tabela de conversas
-- Executar quando o MySQL estiver rodando

USE camara_santana_parnaiba;

-- Exibir total de conversas antes da limpeza
SELECT 'Conversas antes da limpeza:' as status, COUNT(*) as total FROM conversas;

-- Limpar todas as conversas
DELETE FROM conversas;

-- Resetar o AUTO_INCREMENT
ALTER TABLE conversas AUTO_INCREMENT = 1;

-- Confirmar limpeza
SELECT 'Conversas após limpeza:' as status, COUNT(*) as total FROM conversas;

-- Verificar estrutura da tabela (confirmar que não há campo 'lida')
DESCRIBE conversas;

COMMIT;
