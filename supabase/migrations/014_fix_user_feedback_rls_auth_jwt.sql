-- =====================================================
-- FIX: user_feedback RLS policies to use auth.jwt()
-- =====================================================
-- Problem: Policies use auth.uid() which tries to cast to UUID
--          This fails with Clerk user IDs like "user_343GLhFKUHk3i07cyDGXDM2jCGi"
-- Solution: Use auth.jwt() ->> 'sub' pattern (same as all other tables)
-- Date: October 2025
-- =====================================================

-- Drop old policies that use auth.uid()
DROP POLICY IF EXISTS "Users can insert feedback" ON user_feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;

-- Recreate with correct auth.jwt() pattern (matches recipes, meal_plans, user_pantry_staples, etc.)
CREATE POLICY "Users can insert feedback"
  ON user_feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own feedback"
  ON user_feedback FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'sub'::text) = user_id);
