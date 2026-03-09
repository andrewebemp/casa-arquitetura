import { render, screen } from '@testing-library/react';
import { RenderQuotaBanner } from '@/components/molecules/RenderQuotaBanner';
import type { Subscription } from '@decorai/shared';

const baseSub: Subscription = {
  id: 'sub-1',
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

describe('RenderQuotaBanner', () => {
  it('shows tier badge and render count', () => {
    render(<RenderQuotaBanner subscription={baseSub} />);

    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('1/3 renders')).toBeInTheDocument();
  });

  it('shows progress bar with correct value', () => {
    render(<RenderQuotaBanner subscription={baseSub} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '3');
  });

  it('shows upgrade CTA when free tier depleted', () => {
    render(
      <RenderQuotaBanner
        subscription={{ ...baseSub, renders_used: 3, renders_limit: 3 }}
      />
    );

    expect(screen.getByText('Fazer upgrade')).toBeInTheDocument();
    expect(screen.getByText(/renders gratuitos acabaram/)).toBeInTheDocument();
  });

  it('does not show upgrade CTA when pro tier', () => {
    render(
      <RenderQuotaBanner
        subscription={{ ...baseSub, tier: 'pro', renders_used: 100, renders_limit: 100 }}
      />
    );

    expect(screen.queryByText('Fazer upgrade')).not.toBeInTheDocument();
  });

  it('shows Pro badge for pro tier', () => {
    render(
      <RenderQuotaBanner
        subscription={{ ...baseSub, tier: 'pro', renders_limit: 100 }}
      />
    );

    expect(screen.getByText('Pro')).toBeInTheDocument();
  });
});
