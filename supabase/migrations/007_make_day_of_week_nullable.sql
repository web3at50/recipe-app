-- =====================================================
-- MAKE day_of_week NULLABLE
-- Transition from day_of_week (0-6) to date-based system
-- =====================================================

-- The date column is now the primary field for meal plan items
-- day_of_week is kept for backward compatibility with existing data
-- but new records will use date instead

ALTER TABLE meal_plan_items
  ALTER COLUMN day_of_week DROP NOT NULL;

-- Add comment to document the schema transition
COMMENT ON COLUMN meal_plan_items.day_of_week IS
  'Legacy field: Day of week (0=Monday, 6=Sunday). Use date column for new records.';

COMMENT ON COLUMN meal_plan_items.date IS
  'Primary date field: Full date for the meal (YYYY-MM-DD). This is now the authoritative field.';

-- =====================================================
-- NOTES
-- =====================================================
-- After this migration:
-- - Existing records keep their day_of_week values
-- - New records can have day_of_week = NULL and use date instead
-- - API code should only populate the date field
-- =====================================================
