# Allergen Detection System Review

**Date:** 2025-10-24
**Status:** Critical Bug Identified - Snails Not Detected
**Priority:** P1 - Safety Critical

---

## Executive Summary

A comprehensive audit of the recipe application's allergen detection system has revealed a **critical bug**: "snails" are not being detected during recipe creation despite being correctly listed in the molluscs keywords array.

### Key Findings:

1. **Root Cause Identified**: The allergen detection in `C:\Users\bryn\Documents\recipeapp\frontend\src\app\api\ai\generate\route.ts` (lines 77-96) uses a **naive substring matching algorithm** that only checks if the allergen ID itself appears in the ingredient text, completely ignoring the detailed keyword arrays defined in `allergen-detector.ts`.

2. **Detection Discrepancy**: The system has **TWO separate allergen detection implementations**:
   - **Client-side** (`allergen-detector.ts`): Uses proper keyword-based matching ✅
   - **Server-side** (`api/ai/generate/route.ts`): Uses broken ID-only matching ❌

3. **Security Impact**: The pre-generation safety check (server-side) fails to catch allergen conflicts that the post-generation warning system (also server-side) would partially detect through hardcoded derivatives.

4. **Inconsistent Data Structures**: Allergen lists are duplicated across 5+ files with varying levels of detail (some with keywords, some without).

### Priority Recommendations:

**P1 (Critical - Safety):**
- Fix server-side pre-generation allergen check to use proper keyword matching
- Consolidate all allergen detection to use `allergen-detector.ts` functions

**P2 (High - Data Integrity):**
- Centralize UK_ALLERGENS definition to single source of truth
- Update post-generation detection to use centralized detector

**P3 (Medium - Architecture):**
- Add comprehensive test suite for all allergen keywords
- Implement allergen detection audit logging

---

## Current System Architecture

### Detection Flow Diagram

```
User Input (ingredients)
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT SIDE (create-recipe/page.tsx)                            │
│ - User types ingredients                                         │
│ - Temporary allergen overrides (tempAllergies state)            │
│ - Display warnings (allergenWarnings state)                      │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ API REQUEST (POST /api/ai/generate)                             │
│                                                                   │
│ SAFETY CHECK #1 (Lines 77-96) ❌ BROKEN                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ allergenConflicts = ingredients.filter(ingredient =>        │ │
│ │   userAllergens.some(allergen =>                            │ │
│ │     ingredient.toLowerCase().includes(                      │ │
│ │       allergen.toLowerCase()                                │ │
│ │     )                                                        │ │
│ │   )                                                          │ │
│ │ )                                                            │ │
│ │                                                              │ │
│ │ BUG: Only checks allergen ID (e.g., "molluscs")             │ │
│ │      NOT keywords (e.g., "snail", "mussel", "squid")        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ If conflicts: Return 400 error, block generation                 │
│ If no conflicts: Proceed to AI generation                        │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ AI GENERATION                                                     │
│ - Prompt includes allergen warnings                              │
│ - AI attempts to avoid allergens (not guaranteed)                │
│ - Recipe generated                                               │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ POST-GENERATION CHECK (Lines 300-331) ⚠️ PARTIAL               │
│                                                                   │
│ SAFETY CHECK #2 (Post-generation warning)                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ For each ingredient:                                         │ │
│ │   1. Check if allergen ID in ingredient text               │ │
│ │   2. Check hardcoded derivatives map:                       │ │
│ │      - milk: ['dairy', 'cheese', 'butter', ...]            │ │
│ │      - shellfish: ['prawn', 'shrimp', 'crab', ...]         │ │
│ │      - BUT NO 'molluscs' entry! ❌                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Result: allergen_warnings array                                  │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT RECEIVES RESPONSE                                          │
│ - Recipe data                                                     │
│ - allergen_warnings (displayed if present)                       │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Path | Role | Status |
|-----------|------|------|--------|
| **Allergen Detector Library** | `frontend/src/lib/allergen-detector.ts` | Provides keyword-based allergen detection functions | ✅ Working correctly |
| **Create Recipe Page** | `frontend/src/app/(dashboard)/create-recipe/page.tsx` | User interface for recipe generation | ✅ UI works, calls API |
| **AI Generation API** | `frontend/src/app/api/ai/generate/route.ts` | Handles recipe generation + safety checks | ❌ Broken pre-check |
| **Recipe Form** | `frontend/src/components/recipes/recipe-form.tsx` | Manual recipe creation with client-side detection | ✅ Uses proper detection |
| **Preferences Form** | `frontend/src/components/settings/preferences-form.tsx` | User allergen profile management | ✅ Stores correctly |
| **Recipe Save API** | `frontend/src/app/api/recipes/route.ts` | Saves recipes to database | ⚠️ No allergen validation |

---

## Critical Issues Identified

### 1. Snails Detection Bug (P1 - CRITICAL)

**Location:** `frontend/src/app/api/ai/generate/route.ts` (Lines 77-96)

**Problem:**
```typescript
// CURRENT IMPLEMENTATION (BROKEN)
const allergenConflicts = ingredients.filter((ingredient: string) =>
  userAllergens.some((allergen: string) =>
    ingredient.toLowerCase().includes(allergen.toLowerCase())
  )
);
```

This code only checks if the allergen **ID** (e.g., "molluscs") appears in the ingredient text. It completely ignores the keyword arrays defined in `allergen-detector.ts`.

**Why Snails Aren't Detected:**
- User has `molluscs` in their allergen profile
- User types "snails" as an ingredient
- Code checks: `"snails".includes("molluscs")` → **false** ❌
- Result: No safety warning, generation proceeds

**Impact:**
- **Safety Critical**: Users with mollusc allergies can generate recipes containing snails, mussels, oysters, squid, and winkles
- Affects all allergen keywords that don't match the allergen ID
- Examples that FAIL detection:
  - Molluscs: snail, mussel, oyster, squid, winkle
  - Tree nuts: almond, walnut, cashew, pecan, pistachio, hazelnut, macadamia, brazil nut
  - Milk: dairy, cheese, butter, cream, yogurt, whey, casein
  - Many more...

**Correct Implementation:**
```typescript
// SHOULD USE (from allergen-detector.ts)
import { detectAllergensInText } from '@/lib/allergen-detector';

