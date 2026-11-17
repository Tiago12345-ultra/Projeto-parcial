
import { useState } from 'react';
import { apiGet } from './api';
import './App.css';

function App() {
  const [livros, setLivros] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function testarAPI() {
    setCarregando(true);
    setErro('');

    try {
      const dados = await apiGet('/livros');
      setLivros(dados);
    } catch (error) {
      setErro(error.message);
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main style={{ padding: '30px', fontFamily: 'Arial' }}>
      <h1>Biblioteca</h1>
      <h2>Teste de conexão com a API</h2>

      <button onClick={testarAPI} disabled={carregando}>
        {carregando ? 'Consultando...' : 'Buscar livros'}
      </button>

      {erro && <p>Erro: {erro}</p>}

      {livros !== null && (
        <pre>{JSON.stringify(livros, null, 2)}</pre>
      )}
    </main>
  );
}

export default App;
