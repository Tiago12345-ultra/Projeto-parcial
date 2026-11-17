
import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from './api';
import './App.css';

function App() {
  const [livros, setLivros] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function carregarLivros() {
    setCarregando(true);
    setErro('');

    try {
      const dados = await apiGet('/livros');
      setLivros(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function salvarLivro(event) {
    event.preventDefault();

    if (!titulo.trim() || !autor.trim()) {
      setErro('Preencha o título e o autor.');
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      const dados = {
        titulo: titulo.trim(),
        autor: autor.trim(),
      };

      if (editando !== null) {
        await apiPut(`/livros/${editando}`, dados);
      } else {
        await apiPost('/livros', dados);
      }

      setTitulo('');
      setAutor('');
      setEditando(null);
      await carregarLivros();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  function iniciarEdicao(livro) {
    setEditando(livro.id);
    setTitulo(livro.titulo);
    setAutor(livro.autor);
    setErro('');
  }

  function cancelarEdicao() {
    setEditando(null);
    setTitulo('');
    setAutor('');
    setErro('');
  }

  async function excluirLivro(id) {
    const confirmar = window.confirm('Deseja realmente excluir este livro?');

    if (!confirmar) return;

    setErro('');

    try {
      await apiDelete(`/livros/${id}`);
      await carregarLivros();
    } catch (error) {
      setErro(error.message);
    }
  }

  const livrosFiltrados = livros.filter((livro) =>
    `${livro.titulo} ${livro.autor}`
      .toLowerCase()
      .includes(pesquisa.toLowerCase())
  );

  useEffect(() => {
    carregarLivros();
  }, []);

  return (
    <main style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h1>Biblioteca</h1>

      <h2>{editando !== null ? 'Editar livro' : 'Cadastrar livro'}</h2>

      <form onSubmit={salvarLivro}>
        <div>
          <label htmlFor="titulo">Título:</label>
          <input
            id="titulo"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            placeholder="Digite o título"
          />
        </div>

        <br />

        <div>
          <label htmlFor="autor">Autor:</label>
          <input
            id="autor"
            value={autor}
            onChange={(event) => setAutor(event.target.value)}
            placeholder="Digite o autor"
          />
        </div>

        <br />

        <button type="submit" disabled={salvando}>
          {salvando
            ? 'Salvando...'
            : editando !== null
              ? 'Salvar alterações'
              : 'Cadastrar livro'}
        </button>

        {editando !== null && (
          <button type="button" onClick={cancelarEdicao}>
            Cancelar
          </button>
        )}
      </form>

      {erro && <p>Erro: {erro}</p>}

      <h2>Livros cadastrados</h2>

      <input
        type="text"
        placeholder="Pesquisar por título ou autor"
        value={pesquisa}
        onChange={(event) => setPesquisa(event.target.value)}
      />

      {carregando ? (
        <p>Carregando livros...</p>
      ) : livrosFiltrados.length === 0 ? (
        <p>Nenhum livro encontrado.</p>
      ) : (
        <ul>
          {livrosFiltrados.map((livro) => (
            <li key={livro.id}>
              <strong>{livro.titulo}</strong> - {livro.autor}{' '}
              <button onClick={() => iniciarEdicao(livro)}>
                Editar
              </button>{' '}
              <button onClick={() => excluirLivro(livro.id)}>
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;