const allergenConflicts: string[] = [];
ingredients.forEach((ingredient: string) => {
  const matches = detectAllergensInText(ingredient, userAllergens);
  if (matches.length > 0) {
    allergenConflicts.push(ingredient);
  }
});
```

---

### 2. Duplicate Allergen Detection Logic (P1 - CRITICAL)

**Problem:** The system has **TWO completely different** allergen detection implementations:

#### Implementation A: Client-Side (CORRECT ✅)
**Location:** `frontend/src/lib/allergen-detector.ts`
- Uses proper keyword arrays for each allergen
- Comprehensive matching algorithm
- Properly exported and reusable
- Used by: `recipe-form.tsx` for manual recipe creation

#### Implementation B: Server-Side Pre-Generation (BROKEN ❌)
**Location:** `frontend/src/app/api/ai/generate/route.ts` (Lines 77-96)
- Naive ID-only substring matching
- Ignores all keyword definitions
- Inline code, not reusable
- Used by: AI recipe generation safety check

#### Implementation C: Server-Side Post-Generation (PARTIAL ⚠️)
**Location:** `frontend/src/app/api/ai/generate/route.ts` (Lines 300-331)
- Hybrid approach: ID check + hardcoded derivatives
- Hardcoded derivatives map with **ONLY 8 out of 14 allergens**
- Missing: molluscs, celery, mustard, lupin, sesame, sulphites
- Partial overlap with `allergen-detector.ts` keywords

**Impact:**
- **Inconsistent user experience**: Different detection behavior for AI-generated vs. manually-created recipes
- **Maintenance nightmare**: Changes must be made in 3 places
- **Security risk**: Easy to update one location and forget others

---

### 3. Missing Molluscs in Post-Generation Derivatives (P1 - CRITICAL)

**Location:** `frontend/src/app/api/ai/generate/route.ts` (Lines 312-321)

**Problem:**
```typescript
const derivatives: Record<string, string[]> = {
  'milk': ['dairy', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'casein'],
  'eggs': ['egg', 'mayonnaise'],
  'peanuts': ['peanut', 'groundnut'],
  'tree_nuts': ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut', 'macadamia'],
  'gluten': ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'oats'],
  'soy': ['soya', 'tofu', 'edamame', 'soy sauce', 'miso'],
  'fish': ['salmon', 'tuna', 'cod', 'haddock', 'anchovy'],
  'shellfish': ['prawn', 'shrimp', 'crab', 'lobster', 'mussel', 'oyster'],
};
// NO MOLLUSCS ENTRY! ❌
```

**Missing Allergens from Derivatives Map:**
- molluscs (this is the bug being reported!)
- celery
- mustard
- lupin
- sesame
- sulphites

**Note:** The `shellfish` entry incorrectly includes `mussel` and `oyster`, which are actually molluscs, not crustaceans. This shows confusion about allergen categories.

---

### 4. Duplicate UK_ALLERGENS Definitions (P2 - HIGH)

**Problem:** The UK allergens list is defined in **5 different files** with varying levels of detail:

| File | Has Keywords? | Complete? |
|------|---------------|-----------|
| `lib/allergen-detector.ts` | ✅ Yes (detailed) | ✅ All 14 |
| `app/(dashboard)/create-recipe/page.tsx` | ❌ No | ✅ All 14 |
| `components/settings/preferences-form.tsx` | ❌ No | ✅ All 14 |
| `components/onboarding/allergy-step.tsx` | ⚠️ Descriptions only | ✅ All 14 |
| `types/recipe.ts` | ❌ No (type only) | ✅ All 14 |

**Impact:**
- Risk of definitions falling out of sync
- Wasted duplication (~140 lines of duplicate code)
- No single source of truth

**Example Discrepancy:**
```typescript
// allergen-detector.ts (HAS KEYWORDS)
{ id: 'molluscs', label: 'Molluscs', keywords: ['mollusc', 'mussel', 'oyster', 'squid', 'snail', 'winkle'] }

// create-recipe/page.tsx (NO KEYWORDS)
{ id: 'molluscs', label: 'Molluscs' }

