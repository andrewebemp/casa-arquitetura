'use client';

import type { Subscription } from '@decorai/shared';
import { CreditCard } from 'lucide-react';

interface SubscriptionSummaryProps {
  subscription: Subscription;
  onManageClick: () => void;
  loading?: boolean;
}

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
};

export function SubscriptionSummary({
  subscription,
  onManageClick,
  loading = false,
}: SubscriptionSummaryProps) {
  const { tier, renders_used, renders_limit, current_period_end } = subscription;
  const percentage = renders_limit > 0 ? (renders_used / renders_limit) * 100 : 0;
  const tierLabel = TIER_LABELS[tier] ?? tier;

  const renewalDate = new Date(current_period_end).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Sua Assinatura</h2>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                tier === 'pro'
                  ? 'bg-brand-100 text-brand-700'
                  : tier === 'business'
                    ? 'bg-accent-100 text-accent-700'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tierLabel}
            </span>
            <span className="text-sm text-gray-600">
              {renders_used}/{renders_limit} renders utilizados
            </span>
          </div>

          <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${
                percentage >= 100 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
              role="progressbar"
              aria-valuenow={renders_used}
              aria-valuemin={0}
              aria-valuemax={renders_limit}
              aria-label={`${renders_used} de ${renders_limit} renders utilizados`}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Renovacao em {renewalDate}
          </p>
        </div>

        <button
          onClick={onManageClick}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Abrindo...' : 'Gerenciar Assinatura'}
        </button>
      </div>
    </div>
  );
}
