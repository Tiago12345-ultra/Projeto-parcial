
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../api';

function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [erroCadastro, setErroCadastro] = useState('');
  const [leitores, setLeitores] = useState([]);
const [livros, setLivros] = useState([]);
const [leitorId, setLeitorId] = useState('');
const [livroId, setLivroId] = useState('');
const [salvando, setSalvando] = useState(false);
const [sucesso, setSucesso] = useState('');
const [devolvendo, setDevolvendo] = useState(null);
const [erroDevolucao, setErroDevolucao] = useState('');
const [sucessoDevolucao, setSucessoDevolucao] = useState('');
const [leitorHistoricoId, setLeitorHistoricoId] = useState('');
const [historico, setHistorico] = useState([]);
const [carregandoHistorico, setCarregandoHistorico] = useState(false);
const [erroHistorico, setErroHistorico] = useState('');
const [historicoConsultado, setHistoricoConsultado] = useState(false);

  useEffect(() => {
  Promise.all([
    apiGet('/emprestimos'),
    apiGet('/leitores'),
    apiGet('/livros')
  ])
    .then(([dadosEmprestimos, dadosLeitores, dadosLivros]) => {
      setEmprestimos(dadosEmprestimos);
      setLeitores(dadosLeitores);
      setLivros(dadosLivros);
    })
    .catch((error) => {
      setErro(error.message);
    })
    .finally(() => {
      setCarregando(false);
    });
}, []);



async function cadastrarEmprestimo(event) {
  event.preventDefault();

  setErroCadastro('');
  setSucesso('');

  if (!leitorId || !livroId) {
    setErroCadastro('Selecione um leitor e um livro.');
    return;
  }

  setSalvando(true);

  try {
    const novoEmprestimo = await apiPost('/emprestimos', {
      leitorId: Number(leitorId),
      livroId: Number(livroId)
    });

    setEmprestimos((anteriores) => [
      ...anteriores,
      novoEmprestimo
    ]);

    setLeitorId('');
    setLivroId('');
    setSucesso('Empréstimo registrado com sucesso!');
  } catch (error) {
    if (error.status === 400) {
      setErroCadastro(
        'O leitor já possui 3 empréstimos ativos.'
      );
    } else if (error.status === 403) {
      setErroCadastro(
        'O leitor está bloqueado e não pode realizar empréstimos.'
      );
    } else if (error.status === 404) {
      setErroCadastro('Leitor ou livro não encontrado.');
    } else {
      setErroCadastro(error.message);
    }
  } finally {
    setSalvando(false);
  }
}


async function devolverEmprestimo(id) {
  const confirmar = window.confirm(
    'Deseja confirmar a devolução deste livro?'
  );

  if (!confirmar) {
    return;
  }

  setErroDevolucao('');
  setSucessoDevolucao('');
  setErroCadastro('');
  setSucesso('');
  setDevolvendo(id);

  try {
    const emprestimoAtualizado = await apiPut(
      `/emprestimos/${id}/devolucao`,
      {}
    );

    setEmprestimos((anteriores) =>
      anteriores.map((emprestimo) =>
        emprestimo.id === id
          ? emprestimoAtualizado
          : emprestimo
      )
    );

    setSucessoDevolucao(
      'Devolução registrada com sucesso!'
    );
  } catch (error) {
    if (error.status === 400) {
      setErroDevolucao(
        'Este empréstimo já foi devolvido.'
      );
    } else if (error.status === 404) {
      setErroDevolucao(
        'Empréstimo não encontrado.'
      );
    } else {
      setErroDevolucao(error.message);
    }
  } finally {
    setDevolvendo(null);
  }
}


