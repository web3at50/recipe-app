-- Migration: Fix difficulty to align with UI (remove CHECK constraint)
-- Author: Claude Code
-- Date: 2025-10-24
-- Description: Remove CHECK constraint from difficulty to make it dynamic like spice_level
--              This allows future difficulty levels without migrations and fixes migration failure

-- Drop the existing CHECK constraint (if it exists)
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_difficulty_check;

-- Update any existing 'easy'/'medium'/'hard' values to new format
-- (Safe to run even if no rows match - handles migration from old values)
UPDATE recipes SET difficulty = 'beginner' WHERE difficulty = 'easy';
UPDATE recipes SET difficulty = 'intermediate' WHERE difficulty = 'medium';
UPDATE recipes SET difficulty = 'advanced' WHERE difficulty = 'hard';

-- Update comment for documentation
COMMENT ON COLUMN recipes.difficulty IS 'Recipe difficulty level (e.g., beginner, intermediate, advanced). Dynamic field - validation at application level to allow future options without migrations.';
