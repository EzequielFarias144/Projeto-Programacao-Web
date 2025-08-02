/**
 * ========================================
 * CONFIGURAÇÃO DA API
 * ========================================
 * 
 * Módulo responsável por toda comunicação com o backend
 * Inclui configurações, cache e métodos HTTP
 */

/* Configurações básicas da API */
const API_CONFIG = {
    baseURL: '/api',
    timeout: 10000, // 10 segundos
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

/**
 * Constrói URL completa da API
 * @param {string} endpoint - Endpoint da API
 * @returns {string} URL completa
 */
const buildApiUrl = (endpoint) => {
    const baseUrl = API_CONFIG.baseURL.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    return `${baseUrl}/${cleanEndpoint}`;
};

/**
 * Cria headers personalizados mesclando com os padrões
 * @param {Object} customHeaders - Headers customizados
 * @returns {Object} Headers mesclados
 */
const createHeaders = (customHeaders = {}) => {
    return {
        ...API_CONFIG.headers,
        ...customHeaders
    };
};

/**
 * ========================================
 * FUNÇÃO PRINCIPAL DE REQUISIÇÕES HTTP
 * ========================================
 * 
 * Função central para todas as requisições à API
 * Inclui timeout, tratamento de erros e validações
 */

/**
 * Executa requisição HTTP com timeout e tratamento de erros
 * @param {string} url - URL da requisição
 * @param {Object} options - Opções da requisição
 * @returns {Promise<Object>} Resposta da API
 */
const makeRequest = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
        // Executa requisição com configurações personalizadas
        const response = await fetch(url, {
            ...options,
            headers: createHeaders(options.headers),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Valida se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Essa resposta da API não parece certo... não é JSON válido');
        }

        // Converte resposta para JSON
        const data = await response.json();

        // Verifica se a requisição foi bem-sucedida
        if (!response.ok) {
            throw new Error(data.message || `Erro HTTP: ${response.status}`);
        }

        return data;

    } catch (error) {
        clearTimeout(timeoutId);
        
        // Tratamento específico para timeout
        if (error.name === 'AbortError') {
            throw new Error('Requisição expirou. Tente novamente.');
        }
        
        // Tratamento para erros de rede
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Erro de rede. Verifique sua conexão!');
        }
        
        throw error;
    }
};

/**
 * ========================================
 * API DE ATENDIMENTOS - MÉTODOS CRUD
 * ========================================
 * 
 * Interface para operações com atendimentos no backend
 */

/* Objeto principal com métodos da API de atendimentos */
const AtendimentoAPI = {
    /**
     * Busca todos os atendimentos
     * @returns {Promise<Array>} Lista de atendimentos
     */
    async getAll() {
        const url = buildApiUrl('atendimentos');
        const response = await makeRequest(url);
        return response.data || [];
    },

    /**
     * Busca um atendimento específico por ID
     * @param {number} id - ID do atendimento
     * @returns {Promise<Object>} Dados do atendimento
     */
    async getById(id) {
        // Validação do ID
        if (!id || isNaN(Number(id))) {
            throw new Error('ID inválido');
        }
        
        const url = buildApiUrl(`atendimento/${id}`);
        const response = await makeRequest(url);
        return response.data;
    },

    /**
     * Cria um novo atendimento
     * @param {Object} atendimentoData - Dados do atendimento
     * @returns {Promise<Object>} Atendimento criado
     */
    async create(atendimentoData) {
        // Validação dos dados
        if (!atendimentoData || typeof atendimentoData !== 'object') {
            throw new Error('Desculpe, mas os dados do atendimento são obrigatórios');
        }

        const url = buildApiUrl('atendimento');
        const response = await makeRequest(url, {
            method: 'POST',
            body: JSON.stringify(atendimentoData)
        });
        return response.data;
    },

    /**
     * Atualiza um atendimento existente
     * @param {number} id - ID do atendimento
     * @param {Object} atendimentoData - Novos dados do atendimento
     * @returns {Promise<Object>} Atendimento atualizado
     */
    async update(id, atendimentoData) {
        // Validação do ID
        if (!id || isNaN(Number(id))) {
            throw new Error('ID inválido');
        }
        
        // Validação dos dados
        if (!atendimentoData || typeof atendimentoData !== 'object') {
            throw new Error('Dados do atendimento são obrigatórios');
        }

        const url = buildApiUrl(`atendimento/${id}`);
        const response = await makeRequest(url, {
            method: 'PUT',
            body: JSON.stringify(atendimentoData)
        });
        return response.data;
    },

    /**
     * Remove um atendimento
     * @param {number} id - ID do atendimento a ser removido
     * @returns {Promise<boolean>} Sucesso da operação
     */
    async delete(id) {
        // Validação do ID
        if (!id || isNaN(Number(id))) {
            throw new Error('ID inválido');
        }

        const url = buildApiUrl(`atendimento/${id}`);
        const response = await makeRequest(url, {
            method: 'DELETE'
        });
        return response.success;
    }
};

