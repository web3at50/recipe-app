# Vercel AI Gateway Analysis
## Research Report for Recipe Generation Application

**Date:** October 2025
**Context:** Multi-LLM recipe generation strategy research
**Source:** Vercel AI Gateway documentation (comprehensive review)

---

## Executive Summary

Vercel AI Gateway is a unified API layer providing access to 100+ AI models from multiple providers (OpenAI, Anthropic, Google, xAI) through a single OpenAI-compatible interface. **Key finding: There are NO gateway fees**—you only pay for underlying model token costs. The Gateway offers intelligent provider routing with automatic failover, comprehensive cost tracking via `providerMetadata`, and BYOK (Bring Your Own Key) support where user-provided keys are attempted first before falling back to system credentials.

**Primary Value Propositions:**
- **Zero Gateway Fees** - No per-request markup beyond model costs
- **Unified API** - Single interface for multiple providers
- **Intelligent Failover** - Automatic provider switching on errors
- **Built-in Observability** - Cost tracking, attempt logging, routing metadata
- **BYOK Support** - Use user's API keys, fall back to yours
- **OpenAI Compatibility** - Drop-in replacement for OpenAI SDK

**Best For:** Applications requiring multi-provider flexibility, automatic failover, and unified cost tracking without vendor-specific integrations.

**Trade-offs:** Requires Vercel ecosystem, may not expose provider-specific features (like Claude Memory Tool), adds abstraction layer complexity.

---

## Complete Feature Set and Capabilities

### Core Model Access

**Supported Providers:**
- Anthropic (Claude Sonnet 4.5, Opus 4.1, Haiku 3.5)
- OpenAI (GPT-5, GPT-4o, embeddings)
- Google (Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 2.5 Flash Image)
- xAI (Grok-3, Grok-4)
- AWS Bedrock (Claude models via AWS)
- Google Vertex AI (GCP-hosted models)
- Novita AI (alternative provider)

**Model Format:**
```
provider/model-name

Examples:
- anthropic/claude-sonnet-4
- openai/gpt-5
- google/gemini-2.5-flash
- xai/grok-4
```

### Intelligent Routing and Failover

**Provider Ordering:**
```typescript
const result = await streamText({
  model: 'anthropic/claude-sonnet-4',
  prompt: 'Generate a recipe...',
  providerOptions: {
    gateway: {
      order: ['vertex', 'anthropic', 'bedrock'],  // Try in this sequence
    },
  },
});
```

**What Happens:**
1. Gateway attempts Vertex AI first (GCP-hosted Claude)
2. If Vertex fails (error, rate limit, timeout), tries Anthropic direct
3. If Anthropic fails, tries AWS Bedrock
4. All attempts logged in `providerMetadata.gateway.routing.attempts`

**Provider Restrictions:**
```typescript
providerOptions: {
  gateway: {
    only: ['anthropic', 'openai'],  // Limit to these providers only
  },
}
```

### BYOK (Bring Your Own Key) Architecture

**How It Works:**
1. User provides their own Anthropic/OpenAI/Google API key
2. Gateway attempts request with user's BYOK credentials
3. On failure (unauthorized, rate limited, invalid), falls back to system credentials
4. Credential type tracked: `credentialType: 'byok'` or `credentialType: 'system'`

**Example Metadata:**
```json
{
  "gateway": {
    "routing": {
      "attempts": [
        {
          "provider": "anthropic",
          "credentialType": "byok",
          "success": false,
          "error": "Unauthorized"
        },
        {
          "provider": "anthropic",
          "credentialType": "system",
          "success": true
        }
      ]
    }
  }
}
```

**Benefits for Recipe App:**
- Power users bring their own credits (reduces your costs)
- Automatic fallback ensures service continuity
- Transparent tracking of which credentials were used
- Revenue opportunity (premium users with BYOK get unlimited generations)

### Observability and Monitoring

**Provider Metadata (Returned with Every Response):**
```typescript
const result = await streamText({...});
const metadata = await result.providerMetadata;

console.log(metadata);
// {
//   "gateway": {
//     "routing": {
//       "originalModelId": "anthropic/claude-sonnet-4",
//       "resolvedProvider": "vertex",
//       "finalProvider": "vertex",
//       "canonicalSlug": "anthropic/claude-sonnet-4",
//       "planningReasoning": "System credentials planned for...",
//       "fallbacksAvailable": ["anthropic", "bedrock"],
//       "attempts": [
//         {
//           "provider": "vertex",
//           "providerApiModelId": "claude-sonnet-4",
//           "credentialType": "system",
//           "success": true,
//           "startTime": 1754638578812,
//           "endTime": 1754638579575
//         }
//       ]
//     },
//     "cost": "0.0006766"  // USD per request
//   }
// }
```

