/**
 * AI Usage Analytics Dashboard
 *
 * Admin-only page for monitoring AI costs, performance, and user profitability
 * Displays real-time metrics from ai_usage_logs and ai_cost_summary tables
 *
 * Route: /settings/ai-usage
 */

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface ProviderPerfRow {
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

interface UserProfitRow {
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

interface CostProjectionRow {
  model_provider: string;
  model_name: string;
  avg_cost_per_recipe: number;
  projected_cost_per_user: number;
  projected_total_cost: number;
  revenue_at_9_99: number;
  revenue_at_14_99: number;
  net_profit_at_9_99: number;
  net_profit_at_14_99: number;
  profit_margin_9_99_pct: number;
  profit_margin_14_99_pct: number;
}

// Load admin user IDs from environment variable
// Format: ADMIN_USER_IDS=user_id1,user_id2,user_id3
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];

export default async function AIUsagePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user is admin
  if (!ADMIN_USER_IDS.includes(userId)) {
    console.warn(`Non-admin user ${userId} attempted to access AI usage dashboard`);
    redirect('/');
  }

  const supabase = await createClient();

  // Fetch analytics data using the SQL functions we created
  const dailyCostsPromise = supabase.rpc('get_daily_cost_summary', {
    date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
  });

  const providerPerfPromise = supabase.rpc('get_provider_performance', { days_back: 30 });

  const userProfitPromise = supabase.rpc('get_user_profitability', {
    price_tier_low: 9.99,
    price_tier_high: 14.99,
  });

  const costProjectionPromise = supabase.rpc('get_cost_projection', {
    estimated_users: 100,
    avg_recipes_per_user: 5,
  });

  const [
    { data: dailyCosts },
    { data: providerPerf },
    { data: userProfit },
    { data: costProjection },
  ] = await Promise.all([
    dailyCostsPromise,
    providerPerfPromise,
    userProfitPromise,
    costProjectionPromise,
  ]);

  // Calculate summary stats
  const totalCost = (dailyCosts || []).reduce((sum: number, row: DailyCostRow) => sum + Number(row.total_cost), 0);
  const totalRequests = (dailyCosts || []).reduce((sum: number, row: DailyCostRow) => sum + Number(row.request_count), 0);
  const totalTokens = (dailyCosts || []).reduce((sum: number, row: DailyCostRow) => sum + Number(row.total_tokens), 0);

  const profitableAt999 = (userProfit || []).filter((u: UserProfitRow) => u.profitability_tier_low === 'Profitable').length;
  const profitableAt1499 = (userProfit || []).filter((u: UserProfitRow) => u.profitability_tier_high === 'Profitable').length;
  const totalUsers = (userProfit || []).length;

  // Get cheapest and fastest providers
  const cheapestProvider = (providerPerf || []).sort((a: ProviderPerfRow, b: ProviderPerfRow) => Number(a.avg_cost) - Number(b.avg_cost))[0];
  const fastestProvider = (providerPerf || []).sort(
    (a: ProviderPerfRow, b: ProviderPerfRow) => Number(a.avg_response_time_ms) - Number(b.avg_response_time_ms)
  )[0];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">AI Usage Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Monitor AI costs, performance, and user profitability (Last 30 days)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost (30d)</CardTitle>
            <span className="text-xl">£</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalRequests} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Recipe</CardTitle>
            <span className="text-xl">£</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              £{totalRequests > 0 ? (totalCost / totalRequests).toFixed(4) : '0.0000'}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTokens.toLocaleString()} total tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users (Profitable)</CardTitle>
            <span className="text-xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profitableAt999} / {totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              At £9.99 tier ({totalUsers > 0 ? ((profitableAt999 / totalUsers) * 100).toFixed(0) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cheapest Provider</CardTitle>
            <span className="text-xl">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{cheapestProvider?.model_provider || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              £{cheapestProvider ? Number(cheapestProvider.avg_cost).toFixed(4) : '0.0000'}/recipe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="daily">Daily Breakdown</TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Performance Comparison</CardTitle>
              <CardDescription>Cost, speed, and reliability metrics (30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Uses</TableHead>
                    <TableHead className="text-right">Success Rate</TableHead>
                    <TableHead className="text-right">Avg Cost</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead className="text-right">Avg Speed (ms)</TableHead>
                    <TableHead className="text-right">Avg Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(providerPerf || []).map((row: ProviderPerfRow, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium capitalize">{row.model_provider}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.model_name}</TableCell>
                      <TableCell className="text-right">{row.total_uses}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={Number(row.success_rate) > 95 ? 'default' : 'secondary'}>
                          {Number(row.success_rate).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">£{Number(row.avg_cost).toFixed(4)}</TableCell>
                      <TableCell className="text-right">£{Number(row.total_cost).toFixed(2)}</TableCell>
                      <TableCell className="text-right">{Number(row.avg_response_time_ms).toFixed(0)}ms</TableCell>
                      <TableCell className="text-right">{Number(row.avg_tokens).toFixed(0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Quick Insights */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">🏆 Cheapest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold capitalize">{cheapestProvider?.model_provider || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">
                      £{cheapestProvider ? Number(cheapestProvider.avg_cost).toFixed(4) : '0'} per recipe
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">⚡ Fastest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold capitalize">{fastestProvider?.model_provider || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">
                      {fastestProvider ? Number(fastestProvider.avg_response_time_ms).toFixed(0) : '0'}ms avg response
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Profitability Analysis</CardTitle>
              <CardDescription>
                Lifetime costs vs £9.99 and £14.99 pricing tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">£9.99 Tier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{profitableAt999}</div>
                    <p className="text-sm text-muted-foreground">
                      profitable users ({totalUsers > 0 ? ((profitableAt999 / totalUsers) * 100).toFixed(1) : 0}%)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">£14.99 Tier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{profitableAt1499}</div>
                    <p className="text-sm text-muted-foreground">
                      profitable users ({totalUsers > 0 ? ((profitableAt1499 / totalUsers) * 100).toFixed(1) : 0}%)
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead className="text-right">Recipes</TableHead>
                    <TableHead className="text-right">Lifetime Cost</TableHead>
                    <TableHead className="text-right">Margin @ £9.99</TableHead>
                    <TableHead className="text-right">Margin @ £14.99</TableHead>
                    <TableHead className="text-right">Days Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(userProfit || []).slice(0, 20).map((row: UserProfitRow, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs">
                        {row.user_id.substring(0, 20)}...
                      </TableCell>
                      <TableCell className="text-right">{row.total_recipes}</TableCell>
                      <TableCell className="text-right">£{Number(row.lifetime_cost).toFixed(4)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            Number(row.margin_tier_low) > 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          £{Number(row.margin_tier_low).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            Number(row.margin_tier_high) > 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          £{Number(row.margin_tier_high).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{row.days_active}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Projections</CardTitle>
              <CardDescription>
                Projected costs and profits for 100 users × 5 recipes each
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Cost/Recipe</TableHead>
                    <TableHead className="text-right">Total Cost (500 recipes)</TableHead>
                    <TableHead className="text-right">Profit @ £9.99</TableHead>
                    <TableHead className="text-right">Profit @ £14.99</TableHead>
                    <TableHead className="text-right">Margin @ £9.99</TableHead>
                    <TableHead className="text-right">Margin @ £14.99</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(costProjection || []).map((row: CostProjectionRow, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium capitalize">{row.model_provider}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.model_name}</TableCell>
                      <TableCell className="text-right">£{Number(row.avg_cost_per_recipe).toFixed(4)}</TableCell>
                      <TableCell className="text-right">£{Number(row.projected_total_cost).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            Number(row.net_profit_at_9_99) > 0 ? 'text-green-600 font-bold' : 'text-red-600'
                          }
                        >
                          £{Number(row.net_profit_at_9_99).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            Number(row.net_profit_at_14_99) > 0 ? 'text-green-600 font-bold' : 'text-red-600'
                          }
                        >
                          £{Number(row.net_profit_at_14_99).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(row.profit_margin_9_99_pct).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(row.profit_margin_14_99_pct).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Breakdown Tab */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Cost Breakdown</CardTitle>
              <CardDescription>Last 30 days of usage by provider</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead className="text-right">Avg Cost</TableHead>
                    <TableHead className="text-right">Avg Speed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dailyCosts || []).map((row: DailyCostRow, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{row.model_provider}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.model_name}</TableCell>
                      <TableCell className="text-right">{row.request_count}</TableCell>
                      <TableCell className="text-right">{Number(row.total_tokens).toLocaleString()}</TableCell>
                      <TableCell className="text-right">£{Number(row.total_cost).toFixed(4)}</TableCell>
                      <TableCell className="text-right">£{Number(row.avg_cost_per_request).toFixed(4)}</TableCell>
                      <TableCell className="text-right">{Number(row.avg_response_time_ms).toFixed(0)}ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
