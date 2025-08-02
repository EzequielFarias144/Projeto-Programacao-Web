/**
 * ========================================
 * GERENCIADOR DE MENSAGENS
 * ========================================
 * 
 * Responsável por exibir mensagens de feedback para o usuário
 * (sucesso, erro, informação, avisos)
 */

class MessageManager {
    /**
     * Construtor do gerenciador de mensagens
     */
    constructor() {
        // Container onde as mensagens serão exibidas
        this.container = DOMUtils.$('#messageContainer');
        // Tempo padrão para auto-remoção das mensagens
        this.defaultTimeout = 5000;
    }

    /**
     * Exibe uma mensagem na tela
     * @param {string} message - Texto da mensagem
     * @param {string} type - Tipo da mensagem (success, error, info, warning)
     * @param {number} timeout - Tempo para auto-remoção (0 = não remove automaticamente)
     * @returns {HTMLElement} Elemento da mensagem criado
     */
    show(message, type = 'info', timeout = this.defaultTimeout) {
        if (!this.container) return;

        const messageElement = this.createMessageElement(message, type);
        this.container.appendChild(messageElement);

        requestAnimationFrame(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });

        if (timeout > 0) {
            setTimeout(() => {
                this.remove(messageElement);
            }, timeout);
        }

        return messageElement;
    }

    /**
     * Cria elemento HTML da mensagem
     * @param {string} message - Texto da mensagem
     * @param {string} type - Tipo da mensagem
     * @returns {HTMLElement} Elemento da mensagem
     */
    createMessageElement(message, type) {
        const element = document.createElement('div');
        element.className = `message ${type}`;
        
        const icon = this.getIconForType(type);
        element.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <button class="message-close" onclick="window.messageManager.remove(this.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        `;

        return element;
    }

    /**
     * Retorna ícone FontAwesome baseado no tipo da mensagem
     * @param {string} type - Tipo da mensagem
     * @returns {string} Classe do ícone FontAwesome
     */
    getIconForType(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove mensagem com animação
     * @param {HTMLElement} element - Elemento da mensagem a ser removido
     */
    remove(element) {
        if (!element) return;

        // Aplica animação de saída
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px)';
        
        // Remove do DOM após animação
        setTimeout(() => {
            if (element.parentElement) {
                element.parentElement.removeChild(element);
            }
        }, 300);
    }

    /**
     * Remove todas as mensagens do container
     */
    clear() {
        if (this.container) {
            DOMUtils.clearContent(this.container);
        }
    }

    /**
     * Atalho para mensagem de sucesso
     * @param {string} message - Texto da mensagem
     * @param {number} timeout - Tempo para auto-remoção
     * @returns {HTMLElement} Elemento da mensagem
     */
    success(message, timeout) {
        return this.show(message, 'success', timeout);
    }

    /**
     * Atalho para mensagem de erro
     * @param {string} message - Texto da mensagem
     * @param {number} timeout - Tempo para auto-remoção
     * @returns {HTMLElement} Elemento da mensagem
     */
    error(message, timeout) {
        return this.show(message, 'error', timeout);
    }

    /**
     * Atalho para mensagem informativa
     * @param {string} message - Texto da mensagem
     * @param {number} timeout - Tempo para auto-remoção
     * @returns {HTMLElement} Elemento da mensagem
     */
    info(message, timeout) {
        return this.show(message, 'info', timeout);
    }

    /**
     * Atalho para mensagem de aviso
     * @param {string} message - Texto da mensagem
     * @param {number} timeout - Tempo para auto-remoção
     * @returns {HTMLElement} Elemento da mensagem
     */
    warning(message, timeout) {
        return this.show(message, 'warning', timeout);
    }
}

/**
 * ========================================
 * GERENCIADOR DE MODAL DE CONFIRMAÇÃO
 * ========================================
 * 
 * Responsável por exibir modais de confirmação para ações críticas
 * (exclusão, cancelamento, etc.)
 */

