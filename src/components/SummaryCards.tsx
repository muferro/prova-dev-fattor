import React from 'react';
import {
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { ProcessedItem } from '../types/api';
import { formatCurrency } from '../services/cnabParser';

interface SummaryCardsProps {
  items: ProcessedItem[];
  valorTotal: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ items, valorTotal }) => {
  const total = items.length;
  const autorizadas = items.filter((i) => i.situacao === 'autorizada').length;
  const canceladas = items.filter((i) => i.situacao === 'cancelada').length;
  const rejeitadas = items.filter((i) => i.situacao === 'rejeitada').length;
  const denegadas = items.filter((i) => i.situacao === 'denegada').length;

  const isCurrencyLarge = valorTotal >= 100000;
  const formattedValor = formatCurrency(valorTotal);

  const cards = [
    {
      label: 'Total de Títulos',
      value: total.toLocaleString('pt-BR'),
      subValue: 'Registros detalhe',
      icon: FileText,
      iconColor: 'text-[#16304d] dark:text-[#f5d9aa]',
      bgColor: 'bg-slate-50 dark:bg-slate-800/50',
      borderColor: 'border-slate-200 dark:border-slate-700/60',
      isCurrency: false,
    },
    {
      label: 'Volume em Carteira',
      value: formattedValor,
      subValue: 'Soma dos títulos CNAB',
      icon: DollarSign,
      iconColor: 'text-[#b88317] dark:text-[#e2a441]',
      bgColor: 'bg-[#b88317]/10 dark:bg-[#b88317]/15',
      borderColor: 'border-[#b88317]/30 dark:border-[#b88317]/40',
      isCurrency: true,
    },
    {
      label: 'Autorizadas (Válidas)',
      value: autorizadas.toLocaleString('pt-BR'),
      subValue: total > 0 ? `${Math.round((autorizadas / total) * 100)}% do lote` : '0%',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/70 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200/60 dark:border-emerald-800/50',
      isCurrency: false,
    },
    {
      label: 'Canceladas',
      value: canceladas.toLocaleString('pt-BR'),
      subValue: total > 0 ? `${Math.round((canceladas / total) * 100)}% do lote` : '0%',
      icon: XCircle,
      iconColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50/70 dark:bg-rose-950/40',
      borderColor: 'border-rose-200/60 dark:border-rose-800/50',
      isCurrency: false,
    },
    {
      label: 'Rejeitadas',
      value: rejeitadas.toLocaleString('pt-BR'),
      subValue: total > 0 ? `${Math.round((rejeitadas / total) * 100)}% do lote` : '0%',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50/70 dark:bg-amber-950/40',
      borderColor: 'border-amber-200/60 dark:border-amber-800/50',
      isCurrency: false,
    },
    {
      label: 'Denegadas',
      value: denegadas.toLocaleString('pt-BR'),
      subValue: total > 0 ? `${Math.round((denegadas / total) * 100)}% do lote` : '0%',
      icon: ShieldAlert,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50/70 dark:bg-purple-950/40',
      borderColor: 'border-purple-200/60 dark:border-purple-800/50',
      isCurrency: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-3 sm:p-3.5 rounded-xl border ${card.borderColor} ${card.bgColor} min-w-0 overflow-hidden backdrop-blur-sm transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate"
                  title={card.label}
                >
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.iconColor} shrink-0`} />
              </div>

              {card.isCurrency ? (
                <div
                  className="font-black text-slate-900 dark:text-white tracking-tight truncate flex items-baseline gap-1"
                  title={card.value}
                >
                  <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    R$
                  </span>
                  <span
                    className={`truncate ${
                      isCurrencyLarge
                        ? 'text-base sm:text-lg lg:text-[15px] xl:text-lg 2xl:text-xl'
                        : 'text-lg sm:text-xl xl:text-2xl'
                    }`}
                  >
                    {card.value.replace(/^R\$\s*/, '')}
                  </span>
                </div>
              ) : (
                <div
                  className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate"
                  title={card.value}
                >
                  {card.value}
                </div>
              )}
            </div>

            <div
              className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate"
              title={card.subValue}
            >
              {card.subValue}
            </div>
          </div>
        );
      })}
    </div>
  );
};

