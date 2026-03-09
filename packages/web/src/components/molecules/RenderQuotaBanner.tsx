import Link from 'next/link';
import type { Subscription } from '@decorai/shared';
import { Zap } from 'lucide-react';

interface RenderQuotaBannerProps {
  subscription: Subscription;
}

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
};

export function RenderQuotaBanner({ subscription }: RenderQuotaBannerProps) {
  const { tier, renders_used, renders_limit } = subscription;
  const percentage = renders_limit > 0 ? (renders_used / renders_limit) * 100 : 0;
  const isDepleted = renders_used >= renders_limit;
  const tierLabel = TIER_LABELS[tier] ?? tier;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              tier === 'free'
                ? 'bg-gray-100 text-gray-700'
                : tier === 'pro'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-accent-100 text-accent-700'
            }`}
          >
            {tierLabel}
          </span>
          <span className="text-sm text-gray-600">
            {renders_used}/{renders_limit} renders
          </span>
        </div>

        {isDepleted && tier === 'free' && (
          <Link
            href="/subscription"
            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700"
          >
            <Zap className="h-3.5 w-3.5" />
            Fazer upgrade
          </Link>
        )}
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${
            isDepleted ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-brand-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
          role="progressbar"
          aria-valuenow={renders_used}
          aria-valuemin={0}
          aria-valuemax={renders_limit}
          aria-label={`${renders_used} de ${renders_limit} renders utilizados`}
        />
      </div>

      {isDepleted && tier === 'free' && (
        <p className="mt-2 text-xs text-red-600">
          Seus renders gratuitos acabaram. Faca upgrade para continuar criando.
        </p>
      )}
    </div>
  );
}
