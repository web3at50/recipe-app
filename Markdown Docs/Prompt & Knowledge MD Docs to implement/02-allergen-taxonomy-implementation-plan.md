# Allergen Taxonomy Implementation Plan

## Overview
This document outlines the strategy for building and implementing a comprehensive allergen taxonomy system for the recipe generation platform.

**Goal:** Provide AI models with detailed, accurate reference data about allergens to minimize false positives and ensure user safety.

**Approach:** Incremental rollout, starting with one allergen (gluten) and expanding over time.

---

## Why We're Doing This

### Current Problems
1. **False Positives:** Coconut milk flagged for dairy allergies
2. **Inconsistency:** Different parts of the app might handle allergens differently
3. **Incompleteness:** Relying solely on AI training data misses edge cases
4. **UK-Specific Gaps:** AI might not know UK brand names or products

### What This Solves
✅ **Accuracy:** Comprehensive lists of unsafe vs safe foods
✅ **Consistency:** Single source of truth across the entire codebase
✅ **Maintainability:** Easy to update as you discover edge cases
✅ **Safety:** Reduces risk of dangerous allergen mistakes
✅ **Reusability:** Can be used in recipe generation, safety checks, shopping lists, etc.

---

## The Strategy: Incremental Rollout

### Phase 1: Proof of Concept (Week 1)
**Goal:** Validate the approach with one allergen

**Tasks:**
1. ✅ Research gluten thoroughly (30-60 mins)
2. ✅ Create `allergen-taxonomy.md` with gluten section only
3. ✅ Structure it properly (unsafe/safe/tricky cases + AI guidance)
4. ✅ Integrate into `prompts.ts`
5. ✅ Test with known edge cases
6. ✅ Refine based on results

**Deliverables:**
- `allergen-taxonomy.md` file with comprehensive gluten section
- Updated `prompts.ts` that imports and uses the taxonomy
- Test results documenting success/failures

**Success Criteria:**
- Gluten-containing foods correctly identified
- Gluten-free alternatives correctly identified
- False positives handled (buckwheat, oats)
- AI uses taxonomy + its own knowledge appropriately

---

### Phase 2: Add Second Allergen (Week 2)
**Goal:** Validate the structure works for multiple allergens

**Tasks:**
1. ✅ Add milk/dairy section using same structure
2. ✅ Test coconut milk edge case specifically
3. ✅ Verify reusability (can the taxonomy be used elsewhere?)
4. ✅ Document any structure improvements needed

**Deliverables:**
- Milk/dairy section in `allergen-taxonomy.md`
- Test results for dairy edge cases
- Documentation of any structural improvements

**Success Criteria:**
- Coconut milk no longer flagged for dairy allergies
- Lactose-free milk correctly flagged (still contains milk proteins)
- Plant-based alternatives correctly identified

---

### Phase 3: Expand to Top 5 UK Allergens (Weeks 3-5)
**Goal:** Cover the most common allergens in UK

**Add in order:**
1. Week 3: **Tree Nuts** (addresses coconut confusion)
2. Week 4: **Eggs**
3. Week 5: **Shellfish**

**Why this order:**
- Tree nuts → Common confusion with coconut, peanuts
- Eggs → Common in UK, important for baking alternatives
- Shellfish → Important safety concern, clear categorization

**For each allergen:**
- Research thoroughly (30-45 mins per allergen)
- Add to taxonomy using established structure
- Test with known edge cases
- Deploy and monitor for 1 week

---

### Phase 4: Complete UK FSA 14 Allergens (Weeks 6-10)
**Goal:** Comprehensive coverage of all regulated allergens

**Remaining allergens to add:**
1. Fish
2. Soy/Soya
3. Peanuts
4. Sesame
5. Celery
6. Mustard
7. Lupin
8. Sulphites
9. Molluscs

**Approach:**
- Add 1-2 allergens per week
- Prioritize by user demand (which allergies do your users have most?)
- Use consistent structure from previous phases

---

### Phase 5: Ongoing Maintenance (Forever)
**Goal:** Keep taxonomy current and comprehensive

**Activities:**
- Add new foods as you discover edge cases
- Update based on user feedback
- Add UK-specific products and brands
- Keep up with new products entering market
- Review and refine AI guidance instructions

---

## File Structure

