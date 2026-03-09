-- ============================================================
-- DecorAI Brasil — Migration 003: Projects
-- Ref: FR-01, FR-02, FR-03, FR-15, FR-24, FR-26
-- ============================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Novo Projeto',
  input_type TEXT NOT NULL CHECK (input_type IN ('photo', 'text', 'combined')),
  style TEXT NOT NULL CHECK (style IN (
    'moderno', 'industrial', 'minimalista', 'classico', 'escandinavo',
    'rustico', 'tropical', 'contemporaneo', 'boho', 'luxo'
  )),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'analyzing', 'croqui_review', 'generating', 'ready', 'error'
  )),
  room_type TEXT CHECK (room_type IN (
    'sala', 'quarto', 'cozinha', 'banheiro', 'escritorio', 'varanda', 'outro'
  )),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  original_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);
