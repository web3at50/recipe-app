-- AI Usage Tracking System
-- Created: 2025-10-17
-- Purpose: Track token usage, costs, and performance for AI recipe generation

-- Main usage logging table
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Request metadata
  user_id TEXT, -- Clerk user ID (TEXT not UUID since using Clerk)
  session_id TEXT,
  request_id TEXT UNIQUE NOT NULL,

  -- Model information
  model_provider TEXT NOT NULL CHECK (model_provider IN ('openai', 'claude', 'gemini', 'grok')),
  model_name TEXT NOT NULL,
  model_version TEXT,

  -- Token usage (actual counts from API responses)
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cached_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,

  -- Cost calculation (prices at time of request)
  input_cost_per_million DECIMAL(10, 6),
  output_cost_per_million DECIMAL(10, 6),
  cached_cost_per_million DECIMAL(10, 6),
  calculated_cost DECIMAL(10, 8), -- Actual calculated cost for this request

  -- Request details
  complexity_score INTEGER, -- OpenAI complexity routing score
  recipe_generated BOOLEAN DEFAULT true NOT NULL, -- Success or failure
  error_message TEXT, -- Error details if failed
  response_time_ms INTEGER, -- Latency tracking

  -- Recipe metadata (for analysis)
  ingredient_count INTEGER,
  allergen_count INTEGER,
  dietary_restriction_count INTEGER
);

-- Indexes for query performance
CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_ai_usage_logs_model_provider ON public.ai_usage_logs(model_provider);
CREATE INDEX idx_ai_usage_logs_calculated_cost ON public.ai_usage_logs(calculated_cost DESC);
CREATE INDEX idx_ai_usage_logs_recipe_generated ON public.ai_usage_logs(recipe_generated);

-- Enable Row Level Security
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: System can insert (service role only)
CREATE POLICY "System can insert AI usage logs"
  ON public.ai_usage_logs
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: No public read access (admin dashboard uses service role)
CREATE POLICY "No public read access to AI usage logs"
  ON public.ai_usage_logs
  FOR SELECT
  USING (false);

-- Materialized view for daily cost summaries
CREATE MATERIALIZED VIEW IF NOT EXISTS public.ai_cost_summary AS
SELECT
  DATE_TRUNC('day', created_at)::DATE AS date,
  model_provider,
  model_name,
  COUNT(*) AS request_count,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  SUM(total_tokens) AS total_tokens,
  ROUND(AVG(total_tokens))::INTEGER AS avg_tokens_per_request,
  SUM(calculated_cost) AS total_cost,
  AVG(calculated_cost) AS avg_cost_per_request,
  ROUND(AVG(response_time_ms))::INTEGER AS avg_response_time_ms,
  COUNT(CASE WHEN recipe_generated = false THEN 1 END) AS failed_requests
FROM public.ai_usage_logs
GROUP BY DATE_TRUNC('day', created_at)::DATE, model_provider, model_name
ORDER BY date DESC, total_cost DESC;

-- Index on materialized view
CREATE INDEX idx_ai_cost_summary_date ON public.ai_cost_summary(date DESC);
CREATE INDEX idx_ai_cost_summary_provider ON public.ai_cost_summary(model_provider);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION public.refresh_ai_cost_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.ai_cost_summary;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.refresh_ai_cost_summary() TO service_role;

-- Comment the tables for documentation
COMMENT ON TABLE public.ai_usage_logs IS 'Tracks token usage, costs, and performance for all AI recipe generation requests';
COMMENT ON MATERIALIZED VIEW public.ai_cost_summary IS 'Materialized view providing daily aggregated cost summaries by model provider';
COMMENT ON COLUMN public.ai_usage_logs.user_id IS 'Clerk user ID (null for anonymous users)';
COMMENT ON COLUMN public.ai_usage_logs.request_id IS 'Unique identifier for deduplication';
COMMENT ON COLUMN public.ai_usage_logs.input_tokens IS 'Actual token count from AI provider (prompt)';
COMMENT ON COLUMN public.ai_usage_logs.output_tokens IS 'Actual token count from AI provider (completion)';
COMMENT ON COLUMN public.ai_usage_logs.cached_tokens IS 'Cached input tokens (cost savings)';
COMMENT ON COLUMN public.ai_usage_logs.calculated_cost IS 'Computed cost in USD based on provider pricing';
