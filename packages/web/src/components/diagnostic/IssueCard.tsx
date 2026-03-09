'use client';

import type { DiagnosticIssue } from '@decorai/shared';
import { Sun, Sofa, LayoutGrid, ImageIcon, Trash2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const CATEGORY_ICONS: Record<DiagnosticIssue['category'], LucideIcon> = {
  lighting: Sun,
  staging: Sofa,
  composition: LayoutGrid,
  quality: ImageIcon,
  clutter: Trash2,
};

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

interface IssueCardProps {
  issue: DiagnosticIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const Icon = CATEGORY_ICONS[issue.category];
  const severity = SEVERITY_STYLES[issue.severity];

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="mt-0.5 shrink-0 rounded-lg bg-gray-100 p-2">
        <Icon className="h-4 w-4 text-gray-600" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">
            {CATEGORY_LABELS[issue.category]}
          </span>
          <span
            className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${severity.badge}`}
          >
            {severity.label}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600">{issue.description}</p>
      </div>
    </div>
  );
}
