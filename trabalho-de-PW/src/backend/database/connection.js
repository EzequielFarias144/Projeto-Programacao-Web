/**
 * ========================================
 * CONEXÃO COM BANCO DE DADOS POSTGRESQL
 * ========================================
 * 
 * Gerencia conexão com PostgreSQL usando Pool de conexões
 * Implementa padrão Singleton para reutilização da conexão
 */

const { Pool } = require('pg');
require('dotenv').config();

/**
 * Classe para gerenciar conexão com banco de dados
 * Utiliza Pool para otimizar performance e recursos
 */
class DatabaseConnection {
    /**
     * Construtor que inicializa o pool de conexões
     */
    constructor() {
        // Configuração do pool com variáveis de ambiente
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        // Listener para erros inesperados no pool
        this.pool.on('error', (err) => {
            console.error('Erro inesperado no client do banco:', err);
            process.exit(-1);
        });
    }

    /**
     * Executa query no banco de dados
     * @param {string} text - SQL query a ser executada
     * @param {Array} params - Parâmetros para a query (opcional)
     * @returns {Promise<Object>} Resultado da query
     */
    async query(text, params) {
        // Obtém cliente do pool
        const client = await this.pool.connect();
        try {
            // Executa a query
            const result = await client.query(text, params);
            return result;
        } finally {
            // Sempre libera o cliente de volta ao pool
            client.release();
        }
    }

    /**
     * Encerra todas as conexões do pool
     * Usado quando a aplicação é finalizada
     */
    async end() {
        await this.pool.end();
    }
}

// Cria instância única (Singleton) da conexão
const databaseConnection = new DatabaseConnection();

module.exports = databaseConnection;
