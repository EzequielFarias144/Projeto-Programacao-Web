/**
 * ========================================
 * UTILITÁRIOS DE DATA
 * ========================================
 * 
 * Funções para manipulação e formatação de datas
 */

const DateUtils = {
    /**
     * Formata data para exibição no padrão brasileiro (dd/mm/yyyy)
     * @param {Date|string} date - Data a ser formatada
     * @returns {string} Data formatada ou string vazia se inválida
     */
    formatDate: (date) => {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return '';
        
        return dateObj.toLocaleDateString('pt-BR');
    },

    /**
     * Formata data para input HTML (yyyy-mm-dd)
     * @param {Date|string} date - Data a ser formatada
     * @returns {string} Data no formato do input ou string vazia se inválida
     */
    formatDateInput: (date) => {
        if (!date) return '';
        
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return '';
        
        return dateObj.toISOString().split('T')[0];
    },

    /**
     * Verifica se uma data é válida
     * @param {Date|string} date - Data a ser verificada
     * @returns {boolean} True se a data for válida
     */
    isValidDate: (date) => {
        if (!date) return false;
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return !isNaN(dateObj.getTime());
    },

    /**
     * Verifica se uma data é futura (posterior ao dia atual)
     * @param {Date|string} date - Data a ser verificada
     * @returns {boolean} True se a data for futura
     */
    isFutureDate: (date) => {
        if (!DateUtils.isValidDate(date)) return false;
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dateObj > today;
    },

    /**
     * Retorna a data atual no formato do input HTML (yyyy-mm-dd)
     * @returns {string} Data atual formatada
     */
    getCurrentDate: () => {
        return new Date().toISOString().split('T')[0];
    }
};

/**
 * ========================================
 * UTILITÁRIOS DE STRING
 * ========================================
 * 
 * Funções para manipulação e formatação de strings
 */