### Directory Organization
```
recipeapp/
├── frontend/
│   └── src/
│       └── lib/
│           └── ai/
│               ├── prompts.ts (imports taxonomy)
│               └── allergen-taxonomy.md (the reference data)
```

### Alternative: More Granular Structure (Future)
If the taxonomy gets very large, consider splitting:
```
recipeapp/
├── frontend/
│   └── src/
│       └── lib/
│           └── ai/
│               ├── prompts.ts
│               └── allergen-taxonomy/
│                   ├── index.ts (exports combined taxonomy)
│                   ├── gluten.md
│                   ├── dairy.md
│                   ├── tree-nuts.md
│                   └── ...
```

**For now:** Single file is fine. Consider splitting if it exceeds 1000 lines.

---

## How to Integrate the Taxonomy

### Step 1: Import the Taxonomy

```typescript
// prompts.ts
import fs from 'fs';
import path from 'path';

// Read the taxonomy file (done once when module loads)
const allergenTaxonomyPath = path.join(process.cwd(), 'src/lib/ai/allergen-taxonomy.md');
const allergenTaxonomy = fs.readFileSync(allergenTaxonomyPath, 'utf-8');
```

### Step 2: Include in Prompt

```typescript
export function createRecipeGenerationPrompt(params: RecipeGenerationParams): string {
  // ... existing code ...

  let prompt = `BEFORE GENERATING - ANALYZE THE REQUEST:
  [Your analysis section]

  ---

  ${allergenTaxonomy}

  ---

  You are a professional UK-based chef assistant...
  `;

  // ... rest of prompt building ...

  return prompt;
}
```

### Step 3: Reuse Elsewhere (Future)

```typescript
// In recipe-safety-check.ts
import { allergenTaxonomy } from '@/lib/ai/allergen-taxonomy';

export function checkRecipeSafety(recipe, userAllergies) {
  const safetyPrompt = `
    ${allergenTaxonomy}

    Recipe ingredients: ${recipe.ingredients}
    User allergies: ${userAllergies}

    Check for conflicts.
  `;
  // Send to AI for safety check
}
```

---

## Research Guidelines

When researching each allergen:

### Sources to Use
✅ **UK Food Standards Agency (FSA)** - Official UK allergen guidance
✅ **NHS Allergy Information** - Medical perspective
✅ **Allergy UK** - Charity with comprehensive resources
✅ **UK Food Labels** - Real-world product information
✅ **Coeliac UK** (for gluten specifically)

### What to Document

**For each allergen:**

1. **Unsafe Foods**
   - Primary sources (the allergen itself)
   - Common products containing it
   - Hidden sources (where it appears unexpectedly)
   - UK-specific products and brands

2. **Safe Alternatives**
   - Substitutes that don't contain the allergen
   - Common false positives (safe despite confusing name)
   - UK-available alternatives

3. **Tricky Cases**
   - Foods with confusing names
   - Cross-contamination concerns
   - Processing considerations (e.g., oats and gluten)
   - Regional variations

4. **AI Guidance**
   - How to handle items not in the list
   - When to flag uncertainties
   - Safety principles to follow

---

## Quality Standards

### Each Allergen Section Must Include:

✅ **Minimum 15-20 unsafe food items** (comprehensive but not exhaustive)
✅ **Minimum 5-10 safe alternatives** (practical substitutes)
✅ **At least 3 tricky cases** with explanations
✅ **AI guidance instructions** on handling edge cases
✅ **UK-specific examples** where relevant

### Structure Consistency
All allergen sections should follow the same format:
1. Background/context (1-2 sentences)
2. ❌ UNSAFE - Contains [Allergen]
3. ✅ SAFE - Does Not Contain [Allergen]
4. ⚠️ TRICKY CASES
5. 🤖 AI GUIDANCE

---

## Testing Strategy

### For Each New Allergen Added:

**Test 1: Obvious Cases**
- Ingredient clearly contains allergen → Should be flagged
- Example: Wheat bread for gluten allergy

**Test 2: Hidden Sources**
- Ingredient has hidden allergen → Should be flagged
- Example: Soy sauce for gluten allergy

**Test 3: False Positives**
- Ingredient sounds like allergen but isn't → Should NOT be flagged
- Example: Coconut milk for dairy allergy

**Test 4: Items Not in Taxonomy**
- Obscure ingredient you deliberately didn't list → See if AI catches it
- Example: Leave out "seitan" from gluten list, test if AI flags it

