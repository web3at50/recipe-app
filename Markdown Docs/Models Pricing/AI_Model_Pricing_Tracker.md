# AI Model Pricing Tracker
## Recipe Generation Application - Cost Analysis

**Last Updated:** 2025-10-17
**Purpose:** Track LLM provider pricing and estimate real-world costs per recipe generation

---

## Current Model Configuration

| Provider | Model | Status | Use Case |
|----------|-------|--------|----------|
| **Anthropic** | Claude Haiku 4.5 | ✅ Active | User selects "claude" model |
| **OpenAI** | GPT-4.1 mini / GPT-4.1 | ✅ Active | Default (complexity-based routing) |
| **Google** | Gemini 2.0 Flash | ✅ Active | User selects "gemini" model |
| **XAI** | Grok 4 Fast Reasoning | ✅ Active | User selects "grok" model |

---

## Pricing Details

### 1. Anthropic Claude

**Pricing Page:** https://docs.claude.com/en/docs/about-claude/models/overview

**Last Price Check:** 2025-10-17

| Model | Base Input | Cached Input (90% off) | Output | Cache Hit & Refresh |
|-------|------------|------------------------|--------|---------------------|
| **Claude Sonnet 4.5** | $3 / MTok | $0.30 / MTok | $15 / MTok | $0.30 / MTok |
| **Claude Haiku 4.5** ✅ | $1 / MTok | $0.10 / MTok | $5 / MTok | $0.10 / MTok |
| Claude Haiku 3.5 | $0.80 / MTok | $0.08 / MTok | $4 / MTok | $0.08 / MTok |

**Current Model:** `claude-haiku-4-5-20251001`

**Estimated Cost Per Recipe (Claude Haiku 4.5):**
- Input tokens: 600 × $1.00 / 1M = $0.0006
- Output tokens: 1,200 × $5.00 / 1M = $0.0060
- **Total: $0.0066 per recipe**

**Estimated Cost Per Recipe (Claude Sonnet 4.5):**
- Input tokens: 600 × $3.00 / 1M = $0.0018
- Output tokens: 1,200 × $15.00 / 1M = $0.0180
- **Total: $0.0198 per recipe** (3x more expensive than Haiku)

**Notes:**
- Haiku 4.5 is significantly cheaper while maintaining good quality
- Sonnet 4.5 has Memory Tool capability (not currently implemented)
- Prompt caching can save 90% on repeated context

---

### 2. OpenAI GPT-4.1

**Pricing Page:** https://platform.openai.com/docs/models/gpt-4.1

**Last Price Check:** 2025-10-17

| Model | Input | Cached Input (75% off) | Output |
|-------|-------|------------------------|--------|
| **GPT-4.1** | $2 / MTok | $0.50 / MTok | $8 / MTok |
| **GPT-4.1 mini** ✅ | $0.40 / MTok | $0.10 / MTok | $1.60 / MTok |

**Current Models:**
- `gpt-4.1-mini-2025-04-14` (complexity ≤ 8)
- `gpt-4.1-2025-04-14` (complexity > 8)

**Complexity Routing Logic:**
```
Score = (ingredients × 0.5) + (allergens × 3) + (dietary_restrictions × 2) + (description_complexity)
```

**Estimated Cost Per Recipe (GPT-4.1 mini):**
- Input tokens: 600 × $0.40 / 1M = $0.00024
- Output tokens: 1,200 × $1.60 / 1M = $0.00192
- **Total: $0.00216 per recipe** (CHEAPEST general-purpose model)

**Estimated Cost Per Recipe (GPT-4.1 full):**
- Input tokens: 600 × $2.00 / 1M = $0.0012
- Output tokens: 1,200 × $8.00 / 1M = $0.0096
- **Total: $0.0108 per recipe**

**Notes:**
- Smart routing saves costs by using mini for simple recipes
- Complexity threshold at 8 seems well-calibrated
- Most recipes likely use mini model (estimated 70-80%)

---

### 3. Google Gemini Paid

**Pricing Page:** https://ai.google.dev/gemini-api/docs/pricing

**Last Price Check:** 2025-10-17

