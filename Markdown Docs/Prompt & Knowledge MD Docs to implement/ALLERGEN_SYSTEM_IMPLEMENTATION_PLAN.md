# 📋 ALLERGEN MANAGEMENT SYSTEM - IMPLEMENTATION PLAN

## Executive Summary

**Project:** Enhance allergen handling in AI recipe generation to use `allergen-taxonomies.ts` as single source of truth

**Approach Chosen:** SIMPLE - Block obvious unsafe, allow obvious safe, allow uncertain with site-wide disclaimers

**Key Decisions Made:**
- ✅ No backward compatibility needed (new site)
- ✅ Simple approach: Don't offer unsafe, DO offer safe alternatives explicitly
- ✅ Site-wide disclaimers + per-recipe subtle warnings (NOT dashboard warnings)
- ✅ No complex uncertainty flagging mechanism (reduces token cost & complexity)
- ✅ AI Priority: "Prefer safe/unsafe lists, but may use others if appropriate"
- ✅ Footer disclaimer on all pages (unobtrusive but visible)
- ✅ Allergen disclaimer in settings when user selects allergens

**Why This Approach:**
- Legal: Natasha's Law doesn't apply to recipe information platforms
- UX: Food allergy sufferers already know to check labels
- Technical: Simpler to implement, test, and maintain
- Cost: Lower token usage than complex uncertainty mechanism
- Reliability: AI uncertainty detection is inconsistent across 4 models

---

## Background Context

### Current System State

**File:** `frontend/src/lib/allergen-taxonomies.ts`
- Comprehensive safe/unsafe ingredient lists for all 14 UK allergens
- Used by `detectAllergensInText()` function with 3-step strategy:
  1. Check SAFE list → if match, allow ingredient
  2. Check UNSAFE list → if match, block ingredient
  3. Fallback to keyword matching
- Works well for validation, but **NOT currently sent to AI models**

**File:** `frontend/src/lib/allergen-detector.ts`
- Contains `detectAllergensInText(ingredientText, userAllergens)`
- Contains `detectAllergensInIngredients(ingredients, userAllergens)`
- Contains `groupMatchesByAllergen(matches)`
- Currently uses taxonomy for detection
- Exports `UK_ALLERGENS` constant with 14 allergens

**File:** `frontend/src/lib/ai/prompts.ts`
- Function: `createRecipeGenerationPrompt(params)`
- Lines 41-44: Current allergen handling (SIMPLE - just says "AVOID: milk")
- This gets sent to AI but without taxonomy context

**File:** `frontend/src/app/api/ai/generate/route.ts`
- Pre-generation allergen check (lines 78-105): Blocks if user enters unsafe ingredients
- Post-generation allergen check (lines 309-324): Warns if AI included allergens
- Currently working ~70-80% of time for safe alternatives

**File:** `frontend/src/app/api/recipes/route.ts`
- Lines 94-106: Auto-detects ALL allergens when saving to database
- Used for public recipe library filtering

### Current Behavior (What Works Sometimes)

User with dairy allergen asks for "creamy curry":
- ✅ AI sees "AVOID: milk" in prompt
- ✅ AI naturally suggests coconut milk (from training)
- ✅ Works ~70-80% of time
- ❌ Not consistent across 4 models
- ❌ Sometimes avoids safe ingredients (e.g., might avoid coconut products due to "milk" in name)

### What We're Fixing

Make AI consistently:
1. **Avoid** ingredients from UNSAFE taxonomy list
2. **Prioritize** ingredients from SAFE taxonomy list
3. **Use judgment** for unlisted ingredients (with safety priority)
4. Be consistent across all 4 AI models (OpenAI, Claude, Gemini, Grok)

---

## Implementation Steps

### PHASE 1: Create Taxonomy Serialization Function

**File:** `frontend/src/lib/allergen-taxonomies.ts`

**Add at end of file (after line 815):**

