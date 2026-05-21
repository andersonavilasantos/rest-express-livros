/**
 * model/livros.js
 *
 * Responsabilidade: encapsular toda a lógica de acesso ao banco de dados
 * relacionada à coleção "livros".
 *
 * Padrão utilizado: Active Record simplificado.
 * A própria classe Livro sabe como se salvar, se buscar e se deletar,
 * em vez de ter um repositório separado.
 *
 * Um livro tem os seguintes campos:
 *   - _id    : gerado automaticamente pelo MongoDB
 *   - titulo : string
 *   - autor  : string
 *   - ano    : número
 *   - preco  : número
 */

// Importa a função que cria a conexão com o MongoDB
const db = require('./db');

// ObjectId é o tipo de dado que o MongoDB usa para os IDs dos documentos.
// Precisamos dele para converter a string vinda da URL no tipo correto antes
// de fazer buscas por ID.
const { ObjectId } = require('mongodb');

class Livro {

    /**
     * Construtor
     *
     * Recebe um objeto com os dados do livro e copia todas as propriedades
     * para a instância atual usando Object.assign.
     *
     * Exemplo:
     *   const livro = new Livro({ titulo: '1984', autor: 'Orwell', ano: 1949, preco: 39.90 });
     *   console.log(livro.titulo); // '1984'
     *
     * Object.assign(this, params) é equivalente a escrever:
     *   this.titulo = params.titulo;
     *   this.autor  = params.autor;
     *   ... e assim por diante para cada campo.
     */
    constructor(params) {
        Object.assign(this, params);
    }

    /**
     * find(id?) — método ESTÁTICO de busca
     *
     * Estático significa que é chamado na classe, não numa instância:
     *   Livro.find()       → retorna todos os livros
     *   Livro.find('abc')  → retorna o livro com _id = 'abc'
     *
     * Por que async/await?
     * Operações de banco de dados são assíncronas (levam tempo).
     * O 'await' pausa a execução da função até a operação terminar,
     * sem travar o servidor para outras requisições.
     *
     * @param {string} [id] - ID do livro (opcional)
     * @returns {Promise<Livro|Livro[]>} - um livro ou uma lista de livros
     */
    static async find(id) {
        // 1. Cria e abre a conexão com o banco
        const client = db();
        await client.connect();

        // 2. Acessa a coleção 'livros' dentro do banco 'livraria'
        //    Se a coleção não existir, o MongoDB a cria automaticamente
        const colecao = client.db().collection('livros');

        let resultado;

        if (id) {
            // Busca UM documento pelo _id.
            // new ObjectId(id) converte a string '64a1f2...' no tipo
            // que o MongoDB entende internamente.
            const doc = await colecao.findOne({ _id: new ObjectId(id) });

            // Envolve o documento retornado numa instância de Livro,
            // ou retorna null se não encontrou nada.
            resultado = doc ? new Livro(doc) : null;
        } else {
            // Busca TODOS os documentos da coleção.
            // .find() retorna um cursor (ponteiro); .toArray() materializa tudo em memória.
            const docs = await colecao.find().toArray();

            // Converte cada documento bruto numa instância de Livro
            resultado = docs.map(doc => new Livro(doc));
        }

        // 3. Fecha a conexão — boa prática para liberar recursos
        await client.close();

        return resultado;
    }

    /**
     * save() — salva ou atualiza o livro no banco
     *
     * Decide automaticamente entre INSERT e UPDATE:
     *   - Se o objeto JÁ tem _id  → UPDATE (o livro já existe no banco)
     *   - Se não tem _id          → INSERT (novo livro)
     *
     * Exemplo de INSERT:
     *   const livro = new Livro({ titulo: '1984', autor: 'Orwell' });
     *   await livro.save(); // insere e popula livro._id
     *
     * Exemplo de UPDATE:
     *   const livro = new Livro({ _id: '64a1f2...', titulo: '1984 - Edição Especial' });
     *   await livro.save(); // atualiza o documento existente
     *
     * @returns {Promise<Livro>} - a instância atualizada (com _id preenchido)
     */
    async save() {
        const client = db();
        await client.connect();
        const colecao = client.db().collection('livros');

        if (this._id) {
            // --- ATUALIZAÇÃO ---
            // Separamos _id do restante dos dados com destructuring.
            // Não queremos enviar o _id dentro de $set, pois o MongoDB
            // não permite alterar o _id de um documento.
            const { _id, ...dados } = this;

            await colecao.updateOne(
                { _id: new ObjectId(_id) },  // filtro: qual documento atualizar
                { $set: dados }              // $set: quais campos alterar
            );
        } else {
            // --- INSERÇÃO ---
            // insertOne persiste o documento e retorna o ID gerado.
            // Guardamos o insertedId na própria instância para que
            // o chamador possa acessar o _id do livro recém-criado.
            const resultado = await colecao.insertOne(this);
            this._id = resultado.insertedId;
        }

        await client.close();
        return this;
    }

    /**
     * delete() — remove o livro do banco pelo seu _id
     *
     * Exemplo:
     *   const livro = new Livro({ _id: '64a1f2...' });
     *   await livro.delete();
     */
    async delete() {
        const client = db();
        await client.connect();
        const colecao = client.db().collection('livros');

        // deleteOne remove o primeiro documento que corresponde ao filtro.
        // Como _id é único, isso sempre apaga exatamente um registro.
        await colecao.deleteOne({ _id: new ObjectId(this._id) });

        await client.close();
    }
}

// Exporta a classe para que outros arquivos possam usá-la com require()
module.exports = Livro;
