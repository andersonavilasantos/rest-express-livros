/**
 * model/livros.js
 *
 * Responsabilidade: definir a estrutura (Schema) e o modelo (Model)
 * da coleção "livros" no MongoDB.
 *
 * Com Mongoose, trabalhamos em duas etapas:
 *
 *   1. Schema → descreve os campos, tipos e regras de validação
 *   2. Model  → classe gerada a partir do Schema, com métodos prontos
 *               para todas as operações CRUD
 *
 * Depois de exportar o Model, qualquer arquivo que o importar pode chamar:
 *   Livro.find()                      → lista todos
 *   Livro.findById(id)                → busca um pelo ID
 *   Livro.create(dados)               → insere um novo
 *   Livro.findByIdAndUpdate(id, dados) → atualiza pelo ID
 *   Livro.findByIdAndDelete(id)        → remove pelo ID
 */

const mongoose = require('mongoose');

/**
 * Schema do Livro
 *
 * Define a "forma" que cada documento da coleção deve ter.
 * O Mongoose usa essas definições para:
 *   - Converter tipos automaticamente (ex: "2024" → 2024 para Number)
 *   - Validar dados antes de salvar (required, min, max, etc.)
 *   - Ignorar campos desconhecidos que não estão no schema
 *
 * Tipos disponíveis: String, Number, Boolean, Date, Array, mongoose.Schema.Types.ObjectId
 */
const livroSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true   // campo obrigatório — erro se não for enviado
    },
    autor: {
        type: String,
        required: true
    },
    ano: {
        type: Number
    },
    preco: {
        type: Number
    }
});

/**
 * Model: Livro
 *
 * mongoose.model('Livro', livroSchema) faz duas coisas:
 *   1. Cria uma classe com todos os métodos CRUD já implementados
 *   2. Associa essa classe à coleção 'livros' no MongoDB
 *      (o Mongoose converte 'Livro' → 'livros' automaticamente:
 *       coloca em minúsculo e adiciona 's' no plural)
 *
 * Exportamos o Model diretamente para ser usado nas rotas.
 */
module.exports = mongoose.model('Livro', livroSchema);
