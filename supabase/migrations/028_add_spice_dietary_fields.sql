-- Migration: Add spice_level and dietary_requirements to recipes table
-- Author: Claude Code
-- Date: 2025-10-24
-- Description: Adds spice_level and dietary_requirements fields to capture recipe attributes
--              These fields are dynamic (no CHECK constraints) to allow future additions without migrations

-- Add spice_level field (dynamic - no CHECK constraint)
ALTER TABLE recipes
ADD COLUMN spice_level VARCHAR(50);

-- Add dietary_requirements field as array (dynamic - no CHECK constraint)
ALTER TABLE recipes
ADD COLUMN dietary_requirements TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN recipes.spice_level IS 'Spice level of the recipe (e.g., mild, medium, hot). Dynamic field - validation at application level to allow future options without migrations.';
COMMENT ON COLUMN recipes.dietary_requirements IS 'Array of dietary requirements the recipe satisfies (e.g., vegetarian, vegan, pescatarian, halal, kosher). Dynamic field - validation at application level.';

-- Add indexes for query performance
CREATE INDEX idx_recipes_spice_level ON recipes(spice_level) WHERE spice_level IS NOT NULL;
CREATE INDEX idx_recipes_dietary_requirements ON recipes USING gin(dietary_requirements);
