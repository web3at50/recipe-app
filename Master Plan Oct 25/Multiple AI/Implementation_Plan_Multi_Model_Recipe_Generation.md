# Multi-Model Recipe Generation Implementation Plan
## Authenticated Users Only - MVP Testing Phase

**Date:** October 2025
**Context:** Add hybrid ingredient + description input with multi-model support (OpenAI, Claude, Gemini)
**Scope:** Authenticated users only (`/generate` page)
**Environment:** API keys already configured in `.env.local` and Vercel

---

## Executive Summary

Implement a **hybrid input system** allowing users to enter both structured ingredients (one per line) and an optional descriptive text field ("I want something creamy and comforting"). Add **three AI model buttons** (OpenAI, Claude, Gemini) so users can compare output quality. This is MVP testing with handful of users to validate approach before scaling.

**Key Features:**
1. ✅ Optional description field for natural language context
2. ✅ Three model selection buttons (OpenAI, Claude, Gemini)
3. ✅ OpenAI uses GPT-4.1 mini by default, GPT-4.1 for complex requests (complexity score >8)
4. ✅ Gemini uses free tier API key (`GOOGLE_GEMINI_FREE_API_KEY`)
5. ✅ Claude Sonnet 4.5 (no Memory Tool for now - parked for later)

**Cost Control:**
- Limited to handful of testers
- Free Gemini tier for testing
- Complexity-based OpenAI model routing
- Claude limited usage (expensive but valuable for comparison)

---

## Current State Analysis

### Existing Architecture

**Files to Modify:**
1. **Frontend:** `frontend/src/app/(dashboard)/generate/page.tsx` (lines 1-345)
2. **Backend API:** `frontend/src/app/api/ai/generate/route.ts` (lines 1-158)
3. **Prompts:** `frontend/src/lib/ai/prompts.ts` (lines 1-169)

**Current Flow:**
```
User enters ingredients → Split by newline → Array sent to API →
OpenAI GPT-4.1 generates recipe → JSON parsed → Display
```

**Current Model:**
- Line 92 in `route.ts`: `model: openai('gpt-4.1-2025-04-14')`
- Single model only (OpenAI GPT-4.1)
- No description field
- No model selection

---

## Implementation Plan

### Phase 1: Add Description Field to Frontend (AUTH ONLY)

**File:** `frontend/src/app/(dashboard)/generate/page.tsx`

**Changes Required:**

1. **Add state for description text (after line 16):**
```typescript
const [ingredientsText, setIngredientsText] = useState('');
const [descriptionText, setDescriptionText] = useState(''); // NEW
const [servings, setServings] = useState<number | null>(null);
```

2. **Add description to API request body (lines 65-72):**
```typescript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ingredients,
    description: descriptionText.trim() || undefined, // NEW - only send if not empty
    servings: servings || 4,
  }),
});
```

3. **Add description textarea in UI (after ingredients textarea, around line 214):**

**Insert between ingredients textarea and servings input:**
```tsx
{/* NEW: Optional Description Field */}
<div className="space-y-2">
  <Label htmlFor="description">
    What kind of dish? (Optional)
    <span className="text-xs text-muted-foreground ml-2">Describe the style or mood</span>
  </Label>
  <Textarea
    id="description"
    value={descriptionText}
    onChange={(e) => setDescriptionText(e.target.value)}
    placeholder="E.g., Something creamy and comforting, Italian-style, not too spicy..."
    className="min-h-[80px]"
  />
  <p className="text-xs text-muted-foreground">
    This helps the AI understand what kind of recipe you're looking for
  </p>
</div>
```

4. **Update CardDescription for ingredients (line 200-202):**
```tsx
<CardDescription>
  Enter ingredients you have available, one per line
</CardDescription>
```

---

### Phase 2: Add Multi-Model Selection Buttons to Frontend

**File:** `frontend/src/app/(dashboard)/generate/page.tsx`

**Changes Required:**

1. **Add state for selected model (after line 16):**
```typescript
const [selectedModel, setSelectedModel] = useState<'openai' | 'claude' | 'gemini'>('openai'); // NEW
```

