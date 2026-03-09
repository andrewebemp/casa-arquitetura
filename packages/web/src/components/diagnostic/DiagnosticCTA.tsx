'use client';

import Link from 'next/link';
import type { DiagnosticCta } from '@decorai/shared';
import { ArrowRight } from 'lucide-react';

interface DiagnosticCTAProps {
  cta: DiagnosticCta;
  score: number;
  isAuthenticated?: boolean;
  hasPaidTier?: boolean;
  originalImageUrl?: string;
  className?: string;
}

function getCtaStyle(score: number): {
  container: string;
  button: string;
  badge: string;
} {
  if (score < 40) {
    return {
      container: 'border-red-200 bg-red-50',
      button: 'bg-red-600 hover:bg-red-700 text-white',
      badge: 'bg-red-100 text-red-700',
    };
  }
  if (score <= 70) {
    return {
      container: 'border-amber-200 bg-amber-50',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      badge: 'bg-amber-100 text-amber-700',
    };
  }
  return {
    container: 'border-green-200 bg-green-50',
    button: 'bg-green-600 hover:bg-green-700 text-white',
    badge: 'bg-green-100 text-green-700',
  };
}

const TIER_LABELS: Record<string, string> = {
  pro: 'Pro',
  business: 'Business',
};

export function DiagnosticCTA({
  cta,
  score,
  isAuthenticated = false,
  hasPaidTier = false,
  originalImageUrl,
  className = '',
}: DiagnosticCTAProps) {
  const style = getCtaStyle(score);

  const href = isAuthenticated && hasPaidTier
    ? `/app/novo${originalImageUrl ? `?image=${encodeURIComponent(originalImageUrl)}` : ''}`
    : '/pricing';

  const buttonLabel = isAuthenticated && hasPaidTier
    ? 'Criar Projeto com Esta Foto'
    : 'Ver Planos';

  return (
    <div
      className={`rounded-xl border p-6 text-center ${style.container} ${className}`}
      data-testid="diagnostic-cta"
    >
      <p className="text-lg font-semibold text-gray-900">
        {cta.message}
      </p>

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
          Recomendado: {TIER_LABELS[cta.plan_recommended] ?? cta.plan_recommended}
        </span>
      </div>

      <Link
        href={href}
        className={`mt-4 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold shadow-md transition-colors ${style.button}`}
      >
        {buttonLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
