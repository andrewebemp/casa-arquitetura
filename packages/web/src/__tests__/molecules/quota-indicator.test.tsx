import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuotaIndicator } from '@/components/molecules/QuotaIndicator';
import * as editingService from '@/services/editing-service';

jest.mock('@/services/editing-service');
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'test' } } }) },
  })),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('QuotaIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows remaining credits', async () => {
    (editingService.getQuota as jest.Mock).mockResolvedValue({
      renders_remaining: 5,
      renders_limit: 10,
      renders_used: 5,
      tier: 'pro',
    });

    renderWithQuery(<QuotaIndicator projectId="proj-1" />);

    expect(await screen.findByText('Creditos restantes: 5')).toBeInTheDocument();
  });

  it('shows upgrade link when depleted', async () => {
    (editingService.getQuota as jest.Mock).mockResolvedValue({
      renders_remaining: 0,
      renders_limit: 3,
      renders_used: 3,
      tier: 'free',
    });

    renderWithQuery(<QuotaIndicator projectId="proj-1" />);

    expect(await screen.findByText('Creditos restantes: 0')).toBeInTheDocument();
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
  });

  it('calls onQuotaDepleted callback', async () => {
    const onQuotaDepleted = jest.fn();
    (editingService.getQuota as jest.Mock).mockResolvedValue({
      renders_remaining: 0,
      renders_limit: 3,
      renders_used: 3,
      tier: 'free',
    });

    renderWithQuery(
      <QuotaIndicator projectId="proj-1" onQuotaDepleted={onQuotaDepleted} />
    );

    await screen.findByText('Creditos restantes: 0');
    expect(onQuotaDepleted).toHaveBeenCalledWith(true);
  });
});
