# AI Model Pricing Update Guide

**Purpose:** Step-by-step instructions for updating AI model pricing when providers change their rates.

**Last Updated:** 2025-10-17

---

## 📋 Quick Reference: What Needs Updating

When AI model pricing changes, you must update **ONE file**:

1. **`frontend/src/lib/ai/usage-tracker.ts`** - The pricing data that calculates costs

That's it! The pricing is centralized in one location.

---

## 🎯 Step-by-Step Update Process

### **Step 1: Get New Pricing Information**

User will provide pricing in one of these formats:
- Direct: "OpenAI GPT-4.1 is now $3.00 input / $10.00 output"
- Link: "Check latest pricing at [provider docs URL]"
- Screenshot: Image showing new pricing

### **Step 2: Update `usage-tracker.ts`**

**File Location:** `frontend/src/lib/ai/usage-tracker.ts`

**What to Update:**
```typescript
const MODEL_PRICING = {
  // OpenAI
  'gpt-4.1-2025-04-14': {
    input: 2.00,    // ← UPDATE: Price per 1M input tokens
    output: 8.00,   // ← UPDATE: Price per 1M output tokens
    cached: 0.50,   // ← UPDATE: Price per 1M cached tokens
  },
  'gpt-4.1-mini-2025-04-14': {
    input: 0.40,
    output: 1.60,
    cached: 0.10,
  },
  // Claude (Anthropic)
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
  // Gemini (Google)
  'gemini-2.0-flash-exp': {
    input: 0.30,
    output: 2.50,
    cached: 0.03,
  },
  // Grok (xAI)
  'grok-4-fast-reasoning': {
    input: 0.20,
    output: 0.50,
    cached: 0.05,
  },
} as const;
```

**Important Notes:**
- All prices are **per 1 MILLION tokens** (not per 1K tokens!)
- Use decimal format (e.g., `2.00` not `$2.00`)
- If a provider doesn't support cached tokens, still provide a value (set to 0 or estimated)

### **Step 3: Update Documentation**

Update the pricing reference in:

**File:** `Models Pricing/AI_Model_Pricing_Tracker.md`

Find the pricing table and update:
```markdown
| Provider | Model | Input ($/1M) | Output ($/1M) | Cached ($/1M) |
|----------|-------|--------------|---------------|---------------|
| OpenAI | GPT-4.1 | $2.00 | $8.00 | $0.50 |
```

### **Step 4: Test Locally**

Run the dev server and generate a test recipe:
```bash
cd C:\Users\bryn\Documents\recipeapp\frontend
npm run dev
```

1. Generate a recipe using the updated model
2. Check Vercel logs for cost calculation
3. Verify the cost looks correct based on new pricing

### **Step 5: Deploy**

```bash
cd C:\Users\bryn\Documents\recipeapp
git add .
git commit -m "chore: Update [provider] [model] pricing - input $X.XX, output $X.XX per 1M tokens"
git push
```

Vercel will auto-deploy.

### **Step 6: Verify in Production**

1. Wait for Vercel deployment to complete
2. Generate a test recipe in production
3. Check `ai_usage_logs` table in Supabase:
   ```sql
   SELECT * FROM ai_usage_logs
   WHERE model_name = 'model-name-here'
   ORDER BY created_at DESC
   LIMIT 5;
   ```
4. Verify `calculated_cost` reflects new pricing

---

## 🗂️ File Reference Map

### **Files That Calculate Costs (UPDATE THESE):**

| File | Purpose | When to Update |
|------|---------|----------------|
| `frontend/src/lib/ai/usage-tracker.ts` | **Pricing data & cost calculation** | ✅ ALWAYS update when pricing changes |

### **Files That Log Usage (NO CHANGES NEEDED):**

| File | Purpose | When to Update |
|------|---------|----------------|
| `frontend/src/app/api/ai/generate/route.ts` | Logs token counts from AI APIs | ❌ No changes needed (just logs tokens) |
| `supabase/migrations/016_create_ai_usage_tracking.sql` | Database schema | ❌ No changes needed (schema is stable) |

### **Documentation Files (OPTIONAL UPDATE):**

| File | Purpose | When to Update |
|------|---------|----------------|
| `Models Pricing/AI_Model_Pricing_Tracker.md` | Pricing reference | ✅ Update for documentation |
| `Models Pricing/Usage_Tracking_Plan.md` | Implementation notes | ⚠️ Only if implementation changes |
| `docs/AI_Usage_Analytics.md` | Analytics guide | ✅ Update pricing table |

---

## 🔍 How the System Works (Quick Overview)

```mermaid
graph LR
    A[AI API] -->|Returns tokens| B[route.ts]
    B -->|Logs tokens| C[usage-tracker.ts]
    C -->|Looks up pricing| D[MODEL_PRICING]
    D -->|Calculates cost| E[ai_usage_logs table]
    E -->|Aggregates| F[ai_cost_summary view]
    F -->|Displays| G[Dashboard]
```

1. **User generates recipe** → AI API returns token counts
2. **`route.ts` extracts tokens** → Calls `logAIUsage()` with token counts
3. **`usage-tracker.ts` calculates cost** → Looks up pricing in `MODEL_PRICING` constant
4. **Cost saved to database** → `ai_usage_logs` table stores calculated cost
5. **Dashboard displays costs** → Reads from database (no pricing logic needed)

**Key Insight:** Only `usage-tracker.ts` has pricing data. Everything else just passes token counts around!

---

## 🚨 Common Scenarios

### **Scenario 1: Provider Increases Prices**

**Example:** "OpenAI just increased GPT-4.1 to $2.50 input / $10.00 output"

