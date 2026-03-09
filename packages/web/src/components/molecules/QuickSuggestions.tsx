'use client';

const SUGGESTIONS = [
  'Mais aconchegante',
  'Mudar cor das paredes',
  'Trocar piso',
  'Remover tapete',
  'Adicionar plantas',
  'Mudar iluminacao',
];

interface QuickSuggestionsProps {
  onSelect: (text: string) => void;
  visible: boolean;
}

export function QuickSuggestions({ onSelect, visible }: QuickSuggestionsProps) {
  if (!visible) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-3 pb-2 scrollbar-none">
      {SUGGESTIONS.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSelect(text)}
          className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
