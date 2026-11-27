
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { apiGet } from './api';

vi.mock('./api', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe('Testes da tela de livros', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    apiGet.mockImplementation(async (rota) => {
      if (rota === '/livros') {
        return [
          {
            id: 1,
            titulo: 'Dom Casmurro',
            autor: 'Machado de Assis'
          },
          {
            id: 2,
            titulo: 'O Pequeno Príncipe',
            autor: 'Antoine'
          }
        ];
      }

      if (rota === '/leitores') {
        return [
          {
            id: 1,
            nome: 'Leitor de Teste',
            bloqueado: false
          }
        ];
      }

      if (rota === '/emprestimos') {
        return [];
      }

      throw new Error(`Rota não simulada: ${rota}`);
    });
  });

  it('deve mostrar os livros cadastrados', async () => {
    render(<App />);

    const lista = await screen.findByRole('list');

    expect(
      within(lista).getByText('Dom Casmurro')
    ).toBeInTheDocument();

    expect(
      within(lista).getByText('O Pequeno Príncipe')
    ).toBeInTheDocument();
  });

  it('deve filtrar livros pela pesquisa', async () => {
    const user = userEvent.setup();

    render(<App />);

    const lista = await screen.findByRole('list');

    expect(
      within(lista).getByText('Dom Casmurro')
    ).toBeInTheDocument();

    const campo = screen.getByPlaceholderText(
      'Pesquisar por título ou autor'
    );

    await user.type(campo, 'Dom');

    expect(
      within(lista).getByText('Dom Casmurro')
    ).toBeInTheDocument();

    expect(
      within(lista).queryByText('O Pequeno Príncipe')
    ).not.toBeInTheDocument();
  });
});
