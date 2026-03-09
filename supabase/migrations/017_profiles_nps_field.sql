-- ====================================================
-- DecorAI Brasil - Migration 017: Add NPS tracking to profiles
-- Ref: Story 9.1, AC3
-- ====================================================

ALTER TABLE user_profiles ADD COLUMN nps_last_prompted_at TIMESTAMPTZ;
