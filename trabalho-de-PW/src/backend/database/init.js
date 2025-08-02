/**
 * ========================================
 * INICIALIZAÇÃO DO BANCO DE DADOS
 * ========================================
 * 
 * Responsável por:
 * - Criar tabelas necessárias
 * - Inserir dados de exemplo
 * - Verificar integridade do banco
 */

const db = require('./connection');

/**
 * Inicializa o banco de dados criando tabelas e inserindo dados de exemplo
 * @returns {Promise<void>}
 */
const initDatabase = async () => {
    try {
        // SQL para criação da tabela de atendimentos
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS atendimento (
                id SERIAL PRIMARY KEY,
                nome TEXT NOT NULL,
                profissional TEXT NOT NULL,
                data DATE NOT NULL,
                tipo TEXT NOT NULL CHECK (tipo IN ('Psicológico', 'Pedagógico', 'Assistência Social')),
                observacoes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Executa criação da tabela
        await db.query(createTableQuery);
        console.log('✅ Tabela atendimento criada/verificada com sucesso!');

        // Verifica se existem dados na tabela
        const checkDataQuery = 'SELECT COUNT(*) FROM atendimento';
        const result = await db.query(checkDataQuery);
        
        // Se não há dados, insere exemplos
        if (parseInt(result.rows[0].count) === 0) {
            const insertSampleData = `
                INSERT INTO atendimento (nome, profissional, data, tipo, observacoes) VALUES
                ('Maria Silva', 'Dr. João Santos', '2024-01-15', 'Psicológico', 'Primeira consulta - ansiedade'),
                ('Pedro Oliveira', 'Ana Costa', '2024-01-16', 'Assistência Social', 'Orientação sobre benefícios sociais'),
                ('Carla Souza', 'Prof. Rita Lima', '2024-01-17', 'Pedagógico', 'Dificuldades de aprendizagem');
            `;
            
            await db.query(insertSampleData);
            console.log('✅ Dados de exemplo inseridos com sucesso!');
        }

    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        throw error;
    }
};

module.exports = { initDatabase };
