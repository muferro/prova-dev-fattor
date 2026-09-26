export type CnabRecordType = '0' | '1' | '9';

export interface CnabHeader {
  codigoBanco: string;
  literalRemessa: string;
  codigoServico: string;
  literalServico: string;
  nomeEmpresa: string;
  dataGravacao: string;
  dataGravacaoFormatada: string;
  sequencialRemessa: string;
}

export interface CnabDetail {
  linha: number;
  tipoRegistro: '1';
  agenciaConta: string;
  nossoNumero: string;
  carteira: string;
  seuNumero: string;
  numeroDocumento: string;
  especieTitulo: string;
  vencimentoRaw: string;
  vencimentoFormatado: string;
  valor: number;
  valorFormatado: string;
  aceite: string;
  documentoPagador: string;
  nomePagador: string;
  cidade: string;
  cep: string;
  uf: string;
  chaveNFe: string;
  dvNFeValido?: boolean;
  dvNFeCalculado?: number;
  rawLine: string;
}

export interface CnabTrailer {
  totalLinhasArquivo: number;
}

export interface CnabParseResult {
  success: boolean;
  header: CnabHeader | null;
  details: CnabDetail[];
  trailer: CnabTrailer | null;
  totalLinhas: number;
  valorTotal: number;
  errors: string[];
  warnings: string[];
}
