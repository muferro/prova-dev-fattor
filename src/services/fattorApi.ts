import { LoginCredentials, LoginResponse, StatusApiResponse } from '../types/api';

export const DIRECT_API_BASE_URL = 'https://symphony.fattorcredito.com.br/public/prova-dev';
export const PROXY_API_BASE_URL = '/api-fattor';

// No navegador, utiliza o proxy '/api-fattor' por padrão para evitar bloqueios de CORS da API
export const DEFAULT_API_BASE_URL =
  typeof window !== 'undefined' ? PROXY_API_BASE_URL : DIRECT_API_BASE_URL;

export const DEFAULT_CREDENTIALS: LoginCredentials = {
  email: 'demo@prova.dev',
  password: 'demo123',
};

export class FattorApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private tokenExpiresAt: number | null = null;
  private credentials: LoginCredentials;
  private isRetryingFallback: boolean = false;

  constructor(
    baseUrl: string = DEFAULT_API_BASE_URL,
    credentials: LoginCredentials = DEFAULT_CREDENTIALS
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.credentials = credentials;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setCredentials(credentials: LoginCredentials) {
    this.credentials = credentials;
    this.token = null;
    this.tokenExpiresAt = null;
  }

  public setToken(token: string, expiresInSeconds: number = 3600) {
    this.token = token;
    this.tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
  }

  public getToken(): string | null {
    return this.token;
  }

  public isTokenValid(): boolean {
    if (!this.token || !this.tokenExpiresAt) return false;
    // Considera expirado se faltar menos de 30 segundos
    return Date.now() < this.tokenExpiresAt - 30000;
  }

  /**
   * Realiza login no endpoint POST /login
   */
  public async login(): Promise<LoginResponse> {
    const url = `${this.baseUrl}/login`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(this.credentials),
      });

      if (!response.ok) {
        let errorMsg = `Erro na autenticação (${response.status} ${response.statusText})`;
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMsg = errorData.error;
          }
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMsg);
      }

      const data: LoginResponse = await response.json();
      this.setToken(data.token, data.expires_in);
      this.isRetryingFallback = false;
      return data;
    } catch (error: any) {
      if (
        (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) &&
        !this.isRetryingFallback
      ) {
        this.isRetryingFallback = true;
        // Fallback automático entre Direct URL e Proxy URL
        const fallbackUrl =
          this.baseUrl === DIRECT_API_BASE_URL ? PROXY_API_BASE_URL : DIRECT_API_BASE_URL;
        console.warn(`[FattorAPI] Falha de CORS/Rede ao acessar ${this.baseUrl}. Tentando fallback: ${fallbackUrl}`);
        this.baseUrl = fallbackUrl;
        try {
          const fallbackRes = await this.login();
          return fallbackRes;
        } finally {
          this.isRetryingFallback = false;
        }
      }
      this.isRetryingFallback = false;
      throw error;
    }
  }

  /**
   * Garante um token válido antes de qualquer requisição autenticada
   */
  public async ensureValidToken(): Promise<string> {
    if (!this.isTokenValid()) {
      const loginRes = await this.login();
      return loginRes.token;
    }
    return this.token!;
  }

  /**
   * Consulta o status de um item pela chave da NF-e (GET /status/{chave})
   */
  public async getStatus(chave: string): Promise<StatusApiResponse> {
    if (!chave || chave.trim().length === 0) {
      throw new Error('A chave de acesso da NF-e é obrigatória.');
    }

    const token = await this.ensureValidToken();
    const url = `${this.baseUrl}/status/${encodeURIComponent(chave.trim())}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 401) {
        // Token pode ter sido revogado; força novo login e tenta uma única vez novamente
        this.token = null;
        const newToken = await this.login();
        const retryResponse = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${newToken.token}`,
            Accept: 'application/json',
          },
        });

        if (!retryResponse.ok) {
          throw new Error(`Erro ${retryResponse.status} na consulta de status após renovação de token.`);
        }
        return await retryResponse.json();
      }

      if (!response.ok) {
        let errorMsg = `Erro ${response.status} na consulta`;
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch {
          // ignore
        }
        throw new Error(errorMsg);
      }

      const data: StatusApiResponse = await response.json();
      return data;
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw new Error(`Falha de conexão ao consultar status da chave ${chave}.`);
      }
      throw error;
    }
  }
}

// Instância singleton padrão para uso simplificado na UI
export const fattorApi = new FattorApiClient();
