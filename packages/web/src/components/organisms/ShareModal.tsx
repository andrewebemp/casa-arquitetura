'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Link2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { BeforeAfterSlider } from '@/components/molecules/BeforeAfterSlider';
import { SocialShareButtons } from '@/components/molecules/SocialShareButtons';
import { ShareLinkList } from '@/components/molecules/ShareLinkList';
import {
  createShareLink,
  getShareLinks,
  deleteShareLink,
} from '@/services/share-service';
import type { ShareLink } from '@decorai/shared';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  beforeUrl: string;
  afterUrl: string;
  versionId?: string;
  isFreeTier?: boolean;
}

export function ShareModal({
  open,
  onClose,
  projectId,
  projectName,
  beforeUrl,
  afterUrl,
  versionId,
  isFreeTier = false,
}: ShareModalProps) {
  const queryClient = useQueryClient();
  const [showLinkList, setShowLinkList] = useState(false);

  const { data: shareLinks = [] } = useQuery({
    queryKey: ['shares', projectId],
    queryFn: () => getShareLinks(projectId),
    enabled: open,
  });

  const activeLink = shareLinks.find((link: ShareLink) => {
    if (link.expires_at && new Date(link.expires_at) < new Date()) return false;
    if (versionId && link.version_id !== versionId) return false;
    return true;
  });

  const createMutation = useMutation({
    mutationFn: () => createShareLink(projectId, { version_id: versionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shares', projectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (shareId: string) => deleteShareLink(projectId, shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shares', projectId] });
    },
  });

  const handleCreateLink = useCallback(() => {
    createMutation.mutate();
  }, [createMutation]);

  const currentShareToken = activeLink?.share_token ?? createMutation.data?.share_token;
  const shareUrl = currentShareToken
    ? `${window.location.origin}/compartilhar/${currentShareToken}`
    : null;

  // Auto-create link when modal opens and no active link exists
  const needsAutoCreate = open && !activeLink && !createMutation.isPending && !createMutation.data;
  if (needsAutoCreate) {
    handleCreateLink();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Compartilhar projeto"
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">Compartilhar</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {/* Mini slider preview */}
          <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
            <BeforeAfterSlider
              beforeUrl={beforeUrl}
              afterUrl={afterUrl}
              className="aspect-video w-full"
            />
          </div>

          {/* Share link */}
          {shareUrl ? (
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Link de compartilhamento
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {shareUrl}
              </div>
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-center py-3">
              <span className="text-sm text-gray-500">Gerando link...</span>
            </div>
          )}

          {/* Watermark warning for free tier */}
          {isFreeTier && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">
                Imagens compartilhadas no plano gratuito incluem marca d&apos;agua.
                Faca upgrade para compartilhar sem marca d&apos;agua.
              </p>
            </div>
          )}

          {/* Social share buttons */}
          {shareUrl && (
            <div className="mb-4">
              <SocialShareButtons shareUrl={shareUrl} projectName={projectName} />
            </div>
          )}

          {/* Link management section */}
          <div className="border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={() => setShowLinkList(!showLinkList)}
              className="flex w-full items-center justify-between py-1 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <span>Gerenciar links ({shareLinks.length})</span>
              {showLinkList ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showLinkList && (
              <div className="mt-2">
                <ShareLinkList
                  links={shareLinks}
                  onDelete={(shareId) => deleteMutation.mutate(shareId)}
                  isDeleting={deleteMutation.isPending}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
