-- ============================================================================
-- DecorAI Brasil — RLS Policies
-- Version: 1.0.0
-- Author: Dara (@data-engineer)
-- Date: 2026-03-09
--
-- Row Level Security for all tables.
-- Pattern: Users can only access their own data.
-- Diagnostics allow anonymous access via session_token.
-- Share links are publicly readable.
--
-- Ref: NFR-08 (LGPD), FR-14 (Auth)
-- Rollback: See 00002_rls_policies_rollback.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spatial_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. user_profiles — Users manage their own profile
-- ============================================================================

CREATE POLICY "users_select_own_profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT handled by trigger (handle_new_user), no direct user insert needed
-- DELETE cascades from auth.users

-- ============================================================================
-- 3. projects — Users manage their own projects
-- ============================================================================

CREATE POLICY "users_select_own_projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. project_versions — Access via project ownership
-- ============================================================================

CREATE POLICY "users_select_own_versions"
  ON project_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_versions.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "users_insert_own_versions"
  ON project_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_versions.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- Versions are immutable (no UPDATE/DELETE policy for users)

-- ============================================================================
-- 5. spatial_inputs — Access via project ownership
-- ============================================================================

CREATE POLICY "users_select_own_spatial"
  ON spatial_inputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = spatial_inputs.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "users_insert_own_spatial"
  ON spatial_inputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = spatial_inputs.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "users_update_own_spatial"
  ON spatial_inputs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = spatial_inputs.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. reference_items — Access via project ownership
-- ============================================================================

CREATE POLICY "users_select_own_references"
  ON reference_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = reference_items.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "users_insert_own_references"
  ON reference_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = reference_items.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "users_delete_own_references"
  ON reference_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = reference_items.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. chat_messages — Access via project ownership
-- ============================================================================

CREATE POLICY "users_select_own_chat"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chat_messages.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "users_insert_own_chat"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chat_messages.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- Chat messages are immutable (no UPDATE/DELETE for users)

-- ============================================================================
-- 8. subscriptions — Users read their own subscription
-- ============================================================================

CREATE POLICY "users_select_own_subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE managed by backend (service role) via webhooks

-- ============================================================================
-- 9. diagnostics — Anonymous + authenticated access
-- ============================================================================

-- Authenticated users see their diagnostics
CREATE POLICY "users_select_own_diagnostics"
  ON diagnostics FOR SELECT
  USING (auth.uid() = user_id);

-- Anonymous access via session_token (API validates token server-side)
-- Anonymous inserts are handled by the API with service role key

-- Authenticated users can create diagnostics
CREATE POLICY "users_insert_diagnostics"
  ON diagnostics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 10. render_jobs — Access via project ownership (read-only for users)
-- ============================================================================

CREATE POLICY "users_select_own_jobs"
  ON render_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = render_jobs.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- INSERT/UPDATE managed by backend (service role) via BullMQ workers

-- ============================================================================
-- 11. share_links — Public read + owner management
-- ============================================================================

-- Anyone can read active share links (public pages)
CREATE POLICY "public_select_active_shares"
  ON share_links FOR SELECT
  USING (is_active = TRUE);

-- Owners can manage their share links
CREATE POLICY "users_insert_own_shares"
  ON share_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = share_links.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "users_update_own_shares"
  ON share_links FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = share_links.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "users_delete_own_shares"
  ON share_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = share_links.project_id
        AND projects.user_id = auth.uid()
    )
  );

COMMIT;