```typescript
/**
 * Serializes allergen taxonomy data into AI-readable format
 * Used in AI prompts to provide explicit safe/unsafe ingredient guidance
 *
 * @param allergenIds - Array of allergen IDs user has (e.g., ['milk', 'gluten'])
 * @returns Formatted string for AI prompt with unsafe/safe lists
 */
export function serializeAllergenTaxonomyForAI(allergenIds: string[]): string {
  if (!allergenIds || allergenIds.length === 0) {
    return '';
  }

  let output = '';

  allergenIds.forEach((allergenId) => {
    const taxonomy = ALLERGEN_TAXONOMIES[allergenId];
    const allergenDef = UK_ALLERGENS.find(a => a.id === allergenId);

    if (!taxonomy || !allergenDef) {
      return; // Skip if taxonomy not found
    }

    output += `\n${allergenDef.label.toUpperCase()}:\n`;

    // Unsafe ingredients (limit to first 30 for token efficiency)
    if (taxonomy.unsafe && taxonomy.unsafe.length > 0) {
      const unsafeList = taxonomy.unsafe.slice(0, 30);
      output += `  ❌ NEVER USE: ${unsafeList.join(', ')}`;
      if (taxonomy.unsafe.length > 30) {
        output += ` (and similar ${allergenDef.label.toLowerCase()} products)`;
      }
      output += '\n';
    }

    // Safe alternatives (limit to first 20 for token efficiency)
    if (taxonomy.safe && taxonomy.safe.length > 0) {
      const safeList = taxonomy.safe.slice(0, 20);
      output += `  ✅ SAFE ALTERNATIVES: ${safeList.join(', ')}`;
      if (taxonomy.safe.length > 20) {
        output += ' (and similar alternatives)';
      }
      output += '\n';
    }
  });

  return output;
}
```

**Import needed in allergen-detector.ts:**
The function needs to import `UK_ALLERGENS` but it's already in the same file (`allergen-taxonomies.ts`), so no additional import needed.

**Testing this function:**
```typescript
// Test with single allergen
console.log(serializeAllergenTaxonomyForAI(['milk']));

// Expected output:
// MILK/DAIRY:
//   ❌ NEVER USE: milk, whole milk, cheese, cheddar, butter, cream, ...
//   ✅ SAFE ALTERNATIVES: coconut milk, almond milk, oat milk, soy milk, ...
```

---

### PHASE 2: Update AI Prompt Generation

**File:** `frontend/src/lib/ai/prompts.ts`

**Step 2.1: Add import at top of file (after existing imports around line 1)**

```typescript
import { serializeAllergenTaxonomyForAI } from './allergen-taxonomies';
```

**Step 2.2: Replace allergen section (lines 38-56)**

**FIND (lines 38-56):**
```typescript
  // User Context (personalization)
  if (userPreferences) {
    prompt += `USER PROFILE:\n`;

    if (userPreferences.allergies && userPreferences.allergies.length > 0) {
      prompt += `⚠️ CRITICAL - ALLERGENS TO AVOID: ${userPreferences.allergies.join(', ')}\n`;
      prompt += `DO NOT include these ingredients or their derivatives under any circumstances.\n`;
    }

    if (userPreferences.cuisines_liked && userPreferences.cuisines_liked.length > 0) {
      if (userPreferences.cuisines_liked.length === 1) {
        // Single cuisine - be explicit and directive
        prompt += `- Cuisine style: ${userPreferences.cuisines_liked[0]} (create a ${userPreferences.cuisines_liked[0]} recipe)\n`;
      } else {
        // Multiple cuisines - AI can choose
        prompt += `- Preferred cuisines: ${userPreferences.cuisines_liked.join(', ')}\n`;
      }
    }

    prompt += `\n`;
  }
```

