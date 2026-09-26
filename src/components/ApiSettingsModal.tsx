import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { fattorApi, DEFAULT_API_BASE_URL, DEFAULT_CREDENTIALS } from '../services/fattorApi';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [baseUrl, setBaseUrl] = useState(fattorApi.getBaseUrl());
  const [email, setEmail] = useState(DEFAULT_CREDENTIALS.email);
  const [password, setPassword] = useState(DEFAULT_CREDENTIALS.password);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      fattorApi.setBaseUrl(baseUrl);
      fattorApi.setCredentials({ email, password });
      const res = await fattorApi.login();
      setTestResult({
        success: true,
        message: `Autenticado com sucesso! Token Bearer gerado (expira em ${res.expires_in}s).`,
      });
      onSaved();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Falha ao conectar com o endpoint de autenticação.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleResetDefaults = () => {
    setBaseUrl(DEFAULT_API_BASE_URL);
    setEmail(DEFAULT_CREDENTIALS.email);
    setPassword(DEFAULT_CREDENTIALS.password);
    setTestResult(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Configurações da API Fattor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                URL Base da API (Swagger / OpenAPI):
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setBaseUrl('/api-fattor')}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    baseUrl === '/api-fattor'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Usa o proxy reverso do Vite local para contornar restrições de CORS do navegador"
                >
                  Proxy Local (/api-fattor)
                </button>
                <button
                  type="button"
                  onClick={() => setBaseUrl('https://symphony.fattorcredito.com.br/public/prova-dev')}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    baseUrl.startsWith('http')
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  URL Direta
                </button>
              </div>
            </div>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="/api-fattor ou https://symphony.fattorcredito.com.br/public/prova-dev"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {baseUrl === '/api-fattor'
                ? '✅ Modo Proxy ativo: as requisições passam pelo Vite local sem bloqueio de CORS do navegador.'
                : '⚠️ Modo Direto ativo: o servidor da API não envia cabeçalhos CORS, o que pode fazer o navegador bloquear a requisição.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-mail de Login:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Senha:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2 ${
                testResult.success
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="text-xs">{testResult.message}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium"
          >
            Restaurar Padrões
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Fechar
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testando...' : 'Salvar & Testar Conexão'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
