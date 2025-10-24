# Quick Win: "BEFORE GENERATING - ANALYZE REQUEST" Section

## Overview
This is a **low-risk, high-reward** enhancement to your recipe generation prompt that forces AI models to think through potential conflicts before generating recipes.

**Effort:** 30 minutes
**Risk:** Low (easy to rollback)
**Impact:** Should fix the "beef stew in 4 cuisines" and similar edge cases

---

## The Problem This Solves

**Current behavior:**
- User asks for "beef stew in slow cooker"
- User has 4 cuisines in settings (British, Chinese, Indian, Mexican)
- AI generates 4 recipes: British beef stew ✅, Chinese beef stew ❌, Indian beef stew ❌, Mexican beef stew ❌
- Result: 3 culturally inappropriate recipes

**Why it happens:**
AI reads the prompt like a checklist:
- ✓ Four cuisines? Check.
- ✓ Slow cooker mode? Check.
- ✓ Use beef? Check.
- ❌ Common sense about cultural appropriateness? Missed.

**After this fix:**
AI is forced to analyze the request first:
- "Beef stew" is culturally British → ignore cuisine variety, make British only
- Result: 4 British beef stew recipes (or just 1 if single model selected)

---

## The Code Change

### Location
File: `frontend/src/lib/ai/prompts.ts`
Function: `createRecipeGenerationPrompt()`
Line: Approximately line 35 (after the opening of the prompt string)

### What to Add

Add this section **at the very top** of your prompt, before "You are a professional UK-based chef":

```typescript
export function createRecipeGenerationPrompt(params: RecipeGenerationParams): string {
  const {
    ingredients,
    pantryStaples,
    ingredientMode = 'flexible',
    description,
    dietary_preferences = [],
    servings = 4,
    prepTimeMax,
    cookingMode = 'standard',
    difficulty,
    spiceLevel,
    userPreferences,
  } = params;

  let prompt = `BEFORE GENERATING - ANALYZE THE REQUEST:

1. CULTURAL SPECIFICITY CHECK
   - User description: "${description || 'none provided'}"
   - Does this mention a specific dish name (e.g., "beef stew", "shepherd's pie", "tikka masala", "carbonara", "kung pao")?
   - If YES: Generate ONLY in that dish's native cuisine style, ignore cuisine variety
   - If NO: Use cuisine preferences normally to create variety

2. ALLERGEN SAFETY CHECK
   ${userPreferences?.allergies && userPreferences.allergies.length > 0 ? `
   - User is allergic to: ${userPreferences.allergies.join(', ')}
   - User provided ingredients: ${ingredients.join(', ')}
   - CRITICAL: Check for false positives:
     * "Coconut milk" is SAFE for dairy/milk allergies (plant-based)
     * "Oat milk", "Almond milk", "Soy milk" are SAFE for dairy allergies (plant-based)
     * "Buckwheat" is SAFE for gluten allergies (despite the name, it's a seed)
     * "Peanuts" are NOT tree nuts (they're legumes - different allergy)
   - If any ingredients conflict with allergies (after checking false positives), STOP and flag the issue
   ` : '- No allergens specified, proceed normally'}

3. COOKING MODE COMPATIBILITY
   ${cookingMode === 'slow_cooker' ? `
   - Mode: SLOW COOKER
   - This works best for: British stews/casseroles, American pot roasts, some adapted curries
   - This does NOT work well for: Chinese stir-fries, Japanese quick-cook dishes, Italian pasta dishes
   - If user has multiple cuisines AND slow cooker mode: prioritize compatible cuisines
   ` : cookingMode === 'air_fryer' ? `
   - Mode: AIR FRYER
   - This works for most cuisines with adaptation
   - Ensure recipes are designed for air circulation (single layer cooking)
   ` : cookingMode === 'batch_cook' ? `
   - Mode: BATCH COOKING
   - Focus on freezer-friendly dishes: stews, curries, casseroles, soups, bolognese-style sauces
   - Avoid dishes that don't freeze well (fresh salads, cream-based unless specified)
   ` : '- Standard cooking mode, all cuisines appropriate'}

NOW PROCEED WITH RECIPE GENERATION USING THE ANALYSIS ABOVE.

---

You are a professional UK-based chef assistant helping a home cook. Generate a delicious, practical recipe.\n\n`;

  // Rest of your existing prompt building code continues here...
  // (User Context, Pantry Staples, Available Ingredients, etc.)
```

---

## Test Scenarios

After implementing, test these scenarios to validate it works:

