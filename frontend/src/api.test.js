
import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiGet, apiPost, ApiError } from './api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Testes da API', () => {
  it('deve buscar os livros corretamente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ id: 1, titulo: 'Dom Casmurro', autor: 'Machado de Assis' }],
    }));

    const dados = await apiGet('/livros');

    expect(dados).toHaveLength(1);
    expect(dados[0].titulo).toBe('Dom Casmurro');
  });

  it('deve cadastrar um livro', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 2, titulo: 'O Pequeno Príncipe', autor: 'Antoine' }),
    }));

    const dados = await apiPost('/livros', {
      titulo: 'O Pequeno Príncipe',
      autor: 'Antoine',
    });

    expect(dados.id).toBe(2);
    expect(fetch).toHaveBeenCalled();
  });

  it('deve lançar ApiError quando a resposta HTTP falhar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }));

    await expect(apiGet('/livros/99')).rejects.toThrow(ApiError);
  });

  it('deve lançar erro quando a conexão falhar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(
      new TypeError('Failed to fetch')
    ));

    await expect(apiGet('/livros')).rejects.toThrow('Failed to fetch');
  });
});
