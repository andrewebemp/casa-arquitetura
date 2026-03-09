'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProjectVersion } from '@decorai/shared';
import { X, Clock } from 'lucide-react';
import { VersionCard } from '@/components/molecules/VersionCard';
import { getVersions, revertVersion } from '@/services/chat-service';

interface VersionTimelineProps {
  projectId: string;
  currentVersionId: string | null;
  open: boolean;
  onClose: () => void;
  onPreview: (version: ProjectVersion) => void;
  onReverted: () => void;
}

export function VersionTimeline({
  projectId,
  currentVersionId,
  open,
  onClose,
  onPreview,
  onReverted,
}: VersionTimelineProps) {
  const queryClient = useQueryClient();
  const [confirmVersion, setConfirmVersion] = useState<ProjectVersion | null>(null);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['versions', projectId],
    queryFn: () => getVersions(projectId),
    enabled: open,
  });

  const revertMutation = useMutation({
    mutationFn: (versionId: string) => revertVersion(projectId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['chat-history', projectId] });
      setConfirmVersion(null);
      onReverted();
    },
  });

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel - drawer on desktop, bottom sheet on mobile */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] rounded-t-2xl bg-white shadow-xl md:absolute md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-80 md:max-h-none md:rounded-none md:rounded-l-xl md:shadow-lg"
        role="dialog"
        aria-label="Historico de versoes"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Clock className="h-4 w-4" />
            Historico de Versoes
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar historico"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(70vh - 56px)' }}>
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          )}

          {!isLoading && versions.length === 0 && (
            <p className="text-center text-sm text-gray-400">Nenhuma versao disponivel</p>
          )}

          <div className="space-y-3">
            {versions.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                isActive={version.id === currentVersionId}
                onPreview={onPreview}
                onRevert={setConfirmVersion}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation dialog */}
      {confirmVersion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div
            className="mx-4 max-w-sm rounded-xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar restauracao"
          >
            <h4 className="text-base font-semibold text-gray-900">
              Restaurar versao v{confirmVersion.version_number}?
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              Uma nova versao sera criada a partir desta.
            </p>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmVersion(null)}
                disabled={revertMutation.isPending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => revertMutation.mutate(confirmVersion.id)}
                disabled={revertMutation.isPending}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                {revertMutation.isPending ? 'Restaurando...' : 'Restaurar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
