-- =====================================================
-- USER PANTRY STAPLES: Custom user preferences
-- Allow users to mark specific items as always-hide/always-show
-- =====================================================

CREATE TABLE user_pantry_staples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  item_pattern TEXT NOT NULL, -- "olive oil", "stock cube", "salt"

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure each user can only have one entry per item pattern
  UNIQUE(user_id, item_pattern)
);

-- Index for fast lookups
CREATE INDEX idx_user_pantry_staples_user ON user_pantry_staples(user_id);

-- RLS: Users can only manage their own pantry staples
ALTER TABLE user_pantry_staples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pantry staples"
  ON user_pantry_staples FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pantry staples"
  ON user_pantry_staples FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pantry staples"
  ON user_pantry_staples FOR DELETE
  USING (auth.uid() = user_id);
