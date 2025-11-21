const axios = require('axios');

// Configurações
const API_BASE = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@camara.sp.gov.br';
const ADMIN_PASSWORD = '123456';

let adminToken = '';

// Função para login
async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: ADMIN_EMAIL,
      senha: ADMIN_PASSWORD
    });
    
    adminToken = response.data.accessToken;
    console.log('✅ Login realizado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data?.error || error.message);
    return false;
  }
}

// Função para criar dados
async function createData() {
  const headers = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  // Criar mais leis
  const leis = [
    {
      numero: '003',
      ano: 2024,
      tipo: 'lei_complementar',
      titulo: 'Altera dispositivos da Lei Orgânica Municipal',
      ementa: 'Modifica artigos da Lei Orgânica relativos à organização administrativa municipal.',
      status: 'sancionado',
      data_publicacao: '2024-03-10'
    },
    {
      numero: '004',
      ano: 2024,
      tipo: 'decreto',
      titulo: 'Regulamenta o funcionamento das feiras livres',
      ementa: 'Estabelece normas para funcionamento das feiras livres municipais.',
      status: 'sancionado',
      data_publicacao: '2024-04-05'
    },
    {
      numero: '015',
      ano: 2023,
      tipo: 'lei_ordinaria',
      titulo: 'Institui a Semana Municipal de Meio Ambiente',
      ementa: 'Estabelece a primeira semana de junho como Semana Municipal de Meio Ambiente.',
      status: 'sancionado',
      data_publicacao: '2023-06-01'
    }
  ];

  // Criar mais vereadores
  const vereadores = [
    {
      nome: 'Vereadora Maria Santos',
      email: 'maria.santos@camara.sp.gov.br',
      senha: '123456',
      tipo: 'vereador'
    },
    {
      nome: 'Vereador Carlos Oliveira', 
      email: 'carlos.oliveira@camara.sp.gov.br',
      senha: '123456',
      tipo: 'vereador'
    }
  ];

  console.log('\n📚 Criando leis...');
  for (const lei of leis) {
    try {
      await axios.post(`${API_BASE}/admin/leis`, lei, { headers });
      console.log(`✅ Lei ${lei.numero}/${lei.ano} criada`);
    } catch (error) {
      console.log(`⚠️  Lei ${lei.numero}/${lei.ano} já existe ou erro:`, error.response?.data?.error);
    }
  }

  console.log('\n👥 Criando vereadores...');
  const vereadorIds = [];
  for (const vereador of vereadores) {
    try {
      const response = await axios.post(`${API_BASE}/admin/usuarios`, vereador, { headers });
      vereadorIds.push(response.data.id);
      console.log(`✅ ${vereador.nome} criado (ID: ${response.data.id})`);
    } catch (error) {
      console.log(`⚠️  ${vereador.nome} já existe ou erro:`, error.response?.data?.error);
    }
  }

  // Buscar IDs de vereadores existentes
  try {
    const usuariosResponse = await axios.get(`${API_BASE}/admin/usuarios`, { headers });
    const vereadoresExistentes = usuariosResponse.data.filter(u => u.tipo === 'vereador');
    const todosVereadorIds = vereadoresExistentes.map(v => v.id);
    
    console.log(`\n📝 Criando propostas com vereadores: ${todosVereadorIds.join(', ')}...`);
    
    const propostas = [
      {
        numero: '002',
        ano: 2024,
        tipo: 'indicacao',
        titulo: 'Solicita melhorias na iluminação pública',
        resumo: 'Indica ao Executivo a necessidade de melhorar a iluminação pública no Bairro Fazendinha.',
        autor_id: todosVereadorIds[0] || 10,
        status: 'protocolado',
        data_protocolo: '2024-02-15'
      },
      {
        numero: '003',
        ano: 2024,
        tipo: 'projeto_lei',
        titulo: 'Institui o "Dia Municipal da Mulher Empreendedora"',
        resumo: 'Estabelece o dia 19 de novembro como Dia Municipal da Mulher Empreendedora.',
        autor_id: todosVereadorIds[1] || 10,
        status: 'plenario',
        data_protocolo: '2024-03-08'
      }
    ];

    for (const proposta of propostas) {
      try {
        await axios.post(`${API_BASE}/admin/propostas`, proposta, { headers });
        console.log(`✅ Proposta ${proposta.numero}/${proposta.ano} criada`);
      } catch (error) {
        console.log(`⚠️  Proposta ${proposta.numero}/${proposta.ano} já existe ou erro:`, error.response?.data?.error);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao buscar vereadores:', error.response?.data?.error);
  }

  console.log('\n📅 Criando sessões...');
  const sessoes = [
    {
      data_sessao: '2024-12-12',
      numero_sessao: '046/2024',
      tipo_sessao: 'ordinaria',
      hora_inicio: '14:00',
      pauta: '1. Votação do Projeto de Lei nº 003/2024\n2. Discussão do Requerimento nº 004/2024\n3. Prestação de contas do 3º trimestre',
      status: 'agendada'
    },
    {
      data_sessao: '2024-11-28',
      numero_sessao: '044/2024',
      tipo_sessao: 'ordinaria',
      hora_inicio: '14:00',
      pauta: '1. Aprovação das atas das sessões anteriores\n2. Discussão do Projeto de Lei nº 030/2024\n3. Indicações e requerimentos diversos',
      status: 'finalizada'
    }
  ];

  for (const sessao of sessoes) {
    try {
      await axios.post(`${API_BASE}/admin/ordem-dia`, sessao, { headers });
      console.log(`✅ Sessão ${sessao.numero_sessao} criada`);
    } catch (error) {
      console.log(`⚠️  Sessão ${sessao.numero_sessao} já existe ou erro:`, error.response?.data?.error);
    }
  }
}

// Executar script
async function run() {
  console.log('🚀 Iniciando população de dados...\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    process.exit(1);
  }
  
  await createData();
  
  console.log('\n✅ Dados populados com sucesso!');
  console.log('\n📊 Resumo:');
  console.log('- Leis municipais criadas');
  console.log('- Vereadores adicionais criados');  
  console.log('- Propostas de exemplo criadas');
  console.log('- Sessões da ordem do dia criadas');
  console.log('\n🌐 Acesse o admin em: http://localhost:5174/admin/login');
  console.log('📧 Email: admin@camara.sp.gov.br');
  console.log('🔑 Senha: 123456');
}

run().catch(console.error);
