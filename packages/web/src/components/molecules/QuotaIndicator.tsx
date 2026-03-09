'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Zap, Loader2 } from 'lucide-react';
import { getQuota } from '@/services/editing-service';

interface QuotaIndicatorProps {
  projectId: string;
  onQuotaDepleted?: (depleted: boolean) => void;
}

export function QuotaIndicator({ projectId, onQuotaDepleted }: QuotaIndicatorProps) {
  const { data: quota, isLoading } = useQuery({
    queryKey: ['quota', projectId],
    queryFn: () => getQuota(projectId),
    refetchInterval: 30000,
  });

  const remaining = quota?.renders_remaining ?? 0;
  const isDepleted = quota ? remaining <= 0 : false;

  if (onQuotaDepleted && quota) {
    onQuotaDepleted(isDepleted);
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${
      isDepleted
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-gray-200 bg-white text-gray-700'
    }`}>
      <Zap className={`h-3.5 w-3.5 ${isDepleted ? 'text-red-500' : 'text-brand-500'}`} />
      <span>
        Creditos restantes: {remaining}
      </span>

      {isDepleted && (
        <Link
          href="/subscription"
          className="ml-1 rounded bg-brand-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-brand-700"
          title="Seus creditos de render acabaram. Faca upgrade do plano para continuar editando."
        >
          Upgrade
        </Link>
      )}
    </div>
  );
}
