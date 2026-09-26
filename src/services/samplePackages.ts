// Conjunto de amostras em .rem, .ret e .txt para testes rápidos de homologação
export interface TestSample {
  name: string;
  filename: string;
  extension: '.rem' | '.ret' | '.txt';
  badge: string;
  badgeColor: string;
  description: string;
  content: string;
}

export const TEST_SAMPLES: TestSample[] = [
  {
    name: 'Amostra Oficial (10 itens)',
    filename: '01_remessa_oficial.rem',
    extension: '.rem',
    badge: 'Oficial',
    badgeColor: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    description: '10 títulos com as 4 situações fiscais (autorizada, cancelada, rejeitada, denegada).',
    content: "0341REMESSA        01COBRANCA   00000000000000PROVA DEV CNAB 444 AMOSTRA    001    0000000000 PROVA TECNICA                 120326      0000001                                                                                                                                                                                                                                                                                                             \r\n10000001000010000000 10000000001PCONTROLE1                0000000005   DUPLICATA MERCANTIL      150425000000001500000099   N              00000000000000PAGADOR FAKE 1                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000011234567890\r\n10000001000010000000 1000000000210CONTROLE2                0000000005   DUPLICATA MERCANTIL      200525000000002835000099   N              00000000000000PAGADOR FAKE 2                                                                                 SAO PAULO      01310100        SP                                                                                                                       35240300000000000199550010000000021234567891\r\n10000001000010000000 100000000039CONTROLE3                0000000005   DUPLICATA MERCANTIL      100625000000004200000099   N              00000000000000PAGADOR FAKE 3                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000031234567892\r\n10000001000010000000 100000000048CONTROLE4                0000000005   DUPLICATA MERCANTIL      050725000000000557500099   N              00000000000000PAGADOR FAKE 4                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000041234567893\r\n10000001000010000000 100000000057CONTROLE5                0000000005   DUPLICATA MERCANTIL      220825000000009900000099   N              00000000000000PAGADOR FAKE 5                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000051234567894\r\n10000001000010000000 100000000066CONTROLE6                0000000005   DUPLICATA MERCANTIL      180925000000001234000099   N              00000000000000PAGADOR FAKE 6                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000061234567895\r\n10000001000010000000 100000000075CONTROLE7                0000000005   DUPLICATA MERCANTIL      121025000000000876000099   N              00000000000000PAGADOR FAKE 7                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000071234567896\r\n10000001000010000000 100000000084CONTROLE8                0000000005   DUPLICATA MERCANTIL      301125000000004450000099   N              00000000000000PAGADOR FAKE 8                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000081234567897\r\n10000001000010000000 100000000093CONTROLE9                0000000005   DUPLICATA MERCANTIL      200126000000003320000099   N              00000000000000PAGADOR FAKE 9                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000091234567898\r\n10000001000010000000 100000000102CONTROLE10               0000000005   DUPLICATA MERCANTIL      150226000000001875000099   N              00000000000000PAGADOR FAKE 10                                                                                SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000101234567899\r\n9                                                                                                                                                                                                                                                                                                                                                                                                       000012                                              \r\n",
  },
  {
    name: 'Lote 100% Aprovados (.ret)',
    filename: '02_retorno_aprovados.ret',
    extension: '.ret',
    badge: '100% Aprovado',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    description: '5 títulos com lastro regular na SEFAZ (Chaves 1, 3, 5, 7 e 10). R$ 1.835,10 antecipáveis.',
    content: "0341REMESSA        01COBRANCA   00000000000000PROVA DEV CNAB 444 AMOSTRA    001    0000000000 PROVA TECNICA                 120326      0000001                                                                                                                                                                                                                                                                                                             \r\n10000001000010000000 10000000001PCONTROLE1                0000000005   DUPLICATA MERCANTIL      150425000000001500000099   N              00000000000000PAGADOR FAKE 1                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000011234567890\r\n10000001000010000000 100000000039CONTROLE3                0000000005   DUPLICATA MERCANTIL      100625000000004200000099   N              00000000000000PAGADOR FAKE 3                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000031234567892\r\n10000001000010000000 100000000057CONTROLE5                0000000005   DUPLICATA MERCANTIL      220825000000009900000099   N              00000000000000PAGADOR FAKE 5                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000051234567894\r\n10000001000010000000 100000000075CONTROLE7                0000000005   DUPLICATA MERCANTIL      121025000000000876000099   N              00000000000000PAGADOR FAKE 7                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000071234567896\r\n10000001000010000000 100000000102CONTROLE10               0000000005   DUPLICATA MERCANTIL      150226000000001875000099   N              00000000000000PAGADOR FAKE 10                                                                                SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000101234567899\r\n9                                                                                                                                                                                                                                                                                                                                                                                                       000007                                              \r\n",
  },
  {
    name: 'Lote Alto Risco (.txt)',
    filename: '03_remessa_risco_bloqueados.txt',
    extension: '.txt',
    badge: '100% Bloqueado',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    description: '5 títulos com cancelamento, rejeição e denegação na SEFAZ (Chaves 2, 4, 6, 8 e 9).',
    content: "0341REMESSA        01COBRANCA   00000000000000PROVA DEV CNAB 444 AMOSTRA    001    0000000000 PROVA TECNICA                 120326      0000001                                                                                                                                                                                                                                                                                                             \r\n10000001000010000000 1000000000210CONTROLE2                0000000005   DUPLICATA MERCANTIL      200525000000002835000099   N              00000000000000PAGADOR FAKE 2                                                                                 SAO PAULO      01310100        SP                                                                                                                       35240300000000000199550010000000021234567891\r\n10000001000010000000 100000000048CONTROLE4                0000000005   DUPLICATA MERCANTIL      050725000000000557500099   N              00000000000000PAGADOR FAKE 4                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000041234567893\r\n10000001000010000000 100000000066CONTROLE6                0000000005   DUPLICATA MERCANTIL      180925000000001234000099   N              00000000000000PAGADOR FAKE 6                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000061234567895\r\n10000001000010000000 100000000084CONTROLE8                0000000005   DUPLICATA MERCANTIL      301125000000004450000099   N              00000000000000PAGADOR FAKE 8                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000081234567897\r\n10000001000010000000 100000000093CONTROLE9                0000000005   DUPLICATA MERCANTIL      200126000000003320000099   N              00000000000000PAGADOR FAKE 9                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000091234567898\r\n9                                                                                                                                                                                                                                                                                                                                                                                                       000007                                              \r\n",
  },
  {
    name: 'Auditoria Módulo 11 (.rem)',
    filename: '04_retorno_modulo11_integro.rem',
    extension: '.rem',
    badge: 'DV Íntegro',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    description: 'Títulos com o 44º dígito calculado rigorosamente segundo a fórmula Módulo 11 da SEFAZ.',
    content: "0341REMESSA        01COBRANCA   00000000000000PROVA DEV CNAB 444 AMOSTRA    001    0000000000 PROVA TECNICA                 120326      0000001                                                                                                                                                                                                                                                                                                             \r\n10000001000010000000 10000000001PCONTROLE1                0000000005   DUPLICATA MERCANTIL      150425000000001500000099   N              00000000000000PAGADOR FAKE 1                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000011234567890\r\n10000001000010000000 100000000093CONTROLE9                0000000005   DUPLICATA MERCANTIL      200126000000003320000099   N              00000000000000PAGADOR FAKE 9                                                                                 SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000091234567898\r\n10000001000010000000 100000000102CONTROLE10               0000000005   DUPLICATA MERCANTIL      150226000000001875000099   N              00000000000000PAGADOR FAKE 10                                                                                SAO PAULO      01310100        SP                                                                                                                        35240300000000000199550010000000101234567899\r\n9                                                                                                                                                                                                                                                                                                                                                                                                       000005                                              \r\n",
  },
  {
    name: 'Invalidação CNAB 400 (.txt)',
    filename: '05_cenario_invalido_cnab400.txt',
    extension: '.txt',
    badge: 'Layout Inválido',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    description: 'Linhas com 400 caracteres (sem a extensão de 44 posições da NF-e). Dispara erro de layout.',
    content: "0341REMESSA        01COBRANCA   00000000000000PROVA DEV CNAB 444 AMOSTRA    001    0000000000 PROVA TECNICA                 120326      0000001                                                                                                                                                                                                                                                                 \r\n10000001000010000000 10000000001PCONTROLE1                0000000005   DUPLICATA MERCANTIL      150425000000001500000099   N              00000000000000PAGADOR FAKE 1                                                                                 SAO PAULO      01310100        SP                                                                                                                        \r\n10000001000010000000 1000000000210CONTROLE2                0000000005   DUPLICATA MERCANTIL      200525000000002835000099   N              00000000000000PAGADOR FAKE 2                                                                                 SAO PAULO      01310100        SP                                                                                                                       \r\n10000001000010000000 100000000039CONTROLE3                0000000005   DUPLICATA MERCANTIL      100625000000004200000099   N              00000000000000PAGADOR FAKE 3                                                                                 SAO PAULO      01310100        SP                                                                                                                        \r\n10000001000010000000 100000000048CONTROLE4                0000000005   DUPLICATA MERCANTIL      050725000000000557500099   N              00000000000000PAGADOR FAKE 4                                                                                 SAO PAULO      01310100        SP                                                                                                                        \r\n10000001000010000000 100000000057CONTROLE5                0000000005   DUPLICATA MERCANTIL      220825000000009900000099   N              00000000000000PAGADOR FAKE 5                                                                                 SAO PAULO      01310100        SP                                                                                                                        \r\n10000001000010000000 100000000066CONTROLE6                0000000005   DUPLICATA MERCANTIL      180925000000001234000099   N              00000000000000PAGADOR FAKE 6                                                                                 SAO PAULO      01310100        SP                                                                                                                        \r\n10000001000010000000 100000000075CONTROLE7                0000000005   DUPLICATA MERCANTIL      121025000000000876000099   N              00000000000000PAGADOR FAKE 7                                                                                 SAO PAULO      01310100        SP                                                                                                                        \r\n10000001000010000000 100000000084CONTROLE8                0000000005   DUPLICATA MERCANTIL      301125000000004450000099   N              00000000000000PAGADOR FAKE 8                                                                                 SAO PAULO      01310100        SP                                                                                                                        \r\n10000001000010000000 100000000093CONTROLE9                0000000005   DUPLICATA MERCANTIL      200126000000003320000099   N              00000000000000PAGADOR FAKE 9                                                                                 SAO PAULO      01310100        SP                                                                                                                        \r\n10000001000010000000 100000000102CONTROLE10               0000000005   DUPLICATA MERCANTIL      150226000000001875000099   N              00000000000000PAGADOR FAKE 10                                                                                SAO PAULO      01310100        SP                                                                                                                        \r\n9                                                                                                                                                                                                                                                                                                                                                                                                       000012  \r\n",
  },
  {
    name: 'Lote Massivo (1.200 itens)',
    filename: '06_lote_massivo_1200_titulos.rem',
    extension: '.rem',
    badge: '1.200 Itens',
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    description: 'Cenário de estresse com 1.200 títulos para testar paginação, busca instantânea e performance.',
    get content() {
      return generateMassiveSample(1200);
    },
  },
];

