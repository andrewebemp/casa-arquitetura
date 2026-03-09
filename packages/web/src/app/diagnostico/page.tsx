'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { DiagnosticUploader } from '@/components/molecules/DiagnosticUploader';
import { DiagnosticResult } from '@/components/organisms/DiagnosticResult';
import { DiagnosticLoading } from '@/components/diagnostic/DiagnosticLoading';
import { useDiagnostic } from '@/hooks/use-diagnostic';
import { createClient } from '@/lib/supabase/client';

export default function DiagnosticoPage() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { step, progress, result, error, submit, reset } = useDiagnostic();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPaidTier, setHasPaidTier] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
      // Check user metadata for paid tier
      const tier = data.user?.user_metadata?.tier;
      setHasPaidTier(tier === 'pro' || tier === 'business');
    });
  }, []);

  const handlePhotoChange = useCallback((file: File | null, url: string | null) => {
    setPhoto(file);
    setPreviewUrl(url);
  }, []);

  const handleSubmit = useCallback(() => {
    if (photo) {
      submit(photo);
    }
  }, [photo, submit]);

  const handleRetry = useCallback(() => {
    reset();
    if (photo) {
      submit(photo);
    }
  }, [photo, reset, submit]);

  const handleNewAnalysis = useCallback(() => {
    reset();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPhoto(null);
    setPreviewUrl(null);
  }, [reset, previewUrl]);

  const isProcessing = step === 'uploading' || step === 'analyzing';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      {/* Hero Section */}
      {step !== 'done' && (
        <div className="text-center">
          <h1 className="text-display font-bold text-gray-900 md:text-4xl">
            Descubra quanto seu imovel esta perdendo
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Faca upload de uma foto do seu anuncio e nossa IA analisa gratuitamente
            o potencial de valorizacao com staging profissional.
          </p>
        </div>
      )}

      {/* Upload Section */}
      {(step === 'idle' || step === 'error') && (
        <div className="mt-8">
          <DiagnosticUploader
            photo={photo}
            previewUrl={previewUrl}
            onPhotoChange={handlePhotoChange}
          />

          {photo && step !== 'error' && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-700 md:w-auto"
              >
                Analisar Meu Imovel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {step === 'error' && error && (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h3 className="mt-3 text-lg font-semibold text-gray-900">Erro na analise</h3>
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error ?? 'Nao foi possivel completar a analise. Tente novamente.'}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="mt-8">
          <DiagnosticLoading progress={progress} />
        </div>
      )}

      {/* Result Section */}
      {step === 'done' && result && (
        <div className="mt-8">
          <DiagnosticResult
            result={result}
            isAuthenticated={isAuthenticated}
            hasPaidTier={hasPaidTier}
          />

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleNewAnalysis}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Analisar outro imovel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
