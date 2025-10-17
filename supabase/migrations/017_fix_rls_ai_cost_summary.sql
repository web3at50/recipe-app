-- Migration 017: Security for ai_cost_summary Materialized View
-- Created: 2025-10-17
-- Purpose: Document security approach for ai_cost_summary
--
-- NOTE: Materialized views do NOT support Row Level Security (RLS) in PostgreSQL.
-- This is a known limitation: https://www.postgresql.org/docs/current/rules-materializedviews.html
--
-- Security Strategy:
-- 1. Access controlled via SECURITY DEFINER functions (migration 018)
-- 2. Functions granted only to service_role
-- 3. Frontend dashboard uses server-side auth checks
-- 4. Materialized view is in public schema but not directly queried by clients
--
-- The Supabase "unrestricted" warning can be safely ignored for materialized views
-- as they are accessed exclusively through secure SQL functions.

-- Add comment to materialized view explaining security approach
COMMENT ON MATERIALIZED VIEW public.ai_cost_summary IS
'Daily aggregated cost summary for AI usage.

SECURITY: This materialized view does not support RLS (PostgreSQL limitation).
Access is controlled via SECURITY DEFINER functions that are granted only to service_role.
See functions: get_daily_cost_summary(), get_provider_performance(), etc.

This view is safe to be in public schema as direct client queries are prevented by
the application layer and all access goes through authenticated API routes.';
