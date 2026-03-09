'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectVersion } from '@decorai/shared';
import { RenderViewer } from '@/components/molecules/RenderViewer';
import { ChatPanel } from '@/components/organisms/ChatPanel';
import { VersionTimeline } from '@/components/organisms/VersionTimeline';
import { getVersions } from '@/services/chat-service';
import { Loader2 } from 'lucide-react';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<ProjectVersion | null>(null);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['versions', projectId],
    queryFn: () => getVersions(projectId),
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
    </div>
  );
}