function generateMassiveSample(count = 1200): string {
  const sample10 = [
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

  const header =
    '0341REMESSA        01COBRANCA   00000000000000PROVA DEV CNAB 444 AMOSTRA    001    0000000000 PROVA TECNICA                 120326      0000001' +
    ' '.repeat(301);

  const dates = [
    '150425',
    '200525',
    '100625',
    '050725',
    '220825',
    '180925',
    '121025',
    '301125',
    '200126',
    '150226',
  ];
  const values = [
    150000, 283500, 420000, 55750, 990000, 123400, 87600, 445000, 332000,
    187500,
  ];

  const lines = [header];

  for (let i = 1; i <= count; i++) {
    const idx = (i - 1) % 10;
    const p1 = '10000001000010000000 ';
    const nossoNum = ('1' + String(i).padStart(10, '0')).substring(0, 11);
    const carteira = 'P';
    const ctrl = ('CONTROLE' + i).padEnd(25, ' ');
    const doc = '0000000005   DUPLICATA MERCANTIL      ';
    const venc = dates[idx];
    const val = String(values[idx] + (i * 10)).padStart(13, '0');
    const middle = '00099   N              00000000000000';
    const pagador = ('PAGADOR FAKE ' + i).padEnd(95, ' ');
    const cidade = 'SAO PAULO      01310100        SP' + ' '.repeat(120);
    const chave = sample10[idx];

    lines.push(
      p1 +
      nossoNum +
      carteira +
      ctrl +
      doc +
      venc +
      val +
      middle +
      pagador +
      cidade +
      chave
    );
  }

  const totalLines = count + 2;
  const trailer =
    '9' +
    ' '.repeat(391) +
    String(totalLines).padStart(6, '0') +
    ' '.repeat(46);
  lines.push(trailer);

  return lines.join('\r\n') + '\r\n';
}