/**
 * ========================================
 * SISTEMA DE CACHE DA API
 * ========================================
 * 
 * Cache em memória para otimizar requisições repetidas
 * TTL (Time To Live) de 5 minutos por padrão
 */

/* Gerenciador de cache para requisições da API */
const APICache = {
    cache: new Map(), // Armazenamento do cache em memória
    ttl: 5 * 60 * 1000, // TTL: 5 minutos em milissegundos

    /**
     * Gera chave única para o cache baseada no método e URL
     * @param {string} method - Método HTTP
     * @param {string} url - URL da requisição
     * @returns {string} Chave do cache
     */
    generateKey(method, url) {
        return `${method.toLowerCase()}_${url}`;
    },

    /**
     * Busca item no cache
     * @param {string} key - Chave do cache
     * @returns {*|null} Dados cached ou null se expirado/inexistente
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        const now = Date.now();
        // Verifica se o item expirou
        if (now > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    },

    /**
     * Armazena item no cache com timestamp de expiração
     * @param {string} key - Chave do cache
     * @param {*} data - Dados a serem armazenados
     */
    set(key, data) {
        const now = Date.now();
        this.cache.set(key, {
            data,
            expiry: now + this.ttl
        });
    },

    /**
     * Limpa todo o cache
     */
    clear() {
        this.cache.clear();
    },

    /**
     * Invalida entradas do cache que contenham o padrão especificado
     * @param {string} pattern - Padrão a ser procurado nas chaves
     */
    invalidate(pattern) {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
};

/**
 * ========================================
 * API COM CACHE IMPLEMENTADO
 * ========================================
 * 
 * Wrapper da API de atendimentos com cache automático
 * Melhora performance evitando requisições desnecessárias
 */

/* API de atendimentos com cache automático */
const cachedAtendimentoAPI = {
    /**
     * Busca todos os atendimentos (com cache)
     * @returns {Promise<Array>} Lista de atendimentos
     */
    async getAll() {
        const cacheKey = APICache.generateKey('GET', 'atendimentos');
        const cached = APICache.get(cacheKey);
        
        // Retorna dados do cache se disponíveis
        if (cached) {
            return cached;
        }

        // Busca dados da API e armazena no cache
        const data = await AtendimentoAPI.getAll();
        APICache.set(cacheKey, data);
        return data;
    },

    /**
     * Busca atendimento por ID (com cache)
     * @param {number} id - ID do atendimento
     * @returns {Promise<Object>} Dados do atendimento
     */
    async getById(id) {
        const cacheKey = APICache.generateKey('GET', `atendimento/${id}`);
        const cached = APICache.get(cacheKey);
        
        // Retorna dados do cache se disponíveis
        if (cached) {
            return cached;
        }

        // Busca dados da API e armazena no cache
        const data = await AtendimentoAPI.getById(id);
        APICache.set(cacheKey, data);
        return data;
    },

    /**
     * Cria novo atendimento e invalida cache
     * @param {Object} atendimentoData - Dados do atendimento
     * @returns {Promise<Object>} Atendimento criado
     */
    async create(atendimentoData) {
        const data = await AtendimentoAPI.create(atendimentoData);
        // Invalida cache de listagem após criação
        APICache.invalidate('atendimentos');
        return data;
    },

    /**
     * Atualiza atendimento e invalida cache
     * @param {number} id - ID do atendimento
     * @param {Object} atendimentoData - Novos dados
     * @returns {Promise<Object>} Atendimento atualizado
     */
    async update(id, atendimentoData) {
        const data = await AtendimentoAPI.update(id, atendimentoData);
        // Invalida cache relacionado após atualização
        APICache.invalidate('atendimento');
        return data;
    },

    /**
     * Remove atendimento e invalida cache
     * @param {number} id - ID do atendimento
     * @returns {Promise<boolean>} Sucesso da operação
     */
    async delete(id) {
        const result = await AtendimentoAPI.delete(id);
        // Invalida cache relacionado após remoção
        APICache.invalidate('atendimento');
        return result;
    }
};

/* ========================================
   EXPORTAÇÃO PARA ESCOPO GLOBAL
======================================== */

// Disponibiliza API e cache no escopo global para uso em outros arquivos
window.AtendimentoAPI = cachedAtendimentoAPI;
window.APICache = APICache;