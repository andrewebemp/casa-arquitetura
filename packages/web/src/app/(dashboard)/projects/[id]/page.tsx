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
import { EditingToolbar } from '@/components/molecules/EditingToolbar';
import { ImageCanvas } from '@/components/molecules/ImageCanvas';
import { MaterialPicker } from '@/components/molecules/MaterialPicker';
import { LightingPanel } from '@/components/molecules/LightingPanel';
import { ObjectRemovalPanel } from '@/components/molecules/ObjectRemovalPanel';
import { EditVersionTimeline } from '@/components/molecules/EditVersionTimeline';
import { QuotaIndicator } from '@/components/molecules/QuotaIndicator';
import { ToastContainer } from '@/components/molecules/ToastContainer';
import { useToast } from '@/hooks/use-toast';
import { useEditingProgress } from '@/hooks/use-editing-progress';
import { segmentAtPoint, segmentAll, detectObject, removeObject } from '@/services/editing-service';
import { getVersions } from '@/services/chat-service';
import { getSliderData } from '@/services/share-service';
import type { SliderData } from '@/services/share-service';
import type { EditingTool } from '@/hooks/use-editing-store';
import type { SegmentResult, DetectObjectResponse } from '@/services/editing-service';
import type { NormalizedCoords } from '@/components/molecules/ImageCanvas';
import { AiDisclaimer } from '@/components/atoms/AiDisclaimer';
import { Loader2, X } from 'lucide-react';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const { toasts, showToast, dismissToast } = useToast();

  // View state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<ProjectVersion | null>(null);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Editing state
  const [editMode, setEditMode] = useState(false);
  const [activeTool, setActiveTool] = useState<EditingTool>(null);
  const [segments, setSegments] = useState<SegmentResult[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [removeMasks, setRemoveMasks] = useState<DetectObjectResponse[]>([]);
  const [pendingRemoval, setPendingRemoval] = useState<DetectObjectResponse | null>(null);
  const [quotaDepleted, setQuotaDepleted] = useState(false);
  const [operationActive, setOperationActive] = useState(false);

  // Realtime progress
  const editingProgress = useEditingProgress({
    projectId,
    enabled: operationActive,
    onComplete: () => {
      setOperationActive(false);
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['edit-history', projectId] });
      queryClient.invalidateQueries({ queryKey: ['quota', projectId] });
    },
    onError: (message) => {
      setOperationActive(false);
      showToast(message, 'error');
    },
  });

  // Data queries
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

  // Handlers: version navigation
  const handleVersionSelect = useCallback((versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (version) setPreviewVersion(version);
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

  const handleCompare = useCallback(() => setSliderOpen(true), []);
  const handleShare = useCallback(() => setShareOpen(true), []);

  // Handlers: edit mode
  const handleEnterEditMode = useCallback(() => {
    setEditMode(true);
    setActiveTool('segment');
  }, []);

  const handleExitEditMode = useCallback(() => {
    setEditMode(false);
    setActiveTool(null);
    setSegments([]);
    setSelectedSegmentId(null);
    setRemoveMasks([]);
    setPendingRemoval(null);
  }, []);

  const handleSelectTool = useCallback((tool: EditingTool) => {
    setActiveTool(tool);
    setSelectedSegmentId(null);
    setPendingRemoval(null);
    if (tool !== 'segment') setSegments([]);
    if (tool !== 'removal') setRemoveMasks([]);
  }, []);

  // Handlers: image interactions
  const handleImageClick = useCallback(async (coords: NormalizedCoords) => {
    if (!activeTool || quotaDepleted) return;

    if (activeTool === 'segment') {
      try {
        setOperationActive(true);
        const result = await segmentAtPoint(projectId, coords.x, coords.y);
        setSegments((prev) => {
          const existingIds = new Set(prev.map((s) => s.segment_id));
          const newSegments = result.segments.filter((s) => !existingIds.has(s.segment_id));
          return [...prev, ...newSegments];
        });
        if (result.segments.length > 0) {
          setSelectedSegmentId(result.segments[0].segment_id);
        }
        setOperationActive(false);
      } catch (error) {
        setOperationActive(false);
        showToast(error instanceof Error ? error.message : 'Falha ao segmentar', 'error');
      }
    } else if (activeTool === 'removal') {
      if (removeMasks.length >= 10) {
        showToast('Maximo de 10 objetos por vez', 'warning');
        return;
      }
      try {
        setOperationActive(true);
        const result = await detectObject(projectId, coords.x, coords.y);
        // If there's already a pending object, add it to the batch list
        if (pendingRemoval) {
          setRemoveMasks((prev) => {
            if (prev.some((m) => m.mask_id === pendingRemoval.mask_id)) return prev;
            return [...prev, pendingRemoval];
          });
        }
        setPendingRemoval(result);
        setOperationActive(false);
      } catch (error) {
        setOperationActive(false);
        showToast(error instanceof Error ? error.message : 'Falha ao detectar objeto', 'error');
      }
    }
  }, [activeTool, projectId, quotaDepleted, removeMasks.length, pendingRemoval, showToast]);

  const handleSegmentClick = useCallback((segmentId: string) => {
    setSelectedSegmentId(segmentId);
  }, []);

  const handleDetectAll = useCallback(async () => {
    try {
      setOperationActive(true);
      const result = await segmentAll(projectId);
      setSegments(result.segments);
      setOperationActive(false);
    } catch (error) {
      setOperationActive(false);
      showToast(error instanceof Error ? error.message : 'Falha ao detectar elementos', 'error');
    }
  }, [projectId, showToast]);

  // Handlers: pending removal confirm/cancel (AC-6)
  const handleConfirmSingleRemoval = useCallback(async () => {
    if (!pendingRemoval) return;
    try {
      setOperationActive(true);
      await removeObject(projectId, pendingRemoval.mask_id);
      setPendingRemoval(null);
      showToast('Objeto removido com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['edit-history', projectId] });
      queryClient.invalidateQueries({ queryKey: ['quota', projectId] });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Falha ao remover objeto', 'error');
    } finally {
      setOperationActive(false);
    }
  }, [pendingRemoval, projectId, showToast, queryClient]);

  const handleCancelPendingRemoval = useCallback(() => {
    setPendingRemoval(null);
  }, []);

  // Handlers: operations completed
  const handleMaterialApplied = useCallback(() => {
    setOperationActive(true);
    showToast('Material atualizado com sucesso!', 'success');
    setSelectedSegmentId(null);
  }, [showToast]);

  const handleLightingApplied = useCallback(() => {
    setOperationActive(true);
    showToast('Iluminacao melhorada!', 'success');
  }, [showToast]);

  const handleObjectsRemoved = useCallback(() => {
    setOperationActive(true);
    showToast('Objeto removido com sucesso!', 'success');
    setRemoveMasks([]);
  }, [showToast]);

  const handleEditPreview = useCallback((_editId: string, versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (version) setPreviewVersion(version);
  }, [versions]);

  const handleEditReverted = useCallback(() => {
    setPreviewVersion(null);
    queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
    queryClient.invalidateQueries({ queryKey: ['edit-history', projectId] });
  }, [queryClient, projectId]);

  const selectedSegment = segments.find((s) => s.segment_id === selectedSegmentId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Main content area */}
      <div className={`flex flex-1 flex-col p-4 ${editMode ? 'md:flex-row' : 'md:w-3/5 md:flex-none'}`}>
        {/* Editing toolbar - left sidebar on desktop, bottom bar on mobile */}
        {editMode && (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-2 md:relative md:mr-3 md:border-t-0 md:bg-transparent md:p-0">
            <div className="flex justify-center gap-1 md:block">
              <EditingToolbar
                activeTool={activeTool}
                onSelectTool={handleSelectTool}
                onExitEditing={handleExitEditMode}
                disabled={quotaDepleted}
              />
            </div>
          </div>
        )}

        {/* Image area */}
        <div className="flex flex-1 flex-col">
          {/* Quota indicator and detect all button in edit mode */}
          {editMode && (
            <div className="mb-2 flex items-center justify-between">
              <QuotaIndicator
                projectId={projectId}
                onQuotaDepleted={setQuotaDepleted}
              />
              {activeTool === 'segment' && (
                <button
                  type="button"
                  onClick={handleDetectAll}
                  disabled={quotaDepleted || editingProgress.isProcessing}
                  className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50"
                >
                  Detectar Todos
                </button>
              )}
            </div>
          )}

          {editMode ? (
            <div className="relative flex-1">
              <ImageCanvas
                imageUrl={currentImageUrl}
                segments={segments}
                selectedSegmentId={selectedSegmentId}
                removeMasks={[...removeMasks, ...(pendingRemoval ? [pendingRemoval] : [])]}
                isProcessing={editingProgress.isProcessing}
                progressStage={editingProgress.stage}
                progress={editingProgress.progress}
                onImageClick={handleImageClick}
                onSegmentClick={handleSegmentClick}
              />

              {/* AC-6: Pending object confirm/cancel overlay */}
              {pendingRemoval && !editingProgress.isProcessing && (
                <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmSingleRemoval}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-red-700"
                  >
                    Remover
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPendingRemoval}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-lg transition-colors hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <RenderViewer
              imageUrl={currentImageUrl}
              onToggleHistory={() => setHistoryOpen(!historyOpen)}
              onCompare={handleCompare}
              onShare={handleShare}
              onEditElements={handleEnterEditMode}
            />
          )}

          {/* Edit version timeline */}
          {editMode && (
            <EditVersionTimeline
              projectId={projectId}
              onPreview={handleEditPreview}
              onReverted={handleEditReverted}
            />
          )}
        </div>
      </div>

      {/* Side panel: Chat or Editing panel */}
      {editMode ? (
        <div className="fixed inset-x-0 bottom-14 z-30 max-h-[50vh] overflow-y-auto rounded-t-2xl border-t border-gray-200 bg-white shadow-xl md:relative md:inset-auto md:bottom-auto md:z-auto md:max-h-none md:w-80 md:rounded-none md:border-l md:border-t-0 md:shadow-none">
          {activeTool === 'segment' && selectedSegment && (
            <MaterialPicker
              projectId={projectId}
              segmentId={selectedSegment.segment_id}
              segmentLabel={selectedSegment.label_pt}
              onClose={() => setSelectedSegmentId(null)}
              onApplied={handleMaterialApplied}
              onError={(msg) => showToast(msg, 'error')}
            />
          )}

          {activeTool === 'segment' && !selectedSegment && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-sm text-gray-500">
                Clique em um elemento na imagem para segmenta-lo
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Ou use &quot;Detectar Todos&quot; para identificar todos os elementos
              </p>
            </div>
          )}

          {activeTool === 'lighting' && (
            <LightingPanel
              projectId={projectId}
              onClose={() => setActiveTool(null)}
              onApplied={handleLightingApplied}
              onError={(msg) => showToast(msg, 'error')}
            />
          )}

          {activeTool === 'removal' && (
            <ObjectRemovalPanel
              projectId={projectId}
              selectedObjects={removeMasks}
              onDeselectObject={(maskId) => setRemoveMasks((prev) => prev.filter((m) => m.mask_id !== maskId))}
              onClearAll={() => setRemoveMasks([])}
              onClose={() => setActiveTool(null)}
              onApplied={handleObjectsRemoved}
              onError={(msg) => showToast(msg, 'error')}
            />
          )}
        </div>
      ) : (
        <div className="h-[50vh] border-t border-gray-200 md:h-auto md:w-2/5 md:border-l md:border-t-0">
          <ChatPanel
            projectId={projectId}
            onVersionSelect={handleVersionSelect}
            onNewVersion={handleNewVersion}
          />
        </div>
      )}

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
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <BeforeAfterSlider
              beforeUrl={sliderData.original_url}
              afterUrl={sliderData.rendered_url}
              className="max-h-full max-w-full rounded-lg"
            />
            <AiDisclaimer className="mt-2 text-center text-white/60" />
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

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
