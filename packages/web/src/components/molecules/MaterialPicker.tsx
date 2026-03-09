'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Check, X } from 'lucide-react';
import { getMaterials, applyMaterial } from '@/services/editing-service';
import type { MaterialSuggestion } from '@/services/editing-service';

interface MaterialPickerProps {
  projectId: string;
  segmentId: string;
  segmentLabel: string;
  onClose: () => void;
  onApplied: () => void;
  onError: (message: string) => void;
}

export function MaterialPicker({
  projectId,
  segmentId,
  segmentLabel,
  onClose,
  onApplied,
  onError,
}: MaterialPickerProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialSuggestion | null>(null);
  const [customDescription, setCustomDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['materials', projectId, segmentId],
    queryFn: () => getMaterials(projectId, segmentId),
  });

  const applyMutation = useMutation({
    mutationFn: (descriptor: string) => applyMaterial(projectId, segmentId, descriptor),
    onSuccess: () => {
      onApplied();
    },
    onError: (error: Error) => {
      onError(error.message);
    },
  });

  const materials = data?.materials ?? [];
  const isApplying = applyMutation.isPending;

  const handleApply = () => {
    const descriptor = customDescription.trim() || selectedMaterial?.name;
    if (!descriptor) return;
    applyMutation.mutate(descriptor);
  };

  const canApply = (selectedMaterial || customDescription.trim()) && !isApplying;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Materiais — {segmentLabel}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Fechar painel de materiais"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          </div>
        )}

        {!isLoading && materials.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Materiais sugeridos</p>
            <div className="grid grid-cols-2 gap-2">
              {materials.map((material) => {
                const isSelected = selectedMaterial?.id === material.id;
                return (
                  <button
                    key={material.id}
                    type="button"
                    onClick={() => {
                      setSelectedMaterial(material);
                      setCustomDescription('');
                    }}
                    disabled={isApplying}
                    className={`relative flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                      isSelected
                        ? 'border-brand-300 bg-brand-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {material.thumbnail_url ? (
                      <img
                        src={material.thumbnail_url}
                        alt={material.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div
                        className="h-12 w-12 rounded border border-gray-200"
                        style={{ backgroundColor: material.color }}
                      />
                    )}
                    <span className="text-xs font-medium text-gray-700">{material.name}</span>
                    {material.description && (
                      <span className="text-xs text-gray-500">{material.description}</span>
                    )}
                    {isSelected && (
                      <div className="absolute -right-1 -top-1 rounded-full bg-brand-600 p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="custom-material" className="block text-xs font-medium text-gray-500">
            Ou descreva um material customizado
          </label>
          <input
            id="custom-material"
            type="text"
            value={customDescription}
            onChange={(e) => {
              setCustomDescription(e.target.value);
              if (e.target.value.trim()) setSelectedMaterial(null);
            }}
            disabled={isApplying}
            placeholder="Ex: marmore carrara branco"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-300"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-3">
        <button
          type="button"
          onClick={handleApply}
          disabled={!canApply}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isApplying ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Aplicando...
            </span>
          ) : (
            'Aplicar'
          )}
        </button>
      </div>
    </div>
  );
}
