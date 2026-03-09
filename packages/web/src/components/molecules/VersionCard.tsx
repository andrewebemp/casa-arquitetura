'use client';

import type { ProjectVersion } from '@decorai/shared';

interface VersionCardProps {
  version: ProjectVersion;
  isActive: boolean;
  onPreview: (version: ProjectVersion) => void;
  onRevert: (version: ProjectVersion) => void;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `ha ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `ha ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `ha ${days} dia${days > 1 ? 's' : ''}`;
}

export function VersionCard({ version, isActive, onPreview, onRevert }: VersionCardProps) {
  return (
    <div
      className={`relative flex gap-3 rounded-lg border p-3 transition-colors ${
        isActive
          ? 'border-brand-300 bg-brand-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <button
        type="button"
        onClick={() => onPreview(version)}
        className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100"
        aria-label={`Visualizar versao v${version.version_number}`}
      >
        {version.thumbnail_url ? (
          <img
            src={version.thumbnail_url}
            alt={`Versao v${version.version_number}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            v{version.version_number}
          </div>
        )}
      </button>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              v{version.version_number}
            </span>
            {isActive && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                Atual
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {version.refinement_command ?? 'Versao inicial'}
          </p>
          <p className="text-xs text-gray-400">
            {formatRelativeTime(version.created_at)}
          </p>
        </div>

        {!isActive && (
          <button
            type="button"
            onClick={() => onRevert(version)}
            className="mt-1 self-start text-xs font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            Restaurar esta versao
          </button>
        )}
      </div>
    </div>
  );
}