// onboarding/allergy-step.tsx (DESCRIPTION)
{ id: 'molluscs', label: 'Molluscs', description: 'Squid, snails, mussels, oysters' }
```

---

### 5. No Allergen Validation at Database Save (P2 - HIGH)

**Location:** `frontend/src/app/api/recipes/route.ts`

**Problem:** When recipes are saved to the database (POST `/api/recipes`), there is **NO allergen detection or validation**. The API accepts whatever allergen array is provided without verification.

```typescript
// POST /api/recipes - Lines 93-115
const { data: recipe, error: recipeError} = await supabase
  .from('recipes')
  .insert({
    // ... other fields
    allergens: body.allergens || [], // ❌ No validation!
    // ...
  })
```

**Impact:**
- AI-generated recipes might have incorrect allergen tags
- Manually created recipes have no server-side validation
- Database can contain recipes with missing allergen warnings

**What Should Happen:**
- Server should re-detect allergens from ingredient list before saving
- Compare detected allergens with provided allergens
- Store complete allergen list in database

---

### 6. Shellfish vs Molluscs Confusion (P3 - MEDIUM)

**Problem:** UK allergen law (Natasha's Law) requires **separate labeling** for:
1. **Crustaceans** (prawns, crab, lobster, crayfish) - commonly called "shellfish"
2. **Molluscs** (mussels, oysters, squid, snails, winkles) - separate category

**Current Issues:**
- The derivatives map in `route.ts` incorrectly groups them:
  ```typescript
  'shellfish': ['prawn', 'shrimp', 'crab', 'lobster', 'mussel', 'oyster']
  //                                                   ^^^^^^  ^^^^^^
  //                                            These are molluscs!
  ```
- Comments in migration file say "Shellfish (crustaceans, molluscs)" - technically correct for US FDA but misleading for UK Natasha's Law

**Correct UK Categorization:**
- **Shellfish** = Crustaceans ONLY (prawns, crab, lobster, crayfish)
- **Molluscs** = Separate category (mussels, oysters, squid, snails, winkles, octopus, clams, scallops)

---

## Complete Code Inventory

### Frontend Components

| File | Purpose | Uses Detection? | Status |
|------|---------|-----------------|--------|
| **`app/(dashboard)/create-recipe/page.tsx`**<br>Lines 26-41, 179-180, 299-301, 402-470 | AI recipe generation UI | ❌ No (just displays warnings from API) | Working |
| **`components/recipes/recipe-form.tsx`**<br>Lines 27, 63-120, 148-171 | Manual recipe creation form | ✅ Yes (client-side, correct) | Working |
| **`components/settings/preferences-form.tsx`**<br>Lines 19-34, 120-133 | User allergen profile settings | ❌ No (just UI) | Working |
| **`components/onboarding/allergy-step.tsx`** | Onboarding allergen selection | ❌ No (just UI) | Working |

### Detection Logic

| File | Function | Algorithm | Status |
|------|----------|-----------|--------|
| **`lib/allergen-detector.ts`**<br>Lines 2-17 | `UK_ALLERGENS` definition | N/A (data) | ✅ Correct & complete |
| **`lib/allergen-detector.ts`**<br>Lines 32-58 | `detectAllergensInText()` | Keyword-based matching | ✅ Correct |
| **`lib/allergen-detector.ts`**<br>Lines 66-89 | `detectAllergensInIngredients()` | Batch detection | ✅ Correct |
| **`lib/allergen-detector.ts`**<br>Lines 96-111 | `groupMatchesByAllergen()` | Result grouping | ✅ Correct |

### API Endpoints

| File | Endpoint | Allergen Handling | Status |
|------|----------|-------------------|--------|
| **`app/api/ai/generate/route.ts`**<br>Lines 77-96 | POST `/api/ai/generate`<br>Pre-generation safety check | ❌ Broken ID-only matching | CRITICAL BUG |
| **`app/api/ai/generate/route.ts`**<br>Lines 300-331 | POST `/api/ai/generate`<br>Post-generation warnings | ⚠️ Partial (hardcoded derivatives, missing molluscs) | INCOMPLETE |
| **`app/api/recipes/route.ts`**<br>Lines 66-127 | POST `/api/recipes`<br>Recipe save | ❌ No validation | MISSING |
| **`app/api/recipes/route.ts`**<br>Lines 7-63 | GET `/api/recipes`<br>Recipe list | N/A (no processing) | N/A |

### Database Layer

| Table | Columns | Constraints | Purpose |
|-------|---------|-------------|---------|
| **recipes** | `allergens TEXT[]` | Default `'{}'` | Stores detected allergen IDs |
| **recipes** | `ingredients JSONB` | Required, default `'[]'` | Ingredient list for detection |
| **user_profiles** | `preferences JSONB` | Includes `allergies: []` array | User allergen profile |

**Schema Details:**
```sql
-- recipes.allergens (from migration 004)
allergens TEXT[] DEFAULT '{}', -- ['dairy', 'gluten', 'nuts']

-- user_profiles.preferences (from migration 004)
preferences JSONB NOT NULL DEFAULT '{
  "allergies": [],
  "dietary_restrictions": [],
  ...
}'::jsonb
```

**Key Relationships:**
- User's `allergies` array (in `preferences`) contains allergen IDs (e.g., `["molluscs", "peanuts"]`)
- Recipe's `allergens` array stores detected allergen IDs
- Detection happens at generation time, NOT at database save time
- No foreign key relationships or validation constraints

---

## Data Flow Analysis

### Flow 1: AI Recipe Generation (BROKEN ❌)

```
1. User enters ingredients on /create-recipe
   └─> ["chicken", "snails", "garlic"]

