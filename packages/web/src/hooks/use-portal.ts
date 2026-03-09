'use client';

import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface PortalResponse {
  url: string;
}

async function createPortalSession(): Promise<PortalResponse> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Usuario nao autenticado');
  }

  const response = await fetch('/api/subscriptions/portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel abrir o portal de assinatura. Tente novamente.');
  }

  return response.json();
}

export function usePortal() {
  return useMutation({
    mutationFn: createPortalSession,
    onSuccess: (data) => {
      window.location.href = data.url;
    },
  });
}
