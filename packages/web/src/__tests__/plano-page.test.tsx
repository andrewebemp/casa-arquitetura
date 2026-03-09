import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PlanoPage from '@/app/(dashboard)/plano/page';
import * as projectService from '@/services/project-service';
import type { Subscription } from '@decorai/shared';
import React from 'react';

jest.mock('@/services/project-service');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const mockGetSession = jest.fn();
const mockGetUser = jest.fn();
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      getUser: mockGetUser,
    },
  }),
}));

const mockRouterPush = jest.fn();
const mockedService = projectService as jest.Mocked<typeof projectService>;

const proSubscription: Subscription = {
  id: 'sub-1',
  user_id: 'user-1',
  tier: 'pro',
  status: 'active',
  payment_gateway: 'stripe',
  gateway_customer_id: 'cus_123',
  gateway_subscription_id: 'sub_123',
  renders_used: 42,
  renders_limit: 100,
  current_period_start: '2024-01-01T00:00:00Z',
  current_period_end: '2024-02-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const freeSubscription: Subscription = {
  id: 'sub-2',
  user_id: 'user-1',
  tier: 'free',
  status: 'active',
  payment_gateway: null,
  gateway_customer_id: null,
  gateway_subscription_id: null,
  renders_used: 1,
  renders_limit: 3,
  current_period_start: '2024-01-01T00:00:00Z',
  current_period_end: '2024-02-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    React.createElement(QueryClientProvider, { client: queryClient }, ui)
  );
}

describe('PlanoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'token-123' } },
    });
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    });
  });

  it('shows loading skeletons while subscription loads', () => {
    mockedService.fetchSubscription.mockReturnValue(new Promise(() => {}));
    renderWithQuery(React.createElement(PlanoPage));

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders pricing grid with 3 tiers after loading', async () => {
    mockedService.fetchSubscription.mockResolvedValue(freeSubscription);
    renderWithQuery(React.createElement(PlanoPage));

    await waitFor(() => {
      expect(screen.getByText('Escolha seu Plano')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Business').length).toBeGreaterThan(0);
  });

  it('shows SubscriptionSummary for Pro subscriber', async () => {
    mockedService.fetchSubscription.mockResolvedValue(proSubscription);
    renderWithQuery(React.createElement(PlanoPage));

    await waitFor(() => {
      expect(screen.getByText('Sua Assinatura')).toBeInTheDocument();
    });

    expect(screen.getByText('42/100 renders utilizados')).toBeInTheDocument();
    expect(screen.getByText('Gerenciar Assinatura')).toBeInTheDocument();
  });

  it('does not show SubscriptionSummary for Free tier', async () => {
    mockedService.fetchSubscription.mockResolvedValue(freeSubscription);
    renderWithQuery(React.createElement(PlanoPage));

    await waitFor(() => {
      expect(screen.getByText('Escolha seu Plano')).toBeInTheDocument();
    });

    expect(screen.queryByText('Sua Assinatura')).not.toBeInTheDocument();
  });

  it('redirects to /app/novo when Free CTA clicked', async () => {
    mockedService.fetchSubscription.mockRejectedValue(new Error('Not authenticated'));
    const user = userEvent.setup();
    renderWithQuery(React.createElement(PlanoPage));

    await waitFor(() => {
      expect(screen.getByText('Escolha seu Plano')).toBeInTheDocument();
    });

    const freeButtons = screen.getAllByText('Comecar Gratis');
    await user.click(freeButtons[0]);

    expect(mockRouterPush).toHaveBeenCalledWith('/app/novo');
  });

  it('redirects unauthenticated user to login when trying checkout', async () => {
    mockedService.fetchSubscription.mockResolvedValue(freeSubscription);
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const user = userEvent.setup();
    renderWithQuery(React.createElement(PlanoPage));

    await waitFor(() => {
      expect(screen.getByText('Escolha seu Plano')).toBeInTheDocument();
    });

    const upgradeButtons = screen.getAllByText('Fazer Upgrade');
    await user.click(upgradeButtons[0]);

    expect(mockRouterPush).toHaveBeenCalledWith('/auth/login?redirect=/app/plano');
  });

  it('shows FAQ section', async () => {
    mockedService.fetchSubscription.mockResolvedValue(freeSubscription);
    renderWithQuery(React.createElement(PlanoPage));

    await waitFor(() => {
      expect(screen.getByText('Perguntas Frequentes')).toBeInTheDocument();
    });
  });

  it('shows error message when subscription load fails', async () => {
    mockedService.fetchSubscription.mockRejectedValue(new Error('Network error'));
    renderWithQuery(React.createElement(PlanoPage));

    await waitFor(() => {
      expect(screen.getByText(/Nao foi possivel carregar dados da assinatura/)).toBeInTheDocument();
    });
  });
});
