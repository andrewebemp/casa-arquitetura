-- ============================================================================
-- DecorAI Brasil — Rollback for 00002_rls_policies.sql
-- ============================================================================

BEGIN;

-- Drop all policies
DROP POLICY IF EXISTS "users_select_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;

DROP POLICY IF EXISTS "users_select_own_projects" ON projects;
DROP POLICY IF EXISTS "users_insert_own_projects" ON projects;
DROP POLICY IF EXISTS "users_update_own_projects" ON projects;
DROP POLICY IF EXISTS "users_delete_own_projects" ON projects;

DROP POLICY IF EXISTS "users_select_own_versions" ON project_versions;
DROP POLICY IF EXISTS "users_insert_own_versions" ON project_versions;

DROP POLICY IF EXISTS "users_select_own_spatial" ON spatial_inputs;
DROP POLICY IF EXISTS "users_insert_own_spatial" ON spatial_inputs;
DROP POLICY IF EXISTS "users_update_own_spatial" ON spatial_inputs;

DROP POLICY IF EXISTS "users_select_own_references" ON reference_items;
DROP POLICY IF EXISTS "users_insert_own_references" ON reference_items;
DROP POLICY IF EXISTS "users_delete_own_references" ON reference_items;

DROP POLICY IF EXISTS "users_select_own_chat" ON chat_messages;
DROP POLICY IF EXISTS "users_insert_own_chat" ON chat_messages;

DROP POLICY IF EXISTS "users_select_own_subscription" ON subscriptions;

DROP POLICY IF EXISTS "users_select_own_diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "users_insert_diagnostics" ON diagnostics;

DROP POLICY IF EXISTS "users_select_own_jobs" ON render_jobs;

DROP POLICY IF EXISTS "public_select_active_shares" ON share_links;
DROP POLICY IF EXISTS "users_insert_own_shares" ON share_links;
DROP POLICY IF EXISTS "users_update_own_shares" ON share_links;
DROP POLICY IF EXISTS "users_delete_own_shares" ON share_links;

-- Disable RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE spatial_inputs DISABLE ROW LEVEL SECURITY;
ALTER TABLE reference_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics DISABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE share_links DISABLE ROW LEVEL SECURITY;

COMMIT;
