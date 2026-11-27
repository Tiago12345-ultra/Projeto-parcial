const emprestimoService = require("../services/emprestimoService");

async function listarEmprestimos(req, res) {
  const emprestimos = await emprestimoService.listar();
  res.json(emprestimos);
}

async function cadastrarEmprestimo(req, res) {
  const emprestimo = await emprestimoService.registrar(req.body ?? {});
  res.status(201).json(emprestimo);
}

async function devolverEmprestimo(req, res) {
  const { dataDevolucao } = req.body ?? {};
  const emprestimo = await emprestimoService.devolver(req.params.id, dataDevolucao);
  res.json(emprestimo);
}

module.exports = { listarEmprestimos, cadastrarEmprestimo, devolverEmprestimo };