2. **Add model parameter to API request (lines 68-71):**
```typescript
body: JSON.stringify({
  ingredients,
  description: descriptionText.trim() || undefined,
  servings: servings || 4,
  model: selectedModel, // NEW
}),
```

3. **Add model selection buttons in UI (before "Generate Recipe" button, around line 227):**

**Insert before the main "Generate Recipe" button:**
```tsx
{/* NEW: Model Selection Buttons */}
<div className="space-y-2">
  <Label>Choose AI Model</Label>
  <div className="grid grid-cols-3 gap-2">
    <Button
      type="button"
      variant={selectedModel === 'openai' ? 'default' : 'outline'}
      onClick={() => setSelectedModel('openai')}
      className="w-full"
    >
      OpenAI
      <span className="text-xs ml-1">(GPT-4.1)</span>
    </Button>
    <Button
      type="button"
      variant={selectedModel === 'claude' ? 'default' : 'outline'}
      onClick={() => setSelectedModel('claude')}
      className="w-full"
    >
      Claude
      <span className="text-xs ml-1">(Sonnet 4.5)</span>
    </Button>
    <Button
      type="button"
      variant={selectedModel === 'gemini' ? 'default' : 'outline'}
      onClick={() => setSelectedModel('gemini')}
      className="w-full"
    >
      Gemini
      <span className="text-xs ml-1">(2.5 Flash)</span>
    </Button>
  </div>
  <p className="text-xs text-muted-foreground">
    Test different AI models to see which generates the best recipes for you
  </p>
</div>
```

4. **Update Generate Button to show selected model (lines 228-245):**
```tsx
<Button
  className="w-full"
  size="lg"
  onClick={handleGenerate}
  disabled={isGenerating || !ingredientsText.trim()}
>
  {isGenerating ? (
    <>
      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
      Generating with {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}...
    </>
  ) : (
    <>
      <ChefHat className="h-5 w-5 mr-2" />
      Generate Recipe with {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}
    </>
  )}
</Button>
```

---

### Phase 3: Update Backend API to Handle Description and Multi-Models

**File:** `frontend/src/app/api/ai/generate/route.ts`

**Changes Required:**

1. **Extract description and model from request body (line 32):**
```typescript
const { ingredients, description, dietary_preferences, servings, prepTimeMax, difficulty, model = 'openai' } = body;
```

2. **Update prompt generation to include description (lines 75-86):**
```typescript
// Generate recipe prompt with user context
const prompt = createRecipeGenerationPrompt({
  ingredients,
  description, // NEW - pass description to prompt builder
  dietary_preferences: mergedDietaryPrefs,
  servings: finalServings,
  prepTimeMax: finalPrepTimeMax,
  difficulty: finalDifficulty,
  userPreferences: {
    allergies: userAllergens,
    cuisines_liked: userPreferences.cuisines_liked || [],
    spice_level: userPreferences.spice_level || 'medium',
  },
});
```

3. **Add complexity calculation for OpenAI model selection (after line 86):**
```typescript
// Calculate complexity score for OpenAI model selection
const complexityScore = calculateComplexityScore({
  ingredientCount: ingredients.length,
  allergenCount: userAllergens.length,
  dietaryRestrictionCount: mergedDietaryPrefs.length,
  hasDescription: !!description,
});

console.log(`Complexity score: ${complexityScore} (threshold: 8)`);
```

4. **Replace single OpenAI call with multi-model routing (lines 88-96):**

**REMOVE:**
```typescript
console.log('Generating recipe with OpenAI GPT-4.1...');

const { text } = await generateText({
  model: openai('gpt-4.1-2025-04-14'),
  prompt,
  temperature: 0.7,
  maxOutputTokens: 2000,
});
```

