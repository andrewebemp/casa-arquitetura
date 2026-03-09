-- ============================================================
-- DecorAI Brasil — Migration 015: LGPD Compliance
-- Ref: NFR-08, NFR-09, Story 8.1
-- ============================================================

-- Add lgpd_consent_version to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS lgpd_consent_version TEXT DEFAULT NULL;

-- Add deleted_at for soft-delete
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Track data export requests (LGPD Art. 18, V)
CREATE TABLE user_data_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  download_url TEXT DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_user_data_exports_user_id ON user_data_exports(user_id);

ALTER TABLE user_data_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own exports" ON user_data_exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own exports" ON user_data_exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