**REPLACE WITH:**
```typescript
  // User Context (personalization)
  if (userPreferences) {
    prompt += `USER PROFILE:\n`;

    if (userPreferences.allergies && userPreferences.allergies.length > 0) {
      prompt += `⚠️ CRITICAL - ALLERGEN SAFETY GUIDANCE:\n`;
      prompt += `The user has the following allergies: ${userPreferences.allergies.join(', ')}\n`;

      // Serialize taxonomy data for AI
      const taxonomyGuidance = serializeAllergenTaxonomyForAI(userPreferences.allergies);
      if (taxonomyGuidance) {
        prompt += taxonomyGuidance;
      }

      prompt += `\n🤖 AI INSTRUCTIONS:\n`;
      prompt += `1. NEVER use ingredients from the "NEVER USE" lists above\n`;
      prompt += `2. PRIORITIZE ingredients from the "SAFE ALTERNATIVES" lists when possible\n`;
      prompt += `3. For ingredients not listed above, use your training knowledge about food chemistry and allergen safety\n`;
      prompt += `4. When in doubt, prefer ingredients you know are safe or suggest alternatives\n`;
      prompt += `5. Safety is paramount - be cautious but not overly restrictive\n`;
      prompt += `\n`;
    }

    if (userPreferences.cuisines_liked && userPreferences.cuisines_liked.length > 0) {
      if (userPreferences.cuisines_liked.length === 1) {
        // Single cuisine - be explicit and directive
        prompt += `- Cuisine style: ${userPreferences.cuisines_liked[0]} (create a ${userPreferences.cuisines_liked[0]} recipe)\n`;
      } else {
        // Multiple cuisines - AI can choose
        prompt += `- Preferred cuisines: ${userPreferences.cuisines_liked.join(', ')}\n`;
      }
    }

    prompt += `\n`;
  }
```

**What this does:**
- Sends unsafe lists to AI (what to avoid)
- Sends safe lists to AI (what to prioritize)
- Clear instructions on how to use the taxonomy
- Gives AI permission to use unlisted ingredients with judgment
- Token efficient (limits lists to 30 unsafe, 20 safe per allergen)

**Estimated token increase:**
- 1 allergen: ~250-350 tokens
- 2 allergens: ~450-600 tokens
- 3 allergens: ~650-850 tokens
- 5 allergens: ~1000-1200 tokens

---

### PHASE 3: Add Site-Wide Disclaimers

