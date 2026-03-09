'use client';

import { useMemo } from 'react';
import type { DiagnosticResponse } from '@decorai/shared';
import { CheckCircle2 } from 'lucide-react';
import { ScoreGauge } from '@/components/molecules/ScoreGauge';
import { IssueCard } from '@/components/diagnostic/IssueCard';
import { DiagnosticCTA } from '@/components/diagnostic/DiagnosticCTA';
import { DiagnosticShare } from '@/components/diagnostic/DiagnosticShare';
import { BeforeAfterSlider } from '@/components/molecules/BeforeAfterSlider';

interface DiagnosticResultProps {
  result: DiagnosticResponse;
  isAuthenticated?: boolean;
  hasPaidTier?: boolean;
}

export function DiagnosticResult({
  result,
  isAuthenticated = false,
  hasPaidTier = false,
}: DiagnosticResultProps) {
  const { analysis, cta, original_image_url, staged_preview_url } = result;

  const sortedIssues = useMemo(
    () =>
      [...analysis.issues].sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.severity] - order[b.severity];
      }),
    [analysis.issues]
  );

  return (
    <div className="space-y-8">
      {/* Score Section */}
      <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">Resultado da Analise</h2>
        <ScoreGauge score={analysis.overall_score} className="mt-4" />
        <p className="mt-4 text-lg font-semibold text-gray-900">
          Seu imovel pode estar perdendo ate{' '}
          <span className="text-red-600">{analysis.estimated_loss_percent}%</span>{' '}
          do valor potencial
        </p>
      </div>

      {/* Before/After Preview (when available) */}
      {staged_preview_url && original_image_url && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <BeforeAfterSlider
            beforeUrl={original_image_url}
            afterUrl={staged_preview_url}
            beforeLabel="ANTES"
            afterLabel="DEPOIS"
            className="aspect-video w-full"
          />
          <p className="border-t bg-gray-50 py-2 text-center text-xs text-gray-400">
            Imagem ilustrativa gerada por IA
          </p>
        </div>
      )}

      {/* Original image only (no staged preview) */}
      {!staged_preview_url && original_image_url && (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <p className="bg-gray-50 px-4 py-2 text-center text-xs font-medium text-gray-600">
            Foto Original
          </p>
          <img
            src={original_image_url}
            alt="Foto original do imovel"
            className="h-52 w-full object-cover md:h-64"
          />
        </div>
      )}

      {/* Issues */}
      {sortedIssues.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Problemas Encontrados</h3>
          <div className="mt-3 space-y-3">
            {sortedIssues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900">O que fazer para melhorar</h3>
          <ul className="mt-3 space-y-2">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <DiagnosticCTA
        cta={cta}
        score={analysis.overall_score}
        isAuthenticated={isAuthenticated}
        hasPaidTier={hasPaidTier}
        originalImageUrl={original_image_url}
      />

      {/* Share */}
      <DiagnosticShare
        diagnosticId={result.id}
        score={analysis.overall_score}
      />
    </div>
  );
}