**What You Get:**
- **Cost Tracking**: Exact USD cost per request
- **Routing Details**: Which provider actually served the request
- **Attempt History**: All providers tried, success/failure reasons
- **Timing Information**: Start/end timestamps per attempt
- **Credential Type**: BYOK vs system credentials
- **Fallback Analysis**: Available alternatives if primary fails

**Token Usage:**
```typescript
const result = await streamText({...});
console.log(result.usage);
// {
//   prompt_tokens: 800,
//   completion_tokens: 1200,
//   total_tokens: 2000
// }
```

### OpenAI-Compatible Endpoints

**Available Endpoints:**
```
GET  /v1/models                  - List available models
GET  /v1/models/{model}          - Get model details
POST /v1/chat/completions        - Chat completions (streaming/non-streaming)
POST /v1/embeddings              - Text embeddings
GET  /v1/credits                 - Check credit balance
```

**Drop-in Replacement:**
```typescript
import OpenAI from 'openai';

// Change these two lines only:
const openai = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1',
});

// Rest of code works as-is:
const response = await openai.chat.completions.create({
  model: 'anthropic/claude-sonnet-4',  // Cross-provider access!
  messages: [{ role: 'user', content: 'Generate a recipe...' }],
});
```

### Image Generation Support

**Supported Model:** Google Gemini 2.5 Flash Image

**AI SDK Approach:**
```typescript
import { generateText } from 'ai';

const result = await generateText({
  model: 'google/gemini-2.5-flash-image-preview',
  providerOptions: {
    google: { responseModalities: ['TEXT', 'IMAGE'] }
  },
  prompt: 'Generate a photo of a delicious pasta carbonara, plated elegantly',
});

// Access images:
const images = result.files.filter(f => f.mediaType?.startsWith('image/'));
images.forEach(img => {
  console.log(img.mediaType);  // e.g., "image/png"
  // img.uint8Array contains binary image data
});
```

**Streaming Images:**
```typescript
const result = streamText({
  model: 'google/gemini-2.5-flash-image-preview',
  providerOptions: {
    google: { responseModalities: ['TEXT', 'IMAGE'] }
  },
  prompt: 'Generate recipe and photo...',
});

for await (const delta of result.fullStream) {
  if (delta.type === 'file' && delta.file.mediaType.startsWith('image/')) {
    await fs.promises.writeFile('recipe-photo.png', delta.file.uint8Array);
  }
}
```

**Limitations:**
- Only Gemini 2.5 Flash Image supports generation currently
- No DALL-E or Flux support mentioned in documentation
- Images returned as base64 or binary data

---

## Pricing Structure and Cost Implications

### Gateway Fees: ZERO

**Critical Finding:** There are **NO per-request fees** for using AI Gateway.

**Cost Structure:**
- Pay only for model API costs (tokens consumed)
- Pricing determined by underlying provider and model
- Cost tracking included in every response via `providerMetadata.gateway.cost`

**Example Cost Tracking:**
```json
{
  "gateway": {
    "cost": "0.0006766"  // USD cost for this specific request
  }
}
```

### Model Pricing Discovery

```typescript
// Get pricing information programmatically
const availableModels = await gateway.getAvailableModels();

availableModels.models.forEach((model) => {
  console.log(`Model: ${model.id}`);
  console.log(`  Input: $${model.pricing.input}/token`);
  console.log(`  Output: $${model.pricing.output}/token`);
  console.log(`  Cached input: $${model.pricing.cachedInputTokens}/token`);
});
```

### Credit System

**Check Balance:**
```typescript
GET /v1/credits

Response:
{
  "balance": 125.50,
  "currency": "USD"
}
```

**Use Case:**
- Track spending across your application
- Set budget alerts programmatically
- Monitor credit consumption by feature/user segment

### Cost Per Recipe Estimates (Recipe Generation Context)

**Assumptions:**
- 500 tokens input (prompt + user preferences)
- 1,200 tokens output (recipe with ingredients, instructions)
- Total: ~1,700 tokens per generation

**Model Costs (via Gateway):**

| Model | Input Cost | Output Cost | Total Per Recipe | 1000 Recipes |
|-------|------------|-------------|------------------|--------------|
| Claude Sonnet 4.5 | $0.0015 | $0.018 | **$0.0195** | $19.50 |
| Claude Haiku 3.5 | $0.0004 | $0.0048 | **$0.0052** | $5.20 |
| GPT-4o | $0.00125 | $0.012 | **$0.01345** | $13.45 |
| Gemini 2.5 Flash | $0.00015 | $0.003 | **$0.00315** | $3.15 |

