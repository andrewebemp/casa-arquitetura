# DecorAI Brasil — Database Schema

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Section:** 9

---

## 9. Database Schema

### 9.1 PostgreSQL DDL

```sql
-- ============================================================
-- DecorAI Brasil — Database Schema
-- PostgreSQL 15+ (Supabase)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- User Profiles (extends Supabase Auth)
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

-- ============================================================
-- Projects
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

-- ============================================================
-- Project Versions (historico de renders)
-- ============================================================
CREATE TABLE project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  refinement_command TEXT,
  quality_scores JSONB DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, version_number)
);

CREATE INDEX idx_versions_project_id ON project_versions(project_id);
CREATE INDEX idx_versions_created_at ON project_versions(created_at DESC);

ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own versions" ON project_versions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_versions.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "Service inserts versions" ON project_versions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_versions.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- Spatial Inputs (medidas, croqui)
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

-- ============================================================
-- Reference Items (fotos de referencia)
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

-- ============================================================
-- Chat Messages
-- ============================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  operations JSONB,
  version_id UUID REFERENCES project_versions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_project_id ON chat_messages(project_id);
CREATE INDEX idx_chat_created_at ON chat_messages(project_id, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own chat" ON chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = chat_messages.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "Users insert own chat" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = chat_messages.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- Subscriptions
-- ============================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  payment_gateway TEXT CHECK (payment_gateway IN ('stripe', 'asaas')),
  gateway_customer_id TEXT,
  gateway_subscription_id TEXT,
  renders_used INTEGER NOT NULL DEFAULT 0,
  renders_limit INTEGER NOT NULL DEFAULT 3,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Updates gerenciados por service role (webhooks)

-- ============================================================
-- Diagnostics (reverse staging)
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

-- ============================================================
-- Render Jobs (fila de processamento)
-- ============================================================
CREATE TABLE render_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id UUID REFERENCES project_versions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN (
    'initial', 'refinement', 'style_change', 'segmentation', 'diagnostic', 'upscale'
  )),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'processing', 'completed', 'failed', 'canceled'
  )),
  priority INTEGER NOT NULL DEFAULT 0,
  input_params JSONB NOT NULL DEFAULT '{}',
  output_params JSONB,
  gpu_provider TEXT,
  cost_cents INTEGER,
  duration_ms INTEGER,
  error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_project_id ON render_jobs(project_id);
CREATE INDEX idx_jobs_status ON render_jobs(status);
CREATE INDEX idx_jobs_created_at ON render_jobs(created_at DESC);

ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own jobs" ON render_jobs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = render_jobs.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- Share Links
-- ============================================================
CREATE TABLE share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES project_versions(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  include_watermark BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_share_token ON share_links(share_token);

ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads shares" ON share_links
  FOR SELECT USING (true);
CREATE POLICY "Users create own shares" ON share_links
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = share_links.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- Triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated
  BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects_updated
  BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_spatial_inputs_updated
  BEFORE UPDATE ON spatial_inputs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subscriptions_updated
  BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Function: Auto-create profile and subscription on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO subscriptions (user_id, tier, renders_limit)
  VALUES (NEW.id, 'free', 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```
