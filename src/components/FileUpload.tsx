import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  FileCode2,
  Sparkles,
  RefreshCw,
  Download,
  Layers,
} from 'lucide-react';
import { SAMPLE_CNAB_FILENAME, SAMPLE_CNAB_RAW } from '../services/sampleCnab';
import { TEST_SAMPLES } from '../services/samplePackages';

interface FileUploadProps {
  onFileLoaded: (content: string, filename: string) => void;
  isLoading: boolean;
  currentFilename?: string;
  totalLines?: number;
  totalItems?: number;
  errors?: string[];
  warnings?: string[];
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.rem', '.ret', '.txt'];

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileLoaded,
  isLoading,
  currentFilename,
  totalLines,
  totalItems,
  errors = [],
  warnings = [],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadError(null);

    // Validação de extensão
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError(
        `Formato '${ext}' não permitido. Por segurança e conformidade, envie apenas arquivos CNAB (.rem, .ret ou .txt).`
      );
      return;
    }

    // Validação de tamanho máximo (5 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(
        `Arquivo muito grande (${sizeMB} MB). O limite máximo de segurança para upload é de 5 MB.`
      );
      return;
    }

    const reader = new FileReader();
    // Utiliza latin1 (ISO-8859-1) para arquivos legados CNAB bancários
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileLoaded(content, file.name);
      }
    };
    reader.onerror = () => {
      setUploadError('Erro de I/O ao tentar ler o arquivo do disco local.');
    };
    reader.readAsText(file, 'ISO-8859-1');
  };

  const handleLoadSample = () => {
    setUploadError(null);
    onFileLoaded(SAMPLE_CNAB_RAW, SAMPLE_CNAB_FILENAME);
  };

  return (
    <div className="w-full space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-brand-500 bg-brand-50/80 dark:border-brand-400 dark:bg-brand-950/40 scale-[1.01]'
            : 'border-slate-300 hover:border-brand-400 bg-white dark:border-slate-800 dark:bg-slate-900/60 hover:bg-slate-50/70 dark:hover:bg-slate-900/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".rem,.ret,.txt"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${
              isDragging
                ? 'scale-110 bg-brand-500 text-white'
                : 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
            }`}
          >
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {currentFilename ? (
                <span className="flex items-center justify-center gap-2 text-brand-600 dark:text-brand-400">
                  <FileCheck className="w-5 h-5 text-emerald-500" />
                  Arquivo carregado: {currentFilename}
                </span>
              ) : (
                'Arraste e solte o arquivo CNAB 444 aqui'
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Suporta arquivos de remessa (.rem, .ret, .txt) com 444 colunas por linha
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Escolher do Computador
            </span>
            <span className="text-xs text-slate-400">ou</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSample();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-600 to-sky-500 text-white shadow-sm hover:from-brand-700 hover:to-sky-600 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Carregar Amostra da Prova (meu_cnab.rem)
            </button>
          </div>
        </div>
      </div>

      {/* Quick Test Presets Toolbar & Download ZIP Package */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
            <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Cenários de Teste (.rem, .ret, .txt):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TEST_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUploadError(null);
                  onFileLoaded(sample.content, sample.filename);
                }}
                disabled={isLoading}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${sample.badgeColor} border border-current/20 shadow-xs`}
                title={sample.description}
              >
                <span className="font-mono">{sample.extension}</span>
                <span>•</span>
                <span>{sample.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Download ZIP Package Button */}
        <a
          href="/pacote_dados_cnab444.zip"
          download="pacote_dados_cnab444.zip"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors shrink-0 border border-slate-200 dark:border-slate-700"
          title="Baixar pacote compactado com arquivos .rem, .ret e .txt para submissão e testes locais"
        >
          <Download className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          Baixar Pacote (.zip)
        </a>
      </div>

      {/* Info Card when file is loaded */}
      {currentFilename && totalLines !== undefined && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <FileCode2 className="w-4 h-4 text-brand-500" />
              {currentFilename}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              <strong>{totalLines}</strong> linhas totais
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              <strong>{totalItems}</strong> títulos detalhe identificados
            </span>
          </div>

          <button
            onClick={handleLoadSample}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-semibold"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Recarregar Amostra
          </button>
        </div>
      )}

      {/* Upload Error Alert */}
      {uploadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/40 p-4 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Validation Errors Alert */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/40 p-4 text-xs text-rose-800 dark:text-rose-200 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Erros de validação estrutural do CNAB 444:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings Alert */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-200 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Avisos de integridade no lote:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1">
            {warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
