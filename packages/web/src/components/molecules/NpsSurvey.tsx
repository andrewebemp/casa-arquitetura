'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function NpsSurvey() {
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const checkShouldShow = async () => {
      try {
        const res = await fetch('/api/nps/should-show');
        const json = await res.json();
        if (json.data?.should_show) {
          setVisible(true);
        }
      } catch {
        // Non-critical
      }
    };
    checkShouldShow();
  }, []);

  const handleSubmit = async () => {
    if (score === null) return;
    try {
      await fetch('/api/nps/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, comment: comment || undefined }),
      });
      setSubmitted(true);
      setTimeout(() => setVisible(false), 2000);
    } catch {
      // Non-critical
    }
  };

  const handleDismiss = async () => {
    try {
      await fetch('/api/nps/dismiss', { method: 'POST' });
    } catch {
      // Non-critical
    }
    setVisible(false);
  };

  if (!visible) return null;

  const getScoreColor = (s: number) => {
    if (s <= 6) return 'bg-red-100 text-red-700 hover:bg-red-200';
    if (s <= 8) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
    return 'bg-green-100 text-green-700 hover:bg-green-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" data-testid="nps-survey">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {submitted ? 'Obrigado!' : 'Qual a probabilidade de voce recomendar o DecorAI?'}
          </h3>
          {!submitted && (
            <button
              type="button"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fechar pesquisa NPS"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {submitted ? (
          <p className="mt-2 text-sm text-gray-500">Sua resposta foi registrada com sucesso.</p>
        ) : (
          <>
            <div className="mt-4 flex justify-between gap-1">
              {Array.from({ length: 11 }, (_, i) => i).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScore(s)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    score === s
                      ? `${getScoreColor(s)} ring-2 ring-offset-1 ring-brand-500`
                      : getScoreColor(s)
                  }`}
                  aria-label={`Nota ${s}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>Nada provavel</span>
              <span>Muito provavel</span>
            </div>

            {score !== null && (
              <>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte-nos mais sobre sua experiencia..."
                  className="mt-4 w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  rows={3}
                  maxLength={1000}
                />

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-3 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Enviar
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