class ModalManager {
    /**
     * Construtor do gerenciador de modal
     */
    constructor() {
        // Elementos do modal
        this.modal = DOMUtils.$('#confirmModal');
        this.title = DOMUtils.$('#modalTitle');
        this.message = DOMUtils.$('#modalMessage');
        this.confirmBtn = DOMUtils.$('#modalConfirm');
        this.cancelBtn = DOMUtils.$('#modalCancel');
        this.closeBtn = DOMUtils.$('#modalClose');
        
        // Configura event listeners
        this.setupEventListeners();
        // Função de resolução da Promise atual
        this.currentResolve = null;
    }

    /**
     * Configura todos os event listeners do modal
     */
    /**
     * Configura todos os event listeners do modal
     */
    setupEventListeners() {
        // Botão de cancelar
        if (this.cancelBtn) {
            DOMUtils.addEvent(this.cancelBtn, 'click', () => this.close(false));
        }

        // Botão de fechar (X)
        if (this.closeBtn) {
            DOMUtils.addEvent(this.closeBtn, 'click', () => this.close(false));
        }

        // Clique fora do modal (no overlay)
        if (this.modal) {
            DOMUtils.addEvent(this.modal, 'click', (e) => {
                if (e.target === this.modal) {
                    this.close(false);
                }
            });
        }

        // Tecla ESC para fechar
        DOMUtils.addEvent(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close(false);
            }
        });
    }

    /**
     * Exibe modal de confirmação
     * @param {string} title - Título do modal
     * @param {string} message - Mensagem do modal
     * @param {Object} options - Opções de customização
     * @param {string} options.confirmText - Texto do botão confirmar
     * @param {string} options.cancelText - Texto do botão cancelar
     * @param {string} options.confirmType - Tipo do botão confirmar (danger, primary, etc.)
     * @returns {Promise<boolean>} Promise que resolve com true/false
     */
    confirm(title, message, options = {}) {
        return new Promise((resolve) => {
            // Armazena função de resolução para uso posterior
            this.currentResolve = resolve;

            // Define título e mensagem
            if (this.title) this.title.textContent = title;
            if (this.message) this.message.textContent = message;

            // Configura botão de confirmação
            if (this.confirmBtn) {
                this.confirmBtn.textContent = options.confirmText || 'Confirmar';
                this.confirmBtn.className = `btn-${options.confirmType || 'danger'}`;
                
                // Remove event listeners anteriores clonando o botão
                const newConfirmBtn = this.confirmBtn.cloneNode(true);
                this.confirmBtn.parentNode.replaceChild(newConfirmBtn, this.confirmBtn);
                this.confirmBtn = newConfirmBtn;
                
                // Adiciona novo event listener
                DOMUtils.addEvent(this.confirmBtn, 'click', () => this.close(true));
            }

            // Configura botão de cancelar
            if (this.cancelBtn) {
                this.cancelBtn.textContent = options.cancelText || 'Cancelar';
            }

            // Abre o modal
            this.open();
        });
    }

    /**
     * Abre o modal com animação
     */
    /**
     * Abre o modal com animação
     */
    open() {
        if (this.modal) {
            // Adiciona classe para mostrar modal
            DOMUtils.addClass(this.modal, 'show');
            // Bloqueia scroll do body
            document.body.style.overflow = 'hidden';
            
            // Foca no botão cancelar após animação
            setTimeout(() => {
                if (this.cancelBtn) {
                    this.cancelBtn.focus();
                }
            }, 100);
        }
    }

    /**
     * Fecha o modal e resolve a Promise
     * @param {boolean} confirmed - Se o usuário confirmou a ação
     */
    close(confirmed) {
        if (this.modal) {
            // Remove classe de exibição
            DOMUtils.removeClass(this.modal, 'show');
            // Restaura scroll do body
            document.body.style.overflow = '';
        }

        // Resolve a Promise se existir
        if (this.currentResolve) {
            this.currentResolve(confirmed);
            this.currentResolve = null;
        }
    }

    /**
     * Verifica se o modal está aberto
     * @returns {boolean} True se o modal estiver aberto
     */
    isOpen() {
        return this.modal && DOMUtils.hasClass(this.modal, 'show');
    }
}

