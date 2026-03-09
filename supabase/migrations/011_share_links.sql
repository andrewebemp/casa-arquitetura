-- ============================================================
-- DecorAI Brasil — Migration 011: Share Links
-- Ref: FR-10, FR-11
-- ============================================================

CREATE TABLE share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES project_versions(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  include_watermark BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_share_token ON share_links(share_token);

ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads shares" ON share_links
  FOR SELECT USING (true);
CREATE POLICY "Users create own shares" ON share_links
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = share_links.project_id AND projects.user_id = auth.uid())
  );
