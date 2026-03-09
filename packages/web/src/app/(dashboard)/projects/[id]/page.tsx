'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectVersion } from '@decorai/shared';
import { RenderViewer } from '@/components/molecules/RenderViewer';
import { BeforeAfterSlider } from '@/components/molecules/BeforeAfterSlider';
import { ChatPanel } from '@/components/organisms/ChatPanel';
import { VersionTimeline } from '@/components/organisms/VersionTimeline';
import { ShareModal } from '@/components/organisms/ShareModal';
import { getVersions } from '@/services/chat-service';
import { getSliderData } from '@/services/share-service';
import type { SliderData } from '@/services/share-service';
import { Loader2, X } from 'lucide-react';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<ProjectVersion | null>(null);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['versions', projectId],
    queryFn: () => getVersions(projectId),
  });

  const { data: sliderData } = useQuery<SliderData>({
    queryKey: ['slider-data', projectId, previewVersion?.id],
    queryFn: () => getSliderData(projectId, previewVersion?.id),
    enabled: sliderOpen || shareOpen,
  });

  const latestVersion = versions.length > 0 ? versions[0] : null;
  const displayVersion = previewVersion ?? latestVersion;
  const currentImageUrl = displayVersion?.image_url ?? null;
  const currentVersionId = latestVersion?.id ?? null;

  const handleVersionSelect = useCallback((versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (version) {
      setPreviewVersion(version);
    }
  }, [versions]);

  const handleVersionPreview = useCallback((version: ProjectVersion) => {
    setPreviewVersion(version);
  }, []);

  const handleNewVersion = useCallback(() => {
    setPreviewVersion(null);
    queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
  }, [queryClient, projectId]);

  const handleReverted = useCallback(() => {
    setPreviewVersion(null);
    setHistoryOpen(false);
    queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
  }, [queryClient, projectId]);

  const handleCompare = useCallback(() => {
    setSliderOpen(true);
  }, []);

  const handleShare = useCallback(() => {
    setShareOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Render Viewer - 60% on desktop, top on mobile */}
      <div className="flex-1 p-4 md:w-3/5 md:flex-none">
        <RenderViewer
          imageUrl={currentImageUrl}
          onToggleHistory={() => setHistoryOpen(!historyOpen)}
          onCompare={handleCompare}
          onShare={handleShare}
        />
      </div>

      {/* Chat Panel - 40% on desktop, bottom on mobile */}
      <div className="h-[50vh] border-t border-gray-200 md:h-auto md:w-2/5 md:border-l md:border-t-0">
        <ChatPanel
          projectId={projectId}
          onVersionSelect={handleVersionSelect}
          onNewVersion={handleNewVersion}
        />
      </div>

      {/* Version Timeline (drawer/bottom sheet) */}
      <VersionTimeline
        projectId={projectId}
        currentVersionId={currentVersionId}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onPreview={handleVersionPreview}
        onReverted={handleReverted}
      />

      {/* Before/After Slider Overlay */}
      {sliderOpen && sliderData && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-semibold text-white">
              Comparar Antes/Depois
            </h2>
            <button
              type="button"
              onClick={() => setSliderOpen(false)}
              className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Fechar comparacao"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center p-4">
            <BeforeAfterSlider
              beforeUrl={sliderData.original_url}
              afterUrl={sliderData.rendered_url}
              className="max-h-full max-w-full rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        projectId={projectId}
        projectName={sliderData?.project_name ?? 'Projeto'}
        beforeUrl={sliderData?.original_url ?? ''}
        afterUrl={sliderData?.rendered_url ?? currentImageUrl ?? ''}
        versionId={displayVersion?.id}
        isFreeTier={false}
      />
    </div>
  );
}
