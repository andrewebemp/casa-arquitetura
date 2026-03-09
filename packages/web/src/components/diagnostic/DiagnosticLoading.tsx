'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const ANALYSIS_STEPS = [
  'Analisando iluminacao...',
  'Avaliando composicao...',
  'Identificando problemas de staging...',
  'Calculando potencial...',
];

const ROTATION_INTERVAL = 3000;

interface DiagnosticLoadingProps {
  progress: number;
}

export function DiagnosticLoading({ progress }: DiagnosticLoadingProps) {
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-12">
      <Loader2 className="h-10 w-10 animate-spin text-brand-600" />

      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        Analisando seu imovel...
      </h3>

      <p className="mt-2 text-sm text-gray-600" aria-live="polite">
        {ANALYSIS_STEPS[stepIndex]}
      </p>

      <div className="mt-6 w-full max-w-md">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progresso</span>
          <span className="font-medium text-brand-600">{clampedProgress}%</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${clampedProgress}%` }}
            role="progressbar"
            aria-valuenow={clampedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso da analise"
          />
        </div>
      </div>
    </div>
  );
}