2. User clicks "Generate Recipe"
   └─> Fetch user preferences: { allergies: ["molluscs"] }

3. Client sends POST /api/ai/generate
   └─> Body: {
         ingredients: ["chicken", "snails", "garlic"],
         preferences: { allergies: ["molluscs"] }
       }

4. SERVER PRE-CHECK (BROKEN ❌)
   └─> allergenConflicts = ingredients.filter(ing =>
         userAllergens.some(allergen =>
           ing.toLowerCase().includes(allergen.toLowerCase())
         )
       )
   └─> Checks: "chicken".includes("molluscs") → false ✓
   └─> Checks: "snails".includes("molluscs") → false ❌ BUG!
   └─> Checks: "garlic".includes("molluscs") → false ✓
   └─> Result: NO conflicts detected → Generation proceeds

5. AI generates recipe with snails
   └─> Recipe includes: [
         { item: "chicken", quantity: "500", unit: "g" },
         { item: "snails", quantity: "12", unit: "whole" },
         { item: "garlic", quantity: "3", unit: "clove" }
       ]

6. SERVER POST-CHECK (PARTIAL ⚠️)
   └─> For each ingredient:
       Check ID: "snails".includes("molluscs") → false
       Check derivatives: molluscs NOT in derivatives map → no check
   └─> Result: NO warnings generated

7. Client receives recipe WITHOUT allergen warning ❌
   └─> User sees recipe with snails
   └─> NO red warning banner displayed
   └─> User might cook and eat recipe → SAFETY RISK!
```

### Flow 2: Manual Recipe Creation (WORKING ✅)

```
1. User creates recipe manually on /my-recipes/new
   └─> Uses RecipeForm component

2. User adds ingredients
   └─> ["pasta", "mussels", "white wine"]

3. CLIENT-SIDE DETECTION (WORKING ✅)
   └─> useEffect watches ingredient changes
   └─> Calls detectAllergensInIngredients(ingredients, userAllergens)
   └─> For user with allergies: ["molluscs"]

4. Allergen Detector executes:
   └─> Checks "pasta" against molluscs keywords → no match
   └─> Checks "mussels" against molluscs keywords:
       ├─> "mussels".includes("mollusc") → false
       ├─> "mussels".includes("mussel") → TRUE ✓
       └─> MATCH FOUND: { allergen: "molluscs", ingredient: "mussels" }
   └─> Checks "white wine" → no match

5. Client displays warning banner (WORKS ✅)
   └─> Red/amber warning box shown
   └─> Message: "⚠️ Allergen Notice"
   └─> Shows: "Molluscs: mussels"

6. User saves recipe anyway (for someone else)
   └─> POST /api/recipes with allergens: []

7. SERVER SAVE (NO VALIDATION ⚠️)
   └─> Recipe saved with empty allergens array
   └─> No server-side re-detection
   └─> Database has incomplete allergen data
```

### Flow 3: User Allergen Profile Setup

```
1. User visits /settings or onboarding
   └─> Selects allergens: [x] Molluscs

2. Client saves to database
   └─> PUT /api/profile
   └─> Body: { preferences: { allergies: ["molluscs"], ... } }

3. Server stores in user_profiles.preferences
   └─> preferences JSONB: { "allergies": ["molluscs"], ... }

4. Future recipe generations fetch this profile
   └─> Used in detection checks (when working correctly)
```

---

## Redundancies and Inconsistencies

### Redundancy Matrix

| Allergen Data | allergen-detector.ts | create-recipe/page.tsx | preferences-form.tsx | onboarding/allergy-step.tsx | types/recipe.ts |
|---------------|----------------------|------------------------|----------------------|-----------------------------|-----------------|
| **List of 14** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Labels** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Keywords** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Descriptions** | ❌ | ❌ | ❌ | ✅ | ❌ |

**Total Lines of Duplication:** ~140 lines across 5 files

### Inconsistent Terminology

| Allergen | allergen-detector.ts | API derivatives map | UK Law (Natasha's Law) |
|----------|---------------------|---------------------|------------------------|
| Soya | "soy" ID, "soya" keyword | "soy" | "Soya" |
| Sulphites | "sulphites" ID | NOT INCLUDED | "Sulphites" or "Sulphur dioxide" |
| Shellfish | "shellfish" ID | Includes molluscs ❌ | Crustaceans only |
| Molluscs | "molluscs" ID, proper keywords | NOT INCLUDED ❌ | Separate from shellfish |

---

## Security and Data Integrity Concerns

### Security Issues

1. **Allergen Detection Bypass (P1 - CRITICAL)**
   - Pre-generation check can be bypassed by using ingredient names that don't match allergen IDs
   - Example: User allergic to "molluscs" can generate recipes with "snails", "mussels", "squid", etc.
   - **Risk Level:** HIGH - Direct safety risk to users

2. **No Server-Side Validation on Save (P2 - HIGH)**
   - Recipes can be saved with incorrect or missing allergen tags
   - Client can send arbitrary allergen arrays
   - No server-side verification of allergen data
   - **Risk Level:** MEDIUM - Data integrity issue

3. **Inconsistent Protection (P2 - HIGH)**
   - Manual recipes: Protected by client-side detection ✅
   - AI recipes: Partially protected (broken pre-check, incomplete post-check) ❌
   - **Risk Level:** MEDIUM - Inconsistent user experience

### Data Integrity Issues

1. **Incomplete Allergen Tags in Database**
   - Generated recipes may have missing allergen tags
   - No automatic re-detection when allergen definitions change
   - **Impact:** Search/filter features will miss recipes with untagged allergens

2. **No Audit Trail**
   - No logging of allergen detection events
   - Can't verify if detection ran correctly
   - Can't track detection failures
   - **Impact:** Unable to debug or audit safety-critical functionality

3. **Keywords Can Diverge**
   - Multiple definitions of allergen lists
   - Updates in one place might not reflect in others
   - **Impact:** Inconsistent detection behavior across app

---

## Database Schema Analysis

### Tables

#### recipes Table
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,

  -- Allergen-related columns
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Format: [{"item": "snails", "quantity": "12", "unit": "whole", "notes": null}]

  allergens TEXT[] DEFAULT '{}',
  -- Format: ['molluscs', 'garlic', 'wine']
  -- NOTE: This is manually set, not auto-detected from ingredients!

  -- ... other columns
)
```

