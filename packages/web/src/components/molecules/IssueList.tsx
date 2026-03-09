'use client';

import type { DiagnosticIssue } from '@decorai/shared';

interface IssueListProps {
  issues: DiagnosticIssue[];
  recommendations: string[];
  className?: string;
}

const CATEGORY_LABELS: Record<DiagnosticIssue['category'], string> = {
  lighting: 'Iluminacao',
  staging: 'Staging',
  composition: 'Composicao',
  quality: 'Qualidade',
  clutter: 'Organizacao',
};

const SEVERITY_STYLES: Record<DiagnosticIssue['severity'], { badge: string; label: string }> = {
  high: { badge: 'bg-red-100 text-red-700', label: 'Alta' },
  medium: { badge: 'bg-amber-100 text-amber-700', label: 'Media' },
  low: { badge: 'bg-green-100 text-green-700', label: 'Baixa' },
};

export function IssueList({ issues, recommendations, className = '' }: IssueListProps) {
  const groupedIssues = issues.reduce<Record<string, DiagnosticIssue[]>>((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {});

  const categories = Object.keys(groupedIssues) as DiagnosticIssue['category'][];

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900">Problemas Encontrados</h3>

      {categories.length === 0 && (
        <p className="mt-2 text-sm text-gray-500">Nenhum problema encontrado.</p>
      )}

      <div className="mt-3 space-y-4">
        {categories.map((category) => (
          <div key={category} className="rounded-lg border border-gray-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-gray-800">
              {CATEGORY_LABELS[category] ?? category}
            </h4>
            <ul className="mt-2 space-y-2">
              {groupedIssues[category].map((issue, idx) => {
                const severity = SEVERITY_STYLES[issue.severity];
                return (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 inline-block shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${severity.badge}`}
                    >
                      {severity.label}
                    </span>
                    <span className="text-gray-700">{issue.description}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900">Recomendacoes</h3>
          <ul className="mt-2 space-y-1.5">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
