# PlateWise - Technical Deep Dive

> **Note**: This document contains detailed technical implementation details for developers who want to understand the code at a deeper level. For a high-level overview, see the main [README.md](README.md).

---

## Table of Contents

1. [AI Provider Integration](#ai-provider-integration)
2. [Database Schema](#database-schema)
3. [Authentication Flow](#authentication-flow)
4. [Cost Tracking System](#cost-tracking-system)
5. [Edge Functions](#edge-functions)
6. [SEO Implementation](#seo-implementation)

---

## AI Provider Integration

### Provider SDK Overview

| Provider | SDK Used | Model | Token Extraction | Notes |
|----------|----------|-------|------------------|-------|
| **OpenAI** | Vercel AI SDK | GPT-4.1 / GPT-4.1-mini | `result.usage.inputTokens` | Cached tokens tracked separately |
| **Anthropic** | Direct Anthropic SDK | Claude Haiku 4.5 | `message.usage.input_tokens` | Optimized for speed/cost |
| **Google** | GenAI SDK | Gemini 2.5 Flash | `usageMetadata.promptTokenCount` | Flash variant for performance |
| **XAI** | OpenAI SDK (custom base URL) | Grok 4 | `completion.usage.prompt_tokens` | Uses OpenAI-compatible API |

### Complexity Scoring

```typescript
function calculateComplexity(params: RecipeParams): number {
  let score = 0;

  // Base ingredients (small weight)
  score += params.ingredients.length * 0.5;

  // Allergens (CRITICAL - 3x weight for safety)
  score += params.allergens.length * 3;

  // Dietary restrictions (important)
  score += params.dietaryRestrictions.length * 2;

  // User context bonus
  if (params.userDescription) {
    score += 2;
  }

  return score;
}
```

**Routing Logic:**
- Threshold: 8
- Below 8: Use cost-optimized models (e.g., GPT-4.1-mini)
- Above 8: Use full-capability models (e.g., GPT-4.1)
- Allergen requests automatically get higher scores → better models

### API Route Structure

```typescript
// /app/api/ai/generate/route.ts

export async function POST(request: Request) {
  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) return unauthorized();

  // 2. Parse and validate request
  const body = await request.json();
  const validated = schema.parse(body);

  // 3. Calculate complexity
  const complexity = calculateComplexity(validated);

  // 4. Route to appropriate AI provider
  const model = selectModel(complexity);
  const result = await generateRecipe(model, validated);

  // 5. Log usage (non-blocking)
  try {
    await logAIUsage({
      userId,
      model,
      tokens: result.usage,
      cost: calculateCost(result.usage, model)
    });
  } catch (error) {
    console.error('Logging failed - continuing');
  }

  // 6. Return recipe
  return NextResponse.json(result.recipe);
}
```

---

## Database Schema

### Core Tables

#### recipes

```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Timing
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER DEFAULT 4,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),

  -- JSONB for flexible nested data
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  nutrition JSONB,
  faqs JSONB,

  -- Arrays for multi-value fields
  tags TEXT[],
  allergens TEXT[],

  -- Metadata
  source TEXT DEFAULT 'user_created',
  ai_model TEXT,
  cost_per_serving NUMERIC(10,2),

  -- SEO
  is_public BOOLEAN DEFAULT FALSE,
  seo_slug TEXT,
  seo_title TEXT CHECK (length(seo_title) <= 60),
  seo_description TEXT CHECK (length(seo_description) <= 155),
  seo_keywords TEXT[],
  category TEXT,
  page_views INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,

  -- Image
  image_url TEXT,
  image_source TEXT,
  image_attribution TEXT,

  -- Flags
  is_favorite BOOLEAN DEFAULT FALSE,
  flagged_for_review BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_seo_slug UNIQUE(seo_slug) WHERE is_public = true
);
```

**Why JSONB for ingredients/instructions:**
- Flexible schema (different recipes have different structures)
- No joins required for recipe display
- PostgreSQL has excellent JSONB support with indexing
- Trade-off: Denormalized, but recipes rarely change after creation

#### ai_usage_logs

```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  request_id TEXT UNIQUE NOT NULL,

  -- Model info
  ai_model TEXT NOT NULL,
  ai_provider TEXT NOT NULL,

  -- Token accounting
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cached_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,

  -- Cost calculation (per million tokens)
  input_cost_per_million NUMERIC(10,6),
  output_cost_per_million NUMERIC(10,6),
  cached_cost_per_million NUMERIC(10,6),

  -- Performance
  response_time_ms INTEGER,
  recipe_generated BOOLEAN DEFAULT FALSE,

  -- Request complexity (for analysis)
  complexity_score NUMERIC(5,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_ai_usage_user_id ON ai_usage_logs(user_id, created_at DESC);
CREATE INDEX idx_ai_usage_cost ON ai_usage_logs(ai_provider, ai_model, created_at);
```

### Row-Level Security Policies

```sql
-- Users can only see their own recipes (unless public)
CREATE POLICY "User isolation"
ON recipes FOR SELECT
USING (
  user_id = auth.jwt()->>'sub'
  OR is_public = true
  OR (auth.jwt()->>'is_admin')::boolean = true
);

-- Users can only modify their own recipes
CREATE POLICY "Users manage own recipes"
ON recipes FOR ALL
USING (user_id = auth.jwt()->>'sub')
WITH CHECK (user_id = auth.jwt()->>'sub');

-- Admin access to all recipes
CREATE POLICY "Admin full access"
ON recipes FOR ALL
TO authenticated
USING ((auth.jwt()->>'is_admin')::boolean = true);
```

**How it works:**
- `auth.jwt()` extracts claims from Clerk JWT
- `'sub'` claim contains the user ID
- `'is_admin'` claim set via Clerk session customization
- Policies evaluated on every query automatically

---

## Authentication Flow

### Clerk + Supabase Integration (2025 Method)

**Configuration:**

1. **Clerk Dashboard → Sessions → Customize session token**
   ```json
   {
     "role": "authenticated",
     "is_admin": "{{user.public_metadata.is_admin}}"
   }
   ```

2. **Clerk Dashboard → Integrations → Supabase**
   - Connected to Supabase project
   - JWT issuer configured

3. **Supabase Dashboard → Authentication → Providers → Clerk**
   - Enabled Clerk integration
   - JWT Secret added

### Middleware Protection

```typescript
// middleware.ts
export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up',
    '/recipes/(.*)',  // Public recipe pages
    '/api/webhooks/(.*)'
  ];

  const isPublicRoute = publicRoutes.some(route =>
    new RegExp(route).test(pathname)
  );

  if (!isPublicRoute) {
    await auth.protect();
  }
});
```

### Admin Access Check

```typescript
// app/admin/recipe-review/page.tsx
export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Check admin status
  const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];
  if (!ADMIN_USER_IDS.includes(userId)) {
    redirect('/');
  }

  // Fetch recipes using service role (bypasses RLS)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: recipes } = await supabase
    .from('recipes')
    .select('*')
    .in('user_id', AUTOMATION_USER_IDS);

  return <AdminDashboard recipes={recipes} />;
}
```

**Security layers:**
1. Middleware: Route-level protection
2. Page: Admin user ID verification
3. Database: RLS policies (bypassed with service role for admin)

---

## Cost Tracking System

### Usage Logging Function

```typescript
async function logAIUsage(params: {
  userId: string;
  aiModel: string;
  aiProvider: string;
  inputTokens: number;
  outputTokens: number;
  responseTimeMs: number;
  recipeGenerated: boolean;
}) {
  const supabase = createClient();

  // Get pricing for this model
  const pricing = getModelPricing(params.aiProvider, params.aiModel);

  await supabase
    .from('ai_usage_logs')
    .insert({
      user_id: params.userId,
      request_id: generateUUID(),
      ai_model: params.aiModel,
      ai_provider: params.aiProvider,
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      input_cost_per_million: pricing.inputCost,
      output_cost_per_million: pricing.outputCost,
      response_time_ms: params.responseTimeMs,
      recipe_generated: params.recipeGenerated
    });
}
```

### Model Pricing Configuration

```typescript
const MODEL_PRICING = {
  openai: {
    'gpt-4.1-2025-04-14': {
      inputCost: 2.50,
      outputCost: 10.00
    },
    'gpt-4.1-mini-2025-04-14': {
      inputCost: 0.150,
      outputCost: 0.600
    }
  },
  anthropic: {
    'claude-haiku-4-5-20251001': {
      inputCost: 0.80,
      outputCost: 4.00
    }
  },
  google: {
    'gemini-2.0-flash-exp': {
      inputCost: 0.00,  // Free tier
      outputCost: 0.00
    }
  },
  xai: {
    'grok-4-fast-reasoning': {
      inputCost: 0.20,
      outputCost: 0.80
    }
  }
};
```

---

## Edge Functions

### Daily Analytics Aggregation

```typescript
// supabase/functions/daily-llm-usage/index.ts

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Aggregate yesterday's usage
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: usage } = await supabase
    .from('ai_usage_logs')
    .select('*')
    .gte('created_at', yesterday.toISOString().split('T')[0])
    .lt('created_at', new Date().toISOString().split('T')[0]);

  // Calculate totals by provider
  const summary = usage.reduce((acc, log) => {
    const key = `${log.ai_provider}-${log.ai_model}`;
    if (!acc[key]) {
      acc[key] = {
        provider: log.ai_provider,
        model: log.ai_model,
        requests: 0,
        totalCost: 0,
        avgResponseTime: 0,
        failureCount: 0
      };
    }

    acc[key].requests += 1;
    acc[key].totalCost +=
      (log.input_tokens * log.input_cost_per_million / 1000000) +
      (log.output_tokens * log.output_cost_per_million / 1000000);
    acc[key].avgResponseTime += log.response_time_ms;
    if (!log.recipe_generated) acc[key].failureCount += 1;

    return acc;
  }, {});

  // Calculate averages
  Object.values(summary).forEach((s: any) => {
    s.avgResponseTime = s.avgResponseTime / s.requests;
  });

  return new Response(JSON.stringify(summary), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### Cron Schedule

```sql
-- Scheduled via pg_cron
SELECT cron.schedule(
  'daily-llm-analytics',
  '0 2 * * *',  -- 2 AM daily
  $$
  SELECT net.http_post(
    url := 'https://[project].supabase.co/functions/v1/daily-llm-usage',
    headers := '{"Authorization": "Bearer [service-key]"}'::jsonb
  );
  $$
);
```

---

## SEO Implementation

### Dynamic Sitemap Generation

```typescript
// app/sitemap.ts

export default async function sitemap(): MetadataRoute.Sitemap {
  const supabase = createClient();

  // Fetch all published recipes
  const { data: recipes } = await supabase
    .from('recipes')
    .select('seo_slug, category, updated_at')
    .eq('is_public', true);

  // Get unique categories
  const categories = [...new Set(recipes.map(r => r.category))];

  return [
    // Homepage
    {
      url: 'https://platewise.xyz/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },

    // Recipe index
    {
      url: 'https://platewise.xyz/recipes',
      changeFrequency: 'daily',
      priority: 0.9
    },

    // Category pages
    ...categories.map(cat => ({
      url: `https://platewise.xyz/recipes/${cat}`,
      changeFrequency: 'daily',
      priority: 0.85
    })),

    // Individual recipes
    ...recipes.map(r => ({
      url: `https://platewise.xyz/recipes/${r.category}/${r.seo_slug}`,
      lastModified: new Date(r.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8
    }))
  ];
}
```

### Schema.org Recipe Markup

```typescript
const recipeSchema = {
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": recipe.name,
  "image": recipe.image_url,
  "author": {
    "@type": "Person",
    "name": "PlateWise"
  },
  "datePublished": recipe.published_at,
  "description": recipe.seo_description,
  "prepTime": `PT${recipe.prep_time}M`,
  "cookTime": `PT${recipe.cook_time}M`,
  "recipeYield": `${recipe.servings} servings`,
  "recipeIngredient": ingredients.map(i => `${i.quantity} ${i.unit} ${i.item}`),
  "recipeInstructions": instructions.map((inst, idx) => ({
    "@type": "HowToStep",
    "position": idx + 1,
    "text": inst.instruction
  })),
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": `${nutrition.calories} calories`,
    "proteinContent": `${nutrition.protein}g`,
    "carbohydrateContent": `${nutrition.carbs}g`,
    "fatContent": `${nutrition.fat}g`
  },
  "suitableForDiet": dietTypes,
  "allergens": recipe.allergens
};
```

### SEO Slug Generation

```typescript
function generateSlug(name: string, existingSlugs: string[]): string {
  // Basic slug
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Ensure uniqueness
  let finalSlug = slug;
  let counter = 1;

  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
}
```

---

## Performance Considerations

### What Was NOT Measured

**Important**: The following are theoretical improvements, not measured benchmarks:

- ❌ "40% cost reduction" - estimated based on model pricing, not actual measured savings
- ❌ "3x faster queries" - typical JSONB vs join performance, not measured in this app
- ❌ Specific query time improvements - not benchmarked

### What IS Observable

✅ 31 database migrations showing iterative schema evolution
✅ TypeScript 88.1% coverage (GitHub language stats)
✅ 134 commits over development period
✅ 4 AI provider integrations working in production
✅ Live deployment handling real user traffic

---

## Architecture Decisions

### Why JSONB for Ingredients?

**Decision**: Store ingredients as JSONB array instead of separate table

**Pros:**
- Single query to fetch full recipe
- Flexible schema (different recipes have different structures)
- PostgreSQL JSONB is performant with proper indexing
- Simpler API code (no join logic needed)

**Cons:**
- Can't easily query "all recipes with chicken"
- Denormalized (updates affect entire recipe)
- Slightly larger storage

**Verdict**: Worth it for read-heavy workload where recipes rarely change.

### Why 4 AI Providers?

**Decision**: Integrate OpenAI, Anthropic, Google, and XAI

**Reasoning:**
- Gives users variety (different AI "styles")
- Demonstrates multi-SDK integration skills
- Allows real-world cost/performance comparison
- Reduces vendor lock-in

**Trade-off:**
- More complex code (4 different SDKs)
- More API keys to manage
- Potentially higher costs

**Verdict**: Differentiation worth the complexity for a portfolio piece.

### Why Clerk + Supabase?

**Decision**: Use Clerk for auth instead of Supabase Auth

**Reasoning:**
- Clerk has better UX for social login
- Easier admin customization (session claims)
- Better documentation and support
- More flexible for future needs

**Trade-off:**
- Two services instead of one
- Additional cost (though free tier sufficient)
- More complex integration

**Verdict**: Better UX justifies additional service.

---

## Code Quality Notes

**What You'll Find:**

✅ Consistent TypeScript typing throughout
✅ Error handling with try-catch and fallbacks
✅ Environment variable validation
✅ Proper use of Next.js patterns (Server Components, API routes)
✅ Security-first approach (no hardcoded secrets, RLS everywhere)

**What Could Be Improved:**

- Test coverage (currently manual testing only)
- More comprehensive error logging
- Performance monitoring/observability
- API rate limiting
- Input sanitization could be more robust

**Note**: This is an honest assessment. Portfolio projects don't need to be perfect, they need to demonstrate competence and learning.

---

## Lessons Learned

### Technical
- JSONB is great for flexible schemas but makes certain queries impossible
- Clerk's JWT integration with Supabase requires careful claim configuration
- AI provider APIs vary significantly in their SDK design
- Edge Functions are powerful but need careful error handling

### Product
- AI-generated content requires human review for safety-critical domains
- Cost tracking should be built in from day one, not retrofitted
- User experience trumps technical elegance (4 AI models = good UX)
- Knowing when NOT to launch is as important as knowing how to build

### Process
- Migrations allow iterative development without breaking production
- TypeScript catches many errors before they reach users
- Environment variables make deployment easier across environments
- Clear separation of concerns (frontend/API/database) simplifies debugging

---

## Questions This Document Answers

**For Technical Reviewers:**

- How are the AI providers actually integrated? → See [AI Provider Integration](#ai-provider-integration)
- What does the database schema look like? → See [Database Schema](#database-schema)
- How is authentication implemented? → See [Authentication Flow](#authentication-flow)
- How do you track costs? → See [Cost Tracking System](#cost-tracking-system)
- How are background jobs handled? → See [Edge Functions](#edge-functions)

**For Hiring Managers:**

- Can they write production-ready code? → Yes, see deployment at platewise.xyz
- Do they understand trade-offs? → Yes, see [Architecture Decisions](#architecture-decisions)
- Can they work with modern tools? → Yes, Next.js 15, TypeScript, Supabase, 4 AI SDKs
- Do they think about security? → Yes, RLS policies, Clerk auth, no hardcoded secrets
- Can they ship iteratively? → Yes, 31 migrations and 134 commits show evolution

---

## Contact

For questions about technical implementation details, please refer to the main README or reach out directly.

**GitHub**: [github.com/web3at50/recipe-app](https://github.com/web3at50/recipe-app)
**Email**: web3at50@gmail.com