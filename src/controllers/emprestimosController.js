const emprestimos = [];

function listarEmprestimos(req, res) {
  res.json(emprestimos);
}

module.exports = {
  emprestimos,
  listarEmprestimos
};