**REPLACE WITH:**
```typescript
let text: string;

if (model === 'openai') {
  // OpenAI: Use mini for simple, full for complex
  const openaiModel = complexityScore > 8
    ? 'gpt-4.1-2025-04-14'  // Complex: Use full GPT-4.1
    : 'gpt-4.1-mini-2025-04-14';  // Simple: Use GPT-4.1 mini

  console.log(`Generating recipe with OpenAI ${openaiModel}...`);

  const result = await generateText({
    model: openai(openaiModel),
    prompt,
    temperature: 0.7,
    maxTokens: 2000,
  });
  text = result.text;

} else if (model === 'claude') {
  // Claude Sonnet 4.5 (no Memory Tool for MVP)
  console.log('Generating recipe with Claude Sonnet 4.5...');

  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    temperature: 0.7,
    system: "You are a professional UK-based chef assistant. Generate recipes in the exact JSON format requested.",
    messages: [{ role: 'user', content: prompt }],
  });

  // Extract text from Claude response
  const contentBlock = message.content[0];
  text = contentBlock.type === 'text' ? contentBlock.text : '';

} else if (model === 'gemini') {
  // Gemini 2.5 Flash (FREE TIER)
  console.log('Generating recipe with Gemini 2.5 Flash (free tier)...');

  const { GoogleGenAI } = await import('@google/genai');
  const genai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GEMINI_FREE_API_KEY!,
  });

  const result = await genai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  text = result.text;

} else {
  throw new Error('Invalid model specified');
}

console.log('AI Response received');
```

5. **Add complexity calculation helper function (at end of file, after line 158):**
```typescript
/**
 * Calculate complexity score for recipe generation
 * Score > 8 triggers GPT-4.1 instead of GPT-4.1 mini
 */
function calculateComplexityScore(params: {
  ingredientCount: number;
  allergenCount: number;
  dietaryRestrictionCount: number;
  hasDescription: boolean;
}): number {
  let score = 0;

  // Ingredient complexity (0.5 points per ingredient)
  score += params.ingredientCount * 0.5;

  // Allergen complexity (3 points per allergen - safety critical)
  score += params.allergenCount * 3;

  // Dietary restriction complexity (2 points per restriction)
  score += params.dietaryRestrictionCount * 2;

  // Description adds slight complexity (1 point)
  if (params.hasDescription) {
    score += 1;
  }

  return score;
}
```

---

### Phase 4: Update Prompt Builder to Handle Description

**File:** `frontend/src/lib/ai/prompts.ts`

**Changes Required:**

1. **Add description to interface (line 2):**
```typescript
export interface RecipeGenerationParams {
  ingredients: string[];
  description?: string; // NEW - optional description
  dietary_preferences?: string[];
  servings?: number;
  prepTimeMax?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'beginner' | 'intermediate' | 'advanced';
  userPreferences?: {
    allergies?: string[];
    cuisines_liked?: string[];
    spice_level?: 'mild' | 'medium' | 'hot';
  };
}
```

2. **Extract description parameter (line 15):**
```typescript
export function createRecipeGenerationPrompt(params: RecipeGenerationParams): string {
  const {
    ingredients,
    description, // NEW
    dietary_preferences = [],
    servings = 4,
    prepTimeMax,
    difficulty,
    userPreferences,
  } = params;
```

3. **Add description to prompt (after line 51, before "REQUIREMENTS"):**

**INSERT AFTER:**
```typescript
prompt += `AVAILABLE INGREDIENTS:\n${ingredients.join('\n')}\n\n`;
```

**ADD:**
```typescript
// NEW: Add user's vision/description if provided
if (description && description.trim().length > 0) {
  prompt += `USER'S VISION:\n${description.trim()}\n\n`;
  prompt += `Create a recipe that uses the available ingredients and matches the user's vision for the dish.\n\n`;
}
```

4. **Update instruction at bottom (line 105) to account for description:**
```typescript
Important:
- Use the available ingredients to create a recipe that ${description ? 'matches the user\'s vision described above' : 'is delicious and practical'}
- You may use common pantry staples (salt, pepper, oil, etc.) in addition to listed ingredients
- Include specific quantities and units
- Provide clear, step-by-step instructions
- Make it practical and achievable
- Return ONLY valid JSON, no additional text
```

---

### Phase 5: Install Required Dependencies

**Action:** Install missing SDK packages

**Commands to Run:**
```bash
# Anthropic Claude SDK
npm install @anthropic-ai/sdk

# Google Gemini SDK (NEW LIBRARY - GA as of May 2025)
npm install @google/genai

