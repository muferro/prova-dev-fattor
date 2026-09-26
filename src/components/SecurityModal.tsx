import React from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Zap,
  FileCheck2,
  Server,
  FileText,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/logo-fattor.png" alt="Fattor Crédito" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Arquitetura de Segurança &amp; Defesa em Profundidade
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#b88317]/15 text-[#946513] dark:text-[#f5d9aa] border border-[#b88317]/30">
                  Fattor
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Padrões enterprise implementados para operação de crédito e antecipação de recebíveis (FIDC)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* 1. BFF & Credential Isolation */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Lock className="w-4 h-4 text-emerald-500" />
              1. BFF &amp; Isolamento de Segredos
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              O e-mail e senha de serviço residem exclusivamente no servidor (<code className="text-emerald-600 dark:text-emerald-400">.env.local</code>). O cliente browser nunca recebe ou envia credenciais diretas, eliminando riscos de extração via DevTools e contornando bloqueios de CORS.
            </p>
          </div>

          {/* 2. SEFAZ Modulo 11 */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Zap className="w-4 h-4 text-amber-500" />
              2. Auditoria SEFAZ (Módulo 11)
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Implementação matemática dos pesos ponderados de 2 a 9 sobre os primeiros 43 dígitos da chave NF-e. Detecta adulterações manuais de chaves antes da autorização financeira do crédito.
            </p>
          </div>

          {/* 3. Rate Limiting */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Server className="w-4 h-4 text-sky-500" />
              3. Rate Limiting &amp; Proteção DoS
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Controle de tráfego por IP em janela deslizante (máximo de 60 requisições/minuto). Emite cabeçalhos padronizados (<code className="font-mono">X-RateLimit-*</code>, <code className="font-mono">Retry-After</code>) e bloqueia tentativas de força bruta.
            </p>
          </div>

          {/* 4. OWASP Top 10 Headers */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              4. Cabeçalhos OWASP Top 10
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Hardening HTTP via <code className="font-mono">next.config.mjs</code> com <code className="font-mono">X-Frame-Options: DENY</code> (anti-clickjacking), <code className="font-mono">nosniff</code>, HSTS e política estrita de permissões de hardware.
            </p>
          </div>

          {/* 5. Upload Shield */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <FileCheck2 className="w-4 h-4 text-indigo-500" />
              5. Blindagem no Upload de Arquivos
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Limite estrito de 5 MB por arquivo e validação de extensões bancárias (<code className="font-mono">.rem, .ret, .txt</code>). Rejeição imediata no cliente para evitar ataques de exaustão de memória (DoS).
            </p>
          </div>

          {/* 6. Short-TTL Downstream Cache */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <FileText className="w-4 h-4 text-teal-500" />
              6. Proteção de Cota &amp; LGPD
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Cache de 60 segundos por chave NF-e no BFF para preservar cotas da API Fattor/SEFAZ. Dados de Sacados/Pagadores são processados apenas em memória volátil, em estrita conformidade com a LGPD.
            </p>
          </div>
        </div>

        {/* Technical Document Callout */}
        <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/70 dark:border-brand-900/60 dark:bg-brand-950/30 flex items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-brand-900 dark:text-brand-300">
              Documento Completo de Segurança Disponível
            </div>
            <p className="text-brand-700 dark:text-brand-400">
              Consulte o arquivo <code className="font-mono bg-white dark:bg-slate-800 px-1 py-0.5 rounded">docs/SECURITY.md</code> no repositório para ver as fórmulas matemáticas, fluxogramas de autenticação e plano para produção enterprise.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            Entendido
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
