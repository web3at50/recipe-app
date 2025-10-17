/**
 * Daily LLM Usage Report Edge Function
 *
 * Purpose: Aggregates AI usage data and generates daily cost/performance reports
 * Schedule: Runs daily at 8:30 AM via pg_cron
 *
 * Returns:
 * - Yesterday's cost summary by provider
 * - Total costs and token usage
 * - Provider performance comparison
 * - User profitability insights
 *
 * Usage:
 * Deploy: supabase functions deploy daily-llm-usage --project-ref hvxjxcatbwfqrydxqfjq --no-verify-jwt
 * Schedule via psql cron job (see docs/AI_Usage_Analytics.md)
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

interface DailyCostRow {
  date: string;
  model_provider: string;
  model_name: string;
  request_count: number;
  total_tokens: number;
  total_cost: number;
  avg_cost_per_request: number;
  avg_response_time_ms: number;
}

interface ProviderPerformanceRow {
  model_provider: string;
  model_name: string;
  total_uses: number;
  success_rate: number;
  avg_cost: number;
  total_cost: number;
  avg_response_time_ms: number;
  avg_tokens: number;
  avg_complexity_score: number;
}

interface UserProfitabilityRow {
  user_id: string;
  total_recipes: number;
  lifetime_cost: number;
  profitability_tier_low: string;
  profitability_tier_high: string;
  margin_tier_low: number;
  margin_tier_high: number;
  first_use: string;
  last_use: string;
  days_active: number;
}

Deno.serve(async (req: Request) => {
  try {
    // Initialize Supabase client with service_role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date range (yesterday)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 1. Get yesterday's cost summary
    const { data: dailyCosts, error: dailyCostsError } = await supabase
      .rpc('get_daily_cost_summary', {
        date_from: yesterdayStr,
        date_to: yesterdayStr,
      }) as { data: DailyCostRow[] | null; error: unknown };

    if (dailyCostsError) {
      console.error('Error fetching daily costs:', dailyCostsError);
      throw new Error('Failed to fetch daily cost summary');
    }

    // 2. Get provider performance (last 7 days for trends)
    const { data: providerPerf, error: providerPerfError } = await supabase
      .rpc('get_provider_performance', { days_back: 7 }) as {
        data: ProviderPerformanceRow[] | null;
        error: unknown
      };

    if (providerPerfError) {
      console.error('Error fetching provider performance:', providerPerfError);
      throw new Error('Failed to fetch provider performance');
    }

    // 3. Get user profitability stats
    const { data: userProfit, error: userProfitError } = await supabase
      .rpc('get_user_profitability', {
        price_tier_low: 9.99,
        price_tier_high: 14.99,
      }) as { data: UserProfitabilityRow[] | null; error: unknown };

    if (userProfitError) {
      console.error('Error fetching user profitability:', userProfitError);
      throw new Error('Failed to fetch user profitability');
    }

    // 4. Refresh materialized view
    const { error: refreshError } = await supabase
      .rpc('refresh_materialized_view', { view_name: 'ai_cost_summary' })
      .single();

    // Note: If refresh fails, it's not critical - continue with report
    if (refreshError) {
      console.warn('Warning: Failed to refresh materialized view:', refreshError);
    }

    // Calculate summary statistics
    const totalCost = dailyCosts?.reduce((sum, row) => sum + Number(row.total_cost), 0) || 0;
    const totalRequests = dailyCosts?.reduce((sum, row) => sum + Number(row.request_count), 0) || 0;
    const totalTokens = dailyCosts?.reduce((sum, row) => sum + Number(row.total_tokens), 0) || 0;

    // User profitability summary
    const profitableAt999 = userProfit?.filter(u => u.profitability_tier_low === 'Profitable').length || 0;
    const profitableAt1499 = userProfit?.filter(u => u.profitability_tier_high === 'Profitable').length || 0;
    const totalUsers = userProfit?.length || 0;

    // Build response
    const report = {
      generated_at: new Date().toISOString(),
      report_date: yesterdayStr,
      summary: {
        total_cost: totalCost.toFixed(6),
        total_requests: totalRequests,
        total_tokens: totalTokens,
        avg_cost_per_request: totalRequests > 0 ? (totalCost / totalRequests).toFixed(6) : '0',
      },
      daily_costs: dailyCosts || [],
      provider_performance_7d: providerPerf || [],
      user_profitability: {
        total_users: totalUsers,
        profitable_at_9_99: profitableAt999,
        profitable_at_9_99_pct: totalUsers > 0 ? ((profitableAt999 / totalUsers) * 100).toFixed(1) : '0',
        profitable_at_14_99: profitableAt1499,
        profitable_at_14_99_pct: totalUsers > 0 ? ((profitableAt1499 / totalUsers) * 100).toFixed(1) : '0',
        top_10_users_by_cost: userProfit?.slice(0, 10) || [],
      },
      insights: {
        cheapest_provider: providerPerf?.[0] || null,
        fastest_provider: providerPerf?.sort((a, b) =>
          Number(a.avg_response_time_ms) - Number(b.avg_response_time_ms)
        )[0] || null,
        most_reliable_provider: providerPerf?.sort((a, b) =>
          Number(b.success_rate) - Number(a.success_rate)
        )[0] || null,
      },
    };

    return new Response(JSON.stringify(report, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in daily-llm-usage function:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
