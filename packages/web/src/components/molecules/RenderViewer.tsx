'use client';

import {
  Palette,
  Pencil,
  GitCompare,
  Share2,
  History,
  X,
} from 'lucide-react';

interface RenderViewerProps {
  imageUrl: string | null;
  onToggleHistory: () => void;
  onCompare?: () => void;
  onShare?: () => void;
}

const TOOLBAR_ACTIONS = [
  { label: 'Trocar Estilo', icon: Palette, action: undefined as string | undefined },
  { label: 'Editar Elementos', icon: Pencil, action: undefined as string | undefined },
  { label: 'Comparar Antes/Depois', icon: GitCompare, action: 'compare' as string | undefined },
  { label: 'Compartilhar', icon: Share2, action: 'share' as string | undefined },
];

export function RenderViewer({
  imageUrl,
  onToggleHistory,
  onCompare,
  onShare,
}: RenderViewerProps) {
  const handleAction = (action: string | undefined) => {
    if (action === 'compare' && onCompare) onCompare();
    if (action === 'share' && onShare) onShare();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden rounded-xl bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Render do ambiente"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Nenhum render disponivel
          </div>
        )}

        <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-xs text-white/80">
          Imagem ilustrativa gerada por IA
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {TOOLBAR_ACTIONS.map(({ label, icon: Icon, action }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleAction(action)}
            disabled={!action}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={onToggleHistory}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          aria-label="Historico de versoes"
        >
          <History className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Historico</span>
        </button>
      </div>
    </div>
  );
}
