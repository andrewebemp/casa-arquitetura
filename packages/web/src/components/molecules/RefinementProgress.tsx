'use client';

import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface RefinementProgressProps {
  stage: string;
  progress: number;
  error?: string | null;
  onRetry?: () => void;
}

export function RefinementProgress({ stage, progress, error, onRetry }: RefinementProgressProps) {
  if (error) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700">
              Nao foi possivel aplicar a alteracao. Tente novamente.
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              <RefreshCw className="h-3 w-3" />
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
          <p className="text-sm text-gray-700">
            Processando: {stage || 'Iniciando...'}
          </p>
        </div>
        {progress > 0 && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progresso do refinamento"
            />
          </div>
        )}
      </div>
    </div>
  );
}