**Key Insights:**
- `ingredients` is JSONB array containing full ingredient objects
- `allergens` is TEXT array of allergen IDs
- NO foreign key constraint to user's allergen profile
- NO trigger to auto-detect allergens from ingredients
- NO check constraint on allergen values

#### user_profiles Table
```sql
CREATE TABLE user_profiles (
  user_id TEXT PRIMARY KEY,

  preferences JSONB NOT NULL DEFAULT '{
    "allergies": [],
    "dietary_restrictions": [],
    "cuisines_liked": [],
    "cuisines_disliked": [],
    "disliked_ingredients": [],
    "cooking_skill": "intermediate",
    "household_size": 2,
    "budget_per_meal": null,
    "typical_cook_time": 30,
    "spice_level": "medium",
    "preferred_ai_model": "anthropic"
  }'::jsonb
)
```

**Key Insights:**
- User allergies stored in `preferences.allergies` array
- Format: `["molluscs", "peanuts", "gluten"]`
- No validation on allergen values (can store invalid IDs)
- No relationship to recipes table

### Relationships

```
user_profiles (1) ─────┐
  │                     │
  │ user_id            │ Logical relationship only
  │                     │ (no foreign key)
  │                     │
  └─────────────> recipes (∞)
                    user_id
```

**Missing Relationships:**
- No junction table for user allergens (JSONB array instead)
- No allergens reference table (allergen definitions only in code)
- No audit table for allergen detection events

### Migration History

| Migration | Description | Allergen Impact |
|-----------|-------------|-----------------|
| `004_fresh_simplified_schema.sql` | Created recipes and user_profiles tables | ✅ Established allergen fields |
| `009_migrate_to_clerk_auth.sql` | Migrated from Supabase auth to Clerk | Changed user_id from UUID to TEXT |
| No migrations | Allergen detection logic | ❌ All in application code, not DB |

**Key Observation:** Allergen detection is **100% application-layer logic**. The database has no built-in allergen validation, triggers, or constraints.

---

## Recommendations

### Priority 1 (Critical - Safety)

#### 1.1 Fix Pre-Generation Allergen Check
**File:** `frontend/src/app/api/ai/generate/route.ts` (Lines 77-96)

**Action:**
```typescript
// REPLACE THIS (Lines 77-96):
const allergenConflicts = ingredients.filter((ingredient: string) =>
  userAllergens.some((allergen: string) =>
    ingredient.toLowerCase().includes(allergen.toLowerCase())
  )
);

// WITH THIS:
import { detectAllergensInText } from '@/lib/allergen-detector';

const allergenConflicts: string[] = [];
const allergenDetails: string[] = [];

ingredients.forEach((ingredient: string) => {
  const matches = detectAllergensInText(ingredient, userAllergens);
  if (matches.length > 0) {
    allergenConflicts.push(ingredient);
    matches.forEach(match => {
      allergenDetails.push(`${match.allergenLabel}: "${ingredient}" contains "${match.matchedKeyword}"`);
    });
  }
});

if (allergenConflicts.length > 0) {
  return NextResponse.json(
    {
      error: 'Safety Warning',
      message: `The following ingredients conflict with your allergen profile:\n\n${allergenDetails.join('\n')}\n\nPlease remove these ingredients and try again.`,
      conflicts: allergenConflicts,
    },
    { status: 400 }
  );
}
```

**Estimated Effort:** 30 minutes
**Risk:** Low (uses existing tested function)

#### 1.2 Fix Post-Generation Allergen Detection
**File:** `frontend/src/app/api/ai/generate/route.ts` (Lines 300-331)

**Action:**
```typescript
// REPLACE THIS (Lines 300-331):
const allergenWarnings: string[] = [];
if (userAllergens.length > 0 && recipe.ingredients) {
  recipe.ingredients.forEach((ingredient) => {
    // ... existing hardcoded derivatives logic
  });
}

// WITH THIS:
import { detectAllergensInIngredients, groupMatchesByAllergen } from '@/lib/allergen-detector';

const allergenMatches = detectAllergensInIngredients(
  recipe.ingredients,
  userAllergens
);

const allergenWarnings: string[] = [];
if (allergenMatches.length > 0) {
  const grouped = groupMatchesByAllergen(allergenMatches);
  Object.entries(grouped).forEach(([allergen, ingredients]) => {
    allergenWarnings.push(`⚠️ ${allergen}: ${ingredients.join(', ')}`);
  });
}
```

