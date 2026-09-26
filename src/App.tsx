import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { SummaryCards } from './components/SummaryCards';
import { ResultsList } from './components/ResultsList';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { parseCnab444 } from './services/cnabParser';
import { fattorApi } from './services/fattorApi';
import { SAMPLE_CNAB_RAW, SAMPLE_CNAB_FILENAME } from './services/sampleCnab';
import { CnabParseResult } from './types/cnab';
import { ProcessedItem } from './types/api';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  const [filename, setFilename] = useState<string>('');
  const [parseResult, setParseResult] = useState<CnabParseResult | null>(null);
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ProcessedItem | null>(null);

  // Sincroniza dark mode no HTML root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Processa a consulta de status de todos os itens progressivamente
  const processItemsStatus = useCallback(async (currentItems: ProcessedItem[]) => {
    setIsProcessing(true);
    setProgress({ current: 0, total: currentItems.length });

    try {
      // 1. Garante autenticação inicial
      await fattorApi.ensureValidToken();
      setApiConnected(true);
    } catch (err) {
      setApiConnected(false);
      // Se falhar o login, marca itens com erro
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          situacao: 'erro',
          erro: 'Falha na autenticação da API Fattor',
        }))
      );
      setIsProcessing(false);
      return;
    }

    // 2. Consulta cada item sequencialmente com feedback em tempo real
    for (let i = 0; i < currentItems.length; i++) {
      const item = currentItems[i];

      // Atualiza item para "consultando"
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, situacao: 'consultando' } : it))
      );

      const startTime = performance.now();
      try {
        const response = await fattorApi.getStatus(item.cnab.chaveNFe);
        const duracaoMs = Math.round(performance.now() - startTime);

        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  situacao: response.situacao,
                  response,
                  duracaoMs,
                  consultadoEm: new Date().toISOString(),
                }
              : it
          )
        );
      } catch (error: any) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  situacao: 'erro',
                  erro: error.message || 'Falha ao consultar status',
                }
              : it
          )
        );
      }

      setProgress({ current: i + 1, total: currentItems.length });
      // Pequeno micro-delay de 80ms para suavizar a transição visual
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    setIsProcessing(false);
  }, []);

  // Manipula novo arquivo carregado
  const handleFileLoaded = useCallback(
    (content: string, loadedFilename: string) => {
      setFilename(loadedFilename);
      const result = parseCnab444(content);
      setParseResult(result);

      if (result.details.length > 0) {
        const newItems: ProcessedItem[] = result.details.map((detail) => ({
          id: `${detail.linha}-${detail.chaveNFe}`,
          cnab: detail,
          situacao: 'pendente',
        }));

        setItems(newItems);
        // Inicia automaticamente a consulta à API
        processItemsStatus(newItems);
      } else {
        setItems([]);
      }
    },
    [processItemsStatus]
  );

  // Carrega automaticamente a amostra da prova no primeiro carregamento
  useEffect(() => {
    handleFileLoaded(SAMPLE_CNAB_RAW, SAMPLE_CNAB_FILENAME);
  }, [handleFileLoaded]);

  // Reconsultar todos os itens
  const handleRefreshAll = () => {
    if (items.length > 0 && !isProcessing) {
      processItemsStatus(items);
    }
  };

  // Reconsultar item individual
  const handleRefreshItem = async (targetItem: ProcessedItem) => {
    setItems((prev) =>
      prev.map((it) => (it.id === targetItem.id ? { ...it, situacao: 'consultando' } : it))
    );

    try {
      const response = await fattorApi.getStatus(targetItem.cnab.chaveNFe);
      setItems((prev) =>
        prev.map((it) =>
          it.id === targetItem.id
            ? {
                ...it,
                situacao: response.situacao,
                response,
                consultadoEm: new Date().toISOString(),
              }
            : it
        )
      );
    } catch (error: any) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === targetItem.id
            ? {
                ...it,
                situacao: 'erro',
                erro: error.message || 'Erro ao consultar status',
              }
            : it
        )
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header Bar */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        apiConnected={apiConnected}
        apiUrl={fattorApi.getBaseUrl()}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner / Context Header */}
        <div className="rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-200 border border-brand-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Prova Técnica Dev Sênior • Fattor Crédito
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Processamento CNAB 444 &amp; Validação de Lastro NF-e
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload e análise de arquivos de remessa bancária no padrão <strong>CNAB 444</strong> (444
              posições), com extração das chaves de acesso da NF-e (posições 401 a 444) e consulta
              automatizada de situação fiscal via <strong>API Swagger / OpenAPI</strong>.
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        <FileUpload
          onFileLoaded={handleFileLoaded}
          isLoading={isProcessing}
          currentFilename={filename}
          totalLines={parseResult?.totalLinhas}
          totalItems={parseResult?.details.length}
          errors={parseResult?.errors}
          warnings={parseResult?.warnings}
        />

        {/* KPI Summary Cards */}
        {items.length > 0 && (
          <SummaryCards items={items} valorTotal={parseResult?.valorTotal || 0} />
        )}

        {/* Results List / Table */}
        {items.length > 0 && (
          <ResultsList
            items={items}
            isProcessing={isProcessing}
            progress={progress}
            onRefreshItem={handleRefreshItem}
            onRefreshAll={handleRefreshAll}
            onSelectItem={(item) => setSelectedItem(item)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>Fattor Crédito • Prova Técnica Desenvolvedor</span>
            <span>•</span>
            <span>Layout CNAB 444 (400 + 44 dígitos NF-e)</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://symphony.fattorcredito.com.br/public/prova-dev/swagger"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400"
            >
              Documentação Swagger
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-brand-600 dark:hover:text-brand-400"
            >
              Configurar API
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ItemDetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          setIsSettingsOpen(false);
          setApiConnected(true);
        }}
      />
    </div>
  );
};
