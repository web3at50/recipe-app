-- Migration: Add 12-credit generation limit for demo users
-- Author: Claude Code
-- Date: 2025-11-10
-- Description: Implements credit-based rate limiting for recipe generation
--              Demo users get 12 free generation credits (1 credit per recipe, 4 for "All 4 Styles")
--              This enforces the portfolio demo limitation

-- Add generation credits used counter
ALTER TABLE user_profiles
ADD COLUMN generation_credits_used INTEGER DEFAULT 0 NOT NULL;

-- Add flag to track if warning has been shown at 10 credits
ALTER TABLE user_profiles
ADD COLUMN generation_credits_warning_shown BOOLEAN DEFAULT false NOT NULL;

-- Add index for quick credit lookups during generation
-- Warning threshold set at 10 credits (80% of 12-credit limit)
CREATE INDEX idx_user_profiles_credits ON user_profiles(generation_credits_used) WHERE generation_credits_used >= 10;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.generation_credits_used IS 'Number of generation credits consumed by user. Each single model generation = 1 credit, "All 4 Styles" = 4 credits. Demo users get 12 total (3 batches of 4, or 12 singles).';
COMMENT ON COLUMN user_profiles.generation_credits_warning_shown IS 'Tracks if the 10-credit warning has been shown to user (warning shown once at 10/12 credits).';
