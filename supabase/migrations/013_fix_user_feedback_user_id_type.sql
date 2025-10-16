-- =====================================================
-- FIX: user_feedback.user_id column type
-- =====================================================
-- Problem: Table was created with user_id as UUID instead of TEXT
-- Solution: Drop and recreate with correct TEXT type for Clerk user IDs
-- Date: October 2025
-- =====================================================

-- Drop existing table (safe - no production data yet)
DROP TABLE IF EXISTS user_feedback CASCADE;

-- Recreate with correct TEXT type for Clerk user IDs
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- TEXT for Clerk IDs (like "user_343GLhFKUHk3i07cyDGXDM2jCGi"), not UUID
  page TEXT NOT NULL DEFAULT 'generate',

  -- Feedback content
  liked TEXT,
  disliked TEXT,
  device_type TEXT,
  suggestions TEXT,

  -- Optional ratings (1-5 scale)
  overall_rating INTEGER CHECK (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 5)),
  ease_of_use INTEGER CHECK (ease_of_use IS NULL OR (ease_of_use >= 1 AND ease_of_use <= 5)),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER
);

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedback
-- Use 'public' role (not 'authenticated') because we use Clerk Auth, not Supabase Auth
CREATE POLICY "Users can insert feedback"
  ON user_feedback FOR INSERT
  TO public
  WITH CHECK ((auth.jwt() ->> 'sub'::text) IS NOT NULL);

-- Policy: Users can view their own feedback
-- Use auth.jwt() ->> 'sub' pattern (same as all other tables) instead of auth.uid()
-- auth.uid() tries to cast to UUID which fails with Clerk user IDs
CREATE POLICY "Users can view own feedback"
  ON user_feedback FOR SELECT
  TO public
  USING ((auth.jwt() ->> 'sub'::text) = user_id);

-- Indexes for efficient queries
CREATE INDEX idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX idx_user_feedback_created_at ON user_feedback(created_at DESC);
CREATE INDEX idx_user_feedback_page ON user_feedback(page);

-- Comment
COMMENT ON TABLE user_feedback IS 'Stores user feedback submissions from the application';
