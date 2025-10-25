# FISH ALLERGEN - ENHANCED KEYWORDS FOR ALLERGEN-DETECTOR.TS

---

## Current Implementation (allergen-detector.ts line 43)

```typescript
{ id: 'fish', label: 'Fish', description: 'All fish and fish products',
  keywords: ['fish', 'salmon', 'tuna', 'cod', 'haddock', 'anchovy'] }
```

**PROBLEM:** Only 6 keywords - misses many common fish types and hidden fish sources!

---

## RECOMMENDED ENHANCED KEYWORDS

Based on the comprehensive Fish Allergen Taxonomy, here are the recommended keywords for fish allergy detection:

### Comprehensive Keywords Array (Recommended)

```typescript
{
  id: 'fish',
  label: 'Fish',
  description: 'All fish and fish products',
  keywords: [
    // Generic
    'fish',

    // Common UK White Fish
    'cod',
    'haddock',
    'plaice',
    'sole',
    'coley',
    'pollock',
    'whiting',
    'monkfish',
    'sea bass',
    'sea bream',
    'halibut',
    'turbot',
    'basa',
    'tilapia',

    // Common UK Oily Fish
    'salmon',
    'mackerel',
    'tuna',
    'sardine',
    'pilchard',
    'anchovy',
    'anchovies',
    'herring',
    'trout',
    'kipper',
    'whitebait',

    // Other Fish
    'eel',
    'swordfish',
    'marlin',
    'catfish',

    // Fish Derivatives & Products
    'fish sauce',
    'fish oil',
    'cod liver oil',
    'fish stock',
    'fish broth',
    'fish paste',
    'fish cake',
    'fish finger',
    'fish pie',

    // Hidden Fish Sources (CRITICAL!)
    'worcestershire',
    'worcester sauce',
    'caesar dressing',
    'anchovy paste',
    'anchovy essence',
    "gentleman's relish",
    'patum peperium',

    // Asian Fish Products (CRITICAL!)
    'nam pla',
    'nuoc mam',
    'patis',
    'fish tofu',
    'fish ball',
    'kamaboko',

    // Processed Products
    'surimi',
    'taramasalata',
    'caviar',
    'fish roe',
    'cod roe',
    'rollmop',
    'kedgeree',

    // Japanese/Asian
    'katsuobushi',
    'bonito',
    'dashi',

    // Fish Gelatin
    'isinglass',
  ]
}
```

---

## PRIORITY KEYWORDS (Minimum Viable Enhancement)

If adding ALL keywords is too extensive, prioritize these HIGH-IMPACT additions:

```typescript
keywords: [
  // Original 6
  'fish', 'salmon', 'tuna', 'cod', 'haddock', 'anchovy',

  // CRITICAL ADDITIONS (Hidden Sources)
  'fish sauce',           // Thai/Vietnamese cuisine
  'worcestershire',       // Worcestershire sauce (contains anchovies)
  'caesar',               // Caesar dressing (contains anchovies)
  'anchovy paste',        // Hidden in many sauces
  'fish stock',           // Common in soups/stews
  'surimi',               // Imitation crab (made from fish!)

  // Common UK Fish
  'plaice',
  'sardine',
  'mackerel',
  'trout',
  'herring',

  // Asian Cuisine
  'nam pla',              // Thai fish sauce
  'nuoc mam',             // Vietnamese fish sauce
]
```

---

## KEYWORDS BY CATEGORY

### 1. FISH SPECIES (Common UK Types)

**White Fish:**
- cod, haddock, plaice, sole, coley, pollock, whiting, monkfish, sea bass, sea bream, halibut, turbot, basa, tilapia

**Oily Fish:**
- salmon, mackerel, tuna, sardine, pilchard, anchovy, herring, trout, kipper, whitebait

**Other:**
- eel, swordfish, marlin, catfish

### 2. FISH DERIVATIVES (High Detection Value)

**Critical to detect:**
- fish sauce, fish oil, cod liver oil, fish stock, fish broth, fish paste, fish extract

### 3. HIDDEN FISH SOURCES (HIGHEST PRIORITY!)

**Must detect these:**
- worcestershire (Worcestershire sauce - contains anchovies)
- worcester sauce
- caesar (Caesar dressing - contains anchovies)
- anchovy paste
- anchovy essence
- gentleman's relish
- patum peperium

### 4. ASIAN FISH PRODUCTS (Very Common in Recipes)

**Critical for Asian cuisine:**
- nam pla (Thai fish sauce)
- nuoc mam (Vietnamese fish sauce)
- patis (Filipino fish sauce)
- katsuobushi (bonito flakes)
- bonito
- dashi (Japanese stock - often contains fish)

### 5. PROCESSED FISH PRODUCTS (UK Specific)

**Common in UK recipes:**
- fish finger
- fish cake
- fish pie
- surimi (imitation crab - MADE FROM FISH)
- taramasalata (fish roe dip)
- kedgeree (rice dish with smoked fish)
- rollmop (pickled herring)

---

## IMPLEMENTATION RECOMMENDATION

### Option 1: Full Enhancement (Most Comprehensive)
Replace the current 6 keywords with the full 60+ keyword array above.

**Pros:**
- Catches all fish sources including hidden ones
- Best user safety
- Detects Asian cuisine fish sources
- Catches Worcestershire sauce, Caesar dressing automatically

**Cons:**
- Longer keyword array
- Minimal performance impact (keyword matching is fast)

### Option 2: Priority Enhancement (Balanced)
Add the 12 priority keywords to the existing 6 (total ~18 keywords).

**Pros:**
- Catches most critical hidden sources
- Smaller keyword array
- Covers Worcestershire, Caesar, fish sauce (biggest catches)

