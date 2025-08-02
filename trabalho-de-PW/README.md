# 🏥 Sistema de Atendimentos Psicossociais

## 📋 Descrição

Sistema web completo para gestão de atendimentos psicossociais, desenvolvido com Node.js, Express e PostgreSQL. Permite cadastro, edição, visualização e exclusão de atendimentos nas modalidades:

- 🧠 **Psicológico**
- 📚 **Pedagógico** 
- 🤝 **Assistência Social**

### 📋 Atendimentos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/atendimentos` | Lista todos os atendimentos |
| `GET` | `/api/atendimento/:id` | Busca atendimento por ID |
| `POST` | `/api/atendimento` | Cria novo atendimento |
| `PUT` | `/api/atendimento/:id` | Atualiza atendimento |
| `DELETE` | `/api/atendimento/:id` | Remove atendimento |

### 📝 Exemplo de Payload

```json
{
  "nome": "João Silva",
  "profissional": "Dra. Maria Santos",
  "data": "2024-01-15",
  "tipo": "Psicológico",
  "observacoes": "Primeira consulta - ansiedade"
}
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.