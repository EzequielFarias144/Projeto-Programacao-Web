/**
 * ========================================
 * PONTO DE ENTRADA PRINCIPAL
 * ========================================
 * 
 * Arquivo principal que inicializa o servidor Express
 * com configuração completa de banco de dados
 * 
 * NOTA: Use este arquivo para produção
 * Para desenvolvimento simples, use app.js
 */

const Server = require('./src/backend/server');

// Cria e inicia nova instância do servidor
const server = new Server();
server.start();
