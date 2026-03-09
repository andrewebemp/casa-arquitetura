-- ====================================================
-- DecorAI Brasil - Migration 016: NPS Responses
-- Net Promoter Score survey responses
-- Ref: Story 9.1, USM-05
-- ====================================================

CREATE TABLE nps_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  comment TEXT,
  user_tier TEXT NOT NULL DEFAULT 'free',
  total_renders INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_nps_user_id ON nps_responses(user_id);
CREATE INDEX idx_nps_created_at ON nps_responses(created_at DESC);

ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own nps" ON nps_responses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own nps" ON nps_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
