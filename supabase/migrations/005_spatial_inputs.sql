-- ============================================================
-- DecorAI Brasil — Migration 005: Spatial Inputs
-- Medidas, croqui, aberturas
-- Ref: FR-24, FR-25, FR-26, FR-29, FR-30, FR-31, FR-32
-- ============================================================

CREATE TABLE spatial_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  dimensions JSONB,
  openings JSONB NOT NULL DEFAULT '[]',
  items JSONB NOT NULL DEFAULT '[]',
  croqui_ascii TEXT,
  croqui_approved BOOLEAN NOT NULL DEFAULT false,
  photo_interpretation JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE spatial_inputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own spatial" ON spatial_inputs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = spatial_inputs.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "Users upsert own spatial" ON spatial_inputs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = spatial_inputs.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "Users update own spatial" ON spatial_inputs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = spatial_inputs.project_id AND projects.user_id = auth.uid())
  );
