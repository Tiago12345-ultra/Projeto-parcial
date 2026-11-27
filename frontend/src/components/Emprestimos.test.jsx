
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach
} from 'vitest';

import {
  render,
  screen,
  within,
  cleanup
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import Emprestimos from './Emprestimos';

import {
  apiGet,
  apiPost,
  apiPut
} from '../api';

vi.mock('../api', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn()
}));

const livros = [
  {
    id: 1,
    titulo: 'Dom Casmurro',
    autor: 'Machado de Assis'
  }
];

const leitores = [
  {
    id: 1,
    nome: 'Leitor de Teste',
    bloqueado: false
  }
];

const emprestimoAtivo = {
  id: 1,
  leitorId: 1,
  livroId: 1,
  dataEmprestimo: '2026-11-27T12:00:00.000Z',
  dataPrevistaDevolucao: '2026-12-04T12:00:00.000Z',
  dataDevolucao: null
};


const emprestimoDevolvido = {
  ...emprestimoAtivo,
  dataDevolucao: '2026-11-30T12:00:00.000Z',
  diasAtraso: 0
};



function simularApi(
  listaEmprestimos = [],
  listaHistorico = []
) {
  apiGet.mockImplementation(async (rota) => {
    if (rota === '/emprestimos') {
      return listaEmprestimos;
    }

    if (rota === '/leitores') {
      return leitores;
    }

    if (rota === '/emprestimos/leitor/1') {
      return listaHistorico;
    }

    throw new Error(`Rota não simulada: ${rota}`);
  });
}