**Note:** These are underlying model costs—Gateway adds zero markup.

---

## Rate Limits and Quotas

### Gateway-Level Limits

**Documentation Note:** The AI Gateway documentation does not specify explicit rate limits for the gateway itself.

**Rate Limiting Factors:**
- Determined by underlying provider (OpenAI, Anthropic, Google)
- Potentially limited by your Vercel plan/credits
- Can implement application-level rate limiting with `@vercel/firewall`

### Provider-Level Limits

Each provider has its own rate limits:
- **Anthropic:** Tier-based (Tier 1: 50 RPM, higher tiers: more)
- **OpenAI:** Tier-based (varies by spend history)
- **Google Gemini:** Free tier (10 RPM), Paid tier (300-1000 RPM)

**Key Insight:** Gateway doesn't impose additional limits, but you're subject to each provider's constraints.

### Application-Level Rate Limiting

```typescript
import { firewall } from '@vercel/firewall';

export const rateLimit = firewall({
  rules: [
    {
      action: 'rate-limit',
      rate: {
        limit: 100,  // requests
        window: '1m',  // per minute
      },
    },
  ],
});
```

---

## Framework Integration Options

### Vercel AI SDK (Recommended)

**Installation:**
```bash
npm install ai @ai-sdk/gateway
```

**Basic Usage:**
```typescript
import { generateText } from 'ai';

// Simple string model ID (uses AI Gateway by default on Vercel deployments)
const result = await generateText({
  model: 'anthropic/claude-sonnet-4',
  prompt: 'Generate a vegan pasta recipe',
});

console.log(result.text);
```

**Explicit Gateway Instance:**
```typescript
import { gateway } from '@ai-sdk/gateway';

const result = await generateText({
  model: gateway('anthropic/claude-sonnet-4'),
  prompt: 'Generate a recipe...',
});
```

**Streaming:**
```typescript
import { streamText } from 'ai';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const result = streamText({
    model: 'anthropic/claude-sonnet-4',
    prompt,
    providerOptions: {
      gateway: {
        order: ['vertex', 'anthropic', 'bedrock'],
      },
    },
  });

  return result.toDataStreamResponse();
}
```

### OpenAI SDK (Compatible)

**TypeScript/JavaScript:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1',
});

const response = await openai.chat.completions.create({
  model: 'anthropic/claude-sonnet-4',
  messages: [{ role: 'user', content: 'Generate a recipe...' }],
});
```

**Python:**
```python
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv('AI_GATEWAY_API_KEY'),
    base_url='https://ai-gateway.vercel.sh/v1'
)

response = client.chat.completions.create(
    model='anthropic/claude-sonnet-4',
    messages=[{'role': 'user', 'content': 'Generate a recipe...'}]
)
```

### Other Supported Frameworks

- **LangChain** (TypeScript & Python)
- **LiteLLM** (multi-provider Python library)
- **Mastra** (agentic framework)
- **Pydantic AI** (Python type-safe AI)
- **LangFuse** (observability platform)

---

## Authentication and Security

### Authentication Methods

**1. API Key (Primary Method):**
```bash
# .env.local
AI_GATEWAY_API_KEY=your_api_key_here
```

```typescript
import { generateText } from 'ai';

