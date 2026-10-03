const livros = [];
function listarLivros(req, res) {
res.json(livros);}

function buscarLivro(req, res) {
const id = Number(req.params.id);
const livro = livros.find((livro) => livro.id === id);

if (!livro) {

return res.status(404).json({ mensagem: "Livro não encontrado" });}
res.json(livro);}

function cadastrarLivro(req, res) {
const novoLivro = {
id: livros.length + 1,
titulo: req.body.titulo,
autor: req.body.autor};

livros.push(novoLivro);
res.status(201).json(novoLivro);}

function editarLivro(req, res) {
const id = Number(req.params.id);
const livro = livros.find((livro) => livro.id === id);
  
if (!livro) {

return res.status(404).json({ mensagem: "Livro não encontrado" });}

livro.titulo = req.body.titulo;
livro.autor = req.body.autor;
res.json(livro);}

function excluirLivro(req, res) {
const id = Number(req.params.id);
const indice = livros.findIndex((livro) => livro.id === id);

if (indice === -1) {
return res.status(404).json({ mensagem: "Livro não encontrado" });}

livros.splice(indice, 1);
res.json({ mensagem: "Livro excluído com sucesso" });}

module.exports = {
listarLivros,
cadastrarLivro,
buscarLivro,
editarLivro,
excluirLivro
};