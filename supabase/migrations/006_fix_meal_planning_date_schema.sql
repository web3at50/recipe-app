-- =====================================================
-- MEAL PLANNING DATE SCHEMA FIX
-- Add date-based columns to align with frontend implementation
-- =====================================================

-- =====================================================
-- UPDATE meal_plans table
-- Add start_date and end_date for more flexible date ranges
-- =====================================================

ALTER TABLE meal_plans
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE;

-- Populate new columns from existing week_start_date
UPDATE meal_plans
SET
  start_date = week_start_date,
  end_date = week_start_date + INTERVAL '6 days'
WHERE start_date IS NULL;

-- Make start_date NOT NULL after population
ALTER TABLE meal_plans
  ALTER COLUMN start_date SET NOT NULL;

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_meal_plans_date_range
  ON meal_plans(user_id, start_date, end_date);

-- Update unique constraint to use start_date instead
ALTER TABLE meal_plans
  DROP CONSTRAINT IF EXISTS meal_plans_user_id_week_start_date_key;

ALTER TABLE meal_plans
  ADD CONSTRAINT meal_plans_user_id_start_date_key
  UNIQUE(user_id, start_date);

-- =====================================================
-- UPDATE meal_plan_items table
-- Add date column for specific meal dates
-- =====================================================

ALTER TABLE meal_plan_items
  ADD COLUMN IF NOT EXISTS date DATE;

-- Populate date from day_of_week calculation
-- This calculates the actual date based on meal_plan's week_start_date + day_of_week
UPDATE meal_plan_items mpi
SET date = mp.week_start_date + (mpi.day_of_week || ' days')::interval
FROM meal_plans mp
WHERE mpi.meal_plan_id = mp.id
  AND mpi.date IS NULL;

-- Make date NOT NULL after population
ALTER TABLE meal_plan_items
  ALTER COLUMN date SET NOT NULL;

-- Create index for date queries
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_date
  ON meal_plan_items(meal_plan_id, date);

-- Update unique constraint to use date instead of day_of_week
ALTER TABLE meal_plan_items
  DROP CONSTRAINT IF EXISTS meal_plan_items_meal_plan_id_day_of_week_meal_type_key;

ALTER TABLE meal_plan_items
  ADD CONSTRAINT meal_plan_items_meal_plan_id_date_meal_type_key
  UNIQUE(meal_plan_id, date, meal_type);

-- =====================================================
-- NOTES
-- =====================================================
-- The old columns (week_start_date, day_of_week) are kept for backward compatibility
-- but the new columns (start_date, end_date, date) are now the primary fields
--
-- Frontend should use:
-- - meal_plans: start_date, end_date
-- - meal_plan_items: date (full date, not day_of_week)
-- =====================================================
