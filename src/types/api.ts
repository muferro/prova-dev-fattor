import { CnabDetail } from './cnab';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires_in: number;
  type: string;
}

export type SituacaoNFe =
  | 'autorizada'
  | 'cancelada'
  | 'rejeitada'
  | 'denegada'
  | 'nao_encontrada';

export type ProcessStatus = SituacaoNFe | 'pendente' | 'consultando' | 'erro';

export interface StatusApiResponse {
  status: string;
  usuario: string;
  ambiente: string;
  versao: string;
  ultima_consulta: string;
  chave_nfe: string;
  situacao: SituacaoNFe;
}

export interface ProcessedItem {
  id: string;
  cnab: CnabDetail;
  situacao: ProcessStatus;
  response?: StatusApiResponse;
  erro?: string;
  consultadoEm?: string;
  duracaoMs?: number;
}
