const leitores = [];

function listarLeitores(req, res) {
  res.json(leitores);
}

function cadastrarLeitor(req, res) {
  const novoLeitor = {
    id: leitores.length + 1,
    nome: req.body.nome,
    email: req.body.email
  };

  leitores.push(novoLeitor);

  res.status(201).json(novoLeitor);
}

function buscarLeitor(req, res) {
  const id = Number(req.params.id);

  const leitor = leitores.find((leitor) => leitor.id === id);

  if (!leitor) {
    return res.status(404).json({ mensagem: "Leitor não encontrado" });
  }

  res.json(leitor);
}

module.exports = {
  listarLeitores,
  cadastrarLeitor,
  buscarLeitor
};