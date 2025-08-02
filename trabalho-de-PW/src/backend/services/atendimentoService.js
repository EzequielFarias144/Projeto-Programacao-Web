/**
 * ========================================
 * SERVICE DE ATENDIMENTOS
 * ========================================
 * 
 * Camada de serviço responsável pela lógica de negócio dos atendimentos
 * Inclui validações, sanitização e formatação de dados
 */

const db = require('../database/connection');

/**
 * ========================================
 * FUNÇÕES DE VALIDAÇÃO
 * ========================================
 */

/**
 * Valida dados de um atendimento
 * @param {Object} atendimento - Dados do atendimento a serem validados
 * @returns {Object} Resultado da validação {isValid: boolean, errors: Array}
 */
const validateAtendimento = (atendimento) => {
    const errors = [];
    const { nome, profissional, data, tipo, observacoes } = atendimento;

    // Validação do nome
    if (!nome || nome.trim().length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    // Validação do profissional
    if (!profissional || profissional.trim().length < 2) {
        errors.push('Profissional deve ter pelo menos 2 caracteres');
    }

    // Validação da data
    if (!data) {
        errors.push('Data é obrigatória');
    } else if (new Date(data) > new Date()) {
        errors.push('Data não pode ser futura');
    }

    // Validação do tipo de atendimento
    const tiposValidos = ['Psicológico', 'Pedagógico', 'Assistência Social'];
    if (!tipo || !tiposValidos.includes(tipo)) {
        errors.push('Tipo deve ser: Psicológico, Pedagógico ou Assistência Social');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * ========================================
 * FUNÇÕES DE SANITIZAÇÃO
 * ========================================
 */

/**
 * Sanitiza dados do atendimento removendo espaços e normalizando
 * @param {Object} atendimento - Dados brutos do atendimento
 * @returns {Object} Dados sanitizados
 */
const sanitizeAtendimento = (atendimento) => {
    return {
        nome: atendimento.nome?.trim(),
        profissional: atendimento.profissional?.trim(),
        data: atendimento.data,
        tipo: atendimento.tipo?.trim(),
        observacoes: atendimento.observacoes?.trim() || ''
    };
};

/**
 * ========================================
 * FUNÇÕES DE FORMATAÇÃO
 * ========================================
 */

/**
 * Formata data ISO para formato brasileiro
 * @param {string} dataISO - Data no formato ISO
 * @returns {string} Data formatada (dd/mm/yyyy)
 */
const formatDate = (dataISO) => {
    if (!dataISO) return '';
    const date = new Date(dataISO);
    return date.toLocaleDateString('pt-BR');
};

/**
 * Mapeia dados do banco para resposta da API
 * @param {Object} atendimentoDB - Dados do banco de dados
 * @returns {Object} Dados formatados para resposta
 */
const mapAtendimentoToResponse = (atendimentoDB) => {
    return {
        id: atendimentoDB.id,
        nome: atendimentoDB.nome,
        profissional: atendimentoDB.profissional,
        data: formatDate(atendimentoDB.data),
        dataISO: atendimentoDB.data,
        tipo: atendimentoDB.tipo,
        observacoes: atendimentoDB.observacoes,
        createdAt: atendimentoDB.created_at,
        updatedAt: atendimentoDB.updated_at
    };
};

/**
 * ========================================
 * CLASSE PRINCIPAL DO SERVICE
 * ========================================
 * 
 * Contém todos os métodos CRUD para atendimentos
 * Interage diretamente com o banco de dados
 */

const AtendimentoService = {
    /**
     * Busca todos os atendimentos ordenados por data
     * @returns {Promise<Array>} Lista de atendimentos formatados
     */
    async findAll() {
        try {
            // Query ordenada por data (mais recente primeiro)
            const query = 'SELECT * FROM atendimento ORDER BY data DESC, created_at DESC';
            const result = await db.query(query);
            // Mapeia todos os resultados para formato de resposta
            return result.rows.map(mapAtendimentoToResponse);
        } catch (error) {
            throw new Error(`Erro ao buscar atendimentos: ${error.message}`);
        }
    },

    /**
     * Busca um atendimento específico por ID
     * @param {number} id - ID do atendimento
     * @returns {Promise<Object|null>} Atendimento encontrado ou null
     */
    async findById(id) {
        try {
            const query = 'SELECT * FROM atendimento WHERE id = $1';
            const result = await db.query(query, [id]);
            
            // Retorna null se não encontrou
            if (result.rows.length === 0) {
                return null;
            }
            
            return mapAtendimentoToResponse(result.rows[0]);
        } catch (error) {
            throw new Error(`Erro ao buscar atendimento: ${error.message}`);
        }
    },

    /**
     * Cria um novo atendimento
     * @param {Object} atendimentoData - Dados do atendimento
     * @returns {Promise<Object>} Atendimento criado
     */
    async create(atendimentoData) {
        // Sanitiza e valida os dados antes de inserir
        const sanitized = sanitizeAtendimento(atendimentoData);
        const validation = validateAtendimento(sanitized);

        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }

        try {
            // Query de inserção retornando o registro criado
            const query = `
                INSERT INTO atendimento (nome, profissional, data, tipo, observacoes)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const values = [
                sanitized.nome,
                sanitized.profissional,
                sanitized.data,
                sanitized.tipo,
                sanitized.observacoes
            ];

            const result = await db.query(query, values);
            return mapAtendimentoToResponse(result.rows[0]);
        } catch (error) {
            throw new Error(`Erro ao criar atendimento: ${error.message}`);
        }
    },

    /**
     * Atualiza um atendimento existente
     * @param {number} id - ID do atendimento a ser atualizado
     * @param {Object} atendimentoData - Novos dados do atendimento
     * @returns {Promise<Object|null>} Atendimento atualizado ou null se não encontrado
     */
    async update(id, atendimentoData) {
        // Sanitiza e valida os dados antes de atualizar
        const sanitized = sanitizeAtendimento(atendimentoData);
        const validation = validateAtendimento(sanitized);

        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }

        try {
            // Query de atualização com timestamp automático
            const query = `
                UPDATE atendimento 
                SET nome = $1, profissional = $2, data = $3, tipo = $4, observacoes = $5, updated_at = CURRENT_TIMESTAMP
                WHERE id = $6
                RETURNING *
            `;
            const values = [
                sanitized.nome,
                sanitized.profissional,
                sanitized.data,
                sanitized.tipo,
                sanitized.observacoes,
                id
            ];

            const result = await db.query(query, values);
            
            // Retorna null se o ID não foi encontrado
            if (result.rows.length === 0) {
                return null;
            }
            
            return mapAtendimentoToResponse(result.rows[0]);
        } catch (error) {
            throw new Error(`Erro ao atualizar atendimento: ${error.message}`);
        }
    },

    /**
     * Remove um atendimento do banco de dados
     * @param {number} id - ID do atendimento a ser removido
     * @returns {Promise<boolean>} True se removido com sucesso, false se não encontrado
     */
    async delete(id) {
        try {
            // Query de remoção retornando o ID para confirmação
            const query = 'DELETE FROM atendimento WHERE id = $1 RETURNING id';
            const result = await db.query(query, [id]);
            
            // Retorna true se algo foi deletado
            return result.rows.length > 0;
        } catch (error) {
            throw new Error(`Erro ao deletar atendimento: ${error.message}`);
        }
    }
};

/**
 * ========================================
 * EXPORTAÇÕES DO MÓDULO
 * ========================================
 */

module.exports = {
    AtendimentoService,     // Classe principal com métodos CRUD
    validateAtendimento,    // Função de validação (para uso em outros módulos)
    sanitizeAtendimento,    // Função de sanitização (para uso em outros módulos)
    formatDate,            // Função de formatação de data (para uso em outros módulos)
    mapAtendimentoToResponse // Função de mapeamento (para uso em outros módulos)
};
