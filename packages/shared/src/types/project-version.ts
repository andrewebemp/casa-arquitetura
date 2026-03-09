export interface QualityScores {
  fid: number | null;
  ssim: number | null;
  lpips: number | null;
  clip_score: number | null;
}

export interface VersionMetadata {
  depth_map_url: string | null;
  conditioning_params: Record<string, unknown>;
  gpu_provider: string;
  generation_time_ms: number;
  cost_cents: number;
  resolution: { width: number; height: number };
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: number;
  image_url: string;
  thumbnail_url: string;
  prompt: string;
  refinement_command: string | null;
  quality_scores: QualityScores | null;
  metadata: VersionMetadata;
  created_at: string;
}
