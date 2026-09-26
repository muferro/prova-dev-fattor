import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const count = 1200;
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

  const line =
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
    chave;
  if (line.length !== 444) {
    throw new Error(`Linha ${i + 1} possui tamanho incorreto: ${line.length}`);
  }
  lines.push(line);
}

const totalLines = count + 2;
const trailer =
  '9' +
  ' '.repeat(391) +
  String(totalLines).padStart(6, '0') +
  ' '.repeat(46);
if (trailer.length !== 444) {
  throw new Error(`Trailer possui tamanho incorreto: ${trailer.length}`);
}
lines.push(trailer);

const content = lines.join('\r\n') + '\r\n';

const outPath = path.join(
  __dirname,
  '..',
  'pacote-dados',
  '06_lote_massivo_1200_titulos.rem'
);
fs.writeFileSync(outPath, content, 'latin1');
console.log(`Sucesso: Arquivo gerado em ${outPath}`);
console.log(`Total de linhas: ${lines.length} (1200 títulos detalhe)`);
console.log(`Tamanho em bytes: ${content.length} bytes`);
