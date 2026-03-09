-- ============================================================
-- DecorAI Brasil — Migration 004: Project Versions
-- Historico de renders
-- Ref: FR-03, FR-20, FR-27
-- ============================================================

CREATE TABLE project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  refinement_command TEXT,
  quality_scores JSONB DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, version_number)
);

CREATE INDEX idx_versions_project_id ON project_versions(project_id);
CREATE INDEX idx_versions_created_at ON project_versions(created_at DESC);

ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own versions" ON project_versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_versions.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "Service inserts versions" ON project_versions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_versions.project_id AND projects.user_id = auth.uid())
  );
