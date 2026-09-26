'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../src/components/Header';
import { FileUpload } from '../src/components/FileUpload';
import { SummaryCards } from '../src/components/SummaryCards';
import { ResultsList } from '../src/components/ResultsList';
import { ItemDetailsModal } from '../src/components/ItemDetailsModal';
import { ApiSettingsModal } from '../src/components/ApiSettingsModal';
import { SecurityModal } from '../src/components/SecurityModal';
import { parseCnab444 } from '../src/services/cnabParser';
import { fetchStatusFromBff } from '../src/services/fattorBffClient';
import { SAMPLE_CNAB_RAW, SAMPLE_CNAB_FILENAME } from '../src/services/sampleCnab';
import { CnabParseResult } from '../src/types/cnab';
import { ProcessedItem } from '../src/types/api';
import { ShieldCheck, ExternalLink, Lock } from 'lucide-react';

export default function Home() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>('');
  const [parseResult, setParseResult] = useState<CnabParseResult | null>(null);
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [apiConnected, setApiConnected] = useState<boolean | null>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ProcessedItem | null>(null);

  // Controle de cancelamento assíncrono e cache local em memória do cliente
  const currentProcessIdRef = useRef<number>(0);
  const clientStatusCacheRef = useRef<Map<string, any>>(new Map());

  // Inicializa tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

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

  // Consulta progressiva de status através do BFF com suporte a lotes massivos (+1.000 itens)
  const processItemsStatus = useCallback(async (currentItems: ProcessedItem[]) => {
    const processId = ++currentProcessIdRef.current;
    setIsProcessing(true);
    setProgress({ current: 0, total: currentItems.length });

    const clientCache = clientStatusCacheRef.current;
    const isSmallBatch = currentItems.length <= 15;

    if (isSmallBatch) {
      // Modo passo-a-passo visual detalhado para lotes pequenos (10 itens da amostra)
      for (let i = 0; i < currentItems.length; i++) {
        if (currentProcessIdRef.current !== processId) return;
        const item = currentItems[i];

        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, situacao: 'consultando' } : it))
        );

        const startTime = performance.now();
        try {
          let response: any;
          if (clientCache.has(item.cnab.chaveNFe)) {
            response = clientCache.get(item.cnab.chaveNFe);
          } else {
            response = await fetchStatusFromBff(item.cnab.chaveNFe);
            clientCache.set(item.cnab.chaveNFe, response);
          }
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
          setApiConnected(true);
        } catch (error: any) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    situacao: 'erro',
                    erro: error.message || 'Falha ao consultar status via BFF',
                  }
                : it
            )
          );
        }

        setProgress({ current: i + 1, total: currentItems.length });
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } else {
      // Modo de alta performance com paralelismo (8 workers), cache e buffer em lote para lotes massivos (+1000 itens)
      const concurrency = 8;
      const queue = [...currentItems];
      let completedCount = 0;
      let lastFlush = performance.now();

      const worker = async () => {
        while (queue.length > 0) {
          if (currentProcessIdRef.current !== processId) return;
          const item = queue.shift();
          if (!item) break;

          const startTime = performance.now();
          try {
            let response: any;
            if (clientCache.has(item.cnab.chaveNFe)) {
              response = clientCache.get(item.cnab.chaveNFe);
            } else {
              response = await fetchStatusFromBff(item.cnab.chaveNFe);
              clientCache.set(item.cnab.chaveNFe, response);
            }
            const duracaoMs = Math.round(performance.now() - startTime);

            item.situacao = response.situacao;
            item.response = response;
            item.duracaoMs = duracaoMs;
            item.consultadoEm = new Date().toISOString();
            setApiConnected(true);
          } catch (error: any) {
            item.situacao = 'erro';
            item.erro = error.message || 'Falha ao consultar status via BFF';
          }

          completedCount++;
          const now = performance.now();
          if (
            now - lastFlush > 80 ||
            completedCount % 50 === 0 ||
            completedCount === currentItems.length
          ) {
            lastFlush = now;
            setProgress({ current: completedCount, total: currentItems.length });
            setItems([...currentItems]);
            await new Promise((r) => setTimeout(r, 0));
          }
        }
      };

      const workers = Array.from({ length: concurrency }, () => worker());
      await Promise.all(workers);
    }

    if (currentProcessIdRef.current === processId) {
      setProgress({ current: currentItems.length, total: currentItems.length });
      setItems([...currentItems]);
      setIsProcessing(false);
    }
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
        processItemsStatus(newItems);
      } else {
        setItems([]);
      }
    },
    [processItemsStatus]
  );

  // Carrega automaticamente a amostra no início
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
      const response = await fetchStatusFromBff(targetItem.cnab.chaveNFe);
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
                erro: error.message || 'Erro ao consultar status via BFF',
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
        onOpenSecurity={() => setIsSecurityOpen(true)}
        apiConnected={apiConnected}
        apiUrl="/api/status (BFF Seguro)"
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner / Context Header */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0c1a2b] via-[#16304d] to-[#1c3a5c] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#b88317]/20">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-[#b88317]/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="max-w-3xl space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#b88317]/20 text-[#f5d9aa] border border-[#b88317]/40 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#e2a441]" />
                  Prova Técnica Dev Sênior • Fattor Crédito
                </div>
                <button
                  type="button"
                  onClick={() => setIsSecurityOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/30 cursor-pointer transition-colors shadow-xs"
                  title="Clique para ver a arquitetura completa de segurança"
                >
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Arquitetura BFF Ativa (Credenciais Protegidas) • Ver Detalhes ➔
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Processamento CNAB 444 &amp; Validação de Lastro NF-e
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Upload e análise de arquivos de remessa bancária no padrão <strong>CNAB 444</strong> (444
                posições), com extração das chaves de acesso da NF-e (posições 401 a 444) e consulta
                automatizada de situação fiscal via <strong>BFF (Backend-For-Frontend)</strong> em Next.js.
              </p>
            </div>

            {/* Official Logo Display in Banner */}
            <div className="hidden lg:flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl shrink-0">
              <img
                src="/logo-fattor.png"
                alt="Fattor Crédito"
                className="w-20 h-20 object-contain drop-shadow-md"
              />
              <span className="text-[11px] font-bold text-[#f5d9aa] mt-2 tracking-wider uppercase">
                Fattor Crédito
              </span>
            </div>
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
            <span>Arquitetura Full-Stack Next.js (App Router + BFF)</span>
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
              Configurações
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ItemDetailsModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenSecurity={() => setIsSecurityOpen(true)}
      />
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => setIsSettingsOpen(false)}
      />
      <SecurityModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />
    </div>
  );
}
