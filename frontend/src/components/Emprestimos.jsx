
import { useEffect, useState } from 'react';
import { apiGet } from '../api';

function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    apiGet('/emprestimos')
      .then((dados) => {
        setEmprestimos(dados);
      })
      .catch((error) => {
        setErro(error.message);
      })
      .finally(() => {
        setCarregando(false);
      });
  }, []);

  function formatarData(data) {
    if (!data) {
      return '-';
    }

    return new Date(data).toLocaleDateString('pt-BR');
  }

  return (
    <section>
      <h2>Empréstimos</h2>

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
            </tr>
          </thead>

          <tbody>
            {emprestimos.map((emprestimo) => (
              <tr key={emprestimo.id}>
                <td>{emprestimo.id}</td>
                <td>{emprestimo.leitorId}</td>
                <td>{emprestimo.livroId}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default Emprestimos;
