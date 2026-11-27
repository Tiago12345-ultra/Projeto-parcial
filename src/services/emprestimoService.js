
const emprestimoModel = require("../models/emprestimoModel");
const leitorModel = require("../models/leitorModel");
const livroModel = require("../models/livroModel");
const { idValido } = require("../utils/documento");
const { ErroHttp } = require("../utils/erros");

const PRAZO_PADRAO_DIAS = 7;
const PRAZO_REDUZIDO_DIAS = 4;
const LIMITE_EMPRESTIMOS_ATIVOS = 3;
const DIAS_UTEIS_PARA_BLOQUEIO = 7;

function calcularDiasAtraso(dataPrevistaDevolucao, dataDevolucao) {
  const prazo = new Date(dataPrevistaDevolucao);
  const devolucao = new Date(dataDevolucao);

  const diferenca = devolucao - prazo;
  const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));

  return Math.max(0, dias);
}

function contarDiasUteisAposPrazo(dataPrevistaDevolucao, dataAtual) {
  const prazo = new Date(dataPrevistaDevolucao);
  const atual = new Date(dataAtual);

  if (atual <= prazo) return 0;

  const data = new Date(prazo);
  data.setUTCDate(data.getUTCDate() + 1);

  let diasUteis = 0;

  while (data <= atual) {
    const diaDaSemana = data.getUTCDay();

    if (diaDaSemana !== 0 && diaDaSemana !== 6) {
      diasUteis++;
    }

    data.setUTCDate(data.getUTCDate() + 1);
  }

  return diasUteis;
}

async function buscarOuFalhar(model, id, mensagem) {
  if (!idValido(id)) throw new ErroHttp(404, mensagem);

  const registro = await model.buscarPorId(id);
  if (!registro) throw new ErroHttp(404, mensagem);

  return registro;
}

async function bloquearLeitoresEmAtraso() {
  const ativos = await emprestimoModel.buscarTodas({ dataDevolucao: null });
  const agora = new Date();
  const leitoresJaAtualizados = new Set();

  for (const emprestimo of ativos) {
    if (leitoresJaAtualizados.has(emprestimo.leitorId)) continue;

    const diasUteisAtraso = contarDiasUteisAposPrazo(
      emprestimo.dataPrevistaDevolucao,
      agora
    );

    if (diasUteisAtraso >= DIAS_UTEIS_PARA_BLOQUEIO) {
      await leitorModel.atualizar(emprestimo.leitorId, { bloqueado: true });
      leitoresJaAtualizados.add(emprestimo.leitorId);
    }
  }
}

async function listar() {
  return emprestimoModel.buscarTodas();
}

async function registrar({ leitorId, livroId }) {
  await bloquearLeitoresEmAtraso();

  const leitor = await buscarOuFalhar(leitorModel, leitorId, "Leitor não encontrado");
  const livro = await buscarOuFalhar(livroModel, livroId, "Livro não encontrado");

  if (leitor.bloqueado) {
    throw new ErroHttp(403, "Leitor bloqueado");
  }

  const ativos = await emprestimoModel.buscarTodas({
    leitorId: leitor.id,
    dataDevolucao: null,
  });

  if (ativos.length >= LIMITE_EMPRESTIMOS_ATIVOS) {
    throw new ErroHttp(400, "Leitor já possui 3 empréstimos ativos");
  }

  const devolvidos = await emprestimoModel.buscarTodas({
    leitorId: leitor.id,
    dataDevolucao: { $ne: null },
  });

  const ultimoDevolvido = devolvidos.sort(
    (a, b) => new Date(b.dataDevolucao) - new Date(a.dataDevolucao)
  )[0];

  let prazoDias = PRAZO_PADRAO_DIAS;

  if (
    ultimoDevolvido &&
    ultimoDevolvido.diasAtraso >= 1 &&
    ultimoDevolvido.diasAtraso <= 7
  ) {
    prazoDias = PRAZO_REDUZIDO_DIAS;
  }

  const dataEmprestimo = new Date();
  const dataPrevistaDevolucao = new Date(dataEmprestimo);
  dataPrevistaDevolucao.setDate(dataPrevistaDevolucao.getDate() + prazoDias);

  return emprestimoModel.inserir({
    leitorId: leitor.id,
    livroId: livro.id,
    dataEmprestimo: dataEmprestimo.toISOString(),
    dataPrevistaDevolucao: dataPrevistaDevolucao.toISOString(),
    dataDevolucao: null,
  });
}

async function devolver(id, dataInformada) {
  const emprestimo = await buscarOuFalhar(
    emprestimoModel,
    id,
    "Empréstimo não encontrado"
  );

  if (emprestimo.dataDevolucao) {
    throw new ErroHttp(400, "Empréstimo já foi devolvido");
  }

  let dataDevolucao = new Date();

  if (dataInformada) {
    dataDevolucao = new Date(dataInformada);
    if (Number.isNaN(dataDevolucao.getTime())) {
      throw new ErroHttp(400, "Data de devolução inválida");
    }
  }

  const dataDevolucaoIso = dataDevolucao.toISOString();
  const diasAtraso = calcularDiasAtraso(
    emprestimo.dataPrevistaDevolucao,
    dataDevolucaoIso
  );

  return emprestimoModel.atualizar(id, {
    dataDevolucao: dataDevolucaoIso,
    diasAtraso,
  });
}

module.exports = { listar, registrar, devolver };
