import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToggleFavorite } from '@/hooks/use-favorites';
import * as projectService from '@/services/project-service';
import React from 'react';

jest.mock('@/services/project-service');
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

const mockedService = projectService as jest.Mocked<typeof projectService>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  queryClient.setQueryData(['projects', {}], {
    projects: [
      {
        id: 'p1',
        user_id: 'u1',
        name: 'Test',
        input_type: 'photo',
        style: 'moderno',
        status: 'ready',
        is_favorite: false,
        original_image_url: null,
        room_type: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
    total: 1,
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useToggleFavorite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls toggleFavorite service on mutate', async () => {
    mockedService.toggleFavorite.mockResolvedValue();

    const { result } = renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ projectId: 'p1', isFavorite: true });
    });

    await waitFor(() =>
      expect(mockedService.toggleFavorite).toHaveBeenCalledWith('p1', true)
    );
  });

  it('handles mutation error', async () => {
    mockedService.toggleFavorite.mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ projectId: 'p1', isFavorite: true });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
