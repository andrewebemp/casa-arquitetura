import { render, screen } from '@testing-library/react';
import { PricingGrid } from '@/components/organisms/PricingGrid';

describe('PricingGrid', () => {
  it('renders all 3 tier cards', () => {
    render(
      <PricingGrid
        currentTier={null}
        isAuthenticated={false}
        onCtaClick={jest.fn()}
      />
    );

    expect(screen.getAllByText('Free')).toHaveLength(2); // desktop + mobile
    expect(screen.getAllByText('Pro')).toHaveLength(2);
    expect(screen.getAllByText('Business')).toHaveLength(2);
  });

  it('renders pricing for each tier', () => {
    render(
      <PricingGrid
        currentTier={null}
        isAuthenticated={false}
        onCtaClick={jest.fn()}
      />
    );

    expect(screen.getAllByText('R$ 0')).toHaveLength(2);
    expect(screen.getAllByText('R$ 79-149')).toHaveLength(2);
    expect(screen.getAllByText('R$ 299-499')).toHaveLength(2);
  });

  it('highlights current plan for authenticated user', () => {
    render(
      <PricingGrid
        currentTier="pro"
        isAuthenticated={true}
        onCtaClick={jest.fn()}
      />
    );

    expect(screen.getAllByText('Plano Atual')).toHaveLength(2); // desktop + mobile
  });

  it('shows upgrade/downgrade labels relative to current plan', () => {
    render(
      <PricingGrid
        currentTier="pro"
        isAuthenticated={true}
        onCtaClick={jest.fn()}
      />
    );

    expect(screen.getAllByText('Fazer Downgrade')).toHaveLength(2); // Free card
    expect(screen.getAllByText('Fazer Upgrade')).toHaveLength(2); // Business card
  });
});
