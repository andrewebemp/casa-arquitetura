'use client';

import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';

interface RenderRatingProps {
  renderId: string;
}

const TAG_LABELS: Record<string, string> = {
  realistic: 'Realismo',
  style_match: 'Estilo',
  lighting: 'Iluminacao',
  furniture_quality: 'Mobilia',
  composition: 'Composicao',
};

const QUALITY_TAGS = ['realistic', 'style_match', 'lighting', 'furniture_quality', 'composition'] as const;

export function RenderRating({ renderId }: RenderRatingProps) {
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    if (score === 0) return;

    try {
      await fetch(`/api/renders/${renderId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, tags: selectedTags, comment: comment || undefined }),
      });
      setSubmitted(true);
    } catch {
      // Silently fail - rating is non-critical
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  if (!visible || dismissed || submitted) return null;

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm" data-testid="render-rating">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Como ficou o resultado?</h4>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Fechar avaliacao"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex gap-1" role="group" aria-label="Avaliacao por estrelas">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setScore(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="p-0.5"
            aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoveredStar || score)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      {score > 0 && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUALITY_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {TAG_LABELS[tag]}
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentario opcional..."
            className="mt-3 w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            rows={2}
            maxLength={1000}
          />

          <button
            type="button"
            onClick={handleSubmit}
            className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Enviar avaliacao
          </button>
        </>
      )}
    </div>
  );
}
