import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjects } from '@/hooks/use-projects';
import * as projectService from '@/services/project-service';
import React from 'react';

jest.mock('@/services/project-service');
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

const mockedService = projectService as jest.Mocked<typeof projectService>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches projects list', async () => {
    mockedService.fetchProjects.mockResolvedValue({
      projects: [
        {
          id: 'p1',
          user_id: 'u1',
          name: 'Projeto 1',
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

    const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.projects).toHaveLength(1);
    expect(result.current.data?.projects[0].name).toBe('Projeto 1');
  });

  it('passes filter params to service', async () => {
    mockedService.fetchProjects.mockResolvedValue({ projects: [], total: 0 });

    renderHook(() => useProjects({ style: 'industrial', sort: 'oldest' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(mockedService.fetchProjects).toHaveBeenCalledWith({
        style: 'industrial',
        sort: 'oldest',
      })
    );
  });

  it('handles empty response', async () => {
    mockedService.fetchProjects.mockResolvedValue({ projects: [], total: 0 });

    const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.projects).toHaveLength(0);
  });

  it('handles error response', async () => {
    mockedService.fetchProjects.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Network error');
  });
});
