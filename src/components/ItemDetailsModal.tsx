import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Building,
  Tag,
  Key,
  Server,
  Code2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { ProcessedItem } from '../types/api';
import { StatusBadge } from './StatusBadge';

interface ItemDetailsModalProps {
  item: ProcessedItem | null;
  onClose: () => void;
  onOpenSecurity?: () => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  onClose,
  onOpenSecurity,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [showRawCnab, setShowRawCnab] = useState(false);

  if (!item) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(item.cnab.chaveNFe);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Formata chave em blocos visuais de 4 dígitos para melhor legibilidade
  const formattedKeyBlocks = item.cnab.chaveNFe.match(/.{1,4}/g)?.join(' ') || item.cnab.chaveNFe;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/logo-fattor.png" alt="Fattor Crédito" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Detalhes do Título &amp; Lastro NF-e
                </h2>
                <StatusBadge status={item.situacao} size="lg" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Registro Linha {item.cnab.linha} do arquivo CNAB 444
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chave de Acesso Box */}
        <div className="rounded-xl border border-brand-200 bg-brand-50/60 dark:border-brand-900/50 dark:bg-brand-950/30 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-800 dark:text-brand-300">
            <span className="flex items-center gap-1.5">
              <Key className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Chave de Acesso da NF-e (Posições 401 a 444 do CNAB 444)
            </span>
            <button
              onClick={handleCopyKey}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-900 dark:text-brand-300 hover:underline"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Chave
                </>
              )}
            </button>
          </div>
          <div className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white break-all tracking-wider selection:bg-brand-200">
            {formattedKeyBlocks}
          </div>
        </div>

        {/* Auditoria de Integridade Criptográfica / Módulo 11 SEFAZ */}
        <div
          className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs ${
            item.cnab.dvNFeValido
              ? 'bg-emerald-50/70 border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50/70 border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
          }`}
        >
          {item.cnab.dvNFeValido ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <div className="font-bold flex flex-wrap items-center gap-2">
              <span>Auditoria de Integridade SEFAZ (Módulo 11):</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  item.cnab.dvNFeValido
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                }`}
              >
                {item.cnab.dvNFeValido
                  ? 'Dígito Verificador Íntegro'
                  : 'Divergência de DV (Chave Sintética / Teste)'}
              </span>
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">
              {item.cnab.dvNFeValido
                ? `O 44º dígito (${item.cnab.chaveNFe.slice(-1)}) coincide perfeitamente com o algoritmo Módulo 11 calculado sobre os 43 dígitos prévios.`
                : `Dígito declarado: ${item.cnab.chaveNFe.slice(-1)} | Dígito Módulo 11 esperado: ${item.cnab.dvNFeCalculado}. Chave de teste com sufixo sequencial mock ou potencial divergência no lastro fiscal.`}
            </p>
            {onOpenSecurity && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenSecurity}
                  className="font-bold underline text-[11px] hover:opacity-80 transition-opacity inline-flex items-center gap-1"
                >
                  Ver arquitetura de segurança detalhada ➔
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dados Principais do Título */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2.5">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              Dados do Pagador / Sacado
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Razão Social / Nome:</span>
              <span className="font-semibold text-slate-900 dark:text-white text-sm">
                {item.cnab.nomePagador || 'Não informado'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Cidade / UF:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {item.cnab.cidade}/{item.cnab.uf}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">CEP:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {item.cnab.cep}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2.5">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-1 border-b border-slate-200/50 dark:border-slate-700/50">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              Dados Comerciais &amp; Bancários
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Valor Nominal:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {item.cnab.valorFormatado}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Vencimento:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.cnab.vencimentoFormatado}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Seu Número:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {item.cnab.seuNumero}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Nosso Número:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {item.cnab.nossoNumero}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Retorno da API de Status */}
        {item.response && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Server className="w-3.5 h-3.5 text-brand-500" />
                Resposta do Servidor da API Fattor
              </div>
              <span className="text-[11px] text-slate-400">
                Consulta em: {new Date(item.response.ultima_consulta).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Ambiente:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 font-mono">
                  {item.response.ambiente}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Versão API:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 font-mono">
                  {item.response.versao}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Status API:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {item.response.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Usuário:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {item.response.usuario}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Toggles for Technical Inspection */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-brand-600 font-medium"
          >
            <Code2 className="w-3.5 h-3.5" />
            {showRawJson ? 'Ocultar JSON da API' : 'Inspecionar JSON da API'}
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            onClick={() => setShowRawCnab(!showRawCnab)}
            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-brand-600 font-medium"
          >
            <Code2 className="w-3.5 h-3.5" />
            {showRawCnab ? 'Ocultar Linha CNAB 444' : 'Ver Linha CNAB Bruta (444 chars)'}
          </button>
        </div>

        {/* JSON Viewer */}
        {showRawJson && (
          <div className="rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-xs overflow-x-auto">
            <pre>{JSON.stringify(item.response || { situacao: item.situacao, erro: item.erro }, null, 2)}</pre>
          </div>
        )}

        {/* CNAB 444 Raw Line Viewer */}
        {showRawCnab && (
          <div className="space-y-1 rounded-xl bg-slate-900 text-slate-300 p-4 font-mono text-xs overflow-x-auto">
            <div className="text-[11px] text-slate-400 pb-1 border-b border-slate-800">
              Linha de 444 caracteres (Posições 401 a 444 destacadas em verde):
            </div>
            <div className="break-all whitespace-pre-wrap leading-relaxed">
              <span>{item.cnab.rawLine.substring(0, 400)}</span>
              <span className="bg-emerald-500/30 text-emerald-300 font-bold px-0.5 rounded">
                {item.cnab.rawLine.substring(400, 444)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
