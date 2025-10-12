-- =====================================================
-- ADD PREFERENCE STATE TO PANTRY STAPLES
-- Date: October 2025
-- Purpose: Implement 3-state preference system (hide/show/auto)
-- =====================================================

-- Add preference_state column with default value 'auto'
ALTER TABLE user_pantry_staples
ADD COLUMN preference_state TEXT NOT NULL DEFAULT 'auto'
CHECK (preference_state IN ('hide', 'show', 'auto'));

-- Add comment for clarity
COMMENT ON COLUMN user_pantry_staples.preference_state IS
  'User preference: hide (force hide), show (force show), auto (let system decide)';

-- Create index for filtering by preference state
CREATE INDEX idx_user_pantry_staples_preference
  ON user_pantry_staples(user_id, preference_state);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds a 3-state preference system:
-- - 'auto': Let the system auto-detect (default)
-- - 'hide': Always hide this item from shopping lists
-- - 'show': Always show this item on shopping lists
-- =====================================================
