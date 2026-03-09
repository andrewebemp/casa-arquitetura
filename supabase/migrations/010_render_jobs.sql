-- ============================================================
-- DecorAI Brasil — Migration 010: Render Jobs
-- Fila de processamento GPU
-- Ref: FR-19, NFR-01, NFR-04, NFR-06
-- ============================================================

CREATE TABLE render_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id UUID REFERENCES project_versions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'initial', 'refinement', 'style_change', 'segmentation', 'diagnostic', 'upscale'
  )),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'processing', 'completed', 'failed', 'canceled'
  )),
  priority INTEGER NOT NULL DEFAULT 0,
  input_params JSONB NOT NULL DEFAULT '{}',
  output_params JSONB,
  gpu_provider TEXT,
  cost_cents INTEGER,
  duration_ms INTEGER,
  error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_project_id ON render_jobs(project_id);
CREATE INDEX idx_jobs_status ON render_jobs(status);
CREATE INDEX idx_jobs_created_at ON render_jobs(created_at DESC);

ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own jobs" ON render_jobs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = render_jobs.project_id AND projects.user_id = auth.uid())
  );
