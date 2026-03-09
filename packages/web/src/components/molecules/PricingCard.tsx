'use client';

import { Check, X } from 'lucide-react';
import type { PricingTierData, SubscriptionTier } from '@decorai/shared';

interface PricingCardProps {
  data: PricingTierData;
  currentTier?: SubscriptionTier | null;
  isAuthenticated: boolean;
  onCtaClick: (tier: SubscriptionTier) => void;
  loading?: boolean;
}

export function PricingCard({
  data,
  currentTier,
  isAuthenticated,
  onCtaClick,
  loading = false,
}: PricingCardProps) {
  const isCurrentPlan = isAuthenticated && currentTier === data.tier;
  const isHigherTier = currentTier
    ? tierPriority(data.tier) > tierPriority(currentTier)
    : false;
  const isLowerTier = currentTier && currentTier !== 'free'
    ? tierPriority(data.tier) < tierPriority(currentTier)
    : false;

  const ctaText = isCurrentPlan
    ? 'Plano Atual'
    : isHigherTier
      ? data.ctaLabelUpgrade
      : isLowerTier
        ? data.ctaLabelDowngrade
        : data.ctaLabel;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
        data.popular ? 'border-brand-500 ring-2 ring-brand-500' : 'border-gray-200'
      }`}
    >
      {data.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
          Mais Popular
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{data.priceLabel}</span>
          {data.priceNote && (
            <span className="text-sm text-gray-500">{data.priceNote}</span>
          )}
        </div>
      </div>

      <ul className="mb-6 flex-1 space-y-3">
        {data.features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-2">
            {feature.included ? (
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
            ) : (
              <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-300" />
            )}
            <span className={feature.included ? 'text-sm text-gray-700' : 'text-sm text-gray-400'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onCtaClick(data.tier)}
        disabled={isCurrentPlan || loading}
        className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
          isCurrentPlan
            ? 'cursor-default border border-gray-300 bg-gray-50 text-gray-500'
            : data.popular
              ? 'bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50'
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50'
        }`}
      >
        {loading ? 'Processando...' : ctaText}
      </button>
    </div>
  );
}

function tierPriority(tier: SubscriptionTier): number {
  const priorities: Record<SubscriptionTier, number> = {
    free: 0,
    pro: 1,
    business: 2,
  };
  return priorities[tier];
}