// API key used automatically
const result = await generateText({
  model: 'anthropic/claude-sonnet-4',
  prompt: '...',
});
```

**2. OIDC Token (Vercel Deployments):**
```typescript
// Automatically available in Vercel deployments
const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
```

**Pull Tokens for Local Development:**
```bash
vercel env pull
```

### Security Best Practices

- ✅ Store API keys in environment variables (never hardcode)
- ✅ Use OIDC tokens for Vercel deployments (no key management)
- ✅ Keys should never be exposed to client-side code
- ✅ Implement server-side API routes for all AI requests
- ✅ Use Vercel Firewall for rate limiting and abuse prevention

---

## Pros and Cons for Multi-Provider Recipe Generation

### Pros

**1. Cost Flexibility**
- Try cheaper models first, fallback to premium if needed
- Zero gateway fees (only pay model costs)
- Per-request cost tracking for budget management
- Smart routing can optimize for cost

**2. Reliability and Availability**
- Automatic failover between providers
- Multiple routing options for same model (Claude via Anthropic, Vertex, Bedrock)
- Never down—if one provider fails, others take over
- Transparent attempt tracking for debugging

**3. Easy Provider Switching**
- Change providers without code changes (just model ID)
- Test multiple models easily for quality comparison
- A/B test different models seamlessly
- Simple migration between providers

**4. Excellent Observability**
- Detailed routing metadata per request
- Cost tracking built-in
- BYOK attempt monitoring
- Perfect for debugging and optimization
- Comprehensive logging of all attempts

**5. BYOK Support**
- Power users can bring their own API keys
- Reduces your infrastructure costs for heavy users
- Automatic fallback ensures service continuity
- Transparent tracking of credential usage

**6. Image Generation**
- Generate recipe photos alongside text (Gemini)
- Multi-modal responses (recipe + image in one call)
- Streaming support for progressive display

**7. Framework Flexibility**
- Works with Vercel AI SDK (best integration)
- OpenAI SDK compatible (easy migration)
- Python support
- Multiple framework options

**8. Developer Experience**
- Unified API across all providers
- Simple model switching via model ID string
- Comprehensive TypeScript types
- Excellent documentation

### Cons

**1. Limited Image Generation**
- Only Google Gemini 2.5 Flash Image model supported
- No DALL-E or Flux access mentioned
- Image quality may not match specialized image models

**2. Provider-Specific Features May Be Unavailable**
- **Critical for your use case:** Claude Memory Tool likely not accessible through Gateway
- Advanced features require provider-specific configuration
- Not all providers support all parameters uniformly
- Need to understand provider differences for optimization

**3. Rate Limits Unclear**
- Documentation doesn't specify gateway-level rate limits
- Need to manage underlying provider rate limits
- Potential for hitting multiple provider limits simultaneously

**4. Vendor Lock-in to Vercel**
- Gateway is Vercel-specific service
- Migration away from Vercel requires API changes
- Dependent on Vercel infrastructure availability
- May not work optimally outside Vercel ecosystem

**5. Model Selection Complexity**
- 100+ models available—choice paralysis
- Need to understand pricing differences
- Quality varies significantly between models
- Requires testing to find optimal model per use case

**6. BYOK Implementation Complexity**
- Need to build UI for users to manage keys
- Key validation and storage considerations
- Security implications of handling user API keys
- Additional development effort

**7. Credit System**
- Need to manage Vercel AI Gateway credits
- Additional billing layer beyond direct provider costs
- Credit exhaustion could halt service
- Requires monitoring and alerts

**8. Abstraction Layer Overhead**
- Additional hop in request path (potential latency)
- Debugging complexity (is issue Gateway or provider?)
- May not expose all provider capabilities
- Less control than direct API integration

---

## Integration Complexity Assessment

### Low Complexity (1-2 days)

**Basic Integration:**
```typescript
// Install packages
npm install ai @ai-sdk/gateway

// .env.local
AI_GATEWAY_API_KEY=your_key_here

