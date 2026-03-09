-- ============================================================================
-- DecorAI Brasil — Initial Schema Migration
-- Version: 1.0.0
-- Author: Dara (@data-engineer)
-- Date: 2026-03-09
--
-- Creates all tables, enums, constraints, indexes, and triggers.
-- Designed for PostgreSQL 15+ on Supabase.
--
-- Rollback: See 00001_initial_schema_rollback.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE input_type AS ENUM ('photo', 'text', 'combined');
CREATE TYPE project_status AS ENUM ('draft', 'analyzing', 'croqui_review', 'generating', 'ready', 'error');
CREATE TYPE decor_style AS ENUM ('moderno', 'industrial', 'minimalista', 'classico', 'escandinavo', 'rustico', 'tropical', 'contemporaneo', 'boho', 'luxo');
CREATE TYPE chat_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'business');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE payment_gateway AS ENUM ('stripe', 'asaas');
CREATE TYPE render_job_type AS ENUM ('initial', 'refinement', 'style_change', 'segmentation', 'diagnostic', 'upscale');
CREATE TYPE render_job_status AS ENUM ('queued', 'processing', 'completed', 'failed', 'canceled');

-- ============================================================================
-- 2. HELPER FUNCTION: auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- 3.1 user_profiles (extends auth.users)
-- Ref: FR-14, FR-15, NFR-08, NFR-09
CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  preferred_style decor_style,
  lgpd_consent_at TIMESTAMPTZ,
  training_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_profiles IS 'Extended user profile data. 1:1 with auth.users.';
COMMENT ON COLUMN user_profiles.lgpd_consent_at IS 'LGPD consent timestamp (NFR-08). NULL = no consent.';
COMMENT ON COLUMN user_profiles.training_opt_in IS 'Opt-in for image training (NFR-09). Default false.';

-- 3.2 projects
-- Ref: FR-01, FR-02, FR-03, FR-15, FR-24, FR-26
CREATE TABLE projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL DEFAULT 'Novo Projeto',
  input_type        input_type NOT NULL DEFAULT 'photo',
  style             decor_style NOT NULL DEFAULT 'moderno',
  status            project_status NOT NULL DEFAULT 'draft',
  is_favorite       BOOLEAN NOT NULL DEFAULT FALSE,
  original_image_url TEXT,
  room_type         TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT projects_room_type_check CHECK (
    room_type IS NULL OR room_type IN ('sala', 'quarto', 'cozinha', 'banheiro', 'escritorio', 'varanda', 'area_externa')
  )
);

COMMENT ON TABLE projects IS 'User decoration projects. Core aggregate root.';

-- 3.3 project_versions
-- Ref: FR-03, FR-20, FR-27
CREATE TABLE project_versions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number    INTEGER NOT NULL,
  image_url         TEXT NOT NULL,
  thumbnail_url     TEXT NOT NULL,
  prompt            TEXT NOT NULL,
  refinement_command TEXT,
  quality_scores    JSONB,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT project_versions_unique_number UNIQUE (project_id, version_number),
  CONSTRAINT project_versions_version_positive CHECK (version_number > 0)
);

COMMENT ON TABLE project_versions IS 'Render history with images, prompts, and quality metrics.';
COMMENT ON COLUMN project_versions.quality_scores IS 'JSON: {fid, ssim, lpips, clip_score}';
COMMENT ON COLUMN project_versions.metadata IS 'JSON: {depth_map_url, conditioning_params, gpu_provider, generation_time_ms, cost_cents, resolution}';

-- 3.4 spatial_inputs
-- Ref: FR-24, FR-25, FR-26, FR-29, FR-30, FR-31, FR-32
CREATE TABLE spatial_inputs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  dimensions          JSONB,
  openings            JSONB NOT NULL DEFAULT '[]',
  items               JSONB NOT NULL DEFAULT '[]',
  croqui_ascii        TEXT,
  croqui_approved     BOOLEAN NOT NULL DEFAULT FALSE,
  photo_interpretation JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE spatial_inputs IS 'Spatial data: dimensions, openings, positioned items, ASCII croqui.';
COMMENT ON COLUMN spatial_inputs.dimensions IS 'JSON: {width_m, length_m, height_m}';
COMMENT ON COLUMN spatial_inputs.openings IS 'JSON array: [{type, wall, width_m, height_m, offset_m}]';
COMMENT ON COLUMN spatial_inputs.items IS 'JSON array: [{name, width_m, depth_m, height_m, position, reference_image_url, material}]';
COMMENT ON COLUMN spatial_inputs.photo_interpretation IS 'JSON: {estimated_dimensions, detected_openings, detected_elements, confidence}';

-- 3.5 reference_items
-- Ref: FR-25, FR-26
CREATE TABLE reference_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  image_url             TEXT NOT NULL,
  dimensions            JSONB NOT NULL DEFAULT '{}',
  material              TEXT,
  color                 TEXT,
  position_description  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE reference_items IS 'User-provided reference photos for specific items.';
COMMENT ON COLUMN reference_items.dimensions IS 'JSON: {width_m, depth_m, height_m}';