const StringUtils = {
    /**
     * Capitaliza primeira letra de uma string
     * @param {string} str - String a ser capitalizada
     * @returns {string} String capitalizada
     */
    capitalize: (str) => {
        if (!str || typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Remove acentos de uma string
     * @param {string} str - String com acentos
     * @returns {string} String sem acentos
     */
    removeAccents: (str) => {
        if (!str || typeof str !== 'string') return '';
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },

    /**
     * Trunca string para um tamanho específico
     * @param {string} str - String a ser truncada
     * @param {number} length - Tamanho máximo
     * @returns {string} String truncada com "..."
     */
    truncate: (str, length = 50) => {
        if (!str || typeof str !== 'string') return '';
        if (str.length <= length) return str;
        return str.substring(0, length).trim() + '...';
    },

    /**
     * Sanitiza string para busca (remove acentos e converte para minúsculo)
     * @param {string} str - String a ser sanitizada
     * @returns {string} String sanitizada
     */
    sanitizeForSearch: (str) => {
        if (!str || typeof str !== 'string') return '';
        return StringUtils.removeAccents(str.toLowerCase().trim());
    },

    /**
     * Verifica se texto contém termo de busca (ignorando acentos e case)
     * @param {string} text - Texto a ser pesquisado
     * @param {string} searchTerm - Termo de busca
     * @returns {boolean} True se contém o termo
     */
    containsSearchTerm: (text, searchTerm) => {
        if (!text || !searchTerm) return false;
        
        const sanitizedText = StringUtils.sanitizeForSearch(text);
        const sanitizedTerm = StringUtils.sanitizeForSearch(searchTerm);
        
        return sanitizedText.includes(sanitizedTerm);
    }
};

/**
 * ========================================
 * UTILITÁRIOS DE VALIDAÇÃO
 * ========================================
 * 
 * Funções para validação de dados de formulário
 */

const ValidationUtils = {
    /**
     * Valida campo nome
     * @param {string} nome - Nome a ser validado
     * @returns {Object} Resultado da validação {valid: boolean, message: string}
     */
    validateNome: (nome) => {
        if (!nome || typeof nome !== 'string') {
            return { valid: false, message: 'Nome é obrigatório' };
        }
        
        const trimmedNome = nome.trim();
        if (trimmedNome.length < 2) {
            return { valid: false, message: 'Nome deve ter pelo menos 2 caracteres' };
        }
        
        if (trimmedNome.length > 100) {
            return { valid: false, message: 'Nome deve ter no máximo 100 caracteres' };
        }
        
        return { valid: true, message: '' };
    },

    /**
     * Valida campo do profissional responsável
     * @param {string} profissional - Nome do profissional a ser validado
     * @returns {Object} Resultado da validação {valid: boolean, message: string}
     */
    validateProfissional: (profissional) => {
        if (!profissional || typeof profissional !== 'string') {
            return { valid: false, message: 'Profissional é obrigatório' };
        }
        
        const trimmedProf = profissional.trim();
        if (trimmedProf.length < 2) {
            return { valid: false, message: 'Nome do profissional deve ter pelo menos 2 caracteres' };
        }
        
        if (trimmedProf.length > 100) {
            return { valid: false, message: 'Nome do profissional deve ter no máximo 100 caracteres' };
        }
        
        return { valid: true, message: '' };
    },

    /**
     * Valida campo de data do atendimento
     * @param {string|Date} data - Data a ser validada
     * @returns {Object} Resultado da validação {valid: boolean, message: string}
     */
    /**
     * Valida campo de data do atendimento
     * @param {string|Date} data - Data a ser validada
     * @returns {Object} Resultado da validação {valid: boolean, message: string}
     */
    validateData: (data) => {
        if (!data) {
            return { valid: false, message: 'Data é obrigatória' };
        }
        
        if (!DateUtils.isValidDate(data)) {
            return { valid: false, message: 'Data inválida' };
        }
        
        if (DateUtils.isFutureDate(data)) {
            return { valid: false, message: 'Data não pode ser futura' };
        }
        
        return { valid: true, message: '' };
    },

    /**
     * Valida tipo de atendimento
     * @param {string} tipo - Tipo de atendimento a ser validado
     * @returns {Object} Resultado da validação {valid: boolean, message: string}
     */
    /**
     * Valida tipo de atendimento
     * @param {string} tipo - Tipo de atendimento a ser validado
     * @returns {Object} Resultado da validação {valid: boolean, message: string}
     */
    validateTipo: (tipo) => {
        const tiposValidos = ['Psicológico', 'Pedagógico', 'Assistência Social'];
        
        if (!tipo) {
            return { valid: false, message: 'Tipo de atendimento é obrigatório' };
        }
        
        if (!tiposValidos.includes(tipo)) {
            return { valid: false, message: 'Tipo deve ser: Psicológico, Pedagógico ou Assistência Social' };
        }
        
        return { valid: true, message: '' };
    },

    /**
     * Valida campo de observações (opcional)
     * @param {string} observacoes - Observações a serem validadas
     * @returns {Object} Resultado da validação {valid: boolean, message: string}
     */
    validateObservacoes: (observacoes) => {
        if (observacoes && observacoes.length > 500) {
            return { valid: false, message: 'Observações devem ter no máximo 500 caracteres' };
        }
        
        return { valid: true, message: '' };
    },

    /**
     * Valida formulário completo de atendimento
     * @param {Object} formData - Dados do formulário
     * @param {string} formData.nome - Nome do atendido
     * @param {string} formData.profissional - Nome do profissional
     * @param {string} formData.data - Data do atendimento
     * @param {string} formData.tipo - Tipo do atendimento
     * @param {string} formData.observacoes - Observações do atendimento
     * @returns {Object} Resultado da validação {isValid: boolean, errors: Object}
     */
    validateForm: (formData) => {
        const errors = {};
        let isValid = true;

        // Valida nome do atendido
        const nomeValidation = ValidationUtils.validateNome(formData.nome);
        if (!nomeValidation.valid) {
            errors.nome = nomeValidation.message;
            isValid = false;
        }

        // Valida nome do profissional
        const profValidation = ValidationUtils.validateProfissional(formData.profissional);
        if (!profValidation.valid) {
            errors.profissional = profValidation.message;
            isValid = false;
        }

        // Valida data do atendimento
        const dataValidation = ValidationUtils.validateData(formData.data);
        if (!dataValidation.valid) {
            errors.data = dataValidation.message;
            isValid = false;
        }

        // Valida tipo de atendimento
        const tipoValidation = ValidationUtils.validateTipo(formData.tipo);
        if (!tipoValidation.valid) {
            errors.tipo = tipoValidation.message;
            isValid = false;
        }

        // Valida observações (campo opcional)
        const obsValidation = ValidationUtils.validateObservacoes(formData.observacoes);
        if (!obsValidation.valid) {
            errors.observacoes = obsValidation.message;
            isValid = false;
        }

        return { isValid, errors };
    }
};

/**
 * ========================================
 * UTILITÁRIOS DE MANIPULAÇÃO DO DOM
 * ========================================
 * 
 * Funções para facilitar manipulação de elementos DOM
 */

const DOMUtils = {
    /**
     * Seletor de elemento único (equivalente ao querySelector)
     * @param {string} selector - Seletor CSS
     * @returns {HTMLElement|null} Elemento encontrado ou null
     */
    $(selector) {
        return document.querySelector(selector);
    },

    /**
     * Seletor de múltiplos elementos (equivalente ao querySelectorAll)
     * @param {string} selector - Seletor CSS
     * @returns {NodeList} Lista de elementos encontrados
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * Adiciona event listener a um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} event - Nome do evento
     * @param {Function} handler - Função manipuladora do evento
     */
    addEvent(element, event, handler) {
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler);
        }
    },

    /**
     * Remove event listener de um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} event - Nome do evento
     * @param {Function} handler - Função manipuladora do evento
     */
    removeEvent(element, event, handler) {
        if (element && typeof handler === 'function') {
            element.removeEventListener(event, handler);
        }
    },

    /**
     * Exibe elemento (remove display: none e classe d-none)
     * @param {HTMLElement} element - Elemento a ser exibido
     */
    show(element) {
        if (element) {
            element.style.display = '';
            element.classList.remove('d-none');
        }
    },

    /**
     * Esconde elemento (adiciona display: none)
     * @param {HTMLElement} element - Elemento a ser escondido
     */
    hide(element) {
        if (element) {
            element.style.display = 'none';
        }
    },

    /**
     * Alterna visibilidade do elemento
     * @param {HTMLElement} element - Elemento a ter visibilidade alternada
     */
    /**
     * Alterna visibilidade do elemento
     * @param {HTMLElement} element - Elemento a ter visibilidade alternada
     */
    toggle(element) {
        if (element) {
            const isHidden = element.style.display === 'none' || 
                           element.classList.contains('d-none');
            
            if (isHidden) {
                DOMUtils.show(element);
            } else {
                DOMUtils.hide(element);
            }
        }
    },

    /**
     * Limpa conteúdo HTML de um elemento
     * @param {HTMLElement} element - Elemento a ter conteúdo limpo
     */
    clearContent(element) {
        if (element) {
            element.innerHTML = '';
        }
    },

    /**
     * Adiciona classe CSS a um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} className - Nome da classe a ser adicionada
     */
    addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    },

    /**
     * Remove classe CSS de um elemento
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} className - Nome da classe a ser removida
     */
    removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    },

    /**
     * Verifica se elemento possui determinada classe CSS
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} className - Nome da classe a ser verificada
     * @returns {boolean} True se o elemento possui a classe
     */
    hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    }
};

