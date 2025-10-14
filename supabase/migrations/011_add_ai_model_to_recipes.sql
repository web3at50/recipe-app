-- =====================================================
-- ADD AI MODEL TRACKING TO RECIPES
-- =====================================================
-- Track which AI model generated each recipe for testing
-- and analytics purposes

-- Add ai_model column to recipes table
ALTER TABLE recipes
ADD COLUMN ai_model VARCHAR(20) CHECK (
  ai_model IN ('model_1', 'model_2', 'model_3', 'model_4')
);

-- Add comment for documentation
COMMENT ON COLUMN recipes.ai_model IS 'AI model used to generate recipe (model_1=OpenAI, model_2=Claude, model_3=Gemini, model_4=XAI). NULL for user-created recipes.';

-- Create index for analytics queries
CREATE INDEX idx_recipes_ai_model ON recipes(ai_model) WHERE ai_model IS NOT NULL;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next: Run `supabase db push` to apply this migration
