import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Copy,
  Check,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  FileJson,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Zap,
  X,
} from 'lucide-react';
import { ProcessedItem, ProcessStatus } from '../types/api';
import { StatusBadge } from './StatusBadge';

interface ResultsListProps {
  items: ProcessedItem[];
  isProcessing: boolean;
  progress: { current: number; total: number };
  onRefreshItem: (item: ProcessedItem) => void;
  onRefreshAll: () => void;
  onSelectItem: (item: ProcessedItem) => void;
}

export const ResultsList: React.FC<ResultsListProps> = ({
  items,
  isProcessing,
  progress,
  onRefreshItem,
  onRefreshAll,
  onSelectItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'todos' | ProcessStatus>('todos');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number | 'todos'>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtros de contagem para as abas
  const counts = useMemo(() => {
    return {
      todos: items.length,
      autorizada: items.filter((i) => i.situacao === 'autorizada').length,
      cancelada: items.filter((i) => i.situacao === 'cancelada').length,
      rejeitada: items.filter((i) => i.situacao === 'rejeitada').length,
      denegada: items.filter((i) => i.situacao === 'denegada').length,
      nao_encontrada: items.filter((i) => i.situacao === 'nao_encontrada').length,
      erro: items.filter((i) => i.situacao === 'erro').length,
    };
  }, [items]);

  // Lista filtrada
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filtro por aba
      if (selectedFilter !== 'todos' && item.situacao !== selectedFilter) {
        return false;
      }

      // Filtro textual
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.cnab.chaveNFe.toLowerCase().includes(term) ||
        item.cnab.nomePagador.toLowerCase().includes(term) ||
        item.cnab.seuNumero.toLowerCase().includes(term) ||
        item.cnab.nossoNumero.toLowerCase().includes(term)
      );
    });
  }, [items, selectedFilter, searchTerm]);

  // Reseta página para 1 sempre que os filtros ou tamanho de página mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter, pageSize]);

  const totalPages = useMemo(() => {
    if (pageSize === 'todos' || filteredItems.length === 0) return 1;
    return Math.ceil(filteredItems.length / pageSize);
  }, [filteredItems.length, pageSize]);

  const paginatedItems = useMemo(() => {
    if (pageSize === 'todos') return filteredItems;
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const startIndex =
    filteredItems.length === 0
      ? 0
      : pageSize === 'todos'
      ? 1
      : (currentPage - 1) * pageSize + 1;
  const endIndex =
    pageSize === 'todos'
      ? filteredItems.length
      : Math.min(currentPage * (typeof pageSize === 'number' ? pageSize : 1), filteredItems.length);

  const handleCopyKey = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Exportar para CSV (padrão Brasil com delimitador ponto-e-vírgula)
  const handleExportCsv = () => {
    const headers = [
      'Linha CNAB',
      'Chave NFe (44 digitos)',
      'Situacao API',
      'Pagador',
      'Valor (R$)',
      'Vencimento',
      'Nosso Numero',
      'Seu Numero',
      'Cidade',
      'UF',
    ];

    const rows = items.map((item) => [
      item.cnab.linha,
      `="${item.cnab.chaveNFe}"`, // formato texto no Excel
      item.situacao,
      `"${item.cnab.nomePagador}"`,
      item.cnab.valor.toFixed(2).replace('.', ','),
      item.cnab.vencimentoFormatado,
      `="${item.cnab.nossoNumero}"`,
      `"${item.cnab.seuNumero}"`,
      `"${item.cnab.cidade}"`,
      item.cnab.uf,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fattor_cnab444_status_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar para JSON
  const handleExportJson = () => {
    const dataToExport = items.map((item) => ({
      linha_cnab: item.cnab.linha,
      identificador_chave_nfe: item.cnab.chaveNFe,
      situacao_servidor: item.situacao,
      resposta_api: item.response,
      dados_cnab: {
        pagador: item.cnab.nomePagador,
        valor: item.cnab.valor,
        vencimento: item.cnab.vencimentoFormatado,
        nosso_numero: item.cnab.nossoNumero,
        seu_numero: item.cnab.seuNumero,
      },
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fattor_cnab444_status_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
      {/* Top Controls: Search, Export & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por chave, pagador ou controle..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-1/2 -translate-y-1/2"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Buttons: Export & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshAll}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            title="Reconsultar todos os itens na API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Reconsultar Status</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            title="Exportar dados para planilha CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            title="Exportar dados estruturados para JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
      </div>

      {/* Progress Bar during API calls */}
      {isProcessing && (
        <div className="p-3 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/50 space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-900 dark:text-brand-300">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
              Consultando situação de status no servidor da API Fattor...
            </span>
            <span>
              {progress.current} de {progress.total} (
              {progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full bg-brand-200 dark:bg-brand-900/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100 dark:border-slate-800">
        {[
          { key: 'todos', label: 'Todos', count: counts.todos },
          { key: 'autorizada', label: 'Autorizadas', count: counts.autorizada, color: 'text-emerald-600' },
          { key: 'cancelada', label: 'Canceladas', count: counts.cancelada, color: 'text-rose-600' },
          { key: 'rejeitada', label: 'Rejeitadas', count: counts.rejeitada, color: 'text-amber-600' },
          { key: 'denegada', label: 'Denegadas', count: counts.denegada, color: 'text-purple-600' },
          { key: 'nao_encontrada', label: 'Não Encontradas', count: counts.nao_encontrada, color: 'text-slate-500' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedFilter(tab.key as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${selectedFilter === tab.key
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${selectedFilter === tab.key
                  ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Sub-bar: Controls for Page Size, Performance Indicator & Active Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Itens por página:</span>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
            {([10, 25, 50, 100, 'todos'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPageSize(size)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all ${
                  pageSize === size
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {size === 'todos' ? 'Todos' : size}
              </button>
            ))}
          </div>

          <span className="text-slate-500 dark:text-slate-400">
            Exibindo <strong>{startIndex}–{endIndex}</strong> de{' '}
            <strong>{filteredItems.length}</strong>
            {filteredItems.length !== items.length && (
              <span className="opacity-80"> (filtrados de {items.length} totais)</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {items.length >= 25 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
              <Zap className="w-3 h-3 text-emerald-500" />
              Alta Performance (60 FPS)
            </span>
          )}

          {(searchTerm || selectedFilter !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedFilter('todos');
              }}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 text-xs font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Table of Results */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-4">Identificador (Chave NF-e 44 dígitos)</th>
              <th className="py-3 px-4">Situação no Servidor</th>
              <th className="py-3 px-4">Pagador / Sacado</th>
              <th className="py-3 px-4">Valor Nominal</th>
              <th className="py-3 px-3">Vencimento</th>
              <th className="py-3 px-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Nenhum título encontrado para o filtro selecionado.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, idx) => {
                const key = item.cnab.chaveNFe;
                const isCopied = copiedKey === key;
                const itemNumber = (startIndex || 1) + idx;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Contador sequencial do item */}
                    <td
                      className="py-3 px-3 text-center text-slate-500 dark:text-slate-400 font-mono text-xs font-semibold"
                      title={`Título #${itemNumber} (Registro Linha ${item.cnab.linha} do arquivo CNAB)`}
                    >
                      {itemNumber}
                    </td>

                    {/* Identificador: Chave de 44 dígitos */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-xs text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-xs group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
                          title={key}
                        >
                          {key.substring(0, 4)}...{key.substring(38)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyKey(key, e)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                          title="Copiar Chave Completa"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Ctrl: {item.cnab.seuNumero} | Nosso Nº: {item.cnab.nossoNumero}
                      </div>
                    </td>

                    {/* Situação Retornada pela API */}
                    <td className="py-3 px-4">
                      <StatusBadge status={item.situacao} />
                    </td>

                    {/* Pagador */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                        {item.cnab.nomePagador}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.cnab.cidade}/{item.cnab.uf}
                      </span>
                    </td>

                    {/* Valor */}
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {item.cnab.valorFormatado}
                    </td>

                    {/* Vencimento */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {item.cnab.vencimentoFormatado}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRefreshItem(item);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Reconsultar status deste item"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectItem(item);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/60 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      {filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
          {/* Informative Stats */}
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>
              Exibindo <strong>{startIndex}–{endIndex}</strong> de{' '}
              <strong>{filteredItems.length}</strong> títulos
              {filteredItems.length !== items.length && (
                <span className="opacity-80"> (filtrados de {items.length} no total)</span>
              )}
            </span>
            {pageSize !== 'todos' && totalPages > 1 && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Página {currentPage} de {totalPages}
              </span>
            )}
          </div>

          {/* Page Navigation Controls */}
          {pageSize !== 'todos' && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Primeira página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1;
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const hasGap = prev && p - prev > 1;
                    return (
                      <React.Fragment key={p}>
                        {hasGap && <span className="px-1 text-slate-400">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors ${
                            currentPage === p
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
