import { createClient } from '@/lib/supabase/client';

// --- Types ---

export interface SegmentResult {
  segment_id: string;
  label: string;
  label_pt: string;
  mask_polygon: number[][];
  color: string;
  confidence: number;
}

export interface SegmentResponse {
  segments: SegmentResult[];
  job_id: string;
}

export interface MaterialSuggestion {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string | null;
  color: string;
}

export interface MaterialsResponse {
  materials: MaterialSuggestion[];
}

export interface ApplyMaterialResponse {
  job_id: string;
  version_id: string;
}

export interface LightingAnalysis {
  brightness_score: number;
  job_id: string;
}

export interface EnhanceLightingResponse {
  job_id: string;
  version_id: string;
}

export interface DetectObjectResponse {
  mask_id: string;
  label: string;
  mask_polygon: number[][];
  confidence: number;
}

export interface RemoveObjectResponse {
  job_id: string;
  version_id: string;
}

export interface BatchRemoveResponse {
  job_id: string;
  version_id: string;
}

export interface QuotaResponse {
  renders_remaining: number;
  renders_limit: number;
  renders_used: number;
  tier: string;
}

export interface EditHistoryItem {
  id: string;
  type: 'material_swap' | 'lighting' | 'object_removal';
  description: string;
  thumbnail_url: string | null;
  version_id: string;
  created_at: string;
  reverted: boolean;
}

export interface EditHistoryResponse {
  edits: EditHistoryItem[];
}

export type LightingMode = 'auto' | 'natural' | 'warm';

export interface EditingProgressEvent {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  error_message?: string;
}

// --- Helpers ---

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return {
    'Authorization': `Bearer ${session?.access_token ?? ''}`,
    'Content-Type': 'application/json',
  };
}

function apiUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL ?? ''}${path}`;
}

// --- Segmentation ---

export async function segmentAtPoint(
  projectId: string,
  x: number,
  y: number
): Promise<SegmentResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/segment`),
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ x, y }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao segmentar elemento');
  }

  return response.json();
}

export async function segmentAll(
  projectId: string
): Promise<SegmentResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/segment/all`),
    {
      method: 'POST',
      headers,
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao detectar todos os elementos');
  }

  return response.json();
}

export async function getMaterials(
  projectId: string,
  segmentId: string
): Promise<MaterialsResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/segment/${segmentId}/materials`),
    { headers }
  );

  if (!response.ok) {
    throw new Error('Falha ao carregar materiais');
  }

  return response.json();
}

export async function applyMaterial(
  projectId: string,
  segmentId: string,
  materialDescriptor: string
): Promise<ApplyMaterialResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/segment/apply`),
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ segment_id: segmentId, material_descriptor: materialDescriptor }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao aplicar material');
  }

  return response.json();
}

// --- Lighting ---

export async function analyzeLighting(
  projectId: string
): Promise<LightingAnalysis> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/enhance-lighting`),
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ analyze_only: true }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao analisar iluminacao');
  }

  return response.json();
}

export async function enhanceLighting(
  projectId: string,
  mode: LightingMode
): Promise<EnhanceLightingResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/enhance-lighting`),
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ mode, auto_enhance: true }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao melhorar iluminacao');
  }

  return response.json();
}

// --- Object Removal ---

export async function detectObject(
  projectId: string,
  x: number,
  y: number
): Promise<DetectObjectResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/remove-object`),
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ x, y }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao detectar objeto');
  }

  return response.json();
}

export async function removeObject(
  projectId: string,
  maskId: string
): Promise<RemoveObjectResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/remove-object/apply`),
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ mask_id: maskId }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao remover objeto');
  }

  return response.json();
}

export async function batchRemoveObjects(
  projectId: string,
  maskIds: string[]
): Promise<BatchRemoveResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/remove-object/batch`),
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ mask_ids: maskIds }),
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao remover objetos em lote');
  }

  return response.json();
}

// --- Quota ---

export async function getQuota(
  projectId: string
): Promise<QuotaResponse> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/quota`),
    { headers }
  );

  if (!response.ok) {
    throw new Error('Falha ao verificar creditos');
  }

  return response.json();
}

// --- Edit History ---

export async function getEditHistory(
  projectId: string
): Promise<EditHistoryItem[]> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/edits`),
    { headers }
  );

  if (!response.ok) {
    throw new Error('Falha ao carregar historico de edicoes');
  }

  const data = await response.json();
  return data.edits ?? data;
}

export async function revertToEdit(
  projectId: string,
  editId: string
): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    apiUrl(`/api/projects/${projectId}/edits/${editId}/revert`),
    {
      method: 'POST',
      headers,
    }
  );

  if (!response.ok) {
    throw new Error('Falha ao reverter edicao');
  }
}

// --- Realtime Progress ---

export function subscribeToEditingProgress(
  projectId: string,
  onEvent: (event: EditingProgressEvent) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel(`editing:${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'render_jobs',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        const job = payload.new as Record<string, unknown>;
        const status = job.status as string;
        const outputParams = job.output_params as Record<string, unknown> | null;

        if (status === 'completed') {
          onEvent({ status: 'completed', progress: 100, stage: 'Concluido!' });
        } else if (status === 'failed') {
          onEvent({
            status: 'failed',
            progress: 0,
            stage: '',
            error_message: (job.error_message as string) ?? 'Erro desconhecido',
          });
        } else if (status === 'processing') {
          onEvent({
            status: 'processing',
            progress: (outputParams?.progress as number) ?? 0,
            stage: (outputParams?.stage as string) ?? 'Processando...',
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