**Steps:**
1. Update `usage-tracker.ts` with new prices
2. Update `AI_Model_Pricing_Tracker.md` documentation
3. Deploy
4. Done! Old logs keep old costs, new generations use new costs

### **Scenario 2: New Model Added**

**Example:** "OpenAI released GPT-4.2 at $3.00 input / $12.00 output"

**Steps:**
1. Add new entry to `MODEL_PRICING` in `usage-tracker.ts`:
   ```typescript
   'gpt-4.2-2025-06-01': {
     input: 3.00,
     output: 12.00,
     cached: 0.75,
   },
   ```
2. Update `route.ts` to use the new model (if switching)
3. Update documentation
4. Deploy

### **Scenario 3: Model Removed/Deprecated**

**Example:** "OpenAI deprecated GPT-4.1-mini"

**Steps:**
1. **DO NOT** remove from `MODEL_PRICING` (historical data needs it)
2. Add comment: `// DEPRECATED: 2025-10-17 - Use gpt-4.2 instead`
3. Update `route.ts` to use replacement model
4. Update documentation

### **Scenario 4: Check Current Pricing**

**View pricing in code:**
```typescript
// File: frontend/src/lib/ai/usage-tracker.ts
const MODEL_PRICING = { ... }
```

**View pricing in database:**
```sql
SELECT DISTINCT
  model_name,
  input_cost_per_million,
  output_cost_per_million,
  cached_cost_per_million
FROM ai_usage_logs
ORDER BY model_name;
```

---

## 📊 Example Pricing Update

### **User Says:**
> "Claude Haiku pricing changed to $0.80 input / $4.00 output"

### **Claude Code Does:**

**1. Update `usage-tracker.ts`:**
```typescript
'claude-haiku-4-5-20251001': {
  input: 0.80,   // Changed from 1.00
  output: 4.00,  // Changed from 5.00
  cached: 0.10,  // Unchanged
},
```

**2. Update `AI_Model_Pricing_Tracker.md`:**
```markdown
| Claude | Haiku 4.5 | $0.80 | $4.00 | $0.08 |
```

**3. Commit:**
```bash
git add .
git commit -m "chore: Update Claude Haiku 4.5 pricing - input $0.80, output $4.00 per 1M tokens (20% price reduction)"
git push
```

**4. Verify:**
```sql
-- Check a new recipe generation
SELECT
  model_name,
  input_tokens,
  output_tokens,
  calculated_cost,
  created_at
FROM ai_usage_logs
WHERE model_name = 'claude-haiku-4-5-20251001'
ORDER BY created_at DESC
LIMIT 1;
```

---

## ⚠️ Important Reminders

### **DO:**
✅ Update prices in `usage-tracker.ts`
✅ Use decimal format (e.g., `2.00`)
✅ Keep historical pricing entries (don't delete deprecated models)
✅ Test locally before deploying
✅ Update documentation
✅ Use per-1M-token pricing (not per-1K!)

### **DON'T:**
❌ Change pricing in database (it's calculated, not stored as config)
❌ Edit old `ai_usage_logs` records (historical data should remain accurate)
❌ Forget to deploy after updating
❌ Remove deprecated model pricing (breaks historical reports)
❌ Mix pricing formats (always use per-1M-tokens)

---

## 🔗 Related Files Quick Access

**Primary Update File:**
```
frontend/src/lib/ai/usage-tracker.ts
```

**Documentation Files:**
```
Models Pricing/AI_Model_Pricing_Tracker.md
Models Pricing/Usage_Tracking_Plan.md
docs/AI_Usage_Analytics.md
```

**Database Tables:**
```
ai_usage_logs              - Individual recipe generations
ai_cost_summary            - Daily aggregated costs (materialized view)
```

**Dashboard:**
```
frontend/src/app/(dashboard)/settings/ai-usage/page.tsx
```

---

## 📞 Troubleshooting

### **Issue: Cost Looks Wrong After Update**

**Possible Causes:**
1. Forgot to deploy (still using old code)
2. Used per-1K pricing instead of per-1M
3. Browser cached old JavaScript bundle

**Fix:**
```bash
# Check deployed version
git log -1

# Force redeploy
git commit --allow-empty -m "chore: Force redeploy"
git push

# Clear browser cache and test
```

### **Issue: Historical Costs Changed**

**This should NEVER happen!** Historical `calculated_cost` values are stored in the database and never recalculated.

If this happens, check:
```sql
SELECT
  created_at,
  model_name,
  calculated_cost,
  input_cost_per_million,
  output_cost_per_million
FROM ai_usage_logs
ORDER BY created_at DESC
LIMIT 20;
```

Historical records should retain their original `input_cost_per_million` and `calculated_cost`.

### **Issue: New Model Not Calculating Cost**

**Check:**
1. Model name in `route.ts` matches key in `MODEL_PRICING`
2. Deployed latest code
3. Check warning in logs: `⚠️ No pricing data for model: [name]`

**Fix:**
Add missing model to `MODEL_PRICING` in `usage-tracker.ts`

---

## 🎯 Quick Checklist

When user provides new pricing:

- [ ] Update `MODEL_PRICING` in `frontend/src/lib/ai/usage-tracker.ts`
- [ ] Update `AI_Model_Pricing_Tracker.md` documentation
- [ ] Test locally (generate recipe, check logs)
- [ ] Commit with descriptive message
- [ ] Push to trigger deployment
- [ ] Verify in production (check database)
- [ ] Confirm dashboard shows correct costs

---

**Last Updated:** 2025-10-17
**Maintained By:** Claude Code
**User:** Bryn (web3at50@gmail.com)