-- 3.6 chat_messages
-- Ref: FR-04, FR-05, FR-06, FR-27, FR-28
CREATE TABLE chat_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role          chat_role NOT NULL,
  content       TEXT NOT NULL,
  operations    JSONB,
  version_id    UUID REFERENCES project_versions(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE chat_messages IS 'Chat refinement messages with extracted LLM operations.';
COMMENT ON COLUMN chat_messages.operations IS 'JSON array: [{type, target, params}] — extracted by Claude API';

-- 3.7 subscriptions
-- Ref: FR-16, FR-17, FR-18
CREATE TABLE subscriptions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier                      subscription_tier NOT NULL DEFAULT 'free',
  status                    subscription_status NOT NULL DEFAULT 'active',
  payment_gateway           payment_gateway NOT NULL DEFAULT 'stripe',
  gateway_customer_id       TEXT NOT NULL,
  gateway_subscription_id   TEXT,
  renders_used              INTEGER NOT NULL DEFAULT 0,
  renders_limit             INTEGER NOT NULL DEFAULT 3,
  current_period_start      TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end        TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT subscriptions_renders_positive CHECK (renders_used >= 0),
  CONSTRAINT subscriptions_limit_positive CHECK (renders_limit > 0)
);

COMMENT ON TABLE subscriptions IS 'User billing subscription with tier and render quota.';
COMMENT ON COLUMN subscriptions.renders_limit IS 'Free=3, Pro=100, Business=500 per period.';

-- 3.8 diagnostics
-- Ref: FR-12, FR-13
CREATE TABLE diagnostics (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  original_image_url  TEXT NOT NULL,
  staged_preview_url  TEXT,
  analysis            JSONB NOT NULL DEFAULT '{}',
  session_token       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE diagnostics IS 'Reverse staging diagnostic for freemium funnel. Can be anonymous.';
COMMENT ON COLUMN diagnostics.session_token IS '7-day cookie for anonymous users.';
COMMENT ON COLUMN diagnostics.analysis IS 'JSON: {issues[], estimated_loss_percent, estimated_loss_brl, overall_score, recommendations[]}';

-- 3.9 render_jobs
-- Ref: FR-19, NFR-01, NFR-04, NFR-06
CREATE TABLE render_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id      UUID REFERENCES project_versions(id) ON DELETE SET NULL,
  type            render_job_type NOT NULL,
  status          render_job_status NOT NULL DEFAULT 'queued',
  priority        INTEGER NOT NULL DEFAULT 0,
  input_params    JSONB NOT NULL DEFAULT '{}',
  output_params   JSONB,
  gpu_provider    TEXT,
  cost_cents      INTEGER,
  duration_ms     INTEGER,
  error_message   TEXT,
  attempts        INTEGER NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT render_jobs_priority_range CHECK (priority BETWEEN 0 AND 2),
  CONSTRAINT render_jobs_attempts_positive CHECK (attempts >= 0)
);

COMMENT ON TABLE render_jobs IS 'Async GPU render jobs managed by BullMQ.';
COMMENT ON COLUMN render_jobs.priority IS '0=free, 1=pro, 2=business';

-- 3.10 share_links
-- Ref: FR-10, FR-11
CREATE TABLE share_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id    UUID NOT NULL REFERENCES project_versions(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL UNIQUE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  views_count   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT share_links_slug_format CHECK (slug ~ '^[a-z0-9-]{6,64}$')
);

COMMENT ON TABLE share_links IS 'Public share links for before/after comparison.';

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- user_profiles: lookup by id is PK (covered)

-- projects: user's projects sorted by recent
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_user_updated ON projects(user_id, updated_at DESC);
CREATE INDEX idx_projects_user_favorites ON projects(user_id) WHERE is_favorite = TRUE;

-- project_versions: versions for a project
CREATE INDEX idx_versions_project_id ON project_versions(project_id);
CREATE INDEX idx_versions_project_number ON project_versions(project_id, version_number DESC);

-- spatial_inputs: lookup by project (UNIQUE constraint already creates index)

-- reference_items: items for a project
CREATE INDEX idx_reference_items_project ON reference_items(project_id);

-- chat_messages: conversation history
CREATE INDEX idx_chat_messages_project ON chat_messages(project_id, created_at);

-- subscriptions: lookup by user (UNIQUE constraint already creates index)

-- diagnostics: anonymous lookup by session token
CREATE INDEX idx_diagnostics_session ON diagnostics(session_token) WHERE session_token IS NOT NULL;
CREATE INDEX idx_diagnostics_user ON diagnostics(user_id) WHERE user_id IS NOT NULL;

-- render_jobs: active jobs for a project
CREATE INDEX idx_render_jobs_project ON render_jobs(project_id);
CREATE INDEX idx_render_jobs_active ON render_jobs(project_id, status) WHERE status IN ('queued', 'processing');
CREATE INDEX idx_render_jobs_status_priority ON render_jobs(status, priority DESC) WHERE status = 'queued';

-- share_links: slug lookup (UNIQUE constraint already creates index)
CREATE INDEX idx_share_links_project ON share_links(project_id);

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Auto-update updated_at on all tables that have it
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_spatial_inputs_updated_at
  BEFORE UPDATE ON spatial_inputs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user_profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-create free subscription on user_profile creation
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, tier, status, gateway_customer_id, renders_limit)
  VALUES (NEW.id, 'free', 'active', 'pending_' || NEW.id::text, 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

COMMIT;
