'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Sun, Sparkles, Flame, AlertTriangle, X } from 'lucide-react';
import { analyzeLighting, enhanceLighting } from '@/services/editing-service';
import type { LightingMode } from '@/services/editing-service';

interface LightingPanelProps {
  projectId: string;
  onClose: () => void;
  onApplied: () => void;
  onError: (message: string) => void;
}

const LIGHTING_MODES: { id: LightingMode; label: string; description: string; icon: typeof Sun; badge?: string }[] = [
  { id: 'auto', label: 'Automatico', description: 'Ajuste inteligente baseado na analise da foto', icon: Sparkles, badge: 'Recomendado' },
  { id: 'natural', label: 'Luz Natural', description: 'Simula iluminacao de luz do dia', icon: Sun },
  { id: 'warm', label: 'Luz Quente', description: 'Tom aconchegante, ideal para ambientes internos', icon: Flame },
];

export function LightingPanel({
  projectId,
  onClose,
  onApplied,
  onError,
}: LightingPanelProps) {
  const [selectedMode, setSelectedMode] = useState<LightingMode>('auto');

  const { data: analysis, isLoading: isAnalyzing } = useQuery({
    queryKey: ['lighting-analysis', projectId],
    queryFn: () => analyzeLighting(projectId),
  });

  const enhanceMutation = useMutation({
    mutationFn: (mode: LightingMode) => enhanceLighting(projectId, mode),
    onSuccess: () => {
      onApplied();
    },
    onError: (error: Error) => {
      onError(error.message);
    },
  });

  const brightnessScore = analysis?.brightness_score ?? 0;
  const isDark = brightnessScore < 40;
  const isEnhancing = enhanceMutation.isPending;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Iluminacao</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Fechar painel de iluminacao"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Brightness Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-500">Brilho atual</span>
            {isAnalyzing ? (
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            ) : (
              <span className="font-semibold text-gray-700">{brightnessScore}/100</span>
            )}
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDark ? 'bg-yellow-500' : brightnessScore < 70 ? 'bg-brand-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(brightnessScore, 100)}%` }}
              role="progressbar"
              aria-valuenow={brightnessScore}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Score de brilho"
            />
          </div>
        </div>

        {/* Dark photo warning */}
        {isDark && !isAnalyzing && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
            <p className="text-xs text-yellow-700">
              Sua foto parece estar escura. Recomendamos melhorar a iluminacao.
            </p>
          </div>
        )}

        {/* Mode cards */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Selecione o modo</p>
          {LIGHTING_MODES.map(({ id, label, description, icon: Icon, badge }) => {
            const isSelected = selectedMode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedMode(id)}
                disabled={isEnhancing}
                className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  isSelected
                    ? 'border-brand-300 bg-brand-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`mt-0.5 rounded-lg p-2 ${
                  isSelected ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                    {badge && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-3">
        <button
          type="button"
          onClick={() => enhanceMutation.mutate(selectedMode)}
          disabled={isEnhancing}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isEnhancing ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Melhorando...
            </span>
          ) : (
            'Melhorar Iluminacao'
          )}
        </button>
      </div>
    </div>
  );
}
