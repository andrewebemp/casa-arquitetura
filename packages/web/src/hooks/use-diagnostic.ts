'use client';

import { useState, useCallback, useRef } from 'react';
import type { DiagnosticResponse } from '@decorai/shared';
import {
  createDiagnostic,
  uploadDiagnosticPhoto,
  getDiagnosticResult,
} from '@/services/diagnostics-service';

type DiagnosticStep = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';

interface UseDiagnosticReturn {
  step: DiagnosticStep;
  progress: number;
  result: DiagnosticResponse | null;
  error: string | null;
  submit: (photo: File) => Promise<void>;
  reset: () => void;
}

const POLL_INTERVAL = 2000;
const MAX_POLLS = 30;

export function useDiagnostic(): UseDiagnosticReturn {
  const [step, setStep] = useState<DiagnosticStep>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DiagnosticResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStep('idle');
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  const submit = useCallback(async (photo: File) => {
    abortRef.current = false;
    setStep('uploading');
    setProgress(10);
    setError(null);
    setResult(null);

    try {
      const { id } = await createDiagnostic();
      if (abortRef.current) return;

      setProgress(30);
      await uploadDiagnosticPhoto(id, photo);
      if (abortRef.current) return;

      setStep('analyzing');
      setProgress(60);

      // Poll for result (analysis runs after upload in Story 5.1)
      let polls = 0;
      let diagnosticResult: DiagnosticResponse | null = null;

      while (polls < MAX_POLLS && !abortRef.current) {
        const data = await getDiagnosticResult(id);

        if (data.analysis && data.analysis.overall_score !== undefined) {
          diagnosticResult = data;
          break;
        }

        polls++;
        setProgress(60 + Math.min(polls * 2, 30));
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }

      if (abortRef.current) return;

      if (!diagnosticResult) {
        throw new Error('Tempo limite excedido. Tente novamente.');
      }

      setProgress(100);
      setResult(diagnosticResult);
      setStep('done');
    } catch (err) {
      if (abortRef.current) return;
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
      setStep('error');
    }
  }, []);

  return { step, progress, result, error, submit, reset };
}
