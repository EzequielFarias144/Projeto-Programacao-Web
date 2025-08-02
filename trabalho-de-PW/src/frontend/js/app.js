/**
 * ========================================
 * CLASSE PRINCIPAL DA APLICAÇÃO
 * ========================================
 * 
 * Gerencia toda a aplicação de atendimentos, incluindo:
 * - CRUD de atendimentos
 * - Filtros e pesquisa
 * - Validações de formulário
 * - Interface do usuário
 */

class AtendimentoApp {
    /**
     * Construtor da aplicação
     * Inicializa propriedades e faz bind dos métodos
     */
    constructor() {
        // Array principal com todos os atendimentos
        this.atendimentos = [];
        // Array filtrado para exibição
        this.filteredAtendimentos = [];
        // Estado atual dos filtros aplicados
        this.currentFilters = {
            search: '',
            tipo: ''
        };
        
        // Gerenciador do formulário
        this.formManager = null;
        // Flag de controle de inicialização
        this.isInitialized = false;

        // Bind dos métodos para manter contexto correto
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleTipoFilter = this.handleTipoFilter.bind(this);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleCancelEdit = this.handleCancelEdit.bind(this);
    }

    /**
     * Inicialização principal da aplicação
     * Configura DOM, eventos e carrega dados
     */
    async init() {
        try {
            // Configurar referências do DOM
            this.setupDOM();
            // Configurar event listeners
            this.setupEventListeners();
            // Inicializar gerenciador de formulário
            this.formManager = new FormManager('#atendimentoForm');
            
            // Carregar dados do servidor
            await this.loadAtendimentos();
            // Configurar data máxima do formulário
            this.updateFormDateMax();
            
            messageManager.success('Sistema carregado com sucesso!');
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            messageManager.error('Erro ao carregar sistema. Tente recarregar a página.');
        }
    }

    /**
     * Configuração das referências do DOM
     * Armazena elementos frequentemente utilizados para melhor performance
     */
    setupDOM() {
        this.elements = {
            form: DOMUtils.$('#atendimentoForm'),
            submitBtn: DOMUtils.$('#submitBtn'),
            cancelEditBtn: DOMUtils.$('#cancelEditBtn'),
            formTitle: DOMUtils.$('#formTitle'),
            atendimentoId: DOMUtils.$('#atendimentoId'),
            searchInput: DOMUtils.$('#searchInput'),
            tipoFilter: DOMUtils.$('#tipoFilter'),
            clearSearch: DOMUtils.$('#clearSearch'),
            refreshBtn: DOMUtils.$('#refreshBtn'),
            atendimentosList: DOMUtils.$('#atendimentosList'),
            emptyState: DOMUtils.$('#emptyState'),
            observacoes: DOMUtils.$('#observacoes'),
            charCount: DOMUtils.$('#charCount')
        };
    }

    /**
     * ========================================
     * CONFIGURAÇÃO DE EVENT LISTENERS
     * ========================================
     */

