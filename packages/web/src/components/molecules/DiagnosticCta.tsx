'use client';

import Link from 'next/link';
import type { DiagnosticCta as DiagnosticCtaType } from '@decorai/shared';

interface DiagnosticCtaProps {
  cta: DiagnosticCtaType;
  score: number;
  estimatedLossPercent: number;
  className?: string;
}

const PLAN_LABELS: Record<string, string> = {
  pro: 'Pro',
  business: 'Business',
};

export function DiagnosticCta({
  cta,
  score,
  estimatedLossPercent,
  className = '',
}: DiagnosticCtaProps) {
  const urgencyColor = score < 40
    ? 'border-red-200 bg-red-50'
    : score <= 70
      ? 'border-amber-200 bg-amber-50'
      : 'border-green-200 bg-green-50';

  const planLabel = PLAN_LABELS[cta.plan_recommended] ?? cta.plan_recommended;

  return (
    <div className={`rounded-xl border-2 p-6 text-center ${urgencyColor} ${className}`}>
      <p className="text-lg font-semibold text-gray-900">
        Seu imovel esta perdendo{' '}
        <span className="text-red-600">{estimatedLossPercent}%</span>{' '}
        do valor percebido
      </p>

      <p className="mt-3 text-sm text-gray-700">{cta.message}</p>

      <p className="mt-4 text-xs text-gray-500">
        Plano recomendado: <span className="font-semibold text-gray-800">{planLabel}</span>
      </p>

      <Link
        href={cta.upgrade_url}
        className="mt-4 inline-block rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-700"
      >
        Transformar Meu Imovel
      </Link>
    </div>
  );
}