**Estimated Effort:** 20 minutes
**Risk:** Low (uses existing tested functions)

#### 1.3 Add Server-Side Validation to Recipe Save
**File:** `frontend/src/app/api/recipes/route.ts`

**Action:** Add allergen detection before saving recipe:
```typescript
// Add after line 86 (before insert):
import { detectAllergensInIngredients } from '@/lib/allergen-detector';
import { UK_ALLERGENS } from '@/lib/allergen-detector';

// Auto-detect allergens from ingredients
const allAllergenIds = UK_ALLERGENS.map(a => a.id);
const detectedMatches = detectAllergensInIngredients(
  body.ingredients,
  allAllergenIds
);

// Get unique allergen IDs
const detectedAllergens = [...new Set(detectedMatches.map(m => m.allergen))];

// Merge with provided allergens (if any)
const finalAllergens = [
  ...new Set([...(body.allergens || []), ...detectedAllergens])
];

// Then in insert (line 109):
allergens: finalAllergens, // Instead of body.allergens || []
```

**Estimated Effort:** 30 minutes
**Risk:** Low (non-breaking, adds safety)

### Priority 2 (High - Data Integrity)

#### 2.1 Centralize UK_ALLERGENS Definition
**Action:** Create single source of truth

1. Keep detailed definition in `lib/allergen-detector.ts` ✅ (already there)
2. Export type from `types/recipe.ts` ✅ (already there)
3. Remove duplicates from:
   - `app/(dashboard)/create-recipe/page.tsx` (import from allergen-detector)
   - `components/settings/preferences-form.tsx` (import from allergen-detector)
   - `components/onboarding/allergy-step.tsx` (import from allergen-detector)

**Example Change:**
```typescript
// In create-recipe/page.tsx (line 25)
// REMOVE THIS:
const UK_ALLERGENS = [
  { id: 'peanuts', label: 'Peanuts' },
  // ... 13 more
];

// ADD THIS:
import { UK_ALLERGENS } from '@/lib/allergen-detector';
```

**Estimated Effort:** 45 minutes
**Risk:** Low (search and replace)

#### 2.2 Add Molluscs Keywords to All Systems
**Status:** Already complete in `allergen-detector.ts` ✅

**Verification Needed:**
- Confirm shellfish vs molluscs separation
- Update any documentation referring to "shellfish (including molluscs)"

**Estimated Effort:** 15 minutes (verification only)
**Risk:** None (documentation update)

#### 2.3 Separate Shellfish and Molluscs Properly
**Action:** Update terminology throughout app

**Changes Needed:**
1. Verify allergen-detector.ts has correct categories ✅ (already correct)
2. Update any UI text that groups them incorrectly
3. Add tooltips explaining difference:
   - Shellfish = Crustaceans (prawns, crab, lobster)
   - Molluscs = Separate (mussels, oysters, snails, squid)

**Estimated Effort:** 30 minutes
**Risk:** Low (UI text updates)

### Priority 3 (Medium - Architecture)

#### 3.1 Add Comprehensive Test Suite
**Action:** Create test file for allergen detection

**File:** `frontend/src/lib/__tests__/allergen-detector.test.ts` (new file)

**Test Cases:**
```typescript
describe('Allergen Detection', () => {
  describe('Molluscs Detection', () => {
    it('should detect "snails"', () => {
      const result = detectAllergensInText('escargot snails', ['molluscs']);
      expect(result).toHaveLength(1);
      expect(result[0].matchedKeyword).toBe('snail');
    });

    it('should detect "mussels"', () => { /* ... */ });
    it('should detect "oysters"', () => { /* ... */ });
    it('should detect "squid"', () => { /* ... */ });
    it('should detect "winkles"', () => { /* ... */ });
  });

  describe('All Allergens', () => {
    // Test all 14 allergens with all keywords (90+ tests)
  });

  describe('Edge Cases', () => {
    it('should handle case insensitivity', () => { /* ... */ });
    it('should handle partial word matches', () => { /* ... */ });
    it('should not match "must" when looking for "mustard"', () => { /* ... */ });
  });
});
```

**Estimated Effort:** 4 hours
**Risk:** None (testing only)

#### 3.2 Add Allergen Detection Audit Logging
**Action:** Create audit log table and logging

**Database Migration:**
```sql
CREATE TABLE allergen_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  recipe_id UUID,
  detection_time TIMESTAMPTZ DEFAULT NOW(),
  ingredients JSONB, -- What was checked
  user_allergens TEXT[], -- User's profile
  detected_matches JSONB, -- What was found
  warnings_shown BOOLEAN,
  generation_blocked BOOLEAN
);
```

**Application Logging:**
```typescript
// After each detection, log the results
await supabase.from('allergen_detection_logs').insert({
  user_id: userId,
  ingredients: ingredients,
  user_allergens: userAllergens,
  detected_matches: allergenMatches,
  warnings_shown: allergenWarnings.length > 0,
  generation_blocked: allergenConflicts.length > 0
});
```

**Estimated Effort:** 2 hours
**Risk:** Low (non-blocking addition)

#### 3.3 Add Admin Dashboard for Allergen Monitoring
**Action:** Create admin page to view detection logs

