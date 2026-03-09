-- ====================================================
-- DecorAI Brasil - Migration 015: Render Ratings
-- Feedback de qualidade por render
-- Ref: Story 9.1, NFR-15, USM-02
-- ====================================================

CREATE TABLE render_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  render_id UUID NOT NULL REFERENCES render_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  tags TEXT[] NOT NULL DEFAULT '{}',
  comment TEXT,
  created_at TIMESTAMPTz NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(render_id, user_id)
);

CREATE INDEX idx_ratings_render_id ON render_ratings(render_id);
CREATE INDEX idx_ratings_user_id ON render_ratings(user_id);
CREATE INDEX idx_ratings_created_at ON render_ratings(created_at DESC);

ALTER TABLE render_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own ratings" ON render_ratings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own ratings" ON render_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ratings" ON render_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_render_ratings_updated
  BEFORE UPDATE ON render_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
