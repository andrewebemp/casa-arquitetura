-- ============================================================================
-- DecorAI Brasil — Rollback for 00001_initial_schema.sql
-- ============================================================================

BEGIN;

-- Drop triggers first
DROP TRIGGER IF EXISTS on_profile_created ON user_profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS trg_spatial_inputs_updated_at ON spatial_inputs;
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_profile();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS share_links;
DROP TABLE IF EXISTS render_jobs;
DROP TABLE IF EXISTS diagnostics;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS reference_items;
DROP TABLE IF EXISTS spatial_inputs;
DROP TABLE IF EXISTS project_versions;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS user_profiles;

-- Drop enums
DROP TYPE IF EXISTS render_job_status;
DROP TYPE IF EXISTS render_job_type;
DROP TYPE IF EXISTS payment_gateway;
DROP TYPE IF EXISTS subscription_status;
DROP TYPE IF EXISTS subscription_tier;
DROP TYPE IF EXISTS chat_role;
DROP TYPE IF EXISTS decor_style;
DROP TYPE IF EXISTS project_status;
DROP TYPE IF EXISTS input_type;

COMMIT;