/**
 * ========================================
 * GERENCIADOR DE LOADING
 * ========================================
 * 
 * Responsável por exibir indicadores de carregamento durante operações assíncronas
 */

class LoadingManager {
    /**
     * Construtor do gerenciador de loading
     */
    constructor() {
        // Overlay de loading global
        this.overlay = DOMUtils.$('#loadingOverlay');
        // Indicador de loading inline
        this.indicator = DOMUtils.$('#loadingIndicator');
        // Contador para gerenciar múltiplas operações simultâneas
        this.counter = 0;
    }

    /**
     * Exibe indicador de loading
     * @param {string} message - Mensagem a ser exibida durante o loading
     */
    show(message = 'Carregando...') {
        // Incrementa contador de operações ativas
        this.counter++;
        
        // Atualiza mensagem e exibe overlay
        if (this.overlay) {
            const messageElement = this.overlay.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            DOMUtils.show(this.overlay);
        }

        // Exibe indicador inline se disponível
        if (this.indicator) {
            DOMUtils.show(this.indicator);
        }
    }

    /**
     * Esconde indicador de loading
     */
    hide() {
        // Decrementa contador, garantindo que não seja negativo
        this.counter = Math.max(0, this.counter - 1);
        
        // Só esconde quando não há mais operações ativas
        if (this.counter === 0) {
            if (this.overlay) {
                DOMUtils.hide(this.overlay);
            }
            
            if (this.indicator) {
                DOMUtils.hide(this.indicator);
            }
        }
    }

    /**
     * Força o fechamento do loading independente do contador
     */
    forceHide() {
        this.counter = 0;
        this.hide();
    }
}

/**
 * ========================================
 * RENDERIZADOR DE CARDS DE ATENDIMENTO
 * ========================================
 * 
 * Responsável por gerar HTML dos cards de atendimento para listagem
 */

