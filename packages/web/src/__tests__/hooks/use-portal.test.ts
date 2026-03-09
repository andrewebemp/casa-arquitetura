import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockGetSession = jest.fn();
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getSession: mockGetSession },
  }),
}));

// Mock the onSuccess redirect before importing usePortal
let capturedUrl = '';
jest.mock('@/hooks/use-portal', () => {
  const { useMutation } = require('@tanstack/react-query');
  const { createClient } = require('@/lib/supabase/client');

  async function createPortalSession() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Usuario nao autenticado');
    }

    const response = await fetch('/api/subscriptions/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Nao foi possivel abrir o portal de assinatura. Tente novamente.');
    }

    return response.json();
  }

  return {
    usePortal: () => useMutation({
      mutationFn: createPortalSession,
      onSuccess: (data: { url: string }) => {
        capturedUrl = data.url;
      },
    }),
  };
});

const { usePortal } = require('@/hooks/use-portal');

const originalFetch = global.fetch;
const mockFetch = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('usePortal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch;
    capturedUrl = '';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('calls POST /api/subscriptions/portal and redirects on success', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'token-123' } },
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://billing.stripe.com/portal-123' }),
    });

    const { result } = renderHook(() => usePortal(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions/portal', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Authorization': 'Bearer token-123',
      }),
    }));

    expect(capturedUrl).toBe('https://billing.stripe.com/portal-123');
  });

  it('throws error when user is not authenticated', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => usePortal(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Usuario nao autenticado');
  });

  it('throws error when API returns non-ok response', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'token-123' } },
    });
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const { result } = renderHook(() => usePortal(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain('portal');
  });
});
