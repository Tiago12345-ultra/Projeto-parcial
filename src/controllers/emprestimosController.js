const { livros } = require("./livrosController");
const { leitores } = require("./leitoresController");

const emprestimos = [];

function calcularDiasAtraso(dataPrevistaDevolucao, dataDevolucao) {
  const prazo = new Date(dataPrevistaDevolucao);
  const devolucao = new Date(dataDevolucao);

  const diferenca = devolucao - prazo;
  const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));

  return Math.max(0, dias);
}

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

const ultimoEmprestimoDevolvido = emprestimos
  .filter(
    (emprestimo) =>
      emprestimo.leitorId === leitorId &&
      emprestimo.dataDevolucao !== null
  )
  .sort(
    (a, b) =>
      new Date(b.dataDevolucao) - new Date(a.dataDevolucao)
  )[0];

let prazoDias = 7;

if (
  ultimoEmprestimoDevolvido &&
  ultimoEmprestimoDevolvido.diasAtraso >= 1 &&
  ultimoEmprestimoDevolvido.diasAtraso <= 7
) {
  prazoDias = 4;
}

dataPrevistaDevolucao.setDate(
  dataPrevistaDevolucao.getDate() + prazoDias
);

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

  const dataDevolucao = req.body.dataDevolucao
  ? new Date(req.body.dataDevolucao).toISOString()
  : new Date().toISOString();

const diasAtraso = calcularDiasAtraso(
  emprestimo.dataPrevistaDevolucao,
  dataDevolucao
);

emprestimo.dataDevolucao = dataDevolucao;
emprestimo.diasAtraso = diasAtraso;

res.json(emprestimo);
}