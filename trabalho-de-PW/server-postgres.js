// Servidor simples com PostgreSQL
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração do PostgreSQL
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'atendimentos_db',
    user: 'postgres',
    password: 'sua_senha',
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'src/frontend')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/frontend/index.html'));
});

// Função para inicializar o banco
async function initDatabase() {
    try {
        console.log('🔄 Inicializando banco de dados...');
        
        // Criar tabela se não existir
        await pool.query(`
            CREATE TABLE IF NOT EXISTS atendimento (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                profissional VARCHAR(255) NOT NULL,
                data DATE NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                observacoes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabela criada/verificada com sucesso!');
        
        // Verificar se há dados
        const result = await pool.query('SELECT COUNT(*) as count FROM atendimento');
        if (parseInt(result.rows[0].count) === 0) {
            // Inserir dados de exemplo
            await pool.query(`
                INSERT INTO atendimento (nome, profissional, data, tipo, observacoes) VALUES
                ('Maria Silva', 'Dr. João Santos', '2024-01-15', 'Psicológico', 'Primeira consulta - ansiedade'),
                ('Pedro Oliveira', 'Ana Costa', '2024-01-16', 'Assistência Social', 'Orientação sobre benefícios sociais'),
                ('Ana Santos', 'Dr. Carlos Lima', '2024-01-17', 'Pedagógico', 'Dificuldades de aprendizagem')
            `);
            console.log('✅ Dados de exemplo inseridos!');
        }
        
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
    }
}

// Rotas da API
app.get('/api/atendimentos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM atendimento ORDER BY id DESC');
        const atendimentos = result.rows.map(row => ({
            ...row,
            data: new Date(row.data).toLocaleDateString('pt-BR')
        }));
        
        res.json({
            success: true,
            data: atendimentos
        });
    } catch (error) {
        console.error('Erro ao buscar atendimentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

app.post('/api/atendimento', async (req, res) => {
    try {
        const { nome, profissional, data, tipo, observacoes } = req.body;
        
        console.log('📝 Criando novo atendimento:', { nome, profissional, data, tipo, observacoes });
        
        const result = await pool.query(
            'INSERT INTO atendimento (nome, profissional, data, tipo, observacoes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome, profissional, data, tipo, observacoes || '']
        );
        
        const novoAtendimento = result.rows[0];
        console.log('✅ Atendimento criado com sucesso! ID:', novoAtendimento.id);
        
        res.status(201).json({
            success: true,
            data: {
                ...novoAtendimento,
                data: new Date(novoAtendimento.data).toLocaleDateString('pt-BR')
            },
            message: 'Atendimento criado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao criar atendimento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor: ' + error.message
        });
    }
});

app.put('/api/atendimento/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, profissional, data, tipo, observacoes } = req.body;
        
        console.log('📝 Atualizando atendimento ID:', id);
        
        const result = await pool.query(
            'UPDATE atendimento SET nome = $1, profissional = $2, data = $3, tipo = $4, observacoes = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
            [nome, profissional, data, tipo, observacoes || '', id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Atendimento não encontrado'
            });
        }
        
        const atendimentoAtualizado = result.rows[0];
        console.log('✅ Atendimento atualizado com sucesso!');
        
        res.json({
            success: true,
            data: {
                ...atendimentoAtualizado,
                data: new Date(atendimentoAtualizado.data).toLocaleDateString('pt-BR')
            },
            message: 'Atendimento atualizado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao atualizar atendimento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

app.delete('/api/atendimento/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        console.log('🗑️ Deletando atendimento ID:', id);
        
        const result = await pool.query('DELETE FROM atendimento WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Atendimento não encontrado'
            });
        }
        
        console.log('✅ Atendimento deletado com sucesso!');
        
        res.json({
            success: true,
            message: 'Atendimento deletado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro ao deletar atendimento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Iniciar servidor
async function startServer() {
    try {
        await initDatabase();
        
        app.listen(PORT, () => {
            console.log(`
🚀 Servidor rodando com PostgreSQL!
🌐 URL: http://localhost:${PORT}
📚 API: http://localhost:${PORT}/api
🐘 Banco: PostgreSQL (atendimentos_db)
            `);
        });
        
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
    }
}

startServer();
