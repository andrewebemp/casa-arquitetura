import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionSummary } from '@/components/molecules/SubscriptionSummary';
import type { Subscription } from '@decorai/shared';

const baseSub: Subscription = {
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

describe('SubscriptionSummary', () => {
  it('renders current tier badge', () => {
    render(
      <SubscriptionSummary subscription={baseSub} onManageClick={jest.fn()} />
    );

    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('renders renders usage', () => {
    render(
      <SubscriptionSummary subscription={baseSub} onManageClick={jest.fn()} />
    );

    expect(screen.getByText('42/100 renders utilizados')).toBeInTheDocument();
  });

  it('renders progress bar with correct values', () => {
    render(
      <SubscriptionSummary subscription={baseSub} onManageClick={jest.fn()} />
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '42');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows renewal date', () => {
    render(
      <SubscriptionSummary subscription={baseSub} onManageClick={jest.fn()} />
    );

    expect(screen.getByText(/Renovacao em/)).toBeInTheDocument();
  });

  it('manage button calls onManageClick', async () => {
    const onManageClick = jest.fn();
    const user = userEvent.setup();

    render(
      <SubscriptionSummary subscription={baseSub} onManageClick={onManageClick} />
    );

    await user.click(screen.getByText('Gerenciar Assinatura'));
    expect(onManageClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state on manage button', () => {
    render(
      <SubscriptionSummary
        subscription={baseSub}
        onManageClick={jest.fn()}
        loading={true}
      />
    );

    expect(screen.getByText('Abrindo...')).toBeInTheDocument();
  });
});