| Model | Input | Output | Context Caching (90% off) |
|-------|-------|--------|---------------------------|
| **Gemini 2.0 Flash** ✅ | $0.30 / MTok | $2.50 / MTok | $0.03 / MTok |
| Gemini 2.5 Flash | $0.30 / MTok | $2.50 / MTok | $0.03 / MTok |
| Gemini 2.5 Pro | $1.25 / MTok | $10.00 / MTok | $0.125 / MTok |

**Current Model:** `gemini-2.0-flash-exp`

**API Key:** Using paid tier (`GOOGLE_GEMINI_API_KEY`)

**Estimated Cost Per Recipe (Gemini 2.0 Flash):**
- Input tokens: 600 × $0.30 / 1M = $0.00018
- Output tokens: 1,200 × $2.50 / 1M = $0.00300
- **Total: $0.00318 per recipe**

**Notes:**
- Recently switched from free tier to paid tier
- Paid tier provides 300 RPM (vs 10 RPM free)
- Data NOT used for training on paid tier
- Excellent price/performance ratio

---

### 4. XAI Grok

**Pricing Page:** https://console.x.ai/team/0e088848-3171-418e-a6f7-ec1e82b2a30a/models

**Last Price Check:** 2025-10-17

| Model | Context Window | Input | Cached Input (75% off) | Output |
|-------|----------------|-------|------------------------|--------|
| **grok-4-fast-reasoning** ✅ | ≤128k | $0.20 / MTok | $0.05 / MTok | $0.50 / MTok |
| grok-4-fast-reasoning | >128k | $0.40 / MTok | $0.05 / MTok | $1.00 / MTok |

**Current Model:** `grok-4-fast-reasoning`

**Estimated Cost Per Recipe (≤128k context):**
- Input tokens: 600 × $0.20 / 1M = $0.00012
- Output tokens: 1,200 × $0.50 / 1M = $0.00060
- **Total: $0.00072 per recipe** (CHEAPEST OPTION!)

**Estimated Cost Per Recipe (>128k context):**
- Input tokens: 600 × $0.40 / 1M = $0.00024
- Output tokens: 1,200 × $1.00 / 1M = $0.00120
- **Total: $0.00144 per recipe**

**Actual Usage Data (from XAI dashboard):**
- 84 requests
- 53,350 total tokens
- $0.0217 total cost
- **Average: $0.000258 per request** (even cheaper than estimated!)
- Average tokens per request: 635 tokens

**Notes:**
- Significantly cheaper than all other models
- Fast reasoning capability
- Actual usage shows ~$0.00026/recipe (very efficient!)
- Currently staying within ≤128k context window

---

## Cost Comparison Summary

**Ranked by Cost Per Recipe (Estimated):**

| Rank | Provider | Model | Cost/Recipe | Notes |
|------|----------|-------|-------------|-------|
| 1 🥇 | **XAI** | Grok 4 Fast | **$0.00072** | Cheapest! Actual: $0.00026 |
| 2 🥈 | **OpenAI** | GPT-4.1 mini | **$0.00216** | Best for simple recipes |
| 3 🥉 | **Google** | Gemini 2.0 Flash | **$0.00318** | Great price/performance |
| 4 | **Anthropic** | Haiku 4.5 | **$0.0066** | Good quality, 3x Grok |
| 5 | **OpenAI** | GPT-4.1 full | **$0.0108** | Complex recipes only |
| 6 | **Anthropic** | Sonnet 4.5 | **$0.0198** | Premium (not in use) |

**Average Blended Cost (estimated distribution):**
- OpenAI (50%): 75% mini ($0.00216) + 25% full ($0.0108) = $0.00432
- Grok (30%): $0.00072
- Gemini (15%): $0.00318
- Claude (5%): $0.0066

**Weighted Average: ~$0.00282 per recipe**

---

## Cost Projections

### Monthly Scenarios

**Low Volume (1,000 recipes/month):**
- Blended cost: 1,000 × $0.00282 = **$2.82/month**

**Medium Volume (10,000 recipes/month):**
- Blended cost: 10,000 × $0.00282 = **$28.20/month**

**High Volume (100,000 recipes/month):**
- Blended cost: 100,000 × $0.00282 = **$282/month**

**Enterprise (1M recipes/month):**
- Blended cost: 1,000,000 × $0.00282 = **$2,820/month**

---

## Optimization Opportunities

### 1. Increase Grok Usage
**Current:** ~30% of requests
**Potential:** 60-70% of requests
**Savings:** If 70% Grok instead of 50% OpenAI:
- Current: $0.00282/recipe
- Optimized: $0.00156/recipe
- **45% cost reduction**