**Test 5: Safe Alternatives**
- Use suggested alternative → Recipe should generate successfully
- Example: Tamari instead of soy sauce for gluten-free

### Test Documentation

Create a test log:
```markdown
## Gluten Taxonomy Tests (2025-10-23)

### Test 1: Wheat Bread
Input: Bread (wheat) + Gluten allergy
Result: ✅ Correctly flagged
Notes: -

### Test 2: Soy Sauce
Input: Soy sauce + Gluten allergy
Result: ✅ Correctly flagged
Notes: AI recognized wheat content

### Test 3: Buckwheat
Input: Buckwheat flour + Gluten allergy
Result: ✅ Correctly identified as safe
Notes: Taxonomy tricky cases section worked

### Test 4: Seitan (Not in List)
Input: Seitan + Gluten allergy
Result: ✅ AI caught it despite not in taxonomy
Notes: AI guidance instructions working well

### Test 5: Tamari Alternative
Input: Tamari + Gluten allergy
Result: ✅ Used as safe alternative to soy sauce
Notes: Perfect
```

---

## Maintenance Plan

### Weekly
- Review any user-reported allergen issues
- Add any new edge cases discovered
- Update test log

### Monthly
- Review AI guidance effectiveness
- Check if any sections need restructuring
- Add newly available UK products

### Quarterly
- Comprehensive review of all allergen sections
- Update based on FSA guidance changes
- Consider user feedback patterns

---

## Success Metrics

### Quantitative
- ❌ Reduction in allergen false positives
- ❌ Reduction in allergen false negatives (missed allergens)
- ✅ Increase in successful recipe generations
- ✅ Decrease in allergen-related user complaints

### Qualitative
- ✅ User confidence in allergen safety
- ✅ Developer confidence in system reliability
- ✅ Ease of adding new allergens
- ✅ Consistency across the platform

---

## Risks and Mitigation

### Risk 1: Incomplete Lists
**Risk:** Can't possibly list every food containing every allergen
**Mitigation:**
- AI guidance instructions tell AI to use own knowledge for unlisted items
- Emphasize safety over completeness
- Add items as discovered

### Risk 2: AI Ignores Taxonomy
**Risk:** AI might not follow the taxonomy properly
**Mitigation:**
- Test thoroughly before expanding
- Frame taxonomy as "primary reference" not "absolute rules"
- Monitor real-world usage

### Risk 3: Maintenance Burden
**Risk:** Keeping taxonomy updated becomes time-consuming
**Mitigation:**
- Start small (gluten only)
- Only add allergens as needed
- Use standardized structure for efficiency

### Risk 4: False Sense of Security
**Risk:** Users might trust system too much
**Mitigation:**
- Include disclaimers
- Encourage users to check labels
- Flag uncertainties clearly

---

## Resource Estimates

### Time Investment

**Initial Build:**
- Phase 1 (Gluten): 2 hours (research + implementation + testing)
- Phase 2 (Dairy): 1.5 hours
- Phase 3 (Tree Nuts, Eggs, Shellfish): 3-4 hours total
- Phase 4 (Remaining 9): 8-10 hours total

**Total Initial Investment:** ~15-18 hours over 10 weeks

**Ongoing Maintenance:** 30-60 mins per month

### Cost-Benefit Analysis

**Costs:**
- Developer time for research and implementation
- Testing time
- Ongoing maintenance

**Benefits:**
- Reduced allergen incidents (safety!)
- Increased user confidence
- Better AI output quality
- Reusable across platform features
- Reduced support burden

**Verdict:** High ROI, especially for safety-critical feature

---

## Next Steps

1. ✅ Review and approve this plan
2. ✅ Implement Phase 1 (gluten taxonomy)
3. ✅ Test thoroughly with gluten edge cases
4. ✅ If successful, proceed to Phase 2 (dairy)
5. ✅ Continue incremental rollout as outlined

---

## Questions to Consider

Before starting:
- Which allergens do your current users have most frequently?
- Are there UK-specific allergen concerns to prioritize?
- Do you have a staging environment for testing?
- Who will be responsible for ongoing maintenance?

---

**Status: Ready for Phase 1**
**Recommended Start Date: Immediately after "BEFORE GENERATING" section proves successful**
**Expected Completion: 10 weeks for full FSA 14 allergens**
**Confidence Level: High**