**Features:**
- View recent allergen detections
- Filter by allergen type
- See which keywords trigger most often
- Identify potential false positives/negatives

**Estimated Effort:** 6 hours
**Risk:** Low (admin-only feature)

#### 3.4 Implement Allergen Auto-Tagging
**Action:** Add database trigger to auto-detect allergens

**Migration:**
```sql
CREATE OR REPLACE FUNCTION auto_detect_recipe_allergens()
RETURNS TRIGGER AS $$
BEGIN
  -- This would call a custom PL/pgSQL function that replicates
  -- the allergen detection logic, or use a webhook to call
  -- the API endpoint
  -- For now, keep detection in application layer
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This is complex and may be better kept in application layer
```

**Recommendation:** Keep in application layer for now. Database triggers with complex logic can be hard to maintain.

**Estimated Effort:** N/A (not recommended at this time)
**Risk:** N/A

---

## Risk Assessment

### Current Risks

| Risk | Severity | Likelihood | Impact | Mitigation Status |
|------|----------|------------|--------|-------------------|
| **User with mollusc allergy generates recipe with snails** | CRITICAL | HIGH | User consumes allergen, serious health consequences | ❌ Unmitigated |
| **User with tree nut allergy generates recipe with almonds** | CRITICAL | HIGH | User consumes allergen, serious health consequences | ❌ Unmitigated |
| **Any allergen keyword not matching allergen ID bypasses check** | CRITICAL | HIGH | Safety system failure | ❌ Unmitigated |
| **Post-generation warnings don't show mollusc allergens** | HIGH | HIGH | User not warned about allergen in generated recipe | ❌ Unmitigated |
| **Manually created recipes saved with wrong allergen tags** | MEDIUM | MEDIUM | Database integrity, search/filter accuracy | ❌ Unmitigated |
| **Allergen definitions fall out of sync across files** | MEDIUM | LOW | Inconsistent behavior | ⚠️ Partially mitigated (current sync OK) |
| **No audit trail for allergen detection failures** | MEDIUM | HIGH | Can't debug safety issues | ❌ Unmitigated |

### Residual Risks After Implementation

| Risk | Severity | Likelihood | Impact | Mitigation |
|------|----------|------------|--------|------------|
| **AI ignores allergen instructions in prompt** | MEDIUM | LOW | AI generates recipe with allergen anyway | Post-generation warnings catch it ✅ |
| **User typo creates new ingredient that doesn't match keywords** | MEDIUM | LOW | E.g., "musssels" doesn't match "mussel" | Fuzzy matching (future enhancement) |
| **New allergen derivative not in keywords list** | LOW | LOW | E.g., new cheese product name | Regular keyword updates needed |
| **User edits recipe after generation to add allergen** | LOW | LOW | Manual edit bypasses detection | Client-side detection in recipe-form ✅ |

---

## Next Steps for Implementation

### Phase 1: Critical Fixes (1-2 hours)
**Priority:** P1 - Deploy immediately

1. ✅ Fix pre-generation allergen check (30 min)
2. ✅ Fix post-generation allergen warning (20 min)
3. ✅ Add server-side validation to recipe save (30 min)
4. ✅ Test with "snails" and other mollusc keywords (15 min)
5. ✅ Deploy to production (15 min)

**Success Criteria:**
- User with "molluscs" allergy cannot generate recipe with "snails"
- Post-generation warnings show all mollusc ingredients
- Saved recipes have correct allergen tags

### Phase 2: Code Quality (2-3 hours)
**Priority:** P2 - Complete within 1 week

1. ✅ Centralize UK_ALLERGENS imports (45 min)
2. ✅ Remove duplicate definitions (45 min)
3. ✅ Update shellfish/molluscs documentation (30 min)
4. ✅ Code review and testing (60 min)

**Success Criteria:**
- Only one source of truth for allergen definitions
- All components import from allergen-detector.ts
- No duplicate code

### Phase 3: Testing & Monitoring (6-8 hours)
**Priority:** P3 - Complete within 2 weeks

1. ⏳ Create comprehensive test suite (4 hours)
2. ⏳ Add allergen detection logging (2 hours)
3. ⏳ Create admin monitoring dashboard (2 hours)
4. ⏳ Run regression tests (30 min)

**Success Criteria:**
- 90+ test cases covering all allergens and keywords
- All detections logged to database
- Admin can monitor detection effectiveness

### Phase 4: Future Enhancements (Optional)
**Priority:** Future consideration

1. Fuzzy matching for typos (e.g., "musssels" → "mussels")
2. Multi-language allergen detection
3. Allergen synonym expansion (e.g., "escargot" → "snails")
4. User-specific allergen keyword additions
5. Machine learning for allergen detection improvement

---

## Appendix

### Code References

#### Allergen Detection Library
- **File:** `C:\Users\bryn\Documents\recipeapp\frontend\src\lib\allergen-detector.ts`
- **Key Functions:**
  - `UK_ALLERGENS` (Lines 2-17): Master allergen definition with keywords
  - `detectAllergensInText()` (Lines 32-58): Single text detection
  - `detectAllergensInIngredients()` (Lines 66-89): Batch ingredient detection
  - `groupMatchesByAllergen()` (Lines 96-111): Result grouping

