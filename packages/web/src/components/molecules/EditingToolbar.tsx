'use client';

import { Grid3X3, Sun, Eraser, X } from 'lucide-react';
import type { EditingTool } from '@/hooks/use-editing-store';

interface EditingToolbarProps {
  activeTool: EditingTool;
  onSelectTool: (tool: Exclude<EditingTool, null>) => void;
  onExitEditing: () => void;
  disabled?: boolean;
}

const TOOLS: { id: Exclude<EditingTool, null>; label: string; icon: typeof Grid3X3 }[] = [
  { id: 'segment', label: 'Segmentar Elementos', icon: Grid3X3 },
  { id: 'lighting', label: 'Iluminacao', icon: Sun },
  { id: 'removal', label: 'Remover Objetos', icon: Eraser },
];

export function EditingToolbar({
  activeTool,
  onSelectTool,
  onExitEditing,
  disabled = false,
}: EditingToolbarProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg md:flex-col">
      {TOOLS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTool === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelectTool(id)}
            disabled={disabled}
            className={`group relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-600 text-white'
                : 'text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
            }`}
            aria-label={label}
            aria-pressed={isActive}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">{label}</span>
            {/* Tooltip for mobile */}
            <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 md:hidden">
              {label}
            </span>
          </button>
        );
      })}

      <div className="my-1 border-t border-gray-200" />

      <button
        type="button"
        onClick={onExitEditing}
        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        aria-label="Sair da Edicao"
      >
        <X className="h-4 w-4 shrink-0" />
        <span className="hidden md:inline">Sair da Edicao</span>
      </button>
    </div>
  );
}
