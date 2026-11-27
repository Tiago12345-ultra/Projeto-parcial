const livroService = require("../services/livroService");

async function listarLivros(req, res) {
  const livros = await livroService.listar();
  res.json(livros);
}

async function cadastrarLivro(req, res) {
  const livro = await livroService.cadastrar(req.body ?? {});
  res.status(201).json(livro);
}

async function buscarLivro(req, res) {
  const livro = await livroService.buscarPorId(req.params.id);
  res.json(livro);
}

async function editarLivro(req, res) {
  const livro = await livroService.editar(req.params.id, req.body ?? {});
  res.json(livro);
}

async function excluirLivro(req, res) {
  await livroService.excluir(req.params.id);
  res.json({ mensagem: "Livro excluído com sucesso" });
}

module.exports = { listarLivros, cadastrarLivro, buscarLivro, editarLivro, excluirLivro };