    /**
     * Configura todos os event listeners da aplicação
     */
    setupEventListeners() {
        // Event listener para submit do formulário
        if (this.elements.form) {
            DOMUtils.addEvent(this.elements.form, 'submit', this.handleFormSubmit);
            DOMUtils.addEvent(this.elements.form, 'reset', () => {
                this.cancelEdit();
                this.updateCharCount();
            });
        }

        // Event listener para cancelar edição
        if (this.elements.cancelEditBtn) {
            DOMUtils.addEvent(this.elements.cancelEditBtn, 'click', this.handleCancelEdit);
        }

        // Event listener para botão de refresh
        if (this.elements.refreshBtn) {
            DOMUtils.addEvent(this.elements.refreshBtn, 'click', this.handleRefresh);
        }

        // Event listener para busca com debounce
        if (this.elements.searchInput) {
            const debouncedSearch = debounce(this.handleSearch, 300);
            DOMUtils.addEvent(this.elements.searchInput, 'input', debouncedSearch);
        }

        // Event listener para limpar busca
        if (this.elements.clearSearch) {
            DOMUtils.addEvent(this.elements.clearSearch, 'click', () => {
                this.elements.searchInput.value = '';
                this.handleSearch();
            });
        }

        // Event listener para filtro por tipo
        if (this.elements.tipoFilter) {
            DOMUtils.addEvent(this.elements.tipoFilter, 'change', this.handleTipoFilter);
        }

        // Event listener para contador de caracteres
        if (this.elements.observacoes) {
            DOMUtils.addEvent(this.elements.observacoes, 'input', () => this.updateCharCount());
        }

        // Atalhos de teclado globais
        DOMUtils.addEvent(document, 'keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n': // Ctrl+N - Novo atendimento
                        e.preventDefault();
                        this.cancelEdit();
                        this.elements.form?.querySelector('input')?.focus();
                        break;
                    case 'r': // Ctrl+R - Refresh
                        e.preventDefault();
                        this.handleRefresh();
                        break;
                }
            }
        });
    }

    /**
     * ========================================
     * FUNÇÕES UTILITÁRIAS DA INTERFACE
     * ========================================
     */

    /**
     * Atualiza contador de caracteres do campo observações
     */
    updateCharCount() {
        if (this.elements.observacoes && this.elements.charCount) {
            const count = this.elements.observacoes.value.length;
            this.elements.charCount.textContent = count;
            
            // Altera cor baseado na proximidade do limite
            if (count > 450) {
                this.elements.charCount.style.color = 'var(--danger-color)';
            } else if (count > 400) {
                this.elements.charCount.style.color = 'var(--warning-color)';
            } else {
                this.elements.charCount.style.color = 'var(--text-secondary)';
            }
        }
    }

    /**
     * Configura data máxima do campo data (não permite datas futuras)
     */
    updateFormDateMax() {
        const dataInput = DOMUtils.$('#data');
        if (dataInput) {
            dataInput.max = DateUtils.getCurrentDate();
        }
    }

    /**
     * ========================================
     * GERENCIAMENTO DE DADOS
     * ========================================
     */

    /**
     * Carrega atendimentos da API
     */
    async loadAtendimentos() {
        try {
            loadingManager.show('Carregando atendimentos...');
            
            // Busca dados da API
            this.atendimentos = await AtendimentoAPI.getAll();
            // Aplica filtros atuais
            this.applyFilters();
            // Renderiza lista na tela
            this.renderAtendimentos();
            
        } catch (error) {
            console.error('Erro ao carregar atendimentos:', error);
            messageManager.error('Erro ao carregar atendimentos: ' + error.message);
        } finally {
            loadingManager.hide();
        }
    }

    /**
     * Aplica filtros atuais aos atendimentos
     */
    applyFilters() {
        this.filteredAtendimentos = AtendimentoFilters.applyFilters(
            this.atendimentos,
            this.currentFilters
        );
    }

    /**
     * ========================================
     * RENDERIZAÇÃO DA INTERFACE
     * ========================================
     */

    /**
     * Renderiza lista de atendimentos na tela
     */
    renderAtendimentos() {
        if (!this.elements.atendimentosList) return;

        // Limpa conteúdo atual
        DOMUtils.clearContent(this.elements.atendimentosList);

        // Mostra estado vazio se não há atendimentos
        if (this.filteredAtendimentos.length === 0) {
            DOMUtils.show(this.elements.emptyState);
            return;
        }

        // Esconde estado vazio e renderiza atendimentos
        DOMUtils.hide(this.elements.emptyState);

        this.filteredAtendimentos.forEach(atendimento => {
            // Cria card do atendimento
            const cardHTML = AtendimentoCardRenderer.render(atendimento);
            const cardElement = document.createElement('div');
            cardElement.innerHTML = cardHTML;
            const card = cardElement.firstElementChild;

            // Adiciona event listeners aos botões do card
            const editBtn = card.querySelector('.edit-btn');
            const deleteBtn = card.querySelector('.delete-btn');

            if (editBtn) {
                DOMUtils.addEvent(editBtn, 'click', (e) => {
                    e.stopPropagation();
                    this.handleEdit(atendimento.id);
                });
            }

            if (deleteBtn) {
                DOMUtils.addEvent(deleteBtn, 'click', (e) => {
                    e.stopPropagation();
                    this.handleDelete(atendimento.id);
                });
            }

            this.elements.atendimentosList.appendChild(card);
        });
    }

    /**
     * ========================================
     * HANDLERS DE EVENTOS
     * ========================================
     */

    /**
     * Handler para submit do formulário
     * @param {Event} event - Evento de submit
     */
    async handleFormSubmit(event) {
        event.preventDefault();

        // Valida formulário antes de prosseguir
        const validation = this.formManager.validate();
        if (!validation.isValid) {
            messageManager.error('Por favor, corrija os erros no formulário.');
            return;
        }

        try {
            loadingManager.show('Salvando atendimento...');

            const formData = this.formManager.getFormData();
            const isEdit = this.formManager.isEditMode;

            let result;
            if (isEdit) {
                // Atualiza atendimento existente
                result = await AtendimentoAPI.update(this.formManager.currentId, formData);
                messageManager.success('Atendimento atualizado com sucesso!');
            } else {
                // Cria novo atendimento
                result = await AtendimentoAPI.create(formData);
                messageManager.success('Atendimento cadastrado com sucesso!');
            }

            // Limpa formulário e recarrega lista
            this.formManager.clear();
            this.cancelEdit();
            await this.loadAtendimentos();

        } catch (error) {
            console.error('Erro ao salvar atendimento:', error);
            messageManager.error('Erro ao salvar: ' + error.message);
        } finally {
            loadingManager.hide();
        }
    }

    /**
     * Handler para edição de atendimento
     * @param {number} id - ID do atendimento a ser editado
     */
    async handleEdit(id) {
        try {
            loadingManager.show('Carregando dados...');

            // Busca dados do atendimento
            const atendimento = await AtendimentoAPI.getById(id);
            
            // Preenche formulário com dados
            this.formManager.fillForm(atendimento);
            this.formManager.isEditMode = true;
            this.formManager.currentId = id;
            
            // Atualiza interface para modo edição
            this.updateFormTitle('Editar Atendimento');
            DOMUtils.show(this.elements.cancelEditBtn);
            
            if (this.elements.submitBtn) {
                this.elements.submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Atendimento';
            }

            // Rola até o formulário
            this.elements.form?.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Erro ao carregar atendimento:', error);
            messageManager.error('Erro ao carregar dados para edição.');
        } finally {
            loadingManager.hide();
        }
    }

    /**
     * Handler para exclusão de atendimento
     * @param {number} id - ID do atendimento a ser excluído
     */
    async handleDelete(id) {
        try {
            // Busca dados do atendimento para confirmação
            const atendimento = this.atendimentos.find(a => a.id === parseInt(id));
            if (!atendimento) return;

            // Solicita confirmação do usuário
            const confirmed = await modalManager.confirm(
                'Confirmar Exclusão',
                `Tem certeza que deseja excluir o atendimento de "${atendimento.nome}"?`,
                {
                    confirmText: 'Excluir',
                    cancelText: 'Cancelar',
                    confirmType: 'danger'
                }
            );

            if (!confirmed) return;

            loadingManager.show('Excluindo atendimento...');

            // Executa exclusão
            await AtendimentoAPI.delete(id);
            messageManager.success('Atendimento excluído com sucesso!');
            
            // Recarrega lista
            await this.loadAtendimentos();

        } catch (error) {
            console.error('Erro ao excluir atendimento:', error);
            messageManager.error('Erro ao excluir: ' + error.message);
        } finally {
            loadingManager.hide();
        }
    }

    /**
     * Handler para busca de atendimentos
     */
    handleSearch() {
        this.currentFilters.search = this.elements.searchInput?.value || '';
        this.applyFilters();
        this.renderAtendimentos();
    }

    /**
     * Handler para filtro por tipo de atendimento
     */
    handleTipoFilter() {
        this.currentFilters.tipo = this.elements.tipoFilter?.value || '';
        this.applyFilters();
        this.renderAtendimentos();
    }

    /**
     * Handler para refresh da lista (limpa cache)
     */
    async handleRefresh() {
        // Limpa cache da API
        APICache.clear();
        await this.loadAtendimentos();
        messageManager.info('Lista atualizada!');
    }

    /**
     * Handler para cancelar edição
     */
    handleCancelEdit() {
        this.cancelEdit();
    }

    /**
     * ========================================
     * FUNÇÕES DE CONTROLE DE ESTADO
     * ========================================
     */

    /**
     * Cancela modo de edição e volta ao modo de criação
     */
    cancelEdit() {
        // Limpa formulário
        this.formManager?.clear();
        // Volta título para criação
        this.updateFormTitle('Novo Atendimento');
        // Esconde botão de cancelar
        DOMUtils.hide(this.elements.cancelEditBtn);
        
        // Restaura texto do botão submit
        if (this.elements.submitBtn) {
            this.elements.submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Atendimento';
        }
    }

    /**
     * Atualiza título do formulário
     * @param {string} title - Novo título
     */
    updateFormTitle(title) {
        if (this.elements.formTitle) {
            const icon = title.includes('Editar') ? 'fa-edit' : 'fa-plus';
            this.elements.formTitle.innerHTML = `<i class="fas ${icon}"></i> ${title}`;
        }
    }

    /**
     * ========================================
     * FUNCIONALIDADES AVANÇADAS
     * ========================================
     */

    /**
     * Exporta dados dos atendimentos para arquivo JSON
     */
    exportData() {
        try {
            // Estrutura de dados para exportação com metadados
            const dataToExport = {
                timestamp: new Date().toISOString(),
                total: this.atendimentos.length,
                atendimentos: this.atendimentos
            };

            // Converte para JSON formatado
            const jsonString = JSON.stringify(dataToExport, null, 2);
            // Cria blob para download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Cria elemento de download temporário
            const a = document.createElement('a');
            a.href = url;
            a.download = `atendimentos_${DateUtils.getCurrentDate()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Limpa URL criada
            URL.revokeObjectURL(url);

            messageManager.success('Dados exportados com sucesso!');

        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            messageManager.error('Erro ao exportar dados.');
        }
    }

    /**
     * Gera estatísticas dos atendimentos
     * @returns {Object} Objeto com estatísticas compiladas
     */
    getStats() {
        // Estrutura básica das estatísticas
        const stats = {
            total: this.atendimentos.length,
            tipos: {
                'Psicológico': 0,
                'Pedagógico': 0,
                'Assistência Social': 0
            },
            thisMonth: 0,
            thisWeek: 0
        };

        // Datas de referência para cálculos
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

        // Itera sobre atendimentos para compilar estatísticas
        this.atendimentos.forEach(atendimento => {
            // Conta por tipo de atendimento
            if (stats.tipos.hasOwnProperty(atendimento.tipo)) {
                stats.tipos[atendimento.tipo]++;
            }

            // Converte data para comparação
            const dataAtendimento = new Date(atendimento.dataISO || atendimento.data);
            
            // Conta atendimentos do mês atual
            if (dataAtendimento >= firstDayOfMonth) {
                stats.thisMonth++;
            }
            
            // Conta atendimentos da semana atual
            if (dataAtendimento >= firstDayOfWeek) {
                stats.thisWeek++;
            }
        });

        return stats;
    }
}

/**
 * ========================================
 * INICIALIZAÇÃO DA APLICAÇÃO
 * ========================================
 */

// Evento de carregamento do DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Verifica compatibilidade do navegador
        if (!window.fetch || !window.Promise) {
            throw new Error('Browser não suportado. Use uma versão mais recente.');
        }

        // Inicializa aplicação principal
        window.app = new AtendimentoApp();
        await window.app.init();

        // Configura aviso antes de sair com alterações não salvas
        window.addEventListener('beforeunload', (e) => {
            if (window.app.formManager?.isEditMode) {
                e.preventDefault();
                e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
            }
        });

        // Logs de inicialização bem-sucedida
        console.log('Sistema de Atendimentos Psicossociais iniciado com sucesso!');
        console.log('Versão: 1.0.0');
        console.log('Funcionalidades disponíveis:');
        console.log('- CRUD de atendimentos');
        console.log('- Filtros e busca');
        console.log('- Validação de formulários');
        console.log('- Cache inteligente');
        console.log('- Interface responsiva');

    } catch (error) {
        console.error('Erro fatal ao inicializar aplicação:', error);

        // Cria container de erro para exibição ao usuário
        const errorContainer = document.createElement('div');
        errorContainer.innerHTML = `
            <div style="
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
                padding: 20px;
                border-radius: 8px;
                margin: 20px;
                text-align: center;
            ">
                <h3>Erro ao carregar o sistema</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">
                    Tentar Novamente
                </button>
            </div>
        `;
        
        // Adiciona container de erro ao DOM
        document.body.appendChild(errorContainer);
    }
});

window.AtendimentoApp = AtendimentoApp;
