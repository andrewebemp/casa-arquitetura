-- ============================================================================
-- DecorAI Brasil — Seed Data
-- Version: 1.0.0
-- Author: Dara (@data-engineer)
-- Date: 2026-03-09
--
-- Initial seed data for the application.
-- Idempotent: safe to run multiple times.
-- ============================================================================

-- Note: Enum values (decor_style, subscription_tier, etc.) are defined in the
-- schema migration as PostgreSQL enums. No separate seed needed for those.

-- Note: User profiles and subscriptions are auto-created via triggers when
-- a user signs up through Supabase Auth. No manual seed needed.

-- Note: The 10 decoration styles are defined as enum values in the schema:
--   moderno, industrial, minimalista, classico, escandinavo,
--   rustico, tropical, contemporaneo, boho, luxo
-- The frontend reads these from the /styles endpoint which queries the enum.

-- ============================================================================
-- Subscription tier configuration (reference only — enforced at API level)
-- ============================================================================
-- This is documented here for reference. The actual enforcement happens in
-- the API layer when creating/updating subscriptions.
--
-- | Tier     | renders_limit | Price (BRL/month) | Watermark | HD Export |
-- |----------|---------------|-------------------|-----------|-----------|
-- | free     | 3             | 0                 | Yes       | No        |
-- | pro      | 100           | 79-149            | No        | Yes       |
-- | business | 500           | 299-499           | No        | Yes       |
-- ============================================================================

-- No runtime seed data required at this time.
-- The schema is self-seeding via:
--   1. Enums define all valid values
--   2. Triggers auto-create user_profiles on signup
--   3. Triggers auto-create free subscriptions on profile creation
--   4. Default values handle all required fields
