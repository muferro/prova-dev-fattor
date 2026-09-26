import { StatusApiResponse } from '../types/api';

/**
 * Cliente frontend que consome o BFF (Backend-For-Frontend) em /api/status/[chave]
 * Nenhuma credencial ou senha é exposta ao navegador.
 */
export async function fetchStatusFromBff(chave: string): Promise<StatusApiResponse> {
  const url = `/api/status/${encodeURIComponent(chave.trim())}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    let errorMsg = `Erro ${response.status} na consulta via BFF`;
    try {
      const errData = await response.json();
      if (errData?.error) {
        errorMsg = errData.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}
