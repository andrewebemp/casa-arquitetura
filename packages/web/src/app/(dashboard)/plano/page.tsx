'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SubscriptionTier } from '@decorai/shared';
import { useSubscription } from '@/hooks/use-subscription';
import { useCheckout } from '@/hooks/use-checkout';
import { usePortal } from '@/hooks/use-portal';
import { PricingGrid } from '@/components/organisms/PricingGrid';
import { SubscriptionSummary } from '@/components/molecules/SubscriptionSummary';
import { PricingFAQ } from '@/components/molecules/PricingFAQ';
import { createClient } from '@/lib/supabase/client';

export default function PlanoPage() {
  const router = useRouter();
  const { data: subscription, isLoading, isError } = useSubscription();
  const checkout = useCheckout();
  const portal = usePortal();
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);

  const isAuthenticated = !!subscription;
  const currentTier = subscription?.tier ?? null;
  const hasActiveSub = subscription && subscription.tier !== 'free';

  const handleCtaClick = async (tier: SubscriptionTier) => {
    if (tier === 'free') {
      router.push('/app/novo');
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/login?redirect=/app/plano');
      return;
    }

    setLoadingTier(tier);
    checkout.mutate(
      { tier, gateway: 'stripe' },
      {
        onSettled: () => setLoadingTier(null),
      },
    );
  };

  const handleManageClick = () => {
    portal.mutate();
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mx-auto h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl border bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Escolha seu Plano</h1>
        <p className="mt-2 text-gray-600">
          Transforme seus ambientes com renders fotorrealistas por IA
        </p>
      </div>

      {hasActiveSub && subscription && (
        <div className="mb-8">
          <SubscriptionSummary
            subscription={subscription}
            onManageClick={handleManageClick}
            loading={portal.isPending}
          />
        </div>
      )}

      {checkout.isError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Nao foi possivel iniciar o checkout. Tente novamente.
          </p>
          <button
            onClick={() => {
              if (loadingTier) {
                handleCtaClick(loadingTier);
              }
            }}
            className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-800"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {isError && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">
            Nao foi possivel carregar dados da assinatura. Os planos estao disponiveis abaixo.
          </p>
        </div>
      )}

      <PricingGrid
        currentTier={currentTier}
        isAuthenticated={isAuthenticated}
        onCtaClick={handleCtaClick}
        loadingTier={loadingTier}
      />

      <PricingFAQ />
    </div>
  );
}
