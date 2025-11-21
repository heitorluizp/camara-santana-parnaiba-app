-- Script para popular as tabelas com dados reais de exemplo
-- Câmara Municipal de Santana de Parnaíba

USE camara_db;

-- ============================================================================
-- LEIS MUNICIPAIS DE EXEMPLO (Santana de Parnaíba)
-- ============================================================================

INSERT INTO leis (numero, ano, tipo, titulo, ementa, texto_completo, status, data_publicacao) VALUES 
-- Leis de 2024
('001', 2024, 'lei_ordinaria', 'Dispõe sobre o Orçamento Anual do Município para 2024', 
'Autoriza o Poder Executivo a realizar despesas e arrecadar receitas para o exercício de 2024, nos termos que especifica.',
'Art. 1º - Fica o Poder Executivo autorizado a realizar despesas no valor total de R$ 850.000.000,00 (oitocentos e cinquenta milhões de reais)...',
'sancionado', '2024-01-15'),

('002', 2024, 'lei_ordinaria', 'Institui o Programa Municipal de Coleta Seletiva', 
'Cria o programa de coleta seletiva de resíduos sólidos no município de Santana de Parnaíba.',
'Art. 1º - Fica instituído o Programa Municipal de Coleta Seletiva de Resíduos Sólidos...',
'sancionado', '2024-02-20'),

('003', 2024, 'lei_complementar', 'Altera dispositivos da Lei Orgânica Municipal', 
'Modifica artigos da Lei Orgânica relativos à organização administrativa municipal.',
'Art. 1º - O artigo 45 da Lei Orgânica do Município passa a vigorar com a seguinte redação...',
'sancionado', '2024-03-10'),

('004', 2024, 'decreto', 'Regulamenta o funcionamento das feiras livres', 
'Estabelece normas para funcionamento das feiras livres municipais.',
'Art. 1º - As feiras livres do município funcionarão nos locais e horários definidos neste decreto...',
'sancionado', '2024-04-05'),

-- Leis de 2023
('015', 2023, 'lei_ordinaria', 'Institui a Semana Municipal de Meio Ambiente', 
'Estabelece a primeira semana de junho como Semana Municipal de Meio Ambiente.',
'Art. 1º - Fica instituída a Semana Municipal de Meio Ambiente, a ser realizada anualmente...',
'sancionado', '2023-06-01'),

('022', 2023, 'lei_ordinaria', 'Cria o Programa Jovem Empreendedor', 
'Institui programa de incentivo ao empreendedorismo juvenil no município.',
'Art. 1º - Fica criado o Programa Jovem Empreendedor, destinado a fomentar...',
'sancionado', '2023-08-15'),

('030', 2023, 'decreto', 'Regulamenta o atendimento preferencial em repartições públicas', 
'Define critérios para atendimento preferencial nos órgãos municipais.',
'Art. 1º - Terão direito ao atendimento preferencial nas repartições municipais...',
'sancionado', '2023-09-20');

-- ============================================================================
-- PROPOSTAS/PROPOSITURAS DE EXEMPLO
-- ============================================================================

-- Buscar IDs de vereadores para usar como autores
SET @vereador1_id = (SELECT id FROM usuarios WHERE tipo = 'vereador' LIMIT 1);
SET @vereador2_id = (SELECT id FROM usuarios WHERE tipo = 'vereador' LIMIT 1 OFFSET 1);

-- Se não existirem vereadores, criar alguns de exemplo
INSERT IGNORE INTO usuarios (nome, email, senha_hash, tipo) VALUES 
('Vereador João Silva', 'joao.silva@camara.sp.gov.br', '$2a$12$oz3jmr49jbnSs4n5SM4yquPEpb.W45Fy0VBk/Fpk90K.OpdkaW0tC', 'vereador'),
('Vereadora Maria Santos', 'maria.santos@camara.sp.gov.br', '$2a$12$oz3jmr49jbnSs4n5SM4yquPEpb.W45Fy0VBk/Fpk90K.OpdkaW0tC', 'vereador'),
('Vereador Carlos Oliveira', 'carlos.oliveira@camara.sp.gov.br', '$2a$12$oz3jmr49jbnSs4n5SM4yquPEpb.W45Fy0VBk/Fpk90K.OpdkaW0tC', 'vereador');

-- Pegar IDs dos vereadores criados
SET @vereador1_id = (SELECT id FROM usuarios WHERE nome = 'Vereador João Silva');
SET @vereador2_id = (SELECT id FROM usuarios WHERE nome = 'Vereadora Maria Santos');
SET @vereador3_id = (SELECT id FROM usuarios WHERE nome = 'Vereador Carlos Oliveira');

-- Criar dados na tabela vereadores
INSERT IGNORE INTO vereadores (usuario_id, descricao, partido, dados_publicos) VALUES 
(@vereador1_id, 'Vereador com foco em meio ambiente e sustentabilidade', 'PSDB', 'Engenheiro Ambiental, 3º mandato'),
(@vereador2_id, 'Vereadora dedicada à educação e direitos das mulheres', 'PT', 'Professora, 2º mandato'),
(@vereador3_id, 'Vereador atuante na área de segurança pública', 'PL', 'Ex-policial militar, 1º mandato');

-- Inserir propostas
INSERT INTO propostas (numero, ano, tipo, titulo, resumo, justificativa, autor_id, status, data_protocolo) VALUES 
-- Propostas de 2024
('001', 2024, 'projeto_lei', 'Cria programa de castração gratuita de animais', 
'Institui programa municipal de castração gratuita para cães e gatos.',
'A superpopulação de animais abandonados é um problema crescente no município. Este projeto visa reduzir o número de animais em situação de rua através da castração gratuita...',
@vereador1_id, 'comissao', '2024-01-20'),

