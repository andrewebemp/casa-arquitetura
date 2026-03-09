'use client';

import type { RefinementOperation } from '@decorai/shared';

const OPERATION_COLORS: Record<string, { bg: string; text: string }> = {
  add: { bg: 'bg-green-100', text: 'text-green-700' },
  remove: { bg: 'bg-red-100', text: 'text-red-700' },
  change: { bg: 'bg-blue-100', text: 'text-blue-700' },
  move: { bg: 'bg-amber-100', text: 'text-amber-700' },
  resize: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

const OPERATION_LABELS: Record<string, string> = {
  add: 'adicionar',
  remove: 'remover',
  change: 'mudar',
  move: 'mover',
  resize: 'redimensionar',
};

interface OperationBadgesProps {
  operations: RefinementOperation[];
}

export function OperationBadges({ operations }: OperationBadgesProps) {
  if (operations.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {operations.map((op, index) => {
        const colors = OPERATION_COLORS[op.type] ?? { bg: 'bg-gray-100', text: 'text-gray-700' };
        const label = OPERATION_LABELS[op.type] ?? op.type;

        return (
          <span
            key={`${op.type}-${op.target}-${index}`}
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            {label}: {op.target}
          </span>
        );
      })}
    </div>
  );
}
