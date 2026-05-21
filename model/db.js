/**
 * model/db.js
 *
 * Responsabilidade: criar e retornar uma conexão com o banco de dados MongoDB.
 *
 * Por que isso fica num arquivo separado?
 * Para não repetir a string de conexão em todo lugar.
 * Se precisarmos trocar o endereço do banco, alteramos só aqui.
 */

// O pacote 'mongodb' é o driver oficial do MongoDB para Node.js.
// MongoClient é a classe que representa a conexão com o banco.
const { MongoClient } = require('mongodb');

/**
 * Exportamos uma FUNÇÃO (não a conexão em si).
 *
 * Cada vez que essa função é chamada, ela cria uma nova instância de MongoClient.
 * Isso é intencional: cada operação vai abrir sua própria conexão e fechá-la
 * ao terminar, mantendo o código simples e previsível.
 *
 * A URL 'mongodb://mongo/livraria' tem três partes:
 *   - 'mongo'     → nome do serviço definido no docker-compose.yml
 *                   (o Docker resolve esse nome automaticamente como se fosse
 *                   um hostname de rede interna)
 *   - 27017       → porta padrão do MongoDB (omitida, mas usada implicitamente)
 *   - 'livraria'  → nome do banco de dados que será criado/acessado
 */
module.exports = function () {
    return new MongoClient('mongodb://mongo/livraria');
};
