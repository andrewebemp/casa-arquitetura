'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribeToEditingProgress } from '@/services/editing-service';
import type { EditingProgressEvent } from '@/services/editing-service';

interface UseEditingProgressOptions {
  projectId: string;
  enabled: boolean;
  onComplete?: () => void;
  onError?: (message: string) => void;
}

export interface EditingProgressState {
  isProcessing: boolean;
  progress: number;
  stage: string;
  error: string | null;
}

export function useEditingProgress({
  projectId,
  enabled,
  onComplete,
  onError,
}: UseEditingProgressOptions): EditingProgressState {
  const [state, setState] = useState<EditingProgressState>({
    isProcessing: false,
    progress: 0,
    stage: '',
    error: null,
  });
  const unsubRef = useRef<(() => void) | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  onCompleteRef.current = onComplete;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!enabled || !projectId) return;

    setState({ isProcessing: true, progress: 0, stage: 'Iniciando...', error: null });

    unsubRef.current = subscribeToEditingProgress(projectId, (event: EditingProgressEvent) => {
      if (event.status === 'completed') {
        setState({ isProcessing: false, progress: 100, stage: 'Concluido!', error: null });
        onCompleteRef.current?.();
      } else if (event.status === 'failed') {
        setState({
          isProcessing: false,
          progress: 0,
          stage: '',
          error: event.error_message ?? 'Erro desconhecido',
        });
        onErrorRef.current?.(event.error_message ?? 'Erro desconhecido');
      } else {
        setState({
          isProcessing: true,
          progress: event.progress,
          stage: event.stage,
          error: null,
        });
      }
    });

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [projectId, enabled]);

  return state;
}
