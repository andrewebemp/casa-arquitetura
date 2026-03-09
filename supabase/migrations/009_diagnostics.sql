-- ============================================================
-- DecorAI Brasil — Migration 009: Diagnostics
-- Reverse staging (freemium funnel)
-- Ref: FR-12, FR-13
-- ============================================================

CREATE TABLE diagnostics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  original_image_url TEXT NOT NULL,
  staged_preview_url TEXT,
  analysis JSONB NOT NULL DEFAULT '{}',
  session_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_diagnostics_user_id ON diagnostics(user_id);
CREATE INDEX idx_diagnostics_session ON diagnostics(session_token);

ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own diagnostics" ON diagnostics
  FOR SELECT USING (auth.uid() = user_id OR session_token IS NOT NULL);
CREATE POLICY "Anyone inserts diagnostics" ON diagnostics
  FOR INSERT WITH CHECK (true);
