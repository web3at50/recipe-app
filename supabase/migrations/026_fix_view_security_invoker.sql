-- ============================================================================
-- Migration: Fix View Security Issues with SECURITY INVOKER
-- ============================================================================
-- This migration fixes the 2 remaining SECURITY DEFINER view errors.
--
-- PROBLEM:
--   All Postgres views are "security definer" by default, meaning they bypass
--   Row Level Security (RLS) policies. Since recipes and recipe_comparisons
--   tables have RLS enabled, these views could potentially expose protected data.
--
-- SOLUTION:
--   Recreate views with security_invoker = true option (Postgres 15+).
--   This makes views respect RLS policies instead of bypassing them.
--
-- AFFECTED VIEWS:
--   1. popular_public_recipes
--   2. popular_comparisons
-- ============================================================================

-- ============================================================================
-- Fix View #1: popular_public_recipes
-- ============================================================================

DROP VIEW IF EXISTS popular_public_recipes;

CREATE VIEW popular_public_recipes
WITH (security_invoker = true)
AS
SELECT
  id,
  name,
  seo_slug,
  category,
  page_views,
  published_at,
  image_url
FROM recipes
WHERE is_public = TRUE
ORDER BY page_views DESC;

COMMENT ON VIEW popular_public_recipes IS
'Public view of popular recipes. Uses security_invoker to respect RLS policies.';

-- ============================================================================
-- Fix View #2: popular_comparisons
-- ============================================================================

DROP VIEW IF EXISTS popular_comparisons;

CREATE VIEW popular_comparisons
WITH (security_invoker = true)
AS
SELECT
  id,
  seo_slug,
  seo_title,
  page_views,
  votes_balanced,
  votes_quick,
  votes_healthy,
  votes_gourmet,
  (votes_balanced + votes_quick + votes_healthy + votes_gourmet) as total_votes,
  published_at
FROM recipe_comparisons
WHERE is_published = TRUE
ORDER BY page_views DESC;

COMMENT ON VIEW popular_comparisons IS
'Public view of popular recipe comparisons. Uses security_invoker to respect RLS policies.';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Both views now use security_invoker = true, which means:
--   - They respect RLS policies on underlying tables
--   - Users only see data their RLS policies allow
--   - No security definer bypass
-- ============================================================================
