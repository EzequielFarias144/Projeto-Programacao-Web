/**
 * ========================================
 * ROTAS DE ATENDIMENTOS
 * ========================================
 * 
 * Define todas as rotas relacionadas aos atendimentos
 * Inclui middlewares de validação e logging
 */

const express = require('express');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');

/**
 * ========================================
 * MIDDLEWARES PERSONALIZADOS
 * ========================================
 */

/**
 * Middleware para logging de requisições
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 * @param {Function} next - Próximo middleware
 */
const logRequest = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
    next();
};

/**
 * Middleware para validação de Content-Type
 * @param {Object} req - Objeto de requisição
 * @param {Object} res - Objeto de resposta
 * @param {Function} next - Próximo middleware
 */
const validateContentType = (req, res, next) => {
    // Valida Content-Type apenas para métodos que enviam dados
    if (['POST', 'PUT'].includes(req.method)) {
        if (!req.is('application/json')) {
            return res.status(400).json({
                success: false,
                message: 'Content-Type deve ser application/json'
            });
        }
    }
    next();
};

/**
 * ========================================
 * APLICAÇÃO DOS MIDDLEWARES
 * ========================================
 */

// Aplica middlewares a todas as rotas
router.use(logRequest);
router.use(validateContentType);

/**
 * ========================================
 * DEFINIÇÃO DAS ROTAS
 * ========================================
 */

/* GET /atendimentos - Lista todos os atendimentos */
router.get('/atendimentos', (req, res) => {
    atendimentoController.index(req, res);
});

/* GET /atendimento/:id - Busca atendimento específico */
router.get('/atendimento/:id', (req, res) => {
    atendimentoController.show(req, res);
});

/* POST /atendimento - Cria novo atendimento */
router.post('/atendimento', (req, res) => {
    atendimentoController.store(req, res);
});

/* PUT /atendimento/:id - Atualiza atendimento existente */
router.put('/atendimento/:id', (req, res) => {
    atendimentoController.update(req, res);
});

/* DELETE /atendimento/:id - Remove atendimento */
router.delete('/atendimento/:id', (req, res) => {
    atendimentoController.destroy(req, res);
});

module.exports = router;
