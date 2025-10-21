-- =====================================================
-- MIGRATION: Add Admin Access via JWT Claims
--
-- Allow users with 'is_admin: true' in their Clerk JWT
-- to view all recipes, not just their own.
--
-- Security Pattern:
-- - Uses Clerk JWT custom claims (cryptographically signed)
-- - No service role keys exposed
-- - Maintains audit trail (queries logged with admin user ID)
-- - Follows Clerk + Supabase 2025 best practices
--
-- Prerequisites:
-- 1. Clerk session token customized to include: "is_admin": "{{user.public_metadata.is_admin}}"
-- 2. Admin users have is_admin: true in their Clerk public metadata
--
-- Created: 2025-10-20
-- =====================================================

-- Drop the old restrictive policy that only allowed viewing own recipes
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;

-- Create new policy that allows:
-- 1. Users to view their own recipes
-- 2. Admins (is_admin: true in JWT) to view ALL recipes
-- 3. Everyone to view public recipes
CREATE POLICY "Users and admins can view recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    -- Users can view their own recipes
    ((SELECT auth.jwt()->>'sub') = user_id)
    OR
    -- Admins can view all recipes (reads from Clerk JWT claim)
    ((SELECT (auth.jwt()->>'is_admin'))::boolean = true)
    OR
    -- Public recipes visible to everyone
    (is_public = true)
  );

-- Verify the new policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'recipes' AND policyname = 'Users and admins can view recipes';
