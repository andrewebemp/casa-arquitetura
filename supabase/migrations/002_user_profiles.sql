-- ============================================================
-- DecorAI Brasil — Migration 002: User Profiles
-- Extends Supabase Auth (auth.users)
-- Ref: FR-14, FR-15, NFR-08, NFR-09
-- ============================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  preferred_style TEXT CHECK (preferred_style IN (
    'moderno', 'industrial', 'minimalista', 'classico', 'escandinavo',
    'rustico', 'tropical', 'contemporaneo', 'boho', 'luxo'
  )),
  lgpd_consent_at TIMESTAMPTZ,
  training_opt_in BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: usuarios veem apenas seus proprios dados
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
