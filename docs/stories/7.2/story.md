# Story 7.2 - Database Schema e Supabase Migrations

## Status: Draft

## Story
As a developer, I want the complete PostgreSQL database schema deployed via Supabase migrations with all 10 tables, RLS policies, indexes, triggers, and auto-provisioning functions so that all application features have a solid data foundation to build upon.

## Acceptance Criteria
- Given the Supabase project, when I run `supabase db reset`, then all migrations apply successfully without errors and the schema matches the architecture document
- Given the schema, when I inspect the database, then all 10 tables exist: `user_profiles`, `projects`, `project_versions`, `spatial_inputs`, `reference_items`, `chat_messages`, `subscriptions`, `diagnostics`, `render_jobs`, `share_links`
- Given each table, when I inspect its columns, then all columns match the DDL defined in [database-schema.md](../../architecture/fullstack/database-schema.md) including types, constraints, defaults, and CHECK clauses
- Given Row Level Security, when I query any table as an authenticated user, then RLS policies enforce that users can only access their own data (user_id or project ownership check)
- Given the `diagnostics` table, when an anonymous user creates a diagnostic, then the INSERT succeeds (public insert policy) and the user can read it via session_token
- Given the `share_links` table, when anyone accesses a share link, then the SELECT succeeds (public read policy) regardless of authentication
- Given a new user signup in Supabase Auth, when the `on_auth_user_created` trigger fires, then a `user_profiles` row and a `subscriptions` row (tier='free', renders_limit=3) are automatically created
- Given any table with `updated_at`, when a row is updated, then the `updated_at` timestamp is automatically refreshed by the `update_updated_at()` trigger
- Given the schema, when I inspect indexes, then all performance indexes exist: `idx_projects_user_id`, `idx_projects_status`, `idx_projects_created_at`, `idx_versions_project_id`, `idx_versions_created_at`, `idx_chat_project_id`, `idx_chat_created_at`, `idx_reference_items_project`, `idx_diagnostics_user_id`, `idx_diagnostics_session`, `idx_jobs_project_id`, `idx_jobs_status`, `idx_jobs_created_at`, `idx_share_token`
- Given the extensions, when I check `pg_extension`, then `uuid-ossp` and `pgcrypto` are enabled
- Given the migration files, when I inspect `supabase/migrations/`, then each migration is idempotent and ordered chronologically with clear naming

## Tasks
- [ ] Task 1: Create migration `001_extensions.sql` — enable `uuid-ossp` and `pgcrypto` extensions
- [ ] Task 2: Create migration `002_user_profiles.sql` — `user_profiles` table with RLS policies (SELECT, INSERT, UPDATE own data)
- [ ] Task 3: Create migration `003_projects.sql` — `projects` table with indexes, RLS policies (full CRUD own data)
- [ ] Task 4: Create migration `004_project_versions.sql` — `project_versions` table with UNIQUE constraint, indexes, RLS policies
- [ ] Task 5: Create migration `005_spatial_inputs.sql` — `spatial_inputs` table with UNIQUE project_id constraint, RLS policies
- [ ] Task 6: Create migration `006_reference_items.sql` — `reference_items` table with index, RLS policy (ALL own data)
- [ ] Task 7: Create migration `007_chat_messages.sql` — `chat_messages` table with composite index, RLS policies
- [ ] Task 8: Create migration `008_subscriptions.sql` — `subscriptions` table with UNIQUE user_id, RLS policies (SELECT, INSERT own)
- [ ] Task 9: Create migration `009_diagnostics.sql` — `diagnostics` table with public INSERT, conditional SELECT policy
- [ ] Task 10: Create migration `010_render_jobs.sql` — `render_jobs` table with status/priority indexes, RLS policy
- [ ] Task 11: Create migration `011_share_links.sql` — `share_links` table with unique token, public SELECT, owner INSERT policy
- [ ] Task 12: Create migration `012_triggers.sql` — `update_updated_at()` function and triggers for 4 tables
- [ ] Task 13: Create migration `013_handle_new_user.sql` — `handle_new_user()` function and `on_auth_user_created` trigger
- [ ] Task 14: Validate all migrations apply cleanly with `supabase db reset` (or manual SQL verification)
- [ ] Task 15: Write integration tests verifying table existence, column types, and constraint behavior

## Dependencies
- Story 7.1 — Monorepo scaffolding (provides `supabase/` directory structure and shared types)

## Technical Notes
- **Database:** PostgreSQL 15+ via Supabase
- **RLS:** Row Level Security is mandatory for LGPD compliance (NFR-08)
- **Auth integration:** Uses `auth.uid()` and `auth.users` from Supabase Auth (not custom auth)
- **Trigger pattern:** `handle_new_user()` uses `SECURITY DEFINER` to write to tables the user doesn't yet have access to
- **Migration naming:** Use `YYYYMMDDHHMMSS_description.sql` format per Supabase convention (or sequential numbering for clarity)
- **JSONB columns:** `quality_scores`, `metadata`, `dimensions`, `openings`, `items`, `photo_interpretation`, `operations`, `analysis`, `input_params`, `output_params` — stored as JSONB for flexibility
- **Architecture ref:** [fullstack/database-schema.md](../../architecture/fullstack/database-schema.md), [fullstack/data-models.md](../../architecture/fullstack/data-models.md)

## PRD Traceability
| Requirement | Coverage |
|-------------|----------|
| FR-14 (login Google/email) | `user_profiles` table extending `auth.users` |
| FR-15 (perfil com historico) | `projects`, `project_versions` tables with user ownership |
| FR-16 (3 tiers pricing) | `subscriptions` table with tier CHECK constraint |
| FR-19 (fila assincrona) | `render_jobs` table with status/priority queue |
| FR-24/FR-25 (input espacial) | `spatial_inputs` table with JSONB dimensions/items |
| FR-27 (historico versoes) | `project_versions` with version_number ordering |
| FR-29 (croqui ASCII) | `spatial_inputs.croqui_ascii` and `croqui_approved` columns |
| NFR-08 (LGPD) | RLS policies on all tables + `lgpd_consent_at` column |
| NFR-09 (opt-in treinamento) | `user_profiles.training_opt_in` column |
| NFR-10 (rate limiting) | `subscriptions.renders_used` / `renders_limit` for enforcement |

## Dev Agent Record
### Implementation Plan
### Debug Log
### Change Log

## Testing
- Migration apply: All 13 migrations run without errors on clean database
- Table structure: All 10 tables with correct columns, types, and constraints
- RLS enforcement: Authenticated user can only access own data
- Public policies: `diagnostics` INSERT and `share_links` SELECT work without auth
- Trigger: `updated_at` auto-updates on row modification
- Auto-provisioning: New auth user gets `user_profiles` + `subscriptions` rows
- Constraints: CHECK constraints reject invalid values (bad style, bad status, bad tier)
- Indexes: All 14 indexes exist and are used by query planner

## File List

## QA Results