**Cons:**
- May miss some less common fish types
- May miss some regional Asian fish products

### Option 3: Targeted Enhancement (Minimal)
Add ONLY the hidden source keywords (worcestershire, caesar, fish sauce, surimi, anchovy paste).

**Pros:**
- Smallest addition
- Catches the most dangerous hidden sources

**Cons:**
- Misses many fish species
- Misses Asian cuisine terms

---

## RECOMMENDED APPROACH: Option 1 (Full Enhancement)

**Rationale:**
1. **User Safety:** Fish allergy can cause anaphylaxis - better to over-detect than under-detect
2. **Performance:** JavaScript array `.includes()` is very fast even with 60+ keywords
3. **Asian Cuisine:** Many modern recipes use Thai/Vietnamese ingredients (fish sauce is ubiquitous)
4. **Hidden Sources:** Worcestershire and Caesar are extremely common in UK recipes
5. **UK Compliance:** Natasha's Law requires comprehensive allergen detection

**File to Update:**
`/home/user/recipe-app/frontend/src/lib/allergen-detector.ts` (line 43)

---

## TESTING RECOMMENDATIONS

After implementing enhanced keywords, test with these ingredients:

**Should DETECT fish allergen:**
- ✅ "Worcestershire sauce" → Matches 'worcestershire'
- ✅ "Caesar salad dressing" → Matches 'caesar'
- ✅ "2 tbsp fish sauce (nam pla)" → Matches 'fish sauce' or 'nam pla'
- ✅ "Imitation crab sticks (surimi)" → Matches 'surimi'
- ✅ "Shepherd's pie with Worcestershire sauce" → Matches 'worcestershire'
- ✅ "Salmon fillet" → Matches 'salmon'
- ✅ "Anchovy paste" → Matches 'anchovy paste' or 'anchovy'
- ✅ "Fish stock cube" → Matches 'fish stock'

**Should NOT detect fish allergen:**
- ❌ "Prawns" (shellfish - different allergen)
- ❌ "Crab" (shellfish - different allergen)
- ❌ "Oysters" (mollusc - different allergen)
- ❌ "Henderson's Relish" (fish-free Worcestershire alternative)
- ❌ "Algae omega-3" (plant-based, no fish)
- ❌ "Vegan Caesar dressing" (should specify 'vegan' or 'fish-free')

---

## EDGE CASES TO CONSIDER

### Case 1: "Worcestershire Sauce" without the word "fish"
**Current keywords:** Would NOT detect (no 'worcestershire' keyword)
**Enhanced keywords:** Would detect ✅ (added 'worcestershire')

### Case 2: "Thai green curry paste" (may contain fish sauce)
**Challenge:** Paste itself doesn't say "fish sauce" in ingredient name
**Solution:** Taxonomy document guides AI to ask about Asian sauces, but keyword detection won't catch this
**Recommendation:** Add note in AI guidance section

### Case 3: "Imitation crab" or "Crab sticks"
**Current keywords:** Would NOT detect
**Enhanced keywords:** Add 'surimi' - but won't catch "imitation crab" without the word "surimi"
**Solution:** May need to add 'imitation crab' as keywords OR rely on AI knowledge + taxonomy

### Case 4: "Vegetarian Worcestershire sauce" (fish-free)
**Challenge:** Contains 'worcestershire' keyword but is actually safe
**Solution:** Taxonomy guides AI to check for "vegan" or "vegetarian" modifiers
**Recommendation:** Detection will flag it, AI can clarify with user

---

## IMPLEMENTATION CODE EXAMPLE

```typescript
// In allergen-detector.ts, replace line 43:

// OLD (6 keywords):
{ id: 'fish', label: 'Fish', description: 'All fish and fish products',
  keywords: ['fish', 'salmon', 'tuna', 'cod', 'haddock', 'anchovy'] },

// NEW (60+ keywords):
{
  id: 'fish',
  label: 'Fish',
  description: 'All fish and fish products (includes fish sauce, Worcestershire sauce, Caesar dressing)',
  keywords: [
    // Generic
    'fish',
    // Common UK Fish
    'cod', 'haddock', 'plaice', 'sole', 'pollock', 'whiting', 'monkfish', 'sea bass', 'sea bream',
    'halibut', 'turbot', 'basa', 'tilapia', 'salmon', 'mackerel', 'tuna', 'sardine', 'pilchard',
    'anchovy', 'anchovies', 'herring', 'trout', 'kipper', 'whitebait', 'eel', 'swordfish',
    // Fish Products
    'fish sauce', 'fish oil', 'cod liver oil', 'fish stock', 'fish broth', 'fish paste',
    'fish cake', 'fish finger', 'fish pie',
    // Hidden Sources (CRITICAL)
    'worcestershire', 'worcester sauce', 'caesar', 'anchovy paste', 'anchovy essence',
    // Asian
    'nam pla', 'nuoc mam', 'patis', 'katsuobushi', 'bonito', 'dashi',
    // Processed
    'surimi', 'taramasalata', 'caviar', 'fish roe', 'kedgeree', 'isinglass'
  ]
},
```

---

## SUMMARY

**Current Implementation:** 6 keywords (basic fish types only)
**Recommended Implementation:** 60+ keywords (comprehensive coverage)
**Highest Priority Additions:**
1. worcestershire (catches Worcestershire sauce - contains anchovies)
2. caesar (catches Caesar dressing - contains anchovies)
3. fish sauce (catches Thai/Vietnamese cuisine)
4. nam pla / nuoc mam (Asian fish sauce terms)
5. surimi (imitation crab - made from fish)

**Impact:** Dramatically improves fish allergy detection, especially for hidden sources that users may not realize contain fish.

---

**END OF KEYWORDS DOCUMENT**
