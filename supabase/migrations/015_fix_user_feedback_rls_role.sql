-- =====================================================
-- FIX: user_feedback RLS policies - change from 'authenticated' to 'public'
-- =====================================================
-- Problem: Policies use TO authenticated (requires Supabase Auth)
--          App uses Clerk Auth, not Supabase Auth
-- Solution: Change TO public and add WITH CHECK validation (same as other tables)
-- Date: October 2025
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can insert feedback" ON user_feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;

-- Recreate with 'public' role (same pattern as recipes, user_profiles, etc.)
-- INSERT: Anyone can try, but only if they have a valid Clerk JWT
CREATE POLICY "Users can insert feedback"
  ON user_feedback FOR INSERT
  TO public
  WITH CHECK ((auth.jwt() ->> 'sub'::text) IS NOT NULL);

-- SELECT: Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON user_feedback FOR SELECT
  TO public
  USING ((auth.jwt() ->> 'sub'::text) = user_id);