class AtendimentoCardRenderer {
    /**
     * Renderiza um card de atendimento
     * @param {Object} atendimento - Dados do atendimento
     * @returns {string} HTML do card renderizado
     */
    static render(atendimento) {
        // Gera classe CSS baseada no tipo de atendimento
        const tipoClass = atendimento.tipo.toLowerCase()
            .replace('ç', 'c')
            .replace('ã', 'a')
            .replace(' ', '-');

        // Obtém ícone e classe do badge baseados no tipo
        const tipoIcon = AtendimentoCardRenderer.getTipoIcon(atendimento.tipo);
        const tipoBadgeClass = AtendimentoCardRenderer.getTipoBadgeClass(atendimento.tipo);

        return `
            <div class="atendimento-card ${tipoClass}" data-id="${atendimento.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${StringUtils.truncate(atendimento.nome, 30)}</h3>
                        <p class="card-subtitle">
                            <i class="fas fa-user-md"></i> ${StringUtils.truncate(atendimento.profissional, 25)}
                        </p>
                    </div>
                    <div class="card-actions">
                        <button class="btn-icon edit-btn" title="Editar" data-id="${atendimento.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-btn" title="Excluir" data-id="${atendimento.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="card-info">
                    <div class="info-item">
                        <i class="fas fa-calendar info-icon"></i>
                        <span>${atendimento.data}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas ${tipoIcon} info-icon"></i>
                        <span class="tipo-badge ${tipoBadgeClass}">${atendimento.tipo}</span>
                    </div>
                </div>
                
                ${atendimento.observacoes ? `
                    <div class="observacoes">
                        <i class="fas fa-sticky-note"></i>
                        ${StringUtils.truncate(atendimento.observacoes, 100)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Retorna ícone FontAwesome baseado no tipo de atendimento
     * @param {string} tipo - Tipo do atendimento
     * @returns {string} Classe do ícone FontAwesome
     */
    /**
     * Retorna ícone FontAwesome baseado no tipo de atendimento
     * @param {string} tipo - Tipo do atendimento
     * @returns {string} Classe do ícone FontAwesome
     */
    static getTipoIcon(tipo) {
        const icons = {
            'Psicológico': 'fa-brain',
            'Pedagógico': 'fa-book',
            'Assistência Social': 'fa-hands-helping'
        };
        return icons[tipo] || 'fa-clipboard';
    }

    /**
     * Retorna classe CSS para badge do tipo de atendimento
     * @param {string} tipo - Tipo do atendimento
     * @returns {string} Classe CSS para o badge
     */
    static getTipoBadgeClass(tipo) {
        const classes = {
            'Psicológico': 'psicologico',
            'Pedagógico': 'pedagogico',
            'Assistência Social': 'assistencia-social'
        };
        return classes[tipo] || 'assistencia-social';
    }
}

/**
 * ========================================
 * SISTEMA DE FILTROS DE ATENDIMENTOS
 * ========================================
 * 
 * Objeto estático com métodos para filtrar lista de atendimentos
 */

const AtendimentoFilters = {
    /**
     * Filtra atendimentos por termo de busca
     * @param {Array} atendimentos - Array de atendimentos
     * @param {string} searchTerm - Termo de busca
     * @returns {Array} Atendimentos filtrados
     */
    filterBySearch: (atendimentos, searchTerm) => {
        if (!searchTerm) return atendimentos;

        return atendimentos.filter(atendimento => {
            return StringUtils.containsSearchTerm(atendimento.nome, searchTerm) ||
                   StringUtils.containsSearchTerm(atendimento.profissional, searchTerm) ||
                   StringUtils.containsSearchTerm(atendimento.observacoes || '', searchTerm);
        });
    },

    /**
     * Filtra atendimentos por tipo
     * @param {Array} atendimentos - Array de atendimentos
     * @param {string} tipo - Tipo de atendimento
     * @returns {Array} Atendimentos filtrados
     */
    filterByTipo: (atendimentos, tipo) => {
        if (!tipo) return atendimentos;
        return atendimentos.filter(atendimento => atendimento.tipo === tipo);
    },

    /**
     * Aplica múltiplos filtros aos atendimentos
     * @param {Array} atendimentos - Array de atendimentos
     * @param {Object} filters - Objeto com filtros a aplicar
     * @param {string} filters.search - Termo de busca
     * @param {string} filters.tipo - Tipo de atendimento
     * @returns {Array} Atendimentos filtrados
     */
    applyFilters: (atendimentos, filters) => {
        let filtered = [...atendimentos];

        // Aplica filtro de busca se especificado
        if (filters.search) {
            filtered = AtendimentoFilters.filterBySearch(filtered, filters.search);
        }

        // Aplica filtro de tipo se especificado
        if (filters.tipo) {
            filtered = AtendimentoFilters.filterByTipo(filtered, filters.tipo);
        }

        return filtered;
    }
};

/**
 * ========================================
 * GERENCIADOR DE FORMULÁRIOS
 * ========================================
 * 
 * Responsável pelo gerenciamento completo de formulários
 * (validação, preenchimento, limpeza, etc.)
 */

class FormManager {
    /**
     * Construtor do gerenciador de formulários
     * @param {string} formSelector - Seletor CSS do formulário
     */
    constructor(formSelector) {
        // Elemento do formulário
        this.form = DOMUtils.$(formSelector);
        // Estado de edição
        this.isEditMode = false;
        // ID do registro sendo editado
        this.currentId = null;
        
        // Configura validação automática
        this.setupFormValidation();
    }

    /**
     * Configura validação automática dos campos
     */
    /**
     * Configura validação automática dos campos
     */
    setupFormValidation() {
        if (!this.form) return;

        // Obtém todos os campos de entrada
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Valida quando o campo perde o foco
            DOMUtils.addEvent(input, 'blur', () => this.validateField(input));
            // Limpa erro quando o usuário digita
            DOMUtils.addEvent(input, 'input', () => this.clearFieldError(input));
        });
    }

