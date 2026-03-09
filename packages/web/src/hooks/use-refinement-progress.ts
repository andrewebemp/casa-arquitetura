'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribeToRefinementProgress } from '@/services/chat-service';
import type { RefinementProgressEvent } from '@/services/chat-service';

interface UseRefinementProgressOptions {
  projectId: string;
  enabled: boolean;
  onComplete?: () => void;
  onError?: (message: string) => void;
}

interface RefinementProgressState {
  isRefining: boolean;
  progress: number;
  stage: string;
  error: string | null;
}

export function useRefinementProgress({
  projectId,
  enabled,
  onComplete,
  onError,
}: UseRefinementProgressOptions): RefinementProgressState {
  const [state, setState] = useState<RefinementProgressState>({
    isRefining: false,
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

    setState({ isRefining: true, progress: 0, stage: 'Iniciando...', error: null });

    unsubRef.current = subscribeToRefinementProgress(projectId, (event: RefinementProgressEvent) => {
      if (event.status === 'completed') {
        setState({ isRefining: false, progress: 100, stage: 'Concluido!', error: null });
        onCompleteRef.current?.();
      } else if (event.status === 'failed') {
        setState({
          isRefining: false,
          progress: 0,
          stage: '',
          error: event.error_message ?? 'Erro desconhecido',
        });
        onErrorRef.current?.(event.error_message ?? 'Erro desconhecido');
      } else {
        setState({
          isRefining: true,
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
