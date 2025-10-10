-- =====================================================
-- RECIPE APP - SIMPLIFIED MVP SCHEMA
-- Fresh start with JSONB for flexibility
-- =====================================================

-- =====================================================
-- CLEANUP: Drop old complex tables
-- =====================================================

-- Drop junction and complex tables
DROP TABLE IF EXISTS recipe_categories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS cupboard_items CASCADE;
DROP TABLE IF EXISTS always_have_items CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipe_instructions CASCADE;

-- =====================================================
-- RECREATE recipes WITH SIMPLIFIED JSONB STRUCTURE
-- =====================================================

-- Drop and recreate recipes table with JSONB
DROP TABLE IF EXISTS recipes CASCADE;

CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  cuisine VARCHAR(100),
  source VARCHAR(50) CHECK (source IN ('ai_generated', 'user_created', 'imported')) DEFAULT 'user_created',

  -- Timing
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  servings INTEGER DEFAULT 4,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),

  -- Core data as JSONB (flexible, no joins needed)
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Format: [{"item": "tomatoes", "quantity": "400", "unit": "g", "notes": "chopped"}]

  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Format: [{"step": 1, "instruction": "Preheat oven to 180°C"}]

  -- Simple arrays (no junction tables)
  tags TEXT[] DEFAULT '{}', -- ['quick', 'vegetarian', 'batch-cooking']
  allergens TEXT[] DEFAULT '{}', -- ['dairy', 'gluten', 'nuts']

  -- Nutrition as JSONB
  nutrition JSONB,
  -- Format: {"calories": 450, "protein": 25, "carbs": 40, "fat": 15}

  -- Additional fields
  cost_per_serving DECIMAL(5,2),
  image_url TEXT,

  -- Status flags
  is_favorite BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  flagged_for_review BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_recipes_cuisine ON recipes(cuisine);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_tags ON recipes USING gin(tags);
CREATE INDEX idx_recipes_allergens ON recipes USING gin(allergens);
CREATE INDEX idx_recipes_is_favorite ON recipes(user_id, is_favorite) WHERE is_favorite = TRUE;

-- RLS Policies
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER PROFILES: Preferences as JSONB
-- =====================================================

-- Drop old profiles table if exists (will recreate with new structure)
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- All preferences in JSONB for flexibility
  preferences JSONB NOT NULL DEFAULT '{
    "dietary_restrictions": [],
    "allergies": [],
    "cuisines_liked": [],
    "cuisines_disliked": [],
    "disliked_ingredients": [],
    "cooking_skill": "intermediate",
    "household_size": 2,
    "budget_per_meal": null,
    "typical_cook_time": 30,
    "spice_level": "medium",
    "preferred_ai_model": "anthropic"
  }'::jsonb,

  onboarding_completed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for JSONB queries
CREATE INDEX idx_user_profiles_preferences ON user_profiles USING gin(preferences);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER INTERACTIONS: Track behavior for personalization
-- =====================================================

CREATE TABLE user_recipe_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,

  interaction_type VARCHAR(50) NOT NULL CHECK (
    interaction_type IN ('viewed', 'saved', 'unsaved', 'cooked', 'planned', 'added_to_shopping_list')
  ),

  session_duration INTEGER, -- seconds (optional)

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_interactions_user ON user_recipe_interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_recipe ON user_recipe_interactions(recipe_id, interaction_type);

-- RLS
ALTER TABLE user_recipe_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interactions"
  ON user_recipe_interactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- GDPR COMPLIANCE: User consents
-- =====================================================

CREATE TABLE user_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  consent_type VARCHAR(50) NOT NULL, -- 'essential', 'personalization', 'analytics'
  granted BOOLEAN NOT NULL,
  consent_version VARCHAR(20) NOT NULL DEFAULT '1.0',

  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  withdrawn_at TIMESTAMPTZ
);

CREATE INDEX idx_user_consents ON user_consents(user_id, consent_type, granted);

-- RLS
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own consents"
  ON user_consents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- MEAL PLANS: Keep existing structure (works fine)
-- =====================================================

-- Recreate meal_plans with simplified structure
DROP TABLE IF EXISTS meal_plan_items CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;

CREATE TABLE meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  week_start_date DATE NOT NULL, -- Monday of the week
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, week_start_date) -- One plan per week per user
);

CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_dates ON meal_plans(user_id, week_start_date);

-- RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plans"
  ON meal_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- MEAL PLAN ITEMS
-- =====================================================

CREATE TABLE meal_plan_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,

  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Monday, 6=Sunday
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),

  servings INTEGER DEFAULT 4,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(meal_plan_id, day_of_week, meal_type) -- One meal per slot
);

CREATE INDEX idx_meal_plan_items_plan ON meal_plan_items(meal_plan_id);

-- RLS
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plan items"
  ON meal_plan_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

-- =====================================================
-- SHOPPING LISTS: Keep existing structure
-- =====================================================

DROP TABLE IF EXISTS shopping_list_items CASCADE;
DROP TABLE IF EXISTS shopping_lists CASCADE;

CREATE TABLE shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL, -- Optional link

  name VARCHAR(255) DEFAULT 'Shopping List',
  notes TEXT,
  status VARCHAR(20) CHECK (status IN ('active', 'archived')) DEFAULT 'active',

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);

-- RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopping lists"
  ON shopping_lists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SHOPPING LIST ITEMS
-- =====================================================

CREATE TABLE shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL, -- Optional reference

  item_name VARCHAR(255) NOT NULL,
  quantity VARCHAR(100), -- Flexible text: "400g", "2 large", etc.
  category VARCHAR(50), -- produce, dairy, meat, pantry, etc.

  checked BOOLEAN DEFAULT FALSE,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(shopping_list_id);
CREATE INDEX idx_shopping_list_items_checked ON shopping_list_items(checked);

-- RLS
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopping list items"
  ON shopping_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_list_items_updated_at
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: Common allergens for reference
-- =====================================================

-- Note: We don't create a separate allergens table anymore,
-- just use TEXT[] arrays in recipes. Here's the list for reference:

-- UK 14 Major Allergens (as per Natasha's Law):
-- 1. Peanuts
-- 2. Tree nuts (almonds, hazelnuts, walnuts, cashews, pecans, Brazil nuts, pistachios, macadamia)
-- 3. Milk/Dairy
-- 4. Eggs
-- 5. Fish
-- 6. Shellfish (crustaceans, molluscs)
-- 7. Soy/Soya
-- 8. Gluten/Wheat
-- 9. Sesame
-- 10. Celery
-- 11. Mustard
-- 12. Lupin
-- 13. Sulphites/Sulphur dioxide
-- 14. (Molluscs listed separately sometimes)

-- =====================================================
-- COMPLETE! Ready for simplified MVP
-- =====================================================

-- Summary:
-- ✅ Recipes with JSONB (ingredients, instructions, tags, allergens)
-- ✅ User profiles with preferences JSONB
-- ✅ Behavioral tracking (interactions)
-- ✅ GDPR compliance (consents)
-- ✅ Meal plans (simplified)
-- ✅ Shopping lists (simplified)
-- ✅ All RLS policies enabled
-- ✅ No complex junction tables
-- ✅ No pantry tracking
-- ✅ No categories table

-- Next: Run `supabase db push` to apply this migration!
