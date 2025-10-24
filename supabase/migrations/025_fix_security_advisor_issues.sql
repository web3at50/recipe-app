-- ============================================================================
-- Migration: Fix Security Advisor Issues
-- ============================================================================
-- This migration addresses 2 ERRORS and 6 WARNINGS from Supabase Security Advisor
--
-- ERRORS (Security Definer Views):
--   1. popular_public_recipes - Remove SECURITY DEFINER
--   2. popular_comparisons - Remove SECURITY DEFINER
--
-- WARNINGS (Mutable Search Path):
--   1. update_category_metadata_updated_at - Add SET search_path
--   2. update_recipe_comparisons_updated_at - Add SET search_path
--   3. generate_seo_slug - Add SET search_path
--   4. increment_recipe_page_views - Add SET search_path
--   5. increment_comparison_page_views - Add SET search_path
--   6. record_comparison_vote - Add SET search_path
-- ============================================================================

-- ============================================================================
-- FIX #1: Remove SECURITY DEFINER from Views
-- ============================================================================
-- These views only query public data and don't need elevated privileges.
-- Recreating them without SECURITY DEFINER makes them use normal user permissions.

-- Drop and recreate popular_public_recipes view
DROP VIEW IF EXISTS popular_public_recipes;

CREATE VIEW popular_public_recipes AS
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
'Public view of popular recipes. Uses standard user permissions (no SECURITY DEFINER).';

-- Drop and recreate popular_comparisons view
DROP VIEW IF EXISTS popular_comparisons;

CREATE VIEW popular_comparisons AS
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
'Public view of popular recipe comparisons. Uses standard user permissions (no SECURITY DEFINER).';

-- ============================================================================
-- FIX #2: Add SET search_path to Functions
-- ============================================================================
-- Adding SET search_path = public prevents search path hijacking attacks
-- by ensuring functions only look in the public schema for objects.

-- Function 1: update_category_metadata_updated_at
CREATE OR REPLACE FUNCTION update_category_metadata_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_category_metadata_updated_at IS
'Trigger function to update updated_at timestamp. search_path locked to public schema for security.';

-- Function 2: update_recipe_comparisons_updated_at
CREATE OR REPLACE FUNCTION update_recipe_comparisons_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_recipe_comparisons_updated_at IS
'Trigger function to update updated_at timestamp. search_path locked to public schema for security.';

-- Function 3: generate_seo_slug
CREATE OR REPLACE FUNCTION generate_seo_slug(recipe_name text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
  base_slug TEXT;
BEGIN
  -- Convert to lowercase
  slug := LOWER(recipe_name);

  -- Replace spaces and special characters with hyphens
  slug := REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'g');

  -- Remove leading/trailing hyphens
  slug := TRIM(BOTH '-' FROM slug);

  -- Truncate to 100 characters
  slug := SUBSTRING(slug, 1, 100);

  -- Store base slug
  base_slug := slug;

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM recipes WHERE seo_slug = slug AND is_public = TRUE) LOOP
    counter := counter + 1;
    slug := base_slug || '-' || counter::TEXT;
  END LOOP;

  RETURN slug;
END;
$$;

COMMENT ON FUNCTION generate_seo_slug IS
'Generates URL-friendly slug from recipe name. search_path locked to public schema for security.';

-- Function 4: increment_recipe_page_views
CREATE OR REPLACE FUNCTION increment_recipe_page_views(recipe_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE recipes
  SET page_views = page_views + 1
  WHERE id = recipe_id;
END;
$$;

COMMENT ON FUNCTION increment_recipe_page_views IS
'Increments page view counter for a recipe. search_path locked to public schema for security.';

-- Function 5: increment_comparison_page_views
CREATE OR REPLACE FUNCTION increment_comparison_page_views(comparison_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE recipe_comparisons
  SET page_views = page_views + 1
  WHERE id = comparison_id;
END;
$$;

COMMENT ON FUNCTION increment_comparison_page_views IS
'Increments page view counter for a comparison. search_path locked to public schema for security.';

-- Function 6: record_comparison_vote
CREATE OR REPLACE FUNCTION record_comparison_vote(comparison_id uuid, vote_type text)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  CASE vote_type
    WHEN 'balanced' THEN
      UPDATE recipe_comparisons SET votes_balanced = votes_balanced + 1 WHERE id = comparison_id;
    WHEN 'quick' THEN
      UPDATE recipe_comparisons SET votes_quick = votes_quick + 1 WHERE id = comparison_id;
    WHEN 'healthy' THEN
      UPDATE recipe_comparisons SET votes_healthy = votes_healthy + 1 WHERE id = comparison_id;
    WHEN 'gourmet' THEN
      UPDATE recipe_comparisons SET votes_gourmet = votes_gourmet + 1 WHERE id = comparison_id;
    ELSE
      RAISE EXCEPTION 'Invalid vote type: %', vote_type;
  END CASE;
END;
$$;

COMMENT ON FUNCTION record_comparison_vote IS
'Records a vote for a comparison by type. search_path locked to public schema for security.';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- All 8 security issues have been addressed:
--   - 2 views no longer use SECURITY DEFINER
--   - 6 functions now have SET search_path = public
-- ============================================================================
