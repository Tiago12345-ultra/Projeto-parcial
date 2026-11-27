
const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

const { livros } = require("../src/controllers/livrosController");
const { leitores } = require("../src/controllers/leitoresController");

const {
  emprestimos,
  cadastrarEmprestimo,
  devolverEmprestimo,
  listarHistoricoLeitor
} = require("../src/controllers/emprestimosController");

beforeEach(() => {
  livros.length = 0;
  leitores.length = 0;
  emprestimos.length = 0;

  livros.push({
    id: 1,
    titulo: "Livro de Teste",
    autor: "Autor de Teste"
  });

  leitores.push({
    id: 1,
    nome: "Leitor de Teste",
    email: "teste@email.com",
    bloqueado: false
  });
});

function criarResposta() {
  return {
    statusCode: 200,
    dados: null,

    status(codigo) {
      this.statusCode = codigo;
      return this;
    },

    json(dados) {
      this.dados = dados;
      return this;
    }
  };
}

test("Deve cadastrar um empréstimo com sucesso", () => {
  const req = {
    body: {
      leitorId: 1,
      livroId: 1
    }
  };

  const res = criarResposta();

  cadastrarEmprestimo(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(emprestimos.length, 1);
  assert.equal(res.dados.leitorId, 1);
  assert.equal(res.dados.livroId, 1);
  assert.equal(res.dados.dataDevolucao, null);
});

test("Deve definir o prazo normal de 7 dias", () => {
  const req = {
    body: {
      leitorId: 1,
      livroId: 1
    }
  };

  const res = criarResposta();

  cadastrarEmprestimo(req, res);

  const dataEmprestimo = new Date(res.dados.dataEmprestimo);
  const dataPrevista = new Date(res.dados.dataPrevistaDevolucao);

  dataEmprestimo.setDate(dataEmprestimo.getDate() + 7);

  assert.equal(res.statusCode, 201);
  assert.equal(dataPrevista.getTime(), dataEmprestimo.getTime());
});

test("Deve impedir empréstimo para leitor inexistente", () => {
  const req = {
    body: {
      leitorId: 999,
      livroId: 1
    }
  };

  const res = criarResposta();

  cadastrarEmprestimo(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.dados.mensagem, "Leitor não encontrado");
  assert.equal(emprestimos.length, 0);
});

test("Deve impedir empréstimo de livro inexistente", () => {
  const req = {
    body: {
      leitorId: 1,
      livroId: 999
    }
  };

  const res = criarResposta();

  cadastrarEmprestimo(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.dados.mensagem, "Livro não encontrado");
  assert.equal(emprestimos.length, 0);
});

test("Deve impedir mais de 3 empréstimos ativos", () => {
  livros.push(
    { id: 2, titulo: "Livro 2", autor: "Autor 2" },
    { id: 3, titulo: "Livro 3", autor: "Autor 3" },
    { id: 4, titulo: "Livro 4", autor: "Autor 4" }
  );

  for (let i = 1; i <= 3; i++) {
    const req = {
      body: {
        leitorId: 1,
        livroId: i
      }
    };

    const res = criarResposta();

    cadastrarEmprestimo(req, res);

    assert.equal(res.statusCode, 201);
  }

  const req = {
    body: {
      leitorId: 1,
      livroId: 4
    }
  };

  const res = criarResposta();

  cadastrarEmprestimo(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(
    res.dados.mensagem,
    "Leitor já possui 3 empréstimos ativos"
  );
  assert.equal(emprestimos.length, 3);
});

test("Deve devolver um empréstimo sem atraso", () => {
  const reqCadastro = {
    body: {
      leitorId: 1,
      livroId: 1
    }
  };

  const resCadastro = criarResposta();

  cadastrarEmprestimo(reqCadastro, resCadastro);

  const reqDevolucao = {
    params: { id: 1 },
    body: {}
  };

  const resDevolucao = criarResposta();

  devolverEmprestimo(reqDevolucao, resDevolucao);

  assert.equal(resDevolucao.statusCode, 200);
  assert.notEqual(resDevolucao.dados.dataDevolucao, null);
  assert.equal(resDevolucao.dados.diasAtraso, 0);
});

test("Deve calcular corretamente 3 dias de atraso", () => {
  const reqCadastro = {
    body: {
      leitorId: 1,
      livroId: 1
    }
  };

  const resCadastro = criarResposta();

  cadastrarEmprestimo(reqCadastro, resCadastro);

  const dataAtrasada = new Date(
    resCadastro.dados.dataPrevistaDevolucao
  );

  dataAtrasada.setUTCDate(dataAtrasada.getUTCDate() + 3);

  const reqDevolucao = {
    params: { id: 1 },
    body: {
      dataDevolucao: dataAtrasada.toISOString()
    }
  };

  const resDevolucao = criarResposta();

  devolverEmprestimo(reqDevolucao, resDevolucao);

  assert.equal(resDevolucao.statusCode, 200);
  assert.equal(resDevolucao.dados.diasAtraso, 3);
});


test("Deve reduzir o próximo prazo para 4 dias", () => {
  const reqCadastro = {
    body: {
      leitorId: 1,
      livroId: 1
    }
  };

  const resCadastro = criarResposta();

  cadastrarEmprestimo(reqCadastro, resCadastro);

  const dataAtrasada = new Date(
    resCadastro.dados.dataPrevistaDevolucao
  );

  dataAtrasada.setUTCDate(dataAtrasada.getUTCDate() + 3);

  const reqDevolucao = {
    params: { id: 1 },
    body: {
      dataDevolucao: dataAtrasada.toISOString()
    }
  };

  const resDevolucao = criarResposta();

  devolverEmprestimo(reqDevolucao, resDevolucao);

  assert.equal(resDevolucao.statusCode, 200);
  assert.equal(resDevolucao.dados.diasAtraso, 3);

  const resNovoEmprestimo = criarResposta();

  cadastrarEmprestimo(reqCadastro, resNovoEmprestimo);

  assert.equal(resNovoEmprestimo.statusCode, 201);

  const dataEmprestimo = new Date(
    resNovoEmprestimo.dados.dataEmprestimo
  );

  const dataPrevista = new Date(
    resNovoEmprestimo.dados.dataPrevistaDevolucao
  );

  dataEmprestimo.setDate(dataEmprestimo.getDate() + 4);

  assert.equal(
    dataPrevista.getTime(),
    dataEmprestimo.getTime()
  );
});

function criarEmprestimoAtrasado(dataPrevista) {
  emprestimos.push({
    id: 1,
    leitorId: 1,
    livroId: 1,
    dataEmprestimo: "2026-11-06T12:00:00.000Z",
    dataPrevistaDevolucao: dataPrevista,
    dataDevolucao: null
  });
}

test("Não deve bloquear leitor com 6 dias úteis de atraso", (t) => {
  t.mock.timers.enable({
    apis: ["Date"],
    now: new Date("2026-11-23T12:00:00.000Z")
  });

  criarEmprestimoAtrasado("2026-11-13T12:00:00.000Z");

  livros.push({
    id: 2,
    titulo: "Livro 2",
    autor: "Autor 2"
  });

  const req = {
    body: {
      leitorId: 1,
      livroId: 2
    }
  };

  const res = criarResposta();

  cadastrarEmprestimo(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(leitores[0].bloqueado, false);
  assert.equal(emprestimos.length, 2);
});

test("Deve bloquear leitor com 7 dias úteis de atraso", (t) => {
  t.mock.timers.enable({
    apis: ["Date"],
    now: new Date("2026-11-24T12:00:00.000Z")
  });

  criarEmprestimoAtrasado("2026-11-13T12:00:00.000Z");

  livros.push({
    id: 2,
    titulo: "Livro 2",
    autor: "Autor 2"
  });

  const req = {
    body: {
      leitorId: 1,
      livroId: 2
    }
  };

  const res = criarResposta();

  cadastrarEmprestimo(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.dados.mensagem, "Leitor bloqueado");
  assert.equal(leitores[0].bloqueado, true);
  assert.equal(emprestimos.length, 1);
});

test("Deve impedir devolução de empréstimo inexistente", () => {
  const req = {
    params: { id: 999 },
    body: {}
  };

  const res = criarResposta();

  devolverEmprestimo(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(
    res.dados.mensagem,
    "Empréstimo não encontrado"
  );
});

test("Deve impedir que um empréstimo seja devolvido duas vezes", () => {
  const reqCadastro = {
    body: {
      leitorId: 1,
      livroId: 1
    }
  };

  const resCadastro = criarResposta();

  cadastrarEmprestimo(reqCadastro, resCadastro);

  assert.equal(resCadastro.statusCode, 201);

  const reqDevolucao = {
    params: { id: 1 },
    body: {}
  };

  const resPrimeiraDevolucao = criarResposta();

  devolverEmprestimo(reqDevolucao, resPrimeiraDevolucao);

  assert.equal(resPrimeiraDevolucao.statusCode, 200);

  const resSegundaDevolucao = criarResposta();

  devolverEmprestimo(reqDevolucao, resSegundaDevolucao);

  assert.equal(resSegundaDevolucao.statusCode, 400);
  assert.equal(
    resSegundaDevolucao.dados.mensagem,
    "Empréstimo já foi devolvido"
  );
});

test("Deve retornar somente o histórico do leitor consultado", () => {
  leitores.push({
    id: 2,
    nome: "Leitor 2",
    email: "leitor2@email.com",
    bloqueado: false
  });

  emprestimos.push(
    {
      id: 1,
      leitorId: 1,
      livroId: 1,
      dataDevolucao: null
    },
    {
      id: 2,
      leitorId: 1,
      livroId: 1,
      dataDevolucao: "2026-11-20T12:00:00.000Z"
    },
    {
      id: 3,
      leitorId: 2,
      livroId: 1,
      dataDevolucao: null
    }
  );

  const req = {
    params: { id: 1 }
  };

  const res = criarResposta();

  listarHistoricoLeitor(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.dados.length, 2);
  assert.equal(res.dados[0].leitorId, 1);
  assert.equal(res.dados[1].leitorId, 1);
  assert.equal(res.dados[0].dataDevolucao, null);
  assert.notEqual(res.dados[1].dataDevolucao, null);
});

test("Deve retornar histórico vazio para leitor sem empréstimos", () => {
  const req = {
    params: { id: 1 }
  };

  const res = criarResposta();

  listarHistoricoLeitor(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.dados, []);
});

test("Deve retornar erro ao consultar histórico de leitor inexistente", () => {
  const req = {
    params: { id: 999 }
  };

  const res = criarResposta();

  listarHistoricoLeitor(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(
    res.dados.mensagem,
    "Leitor não encontrado"
  );
});