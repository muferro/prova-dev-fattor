import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  parseCnab444,
  formatDateDDMMAA,
  parseCurrency,
  formatCurrency,
  isValidNFeKey,
  calculateNFeDV,
  verifyNFeDV,
  CNAB_LINE_LENGTH,
} from '../services/cnabParser';

describe('CNAB 444 Parser & Helpers', () => {
  describe('Utilitários de Formatação & Validação SEFAZ Módulo 11', () => {
    it('formatDateDDMMAA deve formatar data DDMMAA para DD/MM/AAAA', () => {
      expect(formatDateDDMMAA('150425')).toBe('15/04/2025');
      expect(formatDateDDMMAA('120326')).toBe('12/03/2026');
      expect(formatDateDDMMAA('')).toBe('');
      expect(formatDateDDMMAA('invalid')).toBe('invalid');
    });

    it('parseCurrency deve converter centavos para valor float correto', () => {
      expect(parseCurrency('0000000015000')).toBe(150.0);
      expect(parseCurrency('0000000028350')).toBe(283.5);
      expect(parseCurrency('0000000005575')).toBe(55.75);
      expect(parseCurrency('')).toBe(0);
    });

    it('formatCurrency deve formatar valor para padrão BRL', () => {
      const formatted = formatCurrency(150.0);
      expect(formatted).toContain('150');
      expect(formatted).toContain('R$');
    });

    it('isValidNFeKey deve validar se tem exatamente 44 dígitos numéricos', () => {
      expect(isValidNFeKey('35240300000000000199550010000000011234567890')).toBe(true);
      expect(isValidNFeKey('123')).toBe(false);
      expect(isValidNFeKey('3524030000000000019955001000000001123456789A')).toBe(false);
      expect(isValidNFeKey('')).toBe(false);
    });

    it('calculateNFeDV deve calcular o Dígito Verificador SEFAZ Módulo 11 corretamente', () => {
      // Chave 1: primeiro 43 dígitos terminam em 789 -> DV esperado é 0
      const key1_43 = '3524030000000000019955001000000001123456789';
      expect(calculateNFeDV(key1_43)).toBe(0);

      // Chave 9: DV esperado é 8
      const key9_43 = '3524030000000000019955001000000009123456789';
      expect(calculateNFeDV(key9_43)).toBe(8);

      // Chave 10: DV esperado é 9
      const key10_43 = '3524030000000000019955001000000010123456789';
      expect(calculateNFeDV(key10_43)).toBe(9);

      // Inválido
      expect(calculateNFeDV('')).toBe(-1);
      expect(calculateNFeDV('123')).toBe(-1);
    });

    it('verifyNFeDV deve verificar a integridade da chave completa de 44 dígitos', () => {
      // Chave válida com DV 0
      const validKey = '35240300000000000199550010000000011234567890';
      const checkValid = verifyNFeDV(validKey);
      expect(checkValid.isValid).toBe(true);
      expect(checkValid.expectedDV).toBe(0);
      expect(checkValid.actualDV).toBe(0);

      // Chave com DV divergente
      const forgedKey = '35240300000000000199550010000000011234567897';
      const checkForged = verifyNFeDV(forgedKey);
      expect(checkForged.isValid).toBe(false);
      expect(checkForged.expectedDV).toBe(0);
      expect(checkForged.actualDV).toBe(7);
    });
  });

  describe('Processamento do Arquivo Real da Prova (_prova/meu_cnab.rem)', () => {
    const filePath = path.resolve(process.cwd(), '_prova/meu_cnab.rem');
    const content = fs.readFileSync(filePath, 'latin1');

    it('deve processar o arquivo com sucesso e sem erros de layout', () => {
      const result = parseCnab444(content);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.totalLinhas).toBe(12);
      expect(result.details).toHaveLength(10);
    });

    it('deve extrair o Header (Tipo 0) corretamente', () => {
      const result = parseCnab444(content);
      expect(result.header).not.toBeNull();
      expect(result.header?.codigoBanco).toBe('341'); // Banco Itaú
      expect(result.header?.literalRemessa).toBe('REMESSA');
      expect(result.header?.nomeEmpresa).toContain('PROVA DEV CNAB 444 AMOSTRA');
      expect(result.header?.dataGravacaoFormatada).toBe('12/03/2026');
    });

    it('deve extrair o Trailer (Tipo 9) corretamente', () => {
      const result = parseCnab444(content);
      expect(result.trailer).not.toBeNull();
      expect(result.trailer?.totalLinhasArquivo).toBe(12);
    });

    it('deve extrair a Chave NF-e de 44 dígitos de todos os 10 registros de detalhe', () => {
      const result = parseCnab444(content);
      const expectedKeys = [
        '35240300000000000199550010000000011234567890',
        '35240300000000000199550010000000021234567891',
        '35240300000000000199550010000000031234567892',
        '35240300000000000199550010000000041234567893',
        '35240300000000000199550010000000051234567894',
        '35240300000000000199550010000000061234567895',
        '35240300000000000199550010000000071234567896',
        '35240300000000000199550010000000081234567897',
        '35240300000000000199550010000000091234567898',
        '35240300000000000199550010000000101234567899',
      ];

      result.details.forEach((item, index) => {
        expect(item.chaveNFe).toBe(expectedKeys[index]);
        expect(item.chaveNFe).toHaveLength(44);
        expect(isValidNFeKey(item.chaveNFe)).toBe(true);
      });
    });

    it('deve extrair valores comerciais e datas de vencimento com precisão', () => {
      const result = parseCnab444(content);
      const first = result.details[0];

      expect(first.seuNumero).toBe('CONTROLE1');
      expect(first.nossoNumero).toBe('10000000001');
      expect(first.especieTitulo).toBe('DUPLICATA MERCANTIL');
      expect(first.vencimentoFormatado).toBe('15/04/2025');
      expect(first.valor).toBe(150.0);
      expect(first.nomePagador).toBe('PAGADOR FAKE 1');

      // Verifica soma total de todos os títulos
      // 150 + 283.5 + 420 + 55.75 + 990 + 123.4 + 87.6 + 445 + 332 + 187.5 = 3074.75
      expect(result.valorTotal).toBe(3074.75);
    });
  });

  describe('Tratamento de Arquivos Inválidos e Resiliência', () => {
    it('deve rejeitar arquivo vazio', () => {
      const result = parseCnab444('');
      expect(result.success).toBe(false);
      expect(result.errors).toContain('O arquivo fornecido está vazio.');
    });

    it('deve detectar linhas com tamanho diferente de 444 posições (ex: CNAB 400 comum)', () => {
      const fakeLine400 = '0' + 'X'.repeat(399); // 400 caracteres
      const result = parseCnab444(fakeLine400);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.includes('400 caracteres'))).toBe(true);
    });

    it('deve alertar quando faltar Header ou Trailer', () => {
      // 3 linhas de detalhe sem header nem trailer
      const lineDetail = '1' + '0'.repeat(CNAB_LINE_LENGTH - 1);
      const content = `${lineDetail}\n${lineDetail}\n${lineDetail}`;
      const result = parseCnab444(content);

      expect(result.errors.some((e) => e.includes('esperava registro Header'))).toBe(true);
    });

    it('deve processar com alta performance lote massivo com mais de 1.000 títulos (1.200 títulos)', () => {
      const massiveFilePath = path.join(__dirname, '../../pacote-dados/06_lote_massivo_1200_titulos.rem');
      const massiveContent = fs.readFileSync(massiveFilePath, 'latin1');

      const startTime = performance.now();
      const result = parseCnab444(massiveContent);
      const parseDurationMs = performance.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.totalLinhas).toBe(1202);
      expect(result.details).toHaveLength(1200);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.valorTotal).toBeGreaterThan(300000);
      expect(parseDurationMs).toBeLessThan(200); // 1.200 linhas processadas em menos de 200ms
    });
  });
});

