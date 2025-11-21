// Script para testar no console do navegador
// 1. Primeiro verificar se há token salvo
console.log('Token salvo:', localStorage.getItem('app_token'));

// 2. Verificar conversas 
async function testarConversas() {
  const token = localStorage.getItem('app_token');
  if (!token) {
    console.log('❌ Sem token');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/conversas', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const conversas = await response.json();
    console.log('💬 Conversas:', conversas.length);
    
    // Procurar conversa com vereador ID 1
    const conversa1 = conversas.find(c => c.vereador_id === 1);
    console.log('🔍 Conversa com vereador 1:', conversa1);
    
    return conversas;
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// 3. Executar teste
testarConversas();
