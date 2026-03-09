'use client';

import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { SubscriptionTier, PaymentGateway } from '@decorai/shared';

interface CheckoutParams {
  tier: SubscriptionTier;
  gateway: PaymentGateway;
}

interface CheckoutResponse {
  url: string;
}

async function createCheckoutSession(params: CheckoutParams): Promise<CheckoutResponse> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Usuario nao autenticado');
  }

  const response = await fetch('/api/subscriptions/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel iniciar o checkout. Tente novamente.');
  }

  return response.json();
}

export function useCheckout() {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}
