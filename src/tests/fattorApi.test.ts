import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FattorApiClient, DEFAULT_CREDENTIALS } from '../services/fattorApi';

describe('FattorApiClient', () => {
  let client: FattorApiClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    client = new FattorApiClient('https://fake-api.fattor.test');
  });

  it('deve realizar login e armazenar o token retornado', async () => {
    const mockToken = 'jwt-token-12345';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        token: mockToken,
        expires_in: 3600,
        type: 'Bearer',
      }),
    } as any);

    const loginRes = await client.login();
    expect(loginRes.token).toBe(mockToken);
    expect(client.getToken()).toBe(mockToken);
    expect(client.isTokenValid()).toBe(true);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://fake-api.fattor.test/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(DEFAULT_CREDENTIALS),
      })
    );
  });

  it('deve consultar o status de uma chave utilizando o Bearer token', async () => {
    client.setToken('valid-token', 3600);

    const fakeStatusResponse = {
      status: 'ativo',
      usuario: 'demo@prova.dev',
      ambiente: 'prova-dev',
      versao: '1.0.0',
      ultima_consulta: '2026-09-23T12:00:00Z',
      chave_nfe: '35240300000000000199550010000000011234567890',
      situacao: 'autorizada',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeStatusResponse,
    } as any);

    const res = await client.getStatus('35240300000000000199550010000000011234567890');
    expect(res.situacao).toBe('autorizada');
    expect(res.chave_nfe).toBe('35240300000000000199550010000000011234567890');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://fake-api.fattor.test/status/35240300000000000199550010000000011234567890',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-token',
        }),
      })
    );
  });

  it('deve renovar o token e repetir a requisição caso receba HTTP 401', async () => {
    client.setToken('expired-token', 3600);

    // Primeiro chamada a /status retorna 401
    // Segunda chamada a /login retorna novo token
    // Terceira chamada a /status com novo token retorna 200
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token expirado' }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ token: 'refreshed-token', expires_in: 3600, type: 'Bearer' }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'ativo',
          chave_nfe: '35240300000000000199550010000000011234567890',
          situacao: 'autorizada',
        }),
      } as any);

    const res = await client.getStatus('35240300000000000199550010000000011234567890');
    expect(res.situacao).toBe('autorizada');
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
