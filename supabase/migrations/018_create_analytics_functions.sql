-- Migration 018: Create SQL Helper Functions for AI Usage Analytics
-- Created: 2025-10-17
-- Purpose: Provide convenient SQL functions for common analytics queries

-- Function 1: Get daily cost summary for a date range
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
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_daily_cost_summary IS
'Returns daily cost summary for AI usage within a date range. Defaults to last 30 days.';

-- Function 2: Get user profitability analysis
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
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_profitability IS
'Analyzes user profitability against two pricing tiers (default £9.99 and £14.99). Returns margin calculations for each tier.';

-- Function 3: Get provider performance comparison
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
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_provider_performance IS
'Compares AI provider performance over the specified number of days (default 30). Returns costs, speed, and reliability metrics.';

-- Function 4: Get cost projection
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
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_cost_projection IS
'Projects costs and profits based on estimated users and recipes per user. Calculates net profit at £9.99 and £14.99 price points.';

-- Function 5: Get hourly usage pattern
CREATE OR REPLACE FUNCTION get_hourly_usage_pattern(
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  hour_of_day INTEGER,
  request_count BIGINT,
  avg_cost NUMERIC,
  avg_response_time_ms NUMERIC
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_hourly_usage_pattern IS
'Shows usage patterns by hour of day over the specified number of days (default 7). Useful for understanding peak usage times.';

-- Function 6: Get cost summary from materialized view (secure accessor)
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
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_ai_cost_summary_view IS
'Secure accessor for ai_cost_summary materialized view. Since materialized views do not support RLS, this function provides controlled access with SECURITY DEFINER.';

-- Grant execute permissions to service_role
GRANT EXECUTE ON FUNCTION get_daily_cost_summary TO service_role;
GRANT EXECUTE ON FUNCTION get_user_profitability TO service_role;
GRANT EXECUTE ON FUNCTION get_provider_performance TO service_role;
GRANT EXECUTE ON FUNCTION get_cost_projection TO service_role;
GRANT EXECUTE ON FUNCTION get_hourly_usage_pattern TO service_role;
GRANT EXECUTE ON FUNCTION get_ai_cost_summary_view TO service_role;