### Test 1: Beef Stew Issue (The Original Problem)
**Input:**
- Ingredients: `Beef, carrots, potatoes, onions`
- Description: `"Beef stew in slow cooker"`
- Cuisines: `British, Chinese, Indian, Mexican`
- Cooking Mode: `Slow cooker`
- Generate: `All 4 Styles`

**Expected Result:**
- All 4 recipes should be British-style beef stew
- OR AI should explain why it's only generating British style

**Current Result (Before Fix):**
- Would generate Chinese/Indian/Mexican beef stew variants

---

### Test 2: Coconut Milk False Positive
**Input:**
- Ingredients: `Chicken, coconut milk, rice, curry paste`
- Allergies: `Milk/Dairy`
- Description: `"Thai curry"`

**Expected Result:**
- No allergen warning (coconut milk is safe)
- Recipe generates successfully with coconut milk

**Current Result (Before Fix):**
- Might flag coconut milk as dairy concern

---

### Test 3: Generic Request (Don't Break What Works)
**Input:**
- Ingredients: `Chicken, pasta, tomatoes, garlic`
- Description: `"Something Italian and quick"`
- Cuisines: `Italian, British`
- Generate: `Single recipe`

**Expected Result:**
- Italian chicken pasta recipe
- Should work exactly as before

**Why This Test:**
- Ensures we didn't break normal behavior
- Only edge cases should change

---

### Test 4: Multi-Cuisine Without Specific Dish (Keep Current Behavior)
**Input:**
- Ingredients: `Chicken, vegetables, rice`
- Description: `"Something healthy for dinner"`
- Cuisines: `British, Italian, Indian, Chinese`
- Generate: `All 4 Styles`

**Expected Result:**
- 4 different recipes in 4 different cuisines
- Variety is GOOD here because no specific dish mentioned

**Why This Test:**
- Proves the Cultural Specificity Check only triggers for specific dish names
- Doesn't over-restrict when users want variety

---

## How to Test

1. **Make the code change** in `prompts.ts`
2. **Start your dev server** (`npm run dev`)
3. **Navigate to** `/create-recipe`
4. **Run each test scenario** manually
5. **Check the generated recipes** match expected results
6. **Document any unexpected behavior**

---

## Expected Outcomes

✅ **If successful:**
- Test 1: Beef stew only generates in British style
- Test 2: Coconut milk doesn't trigger allergen warning
- Test 3: Normal recipes still work fine
- Test 4: Generic requests still get variety

✅ **What this fixes:**
- Culturally inappropriate dish/cuisine combinations
- False positive allergen warnings
- Slow cooker + incompatible cuisine combinations

✅ **What this doesn't break:**
- Normal recipe generation
- Variety when user wants it
- Existing functionality

---

## Rollback Plan

If something goes wrong:

1. **Revert the code change** (remove the "BEFORE GENERATING" section)
2. **Restart dev server**
3. **Document what went wrong** in your edge case log
4. **Adjust the approach** based on what you learned

The change is **isolated to one section of one file**, so rolling back is trivial.

---

## Next Steps After Success

If this works well after 1-2 weeks in production:

1. ✅ Keep the "BEFORE GENERATING" section
2. ✅ Start building the comprehensive allergen taxonomy (Phase 2)
3. ✅ Add more cultural dish mappings as you discover edge cases
4. ✅ Consider adding a cooking mode compatibility matrix

---

## Notes & Observations

**Things to watch for:**
- Does the AI actually follow the analysis instructions?
- Does it over-restrict (blocking things that should work)?
- Does it under-restrict (still creating weird combinations)?

**Edge cases to document:**
- Any dishes that aren't clearly culturally specific (fusion food?)
- Multi-cultural dishes (tikka masala is British-Indian fusion)
- Regional variations (is "curry" British or Indian in UK context?)

**Success metrics:**
- Fewer inappropriate cuisine combinations
- Fewer allergen false positives
- No increase in other edge cases
- User satisfaction (fewer weird recipes)

---

## Estimated Timeline

- **Implementation:** 15 minutes (copy-paste code)
- **Testing:** 30 minutes (run all 4 test scenarios)
- **Monitoring:** 1-2 weeks (watch for issues in production)
- **Total:** 1 week from implementation to confidence

---

## Questions or Issues?

If you encounter problems:
1. Check that the template literals are properly escaped
2. Verify the section is at the TOP of the prompt (before other instructions)
3. Test with a simple case first (just the beef stew test)
4. Check the actual prompt being sent to the AI (console.log it if needed)

---

**Status: Ready to implement**
**Risk Level: Low**
**Expected Impact: High (for specific edge cases)**
**Recommendation: Proceed with implementation and testing**
