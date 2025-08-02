/**
 * ========================================
 * SERVIDOR EXPRESS - VERSÃO STANDALONE
 * ========================================
 * 
 * Versão simplificada do servidor usando dados em memória
 * Para desenvolvimento e testes rápidos
 * 
 * NOTA: Esta é uma versão alternativa ao server.js
 * Use apenas uma das duas versões por vez
 */

const express = require('express');
const path = require('path');
require('dotenv').config();

// Inicialização do servidor Express
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * ========================================
 * CONFIGURAÇÃO DE MIDDLEWARES
 * ========================================
 */

// Parser para JSON
app.use(express.json());
// Parser para dados de formulário
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use('/static', express.static(path.join(__dirname, 'src/frontend')));

/**
 * ========================================
 * ROTA PRINCIPAL
 * ========================================
 */

/* Serve a página inicial */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/frontend/index.html'));
});

/**
 * ========================================
 * DADOS EM MEMÓRIA (MOCK DATABASE)
 * ========================================
 */

/* Array de atendimentos simulando banco de dados */
let atendimentos = [
    {
        id: 1,
        nome: "Maria Silva",
        profissional: "Dr. João Santos",
        data: "2024-01-15",
        dataISO: "2024-01-15",
        tipo: "Psicológico",
        observacoes: "Primeira consulta - ansiedade"
    },
    {
        id: 2,
        nome: "Pedro Oliveira", 
        profissional: "Ana Costa",
        data: "2024-01-16",
        dataISO: "2024-01-16",
        tipo: "Assistência Social",
        observacoes: "Orientação sobre benefícios sociais"
    },
    {
        id: 3,
        nome: "Carla Souza",
        profissional: "Prof. Rita Lima", 
        data: "2024-01-17",
        dataISO: "2024-01-17",
        tipo: "Pedagógico",
        observacoes: "Dificuldades de aprendizagem"
    }
];

/* Controle do próximo ID a ser utilizado */
let nextId = 4;

/**
 * ========================================
 * FUNÇÕES UTILITÁRIAS
 * ========================================
 */

/**
 * Formata data para padrão brasileiro
 * @param {string} dateISO - Data no formato ISO
 * @returns {string} Data formatada (dd/mm/yyyy)
 */
const formatDate = (dateISO) => {
    if (!dateISO) return '';
    const date = new Date(dateISO + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
};

/**
 * ========================================
 * ROTAS DA API REST
 * ========================================
 */

/**
 * GET /api/atendimentos
 * Lista todos os atendimentos cadastrados
 */
app.get('/api/atendimentos', (req, res) => {
    // Formata as datas para exibição em padrão brasileiro
    const formattedAtendimentos = atendimentos.map(atendimento => ({
        ...atendimento,
        data: formatDate(atendimento.dataISO)
    }));
    
    res.json({
        success: true,
        data: formattedAtendimentos
    });
});

/**
 * GET /api/atendimento/:id
 * Busca um atendimento específico pelo ID
 */
app.get('/api/atendimento/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const atendimento = atendimentos.find(a => a.id === id);
    
    // Verifica se o atendimento existe
    if (!atendimento) {
        return res.status(404).json({
            success: false,
            message: 'Atendimento não encontrado'
        });
    }
    
    res.json({
        success: true,
        data: {
            ...atendimento,
            data: formatDate(atendimento.dataISO)
        }
    });
});

/**
 * POST /api/atendimento
 * Cria um novo atendimento
 */
app.post('/api/atendimento', (req, res) => {
    try {
        const { nome, profissional, data, tipo, observacoes } = req.body;
        
        // Validação do campo nome
        if (!nome || nome.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Nome deve ter pelo menos 2 caracteres'
            });
        }
        
        // Validação do campo profissional
        if (!profissional || profissional.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Profissional deve ter pelo menos 2 caracteres'
            });
        }
        
        // Validação do campo data
        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'Data é obrigatória'
            });
        }
        
        // Validação do tipo de atendimento
        const tiposValidos = ['Psicológico', 'Pedagógico', 'Assistência Social'];
        if (!tipo || !tiposValidos.includes(tipo)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo deve ser: Psicológico, Pedagógico ou Assistência Social'
            });
        }
        
        // Cria novo objeto de atendimento
        const novoAtendimento = {
            id: nextId++,
            nome: nome.trim(),
            profissional: profissional.trim(),
            data: data,
            dataISO: data,
            tipo: tipo.trim(),
            observacoes: observacoes ? observacoes.trim() : ''
        };
        
        // Adiciona ao array de atendimentos
        atendimentos.push(novoAtendimento);
        
        res.status(201).json({
            success: true,
            data: {
                ...novoAtendimento,
                data: formatDate(novoAtendimento.dataISO)
            },
            message: 'Atendimento criado com sucesso'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/**
 * PUT /api/atendimento/:id
 * Atualiza um atendimento existente
 */
app.put('/api/atendimento/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, profissional, data, tipo, observacoes } = req.body;
        
        // Busca o índice do atendimento no array
        const index = atendimentos.findIndex(a => a.id === id);
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Atendimento não encontrado'
            });
        }
        
        // Validação do campo nome
        if (!nome || nome.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Nome deve ter pelo menos 2 caracteres'
            });
        }
        
        // Validação do campo profissional
        if (!profissional || profissional.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Profissional deve ter pelo menos 2 caracteres'
            });
        }
        
        // Validação do campo data
        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'Data é obrigatória'
            });
        }
        
        // Validação do tipo de atendimento
        const tiposValidos = ['Psicológico', 'Pedagógico', 'Assistência Social'];
        if (!tipo || !tiposValidos.includes(tipo)) {
            return res.status(400).json({
                success: false,
                message: 'Tipo deve ser: Psicológico, Pedagógico ou Assistência Social'
            });
        }
        
        // Atualiza o atendimento no array
        atendimentos[index] = {
            id: id,
            nome: nome.trim(),
            profissional: profissional.trim(),
            data: data,
            dataISO: data,
            tipo: tipo.trim(),
            observacoes: observacoes ? observacoes.trim() : ''
        };
        
        res.json({
            success: true,
            data: {
                ...atendimentos[index],
                data: formatDate(atendimentos[index].dataISO)
            },
            message: 'Atendimento atualizado com sucesso'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/**
 * DELETE /api/atendimento/:id
 * Remove um atendimento do sistema
 */
app.delete('/api/atendimento/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        // Busca o índice do atendimento no array
        const index = atendimentos.findIndex(a => a.id === id);
        
        // Verifica se o atendimento existe
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Atendimento não encontrado'
            });
        }
        
        // Remove o atendimento do array
        atendimentos.splice(index, 1);
        
        res.json({
            success: true,
            message: 'Atendimento deletado com sucesso'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/**
 * ========================================
 * INICIALIZAÇÃO DO SERVIDOR
 * ========================================
 */

/* Inicia o servidor na porta especificada */
app.listen(PORT, () => {
    console.log(`
🚀 Servidor rodando com sucesso!
🌐 URL: http://localhost:${PORT}
📚 API: http://localhost:${PORT}/api
🖥️  Frontend: http://localhost:${PORT}
📊 Ambiente: ${process.env.NODE_ENV || 'development'}
    `);
});
