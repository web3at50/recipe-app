# AI Usage Tracking Implementation Plan
## Phase 2: Real-Time Cost Monitoring

**Created:** 2025-10-17
**Status:** Planning Phase
**Purpose:** Track actual token usage and costs for AI recipe generation

---

## Overview

This document outlines the plan for implementing real-time tracking of AI model usage, token consumption, and associated costs for the recipe generation system.

---

## Goals

### Primary Goals
1. Track actual token usage per recipe generation
2. Calculate real-world costs per request
3. Monitor cost trends over time
4. Provide cost analytics per model
5. Alert on cost anomalies

### Secondary Goals
6. Per-user cost tracking (for authenticated users)
7. Cost optimization recommendations
8. Budget forecasting
9. Monthly cost reports
10. ROI analysis per model

---

## Database Schema

### Table: `ai_usage_logs`

```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Request metadata
  user_id UUID REFERENCES auth.users(id), -- NULL for anonymous users
  session_id TEXT, -- Track anonymous sessions
  request_id TEXT UNIQUE, -- For deduplication

  -- Model information
  model_provider TEXT NOT NULL, -- 'openai', 'claude', 'gemini', 'grok'
  model_name TEXT NOT NULL, -- e.g., 'gpt-4.1-mini', 'claude-haiku-4-5'
  model_version TEXT, -- Full version string

  -- Token usage
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cached_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,

  -- Cost calculation
  input_cost_per_million DECIMAL(10, 6), -- Price at time of request
  output_cost_per_million DECIMAL(10, 6),
  cached_cost_per_million DECIMAL(10, 6),
  calculated_cost DECIMAL(10, 8), -- Actual cost for this request

  -- Request details
  complexity_score INTEGER, -- From OpenAI complexity calculation
  recipe_generated BOOLEAN DEFAULT true, -- Did it succeed?
  error_message TEXT, -- If failed
  response_time_ms INTEGER, -- Latency tracking

  -- Recipe metadata (for analysis)
  ingredient_count INTEGER,
  allergen_count INTEGER,
  dietary_restriction_count INTEGER,

  -- Indexes
  INDEX idx_created_at (created_at DESC),
  INDEX idx_user_id (user_id),
  INDEX idx_model_provider (model_provider),
  INDEX idx_calculated_cost (calculated_cost DESC)
);
```

### Table: `ai_cost_summary` (Materialized View)

```sql
CREATE MATERIALIZED VIEW ai_cost_summary AS
SELECT
  DATE_TRUNC('day', created_at) AS date,
  model_provider,
  model_name,
  COUNT(*) AS request_count,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  SUM(total_tokens) AS total_tokens,
  AVG(total_tokens) AS avg_tokens_per_request,
  SUM(calculated_cost) AS total_cost,
  AVG(calculated_cost) AS avg_cost_per_request,
  AVG(response_time_ms) AS avg_response_time_ms
FROM ai_usage_logs
WHERE recipe_generated = true
GROUP BY DATE_TRUNC('day', created_at), model_provider, model_name
ORDER BY date DESC, total_cost DESC;

-- Refresh daily
CREATE INDEX idx_cost_summary_date ON ai_cost_summary(date DESC);
```

---

## Implementation Steps

### Step 1: Create Database Tables (Week 1)

**Tasks:**
- [ ] Create `ai_usage_logs` table in Supabase
- [ ] Create `ai_cost_summary` materialized view
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create indexes for performance

**Files to create:**
```
supabase/migrations/
  └── YYYYMMDDHHMMSS_create_ai_usage_tracking.sql
```

### Step 2: Logging Infrastructure (Week 1-2)

