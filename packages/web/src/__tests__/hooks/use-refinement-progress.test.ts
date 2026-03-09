import { renderHook, act } from '@testing-library/react';
import { useRefinementProgress } from '@/hooks/use-refinement-progress';

let mockOnEvent: ((event: Record<string, unknown>) => void) | null = null;
const mockUnsubscribe = jest.fn();

jest.mock('@/services/chat-service', () => ({
  subscribeToRefinementProgress: jest.fn((_projectId: string, onEvent: (event: Record<string, unknown>) => void) => {
    mockOnEvent = onEvent;
    return mockUnsubscribe;
  }),
}));

describe('useRefinementProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnEvent = null;
  });

  it('returns initial state when disabled', () => {
    const { result } = renderHook(() =>
      useRefinementProgress({ projectId: 'p1', enabled: false })
    );

    expect(result.current.isRefining).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.stage).toBe('');
    expect(result.current.error).toBeNull();
  });

  it('subscribes when enabled', () => {
    const { subscribeToRefinementProgress } = require('@/services/chat-service');

    renderHook(() =>
      useRefinementProgress({ projectId: 'p1', enabled: true })
    );

    expect(subscribeToRefinementProgress).toHaveBeenCalledWith('p1', expect.any(Function));
  });

  it('sets isRefining true when enabled', () => {
    const { result } = renderHook(() =>
      useRefinementProgress({ projectId: 'p1', enabled: true })
    );

    expect(result.current.isRefining).toBe(true);
    expect(result.current.stage).toBe('Iniciando...');
  });

  it('updates progress on processing event', () => {
    const { result } = renderHook(() =>
      useRefinementProgress({ projectId: 'p1', enabled: true })
    );

    act(() => {
      mockOnEvent?.({ status: 'processing', progress: 50, stage: 'Aplicando estilo...' });
    });

    expect(result.current.isRefining).toBe(true);
    expect(result.current.progress).toBe(50);
    expect(result.current.stage).toBe('Aplicando estilo...');
  });

  it('calls onComplete on completed event', () => {
    const onComplete = jest.fn();

    renderHook(() =>
      useRefinementProgress({ projectId: 'p1', enabled: true, onComplete })
    );

    act(() => {
      mockOnEvent?.({ status: 'completed', progress: 100, stage: 'Concluido!' });
    });

    expect(onComplete).toHaveBeenCalled();
  });

  it('sets error on failed event', () => {
    const onError = jest.fn();

    const { result } = renderHook(() =>
      useRefinementProgress({ projectId: 'p1', enabled: true, onError })
    );

    act(() => {
      mockOnEvent?.({ status: 'failed', progress: 0, stage: '', error_message: 'GPU timeout' });
    });

    expect(result.current.error).toBe('GPU timeout');
    expect(result.current.isRefining).toBe(false);
    expect(onError).toHaveBeenCalledWith('GPU timeout');
  });

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() =>
      useRefinementProgress({ projectId: 'p1', enabled: true })
    );

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
