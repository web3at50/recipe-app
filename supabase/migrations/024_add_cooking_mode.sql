-- Migration: Add cooking_mode field to recipes table
-- Author: Claude Code
-- Date: 2025-10-22
-- Description: Adds cooking_mode field to track cooking method (slow_cooker, air_fryer, batch_cook, standard)

-- Add cooking_mode field to recipes table
ALTER TABLE recipes
ADD COLUMN cooking_mode VARCHAR(50);

-- Add check constraint for valid cooking modes
ALTER TABLE recipes
ADD CONSTRAINT recipes_cooking_mode_check
CHECK (cooking_mode IS NULL OR cooking_mode IN ('standard', 'slow_cooker', 'air_fryer', 'batch_cook'));

-- Add comment for documentation
COMMENT ON COLUMN recipes.cooking_mode IS 'Cooking method used: standard, slow_cooker, air_fryer, or batch_cook';

-- Add index for filtering by cooking mode (only for non-NULL values to save space)
CREATE INDEX idx_recipes_cooking_mode ON recipes(cooking_mode) WHERE cooking_mode IS NOT NULL;