/**
 * ========================================
 * UTILITÁRIOS DE ARMAZENAMENTO LOCAL
 * ========================================
 * 
 * Funções para manipulação do localStorage com tratamento de erros
 */

const StorageUtils = {
    /**
     * Salva valor no localStorage
     * @param {string} key - Chave para armazenamento
     * @param {*} value - Valor a ser armazenado (será serializado como JSON)
     */
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.warn('Erro ao salvar no localStorage:', error);
        }
    },

    /**
     * Recupera valor do localStorage
     * @param {string} key - Chave do valor armazenado
     * @param {*} defaultValue - Valor padrão se não encontrado
     * @returns {*} Valor deserializado ou valor padrão
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Erro ao ler do localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Remove item do localStorage
     * @param {string} key - Chave do item a ser removido
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Erro ao remover do localStorage:', error);
        }
    },

    /**
     * Limpa todo o localStorage
     */
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('Erro ao limpar localStorage:', error);
        }
    }
};

/**
 * ========================================
 * FUNÇÕES DE CONTROLE DE PERFORMANCE
 * ========================================
 * 
 * Utilitários para otimização de performance (debounce e throttle)
 */

/**
 * Debounce - Atrasa execução da função até que pare de ser chamada
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em millisegundos
 * @returns {Function} Função com debounce aplicado
 */
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle - Limita execução da função a um intervalo específico
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Limite de tempo em millisegundos entre execuções
 * @returns {Function} Função com throttle aplicado
 */
const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * ========================================
 * EXPORTAÇÃO DE UTILITÁRIOS GLOBAIS
 * ========================================
 * 
 * Disponibiliza todos os utilitários no escopo global da aplicação
 */

// Utilitários de data disponíveis globalmente
window.DateUtils = DateUtils;
// Utilitários de string disponíveis globalmente
window.StringUtils = StringUtils;
// Utilitários de validação disponíveis globalmente
window.ValidationUtils = ValidationUtils;
// Utilitários de DOM disponíveis globalmente
window.DOMUtils = DOMUtils;
// Utilitários de storage disponíveis globalmente
window.StorageUtils = StorageUtils;
// Função debounce disponível globalmente
window.debounce = debounce;
// Função throttle disponível globalmente
window.throttle = throttle;