### 2. Implement Prompt Caching
**Savings:** 75-90% on repeated context
**Applies to:** System prompts, recipe knowledge base
**Estimated impact:** 20-30% total cost reduction

### 3. Smart Model Routing
**Current:** User selects model
**Potential:** Auto-route by complexity
- Simple queries → Grok ($0.00072)
- Medium queries → Gemini ($0.00318)
- Complex queries → GPT-4.1 ($0.0108)
- Critical/Safety → Claude ($0.0066)

---

## Assumptions & Methodology

### Token Count Assumptions

**Input Tokens (~600 total):**
- System prompt: ~200 tokens
- User context (preferences, allergens): ~150 tokens
- Ingredients list: ~100 tokens
- Recipe request details: ~150 tokens

**Output Tokens (~1,200 total):**
- Recipe name & description: ~100 tokens
- Ingredients list (formatted): ~400 tokens
- Instructions (step-by-step): ~500 tokens
- Metadata (prep time, servings, etc.): ~200 tokens

**Total: ~1,800 tokens per recipe**

### Validation

**XAI Actual Data:**
- 84 requests = 53,350 tokens
- Average: 635 tokens/request
- **Note:** Lower than estimate (1,800), suggests efficient prompting

**Possible reasons for lower actual usage:**
- Shorter system prompts
- Less user context for anonymous users
- Optimized recipe format
- Grok's efficiency in reasoning mode

---

## ✅ IMPLEMENTED: Real-Time Usage Tracking

**Implementation Date:** 2025-10-17
**Status:** Live in production

### What Was Implemented

1. **Database Tables** (Migration 016)
   - `ai_usage_logs` table with token counts, costs, and performance metrics
   - `ai_cost_summary` materialized view for daily aggregations
   - Row Level Security (RLS) policies
   - Indexes for query performance

2. **Usage Tracker Library** (`lib/ai/usage-tracker.ts`)
   - Automated token counting from all 4 providers
   - Real-time cost calculation based on MODEL_PRICING
   - Non-blocking async logging (doesn't affect recipe generation)
   - Error handling with graceful degradation

3. **Route Integration** (`app/api/ai/generate/route.ts`)
   - VERIFIED token property names for all providers:
     - OpenAI: `usage.inputTokens` / `usage.outputTokens`
     - Claude: `usage.input_tokens` / `usage.output_tokens`
     - Gemini: `usageMetadata.promptTokenCount` / `usageMetadata.candidatesTokenCount`
     - Grok: `usage.prompt_tokens` / `usage.completion_tokens`
   - Logs both successful and failed requests
   - Tracks complexity score, response time, and recipe metadata

### How to Access Data

**Query Recent Usage:**
```sql
SELECT * FROM ai_usage_logs
ORDER BY created_at DESC
LIMIT 100;
```

**Daily Cost Summary:**
```sql
SELECT * FROM ai_cost_summary
ORDER BY date DESC
LIMIT 30;
```

**Cost by Provider:**
```sql
SELECT
  model_provider,
  COUNT(*) as requests,
  SUM(calculated_cost) as total_cost,
  AVG(calculated_cost) as avg_cost
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY model_provider
ORDER BY total_cost DESC;
```

### What to Monitor

- Check Vercel logs for: `✅ AI Usage: [model] | [tokens] tokens | $[cost] | [time]ms`
- Query Supabase `ai_usage_logs` table daily
- Refresh materialized view: `SELECT refresh_ai_cost_summary();`
- Compare calculated costs to actual provider bills

### Next Steps

See `Usage_Tracking_Plan.md` for Phase 2 enhancements:
- Analytics dashboard UI
- Cost alerts and notifications
- Budget tracking
- Per-user cost analytics
- Monthly reports

---

## Maintenance Schedule

**Monthly Tasks:**
- [ ] Verify pricing pages for updates
- [ ] Update cost estimates
- [ ] Review actual usage vs estimates
- [ ] Adjust model routing if needed

**Quarterly Tasks:**
- [ ] Comprehensive cost analysis
- [ ] ROI evaluation per model
- [ ] Optimization recommendations
- [ ] Budget forecasting

---

**Document Owner:** Engineering Team
**Next Review:** 2025-11-17 (monthly)
