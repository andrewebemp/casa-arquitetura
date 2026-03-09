export interface ShareLink {
  id: string;
  project_id: string;
  version_id: string;
  share_token: string;
  include_watermark: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
}
