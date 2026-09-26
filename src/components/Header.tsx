import React from 'react';
import { Moon, Sun, Settings, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onOpenSecurity?: () => void;
  apiConnected: boolean | null;
  apiUrl: string;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onOpenSecurity,
  apiConnected,
  apiUrl,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-1 shadow-sm hover:scale-105 transition-transform">
            <img
              src="/logo-fattor.png"
              alt="Fattor Crédito"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-[#16304d] dark:text-white">
                Fattor
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-[#b88317]/15 text-[#946513] dark:bg-[#b88317]/25 dark:text-[#f5d9aa] border border-[#b88317]/30 shadow-xs">
                Crédito
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Validador CNAB 444 &amp; Checagem de Lastro NF-e
            </p>
          </div>
        </div>

        {/* Right actions: API Status, Settings, Theme */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Connection Indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/60 transition-colors"
            onClick={onOpenSettings}
            title={`API: ${apiUrl} (Clique para configurar)`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiConnected === true
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                  : apiConnected === false
                  ? 'bg-rose-500'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-slate-600 dark:text-slate-300 hidden md:inline">
              API Prova Dev:
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {apiConnected === true
                ? 'Conectada'
                : apiConnected === false
                ? 'Offline'
                : 'Pronta'}
            </span>
          </div>

          {/* Security & BFF Modal trigger */}
          <button
            onClick={onOpenSecurity}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-lg transition-all"
            title="Ver detalhes da arquitetura de segurança BFF, Módulo 11 e OWASP"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Segurança &amp; BFF</span>
          </button>

          {/* Quick link to CNAB Docs */}
          <a
            href="https://symphony.fattorcredito.com.br/public/prova-dev/swagger"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Abrir documentação Swagger / Scalar da API"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Swagger
          </a>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Configurações da API"
            aria-label="Configurações da API"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            aria-label="Alternar tema"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