# Verify existing packages (should already be installed)
npm list @ai-sdk/openai ai
```

**Package Versions:**
- `@anthropic-ai/sdk`: Latest (^0.30.0 or higher)
- `@google/genai`: Latest (^1.0.0 or higher) - **NEW GA library, NOT legacy `@google/generative-ai`**

---

### Phase 6: Environment Variables Verification

**Action:** Verify all API keys are configured

**Files to Check:**
- `.env.local` (local development)
- Vercel environment variables (production)

**Required Variables:**
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini (FREE TIER - important!)
GOOGLE_GEMINI_FREE_API_KEY=AIza...
GOOGLE_GEMINI_API_KEY=AIza...  # Paid tier (not used in this implementation)
```

**Verification Steps:**
1. Check `.env.local` has all keys
2. Check Vercel dashboard → Project Settings → Environment Variables
3. Confirm `GOOGLE_GEMINI_FREE_API_KEY` is set (not `GOOGLE_GEMINI_API_KEY`)

---

### Phase 7: Testing Checklist

**Test Cases:**

**1. OpenAI GPT-4.1 mini (Simple Recipe):**
- Ingredients: chicken, rice, onion, garlic (4 ingredients)
- No description
- Allergens: none
- **Expected:** Uses `gpt-4.1-mini-2025-04-14` (complexity score ~2)
- **Verify:** Console log shows "mini"

**2. OpenAI GPT-4.1 (Complex Recipe):**
- Ingredients: 10+ items
- Allergens: peanuts, dairy (2 allergens = 6 points)
- Dietary: vegan, gluten-free (2 restrictions = 4 points)
- Description: "Something creamy..." (1 point)
- **Expected:** Uses `gpt-4.1-2025-04-14` (complexity score ~16)
- **Verify:** Console log shows "gpt-4.1-2025-04-14"

**3. Claude Sonnet 4.5:**
- Any ingredients
- Optional description: "Comforting and cozy for Friday night"
- **Expected:** More conversational, warm tone
- **Verify:** Recipe feels more "chatty" and natural

**4. Gemini 2.5 Flash:**
- Any ingredients
- **Expected:** Uses free tier API key
- **Verify:** Console shows "free tier" message
- **Cost:** £0 (free tier)

**5. Description Field Usage:**
- Ingredients: pasta, chicken, cream, tomatoes
- Description: "Something quick and Italian-style, creamy but not too heavy"
- **Expected:** Recipe matches description style
- **Verify:** Recipe name/description reflects "quick," "Italian," "creamy"

**6. Allergen Safety (All Models):**
- Allergen profile: peanuts
- Ingredients include: peanut butter
- **Expected:** Pre-generation safety warning, request rejected
- **Verify:** Works identically across all 3 models

---

## Implementation Todo List

### Frontend Changes (generate/page.tsx)

- [ ] Add `descriptionText` state variable
- [ ] Add `selectedModel` state variable
- [ ] Add description textarea to UI (with label and helper text)
- [ ] Add 3 model selection buttons (OpenAI, Claude, Gemini)
- [ ] Update API request body to include `description` and `model`
- [ ] Update "Generate Recipe" button to show selected model name
- [ ] Test UI layout and responsiveness

### Backend API Changes (api/ai/generate/route.ts)

- [ ] Extract `description` and `model` from request body
- [ ] Pass `description` to `createRecipeGenerationPrompt()`
- [ ] Add `calculateComplexityScore()` helper function
- [ ] Implement OpenAI routing (mini vs full based on complexity >8)
- [ ] Implement Claude Sonnet 4.5 integration (import `@anthropic-ai/sdk`)
- [ ] Implement Gemini 2.5 Flash integration (import `@google/generative-ai`, use FREE key)
- [ ] Add console logging for model selection and complexity score
- [ ] Test error handling for all 3 models

### Prompt Builder Changes (lib/ai/prompts.ts)

- [ ] Add `description?: string` to `RecipeGenerationParams` interface
- [ ] Extract `description` parameter in function
- [ ] Add "USER'S VISION" section to prompt (if description provided)
- [ ] Update instructions to reference description
- [ ] Test prompt output with and without description

