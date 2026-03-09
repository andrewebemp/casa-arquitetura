-- ============================================================
-- DecorAI Brasil — Migration 006: Reference Items
-- Fotos de referencia
-- Ref: FR-25, FR-26
-- ============================================================

CREATE TABLE reference_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  width_m NUMERIC(5,2),
  depth_m NUMERIC(5,2),
  height_m NUMERIC(5,2),
  material TEXT,
  color TEXT,
  position_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reference_items_project ON reference_items(project_id);

ALTER TABLE reference_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own references" ON reference_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = reference_items.project_id AND projects.user_id = auth.uid())
  );
