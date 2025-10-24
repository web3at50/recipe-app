-- Migration: Rollback migrations 027, 028, and 029
-- Author: Claude Code
-- Date: 2025-10-24
-- Description: Complete rollback of recent changes to return to clean slate
--              Undoes rate limiting (029), recipe enhancements (028), and difficulty changes (027)

-- =====================================================
-- UNDO MIGRATION 029: Rate Limiting Credits
-- =====================================================

-- Drop generation credit tracking columns
ALTER TABLE user_profiles DROP COLUMN IF EXISTS generation_credits_used;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS generation_credits_warning_shown;

-- Drop credit tracking index
DROP INDEX IF EXISTS idx_user_profiles_credits;

-- =====================================================
-- UNDO MIGRATION 028: Spice Level & Dietary Requirements
-- =====================================================

-- Drop spice level column
ALTER TABLE recipes DROP COLUMN IF EXISTS spice_level;

-- Drop dietary requirements column
ALTER TABLE recipes DROP COLUMN IF EXISTS dietary_requirements;

-- Drop related indexes
DROP INDEX IF EXISTS idx_recipes_spice_level;
DROP INDEX IF EXISTS idx_recipes_dietary_requirements;

-- =====================================================
-- UNDO MIGRATION 027: Difficulty Constraint Changes
-- =====================================================

-- Drop any existing difficulty constraint
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_difficulty_check;

-- Revert any modified difficulty values back to original format
-- (Safe to run even if no rows match)
UPDATE recipes SET difficulty = 'easy' WHERE difficulty = 'beginner';
UPDATE recipes SET difficulty = 'medium' WHERE difficulty = 'intermediate';
UPDATE recipes SET difficulty = 'hard' WHERE difficulty = 'advanced';

-- Restore original difficulty CHECK constraint
ALTER TABLE recipes ADD CONSTRAINT recipes_difficulty_check
  CHECK (difficulty IN ('easy', 'medium', 'hard'));

-- Restore original comment
COMMENT ON COLUMN recipes.difficulty IS 'Recipe difficulty level: easy, medium, or hard';

-- =====================================================
-- ROLLBACK COMPLETE
-- =====================================================
-- Database schema has been restored to pre-migration 027 state
-- Ready for clean implementation of allergen detection system