**Tasks:**
- [ ] Create `lib/ai/usage-tracker.ts` utility
- [ ] Implement token counting logic
- [ ] Add cost calculation function
- [ ] Handle async logging (don't block recipe generation)

**New file:** `frontend/src/lib/ai/usage-tracker.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export interface UsageLogEntry {
  userId?: string;
  sessionId: string;
  requestId: string;
  modelProvider: 'openai' | 'claude' | 'gemini' | 'grok';
  modelName: string;
  modelVersion: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  complexityScore?: number;
  recipeGenerated: boolean;
  responseTimeMs: number;
  ingredientCount?: number;
  allergenCount?: number;
  dietaryRestrictionCount?: number;
  errorMessage?: string;
}

// Pricing table (updated from AI_Model_Pricing_Tracker.md)
const MODEL_PRICING = {
  'claude-haiku-4-5-20251001': {
    input: 1.00,
    output: 5.00,
    cached: 0.10,
  },
  'claude-sonnet-4-5-20250929': {
    input: 3.00,
    output: 15.00,
    cached: 0.30,
  },
  'gpt-4.1-2025-04-14': {
    input: 2.00,
    output: 8.00,
    cached: 0.50,
  },
  'gpt-4.1-mini-2025-04-14': {
    input: 0.40,
    output: 1.60,
    cached: 0.10,
  },
  'gemini-2.0-flash-exp': {
    input: 0.30,
    output: 2.50,
    cached: 0.03,
  },
  'grok-4-fast-reasoning': {
    input: 0.20,
    output: 0.50,
    cached: 0.05,
  },
} as const;

export async function logAIUsage(entry: UsageLogEntry) {
  try {
    const supabase = await createClient();

    // Get pricing for this model
    const pricing = MODEL_PRICING[entry.modelName as keyof typeof MODEL_PRICING];

    if (!pricing) {
      console.warn(`No pricing data for model: ${entry.modelName}`);
      return;
    }

    // Calculate cost (per million tokens)
    const inputCost = (entry.inputTokens / 1_000_000) * pricing.input;
    const outputCost = (entry.outputTokens / 1_000_000) * pricing.output;
    const cachedCost = entry.cachedTokens
      ? (entry.cachedTokens / 1_000_000) * pricing.cached
      : 0;

    const totalCost = inputCost + outputCost + cachedCost;

    // Log to database (non-blocking)
    await supabase.from('ai_usage_logs').insert({
      user_id: entry.userId || null,
      session_id: entry.sessionId,
      request_id: entry.requestId,
      model_provider: entry.modelProvider,
      model_name: entry.modelName,
      model_version: entry.modelVersion,
      input_tokens: entry.inputTokens,
      output_tokens: entry.outputTokens,
      cached_tokens: entry.cachedTokens || 0,
      input_cost_per_million: pricing.input,
      output_cost_per_million: pricing.output,
      cached_cost_per_million: pricing.cached,
      calculated_cost: totalCost,
      complexity_score: entry.complexityScore,
      recipe_generated: entry.recipeGenerated,
      error_message: entry.errorMessage,
      response_time_ms: entry.responseTimeMs,
      ingredient_count: entry.ingredientCount,
      allergen_count: entry.allergenCount,
      dietary_restriction_count: entry.dietaryRestrictionCount,
    });

    console.log(`Logged AI usage: ${entry.modelName}, ${entry.inputTokens + entry.outputTokens} tokens, $${totalCost.toFixed(6)}`);
  } catch (error) {
    // Don't throw - logging failures shouldn't break recipe generation
    console.error('Failed to log AI usage:', error);
  }
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

export function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
```

### Step 3: Integrate with Route Handler (Week 2)

**Tasks:**
- [ ] Modify `api/ai/generate/route.ts` to log usage
- [ ] Extract token counts from API responses
- [ ] Add timing measurements
- [ ] Handle errors gracefully

**Changes to:** `frontend/src/app/api/ai/generate/route.ts`

```typescript
import { logAIUsage, generateRequestId } from '@/lib/ai/usage-tracker';

export async function POST(request: Request) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const sessionId = request.headers.get('x-session-id') || generateSessionId();

  let inputTokens = 0;
  let outputTokens = 0;
  let modelProvider = '';
  let modelName = '';
  let recipeGenerated = false;

  try {
    // ... existing code ...

    // After generating recipe with each model:

    if (model === 'openai') {
      modelProvider = 'openai';
      modelName = openaiModel; // 'gpt-4.1-mini' or 'gpt-4.1'
      inputTokens = result.usage?.promptTokens || 0;
      outputTokens = result.usage?.completionTokens || 0;
      recipeGenerated = true;
    }

    if (model === 'claude') {
      modelProvider = 'claude';
      modelName = 'claude-haiku-4-5-20251001';
      inputTokens = message.usage.input_tokens;
      outputTokens = message.usage.output_tokens;
      recipeGenerated = true;
    }

    if (model === 'gemini') {
      modelProvider = 'gemini';
      modelName = 'gemini-2.0-flash-exp';
      // Gemini doesn't return token counts directly
      // Estimate based on prompt/response length
      inputTokens = Math.ceil(prompt.length / 4); // ~4 chars per token
      outputTokens = Math.ceil(text.length / 4);
      recipeGenerated = true;
    }

    if (model === 'grok') {
      modelProvider = 'grok';
      modelName = 'grok-4-fast-reasoning';
      inputTokens = completion.usage?.prompt_tokens || 0;
      outputTokens = completion.usage?.completion_tokens || 0;
      recipeGenerated = true;
    }

    // Log usage asynchronously (non-blocking)
    const responseTime = Date.now() - startTime;

    logAIUsage({
      userId: userId || undefined,
      sessionId,
      requestId,
      modelProvider,
      modelName,
      modelVersion: modelName,
      inputTokens,
      outputTokens,
      complexityScore: model === 'openai' ? complexityScore : undefined,
      recipeGenerated,
      responseTimeMs: responseTime,
      ingredientCount: ingredients.length,
      allergenCount: userAllergens.length,
      dietaryRestrictionCount: mergedDietaryPrefs.length,
    }).catch(console.error); // Fire and forget

    return NextResponse.json({
      recipe,
      allergen_warnings: allergenWarnings.length > 0 ? allergenWarnings : undefined,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Log failed attempt
    logAIUsage({
      userId: userId || undefined,
      sessionId,
      requestId,
      modelProvider: modelProvider || 'unknown',
      modelName: modelName || 'unknown',
      modelVersion: modelName || 'unknown',
      inputTokens: inputTokens || 0,
      outputTokens: 0,
      recipeGenerated: false,
      responseTimeMs: responseTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }).catch(console.error);

    // ... existing error handling ...
  }
}
```

### Step 4: Analytics Dashboard (Week 3)

**Tasks:**
- [ ] Create admin dashboard page
- [ ] Display real-time cost metrics
- [ ] Show cost breakdown by model
- [ ] Display usage trends

**New file:** `frontend/src/app/(dashboard)/admin/ai-costs/page.tsx`

```typescript
// Dashboard showing:
// - Total costs (today, week, month)
// - Cost per model
// - Token usage trends
// - Cost projections
// - Top users by cost (if applicable)
```

### Step 5: Cost Alerts & Monitoring (Week 4)

**Tasks:**
- [ ] Set up daily cost threshold alerts
- [ ] Create monthly budget tracking
- [ ] Email notifications for cost spikes
- [ ] Slack/Discord webhooks (optional)

---

## API Endpoints for Analytics

### GET `/api/admin/ai-costs/summary`

**Query params:**
- `start_date`: ISO date string
- `end_date`: ISO date string
- `model_provider`: Optional filter

**Response:**
```json
{
  "total_cost": 42.56,
  "total_requests": 15234,
  "total_tokens": 27421200,
  "avg_cost_per_request": 0.00279,
  "by_provider": {
    "openai": { "cost": 21.30, "requests": 7500, "percentage": 50 },
    "grok": { "cost": 10.12, "requests": 4500, "percentage": 23.8 },
    "gemini": { "cost": 7.89, "requests": 2484, "percentage": 18.5 },
    "claude": { "cost": 3.25, "requests": 750, "percentage": 7.7 }
  },
  "trend": "increasing" // or "stable", "decreasing"
}
```

### GET `/api/admin/ai-costs/daily`

**Response:** Daily breakdown for last 30 days

### GET `/api/admin/ai-costs/models`

**Response:** Cost and usage per individual model

---

## Cost Optimization Recommendations

Based on tracking data, the system can suggest:

1. **Model switching:** "80% of your requests are simple (complexity < 5). Consider routing these to Grok ($0.00072) instead of OpenAI mini ($0.00216). Potential savings: $45/month"

2. **Prompt caching:** "You're generating 500+ recipes/day with similar system prompts. Enable prompt caching to save 75-90% on input tokens."

3. **Complexity threshold:** "Only 5% of requests score >8 on complexity. Consider raising threshold to 10 to use GPT-4.1 mini more often."

4. **Usage patterns:** "Peak usage is 2-4pm. Consider pre-generating popular recipes during off-peak hours using batch APIs at 50% discount."

---

## Testing & Validation

### Unit Tests
- [ ] Test token counting accuracy
- [ ] Test cost calculation logic
- [ ] Test logging failures (graceful degradation)

### Integration Tests
- [ ] Test each model provider's usage tracking
- [ ] Verify database logging
- [ ] Test analytics queries performance

### Load Tests
- [ ] Ensure logging doesn't impact latency
- [ ] Test with 1000+ concurrent requests
- [ ] Verify database can handle volume

---

## Security & Privacy

### RLS Policies

```sql
-- Only admins can read AI usage logs
CREATE POLICY "Admin read AI usage logs"
  ON ai_usage_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- System can insert (service role)
CREATE POLICY "System insert AI usage logs"
  ON ai_usage_logs
  FOR INSERT
  WITH CHECK (true);
```

### Data Retention

- Keep detailed logs for 90 days
- Archive to cold storage after 90 days
- Keep aggregated summaries indefinitely
- GDPR: Allow users to request deletion of their usage data

---

## Rollout Plan

### Phase 1: Soft Launch (Week 1-2)
- Deploy to staging
- Test with 10% of traffic
- Monitor for issues
- Validate cost calculations

### Phase 2: Full Deployment (Week 3)
- Roll out to 100% of production traffic
- Monitor dashboard daily
- Collect baseline metrics

### Phase 3: Optimization (Week 4+)
- Analyze patterns
- Implement cost-saving recommendations
- A/B test model routing changes
- Report on ROI

---

## Success Metrics

**Week 1:**
- [ ] Tracking 100% of AI requests
- [ ] Cost calculations within 5% of actual bills
- [ ] Zero impact on response latency (<10ms added)

**Month 1:**
- [ ] Dashboard shows accurate cost trends
- [ ] Identified top 3 cost optimization opportunities
- [ ] Reduced average cost per recipe by 20%

**Month 3:**
- [ ] Automated cost alerts working
- [ ] Monthly cost predictable within 10%
- [ ] ROI positive (savings > implementation cost)

---

## Estimated Costs

### Implementation
- Database setup: 4 hours
- Logging infrastructure: 12 hours
- Route integration: 8 hours
- Dashboard: 16 hours
- Testing: 8 hours
- **Total: 48 hours (~1-2 weeks)**

### Ongoing
- Database storage: ~$2/month (for 100k requests/month)
- Monitoring: $0 (using Supabase free tier)
- Maintenance: 2 hours/month

---

## Next Actions

### Before Starting
1. [ ] Review and approve this plan
2. [ ] Decide on dashboard access control (admin only vs all users)
3. [ ] Set initial budget alerts thresholds
4. [ ] Choose deployment timeline

### Ready to Start
- [ ] Week 1: Database schema
- [ ] Week 1: Usage tracking library
- [ ] Week 2: Route integration
- [ ] Week 3: Analytics dashboard
- [ ] Week 4: Alerts & optimization

---

**Document Owner:** Engineering Team
**Status:** Awaiting approval
**Next Review:** After Phase 1 completion
