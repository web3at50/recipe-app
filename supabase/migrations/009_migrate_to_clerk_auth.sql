-- =====================================================
-- MIGRATION: Supabase Auth → Clerk Auth RLS Policies
-- Date: October 2025
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL RLS POLICIES FIRST
-- (Required before changing column types)
-- =====================================================

-- Drop recipes policies
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- Drop user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Drop user_recipe_interactions policies
DROP POLICY IF EXISTS "Users can manage own interactions" ON user_recipe_interactions;

-- Drop user_consents policies
DROP POLICY IF EXISTS "Users can manage own consents" ON user_consents;

-- Drop meal_plans policies
DROP POLICY IF EXISTS "Users can manage own meal plans" ON meal_plans;

-- Drop meal_plan_items policies
DROP POLICY IF EXISTS "Users can manage own meal plan items" ON meal_plan_items;

-- Drop shopping_lists policies
DROP POLICY IF EXISTS "Users can manage own shopping lists" ON shopping_lists;

-- Drop shopping_list_items policies
DROP POLICY IF EXISTS "Users can manage own shopping list items" ON shopping_list_items;

-- Drop user_pantry_staples policies (has 3 separate policies!)
DROP POLICY IF EXISTS "Users can view own pantry staples" ON user_pantry_staples;
DROP POLICY IF EXISTS "Users can insert own pantry staples" ON user_pantry_staples;
DROP POLICY IF EXISTS "Users can delete own pantry staples" ON user_pantry_staples;
DROP POLICY IF EXISTS "Users can manage own pantry staples" ON user_pantry_staples;

-- =====================================================
-- STEP 2: CHANGE COLUMN TYPES FROM UUID TO TEXT
-- (Clerk user IDs are strings like "user_2abc123...")
-- =====================================================

-- Remove foreign key constraints to auth.users
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_user_id_fkey;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
ALTER TABLE user_recipe_interactions DROP CONSTRAINT IF EXISTS user_recipe_interactions_user_id_fkey;
ALTER TABLE user_consents DROP CONSTRAINT IF EXISTS user_consents_user_id_fkey;
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_id_fkey;
ALTER TABLE shopping_lists DROP CONSTRAINT IF EXISTS shopping_lists_user_id_fkey;
ALTER TABLE user_pantry_staples DROP CONSTRAINT IF EXISTS user_pantry_staples_user_id_fkey;

-- Change user_id column types from UUID to TEXT
ALTER TABLE recipes ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_profiles ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_recipe_interactions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_consents ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE meal_plans ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE shopping_lists ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE user_pantry_staples ALTER COLUMN user_id TYPE TEXT;

-- =====================================================
-- STEP 3: CREATE NEW RLS POLICIES WITH CLERK JWT
-- =====================================================

-- RECIPES TABLE
CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  USING ((auth.jwt()->>'sub') = user_id);

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK ((auth.jwt()->>'sub') = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING ((auth.jwt()->>'sub') = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING ((auth.jwt()->>'sub') = user_id);

-- USER PROFILES TABLE
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING ((auth.jwt()->>'sub') = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK ((auth.jwt()->>'sub') = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING ((auth.jwt()->>'sub') = user_id);

-- USER RECIPE INTERACTIONS TABLE
CREATE POLICY "Users can manage own interactions"
  ON user_recipe_interactions FOR ALL
  USING ((auth.jwt()->>'sub') = user_id)
  WITH CHECK ((auth.jwt()->>'sub') = user_id);

-- USER CONSENTS TABLE
CREATE POLICY "Users can manage own consents"
  ON user_consents FOR ALL
  USING ((auth.jwt()->>'sub') = user_id)
  WITH CHECK ((auth.jwt()->>'sub') = user_id);

-- MEAL PLANS TABLE
CREATE POLICY "Users can manage own meal plans"
  ON meal_plans FOR ALL
  USING ((auth.jwt()->>'sub') = user_id)
  WITH CHECK ((auth.jwt()->>'sub') = user_id);

-- MEAL PLAN ITEMS TABLE
CREATE POLICY "Users can manage own meal plan items"
  ON meal_plan_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = (auth.jwt()->>'sub')
    )
  );

-- SHOPPING LISTS TABLE
CREATE POLICY "Users can manage own shopping lists"
  ON shopping_lists FOR ALL
  USING ((auth.jwt()->>'sub') = user_id)
  WITH CHECK ((auth.jwt()->>'sub') = user_id);

-- SHOPPING LIST ITEMS TABLE
CREATE POLICY "Users can manage own shopping list items"
  ON shopping_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = (auth.jwt()->>'sub')
    )
  );

-- USER PANTRY STAPLES TABLE
CREATE POLICY "Users can manage own pantry staples"
  ON user_pantry_staples FOR ALL
  USING ((auth.jwt()->>'sub') = user_id)
  WITH CHECK ((auth.jwt()->>'sub') = user_id);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Check that all policies are created correctly
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN (
  'recipes',
  'user_profiles',
  'meal_plans',
  'meal_plan_items',
  'shopping_lists',
  'shopping_list_items',
  'user_consents',
  'user_recipe_interactions',
  'user_pantry_staples'
)
ORDER BY tablename, policyname;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
