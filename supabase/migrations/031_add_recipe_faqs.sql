-- =====================================================
-- ADD FAQs TO RECIPES FOR LLM OPTIMIZATION
-- =====================================================

-- Add faqs column to recipes table
-- FAQs help with SEO and LLM crawlers understanding recipe content
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT NULL;

-- Create index for JSONB queries on FAQs
CREATE INDEX IF NOT EXISTS idx_recipes_faqs ON recipes USING gin(faqs);

-- Comment explaining the purpose
COMMENT ON COLUMN recipes.faqs IS 'Frequently Asked Questions for LLM optimization. Format: [{"question": "...", "answer": "..."}]. Typically includes: allergen info, make-ahead guidance, substitutions, storage tips.';
