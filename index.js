/**
 * index.js — ponto de entrada da aplicação
 *
 * Este arquivo tem duas responsabilidades:
 *   1. Configurar o servidor Express (middlewares e rotas)
 *   2. Iniciar o servidor na porta 3000
 *
 * O que é Express?
 * Express é um framework web para Node.js que simplifica a criação de
 * servidores HTTP. Ele cuida do roteamento (qual função executa para
 * cada URL + método HTTP) e do ciclo requisição/resposta (req/res).
 */

// Importa o framework Express
const express = require('express');

// Importa a classe Livro que contém toda a lógica de banco de dados
const Livro = require('./model/livros');

// Cria a aplicação Express
const app = express();

/**
 * Middleware: express.json()
 *
 * Middleware é uma função que processa a requisição ANTES de chegar
 * na rota. express.json() lê o corpo da requisição (body), interpreta
 * como JSON e disponibiliza em req.body.
 *
 * Sem isso, req.body seria undefined nas rotas POST e PUT.
 */
app.use(express.json());


// =============================================================================
// ROTAS
// =============================================================================
// Cada rota segue o padrão REST:
//   Verbo HTTP  +  URL              +  significado
//   GET            /livros             listar todos
//   GET            /livros/:id         buscar um
//   POST           /livros             criar novo
//   PUT            /livros/:id         atualizar existente
//   DELETE         /livros/:id         remover


/**
 * GET /livros
 * Retorna todos os livros cadastrados.
 *
 * req (request)  → objeto com os dados que o cliente enviou
 * res (response) → objeto com métodos para enviar a resposta
 *
 * res.json() serializa o valor para JSON e envia com
 * Content-Type: application/json automaticamente.
 */
app.get('/livros', async (req, res) => {
    const livros = await Livro.find();   // busca todos no banco
    res.json(livros);                    // responde com status 200 por padrão
});


/**
 * GET /livros/:id
 * Retorna um único livro identificado pelo :id da URL.
 *
 * O ':id' é um parâmetro de rota dinâmico.
 * Se a URL for /livros/64a1f2, então req.params.id === '64a1f2'.
 */
app.get('/livros/:id', async (req, res) => {
    const livro = await Livro.find(req.params.id);

    // Se não encontrou o livro, retorna 404 com mensagem de erro
    if (!livro) return res.status(404).json({ erro: 'Livro não encontrado' });

    res.json(livro);
});


/**
 * POST /livros
 * Cria um novo livro com os dados enviados no corpo (body) da requisição.
 *
 * O cliente deve enviar um JSON assim:
 * {
 *   "titulo": "1984",
 *   "autor": "George Orwell",
 *   "ano": 1949,
 *   "preco": 39.90
 * }
 *
 * req.body contém esse objeto, graças ao middleware express.json().
 *
 * Respondemos com status 201 (Created) em vez de 200 (OK) porque
 * um recurso novo foi criado — essa distinção segue a convenção REST.
 */
app.post('/livros', async (req, res) => {
    const livro = new Livro(req.body);  // cria instância com os dados do body
    await livro.save();                 // persiste no banco (INSERT)
    res.status(201).json(livro);        // retorna o livro já com o _id gerado
});


/**
 * PUT /livros/:id
 * Substitui os dados de um livro existente.
 *
 * O cliente envia os campos atualizados no body.
 * O spread '...req.body' copia todos os campos do body para o objeto,
 * enquanto '_id: req.params.id' garante que o ID correto seja usado.
 */
app.put('/livros/:id', async (req, res) => {
    const livro = new Livro({ _id: req.params.id, ...req.body });
    await livro.save();   // como tem _id, vai fazer UPDATE
    res.json(livro);
});


/**
 * DELETE /livros/:id
 * Remove um livro pelo ID.
 *
 * Respondemos com status 204 (No Content): a operação foi bem-sucedida,
 * mas não há nada para retornar. Por isso usamos res.send() sem corpo.
 */
app.delete('/livros/:id', async (req, res) => {
    const livro = new Livro({ _id: req.params.id });
    await livro.delete();
    res.status(204).send();
});


// =============================================================================
// INICIALIZAÇÃO DO SERVIDOR
// =============================================================================

/**
 * app.listen(porta, callback)
 * Faz o servidor começar a escutar conexões TCP na porta informada.
 * O callback é executado uma vez, assim que o servidor estiver pronto.
 */
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