### Dependencies

- [ ] Install `@anthropic-ai/sdk`
- [ ] Install `@google/genai` (NEW library - not the legacy `@google/generative-ai`)
- [ ] Verify `@ai-sdk/openai` is installed
- [ ] Run `npm install` to ensure all dependencies resolved

### Environment Variables

- [ ] Verify `OPENAI_API_KEY` in `.env.local`
- [ ] Verify `ANTHROPIC_API_KEY` in `.env.local`
- [ ] Verify `GOOGLE_GEMINI_FREE_API_KEY` in `.env.local` (NOT `GOOGLE_GEMINI_API_KEY`)
- [ ] Verify all 3 keys in Vercel environment variables
- [ ] Deploy to Vercel to test production environment

### Testing

- [ ] Test OpenAI mini with simple recipe (4 ingredients, no allergens)
- [ ] Test OpenAI full with complex recipe (10+ ingredients, 2+ allergens, 2+ dietary restrictions)
- [ ] Test Claude with description ("cozy and comforting")
- [ ] Test Gemini with any ingredients
- [ ] Test description field with all 3 models
- [ ] Test allergen safety works across all 3 models
- [ ] Verify console logs show correct model selection
- [ ] Test with real user profile (authenticated)
- [ ] Compare output quality across all 3 models
- [ ] Verify costs (Gemini should be £0, OpenAI mini should be cheap)

### Documentation

- [ ] Update internal docs with model costs per recipe
- [ ] Document complexity score formula
- [ ] Note which scenarios trigger GPT-4.1 vs mini
- [ ] Document Gemini free tier limits (10 RPM)

---

## Model Configuration Reference

### OpenAI Models

**GPT-4.1 mini (Default):**
- Model ID: `gpt-4.1-mini-2025-04-14`
- Cost: £0.0018/recipe
- Use when: Complexity score ≤ 8
- Scenarios: Simple recipes, few ingredients, no/minimal allergens

**GPT-4.1 (Complex):**
- Model ID: `gpt-4.1-2025-04-14`
- Cost: £0.0090/recipe
- Use when: Complexity score > 8
- Scenarios: 10+ ingredients, multiple allergens, multiple dietary restrictions

**Complexity Score Formula:**
```
score = (ingredients × 0.5) + (allergens × 3) + (dietary_restrictions × 2) + (has_description ? 1 : 0)

Examples:
- Simple: 4 ingredients, 0 allergens, 0 restrictions = 2 points → mini
- Complex: 10 ingredients, 2 allergens, 2 restrictions, 1 description = 5 + 6 + 4 + 1 = 16 points → full
```

### Claude Model

**Claude Sonnet 4.5:**
- Model ID: `claude-sonnet-4-5-20250929`
- API: Direct Anthropic API (not Bedrock or Vertex)
- Cost: £0.0163/recipe
- Features: More conversational tone, Constitutional AI safety
- Memory Tool: Parked for future (not in this MVP)

### Gemini Model

**Gemini 2.5 Flash:**
- Model ID: `gemini-2.5-flash`
- API Key: `GOOGLE_GEMINI_FREE_API_KEY` (free tier)
- Cost: £0 (free tier, 10 RPM limit)
- Features: Fast, good quality, multimodal support

---

## Success Criteria

**MVP is successful if:**

1. ✅ All 3 models generate valid recipes
2. ✅ Description field influences recipe style (verified with Claude)
3. ✅ OpenAI complexity routing works (mini for simple, full for complex)
4. ✅ Gemini uses free tier (£0 cost)
5. ✅ Allergen safety works across all models
6. ✅ No errors in production deployment
7. ✅ 5+ test users successfully generate recipes with all 3 models
8. ✅ Quality comparison data collected (which model users prefer)

---

## Next Steps After MVP

**Based on user feedback:**

1. **If Claude is preferred:** Consider Memory Tool implementation
2. **If Gemini is preferred:** Continue with free tier, plan paid tier migration
3. **If OpenAI is preferred:** Optimize complexity threshold, consider GPT-4.1 mini only
4. **If description is valuable:** Roll out to playground (unauthenticated users)
5. **If description is not used:** Consider removing or simplifying

