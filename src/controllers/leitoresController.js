const leitorService = require("../services/leitorService");

async function listarLeitores(req, res) {
  const leitores = await leitorService.listar();
  res.json(leitores);
}

async function cadastrarLeitor(req, res) {
  const leitor = await leitorService.cadastrar(req.body ?? {});
  res.status(201).json(leitor);
}

async function buscarLeitor(req, res) {
  const leitor = await leitorService.buscarPorId(req.params.id);
  res.json(leitor);
}

module.exports = { listarLeitores, cadastrarLeitor, buscarLeitor };
