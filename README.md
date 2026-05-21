# API REST de Livros — Express + Mongoose + MongoDB

API simples para gerenciar um catálogo de livros, construída com **Node.js**, **Express** e **Mongoose** (ODM para MongoDB). O ambiente roda inteiramente via **Docker**, sem necessidade de instalar Node ou MongoDB na máquina.

---

## Conceitos abordados

| Conceito | Onde aparece |
|---|---|
| Rotas REST (GET, POST, PUT, DELETE) | `index.js` |
| Middleware de JSON | `app.use(express.json())` |
| Conexão com banco via Mongoose | `model/db.js` |
| Schema e validação de dados | `model/livros.js` |
| Model com CRUD pronto | `model/livros.js` |
| Tratamento de erros de validação | rotas POST e PUT em `index.js` |
| Ambiente com Docker Compose | `docker-compose.yml` |

---

## Estrutura do projeto

```
rest-express-livros/
├── model/
│   ├── db.js        # abre a conexão com o MongoDB via Mongoose
│   └── livros.js    # Schema + Model da coleção de livros
├── docker-compose.yml
├── index.js         # servidor Express com todas as rotas
├── package.json
└── README.md
```

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- Nenhum outro pré-requisito — Node e MongoDB rodam dentro dos contêineres

---

## Como executar

### 1. Clone ou baixe o projeto

```bash
git clone https://github.com/andersonavilasantos/rest-express-livros.git
cd rest-express-livros
```

### 2. Suba os contêineres

```bash
docker compose up
```

Na primeira execução o Docker baixa as imagens (pode demorar alguns minutos). Nas próximas será instantâneo.

Quando o servidor estiver pronto você verá:

```
node-1   | Conectado ao MongoDB via Mongoose
node-1   | Servidor rodando em http://localhost:3000
```

### 3. Teste a API

Com o servidor rodando, abra outro terminal e use `curl` (ou um cliente como **Postman** / **Insomnia**).

---

## Endpoints da API

### Listar todos os livros

```bash
curl http://localhost:3000/livros
```

**Resposta (200 OK):**
```json
[
  {
    "_id": "64a1f2...",
    "titulo": "O Senhor dos Anéis",
    "autor": "J.R.R. Tolkien",
    "ano": 1954,
    "preco": 59.90
  }
]
```

---

### Buscar um livro pelo ID

```bash
curl http://localhost:3000/livros/<id>
```

**Resposta (200 OK):**
```json
{
  "_id": "64a1f2...",
  "titulo": "O Senhor dos Anéis",
  "autor": "J.R.R. Tolkien",
  "ano": 1954,
  "preco": 59.90
}
```

**Resposta (404 Not Found):**
```json
{ "erro": "Livro não encontrado" }
```

---

### Cadastrar um novo livro

`titulo` e `autor` são obrigatórios. Se faltarem, a API retorna `400`.

```bash
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{"titulo": "1984", "autor": "George Orwell", "ano": 1949, "preco": 39.90}'
```

**Resposta (201 Created):**
```json
{
  "_id": "64b3c8...",
  "titulo": "1984",
  "autor": "George Orwell",
  "ano": 1949,
  "preco": 39.90
}
```

**Resposta (400 Bad Request)** — campo obrigatório faltando:
```json
{ "erro": "Livro validation failed: titulo: Path `titulo` is required." }
```

---

### Atualizar um livro

```bash
curl -X PUT http://localhost:3000/livros/<id> \
  -H "Content-Type: application/json" \
  -d '{"titulo": "1984", "autor": "George Orwell", "ano": 1949, "preco": 45.00}'
```

**Resposta (200 OK):**
```json
{
  "_id": "64b3c8...",
  "titulo": "1984",
  "autor": "George Orwell",
  "ano": 1949,
  "preco": 45.00
}
```

---

### Remover um livro

```bash
curl -X DELETE http://localhost:3000/livros/<id>
```

**Resposta (204 No Content):** sem corpo na resposta.

---

## Como o código funciona

### `model/db.js`

Exporta uma função assíncrona que abre **uma única conexão** com o MongoDB, reutilizada por toda a aplicação. Chamada uma vez antes do servidor iniciar.

```js
const mongoose = require('mongoose');

module.exports = async function conectar() {
    await mongoose.connect('mongodb://mongo/livraria');
};
```

---

### `model/livros.js`

Define o **Schema** (estrutura e validações) e gera o **Model** automaticamente com o Mongoose.

```js
const livroSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    autor:  { type: String, required: true },
    ano:    { type: Number },
    preco:  { type: Number }
});

module.exports = mongoose.model('Livro', livroSchema);
```

O Model `Livro` já vem com todos os métodos CRUD prontos:

| Método | O que faz |
|---|---|
| `Livro.find()` | lista todos |
| `Livro.findById(id)` | busca um pelo ID |
| `Livro.create(dados)` | insere e valida |
| `Livro.findByIdAndUpdate(id, dados, opts)` | atualiza pelo ID |
| `Livro.findByIdAndDelete(id)` | remove pelo ID |

---

### `index.js`

Conecta ao banco, define as 5 rotas e sobe o servidor:

| Método | Rota | Ação |
|---|---|---|
| GET | `/livros` | lista todos |
| GET | `/livros/:id` | busca um |
| POST | `/livros` | cadastra (valida campos obrigatórios) |
| PUT | `/livros/:id` | atualiza |
| DELETE | `/livros/:id` | remove |

O servidor só sobe **depois** que a conexão com o banco é estabelecida.

---

## Parar o servidor

```bash
# Para os contêineres (mantém os dados)
docker compose stop

# Para e remove os contêineres (apaga os dados do banco)
docker compose down
```

---

## Exercícios sugeridos

1. Adicione um campo `genero` ao Schema e filtre por gênero com `GET /livros?genero=ficcao`.
2. Crie uma rota `GET /livros/autor/:nome` que retorne todos os livros de um autor.
3. Adicione validação de valor mínimo no campo `preco` (`min: 0`) diretamente no Schema.
4. Implemente paginação na listagem com `?pagina=1&limite=10` usando `.skip()` e `.limit()` do Mongoose.
