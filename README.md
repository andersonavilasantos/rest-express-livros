# API REST de Livros — Express + MongoDB

API simples para gerenciar um catálogo de livros, construída com **Node.js**, **Express** e **MongoDB**. O ambiente roda inteiramente via **Docker**, sem necessidade de instalar Node ou MongoDB na máquina.

---

## Conceitos abordados

| Conceito | Onde aparece |
|---|---|
| Rotas REST (GET, POST, PUT, DELETE) | `index.js` |
| Middleware de JSON | `app.use(express.json())` |
| Conexão com banco de dados | `model/db.js` |
| Modelo de dados com classe JS | `model/livros.js` |
| CRUD completo | `model/livros.js` + rotas |
| Ambiente com Docker Compose | `docker-compose.yml` |

---

## Estrutura do projeto

```
rest-express-livros/
├── model/
│   ├── db.js        # cria e retorna a conexão com o MongoDB
│   └── livros.js    # classe Livro com operações CRUD
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
git clone <url-do-repositorio>
cd rest-express-livros
```

### 2. Suba os contêineres

```bash
docker compose up
```

Na primeira execução, o Docker vai baixar as imagens (pode demorar alguns minutos). Nas próximas execuções será instantâneo.

Você verá algo assim quando o servidor estiver pronto:

```
node-1   | Servidor rodando na porta 3000
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

Exporta uma função que cria uma nova conexão com o MongoDB toda vez que é chamada. O hostname `mongo` é resolvido automaticamente pelo Docker Compose.

```js
const { MongoClient } = require('mongodb');

module.exports = function () {
    return new MongoClient('mongodb://mongo/livraria');
};
```

---

### `model/livros.js`

A classe `Livro` encapsula toda a lógica de banco de dados:

- **`Livro.find(id?)`** — busca todos os livros ou um específico pelo ID
- **`livro.save()`** — insere se não tiver `_id`, atualiza se tiver
- **`livro.delete()`** — remove pelo `_id`

Cada método abre uma conexão, executa a operação e fecha a conexão logo em seguida.

---

### `index.js`

Define as 5 rotas REST e delega toda a lógica de dados para a classe `Livro`:

| Método | Rota | Ação |
|---|---|---|
| GET | `/livros` | lista todos |
| GET | `/livros/:id` | busca um |
| POST | `/livros` | cadastra |
| PUT | `/livros/:id` | atualiza |
| DELETE | `/livros/:id` | remove |

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

1. Adicione um campo `genero` ao livro e atualize as rotas para filtrar por gênero com `GET /livros?genero=ficcao`.
2. Crie uma rota `GET /livros/autor/:nome` que retorne todos os livros de um autor.
3. Adicione validação: retorne `400 Bad Request` se `titulo` ou `autor` não forem enviados no POST.
4. Implemente paginação na rota de listagem com os parâmetros `?pagina=1&limite=10`.
