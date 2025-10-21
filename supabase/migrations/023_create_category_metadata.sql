-- Migration: Add category metadata table for custom category images and descriptions
-- This enables hybrid image selection: custom > first recipe > default

-- Create category_metadata table
CREATE TABLE IF NOT EXISTS category_metadata (
  category TEXT PRIMARY KEY CHECK (category IN (
    'breakfast',
    'lunch',
    'dinner',
    'desserts',
    'snacks',
    'sides',
    'quick-easy',
    'healthy'
  )),
  custom_image_url TEXT,
  custom_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add comment for documentation
COMMENT ON TABLE category_metadata IS 'Stores custom metadata for recipe categories, including custom images and descriptions';
COMMENT ON COLUMN category_metadata.custom_image_url IS 'Custom OpenGraph image URL (1200x630px) for category pages. If NULL, falls back to first recipe image.';
COMMENT ON COLUMN category_metadata.custom_description IS 'Custom SEO description for category. If NULL, uses default from CATEGORY_INFO.';

-- Enable RLS
ALTER TABLE category_metadata ENABLE ROW LEVEL SECURITY;

-- Public read access (for category page metadata generation)
CREATE POLICY "Category metadata is publicly viewable"
  ON category_metadata FOR SELECT
  USING (true);

-- Admin write access (for uploading custom images)
CREATE POLICY "Admins can manage category metadata"
  ON category_metadata FOR ALL
  USING ((auth.jwt()->>'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt()->>'is_admin')::boolean = true);

-- Insert default rows for all 8 categories
INSERT INTO category_metadata (category, custom_image_url, custom_description)
VALUES
  ('breakfast', NULL, NULL),
  ('lunch', NULL, NULL),
  ('dinner', NULL, NULL),
  ('desserts', NULL, NULL),
  ('snacks', NULL, NULL),
  ('sides', NULL, NULL),
  ('quick-easy', NULL, NULL),
  ('healthy', NULL, NULL)
ON CONFLICT (category) DO NOTHING;

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_category_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_metadata_timestamp
  BEFORE UPDATE ON category_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_category_metadata_updated_at();
