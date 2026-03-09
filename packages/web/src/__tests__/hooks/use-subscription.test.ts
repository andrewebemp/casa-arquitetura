import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSubscription } from '@/hooks/use-subscription';
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

describe('useSubscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns tier info', async () => {
    mockedService.fetchSubscription.mockResolvedValue({
      id: 'sub-1',
      user_id: 'u1',
      tier: 'pro',
      status: 'active',
      payment_gateway: 'stripe',
      gateway_customer_id: 'cus_123',
      gateway_subscription_id: 'sub_123',
      renders_used: 50,
      renders_limit: 100,
      current_period_start: '2024-01-01T00:00:00Z',
      current_period_end: '2024-02-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.tier).toBe('pro');
    expect(result.current.data?.renders_used).toBe(50);
    expect(result.current.data?.renders_limit).toBe(100);
  });

  it('returns render quota', async () => {
    mockedService.fetchSubscription.mockResolvedValue({
      id: 'sub-2',
      user_id: 'u1',
      tier: 'free',
      status: 'active',
      payment_gateway: null,
      gateway_customer_id: null,
      gateway_subscription_id: null,
      renders_used: 2,
      renders_limit: 3,
      current_period_start: '2024-01-01T00:00:00Z',
      current_period_end: '2024-02-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useSubscription(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.renders_used).toBe(2);
    expect(result.current.data?.renders_limit).toBe(3);
  });
});