// API route
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await generateText({
    model: 'anthropic/claude-sonnet-4',
    prompt,
  });

  return Response.json({ recipe: result.text });
}
```

**What You Get:**
- Basic AI recipe generation
- Automatic error handling
- Cost tracking

### Medium Complexity (3-5 days)

**Production-Ready Features:**
```typescript
export async function POST(req: Request) {
  const { prompt, modelPreference, userId } = await req.json();

  const result = streamText({
    model: modelPreference || 'anthropic/claude-sonnet-4',
    prompt,
    providerOptions: {
      gateway: {
        order: ['vertex', 'anthropic', 'bedrock'],  // Fallback chain
      },
    },
  });

  // Log cost for analytics
  const metadata = await result.providerMetadata;
  await logCost({
    userId,
    cost: metadata.gateway.cost,
    provider: metadata.gateway.routing.finalProvider,
    credentialType: metadata.gateway.routing.attempts[0].credentialType,
  });

  return result.toDataStreamResponse();
}
```

**Features Added:**
- Provider fallback configuration
- Cost tracking and logging
- Streaming responses
- Error handling and retry logic
- Model selection UI

### High Complexity (1-2 weeks)

**Advanced Features:**
- BYOK user management system (key storage, validation, UI)
- Multi-model recipe generation with comparison
- Image generation integration
- Advanced cost optimization
- Provider performance monitoring
- A/B testing framework
- Custom routing logic based on request complexity

---

## Recommendations for Recipe Generation App

### Decision Framework

**Use Vercel AI Gateway IF:**
- ✅ You want unified multi-provider access
- ✅ Automatic failover is critical
- ✅ You're already on Vercel infrastructure
- ✅ You don't need provider-specific features (like Claude Memory Tool)
- ✅ Cost tracking and observability are priorities
- ✅ You want easy A/B testing between models

**Use Direct APIs IF:**
- ✅ You need Claude Memory Tool (game-changer for personalization)
- ✅ You want maximum control over provider features
- ✅ You're not on Vercel infrastructure
- ✅ You prefer simpler architecture (fewer abstraction layers)
- ✅ You want to avoid vendor lock-in

### For Your Recipe App

**Current Assessment:**
Given your product strategy emphasizes personalization and the Claude Memory Tool is specifically called out (line 1161 of product strategy), I recommend **starting with Direct API integrations** for these reasons:

1. **Claude Memory Tool is critical** for your personalization strategy (persistent user preferences)
2. **Memory Tool likely not accessible** through Gateway abstraction
3. **Direct APIs give maximum flexibility** for advanced features
4. **Lower complexity** for your specific use case (3 providers, clear needs)

**Hybrid Approach (Phase 2 consideration):**
- **Phase 1:** Direct Claude API (Memory Tool access)
- **Phase 2:** Add Gateway for Gemini/OpenAI (multi-provider failover)
- **Best of both:** Claude Memory Tool + Gateway benefits for other providers

### Implementation Recommendations

**If Using Gateway:**

1. **Start Simple**
   ```typescript
   const result = await generateText({
     model: 'anthropic/claude-sonnet-4',
     prompt: buildRecipePrompt(userPreferences, ingredients),
   });
   ```

2. **Add Failover**
   ```typescript
   providerOptions: {
     gateway: {
       order: ['vertex', 'anthropic', 'bedrock'],
     },
   }
   ```

3. **Implement Cost Tracking**
   ```typescript
   const metadata = await result.providerMetadata;
   await analytics.track('recipe_generated', {
     cost: metadata.gateway.cost,
     provider: metadata.gateway.routing.finalProvider,
     tokens: result.usage.total_tokens,
   });
   ```

4. **Consider BYOK** (Month 2+)
   - Build user API key management
   - Show cost savings to power users
   - Automatic fallback ensures reliability

---

## Sample Implementation

```typescript
// app/api/generate-recipe/route.ts
import { streamText } from 'ai';
import { gateway } from '@ai-sdk/gateway';

export async function POST(req: Request) {
  const {
    ingredients,
    dietaryRestrictions,
    cuisine,
    userId
  } = await req.json();

  // Build prompt
  const prompt = `Create a detailed recipe using these ingredients: ${ingredients.join(', ')}.
    Dietary restrictions: ${dietaryRestrictions || 'none'}.
    Cuisine style: ${cuisine || 'any'}.

    Include: title, ingredients list, step-by-step instructions, cooking time, serving size.`;

  // Check if user has BYOK
  const userApiKey = await getUserApiKey(userId);

  // Configure with Gateway
  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4'),
    prompt,
    headers: {
      'http-referer': 'https://your-recipe-app.vercel.app',
      'x-title': 'RecipeApp',
    },
    providerOptions: {
      gateway: {
        order: ['vertex', 'anthropic', 'bedrock'],
      },
      anthropic: userApiKey ? {
        apiKey: userApiKey,  // BYOK attempt
      } : undefined,
    },
  });

  // Log metadata after stream completes
  result.providerMetadata.then(async (metadata) => {
    await logRecipeGeneration({
      userId,
      cost: metadata.gateway.cost,
      provider: metadata.gateway.routing.finalProvider,
      credentialType: metadata.gateway.routing.attempts[0].credentialType,
      success: true,
      ingredients: ingredients.length,
    });
  });

  return result.toDataStreamResponse();
}
```

---

## Conclusion

Vercel AI Gateway offers a compelling unified API for multi-provider AI access with **zero gateway fees**, excellent observability, and intelligent failover. It's particularly strong for applications requiring:
- Multi-provider flexibility
- Cost optimization through smart routing
- Automatic failover for reliability
- Unified cost tracking and monitoring

**However, for your recipe application**, the Gateway's abstraction layer may prevent access to **Claude Memory Tool**—a game-changing feature specifically called out in your product strategy for personalization.

**Final Recommendation:** Start with **Direct Claude API integration** to leverage the Memory Tool, then evaluate Gateway in Phase 2 for multi-provider orchestration of secondary models (Gemini, OpenAI).

---

**Report Status:** Complete ✅
**Research Date:** October 2025
**Next Steps:** Review Anthropic Claude Analysis for Memory Tool deep dive
