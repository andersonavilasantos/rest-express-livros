/**
 * index.js — ponto de entrada da aplicação
 *
 * Responsabilidades:
 *   1. Conectar ao banco de dados
 *   2. Configurar o servidor Express (middlewares e rotas)
 *   3. Iniciar o servidor na porta 3000
 */

const express = require('express');
const conectar = require('./model/db');
const Livro    = require('./model/livros');

const app = express();

/**
 * Middleware: express.json()
 *
 * Processa o corpo (body) das requisições POST e PUT.
 * Sem ele, req.body seria undefined.
 */
app.use(express.json());


// =============================================================================
// ROTAS
// =============================================================================
// Padrão REST:
//   GET    /livros          → listar todos
//   GET    /livros/:id      → buscar um
//   POST   /livros          → criar novo
//   PUT    /livros/:id      → atualizar existente
//   DELETE /livros/:id      → remover


/**
 * GET /livros
 * Retorna todos os livros cadastrados.
 *
 * Livro.find() é um método do Mongoose que busca todos os documentos
 * da coleção. Equivale a SELECT * em SQL.
 */
app.get('/livros', async (req, res) => {
    const livros = await Livro.find();
    res.json(livros);
});


/**
 * GET /livros/:id
 * Retorna um livro pelo ID.
 *
 * Livro.findById(id) já converte a string para ObjectId internamente —
 * não precisamos mais fazer isso manualmente como com o driver nativo.
 *
 * Se o documento não existir, findById retorna null.
 */
app.get('/livros/:id', async (req, res) => {
    const livro = await Livro.findById(req.params.id);

    if (!livro) return res.status(404).json({ erro: 'Livro não encontrado' });

    res.json(livro);
});


/**
 * POST /livros
 * Cadastra um novo livro.
 *
 * Livro.create(req.body) instancia o modelo, aplica as validações
 * definidas no Schema e persiste no banco em uma única chamada.
 *
 * Se um campo 'required' não for enviado, o Mongoose lança um erro
 * de validação que capturamos no bloco try/catch e retornamos como 400.
 *
 * Respondemos com 201 (Created) pois um novo recurso foi criado.
 */
app.post('/livros', async (req, res) => {
    try {
        const livro = await Livro.create(req.body);
        res.status(201).json(livro);
    } catch (erro) {
        // ValidationError do Mongoose: campo obrigatório faltando, tipo errado, etc.
        res.status(400).json({ erro: erro.message });
    }
});


/**
 * PUT /livros/:id
 * Atualiza os dados de um livro existente.
 *
 * findByIdAndUpdate(id, dados, opções):
 *   - id     → qual documento atualizar
 *   - dados  → campos novos (apenas os enviados serão alterados)
 *   - { new: true } → retorna o documento DEPOIS da atualização
 *                     (sem essa opção, retornaria o documento antigo)
 *   - { runValidators: true } → aplica as validações do Schema no update
 */
app.put('/livros/:id', async (req, res) => {
    try {
        const livro = await Livro.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!livro) return res.status(404).json({ erro: 'Livro não encontrado' });

        res.json(livro);
    } catch (erro) {
        res.status(400).json({ erro: erro.message });
    }
});


/**
 * DELETE /livros/:id
 * Remove um livro pelo ID.
 *
 * findByIdAndDelete(id) busca e remove o documento em uma única operação.
 * Retorna o documento removido, ou null se não existia.
 *
 * 204 (No Content): operação bem-sucedida, sem corpo na resposta.
 */
app.delete('/livros/:id', async (req, res) => {
    const livro = await Livro.findByIdAndDelete(req.params.id);

    if (!livro) return res.status(404).json({ erro: 'Livro não encontrado' });

    res.status(204).send();
});


// =============================================================================
// INICIALIZAÇÃO
// =============================================================================

/**
 * Conectamos ao banco ANTES de iniciar o servidor.
 * Assim garantimos que nenhuma requisição chegue antes do banco estar pronto.
 *
 * O uso de async/await aqui é possível com uma IIFE (função imediatamente invocada):
 * (async () => { ... })()
 */
(async () => {
    await conectar();
    app.listen(3000, () => {
        console.log('Servidor rodando em http://localhost:3000');
    });
})();
