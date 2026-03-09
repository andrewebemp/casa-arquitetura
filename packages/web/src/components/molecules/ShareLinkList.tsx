'use client';

import { useState } from 'react';
import { Trash2, Eye, ExternalLink, Loader2 } from 'lucide-react';
import type { ShareLink } from '@decorai/shared';

interface ShareLinkListProps {
  links: ShareLink[];
  onDelete: (shareId: string) => void;
  isDeleting?: boolean;
  shareBaseUrl?: string;
}

export function ShareLinkList({
  links,
  onDelete,
  isDeleting = false,
  shareBaseUrl = '/compartilhar',
}: ShareLinkListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (shareId: string) => {
    if (confirmDeleteId === shareId) {
      onDelete(shareId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(shareId);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isExpired = (link: ShareLink) => {
    if (!link.expires_at) return false;
    return new Date(link.expires_at) < new Date();
  };

  if (links.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500">
        Nenhum link de compartilhamento ativo.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {links.map((link) => {
        const expired = isExpired(link);
        return (
          <div
            key={link.id}
            className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
              expired
                ? 'border-gray-200 bg-gray-50 opacity-60'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <a
                  href={`${shareBaseUrl}/${link.share_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-medium text-brand-600 hover:text-brand-700"
                >
                  {shareBaseUrl}/{link.share_token}
                  <ExternalLink className="ml-1 inline h-3 w-3" />
                </a>
                {expired && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600">
                    Expirado
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                <span>{formatDate(link.created_at)}</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {link.view_count} {link.view_count === 1 ? 'visualizacao' : 'visualizacoes'}
                </span>
                {link.expires_at && (
                  <span>Expira: {formatDate(link.expires_at)}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(link.id)}
              disabled={isDeleting}
              className={`ml-3 flex-shrink-0 rounded-lg p-2 text-sm transition-colors ${
                confirmDeleteId === link.id
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'text-gray-400 hover:bg-red-50 hover:text-red-600'
              } disabled:opacity-50`}
              aria-label={
                confirmDeleteId === link.id
                  ? 'Confirmar exclusao'
                  : 'Excluir link'
              }
            >
              {isDeleting && confirmDeleteId === link.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
