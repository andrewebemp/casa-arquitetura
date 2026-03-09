import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PricingCard } from '@/components/molecules/PricingCard';
import { PRICING_TIERS } from '@decorai/shared';

const proTier = PRICING_TIERS.find((t) => t.tier === 'pro')!;
const freeTier = PRICING_TIERS.find((t) => t.tier === 'free')!;
const businessTier = PRICING_TIERS.find((t) => t.tier === 'business')!;

describe('PricingCard', () => {
  it('renders tier name and price', () => {
    const onClick = jest.fn();
    render(
      <PricingCard
        data={proTier}
        currentTier={null}
        isAuthenticated={false}
        onCtaClick={onClick}
      />
    );

    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('R$ 79-149')).toBeInTheDocument();
    expect(screen.getByText('/mes')).toBeInTheDocument();
  });

  it('renders feature list with check/x icons', () => {
    const onClick = jest.fn();
    render(
      <PricingCard
        data={proTier}
        currentTier={null}
        isAuthenticated={false}
        onCtaClick={onClick}
      />
    );

    expect(screen.getByText('100 renders/mes')).toBeInTheDocument();
    expect(screen.getByText('Sem marca d\'agua')).toBeInTheDocument();
    expect(screen.getByText('Chat de refinamento')).toBeInTheDocument();
  });

  it('shows "Mais Popular" badge for Pro tier', () => {
    const onClick = jest.fn();
    render(
      <PricingCard
        data={proTier}
        currentTier={null}
        isAuthenticated={false}
        onCtaClick={onClick}
      />
    );

    expect(screen.getByText('Mais Popular')).toBeInTheDocument();
  });

  it('does not show "Mais Popular" badge for Free tier', () => {
    const onClick = jest.fn();
    render(
      <PricingCard
        data={freeTier}
        currentTier={null}
        isAuthenticated={false}
        onCtaClick={onClick}
      />
    );

    expect(screen.queryByText('Mais Popular')).not.toBeInTheDocument();
  });

  it('shows "Plano Atual" when tier matches current plan', () => {
    const onClick = jest.fn();
    render(
      <PricingCard
        data={proTier}
        currentTier="pro"
        isAuthenticated={true}
        onCtaClick={onClick}
      />
    );

    expect(screen.getByText('Plano Atual')).toBeInTheDocument();
  });

  it('shows "Fazer Upgrade" for higher tier', () => {
    const onClick = jest.fn();
    render(
      <PricingCard
        data={businessTier}
        currentTier="pro"
        isAuthenticated={true}
        onCtaClick={onClick}
      />
    );

    expect(screen.getByText('Fazer Upgrade')).toBeInTheDocument();
  });

  it('shows "Fazer Downgrade" for lower tier', () => {
    const onClick = jest.fn();
    render(
      <PricingCard
        data={freeTier}
        currentTier="pro"
        isAuthenticated={true}
        onCtaClick={onClick}
      />
    );

    expect(screen.getByText('Fazer Downgrade')).toBeInTheDocument();
  });

  it('CTA click triggers handler with tier', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();

    render(
      <PricingCard
        data={proTier}
        currentTier={null}
        isAuthenticated={false}
        onCtaClick={onClick}
      />
    );

    await user.click(screen.getByText('Assinar Pro'));
    expect(onClick).toHaveBeenCalledWith('pro');
  });

  it('disables CTA button when current plan', () => {
    const onClick = jest.fn();
    render(
      <PricingCard
        data={proTier}
        currentTier="pro"
        isAuthenticated={true}
        onCtaClick={onClick}
      />
    );

    const button = screen.getByText('Plano Atual');
    expect(button).toBeDisabled();
  });

  it('shows loading state', () => {
    const onClick = jest.fn();
    render(
      <PricingCard
        data={proTier}
        currentTier={null}
        isAuthenticated={false}
        onCtaClick={onClick}
        loading={true}
      />
    );

    expect(screen.getByText('Processando...')).toBeInTheDocument();
  });
});
