const livroModel = require("../models/livroModel");
const { idValido } = require("../utils/documento");
const { ErroHttp } = require("../utils/erros");

async function buscarOuFalhar(id) {
  if (!idValido(id)) throw new ErroHttp(404, "Livro não encontrado");

  const livro = await livroModel.buscarPorId(id);
  if (!livro) throw new ErroHttp(404, "Livro não encontrado");

  return livro;
}

async function listar() {
  return livroModel.buscarTodas();
}

async function cadastrar({ titulo, autor }) {
  return livroModel.inserir({ titulo, autor });
}

async function buscarPorId(id) {
  return buscarOuFalhar(id);
}

async function editar(id, { titulo, autor }) {
  await buscarOuFalhar(id);

  const campos = {};
  if (titulo !== undefined) campos.titulo = titulo;
  if (autor !== undefined) campos.autor = autor;

  return livroModel.atualizar(id, campos);
}

async function excluir(id) {
  await buscarOuFalhar(id);
  await livroModel.remover(id);
}

module.exports = { listar, cadastrar, buscarPorId, editar, excluir };