**Decision Framework:**
- Collect qualitative feedback (which recipes did users prefer?)
- Track costs per model
- Monitor Gemini free tier rate limits
- Decide on primary model for £9.99 one-off plan

---

## Risk Mitigation

**Potential Issues:**

1. **Gemini free tier rate limit (10 RPM):**
   - **Risk:** Multiple testers exceed limit
   - **Mitigation:** Limited to handful of users, monitor usage
   - **Fallback:** Switch to paid tier if needed

2. **Claude costs for power users:**
   - **Risk:** Testers love Claude, generate 50+ recipes
   - **Mitigation:** MVP testing phase only, limited users
   - **Action:** Monitor costs, set expectations

3. **Complexity score inaccurate:**
   - **Risk:** Threshold of 8 triggers full model too often/rarely
   - **Mitigation:** Log all scores, adjust threshold based on data
   - **Action:** Review logs after 50 generations

4. **Description field confusing:**
   - **Risk:** Users don't understand how to use it
   - **Mitigation:** Clear helper text and examples
   - **Action:** User feedback survey

5. **Model response format inconsistencies:**
   - **Risk:** Claude/Gemini don't follow JSON format exactly
   - **Mitigation:** Robust parsing in `parseRecipeFromAI()`
   - **Action:** Log any parsing errors, refine prompts

---

## Cost Estimates (MVP Testing Phase)

**Assumptions:**
- 5 test users
- 10 recipes per user per model = 30 recipes per user
- Total: 150 recipes

**Breakdown:**
- OpenAI (50 recipes): 40 mini (£0.072) + 10 full (£0.090) = £0.162
- Claude (50 recipes): 50 × £0.0163 = £0.815
- Gemini (50 recipes): £0 (free tier)

**Total MVP cost: £0.98** (less than £1 for entire testing phase!)

---

## File Changes Summary

**Files to Modify:**

1. `frontend/src/app/(dashboard)/generate/page.tsx`
   - Add description state and textarea
   - Add model selection buttons
   - Update API request

2. `frontend/src/app/api/ai/generate/route.ts`
   - Add multi-model routing logic
   - Add complexity calculation
   - Integrate Claude and Gemini SDKs

3. `frontend/src/lib/ai/prompts.ts`
   - Add description parameter
   - Update prompt to include "USER'S VISION"

**Files to Create:**
- None (all changes are modifications)

**Dependencies to Install:**
- `@anthropic-ai/sdk`
- `@google/generative-ai`

---

## Deployment Checklist

**Pre-Deployment:**
- [ ] All code changes committed
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables verified locally
- [ ] Local testing passed (all 3 models work)
- [ ] Console logs added for debugging

**Vercel Deployment:**
- [ ] Push to GitHub (triggers Vercel deploy)
- [ ] Verify environment variables in Vercel dashboard
- [ ] Confirm `GOOGLE_GEMINI_FREE_API_KEY` is set (not paid key)
- [ ] Test production deployment with all 3 models
- [ ] Monitor Vercel logs for errors

**Post-Deployment:**
- [ ] Invite 5 test users
- [ ] Provide testing instructions
- [ ] Collect qualitative feedback (Google Form or similar)
- [ ] Monitor costs in OpenAI/Anthropic/Google dashboards
- [ ] Review console logs for complexity scores
- [ ] Document user preferences (which model they preferred)

---

## End of Implementation Plan

**Status:** Ready for implementation
**Estimated Time:** 4-6 hours
**Complexity:** Medium
**Risk Level:** Low (MVP testing only, limited users)

**Next Action:**
1. Start new chat
2. Provide this document as context
3. Begin implementation following todo list above

---

## Quick Reference: API Keys and Model IDs

```bash
# Environment Variables
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GEMINI_FREE_API_KEY=AIza...  # ← Use this one!

# Model IDs
OpenAI mini: gpt-4.1-mini-2025-04-14
OpenAI full: gpt-4.1-2025-04-14
Claude: claude-sonnet-4-5-20250929
Gemini: gemini-2.5-flash
```

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Author:** AI Research Agent
**For:** Recipe App MVP Multi-Model Testing
