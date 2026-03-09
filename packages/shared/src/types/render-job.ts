export type RenderJobType = 'initial' | 'refinement' | 'style_change' | 'segmentation' | 'diagnostic' | 'upscale' | 'lighting_enhancement' | 'object_removal';
export type RenderJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'canceled';

export interface RenderJobOutputParams {
  result_image_url?: string;
  original_image_url?: string;
  processed_image_url?: string | null;
  depth_map_url?: string;
  metadata?: Record<string, unknown>;
  post_processing_applied?: boolean;
  post_processing_failed?: boolean;
  [key: string]: unknown;
}

export interface RenderJob {
  id: string;
  project_id: string;
  version_id: string | null;
  type: RenderJobType;
  status: RenderJobStatus;
  priority: number;
  input_params: Record<string, unknown>;
  output_params: RenderJobOutputParams | null;
  gpu_provider: string | null;
  cost_cents: number | null;
  duration_ms: number | null;
  error_message: string | null;
  attempts: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
