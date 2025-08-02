/**
 * ========================================
 * SERVIDOR EXPRESS - BACKEND
 * ========================================
 * 
 * Servidor principal da aplicação de atendimentos
 * Responsável por:
 * - Configurar middlewares
 * - Definir rotas da API
 * - Servir arquivos estáticos
 * - Gerenciar conexão com banco de dados
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./database/init');

/**
 * Classe principal do servidor
 */
class Server {
    /**
     * Construtor do servidor
     * Inicializa Express e configurações básicas
     */
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        
        // Configurar middlewares, rotas e tratamento de erros
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * Configuração dos middlewares do Express
     */
    setupMiddlewares() {
        // Configuração CORS para permitir requisições do frontend
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' 
                ? ['https://seudominio.com'] 
                : ['http://localhost:3000', 'http://localhost:8080'],
            credentials: true
        }));

        // Parser JSON com limite de 10MB
        this.app.use(express.json({ limit: '10mb' }));

        // Parser URL-encoded para formulários
        this.app.use(express.urlencoded({ extended: true }));

        // Servir arquivos estáticos do frontend
        this.app.use('/static', express.static(path.join(__dirname, '../frontend')));

        // Middleware de logging personalizado
        this.app.use(this.loggerMiddleware);
    }

    /**
     * Middleware personalizado para logging de requisições
     * @param {Object} req - Objeto de requisição
     * @param {Object} res - Objeto de resposta  
     * @param {Function} next - Função para próximo middleware
     */
    loggerMiddleware(req, res, next) {
        const start = Date.now();
        
        res.on('finish', () => {
            const duration = Date.now() - start;
            const timestamp = new Date().toISOString();
            const method = req.method;
            const url = req.originalUrl;
            const status = res.statusCode;
            
            console.log(`[${timestamp}] ${method} ${url} - ${status} - ${duration}ms`);
        });
        
        next();
    }

    /**
     * ========================================
     * CONFIGURAÇÃO DAS ROTAS
     * ========================================
     */

    /**
     * Define todas as rotas da aplicação
     */
    setupRoutes() {
        // Rota principal - serve a página HTML do frontend
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });

        // Rota da API - retorna dados mock dos atendimentos
        this.app.get('/api/atendimentos', (req, res) => {
            res.json({
                success: true,
                data: [
                    {
                        id: 1,
                        nome: "Maria Silva",
                        profissional: "Dr. João Santos",
                        data: "15/01/2024",
                        tipo: "Psicológico",
                        observacoes: "Primeira consulta - ansiedade"
                    },
                    {
                        id: 2,
                        nome: "Pedro Oliveira",
                        profissional: "Ana Costa",
                        data: "16/01/2024",
                        tipo: "Assistência Social",
                        observacoes: "Orientação sobre benefícios sociais"
                    }
                ]
            });
        });

        // Rota catch-all para rotas não encontradas (404)
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Rota não encontrada',
                requestedUrl: req.originalUrl
            });
        });
    }

    /**
     * ========================================
     * TRATAMENTO DE ERROS
     * ========================================
     */

    /**
     * Configura middleware de tratamento de erros e handlers de processo
     */
    setupErrorHandling() {
        // Middleware de tratamento de erros global
        this.app.use((error, req, res, next) => {
            console.error('Erro não tratado:', error);
            
            // Retorna erro formatado (oculta detalhes em produção)
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
            });
        });

        // Handler para promises rejeitadas não capturadas
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        // Handler para exceções não capturadas
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });
    }

    /**
     * ========================================
     * MÉTODOS DE CONTROLE DO SERVIDOR
     * ========================================
     */

    /**
     * Inicia o servidor Express e inicializa o banco de dados
     */
    async start() {
        try {
            // Inicializa banco de dados
            console.log('🔄 Inicializando banco de dados...');
            await initDatabase();
    
            // Inicia servidor na porta configurada
            this.app.listen(this.port, () => {
                console.log(`
🚀 Servidor rodando com sucesso!
🌐 URL: http://localhost:${this.port}
📚 API: http://localhost:${this.port}/api
🖥️  Frontend: http://localhost:${this.port}
📊 Ambiente: ${process.env.NODE_ENV || 'development'}
                `);
            });

        } catch (error) {
            console.error('❌ Erro ao inicializar servidor:', error);
            process.exit(1);
        }
    }

    /**
     * Para o servidor graciosamente
     */
    async stop() {
        console.log('🔄 Parando servidor...');
        process.exit(0);
    }
}

/**
 * ========================================
 * HANDLERS DE SINAIS DO SISTEMA
 * ========================================
 */

// Handler para SIGTERM (terminação graciosa)
process.on('SIGTERM', () => {
    console.log('🛑 Recebido SIGTERM. Parando servidor...');
    process.exit(0);
});

// Handler para SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('🛑 Recebido SIGINT. Parando servidor...');
    process.exit(0);
});

module.exports = Server;