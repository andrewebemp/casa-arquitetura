'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { DECOR_STYLES } from '@decorai/shared';
import { SlidersHorizontal, Heart } from 'lucide-react';

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStyle = searchParams.get('style') ?? '';
  const currentSort = searchParams.get('sort') ?? 'recent';
  const showFavorites = searchParams.get('favorites') === 'true';

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/projects?${params.toString()}`, { scroll: false });
  }

  function toggleFavorites() {
    const params = new URLSearchParams(searchParams.toString());
    if (showFavorites) {
      params.delete('favorites');
    } else {
      params.set('favorites', 'true');
    }
    router.push(`/projects?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">Filtros</span>
      </div>

      <select
        value={currentStyle}
        onChange={(e) => updateParams('style', e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        aria-label="Filtrar por estilo"
      >
        <option value="">Todos os estilos</option>
        {DECOR_STYLES.map((style) => (
          <option key={style} value={style}>
            {style.charAt(0).toUpperCase() + style.slice(1)}
          </option>
        ))}
      </select>

      <select
        value={currentSort}
        onChange={(e) => updateParams('sort', e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        aria-label="Ordenar por"
      >
        <option value="recent">Mais recente</option>
        <option value="oldest">Mais antigo</option>
      </select>

      <button
        onClick={toggleFavorites}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
          showFavorites
            ? 'border-red-200 bg-red-50 text-red-600'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        }`}
        aria-label={showFavorites ? 'Mostrar todos' : 'Mostrar favoritos'}
        aria-pressed={showFavorites}
      >
        <Heart className={`h-3.5 w-3.5 ${showFavorites ? 'fill-red-500' : ''}`} />
        Favoritos
      </button>
    </div>
  );
}
