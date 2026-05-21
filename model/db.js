/**
 * model/db.js
 *
 * Responsabilidade: conectar a aplicação ao MongoDB usando o Mongoose.
 *
 * O que é Mongoose?
 * Mongoose é uma biblioteca ODM (Object Document Mapper) para MongoDB.
 * Ela adiciona uma camada sobre o driver nativo com:
 *   - Schemas  → definem quais campos um documento pode ter e seus tipos
 *   - Modelos  → classes prontas com métodos de busca, criação e remoção
 *   - Validações → garantem que os dados estejam corretos antes de salvar
 *
 * Diferença em relação ao driver nativo (mongodb):
 *   Driver nativo → você abre/fecha conexão manualmente em cada operação
 *   Mongoose      → uma única conexão é aberta no início e reutilizada
 *                   por toda a vida da aplicação (connection pooling)
 */

const mongoose = require('mongoose');

/**
 * Exportamos uma função assíncrona que estabelece a conexão.
 * Ela é chamada UMA VEZ no index.js antes do servidor iniciar,
 * e o Mongoose mantém essa conexão aberta para todas as operações.
 *
 * A URL 'mongodb://mongo/livraria':
 *   - 'mongo'    → hostname do serviço MongoDB definido no docker-compose.yml
 *                  (o Docker resolve esse nome como endereço de rede interno)
 *   - 'livraria' → nome do banco de dados (criado automaticamente se não existir)
 */
module.exports = async function conectar() {
    await mongoose.connect('mongodb://mongo/livraria');
    console.log('Conectado ao MongoDB via Mongoose');
};
