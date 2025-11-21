-- Criar base de dados e tabelas para o sistema da Câmara

CREATE DATABASE IF NOT EXISTS camara_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE camara_db;

-- Tabela de usuários (cidadãos, vereadores, admins)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo ENUM('cidadao', 'vereador', 'admin') DEFAULT 'cidadao',
    ativo BOOLEAN DEFAULT true,
    foto_url VARCHAR(500),
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de vereadores (extensão dos usuários)
CREATE TABLE vereadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    descricao TEXT,
    mandato_inicio DATE,
    mandato_fim DATE,
    partido VARCHAR(50),
    dados_publicos TEXT,
    contato_publico VARCHAR(255),
    gabinete VARCHAR(100),
    comissoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de sessões/tokens JWT
CREATE TABLE sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    device_info TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_usuario_id (usuario_id)
);

-- Tabela de notícias
CREATE TABLE noticias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(500) NOT NULL,
    resumo TEXT,
    conteudo LONGTEXT,
    imagem_url VARCHAR(500),
    autor_id INT,
    publicado BOOLEAN DEFAULT false,
    destaque BOOLEAN DEFAULT false,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id)
);

-- Tabela de imagens das notícias (suporte para múltiplas imagens)
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

-- Tabela de leis
CREATE TABLE leis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL,
    ano INT NOT NULL,
    tipo ENUM('lei_ordinaria', 'lei_complementar', 'decreto', 'resolucao') DEFAULT 'lei_ordinaria',
    titulo VARCHAR(500) NOT NULL,
    ementa TEXT,
    texto_completo LONGTEXT,
    autor_id INT,
    status ENUM('tramitacao', 'aprovado', 'rejeitado', 'sancionado') DEFAULT 'tramitacao',
    data_publicacao DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id),
    UNIQUE KEY unique_lei (numero, ano, tipo)
);

-- Tabela de propostas
CREATE TABLE propostas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL,
    ano INT NOT NULL,
    tipo ENUM('projeto_lei', 'emenda', 'indicacao', 'mocao', 'requerimento') DEFAULT 'projeto_lei',
    titulo VARCHAR(500) NOT NULL,
    resumo TEXT,
    justificativa LONGTEXT,
    autor_id INT NOT NULL,
    status ENUM('protocolado', 'comissao', 'plenario', 'aprovado', 'rejeitado') DEFAULT 'protocolado',
    data_protocolo DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id),
    UNIQUE KEY unique_proposta (numero, ano, tipo)
);

-- Tabela de mensagens (chat com vereadores)
CREATE TABLE mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    assunto VARCHAR(255),
    mensagem LONGTEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    respondida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remetente_id) REFERENCES usuarios(id),
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(id),
    INDEX idx_destinatario (destinatario_id),
    INDEX idx_remetente (remetente_id)
);

-- Tabela de ordem do dia
CREATE TABLE ordem_dia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_sessao DATE NOT NULL,
    numero_sessao VARCHAR(50),
    tipo_sessao ENUM('ordinaria', 'extraordinaria', 'solene') DEFAULT 'ordinaria',
    hora_inicio TIME,
    local VARCHAR(255) DEFAULT 'Plenário da Câmara Municipal',
    pauta LONGTEXT,
    ata LONGTEXT,
    status ENUM('agendada', 'em_andamento', 'finalizada', 'cancelada') DEFAULT 'agendada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de notificações push
CREATE TABLE notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo ENUM('geral', 'pessoal', 'urgente') DEFAULT 'geral',
    lida BOOLEAN DEFAULT false,
    push_enviado BOOLEAN DEFAULT false,
    data_envio TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario_lida (usuario_id, lida)
);

-- Inserir dados iniciais

-- Admin padrão (senha: 123456)
INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES 
('Administrador', 'admin@camara.sp.gov.br', '$2a$12$oz3jmr49jbnSs4n5SM4yquPEpb.W45Fy0VBk/Fpk90K.OpdkaW0tC', 'admin');

-- Tabela de conversas entre cidadãos e vereadores
CREATE TABLE conversas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cidadao_id INT NOT NULL,
    vereador_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    status ENUM('ativa', 'arquivada', 'bloqueada') DEFAULT 'ativa',
    mensagens JSON NOT NULL,
    ultima_mensagem_data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cidadao_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (vereador_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_cidadao_vereador (cidadao_id, vereador_id),
    INDEX idx_ultima_mensagem (ultima_mensagem_data),
    INDEX idx_status (status)
);

-- Índices para performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_noticias_publicado ON noticias(publicado);
CREATE INDEX idx_mensagens_data ON mensagens(created_at);
CREATE INDEX idx_ordem_dia_data ON ordem_dia(data_sessao);
CREATE INDEX idx_conversas_cidadao ON conversas(cidadao_id);
CREATE INDEX idx_conversas_vereador ON conversas(vereador_id);
