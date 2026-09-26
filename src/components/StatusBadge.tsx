import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { ProcessStatus } from '../types/api';

interface StatusBadgeProps {
  status: ProcessStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  switch (status) {
    case 'autorizada':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border dark:border-emerald-800/60 ${sizeClasses}`}
          title="Nota Fiscal Eletrônica autorizada pela SEFAZ (lastro fiscal válido)"
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          Autorizada
        </span>
      );

    case 'cancelada':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 dark:border dark:border-rose-800/60 ${sizeClasses}`}
          title="Nota Fiscal Eletrônica cancelada no emitente/SEFAZ"
        >
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
          Cancelada
        </span>
      );

    case 'rejeitada':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 dark:border dark:border-amber-800/60 ${sizeClasses}`}
          title="Nota Fiscal Eletrônica rejeitada pela SEFAZ por inconsistência cadastral/fiscal"
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
          Rejeitada
        </span>
      );

    case 'denegada':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 dark:border dark:border-purple-800/60 ${sizeClasses}`}
          title="Uso denegado pela SEFAZ por irregularidade do emitente ou destinatário"
        >
          {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
          Denegada
        </span>
      );

    case 'nao_encontrada':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border dark:border-slate-700 ${sizeClasses}`}
          title="Identificador não encontrado na base de dados da prova"
        >
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-slate-500" />}
          Não Encontrada
        </span>
      );

    case 'consultando':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 dark:border dark:border-sky-800/60 animate-pulse ${sizeClasses}`}
          title="Consultando servidor da API..."
        >
          {showIcon && <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-sky-400" />}
          Consultando
        </span>
      );

    case 'pendente':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 ${sizeClasses}`}
          title="Aguardando início da consulta"
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-slate-400" />}
          Pendente
        </span>
      );

    case 'erro':
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 dark:border dark:border-red-800/60 ${sizeClasses}`}
          title="Falha na consulta"
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
          Erro
        </span>
      );
  }
};
