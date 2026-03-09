'use client';

import { useMutation } from '@tanstack/react-query';
import { Loader2, Trash2, X } from 'lucide-react';
import { removeObject, batchRemoveObjects } from '@/services/editing-service';
import type { DetectObjectResponse } from '@/services/editing-service';

interface ObjectRemovalPanelProps {
  projectId: string;
  selectedObjects: DetectObjectResponse[];
  onDeselectObject: (maskId: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  onApplied: () => void;
  onError: (message: string) => void;
}

export function ObjectRemovalPanel({
  projectId,
  selectedObjects,
  onDeselectObject,
  onClearAll,
  onClose,
  onApplied,
  onError,
}: ObjectRemovalPanelProps) {
  const removeSingleMutation = useMutation({
    mutationFn: (maskId: string) => removeObject(projectId, maskId),
    onSuccess: () => {
      onApplied();
    },
    onError: (error: Error) => {
      onError(error.message);
    },
  });

  const removeBatchMutation = useMutation({
    mutationFn: (maskIds: string[]) => batchRemoveObjects(projectId, maskIds),
    onSuccess: () => {
      onApplied();
    },
    onError: (error: Error) => {
      onError(error.message);
    },
  });

  const isRemoving = removeSingleMutation.isPending || removeBatchMutation.isPending;

  const handleRemoveSingle = (maskId: string) => {
    removeSingleMutation.mutate(maskId);
  };

  const handleRemoveAll = () => {
    const maskIds = selectedObjects.map((o) => o.mask_id);
    if (maskIds.length === 1) {
      removeSingleMutation.mutate(maskIds[0]);
    } else {
      removeBatchMutation.mutate(maskIds);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Remover Objetos</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Fechar painel de remocao"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedObjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Trash2 className="h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              Clique nos objetos na imagem para seleciona-los
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Voce pode selecionar ate 10 objetos
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">
                Objetos selecionados ({selectedObjects.length}/10)
              </p>
              <button
                type="button"
                onClick={onClearAll}
                disabled={isRemoving}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Limpar tudo
              </button>
            </div>

            {selectedObjects.map((obj) => (
              <div
                key={obj.mask_id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{obj.label}</p>
                    <p className="text-xs text-gray-400">
                      Confianca: {Math.round(obj.confidence * 100)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveSingle(obj.mask_id)}
                    disabled={isRemoving}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    Remover
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeselectObject(obj.mask_id)}
                    disabled={isRemoving}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Desselecionar objeto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedObjects.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            onClick={handleRemoveAll}
            disabled={isRemoving}
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRemoving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Removendo...
              </span>
            ) : (
              `Remover Todos (${selectedObjects.length})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
