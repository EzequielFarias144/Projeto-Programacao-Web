/**
 * ========================================
 * CONTROLLER DE ATENDIMENTOS
 * ========================================
 * 
 * Responsável por gerenciar as requisições HTTP relacionadas aos atendimentos
 * Implementa operações CRUD: Create, Read, Update, Delete
 */

const { AtendimentoService } = require('../services/atendimentoService');

/**
 * Controller para gerenciar atendimentos
 */
class AtendimentoController {
    /**
     * Lista todos os atendimentos
     * @param {Object} req - Objeto de requisição HTTP
     * @param {Object} res - Objeto de resposta HTTP
     */
    async index(req, res) {
        try {
            // Buscar todos os atendimentos através do service
            const atendimentos = await AtendimentoService.findAll();
            
            // Retornar resposta de sucesso com os dados
            res.status(200).json({
                success: true,
                data: atendimentos,
                message: 'Atendimentos listados com sucesso'
            });
        } catch (error) {
            console.error('Erro ao listar atendimentos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    /**
     * Busca um atendimento específico por ID
     * @param {Object} req - Objeto de requisição HTTP
     * @param {Object} res - Objeto de resposta HTTP
     */
    async show(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            const atendimento = await AtendimentoService.findById(parseInt(id));
            
            if (!atendimento) {
                return res.status(404).json({
                    success: false,
                    message: 'Atendimento não encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: atendimento,
                message: 'Atendimento encontrado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao buscar atendimento:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    async store(req, res) {
        try {
            const atendimentoData = req.body;
            
            const novoAtendimento = await AtendimentoService.create(atendimentoData);
            
            res.status(201).json({
                success: true,
                data: novoAtendimento,
                message: 'Atendimento criado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao criar atendimento:', error);
            
            if (error.message.includes('Dados inválidos')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const atendimentoData = req.body;
            
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            const atendimentoAtualizado = await AtendimentoService.update(parseInt(id), atendimentoData);
            
            if (!atendimentoAtualizado) {
                return res.status(404).json({
                    success: false,
                    message: 'Atendimento não encontrado'
                });
            }

            res.status(200).json({
                success: true,
                data: atendimentoAtualizado,
                message: 'Atendimento atualizado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar atendimento:', error);
            
            if (error.message.includes('Dados inválidos')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }

    async destroy(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            const deletado = await AtendimentoService.delete(parseInt(id));
            
            if (!deletado) {
                return res.status(404).json({
                    success: false,
                    message: 'Atendimento não encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Atendimento deletado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao deletar atendimento:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error.message
            });
        }
    }
}

module.exports = new AtendimentoController();
