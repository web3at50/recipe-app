-- Migration: Add SEO and Public Recipe Fields
-- Purpose: Enable public recipe pages with SEO optimization and comparison pages
-- Phase: MVP/Phase 1 - Automated SEO Recipe Content System

-- ============================================================================
-- STEP 1: Add SEO fields to existing recipes table
-- ============================================================================

-- Add public visibility and SEO metadata fields
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS seo_slug VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS image_attribution TEXT,
ADD COLUMN IF NOT EXISTS page_views INTEGER DEFAULT 0;

-- Add unique constraint on seo_slug for public recipes
CREATE UNIQUE INDEX IF NOT EXISTS recipes_seo_slug_unique
ON recipes (seo_slug)
WHERE is_public = TRUE AND seo_slug IS NOT NULL;

-- Add index on category for faster filtering
CREATE INDEX IF NOT EXISTS recipes_category_idx ON recipes (category);

-- Add index on is_public for faster public recipe queries
CREATE INDEX IF NOT EXISTS recipes_is_public_idx ON recipes (is_public);

-- Add composite index for category + public queries
CREATE INDEX IF NOT EXISTS recipes_category_public_idx
ON recipes (category, is_public)
WHERE is_public = TRUE;

-- Add index on page_views for sorting by popularity
CREATE INDEX IF NOT EXISTS recipes_page_views_idx
ON recipes (page_views DESC)
WHERE is_public = TRUE;

-- ============================================================================
-- STEP 2: Create recipe_comparisons table
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_comparisons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- References to the 4 AI-generated recipe versions
  recipe_balanced_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  recipe_quick_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  recipe_healthy_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  recipe_gourmet_id UUID REFERENCES recipes(id) ON DELETE CASCADE,

  -- SEO metadata for the comparison page
  seo_slug VARCHAR(255) UNIQUE NOT NULL,
  seo_title VARCHAR(255) NOT NULL,
  seo_description TEXT NOT NULL,
  seo_keywords TEXT[],

  -- Publication status
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,

  -- Analytics
  page_views INTEGER DEFAULT 0,
  votes_balanced INTEGER DEFAULT 0,
  votes_quick INTEGER DEFAULT 0,
  votes_healthy INTEGER DEFAULT 0,
  votes_gourmet INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for recipe_comparisons
CREATE INDEX IF NOT EXISTS recipe_comparisons_is_published_idx
ON recipe_comparisons (is_published);

CREATE INDEX IF NOT EXISTS recipe_comparisons_page_views_idx
ON recipe_comparisons (page_views DESC)
WHERE is_published = TRUE;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_recipe_comparisons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipe_comparisons_updated_at
  BEFORE UPDATE ON recipe_comparisons
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_comparisons_updated_at();

-- ============================================================================
-- STEP 3: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on recipe_comparisons
ALTER TABLE recipe_comparisons ENABLE ROW LEVEL SECURITY;

-- Public read access to published comparisons
CREATE POLICY "Public read access to published comparisons"
  ON recipe_comparisons
  FOR SELECT
  USING (is_published = TRUE);

-- Authenticated users can view all comparisons (for admin dashboard)
CREATE POLICY "Authenticated users can view all comparisons"
  ON recipe_comparisons
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only authenticated users can create comparisons
CREATE POLICY "Authenticated users can create comparisons"
  ON recipe_comparisons
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Only authenticated users can update comparisons
CREATE POLICY "Authenticated users can update comparisons"
  ON recipe_comparisons
  FOR UPDATE
  TO authenticated
  USING (TRUE);

-- Only authenticated users can delete comparisons
CREATE POLICY "Authenticated users can delete comparisons"
  ON recipe_comparisons
  FOR DELETE
  TO authenticated
  USING (TRUE);

-- Update existing recipes RLS to allow public read access to published recipes
CREATE POLICY "Public read access to published recipes"
  ON recipes
  FOR SELECT
  TO anon
  USING (is_public = TRUE);

-- ============================================================================
-- STEP 4: Helper Functions
-- ============================================================================

-- Function to generate SEO-friendly slug from recipe name
CREATE OR REPLACE FUNCTION generate_seo_slug(recipe_name TEXT)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Function to increment page views (non-blocking)
CREATE OR REPLACE FUNCTION increment_recipe_page_views(recipe_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE recipes
  SET page_views = page_views + 1
  WHERE id = recipe_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment comparison page views
CREATE OR REPLACE FUNCTION increment_comparison_page_views(comparison_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE recipe_comparisons
  SET page_views = page_views + 1
  WHERE id = comparison_id;
END;
$$ LANGUAGE plpgsql;

-- Function to record comparison vote
CREATE OR REPLACE FUNCTION record_comparison_vote(
  comparison_id UUID,
  vote_type TEXT
)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 5: Create views for analytics (optional, for future use)
-- ============================================================================

-- View for popular public recipes
CREATE OR REPLACE VIEW popular_public_recipes AS
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

-- View for popular comparisons
CREATE OR REPLACE VIEW popular_comparisons AS
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

-- ============================================================================
-- STEP 6: Add comments for documentation
-- ============================================================================

COMMENT ON COLUMN recipes.is_public IS 'Whether the recipe is publicly visible (SEO pages)';
COMMENT ON COLUMN recipes.seo_slug IS 'URL-friendly slug for SEO (e.g., "creamy-garlic-chicken-pasta")';
COMMENT ON COLUMN recipes.seo_title IS 'SEO-optimized title (max 60 chars for Google)';
COMMENT ON COLUMN recipes.seo_description IS 'SEO meta description (max 155 chars for Google)';
COMMENT ON COLUMN recipes.seo_keywords IS 'Array of SEO keywords for targeting';
COMMENT ON COLUMN recipes.category IS 'Recipe category: dinner, breakfast, lunch, dessert, snacks, sides';
COMMENT ON COLUMN recipes.published_at IS 'Timestamp when recipe was published publicly';
COMMENT ON COLUMN recipes.image_url IS 'URL to recipe hero image (Unsplash or uploaded)';
COMMENT ON COLUMN recipes.image_source IS 'Source of image: "unsplash" or "upload"';
COMMENT ON COLUMN recipes.image_attribution IS 'HTML attribution for image (required for Unsplash)';
COMMENT ON COLUMN recipes.page_views IS 'Number of times recipe page has been viewed';

COMMENT ON TABLE recipe_comparisons IS '4-way AI recipe comparison pages showcasing PlateWise unique feature';
COMMENT ON COLUMN recipe_comparisons.recipe_balanced_id IS 'Reference to GPT-4.1 balanced recipe version';
COMMENT ON COLUMN recipe_comparisons.recipe_quick_id IS 'Reference to Claude Haiku quick & easy recipe version';
COMMENT ON COLUMN recipe_comparisons.recipe_healthy_id IS 'Reference to Gemini 2.0 healthy recipe version';
COMMENT ON COLUMN recipe_comparisons.recipe_gourmet_id IS 'Reference to Grok 4 gourmet recipe version';
COMMENT ON COLUMN recipe_comparisons.votes_balanced IS 'Number of votes for balanced version';
COMMENT ON COLUMN recipe_comparisons.votes_quick IS 'Number of votes for quick version';
COMMENT ON COLUMN recipe_comparisons.votes_healthy IS 'Number of votes for healthy version';
COMMENT ON COLUMN recipe_comparisons.votes_gourmet IS 'Number of votes for gourmet version';

-- ============================================================================
-- Migration complete!
-- ============================================================================
