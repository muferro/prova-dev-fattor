import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchStatusFromBff } from '../services/fattorBffClient';

describe('BFF Client (fetchStatusFromBff)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('deve realizar a chamada GET para /api/status/:chave sem expor credenciais', async () => {
    const fakeChave = '35240300000000000199550010000000011234567890';
    const mockResponse = {
      status: 'ativo',
      usuario: 'demo@prova.dev',
      ambiente: 'prova-dev',
      versao: '1.0.0',
      ultima_consulta: '2026-09-26T11:00:00Z',
      chave_nfe: fakeChave,
      situacao: 'autorizada',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as any);

    const result = await fetchStatusFromBff(fakeChave);
    expect(result.situacao).toBe('autorizada');
    expect(result.chave_nfe).toBe(fakeChave);

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/status/${fakeChave}`,
      expect.objectContaining({
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
    );
  });

  it('deve lançar erro descritivo quando o BFF retornar status não-200', async () => {
    const fakeChave = '11111111111111111111111111111111111111111111';

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Chave inválida' }),
    } as any);

    await expect(fetchStatusFromBff(fakeChave)).rejects.toThrow('Chave inválida');
  });
});
