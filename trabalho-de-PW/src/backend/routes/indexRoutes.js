/**
 * ========================================
 * ROTAS PRINCIPAIS (INDEX)
 * ========================================
 * 
 * Define rotas principais do sistema, incluindo:
 * - Página de documentação da API
 * - Links para o frontend
 * - Informações sobre endpoints disponíveis
 */

const express = require('express');
const router = express.Router();

/**
 * ========================================
 * ROTA PRINCIPAL - DOCUMENTAÇÃO DA API
 * ========================================
 */

/* GET / - Página de documentação e informações da API */
router.get('/', (req, res) => {
    // Retorna página HTML com documentação dos endpoints
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sistema de Atendimentos Psicossociais - API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #2c3e50;
                    text-align: center;
                }
                .endpoint {
                    background: #ecf0f1;
                    padding: 10px;
                    margin: 10px 0;
                    border-radius: 5px;
                    border-left: 4px solid #3498db;
                }
                .method {
                    font-weight: bold;
                    color: #2980b9;
                }
                .description {
                    color: #7f8c8d;
                    font-style: italic;
                }
                .frontend-link {
                    display: inline-block;
                    background: #3498db;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .frontend-link:hover {
                    background: #2980b9;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🏥 API - Sistema de Atendimentos Psicossociais</h1>
                
                <p>Bem-vindo à API REST para gerenciamento de atendimentos psicossociais!</p>
                
                <h2>📋 Endpoints Disponíveis:</h2>
                
                <div class="endpoint">
                    <span class="method">GET /atendimentos</span>
                    <div class="description">Lista todos os atendimentos</div>
                </div>
                
                <div class="endpoint">
                    <span class="method">GET /atendimento/:id</span>
                    <div class="description">Busca um atendimento específico</div>
                </div>
                
                <div class="endpoint">
                    <span class="method">POST /atendimento</span>
                    <div class="description">Cria um novo atendimento</div>
                </div>
                
                <div class="endpoint">
                    <span class="method">PUT /atendimento/:id</span>
                    <div class="description">Atualiza um atendimento existente</div>
                </div>
                
                <div class="endpoint">
                    <span class="method">DELETE /atendimento/:id</span>
                    <div class="description">Remove um atendimento</div>
                </div>
                
                <h2>💻 Interface Frontend:</h2>
                <a href="/app" class="frontend-link">Acessar Sistema Web</a>
                
                <h2>📊 Exemplo de Payload (JSON):</h2>
                <pre style="background: #2c3e50; color: white; padding: 15px; border-radius: 5px; overflow-x: auto;">
{
  "nome": "Maria Silva",
  "profissional": "Dr. João Santos",
  "data": "2024-01-15",
  "tipo": "Psicológico",
  "observacoes": "Primeira consulta - ansiedade"
}
                </pre>
            </div>
        </body>
        </html>
    `);
});

router.get('/app', (req, res) => {
    res.redirect('/');
});

module.exports = router;