**File:** `frontend/src/components/layout/footer.tsx` (or create if doesn't exist)

**Location:** If footer component exists, add allergen notice. If not, create basic footer.

**Footer Allergen Notice Text:**

```typescript
<div className="bg-amber-50 border-t border-amber-200 py-3 px-4 text-center">
  <p className="text-sm text-amber-800">
    <span className="font-medium">⚠️ Allergen Notice:</span> Recipe allergen information is AI-detected and provided for informational purposes only.
    We cannot guarantee accuracy or completeness. Always verify ingredients on product packaging and consult healthcare providers for serious allergies.
    Manufacturers may change formulations without notice.{' '}
    <a href="/allergen-safety" className="underline hover:text-amber-900">
      Read full allergen safety information
    </a>
  </p>
</div>
```

**Alternative:** If you want just footer link without prominent banner:

```typescript
<footer className="border-t py-6">
  <div className="container mx-auto px-4 text-center text-sm text-gray-600">
    <p>
      © 2025 PlateWise. All rights reserved. |{' '}
      <a href="/allergen-safety" className="underline hover:text-gray-900">
        Allergen Safety Information
      </a>
    </p>
  </div>
</footer>
```

---

### PHASE 4: Add Allergen Safety Page

**File:** `frontend/src/app/(dashboard)/allergen-safety/page.tsx` (NEW FILE)

**Create this file with the following content:**

```typescript
export default function AllergenSafetyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Allergen Safety & Recipe Information</h1>

      <div className="prose prose-lg max-w-none">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8">
          <h2 className="text-xl font-bold text-amber-900 mt-0">Important Notice About Allergen Information</h2>
          <p className="text-amber-800 mb-0">
            <strong>PlateWise provides AI-generated recipes for informational and inspirational purposes only.</strong> While we make every effort to accurately detect and label allergens in our recipes, we cannot guarantee completeness or accuracy.
          </p>
        </div>

        <h2>Your Responsibility</h2>
        <h3>Before Using Any Recipe:</h3>
        <ul>
          <li><strong>Always check ingredient labels</strong> - Manufacturers may change formulations without notice</li>
          <li><strong>Verify allergen information</strong> on every product you purchase</li>
          <li><strong>Consult your healthcare provider</strong> for serious allergies or dietary restrictions</li>
          <li><strong>Cross-contamination</strong> - Be aware of potential cross-contact during manufacturing and preparation</li>
          <li><strong>Ingredient substitutions</strong> - Any changes you make may introduce allergens not listed in the original recipe</li>
        </ul>

        <h2>How We Detect Allergens</h2>
        <p>Our system uses AI technology to detect allergens in recipes based on the 14 major UK allergens:</p>
        <ul>
          <li>Cereals containing gluten</li>
          <li>Crustaceans (shellfish)</li>
          <li>Eggs</li>
          <li>Fish</li>
          <li>Peanuts</li>
          <li>Soybeans (soya)</li>
          <li>Milk (dairy)</li>
          <li>Tree nuts (almonds, hazelnuts, walnuts, etc.)</li>
          <li>Celery</li>
          <li>Mustard</li>
          <li>Sesame</li>
          <li>Sulphites</li>
          <li>Lupin</li>
          <li>Molluscs</li>
        </ul>

        <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8">
          <h3 className="text-red-900 mt-0">However, AI Detection Has Limitations</h3>
          <p className="text-red-800">AI detection may not identify:</p>
          <ul className="text-red-800">
            <li>Hidden allergens in processed ingredients</li>
            <li>Allergens in specific product brands or formulations</li>
            <li>Cross-contamination during manufacturing</li>
            <li>Allergens introduced through ingredient substitutions</li>
            <li>New or modified product formulations</li>
          </ul>
        </div>

        <h2>Site-Wide Allergen Disclaimer</h2>
        <p><strong>No Liability for Adverse Reactions:</strong> We assume no liability for allergic reactions or adverse health effects resulting from recipes or information provided on this site. It is your sole responsibility to verify the safety and suitability of all ingredients for your specific dietary needs.</p>

        <p><strong>No Medical Advice:</strong> Information on this site is not medical advice. Consult with a qualified healthcare professional or registered dietitian for personalized dietary guidance.</p>

        <p><strong>AI-Generated Content:</strong> Recipes are generated using artificial intelligence technology, which may produce errors or incomplete information. Always apply your own judgment and knowledge when following recipes.</p>

        <p><strong>Accuracy Not Guaranteed:</strong> While we strive for accuracy, we make no warranties or representations about the accuracy, reliability, completeness, or timeliness of allergen information or recipe content.</p>

        <h2>Best Practices for Food Allergy Safety</h2>
        <ol>
          <li><strong>Keep it simple</strong> - The fewer ingredients, the easier to verify safety</li>
          <li><strong>Whole foods first</strong> - Fresh, unprocessed ingredients are easier to identify</li>
          <li><strong>When in doubt, leave it out</strong> - If you're unsure about an ingredient, don't use it</li>
          <li><strong>Read every label, every time</strong> - Even familiar products may change</li>
          <li><strong>Watch for "may contain" warnings</strong> - These indicate potential cross-contamination</li>
          <li><strong>Ask questions</strong> - Contact manufacturers if allergen information is unclear</li>
        </ol>

        <h2>Useful Resources</h2>
        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-bold mb-2">UK Food Standards Agency (FSA)</h3>
            <p className="text-sm mb-2">Allergen guidance for consumers</p>
            <a href="https://www.food.gov.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
              www.food.gov.uk →
            </a>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-bold mb-2">Allergy UK</h3>
            <p className="text-sm mb-2">Support and information for people with allergies</p>
            <a href="https://www.allergyuk.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
              www.allergyuk.org →
            </a>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-bold mb-2">Anaphylaxis UK</h3>
            <p className="text-sm mb-2">Emergency guidance and support</p>
            <a href="https://www.anaphylaxis.org.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
              www.anaphylaxis.org.uk →
            </a>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-bold mb-2">Coeliac UK</h3>
            <p className="text-sm mb-2">Comprehensive gluten-free information</p>
            <a href="https://www.coeliac.org.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
              www.coeliac.org.uk →
            </a>
          </div>
        </div>

        <div className="bg-gray-50 border rounded-lg p-6 my-8">
          <p className="text-sm text-gray-700 mb-0">
            <strong>Remember:</strong> Your health and safety are your responsibility. When in doubt, verify with product labels, manufacturers, and healthcare professionals.
          </p>
        </div>

        <p className="text-sm text-gray-600 mt-8">
          <strong>Last Updated:</strong> January 2025
        </p>
      </div>
    </div>
  );
}
```

---

### PHASE 5: Add Disclaimer to Settings Allergen Section

**File:** `frontend/src/app/(dashboard)/settings/page.tsx` (or wherever allergen settings are)

**Location:** Find where user selects allergens (likely a checkbox list or multi-select)

**Add this ABOVE the allergen selector:**

```typescript
<div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
  <div className="flex">
    <InfoIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
    <div>
      <h3 className="text-sm font-medium text-blue-900 mb-1">
        Important: Allergen Safety Information
      </h3>
      <p className="text-sm text-blue-800">
        Our AI will avoid ingredients containing your selected allergens, but <strong>you must always verify all ingredient labels</strong> before use.
        AI-generated recipes may contain errors or miss hidden allergens in processed foods.{' '}
        <a href="/allergen-safety" className="underline font-medium hover:text-blue-900">
          Read full allergen safety guidance
        </a>
      </p>
    </div>
  </div>
</div>

{/* Existing allergen selector here */}
```

**Alternative (more subtle):**

```typescript
<p className="text-sm text-gray-600 mb-4">
  ⚠️ <strong>Important:</strong> Always verify ingredient labels. AI cannot guarantee allergen detection accuracy.{' '}
  <a href="/allergen-safety" className="text-blue-600 underline hover:text-blue-800">
    Learn more
  </a>
</p>
```

---

### PHASE 6: Subtle Recipe Warnings (Already Exists - Verify Only)

**File:** `frontend/src/app/(dashboard)/my-recipes/page.tsx` or recipe detail pages

**Current implementation check:**
- Recipe pages should already show allergen badges next to detected allergens
- Should be subtle (not prominent red warnings on dashboard)
- Located on individual recipe pages, NOT on main /my-recipes list view

**If NOT present, add to recipe detail view:**

```typescript
{recipe.allergens && recipe.allergens.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-4">
    <span className="text-sm text-gray-600">Contains allergens:</span>
    {recipe.allergens.map((allergen) => {
      const allergenDef = UK_ALLERGENS.find(a => a.id === allergen);
      return (
        <span
          key={allergen}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
        >
          ⚠️ {allergenDef?.label || allergen}
        </span>
      );
    })}
  </div>
)}
```

---

## Testing Scenarios

### Test 1: Dairy Allergen - Safe Alternative Prioritization

**Setup:**
- User profile: `allergies: ['milk']`
- Ingredients: "chicken, onion, garlic"
- Description: "creamy curry"

**Expected Behavior:**
1. Pre-generation: No blocking (no unsafe ingredients entered)
2. AI prompt includes:
   - ❌ NEVER USE: milk, cream, butter, cheese...
   - ✅ SAFE ALTERNATIVES: coconut milk, coconut cream, almond milk, oat milk...
3. AI generates recipe using coconut milk or coconut cream
4. Post-generation: No warnings (safe alternative used)
5. Database save: No milk allergen detected

**Success Criteria:**
- ✅ Recipe uses coconut milk/cream (not dairy)
- ✅ No allergen warnings shown
- ✅ Consistent across all 4 models (OpenAI, Claude, Gemini, Grok)

---

### Test 2: Gluten Allergen - Buckwheat Allowed

**Setup:**
- User profile: `allergies: ['gluten']`
- Ingredients: "buckwheat noodles, vegetables"
- Description: "stir fry"

**Expected Behavior:**
1. Pre-generation: No blocking (buckwheat is in SAFE list)
2. AI prompt includes:
   - ❌ NEVER USE: wheat, bread, pasta, flour, barley...
   - ✅ SAFE ALTERNATIVES: rice, rice noodles, buckwheat, buckwheat noodles, quinoa...
3. AI confidently uses buckwheat noodles
4. Post-generation: No warnings
5. Database save: No gluten allergen detected

**Success Criteria:**
- ✅ Recipe uses buckwheat noodles without hesitation
- ✅ No false positive gluten warnings

---

### Test 3: Multiple Allergens

**Setup:**
- User profile: `allergies: ['milk', 'gluten', 'eggs']`
- Ingredients: "chicken, vegetables"
- Description: "something comforting"

**Expected Behavior:**
1. AI receives unsafe/safe lists for all 3 allergens
2. AI suggests gluten-free grain (rice, quinoa)
3. AI uses dairy-free option (coconut milk, olive oil)
4. AI avoids egg-based sauces
5. Token usage ~600-850 tokens increase

**Success Criteria:**
- ✅ All 3 allergens avoided
- ✅ Safe alternatives used for each
- ✅ Recipe is practical and tasty

---

### Test 4: Pre-Generation Blocking

**Setup:**
- User profile: `allergies: ['peanuts']`
- User enters ingredient: "peanut butter"

**Expected Behavior:**
1. `detectAllergensInText("peanut butter", ['peanuts'])` matches
2. API returns 400 error with message
3. Recipe generation blocked
4. User sees error message

**Success Criteria:**
- ✅ Generation prevented
- ✅ Clear error message explaining conflict

---

### Test 5: Post-Generation Warning (AI Mistake)

**Setup:**
- User profile: `allergies: ['milk']`
- AI somehow includes "cheddar cheese" in recipe

**Expected Behavior:**
1. AI generates recipe (mistake)
2. Post-generation check detects "cheddar cheese" contains milk
3. Warning returned: `⚠️ Milk/Dairy: cheddar cheese`
4. User sees amber warning box
5. User can still save (with acknowledgment)

**Success Criteria:**
- ✅ Warning displayed
- ✅ User not blocked from saving
- ✅ Clear which ingredient caused warning

---

### Test 6: Comprehensive Database Detection

**Setup:**
- Recipe with ingredients: "soy sauce, chicken, rice"
- User has NO allergens selected

**Expected Behavior:**
1. On save, `detectAllergensInIngredients()` checks all 14 UK allergens
2. Detects "soy sauce" contains `soy` and `gluten`
3. Stores in database: `allergens: ['soy', 'gluten']`
4. Available for public recipe filtering

**Success Criteria:**
- ✅ Both allergens detected
- ✅ Stored in database correctly
- ✅ Other users with soy/gluten allergies will see warnings

---

## Success Metrics

### Functional Goals
- ✅ Taxonomy is single source of truth (used by detection AND AI prompts)
- ✅ AI receives appropriate context for user's allergens
- ✅ AI consistently uses safe alternatives from taxonomy
- ✅ No complex uncertainty mechanism (simple = reliable)
- ✅ Comprehensive detection stores all allergens in database
- ✅ Easy to update taxonomy (single location, propagates everywhere)

### Technical Goals
- ✅ Token increase < 1000 tokens for typical user (2-3 allergens)
- ✅ No breaking changes to existing flows
- ✅ Maintains current performance
- ✅ Works across all 4 AI models consistently

### User Experience Goals
- ✅ Clearer allergen guidance in generated recipes
- ✅ Fewer false positives (coconut milk allowed for dairy allergy)
- ✅ Better safe alternative suggestions (explicit in prompt)
- ✅ Appropriate disclaimers (not scary, but legally protective)
- ✅ Subtle warnings (visible but not overwhelming)

### Legal/Safety Goals
- ✅ Site-wide disclaimers in place
- ✅ Per-recipe allergen information accurate
- ✅ User responsibility clearly communicated
- ✅ Links to authoritative resources (FSA, Allergy UK)

---

## File Reference Map

### Files to Modify

| File | Lines | Action | Complexity |
|------|-------|--------|------------|
| `frontend/src/lib/allergen-taxonomies.ts` | After 815 | Add `serializeAllergenTaxonomyForAI()` function | Easy |
| `frontend/src/lib/ai/prompts.ts` | 1 | Add import statement | Easy |
| `frontend/src/lib/ai/prompts.ts` | 38-56 | Replace allergen prompt section | Medium |
| `frontend/src/components/layout/footer.tsx` | N/A | Add allergen notice (or create footer) | Easy |
| `frontend/src/app/(dashboard)/allergen-safety/page.tsx` | N/A | Create new page (full content provided) | Easy |
| `frontend/src/app/(dashboard)/settings/page.tsx` | Find allergen selector | Add disclaimer above selector | Easy |

### Files to Verify (No Changes Needed)

| File | What to Check |
|------|---------------|
| `frontend/src/lib/allergen-detector.ts` | Functions work correctly (already do) |
| `frontend/src/app/api/ai/generate/route.ts` | Pre/post generation checks (already working) |
| `frontend/src/app/api/recipes/route.ts` | Comprehensive detection on save (already working) |
| Recipe detail pages | Allergen badges displayed (should exist) |

---

## Token Budget Analysis

### Current Prompt (No Taxonomy)
- Base prompt: ~800-1200 tokens
- Allergen section: ~20 tokens ("AVOID: milk, gluten")
- **Total: ~1000 tokens**

### Enhanced Prompt (With Taxonomy)
- Base prompt: ~800-1200 tokens (unchanged)
- Allergen section with taxonomy:
  - 1 allergen: ~250-350 tokens
  - 2 allergens: ~450-600 tokens
  - 3 allergens: ~650-850 tokens
  - 5 allergens: ~1000-1200 tokens

**Total with 2-3 allergens: ~1400-1800 tokens**

### Cost Impact (Example with OpenAI GPT-4.1)
- Input tokens: 1000 → 1600 (+600)
- At $0.015 per 1K input tokens
- **Additional cost: ~$0.009 per recipe (~0.9p)**

For 1000 recipes/month with 2 allergens:
- Additional cost: $9/month (£7)
- Negligible compared to output token costs

**Recommendation:** Monitor with existing tracking, but cost increase is minimal and worth it for consistency improvement.

---

## Implementation Checklist

### Phase 1: Core Functionality
- [ ] Add `serializeAllergenTaxonomyForAI()` to allergen-taxonomies.ts
- [ ] Add import to prompts.ts
- [ ] Replace allergen prompt section in prompts.ts
- [ ] Test with single allergen (dairy)
- [ ] Verify AI response uses safe alternatives

### Phase 2: Testing
- [ ] Test all 6 scenarios documented above
- [ ] Test across all 4 AI models (OpenAI, Claude, Gemini, Grok)
- [ ] Verify token usage increase is acceptable
- [ ] Check pre-generation blocking still works
- [ ] Check post-generation warnings still work
- [ ] Check database detection still works

### Phase 3: Disclaimers
- [ ] Add footer notice to recipe pages
- [ ] Create allergen-safety page
- [ ] Add disclaimer to settings allergen section
- [ ] Test all links work
- [ ] Review disclaimer wording with legal (if applicable)

### Phase 4: Polish
- [ ] Verify allergen badges show on recipe pages
- [ ] Ensure warnings are subtle but visible
- [ ] Check mobile responsive design
- [ ] Update any documentation
- [ ] User acceptance testing

---

## Potential Issues & Solutions

### Issue 1: AI Ignores Taxonomy Lists
**Symptom:** AI still suggests unsafe ingredients despite taxonomy
**Solution:**
- Strengthen prompt wording ("NEVER USE" instead of "AVOID")
- Add ⚠️ symbols for emphasis
- Test different models to find which performs best
- Consider adding examples to prompt

### Issue 2: Token Limits Exceeded
**Symptom:** API errors due to prompt too long
**Solution:**
- Reduce number of items shown per allergen (currently 30 unsafe, 20 safe)
- For users with many allergens (5+), show fewer items per list
- Prioritize most common items in taxonomy lists

### Issue 3: AI Over-Cautious
**Symptom:** AI avoids safe ingredients unnecessarily
**Solution:**
- Emphasize "SAFE ALTERNATIVES" section in prompt
- Add instruction: "Ingredients in SAFE ALTERNATIVES list are confirmed safe"
- Test prompt wording variations

### Issue 4: Inconsistent Across Models
**Symptom:** GPT works well, Claude doesn't (or vice versa)
**Solution:**
- Test each model separately
- May need slight prompt variations per model (future enhancement)
- Document which models work best for allergen handling

---

## Future Enhancements (Not in This Implementation)

### Enhancement 1: AI-Detected Allergens in Recipe
- Have AI return `detected_allergens` array in recipe JSON
- Merge with taxonomy-based detection for comprehensive coverage
- Catches unlisted ingredients AI recognizes from training

### Enhancement 2: Per-Model Prompt Tuning
- Customize allergen guidance for each AI model
- GPT might need different wording than Claude
- Track which model performs best for allergen safety

### Enhancement 3: Uncertainty Flagging
- Add mechanism for AI to flag uncertain ingredients
- "This bread may contain dairy - check label"
- Requires careful implementation to avoid warning fatigue

### Enhancement 4: User Feedback Loop
- Let users report incorrect allergen detections
- Build database of edge cases
- Continuously improve taxonomy

---

## Notes for Implementation

### Key Principles
1. **Simple is better** - Complex uncertainty mechanisms add more problems than solutions
2. **Disclaimers protect legally** - UK law doesn't require perfection, just reasonable effort
3. **Users know their allergies** - They already check labels, we're helping not replacing
4. **Taxonomy is guide, not limit** - AI can use unlisted ingredients with judgment
5. **Consistency matters** - Better to reliably avoid obvious dangers than try to catch every edge case

### What Makes This Work
- **Explicit safe alternatives** - AI knows what to suggest, not just what to avoid
- **Clear priority system** - Prefer lists, but can use others
- **Legal protection** - Site-wide disclaimers are industry standard
- **Realistic expectations** - We're not replacing allergen experts, just helping

### Testing Focus
- Test the common cases thoroughly (dairy, gluten, nuts)
- Verify AI uses safe alternatives consistently
- Ensure disclaimers are visible but not scary
- Check token usage stays reasonable

---

## Ready to Implement?

This plan is complete and ready for execution. Start with Phase 1 (core functionality), test thoroughly, then add disclaimers. The implementation is straightforward - most complexity is in the taxonomy serialization function, which is ~40 lines of code.

**Estimated implementation time:** 2-3 hours for phases 1-3, plus testing time.

**Questions before starting?** Everything should be clearly documented above, but feel free to ask for clarifications on any section.

---

*End of Implementation Plan*