async function consultarHistorico(event) {
  event.preventDefault();

  setErroHistorico('');
  setHistorico([]);
  setHistoricoConsultado(false);

  if (!leitorHistoricoId) {
    setErroHistorico('Selecione um leitor.');
    return;
  }

  setCarregandoHistorico(true);

  try {
    const dados = await apiGet(
      `/emprestimos/leitor/${leitorHistoricoId}`
    );

    setHistorico(dados);
    setHistoricoConsultado(true);
  } catch (error) {
    if (error.status === 404) {
      setErroHistorico('Leitor não encontrado.');
    } else {
      setErroHistorico(error.message);
    }
  } finally {
    setCarregandoHistorico(false);
  }
}





  function formatarData(data) {
    if (!data) {
      return '-';
    }

    return new Date(data).toLocaleDateString('pt-BR');
  }

  return (
    <section>
      <h2>Empréstimos</h2>

<h3>Registrar empréstimo</h3>

<form onSubmit={cadastrarEmprestimo}>
  <div>
    <label htmlFor="leitorEmprestimo">Leitor: </label>

    <select
      id="leitorEmprestimo"
      value={leitorId}
      onChange={(event) => setLeitorId(event.target.value)}
      required
    >
      <option value="">Selecione um leitor</option>

      {leitores.map((leitor) => (
        <option key={leitor.id} value={leitor.id}>
          {leitor.nome}
        </option>
      ))}
    </select>
  </div>

  <br />

  <div>
    <label htmlFor="livroEmprestimo">Livro: </label>

    <select
      id="livroEmprestimo"
      value={livroId}
      onChange={(event) => setLivroId(event.target.value)}
      required
    >
      <option value="">Selecione um livro</option>

      {livros.map((livro) => (
        <option key={livro.id} value={livro.id}>
          {livro.titulo}
        </option>
      ))}
    </select>
  </div>

  <br />

  <button type="submit" disabled={salvando || carregando}>
    {salvando ? 'Registrando...' : 'Registrar empréstimo'}
  </button>
</form>

{sucesso && <p>{sucesso}</p>}
{erroCadastro && (
  <p role="alert">{erroCadastro}</p>
)}

<h3>Empréstimos cadastrados</h3>

{sucessoDevolucao && (
  <p role="status">{sucessoDevolucao}</p>
)}

{erroDevolucao && (
  <p role="alert">{erroDevolucao}</p>
)}


      {erro && <p>Erro: {erro}</p>}

      {carregando ? (
        <p>Carregando empréstimos...</p>
      ) : erro ? (
        <p>Não foi possível carregar os empréstimos.</p>
      ) : emprestimos.length === 0 ? (
        <p>Nenhum empréstimo cadastrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Leitor</th>
              <th>Livro</th>
              <th>Data do empréstimo</th>
              <th>Prazo de devolução</th>
              <th>Data da devolução</th>
              <th>Situação</th>
              <th>Dias de atraso</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {emprestimos.map((emprestimo) => (
              <tr key={emprestimo.id}>
                <td>{emprestimo.id}</td>
                <td>
  {leitores.find(
    (leitor) => leitor.id === emprestimo.leitorId
  )?.nome || `Leitor ${emprestimo.leitorId}`}
</td>

<td>
  {livros.find(
    (livro) => livro.id === emprestimo.livroId
  )?.titulo || `Livro ${emprestimo.livroId}`}
</td>
                <td>
                  {formatarData(emprestimo.dataEmprestimo)}
                </td>
                <td>
                  {formatarData(emprestimo.dataPrevistaDevolucao)}
                </td>
                <td>
                  {formatarData(emprestimo.dataDevolucao)}
                </td>
                <td>
                  {emprestimo.dataDevolucao
                    ? 'Devolvido'
                    : 'Ativo'}

<td>
  {emprestimo.dataDevolucao
    ? emprestimo.diasAtraso ?? 0
    : '-'}
</td>

<td>
  {emprestimo.dataDevolucao ? (
    'Concluído'
  ) : (
    <button
      type="button"
      disabled={devolvendo !== null}
      onClick={() => devolverEmprestimo(emprestimo.id)}
    >
      {devolvendo === emprestimo.id
        ? 'Devolvendo...'
        : 'Devolver'}
    </button>
  )}
</td>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

<hr />

<h3>Histórico de empréstimos por leitor</h3>

<form onSubmit={consultarHistorico}>
  <div>
    <label htmlFor="leitorHistorico">
      Leitor:
    </label>

    <select
      id="leitorHistorico"
      value={leitorHistoricoId}
      disabled={carregandoHistorico}
      onChange={(event) => {
        setLeitorHistoricoId(event.target.value);
        setHistorico([]);
        setHistoricoConsultado(false);
        setErroHistorico('');
      }}
      required
    >
      <option value="">Selecione um leitor</option>

      {leitores.map((leitor) => (
        <option key={leitor.id} value={leitor.id}>
          {leitor.nome}
        </option>
      ))}
    </select>
  </div>

  <br />

  <button
    type="submit"
    disabled={carregandoHistorico || carregando}
  >
    {carregandoHistorico
      ? 'Consultando...'
      : 'Consultar histórico'}
  </button>
</form>

{erroHistorico && (
  <p role="alert">{erroHistorico}</p>
)}

{carregandoHistorico && (
  <p>Carregando histórico...</p>
)}

{historicoConsultado && (
  <div>
    <p>Total de empréstimos: {historico.length}</p>

    <p>
      Empréstimos ativos: {
        historico.filter(
          (emprestimo) => emprestimo.dataDevolucao === null
        ).length
      }
    </p>

    <p>
      Empréstimos devolvidos: {
        historico.filter(
          (emprestimo) => emprestimo.dataDevolucao !== null
        ).length
      }
    </p>

    {historico.length === 0 ? (
      <p>Este leitor não possui empréstimos registrados.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Livro</th>
            <th>Data do empréstimo</th>
            <th>Prazo de devolução</th>
            <th>Data da devolução</th>
            <th>Situação</th>
            <th>Dias de atraso</th>
          </tr>
        </thead>

        <tbody>
          {historico.map((emprestimo) => (
            <tr key={emprestimo.id}>
              <td>{emprestimo.id}</td>

              <td>
                {livros.find(
                  (livro) => livro.id === emprestimo.livroId
                )?.titulo || `Livro ${emprestimo.livroId}`}
              </td>

              <td>
                {formatarData(emprestimo.dataEmprestimo)}
              </td>

              <td>
                {formatarData(emprestimo.dataPrevistaDevolucao)}
              </td>

              <td>
                {formatarData(emprestimo.dataDevolucao)}
              </td>

              <td>
                {emprestimo.dataDevolucao
                  ? 'Devolvido'
                  : 'Ativo'}
              </td>

              <td>
                {emprestimo.dataDevolucao
                  ? emprestimo.diasAtraso ?? 0
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}

    </section>
  );
}

export default Emprestimos;
