export const QUALITY_TAGS = [
  'realistic',
  'style_match',
  'lighting',
  'furniture_quality',
  'composition',
] as const;

export type QualityTag = (typeof QUALITY_TAGS)[number];

export interface RenderRating {
  id: string;
  render_id: string;
  user_id: string;
  score: number;
  tags: QualityTag[];
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface NpsResponse {
  id: string;
  user_id: string;
  score: number;
  comment: string | null;
  user_tier: string;
  total_renders: number;
  created_at: string;
}

export interface RatingAnalytics {
  average_score: number;
  total_ratings: number;
  distribution: Record<number, number>;
  by_style: Record<string, { average: number; count: number }>;
  by_tag: Record<string, { frequency: number; average_score: number }>;
}

export interface NpsAnalytics {
  nps_score: number;
  total_responses: number;
  promoters: number;
  passives: number;
  detractors: number;
  distribution: Record<number, number>;
  themes: string[];
}
