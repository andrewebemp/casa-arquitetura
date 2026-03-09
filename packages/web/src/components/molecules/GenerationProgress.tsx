'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const STAGING_TIPS = [
  'Voce sabia? Imoveis com staging profissional recebem 47% mais consultas.',
  'Ambientes decorados vendem ate 73% mais rapido que vazios.',
  'A primeira impressao e formada nos primeiros 7 segundos da visita.',
  'Staging virtual custa ate 97% menos que staging fisico tradicional.',
  'Fotos profissionais com staging recebem 118% mais visualizacoes online.',
];

interface GenerationProgressProps {
  progress: number;
  stage: string;
  error: string | null;
  onRetry: () => void;
}

export function GenerationProgress({
  progress,
  stage,
  error,
  onRetry,
}: GenerationProgressProps) {
  const [tip, setTip] = useState('');

  useEffect(() => {
    const randomTip = STAGING_TIPS[Math.floor(Math.random() * STAGING_TIPS.length)];
    setTip(randomTip);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-12">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h3 className="mt-3 text-lg font-semibold text-gray-900">Erro na geracao</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-12 px-6">
      <Loader2 className="h-10 w-10 animate-spin text-brand-600" />

      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        Gerando seu ambiente decorado
      </h3>

      <div className="mt-6 w-full max-w-md">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{stage || 'Iniciando...'}</span>
          <span className="font-medium text-brand-600">{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso da geracao"
          />
        </div>
      </div>

      {tip && (
        <div className="mt-8 max-w-sm rounded-lg bg-brand-50 p-4 text-center">
          <p className="text-sm text-brand-700">{tip}</p>
        </div>
      )}
    </div>
  );
}
