'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, CheckCircle } from 'lucide-react';

interface CroquiPreviewProps {
  croquiAscii: string | null;
  isGenerating: boolean;
  isIterating: boolean;
  onIterate: (feedback: string) => void;
  onApprove: () => void;
}

export function CroquiPreview({
  croquiAscii,
  isGenerating,
  isIterating,
  onIterate,
  onApprove,
}: CroquiPreviewProps) {
  const [feedback, setFeedback] = useState('');

  const handleIterate = () => {
    if (feedback.trim()) {
      onIterate(feedback.trim());
      setFeedback('');
    }
  };

  if (isGenerating && !croquiAscii) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <p className="mt-3 text-sm text-gray-600">Gerando croqui do ambiente...</p>
      </div>
    );
  }

  if (!croquiAscii) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
        <p className="text-sm text-gray-500">Aguardando geracao do croqui...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4">
        <pre className="whitespace-pre font-mono text-sm leading-relaxed text-gray-800">
          {croquiAscii}
        </pre>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="croqui-feedback" className="block text-sm font-medium text-gray-700">
            Ajustes (opcional)
          </label>
          <textarea
            id="croqui-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Ex: mova o sofa para a parede sul, adicione uma mesa de centro..."
            rows={2}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            disabled={isIterating}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleIterate}
            disabled={!feedback.trim() || isIterating}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isIterating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Ajustar
          </button>

          <button
            type="button"
            onClick={onApprove}
            disabled={isIterating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            Aprovar e Gerar Imagem
          </button>
        </div>
      </div>
    </div>
  );
}
