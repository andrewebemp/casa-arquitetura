'use client';

import { PRICING_TIERS } from '@decorai/shared';
import type { SubscriptionTier } from '@decorai/shared';
import { PricingCard } from '@/components/molecules/PricingCard';

interface PricingGridProps {
  currentTier?: SubscriptionTier | null;
  isAuthenticated: boolean;
  onCtaClick: (tier: SubscriptionTier) => void;
  loadingTier?: SubscriptionTier | null;
}

export function PricingGrid({
  currentTier,
  isAuthenticated,
  onCtaClick,
  loadingTier,
}: PricingGridProps) {
  const desktopOrder = PRICING_TIERS;
  const mobileOrder = [...PRICING_TIERS].sort((a, b) => {
    if (a.popular) return -1;
    if (b.popular) return 1;
    return 0;
  });

  return (
    <>
      {/* Desktop: 3 columns, original order */}
      <div className="hidden gap-6 md:grid md:grid-cols-3">
        {desktopOrder.map((tier) => (
          <PricingCard
            key={tier.tier}
            data={tier}
            currentTier={currentTier}
            isAuthenticated={isAuthenticated}
            onCtaClick={onCtaClick}
            loading={loadingTier === tier.tier}
          />
        ))}
      </div>

      {/* Mobile: stacked, Pro first */}
      <div className="flex flex-col gap-4 md:hidden">
        {mobileOrder.map((tier) => (
          <PricingCard
            key={tier.tier}
            data={tier}
            currentTier={currentTier}
            isAuthenticated={isAuthenticated}
            onCtaClick={onCtaClick}
            loading={loadingTier === tier.tier}
          />
        ))}
      </div>
    </>
  );
}
