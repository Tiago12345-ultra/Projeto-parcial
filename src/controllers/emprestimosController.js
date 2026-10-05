const { livros } = require("./livrosController");
const { leitores } = require("./leitoresController");

const emprestimos = [];

function listarEmprestimos(req, res) {
  res.json(emprestimos);
}

module.exports = {
  emprestimos,
  listarEmprestimos,
  cadastrarEmprestimo,
  devolverEmprestimo
};

function cadastrarEmprestimo(req, res) {
  const leitorId = Number(req.body.leitorId);
  const livroId = Number(req.body.livroId);

  const leitor = leitores.find((leitor) => leitor.id === leitorId);
  const livro = livros.find((livro) => livro.id === livroId);

  if (!leitor) {
    return res.status(404).json({ mensagem: "Leitor não encontrado" });
  }

  if (!livro) {
    return res.status(404).json({ mensagem: "Livro não encontrado" });
  }

  if (leitor.bloqueado) {
    return res.status(403).json({ mensagem: "Leitor bloqueado" });
  }

  const emprestimosAtivos = emprestimos.filter(
    (emprestimo) =>
      emprestimo.leitorId === leitorId &&
      emprestimo.dataDevolucao === null
  );

  if (emprestimosAtivos.length >= 3) {
    return res.status(400).json({
      mensagem: "Leitor já possui 3 empréstimos ativos"
    });
  }

  const dataEmprestimo = new Date();
  const dataPrevistaDevolucao = new Date(dataEmprestimo);

  dataPrevistaDevolucao.setDate(dataPrevistaDevolucao.getDate() + 7);

  const novoEmprestimo = {
    id: emprestimos.length + 1,
    leitorId,
    livroId,
    dataEmprestimo: dataEmprestimo.toISOString(),
    dataPrevistaDevolucao: dataPrevistaDevolucao.toISOString(),
    dataDevolucao: null
  };

  emprestimos.push(novoEmprestimo);

  res.status(201).json(novoEmprestimo);
}

function devolverEmprestimo(req, res) {
  const id = Number(req.params.id);

  const emprestimo = emprestimos.find(
    (emprestimo) => emprestimo.id === id
  );

  if (!emprestimo) {
    return res.status(404).json({
      mensagem: "Empréstimo não encontrado"
    });
  }

  if (emprestimo.dataDevolucao !== null) {
    return res.status(400).json({
      mensagem: "Empréstimo já foi devolvido"
    });
  }

  emprestimo.dataDevolucao = new Date().toISOString();

  res.json(emprestimo);
}