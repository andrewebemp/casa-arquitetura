'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchStyles } from '@/services/staging-wizard-service';

interface StyleGridProps {
  selectedStyle: string | null;
  onSelectStyle: (style: string) => void;
}

const STYLE_LABELS: Record<string, string> = {
  moderno: 'Moderno',
  industrial: 'Industrial',
  minimalista: 'Minimalista',
  classico: 'Classico',
  escandinavo: 'Escandinavo',
  rustico: 'Rustico',
  tropical: 'Tropical',
  contemporaneo: 'Contemporaneo',
  boho: 'Boho',
  luxo: 'Luxo',
};

const STYLE_COLORS: Record<string, string> = {
  moderno: 'bg-blue-50 text-blue-700',
  industrial: 'bg-gray-100 text-gray-700',
  minimalista: 'bg-slate-50 text-slate-700',
  classico: 'bg-amber-50 text-amber-700',
  escandinavo: 'bg-sky-50 text-sky-700',
  rustico: 'bg-orange-50 text-orange-700',
  tropical: 'bg-green-50 text-green-700',
  contemporaneo: 'bg-violet-50 text-violet-700',
  boho: 'bg-rose-50 text-rose-700',
  luxo: 'bg-yellow-50 text-yellow-700',
};

export function StyleGrid({ selectedStyle, onSelectStyle }: StyleGridProps) {
  const { data: styles, isLoading, isError } = useQuery({
    queryKey: ['staging-styles'],
    queryFn: fetchStyles,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
        Nao foi possivel carregar os estilos. Tente novamente.
      </div>
    );
  }

  const styleList = styles ?? Object.keys(STYLE_LABELS);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {styleList.map((style) => {
        const isSelected = selectedStyle === style;
        const label = STYLE_LABELS[style] ?? style;
        const colorClass = STYLE_COLORS[style] ?? 'bg-gray-50 text-gray-700';

        return (
          <button
            key={style}
            type="button"
            onClick={() => onSelectStyle(style)}
            className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
              isSelected
                ? 'border-brand-600 shadow-md ring-2 ring-brand-200'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            aria-pressed={isSelected}
          >
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-lg text-2xl font-bold ${colorClass}`}
            >
              {label.charAt(0)}
            </div>
            <span
              className={`mt-2 text-sm font-medium ${
                isSelected ? 'text-brand-700' : 'text-gray-700'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
