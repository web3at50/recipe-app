-- =====================================================
-- MIGRATION: Fix Recipe RLS Policies for INSERT/UPDATE/DELETE
--
-- PROBLEM: Migration 021 only updated SELECT policy but left
-- INSERT/UPDATE/DELETE policies with TO public role.
-- Authenticated Clerk users have 'authenticated' role, not 'public',
-- so they cannot create/edit/delete recipes.
--
-- SOLUTION: Update all policies to use TO authenticated and add
-- admin access checks.
--
-- Created: 2025-10-21
-- =====================================================

-- =====================================================
-- Drop old policies that use 'public' role
-- =====================================================
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- =====================================================
-- INSERT Policy: Users and admins can create recipes
-- =====================================================
CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can only insert recipes with their own user_id
    ((SELECT auth.jwt()->>'sub') = user_id)
  );

-- =====================================================
-- UPDATE Policy: Users and admins can update recipes
-- =====================================================
CREATE POLICY "Users and admins can update recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (
    -- Users can update their own recipes
    ((SELECT auth.jwt()->>'sub') = user_id)
    OR
    -- Admins can update all recipes
    ((SELECT (auth.jwt()->>'is_admin'))::boolean = true)
  )
  WITH CHECK (
    -- Users can only update their own recipes
    ((SELECT auth.jwt()->>'sub') = user_id)
    OR
    -- Admins can update any recipe
    ((SELECT (auth.jwt()->>'is_admin'))::boolean = true)
  );

-- =====================================================
-- DELETE Policy: Users and admins can delete recipes
-- =====================================================
CREATE POLICY "Users and admins can delete recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (
    -- Users can delete their own recipes
    ((SELECT auth.jwt()->>'sub') = user_id)
    OR
    -- Admins can delete any recipe
    ((SELECT (auth.jwt()->>'is_admin'))::boolean = true)
  );

-- =====================================================
-- Verification Query
-- =====================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'recipes'
ORDER BY cmd, policyname;

-- =====================================================
-- MIGRATION COMPLETE
-- Expected output: 5 policies (SELECT, INSERT, UPDATE, DELETE + public SELECT)
-- All should use 'authenticated' role except the public SELECT policy
-- =====================================================
