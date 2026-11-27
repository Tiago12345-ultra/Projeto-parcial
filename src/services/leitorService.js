const leitorModel = require("../models/leitorModel");
const { idValido } = require("../utils/documento");
const { ErroHttp } = require("../utils/erros");

async function listar() {
  return leitorModel.buscarTodas();
}

async function cadastrar({ nome, email }) {
  return leitorModel.inserir({ nome, email, bloqueado: false });
}

async function buscarPorId(id) {
  if (!idValido(id)) throw new ErroHttp(404, "Leitor não encontrado");

  const leitor = await leitorModel.buscarPorId(id);
  if (!leitor) throw new ErroHttp(404, "Leitor não encontrado");

  return leitor;
}

module.exports = { listar, cadastrar, buscarPorId };