('002', 2024, 'indicacao', 'Solicita melhorias na iluminação pública', 
'Indica ao Executivo a necessidade de melhorar a iluminação pública no Bairro Fazendinha.',
'Moradores do Bairro Fazendinha relatam falta de iluminação adequada, causando insegurança...',
@vereador3_id, 'protocolado', '2024-02-15'),

('003', 2024, 'projeto_lei', 'Institui o "Dia Municipal da Mulher Empreendedora"', 
'Estabelece o dia 19 de novembro como Dia Municipal da Mulher Empreendedora.',
'É importante reconhecer e valorizar o papel das mulheres empreendedoras no desenvolvimento econômico municipal...',
@vereador2_id, 'plenario', '2024-03-08'),

('004', 2024, 'requerimento', 'Solicita informações sobre obras na Estrada do Cururu', 
'Requer ao Prefeito informações sobre o cronograma das obras na Estrada do Cururu.',
'A comunidade necessita de informações precisas sobre as obras em andamento...',
@vereador1_id, 'protocolado', '2024-04-10'),

-- Propostas de 2023
('015', 2023, 'projeto_lei', 'Cria o Conselho Municipal de Segurança Pública', 
'Institui o Conselho Municipal de Segurança Pública com participação da sociedade civil.',
'A participação da comunidade nas questões de segurança é fundamental para um município mais seguro...',
@vereador3_id, 'aprovado', '2023-05-20'),

('018', 2023, 'mocao', 'Moção de Apelo pela preservação da Mata Atlântica', 
'Apela às autoridades competentes pela preservação dos remanescentes de Mata Atlântica.',
'O município possui importantes remanescentes de Mata Atlântica que devem ser preservados...',
@vereador1_id, 'aprovado', '2023-07-15');

-- ============================================================================
-- ORDEM DO DIA - SESSÕES DE EXEMPLO
-- ============================================================================

INSERT INTO ordem_dia (data_sessao, numero_sessao, tipo_sessao, hora_inicio, local, pauta, status) VALUES 
-- Sessões futuras/agendadas
('2024-12-05', '045/2024', 'ordinaria', '14:00:00', 'Plenário da Câmara Municipal', 
'1. Discussão e votação do Projeto de Lei nº 001/2024
2. Apreciação da Indicação nº 002/2024
3. Leitura de correspondências recebidas
4. Palavra livre aos vereadores', 'agendada'),

('2024-12-12', '046/2024', 'ordinaria', '14:00:00', 'Plenário da Câmara Municipal', 
'1. Votação do Projeto de Lei nº 003/2024
2. Discussão do Requerimento nº 004/2024
3. Prestação de contas do 3º trimestre
4. Assuntos diversos', 'agendada'),

('2024-12-15', '001/2024', 'extraordinaria', '09:00:00', 'Plenário da Câmara Municipal', 
'1. Análise de veto parcial do Prefeito ao PL 025/2024
2. Votação de urgência - Autorização para contratação emergencial', 'agendada'),

-- Sessões já realizadas
('2024-11-28', '044/2024', 'ordinaria', '14:00:00', 'Plenário da Câmara Municipal', 
'1. Aprovação das atas das sessões anteriores
2. Discussão do Projeto de Lei nº 030/2024
3. Indicações e requerimentos diversos
4. Comunicações e correspondências', 'finalizada'),

('2024-11-21', '043/2024', 'ordinaria', '14:00:00', 'Plenário da Câmara Municipal', 
'1. Primeira discussão do PL 028/2024
2. Votação da Indicação 025/2024
3. Relatório da Comissão de Finanças
4. Tribuna livre', 'finalizada'),

('2024-11-14', '042/2024', 'solene', '19:00:00', 'Plenário da Câmara Municipal', 
'Sessão Solene em comemoração ao Dia da Proclamação da República
1. Execução do Hino Nacional
2. Discurso do Presidente da Câmara
3. Homenagem aos servidores municipais
4. Apresentação cultural', 'finalizada');

-- ============================================================================
-- NOTÍCIAS RELACIONADAS AOS DADOS
-- ============================================================================

INSERT INTO noticias (titulo, resumo, conteudo, publicado, destaque, autor_id) VALUES 
('Câmara aprova lei de coleta seletiva', 
'Por unanimidade, vereadores aprovam projeto que institui programa municipal de coleta seletiva.',
'<p>A Câmara Municipal de Santana de Parnaíba aprovou por unanimidade o Projeto de Lei nº 002/2024, que institui o Programa Municipal de Coleta Seletiva de Resíduos Sólidos.</p><p>A nova lei entrará em vigor em 60 dias e prevê a implantação gradual do sistema em todos os bairros do município.</p>',
true, true, 1),

('Vereadores discutem segurança pública', 
'Proposta de criação do Conselho Municipal de Segurança é tema de debate.',
'<p>Durante a sessão desta quinta-feira, os vereadores debateram a proposta de criação do Conselho Municipal de Segurança Pública, que contará com participação da sociedade civil.</p>',
true, false, 1),

('Programa de castração gratuita tramita na Câmara', 
'Projeto visa reduzir número de animais abandonados no município.',
'<p>O Projeto de Lei nº 001/2024, de autoria do vereador João Silva, propõe a criação de um programa municipal de castração gratuita para cães e gatos.</p><p>A proposta encontra-se em análise na Comissão de Meio Ambiente.</p>',
true, false, 1);

-- Mensagem de confirmação
SELECT 'Dados de exemplo inseridos com sucesso!' as status;
