'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Palette, Sun, Trash2, RotateCcw } from 'lucide-react';
import { getEditHistory, revertToEdit } from '@/services/editing-service';
import type { EditHistoryItem } from '@/services/editing-service';

interface EditVersionTimelineProps {
  projectId: string;
  onPreview: (editId: string, versionId: string) => void;
  onReverted: () => void;
}

const EDIT_TYPE_CONFIG: Record<string, { icon: typeof Palette; color: string; label: string }> = {
  material_swap: { icon: Palette, color: 'text-purple-600 bg-purple-100', label: 'Troca de material' },
  lighting: { icon: Sun, color: 'text-yellow-600 bg-yellow-100', label: 'Iluminacao' },
  object_removal: { icon: Trash2, color: 'text-red-600 bg-red-100', label: 'Remocao de objeto' },
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function EditVersionTimeline({
  projectId,
  onPreview,
  onReverted,
}: EditVersionTimelineProps) {
  const queryClient = useQueryClient();
  const [confirmRevert, setConfirmRevert] = useState<EditHistoryItem | null>(null);

  const { data: edits = [], isLoading } = useQuery({
    queryKey: ['edit-history', projectId],
    queryFn: () => getEditHistory(projectId),
  });

  const revertMutation = useMutation({
    mutationFn: (editId: string) => revertToEdit(projectId, editId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edit-history', projectId] });
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
      setConfirmRevert(null);
      onReverted();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-3">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (edits.length === 0) return null;

  return (
    <>
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
        <p className="text-xs font-medium text-gray-500">Historico de Edicoes</p>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-thin">
        {edits.map((edit) => {
          const config = EDIT_TYPE_CONFIG[edit.type] ?? EDIT_TYPE_CONFIG.material_swap;
          const Icon = config.icon;

          return (
            <button
              key={edit.id}
              type="button"
              onClick={() => onPreview(edit.id, edit.version_id)}
              className={`group relative flex shrink-0 flex-col items-center gap-1 rounded-lg border p-2 transition-colors ${
                edit.reverted
                  ? 'border-gray-200 bg-gray-50 opacity-60'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              title={`${config.label}: ${edit.description}\n${formatTime(edit.created_at)}`}
            >
              {edit.thumbnail_url ? (
                <img
                  src={edit.thumbnail_url}
                  alt={edit.description}
                  className="h-12 w-16 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-100">
                  <Icon className={`h-5 w-5 ${config.color.split(' ')[0]}`} />
                </div>
              )}

              <div className={`rounded-full p-1 ${config.color}`}>
                <Icon className="h-3 w-3" />
              </div>

              <span className="text-xs text-gray-500">{formatTime(edit.created_at)}</span>

              {!edit.reverted && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmRevert(edit);
                  }}
                  className="absolute -right-1 -top-1 hidden rounded-full bg-white p-1 shadow-sm border border-gray-200 group-hover:block"
                  aria-label="Reverter para esta versao"
                >
                  <RotateCcw className="h-3 w-3 text-gray-500" />
                </button>
              )}
            </button>
          );
        })}
      </div>

      {/* Revert confirmation */}
      {confirmRevert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div
            className="mx-4 max-w-sm rounded-xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar reversao"
          >
            <h4 className="text-base font-semibold text-gray-900">
              Reverter para esta versao?
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              Edicoes posteriores ficarao marcadas como revertidas.
            </p>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmRevert(null)}
                disabled={revertMutation.isPending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => revertMutation.mutate(confirmRevert.id)}
                disabled={revertMutation.isPending}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {revertMutation.isPending ? 'Revertendo...' : 'Reverter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