    /**
     * Valida um campo específico
     * @param {HTMLElement} field - Campo a ser validado
     * @returns {boolean} True se válido, false caso contrário
     */
    validateField(field) {
        const fieldName = field.name;
        const value = field.value;
        let validation = { valid: true, message: '' };

        // Aplica validação baseada no nome do campo
        switch (fieldName) {
            case 'nome':
                validation = ValidationUtils.validateNome(value);
                break;
            case 'profissional':
                validation = ValidationUtils.validateProfissional(value);
                break;
            case 'data':
                validation = ValidationUtils.validateData(value);
                break;
            case 'tipo':
                validation = ValidationUtils.validateTipo(value);
                break;
            case 'observacoes':
                validation = ValidationUtils.validateObservacoes(value);
                break;
        }

        // Exibe ou esconde mensagem de erro
        this.showFieldError(fieldName, validation.message, !validation.valid);
        return validation.valid;
    }

    /**
     * Exibe ou esconde erro de um campo
     * @param {string} fieldName - Nome do campo
     * @param {string} message - Mensagem de erro
     * @param {boolean} show - Se deve mostrar o erro
     */
    /**
     * Exibe ou esconde erro de um campo
     * @param {string} fieldName - Nome do campo
     * @param {string} message - Mensagem de erro
     * @param {boolean} show - Se deve mostrar o erro
     */
    showFieldError(fieldName, message, show) {
        const errorElement = DOMUtils.$(`#${fieldName}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            if (show) {
                DOMUtils.addClass(errorElement, 'show');
            } else {
                DOMUtils.removeClass(errorElement, 'show');
            }
        }
    }

    /**
     * Limpa erro de um campo específico
     * @param {HTMLElement} field - Campo para limpar erro
     */
    clearFieldError(field) {
        this.showFieldError(field.name, '', false);
    }

    /**
     * Obtém dados do formulário como objeto
     * @returns {Object} Dados do formulário
     */
    getFormData() {
        if (!this.form) return {};

        const formData = new FormData(this.form);
        const data = {};
        
        // Converte FormData para objeto simples
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    /**
     * Preenche formulário com dados
     * @param {Object} data - Dados para preencher
     */
    /**
     * Preenche formulário com dados
     * @param {Object} data - Dados para preencher
     */
    fillForm(data) {
        if (!this.form || !data) return;

        // Itera sobre os dados e preenche campos correspondentes
        Object.entries(data).forEach(([key, value]) => {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field) {
                // Tratamento especial para campos de data
                if (key === 'data' && value) {
                    field.value = DateUtils.formatDateInput(value);
                } else {
                    field.value = value || '';
                }
            }
        });
    }

    /**
     * Limpa formulário e reseta estado
     */
    clear() {
        if (this.form) {
            // Reseta formulário
            this.form.reset();
            // Limpa todos os erros
            this.clearAllErrors();
            // Reseta estado de edição
            this.isEditMode = false;
            this.currentId = null;
        }
    }

    /**
     * Limpa todas as mensagens de erro
     */
    clearAllErrors() {
        const errorElements = this.form.querySelectorAll('.field-error');
        errorElements.forEach(error => {
            DOMUtils.removeClass(error, 'show');
        });
    }

    /**
     * Valida formulário completo
     * @returns {Object} Resultado da validação com erros
     */
    validate() {
        const formData = this.getFormData();
        const validation = ValidationUtils.validateForm(formData);

        // Exibe erros nos campos correspondentes
        Object.entries(validation.errors).forEach(([field, message]) => {
            this.showFieldError(field, message, true);
        });

        return validation;
    }
}

/**
 * ========================================
 * INICIALIZAÇÃO DE COMPONENTES GLOBAIS
 * ========================================
 * 
 * Instancia e disponibiliza componentes globalmente na aplicação
 */

// Instância global do gerenciador de mensagens
window.messageManager = new MessageManager();
// Instância global do gerenciador de modal
window.modalManager = new ModalManager();
// Instância global do gerenciador de loading
window.loadingManager = new LoadingManager();
// Classe de renderização de cards disponível globalmente
window.AtendimentoCardRenderer = AtendimentoCardRenderer;
// Objeto de filtros disponível globalmente
window.AtendimentoFilters = AtendimentoFilters;
// Classe de gerenciamento de formulários disponível globalmente
window.FormManager = FormManager;
