
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

    apiGet.mockResolvedValue([
      { id: 1, titulo: 'Dom Casmurro', autor: 'Machado de Assis' },
      { id: 2, titulo: 'O Pequeno Príncipe', autor: 'Antoine' },
    ]);
  });

  it('deve mostrar os livros cadastrados', async () => {
    render(<App />);

    expect(await screen.findByText('Dom Casmurro')).toBeInTheDocument();
    expect(screen.getByText('O Pequeno Príncipe')).toBeInTheDocument();
  });

  it('deve filtrar livros pela pesquisa', async () => {
    const user = userEvent.setup();

    render(<App />);

    await screen.findByText('Dom Casmurro');

    const campo = screen.getByPlaceholderText(
      'Pesquisar por título ou autor'
    );

    await user.type(campo, 'Dom');

    expect(screen.getByText('Dom Casmurro')).toBeInTheDocument();
    expect(screen.queryByText('O Pequeno Príncipe')).not.toBeInTheDocument();
  });
});
