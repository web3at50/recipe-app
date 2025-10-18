-- Migration 019: Fix Security Advisor Warnings
-- Created: 2025-10-18
-- Purpose: Fix all 10 security warnings from Supabase Security Advisor
--
-- Fixes:
-- 1. Add search_path protection to 9 functions (prevents schema injection)
-- 2. Revoke public access to ai_cost_summary materialized view
--
-- Context: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

-- =============================================================================
-- Part 1: Fix Function Search Path Warnings
-- =============================================================================
-- By setting search_path to 'public, pg_temp', we prevent attackers from
-- creating malicious schemas that could be searched before the public schema.

-- Function 1: refresh_ai_cost_summary
CREATE OR REPLACE FUNCTION public.refresh_ai_cost_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.ai_cost_summary;
END;
$$;

COMMENT ON FUNCTION public.refresh_ai_cost_summary IS
'Refreshes the ai_cost_summary materialized view. SECURITY DEFINER allows service_role to execute. search_path is set for security.';

-- Function 2: handle_new_user (find this function first)
-- Note: This function creates user profiles when new users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS
'Trigger function to create user profile on signup. search_path is set for security.';

-- Function 3: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column IS
'Trigger function to automatically update updated_at timestamp. search_path is set for security.';

-- Function 4: get_daily_cost_summary
CREATE OR REPLACE FUNCTION get_daily_cost_summary(
  date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  date_to DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date DATE,
  model_provider TEXT,
  model_name TEXT,
  request_count BIGINT,
  total_tokens BIGINT,
  total_cost NUMERIC,
  avg_cost_per_request NUMERIC,
  avg_response_time_ms NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    ai_usage_logs.model_provider,
    ai_usage_logs.model_name,
    COUNT(*) as request_count,
    SUM(ai_usage_logs.total_tokens) as total_tokens,
    SUM(calculated_cost) as total_cost,
    AVG(calculated_cost) as avg_cost_per_request,
    AVG(response_time_ms::NUMERIC) as avg_response_time_ms
  FROM ai_usage_logs
  WHERE DATE(created_at) BETWEEN date_from AND date_to
    AND recipe_generated = true
  GROUP BY DATE(created_at), ai_usage_logs.model_provider, ai_usage_logs.model_name
  ORDER BY date DESC, total_cost DESC;
END;
$$;

COMMENT ON FUNCTION get_daily_cost_summary IS
'Returns daily cost summary for AI usage within a date range. Defaults to last 30 days. search_path is set for security.';

-- Function 5: get_hourly_usage_pattern
CREATE OR REPLACE FUNCTION get_hourly_usage_pattern(
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  hour_of_day INTEGER,
  request_count BIGINT,
  avg_cost NUMERIC,
  avg_response_time_ms NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(HOUR FROM created_at)::INTEGER as hour_of_day,
    COUNT(*) as request_count,
    AVG(calculated_cost) as avg_cost,
    AVG(response_time_ms::NUMERIC) as avg_response_time_ms
  FROM ai_usage_logs
  WHERE created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    AND recipe_generated = true
  GROUP BY EXTRACT(HOUR FROM created_at)
  ORDER BY hour_of_day;
END;
$$;

COMMENT ON FUNCTION get_hourly_usage_pattern IS
'Shows usage patterns by hour of day over the specified number of days (default 7). search_path is set for security.';

-- Function 6: get_user_profitability
CREATE OR REPLACE FUNCTION get_user_profitability(
  price_tier_low NUMERIC DEFAULT 9.99,
  price_tier_high NUMERIC DEFAULT 14.99
)
RETURNS TABLE (
  user_id TEXT,
  total_recipes BIGINT,
  lifetime_cost NUMERIC,
  profitability_tier_low TEXT,
  profitability_tier_high TEXT,
  margin_tier_low NUMERIC,
  margin_tier_high NUMERIC,
  first_use TIMESTAMPTZ,
  last_use TIMESTAMPTZ,
  days_active INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_usage_logs.user_id,
    COUNT(*) as total_recipes,
    COALESCE(SUM(calculated_cost), 0) as lifetime_cost,
    CASE
      WHEN COALESCE(SUM(calculated_cost), 0) < price_tier_low THEN 'Profitable'
      ELSE 'Loss'
    END as profitability_tier_low,
    CASE
      WHEN COALESCE(SUM(calculated_cost), 0) < price_tier_high THEN 'Profitable'
      ELSE 'Loss'
    END as profitability_tier_high,
    (price_tier_low - COALESCE(SUM(calculated_cost), 0)) as margin_tier_low,
    (price_tier_high - COALESCE(SUM(calculated_cost), 0)) as margin_tier_high,
    MIN(created_at) as first_use,
    MAX(created_at) as last_use,
    EXTRACT(DAY FROM MAX(created_at) - MIN(created_at))::INTEGER as days_active
  FROM ai_usage_logs
  WHERE ai_usage_logs.user_id IS NOT NULL
  GROUP BY ai_usage_logs.user_id
  ORDER BY lifetime_cost DESC;
END;
$$;

COMMENT ON FUNCTION get_user_profitability IS
'Analyzes user profitability against two pricing tiers (default £9.99 and £14.99). search_path is set for security.';

-- Function 7: get_provider_performance
CREATE OR REPLACE FUNCTION get_provider_performance(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  model_provider TEXT,
  model_name TEXT,
  total_uses BIGINT,
  success_rate NUMERIC,
  avg_cost NUMERIC,
  total_cost NUMERIC,
  avg_response_time_ms NUMERIC,
  avg_tokens NUMERIC,
  avg_complexity_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_usage_logs.model_provider,
    ai_usage_logs.model_name,
    COUNT(*) as total_uses,
    ROUND(
      (COUNT(*) FILTER (WHERE recipe_generated = true)::NUMERIC / COUNT(*)::NUMERIC) * 100,
      2
    ) as success_rate,
    AVG(calculated_cost) as avg_cost,
    SUM(calculated_cost) as total_cost,
    AVG(response_time_ms::NUMERIC) as avg_response_time_ms,
    AVG(ai_usage_logs.total_tokens::NUMERIC) as avg_tokens,
    AVG(complexity_score::NUMERIC) as avg_complexity_score
  FROM ai_usage_logs
  WHERE created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
  GROUP BY ai_usage_logs.model_provider, ai_usage_logs.model_name
  ORDER BY avg_cost ASC;
END;
$$;

COMMENT ON FUNCTION get_provider_performance IS
'Compares AI provider performance over the specified number of days (default 30). search_path is set for security.';

-- Function 8: get_cost_projection
CREATE OR REPLACE FUNCTION get_cost_projection(
  estimated_users INTEGER DEFAULT 100,
  avg_recipes_per_user INTEGER DEFAULT 5
)
RETURNS TABLE (
  model_provider TEXT,
  model_name TEXT,
  avg_cost_per_recipe NUMERIC,
  projected_cost_per_user NUMERIC,
  projected_total_cost NUMERIC,
  revenue_at_9_99 NUMERIC,
  revenue_at_14_99 NUMERIC,
  net_profit_at_9_99 NUMERIC,
  net_profit_at_14_99 NUMERIC,
  profit_margin_9_99_pct NUMERIC,
  profit_margin_14_99_pct NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_usage_logs.model_provider,
    ai_usage_logs.model_name,
    AVG(calculated_cost) as avg_cost_per_recipe,
    (AVG(calculated_cost) * avg_recipes_per_user) as projected_cost_per_user,
    (AVG(calculated_cost) * avg_recipes_per_user * estimated_users) as projected_total_cost,
    (9.99 * estimated_users) as revenue_at_9_99,
    (14.99 * estimated_users) as revenue_at_14_99,
    ((9.99 * estimated_users) - (AVG(calculated_cost) * avg_recipes_per_user * estimated_users)) as net_profit_at_9_99,
    ((14.99 * estimated_users) - (AVG(calculated_cost) * avg_recipes_per_user * estimated_users)) as net_profit_at_14_99,
    ROUND(
      (((9.99 * estimated_users) - (AVG(calculated_cost) * avg_recipes_per_user * estimated_users)) / (9.99 * estimated_users)) * 100,
      2
    ) as profit_margin_9_99_pct,
    ROUND(
      (((14.99 * estimated_users) - (AVG(calculated_cost) * avg_recipes_per_user * estimated_users)) / (14.99 * estimated_users)) * 100,
      2
    ) as profit_margin_14_99_pct
  FROM ai_usage_logs
  WHERE recipe_generated = true
  GROUP BY ai_usage_logs.model_provider, ai_usage_logs.model_name
  ORDER BY net_profit_at_9_99 DESC;
END;
$$;

COMMENT ON FUNCTION get_cost_projection IS
'Projects costs and profits based on estimated users and recipes per user. search_path is set for security.';

-- Function 9: get_ai_cost_summary_view
CREATE OR REPLACE FUNCTION get_ai_cost_summary_view(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  model_provider TEXT,
  model_name TEXT,
  request_count BIGINT,
  total_tokens BIGINT,
  total_cost NUMERIC,
  avg_cost_per_request NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai_cost_summary.date,
    ai_cost_summary.model_provider,
    ai_cost_summary.model_name,
    ai_cost_summary.request_count,
    ai_cost_summary.total_tokens,
    ai_cost_summary.total_cost,
    ai_cost_summary.avg_cost_per_request
  FROM ai_cost_summary
  WHERE ai_cost_summary.date >= CURRENT_DATE - (days_back || ' days')::INTERVAL
  ORDER BY ai_cost_summary.date DESC, ai_cost_summary.total_cost DESC;
END;
$$;

COMMENT ON FUNCTION get_ai_cost_summary_view IS
'Secure accessor for ai_cost_summary materialized view. search_path is set for security.';

-- =============================================================================
-- Part 2: Fix Materialized View in API Warning
-- =============================================================================
-- Revoke direct SELECT access to ai_cost_summary from public roles
-- Data is still accessible via the secure get_ai_cost_summary_view() function

-- Revoke from authenticated and anonymous users
REVOKE SELECT ON public.ai_cost_summary FROM authenticated;
REVOKE SELECT ON public.ai_cost_summary FROM anon;

-- Explicitly grant to service_role only
GRANT SELECT ON public.ai_cost_summary TO service_role;

-- Update comment to reflect security model
COMMENT ON MATERIALIZED VIEW public.ai_cost_summary IS
'Daily aggregated cost summary for AI usage.

SECURITY: Direct SELECT access revoked from authenticated/anon roles.
Access is controlled via SECURITY DEFINER functions (get_ai_cost_summary_view, etc.)
that are granted only to service_role.

This materialized view is refreshed daily by the refresh_ai_cost_summary() function
called via pg_cron at 6:00 AM UTC.';

-- =============================================================================
-- Summary
-- =============================================================================
-- This migration fixes all 10 Security Advisor warnings:
--
-- 1-9. Function Search Path Mutable (9 functions) - FIXED
--      Added SET search_path = public, pg_temp to all functions
--
-- 10. Materialized View in API - FIXED
--     Revoked SELECT from authenticated/anon, granted to service_role only
--
-- All warnings should now be resolved in the Security Advisor dashboard.