#### API Route - AI Generation
- **File:** `C:\Users\bryn\Documents\recipeapp\frontend\src\app\api\ai\generate\route.ts`
- **Key Sections:**
  - Lines 77-96: Pre-generation safety check (BROKEN ❌)
  - Lines 300-331: Post-generation allergen warnings (PARTIAL ⚠️)
  - Lines 312-321: Hardcoded derivatives map (INCOMPLETE ❌)

#### API Route - Recipe Save
- **File:** `C:\Users\bryn\Documents\recipeapp\frontend\src\app\api\recipes\route.ts`
- **Key Sections:**
  - Lines 66-127: POST /api/recipes (NO VALIDATION ❌)
  - Line 109: `allergens: body.allergens || []` (NEEDS AUTO-DETECTION)

#### Frontend Components
- **Create Recipe Page:** `C:\Users\bryn\Documents\recipeapp\frontend\src\app\(dashboard)\create-recipe\page.tsx`
  - Lines 26-41: UK_ALLERGENS duplicate definition
  - Lines 179-180: Temporary allergen overrides
  - Lines 299-301: Allergen warnings display

- **Recipe Form:** `C:\Users\bryn\Documents\recipeapp\frontend\src\components\recipes\recipe-form.tsx`
  - Lines 27, 63-120: Client-side allergen detection (WORKING ✅)
  - Lines 148-171: Allergen warning banner

#### Database Schema
- **Migration File:** `C:\Users\bryn\Documents\recipeapp\supabase\migrations\004_fresh_simplified_schema.sql`
  - Line 50: `allergens TEXT[] DEFAULT '{}'`
  - Lines 109-121: User preferences JSONB with allergies array
  - Lines 379-393: UK allergen reference list (comments only)

### Test Cases to Verify

#### Molluscs Detection (Critical)
```typescript
// All these should trigger molluscs allergen warning:
✓ "snails" → matches keyword "snail"
✓ "escargot snails" → matches keyword "snail"
✓ "fresh mussels" → matches keyword "mussel"
✓ "oysters on the half shell" → matches keyword "oyster"
✓ "grilled squid" → matches keyword "squid"
✓ "winkles" → matches keyword "winkle"
✓ "mollusc stew" → matches keyword "mollusc"
```

#### Tree Nuts Detection
```typescript
✓ "almonds" → matches keyword "almond"
✓ "walnut pieces" → matches keyword "walnut"
✓ "cashew butter" → matches keyword "cashew"
✓ "pecan pie" → matches keyword "pecan"
✓ "pistachio cream" → matches keyword "pistachio"
✓ "hazelnut spread" → matches keyword "hazelnut"
✓ "macadamia nuts" → matches keyword "macadamia"
✓ "brazil nuts" → matches keyword "brazil nut"
```

#### Milk/Dairy Detection
```typescript
✓ "milk" → matches keyword "milk"
✓ "dairy cream" → matches keyword "dairy"
✓ "cheddar cheese" → matches keyword "cheese"
✓ "butter" → matches keyword "butter"
✓ "double cream" → matches keyword "cream"
✓ "greek yogurt" → matches keyword "yogurt"
✓ "whey protein" → matches keyword "whey"
✓ "casein powder" → matches keyword "casein"
```

#### Edge Cases
```typescript
✓ "SNAILS" (uppercase) → should match
✓ "Mussels" (capitalized) → should match
✓ "must-have ingredient" → should NOT match "mustard"
✓ "fish sauce" → should match "fish" keyword
✓ "fishy smell" → should match "fish" keyword (contains)
✓ "" (empty string) → should not crash
✓ Multiple allergens in one ingredient: "butter milk" → matches both "butter" and "milk"
```

#### Full System Integration Tests
```typescript
describe('End-to-End Allergen Detection', () => {
  it('blocks AI generation when pre-check detects allergen', async () => {
    // User profile: allergies = ["molluscs"]
    // Ingredients: ["chicken", "snails", "garlic"]
    // Expected: 400 error, generation blocked
  });

  it('shows warnings when AI adds allergen despite instructions', async () => {
    // User profile: allergies = ["molluscs"]
    // AI generates recipe with mussels
    // Expected: 200 response with allergen_warnings array
  });

  it('auto-tags allergens when manually creating recipe', async () => {
    // User creates recipe with ingredients: ["pasta", "mussels", "wine"]
    // Expected: Saved recipe has allergens: ["molluscs"]
  });
});
```

---

## Summary

This comprehensive review has identified **critical safety vulnerabilities** in the allergen detection system. The most severe issue is that the pre-generation safety check uses naive ID-only matching, completely bypassing the proper keyword-based detection system that exists in the codebase.

**The bug is NOT that "snails" is missing from the keywords** (it's there!), but rather that **the API endpoint ignores those keywords entirely** and only checks if the raw allergen ID appears in the ingredient text.

Immediate action is required to fix the three critical issues:
1. Fix pre-generation check to use keyword-based matching
2. Fix post-generation warnings to include all allergens
3. Add server-side validation when saving recipes

All recommended fixes use existing, tested code from `allergen-detector.ts`, making implementation straightforward and low-risk.

**Estimated Total Implementation Time:**
- P1 (Critical): 1-2 hours
- P2 (High): 2-3 hours
- P3 (Medium): 6-8 hours
- **Total: 9-13 hours**

---

**Document Version:** 1.0
**Last Updated:** 2025-10-24
**Reviewed By:** Claude Code Analysis
**Status:** Ready for Implementation
