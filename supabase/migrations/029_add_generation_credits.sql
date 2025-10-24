-- Migration: Add generation credit tracking to user_profiles
-- Author: Claude Code
-- Date: 2025-10-24
-- Description: Implements credit-based rate limiting for recipe generation
--              Users get 40 free generation credits (1 credit per recipe, 4 for "All 4 Styles")
--              Admin users (from ADMIN_USER_IDS env var) bypass all limits

-- Add generation credits used counter
ALTER TABLE user_profiles
ADD COLUMN generation_credits_used INTEGER DEFAULT 0 NOT NULL;

-- Add flag to track if warning has been shown at 35 credits
ALTER TABLE user_profiles
ADD COLUMN generation_credits_warning_shown BOOLEAN DEFAULT false NOT NULL;

-- Add index for quick credit lookups during generation
CREATE INDEX idx_user_profiles_credits ON user_profiles(generation_credits_used) WHERE generation_credits_used >= 35;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.generation_credits_used IS 'Number of generation credits consumed by user. Each single model generation = 1 credit, "All 4 Styles" = 4 credits. Free users get 40 total. Admin users bypass limits.';
COMMENT ON COLUMN user_profiles.generation_credits_warning_shown IS 'Tracks if the 35-credit warning has been shown to user (warning shown once at 35/40 credits).';
