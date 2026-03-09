'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSubscription } from '@/services/project-service';
import type { Subscription } from '@decorai/shared';

export function useSubscription() {
  return useQuery<Subscription>({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
  });
}