describe('Testes do módulo de empréstimos', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    simularApi();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('deve exibir mensagem quando não existem empréstimos', async () => {
    render(<Emprestimos livros={livros} />);

    expect(
      await screen.findByText(
        'Nenhum empréstimo cadastrado.'
      )
    ).toBeInTheDocument();
  });

  it('deve listar os empréstimos cadastrados', async () => {
    simularApi([emprestimoAtivo]);

    render(<Emprestimos livros={livros} />);

    const tabela = await screen.findByRole('table');

    expect(
      within(tabela).getByText('Leitor de Teste')
    ).toBeInTheDocument();

    expect(
      within(tabela).getByText('Dom Casmurro')
    ).toBeInTheDocument();

    expect(
      within(tabela).getByText('Ativo')
    ).toBeInTheDocument();

    expect(
      within(tabela).getByRole('button', {
        name: 'Devolver'
      })
    ).toBeInTheDocument();
  });

  it('deve cadastrar um novo empréstimo', async () => {
    const user = userEvent.setup();

    apiPost.mockResolvedValue(emprestimoAtivo);

    render(<Emprestimos livros={livros} />);

    await screen.findByText(
      'Nenhum empréstimo cadastrado.'
    );

    const campoLeitor = screen.getByLabelText(
      'Leitor:',
      { selector: '#leitorEmprestimo' }
    );

    const campoLivro = screen.getByLabelText('Livro:');

    await user.selectOptions(campoLeitor, '1');
    await user.selectOptions(campoLivro, '1');

    await user.click(
      screen.getByRole('button', {
        name: 'Registrar empréstimo'
      })
    );

    expect(apiPost).toHaveBeenCalledWith(
      '/emprestimos',
      {
        leitorId: 1,
        livroId: 1
      }
    );

    expect(
      await screen.findByText(
        'Empréstimo registrado com sucesso!'
      )
    ).toBeInTheDocument();

    const tabela = await screen.findByRole('table');

    expect(
      within(tabela).getByText('Dom Casmurro')
    ).toBeInTheDocument();

    expect(
      within(tabela).getByText('Ativo')
    ).toBeInTheDocument();

    expect(campoLeitor).toHaveValue('');
    expect(campoLivro).toHaveValue('');
  });

  it('deve exibir erro quando o leitor possui 3 empréstimos ativos', async () => {
    const user = userEvent.setup();

    apiPost.mockRejectedValue({
      status: 400
    });

    render(<Emprestimos livros={livros} />);

    await screen.findByText(
      'Nenhum empréstimo cadastrado.'
    );

    await user.selectOptions(
      screen.getByLabelText('Leitor:', {
        selector: '#leitorEmprestimo'
      }),
      '1'
    );

    await user.selectOptions(
      screen.getByLabelText('Livro:'),
      '1'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Registrar empréstimo'
      })
    );

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'O leitor já possui 3 empréstimos ativos.'
    );

    expect(
      screen.getByText(
        'Nenhum empréstimo cadastrado.'
      )
    ).toBeInTheDocument();
  });

  it('deve exibir erro quando o leitor está bloqueado', async () => {
    const user = userEvent.setup();

    apiPost.mockRejectedValue({
      status: 403
    });

    render(<Emprestimos livros={livros} />);

    await screen.findByText(
      'Nenhum empréstimo cadastrado.'
    );

    await user.selectOptions(
      screen.getByLabelText('Leitor:', {
        selector: '#leitorEmprestimo'
      }),
      '1'
    );

    await user.selectOptions(
      screen.getByLabelText('Livro:'),
      '1'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Registrar empréstimo'
      })
    );

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'O leitor está bloqueado e não pode realizar empréstimos.'
    );

    expect(
      screen.getByText(
        'Nenhum empréstimo cadastrado.'
      )
    ).toBeInTheDocument();
  });

  it('deve registrar a devolução de um empréstimo', async () => {
    const user = userEvent.setup();

    simularApi([emprestimoAtivo]);

    vi.spyOn(window, 'confirm')
      .mockReturnValue(true);

    apiPut.mockResolvedValue(
      emprestimoDevolvido
    );

    render(<Emprestimos livros={livros} />);

    const botaoDevolver = await screen.findByRole(
      'button',
      { name: 'Devolver' }
    );

    await user.click(botaoDevolver);

    expect(apiPut).toHaveBeenCalledWith(
      '/emprestimos/1/devolucao',
      {}
    );

    expect(
      await screen.findByText(
        'Devolução registrada com sucesso!'
      )
    ).toBeInTheDocument();

    const tabela = screen.getByRole('table');

    expect(
      within(tabela).getByText('Devolvido')
    ).toBeInTheDocument();

    expect(
      within(tabela).getByText('Concluído')
    ).toBeInTheDocument();

    expect(
      within(tabela).queryByRole('button', {
        name: 'Devolver'
      })
    ).not.toBeInTheDocument();
  });

  it('deve cancelar a devolução quando o usuário não confirma', async () => {
    const user = userEvent.setup();

    simularApi([emprestimoAtivo]);

    const confirmar = vi.spyOn(
      window,
      'confirm'
    ).mockReturnValue(false);

    render(<Emprestimos livros={livros} />);

    const botaoDevolver = await screen.findByRole(
      'button',
      { name: 'Devolver' }
    );

    await user.click(botaoDevolver);

    expect(confirmar).toHaveBeenCalled();

    expect(apiPut).not.toHaveBeenCalled();

    const tabela = screen.getByRole('table');

    expect(
      within(tabela).getByText('Ativo')
    ).toBeInTheDocument();

    expect(
      within(tabela).getByRole('button', {
        name: 'Devolver'
      })
    ).toBeInTheDocument();
  });


  it('deve consultar o histórico de empréstimos de um leitor', async () => {
    const user = userEvent.setup();

    const segundoEmprestimo = {
      ...emprestimoDevolvido,
      id: 2
    };

    simularApi(
      [emprestimoAtivo, segundoEmprestimo],
      [emprestimoAtivo, segundoEmprestimo]
    );

    render(<Emprestimos livros={livros} />);

    await screen.findByRole('table');

    await user.selectOptions(
      screen.getByLabelText('Leitor:', {
        selector: '#leitorHistorico'
      }),
      '1'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Consultar histórico'
      })
    );

    expect(apiGet).toHaveBeenCalledWith(
      '/emprestimos/leitor/1'
    );

    await screen.findByText(
      'Total de empréstimos'
    );

    const tabelas = screen.getAllByRole('table');
    const tabelaHistorico = tabelas[1];

    expect(tabelas).toHaveLength(2);

    expect(
      within(tabelaHistorico).getByText('Ativo')
    ).toBeInTheDocument();

    expect(
      within(tabelaHistorico).getByText('Devolvido')
    ).toBeInTheDocument();

    expect(
      within(tabelaHistorico).getAllByText('Dom Casmurro')
    ).toHaveLength(2);

    expect(
      screen.getByText('Total de empréstimos')
        .parentElement
    ).toHaveTextContent('2');

    expect(
      screen.getByText('Empréstimos ativos')
        .parentElement
    ).toHaveTextContent('1');

    expect(
      screen.getByText('Empréstimos devolvidos')
        .parentElement
    ).toHaveTextContent('1');
  });

  it('deve exibir mensagem quando o leitor não possui histórico', async () => {
    const user = userEvent.setup();

    simularApi([], []);

    render(<Emprestimos livros={livros} />);

    await screen.findByText(
      'Nenhum empréstimo cadastrado.'
    );

    await user.selectOptions(
      screen.getByLabelText('Leitor:', {
        selector: '#leitorHistorico'
      }),
      '1'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Consultar histórico'
      })
    );

    expect(apiGet).toHaveBeenCalledWith(
      '/emprestimos/leitor/1'
    );

    expect(
      await screen.findByText(
        'Este leitor não possui empréstimos registrados.'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText('Total de empréstimos')
        .parentElement
    ).toHaveTextContent('0');

    expect(
      screen.getByText('Empréstimos ativos')
        .parentElement
    ).toHaveTextContent('0');

    expect(
      screen.getByText('Empréstimos devolvidos')
        .parentElement
    ).toHaveTextContent('0');

    expect(
      screen.queryByRole('table')
    ).not.toBeInTheDocument();
  });


  it('deve atualizar o histórico após cadastrar um empréstimo', async () => {
    const user = userEvent.setup();

    simularApi([], []);

    apiPost.mockResolvedValue(emprestimoAtivo);

    render(<Emprestimos livros={livros} />);

    await screen.findByText(
      'Nenhum empréstimo cadastrado.'
    );

    await user.selectOptions(
      screen.getByLabelText('Leitor:', {
        selector: '#leitorHistorico'
      }),
      '1'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Consultar histórico'
      })
    );

    await screen.findByText(
      'Este leitor não possui empréstimos registrados.'
    );

    await user.selectOptions(
      screen.getByLabelText('Leitor:', {
        selector: '#leitorEmprestimo'
      }),
      '1'
    );

    await user.selectOptions(
      screen.getByLabelText('Livro:'),
      '1'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Registrar empréstimo'
      })
    );

    await screen.findByText(
      'Empréstimo registrado com sucesso!'
    );

    const tabelas = screen.getAllByRole('table');

    expect(tabelas).toHaveLength(2);

    const tabelaHistorico = tabelas[1];

    expect(
      within(tabelaHistorico).getByText('Dom Casmurro')
    ).toBeInTheDocument();

    expect(
      within(tabelaHistorico).getByText('Ativo')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Total de empréstimos')
        .parentElement
    ).toHaveTextContent('1');

    expect(
      screen.getByText('Empréstimos ativos')
        .parentElement
    ).toHaveTextContent('1');

    expect(
      screen.getByText('Empréstimos devolvidos')
        .parentElement
    ).toHaveTextContent('0');

    expect(
      screen.queryByText(
        'Este leitor não possui empréstimos registrados.'
      )
    ).not.toBeInTheDocument();
  });

  it('deve atualizar o histórico após devolver um empréstimo', async () => {
    const user = userEvent.setup();

    simularApi(
      [emprestimoAtivo],
      [emprestimoAtivo]
    );

    vi.spyOn(window, 'confirm')
      .mockReturnValue(true);

    apiPut.mockResolvedValue(
      emprestimoDevolvido
    );

    render(<Emprestimos livros={livros} />);

    await screen.findByRole('table');

    await user.selectOptions(
      screen.getByLabelText('Leitor:', {
        selector: '#leitorHistorico'
      }),
      '1'
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Consultar histórico'
      })
    );

    await screen.findByText(
      'Total de empréstimos'
    );

    const tabelaPrincipal =
      screen.getAllByRole('table')[0];

    await user.click(
      within(tabelaPrincipal).getByRole('button', {
        name: 'Devolver'
      })
    );

    await screen.findByText(
      'Devolução registrada com sucesso!'
    );

    const tabelaHistorico =
      screen.getAllByRole('table')[1];

    expect(
      within(tabelaHistorico).getByText('Devolvido')
    ).toBeInTheDocument();

    expect(
      within(tabelaHistorico).queryByText('Ativo')
    ).not.toBeInTheDocument();

    expect(
      screen.getByText('Total de empréstimos')
        .parentElement
    ).toHaveTextContent('1');

    expect(
      screen.getByText('Empréstimos ativos')
        .parentElement
    ).toHaveTextContent('0');

    expect(
      screen.getByText('Empréstimos devolvidos')
        .parentElement
    ).toHaveTextContent('1');
  });

  it('deve atualizar as opções de livros quando recebe novas props', async () => {
    const { rerender } = render(
      <Emprestimos livros={livros} />
    );

    await screen.findByText(
      'Nenhum empréstimo cadastrado.'
    );

    const campoLivro = screen.getByLabelText('Livro:');

    expect(
      within(campoLivro).getByRole('option', {
        name: 'Dom Casmurro'
      })
    ).toBeInTheDocument();

    const novoLivro = {
      id: 2,
      titulo: 'Livro de Sincronização',
      autor: 'Autor de Teste'
    };

    rerender(
      <Emprestimos livros={[...livros, novoLivro]} />
    );

    expect(
      within(campoLivro).getByRole('option', {
        name: 'Livro de Sincronização'
      })
    ).toBeInTheDocument();

    const livroEditado = {
      ...novoLivro,
      titulo: 'Livro Atualizado'
    };

    rerender(
      <Emprestimos livros={[...livros, livroEditado]} />
    );

    expect(
      within(campoLivro).getByRole('option', {
        name: 'Livro Atualizado'
      })
    ).toBeInTheDocument();

    expect(
      within(campoLivro).queryByRole('option', {
        name: 'Livro de Sincronização'
      })
    ).not.toBeInTheDocument();

    rerender(
      <Emprestimos livros={livros} />
    );

    expect(
      within(campoLivro).queryByRole('option', {
        name: 'Livro Atualizado'
      })
    ).not.toBeInTheDocument();

    expect(
      within(campoLivro).getByRole('option', {
        name: 'Dom Casmurro'
      })
    ).toBeInTheDocument();
  });



});
