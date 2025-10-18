# Focused MVP Product Strategy 2025
## Building a Laser-Focused UK Recipe Platform That Excels at Core Features

**Date:** October 2025
**Project:** Recipe App MVP
**Market:** United Kingdom
**Philosophy:** Super useful, super simple - Excellence over breadth

---

## Executive Summary

### The Vision

Build a UK-focused recipe platform that does **4 core features brilliantly** instead of 40 features poorly. Target users who are overwhelmed by feature-bloated competitors and want a simple, intelligent assistant that helps them answer: "What's for dinner?"

### The Opportunity

**Market Validation:**
- UK AI recipe market growing from $972M (2024) to $11.5B by 2034
- 75.9% of UK consumers comfortable with AI-recommended recipes (higher than US)
- Current platforms suffer from:
  - Feature bloat (200+ options in Mealime)
  - Poor retention (3.93% 30-day retention industry average)
  - Complexity overload (users want simplicity)
  - American-centric (wrong measurements, wrong ingredients)

**Competitive Gaps:**
- Only 3 of 15 platforms have UK supermarket integration
- No platform focuses on simplicity + quality over breadth
- AI recipe quality is industry-wide problem (safety concerns)
- Budget transparency missing (critical during cost-of-living crisis)

### Core 4 Features (Validated by Research)

1. **AI Recipe Generation from Available Ingredients** (69.3% user demand)
2. **Personalized Meal Planning** (58.5% user demand)
3. **Automated Shopping Lists** (58.9% user demand)
4. **Dietary Customization & Safety** (Universal requirement, safety-critical)

**Plus Essential Support:**
- Recipe scaling for different household sizes
- Simple recipe collection/organization
- UK-specific localization (measurements, ingredients, terminology)

### The Product Philosophy

**"Innovation is saying no to a thousand things" - Steve Jobs**

**What We Build:**
- ✅ 4 core features done excellently
- ✅ Simple, fast, obvious how to use
- ✅ Mobile-first (5-minute sessions)
- ✅ Time to first value < 60 seconds
- ✅ UK-first (metric, British ingredients, local context)

**What We DON'T Build (Explicit Exclusions):**
- ❌ Social features (can't compete with Samsung Food's 4.5M members)
- ❌ Video recipes (YouTube exists)
- ❌ Recipe blogging platform (not our problem to solve)
- ❌ Nutrition database (MyFitnessPal exists)
- ❌ Calorie tracking (scope creep)
- ❌ Complex pantry inventory (users don't maintain it)
- ❌ Family member profiles (serves <15%, massive complexity)

### Success Metrics

**Launch Targets (Month 3):**
- 30-day retention > 8% (vs 3.93% industry average)
- 60% of users save at least one recipe
- 40% create at least one meal plan
- Time to first recipe search < 60 seconds
- Zero food safety incidents (allergen violations)

**Business Metrics:**
- Development time: 16 weeks (vs 35 weeks with feature bloat)
- Operating cost: ~$80/month for 1,000 users
- Competitive advantage: 4.5 months faster to market

### Technical Approach

**AI Strategy:**
- Anthropic Claude Sonnet 4.5 (native memory tool for personalization)
- OpenAI GPT-4.1 (already integrated, keep as option)
- Prompt engineering over model fine-tuning (simpler, cheaper)
- Multi-layer safety validation (critical for food safety)

**Data Strategy:**
- Open Food Facts (FREE, 165K UK products, allergen data)
- USDA FoodData Central (FREE, generic ingredient nutrition)
- Internal curated overrides (quality control)
- PostgreSQL with JSONB (flexible, GDPR-compliant)

**UK Localization:**
- Metric measurements only (grams, ml, Celsius)
- British ingredient names (courgette, aubergine, rocket)
- UK supermarket brands (Tesco, Sainsbury's)
- Seasonal availability awareness
- GDPR compliance built-in

---

## 1. Core Features Deep-Dive

### Feature 1: AI Recipe Generation from Available Ingredients

**What Users Actually Want:**
"I have random ingredients in my fridge and don't know what to make for dinner"

**Two Primary Use Cases:**
1. **Waste Reduction (72% of users):** Use what's already at home before it expires
2. **Shopping Inspiration (28%):** Plan what to buy for specific recipes

**The Real Problem:**
- Decision fatigue ("What's for dinner?")
- Food waste guilt
- Time pressure (need quick solutions)
- Avoiding grocery store trips

#### Implementation: Simple & Effective

**Phase 1 MVP (Week 1-2):**

```
UI Flow:
┌────────────────────────────────────┐
│  "What ingredients do you have?"   │
│                                     │
│  [🎤 Say It] [⌨ Type It] [📋 List]│
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  🥬 Tomatoes                    [×]│
│  🧅 Onions                      [×]│
│  🧄 Garlic                      [×]│
│  🍗 Chicken breast              [×]│
│                                     │
│  [+ Add more ingredients]           │
│                                     │
│  Optional filters (collapsed):      │
│  ▼ How much time? Skill level?     │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  You can make 23 recipes! 🎉       │
│                                     │
│  [Ready to Cook] [Almost There]    │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 📷 Chicken Pasta Bake        │  │
│  │ ⭐⭐⭐⭐⭐ 4.8 (342)           │  │
│  │ 3/4 ingredients ● 30 min     │  │
│  │ Missing: Pasta (1 item)      │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**Key Design Decisions:**
- **Voice-first on mobile** - Biggest UX win, lowest friction
- **Visual success indicators** - "You can make 23 recipes!"
- **"Ready to Cook" vs "Almost There"** - Clear distinction
- **Default to simplicity** - Filters collapsed by default
- **UK ingredient database** - Correct terminology from day one

**AI Prompt Engineering:**
```typescript
const prompt = `You are a UK recipe assistant helping a user with these ingredients:
${ingredients.join(', ')}

Generate 3 recipes that:
1. Use MOST or ALL of these ingredients
2. Require minimal additional shopping
3. Use UK measurements (grams, ml, Celsius)
4. Use British ingredient names (courgette not zucchini)
5. Are appropriate for ${userSkill} skill level
6. Take approximately ${userTime} minutes

For each recipe provide:
- Name and cuisine type
- Full ingredient list with quantities (metric)
- Step-by-step instructions
- Prep/cook time breakdown
- Why this recipe works with their available ingredients`;
```

**What to Avoid:**
- ❌ Requiring exact quantities (users eyeball ingredients)
- ❌ Overwhelming with 200+ ingredient checkboxes
- ❌ Multi-step wizard before showing results
- ❌ Forcing account creation to test
- ❌ American ingredient names

---

### Feature 2: Personalized Meal Planning

**What "Personalized" Means to Users:**
- "It fits my real life" (schedule, family size, skill level)
- "It excludes what I can't eat" (allergies, restrictions)
- "It adapts when plans change" (easy to swap meals)

**NOT what users want:**
- Complex preference profiles with 200+ options
- Rigid plans that can't be adjusted
- Meal plans requiring Chef-level execution

#### Implementation: 5-Minute Setup, Lifetime Value

**Onboarding Wizard (90 seconds max):**

```
Screen 1: "What can't you eat?" (15 sec)
┌─────────────────────────────────┐
│ 🚨 Critical Restrictions        │
│                                  │
│ Select any allergies:            │
│ [#Nuts] [#Shellfish] [#Dairy]   │
│ [#Eggs] [#Gluten] [#Soy]        │
│                                  │
│ Diet type:                       │
│ [○ Vegan] [○ Vegetarian]        │
│ [○ Pescatarian] [○ No limits]   │
└─────────────────────────────────┘

Screen 2: "Tell us about your schedule" (20 sec)
┌─────────────────────────────────┐
│ ⏱ Time Available                │
│                                  │
│ Weeknights: [────●──] 30 min    │
│ Weekends:   [──────●] 60 min    │
│                                  │
│ Meal prep?                       │
│ [Yes - batch cooking]            │
│ [No - cook fresh daily]          │
└─────────────────────────────────┘

Screen 3: "Who's eating?" (15 sec)
┌─────────────────────────────────┐
│ 👨‍👩‍👧 Household                    │
│                                  │
│ Cooking for: [2 ▼] people       │
│ Kids? [Yes ▼] Ages: [6-12]      │
└─────────────────────────────────┘

Screen 4: "Budget? (optional)" (10 sec)
┌─────────────────────────────────┐
│ 💰 Budget                        │
│                                  │
│ Weekly food budget:              │
│ [○ Tight (<£30)]                │
│ [○ Moderate (£30-60)]           │
│ [○ Flexible (£60+)]             │
│ [○ Skip this step]              │
└─────────────────────────────────┘

Screen 5: "All set!" (30 sec)
┌─────────────────────────────────┐
│ Generating your first meal plan │
│ [████████████        ] 80%       │
│                                  │
│ ✓ Found 42 vegan recipes         │
│ ✓ Matched to your schedule       │
│ ✓ Shopping list ready             │
└─────────────────────────────────┘
```

**Meal Planner UI:**

```
┌──────────────────────────────────────────────┐
│  This Week: Mon 7 Oct - Sun 13 Oct   [< >]  │
├──────────────────────────────────────────────┤
│         Mon    Tue    Wed    Thu    Fri      │
├──────────────────────────────────────────────┤
│ 🍳      ────   Eggs   ────   ────   Toast   │
│ Break                 Beans                   │
│ fast                                          │
├──────────────────────────────────────────────┤
│ 🥗      Salad  ────   Soup   ────   ────    │
│ Lunch   (left                                 │
│         over)                                 │
├──────────────────────────────────────────────┤
│ 🍽      Pasta  Curry  Stir   Pizza  Roast   │
│ Dinner  Bake         Fry                      │
│         30min  45min  20min  25min  90min     │
└──────────────────────────────────────────────┘

[+ Add Recipe] [Generate Shopping List]
```

**Smart Features:**
- **Drag-and-drop** meal swapping
- **Left click** to view recipe
- **Right click** to remove/swap
- **Auto-scaling** for household size
- **Budget indicator** (£/meal shown)
- **Time-aware** (quick meals on weekdays)

**What to Avoid:**
- ❌ 10-step onboarding (60%+ abandonment)
- ❌ Rigid plans (users want flexibility)
- ❌ 200+ personalization options
- ❌ Requiring detailed macro tracking

---

### Feature 3: Automated Shopping Lists

**Key Insight:** Most platforms (12 of 15) offer shopping lists WITHOUT supermarket APIs - users find generic lists valuable!

**What Users Value Most:**
1. **Automatic consolidation** (92% value) - Combines "2 cups flour" + "1 cup flour" = "3 cups flour"
2. **Categorization by aisle** (87%) - Efficient shopping route
3. **Easy editing** (81%) - Add/remove/adjust items
4. **Household sharing** (76%) - Multiple people can access
5. **Checkboxes** (73%) - Satisfying to tick off

#### Implementation: 3-Phase Approach

**Phase 1: Generic Smart List (MVP - Week 1)**

```
┌────────────────────────────────────────┐
│  Shopping List (From 4 recipes)        │
│  [Clear checked] [Add item] [Share]    │
├────────────────────────────────────────┤
│  🥬 FRESH PRODUCE (3 items)            │
│  ☑ Tomatoes, medium (3)                │
│  □ Onions, yellow (2 large)            │
│  □ Garlic (8 cloves)                   │
├────────────────────────────────────────┤
│  🥛 DAIRY & EGGS (2 items)             │
│  □ Milk, whole (500ml)                 │
│  □ Cheddar cheese (200g)               │
├────────────────────────────────────────┤
│  🍗 MEAT & FISH (1 item)               │
│  □ Chicken breast (600g)               │
├────────────────────────────────────────┤
│  🥫 PANTRY (2 items)                   │
│  □ Olive oil (3 tbsp)                  │
│  □ Pasta, dried (400g)                 │
└────────────────────────────────────────┘
  [+ Add custom item]
```

**Features:**
- Intelligent consolidation (same ingredient from multiple recipes)
- UK measurements (metric only)
- Aisle categorization (supermarket-standard categories)
- Shareable link (household members can access)
- Print-friendly version
- "Already have this" marks items (learns pantry staples)

**Phase 2: Open Food Facts Enhancement (Month 2-3)**

```
□ Tomatoes, canned (400g)

  💡 Suggested products:
  ┌───────────────────────────────────┐
  │ [📷] Napolina Chopped Tomatoes    │
  │      400g tin                      │
  │      Nutri-Score: B | Eco: B      │
  │      [Scan barcode to check off]  │
  └───────────────────────────────────┘
  ┌───────────────────────────────────┐
  │ [📷] Tesco Chopped Tomatoes       │
  │      400g tin                      │
  │      Nutri-Score: B | Eco: C      │
  │      [Scan barcode to check off]  │
  └───────────────────────────────────┘
```

**Benefits:**
- Product suggestions with photos
- Barcode scanning for checkout
- Nutrition information (Nutri-Score)
- Eco-score (environmental impact)
- Allergen warnings
- **Cost: £0/month** (Open Food Facts is FREE)

**Phase 3: Supermarket API Integration (Month 6+ / Optional)**

```
Shopping List - Compare Prices

🎯 Best deal: Sainsbury's (Save £3.25)

TOMATOES, CHOPPED (400g tin)
├─ Tesco ─────────────── £0.35
├─ Sainsbury's ────────── £0.32 ⭐ Best
└─ Asda ───────────────── £0.40

Total at Tesco: £23.45
Total at Sainsbury's: £20.20 ⭐ Best
Total at Asda: £21.50

[Shop at Sainsbury's] [View by store]
```

**Why Phase 3?**
- Requires API partnerships (business development)
- Maintenance burden (product catalog changes)
- Only 3 competitors have done this (challenging)
- MVP doesn't need it (generic lists work fine)

**Data Sources:**
- **Open Food Facts:** 165K UK products, FREE API, allergen data
- **Tesco API:** Available but requires partnership
- **Sainsbury's API:** Available but requires partnership

---

### Feature 4: Dietary Customization & Safety

**CRITICAL:** This is a safety-critical feature. Poor implementation can cause real harm.

**UK Legal Requirements:**
- Natasha's Law: Full ingredient listing with allergen highlighting
- Food Safety Act 1990: Duty of care
- 14 major allergens must be flagged

#### Implementation: Safety-First Design

**Hard Constraints (Never Violated):**

```
User Profile: Safety Settings
┌──────────────────────────────────────┐
│ 🚨 ALLERGIES (Always enforced)       │
│ ⚠️ Peanuts ──────────────── [Remove] │
│ ⚠️ Dairy ────────────────── [Remove] │
│                                       │
│ [+ Add allergy]                       │
│                                       │
│ These ingredients will NEVER appear   │
│ in any recipe recommendations.        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 🥗 DIET TYPE                          │
│ [●] Vegetarian ──────────── [Change] │
│                                       │
│ Only vegetarian recipes will be shown│
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 💊 HEALTH CONDITIONS                  │
│ [●] Coeliac disease ────── [Remove]  │
│                                       │
│ Gluten-free recipes only              │
└──────────────────────────────────────┘
```

**Recipe Display:**

```
┌────────────────────────────────────┐
│ [Photo: Chickpea Curry]            │
│                                     │
│ Chickpea Tikka Masala              │
│ ⭐⭐⭐⭐⭐ 4.8 (342)                 │
│                                     │
│ ✓ SAFE FOR YOUR PROFILE            │
│ 🥗 VEGAN  🌾 GLUTEN-FREE           │
│ 🥜 NUT-FREE  🌶️ SPICY             │
│                                     │
│ ⏱️ 25 min  👨‍🍳 Easy  💰 £1.80     │
└────────────────────────────────────┘
```

**Warning System:**

```
⚠️ WARNING: This recipe contains PEANUTS

You marked peanuts as an allergen in your profile.

This recipe is NOT safe for you.

[← Return to safe recipes] [Update my profile]
```

**Enforcement Hierarchy:**

```typescript
// Server-side filtering (never trust client)
async function getRecipesForUser(userId: string) {
  const profile = await getUserProfile(userId);

  let query = supabase.from('recipes').select('*');

  // HARD BLOCKS (never show)
  if (profile.allergies.length > 0) {
    // Filter out any recipe containing allergens
    query = query.not('allergens', 'cs', `{${profile.allergies.join(',')}}`);
  }

  if (profile.dietary_restrictions.includes('vegetarian')) {
    query = query.eq('is_vegetarian', true);
  }

  // Soft preferences (can be overridden by user toggle)
  // ... budget, time, cuisine preferences

  return query;
}
```

**UK Allergen Compliance:**

```
INGREDIENTS:
• Peanut butter (50g) ⚠️ Contains PEANUTS
• Soy sauce (2 tbsp) ⚠️ Contains SOY, GLUTEN
• Honey (1 tbsp)
• Chicken breast (400g)

⚠️ ALLERGEN WARNING:
This recipe contains: PEANUTS, SOY, GLUTEN

🔶 May contain traces of: TREE NUTS, SESAME
(if prepared in shared kitchen)
```

**14 UK Allergens:**
1. Peanuts
2. Tree nuts (almonds, walnuts, cashews, etc.)
3. Milk/dairy
4. Eggs
5. Fish
6. Shellfish (shrimp, crab, lobster)
7. Soy
8. Gluten/wheat
9. Sesame
10. Celery
11. Mustard
12. Lupin
13. Molluscs
14. Sulphites

---

## 2. AI Quality & Safety Strategy

### The Critical Industry Problem

**Evidence:**
- NPR: AI recipes can be "bland to dangerous"
- Washington Post: "Cup of horseradish in brownies"
- Users report missing critical ingredients, wrong temperatures
- Trust issue: Users trust AI less for innovative recipes

**Root Causes:**
- AI lacks sensory perception and culinary intuition
- No food safety knowledge in training data
- Hallucinates ingredient quantities
- Doesn't understand cooking chemistry

### Multi-Layer Safety Framework

#### Layer 1: Prompt Engineering (UK-Focused)

```typescript
const RECIPE_GENERATION_PROMPT = `You are a professional UK recipe developer.

<critical_safety_rules>
- NEVER suggest raw or undercooked poultry (165°C minimum internal temp)
- NEVER suggest raw eggs in recipes for vulnerable groups
- ALL measurements must be METRIC (grams, ml, litres, Celsius)
- ALL ingredient names must be BRITISH (courgette not zucchini, aubergine not eggplant)
- Cooking temperatures must be SAFE and VERIFIED
</critical_safety_rules>

<uk_requirements>
- Use British spelling (colour, flavour, etc.)
- Reference UK supermarket brands (Tesco, Sainsbury's)
- Suggest ingredients available in UK supermarkets
- Use UK seasonal ingredient availability
</uk_requirements>

<user_safety_constraints>
${user.allergies.length > 0 ? `CRITICAL: User is allergic to ${user.allergies.join(', ')}. NEVER include these ingredients.` : ''}
${user.dietary_restrictions.join(', ')}
</user_safety_constraints>

<recipe_structure>
Provide recipes in this exact JSON format:
{
  "name": "Recipe Name",
  "cuisine": "British/Italian/etc",
  "prep_time": 15,
  "cook_time": 30,
  "servings": 4,
  "difficulty": "easy",
  "ingredients": [
    {"item": "tomatoes", "amount": "400g", "notes": "chopped"}
  ],
  "instructions": [
    "Detailed step with temperature: Preheat oven to 180°C"
  ],
  "safety_notes": "Internal chicken temperature must reach 75°C",
  "allergens": ["gluten", "dairy"]
}
</recipe_structure>`;
```

**Key Techniques:**
- **XML-tagged prompts** (Claude performs 12% better)
- **Explicit safety rules** upfront
- **UK terminology dictionary** embedded
- **Temperature requirements** specified
- **Allergen detection** mandatory

#### Layer 2: Automated Validation (Pre-Display)

```typescript
interface RecipeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

async function validateRecipe(recipe: Recipe, userProfile: UserProfile): Promise<RecipeValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // CRITICAL CHECKS (Launch Blockers)

  // 1. Temperature Safety
  if (hasPoultry(recipe) && !hasMinTemp(recipe, 75)) {
    errors.push('Poultry recipe missing safe internal temperature (75°C minimum)');
  }

  if (hasPork(recipe) && !hasMinTemp(recipe, 63)) {
    errors.push('Pork recipe missing safe internal temperature (63°C minimum)');
  }

  // 2. Allergen Detection
  const detectedAllergens = detectAllergens(recipe.ingredients);
  const userAllergens = userProfile.allergies;
  const conflicts = detectedAllergens.filter(a => userAllergens.includes(a));

  if (conflicts.length > 0) {
    errors.push(`CRITICAL: Recipe contains user allergens: ${conflicts.join(', ')}`);
  }

  // 3. Recipe Completeness
  if (!recipe.name || recipe.name.length < 3) {
    errors.push('Recipe missing name');
  }

  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push('Recipe has no ingredients');
  }

  if (!recipe.instructions || recipe.instructions.length === 0) {
    errors.push('Recipe has no instructions');
  }

  // 4. UK Terminology Check
  const americanTerms = detectAmericanTerms(recipe);
  if (americanTerms.length > 0) {
    warnings.push(`American terms detected: ${americanTerms.join(', ')}`);
  }

  // 5. Metric Measurements
  const imperialMeasurements = detectImperialUnits(recipe);
  if (imperialMeasurements.length > 0) {
    warnings.push(`Imperial units detected: ${imperialMeasurements.join(', ')}`);
  }

  // 6. Ingredient Quantity Sanity
  const quantityIssues = validateQuantities(recipe);
  if (quantityIssues.length > 0) {
    warnings.push(...quantityIssues);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
```

**Critical Safety Checks:**
1. ✅ **Temperature Safety** - Validate against USDA/FSA minimums
2. ✅ **Allergen Detection** - Keyword matching against 14 major allergens
3. ✅ **Recipe Completeness** - Name, ingredients, instructions present
4. ✅ **UK Terminology** - British ingredient names only
5. ✅ **Metric Measurements** - No cups/ounces/Fahrenheit

**Important Checks:**
6. ⚠️ **Instruction Clarity** - Detect vague terms ("cook until done")
7. ⚠️ **Ingredient Ratios** - Sanity checks (not 10 cups of salt)

**UK Ingredient Dictionary (50+ terms):**

```typescript
const UK_US_INGREDIENT_MAP = {
  'zucchini': 'courgette',
  'eggplant': 'aubergine',
  'cilantro': 'coriander (fresh)',
  'arugula': 'rocket',
  'scallion': 'spring onion',
  'bell pepper': 'pepper',
  'fava bean': 'broad bean',
  'rutabaga': 'swede',
  'confectioners sugar': 'icing sugar',
  'all-purpose flour': 'plain flour',
  // ... 40+ more
};

function detectAmericanTerms(recipe: Recipe): string[] {
  const americanTerms: string[] = [];
  const allText = JSON.stringify(recipe).toLowerCase();

  for (const [american, british] of Object.entries(UK_US_INGREDIENT_MAP)) {
    if (allText.includes(american.toLowerCase())) {
      americanTerms.push(`"${american}" should be "${british}"`);
    }
  }

  return americanTerms;
}
```

#### Layer 3: Multi-Step Generation (Constitutional AI)

**For High-Stakes Recipes (Optional Enhancement):**

```typescript
async function generateValidatedRecipe(prompt: string, userProfile: UserProfile) {
  // Step 1: Generate initial recipe
  const initialRecipe = await claude.generate({
    prompt: buildPrompt(prompt, userProfile),
    model: 'claude-sonnet-4.5'
  });

  // Step 2: Self-critique
  const critique = await claude.generate({
    prompt: `Review this recipe for safety, accuracy, and UK appropriateness:

    ${JSON.stringify(initialRecipe)}

    Check for:
    - Food safety issues (temperatures, raw ingredients)
    - Incorrect quantities or ratios
    - American terminology or measurements
    - Missing allergen warnings
    - Unclear instructions

    Provide specific corrections needed.`,
    model: 'claude-sonnet-4.5'
  });

  // Step 3: Revise based on critique
  const revisedRecipe = await claude.generate({
    prompt: `Revise this recipe based on the critique:

    Original: ${JSON.stringify(initialRecipe)}
    Critique: ${critique}

    Provide the improved recipe.`,
    model: 'claude-sonnet-4.5'
  });

  // Step 4: Validate
  const validation = await validateRecipe(revisedRecipe, userProfile);

  if (!validation.valid) {
    throw new Error(`Recipe failed safety validation: ${validation.errors.join(', ')}`);
  }

  return revisedRecipe;
}
```

**Trade-offs:**
- ✅ Significantly improves quality
- ❌ 3x API calls = 3x cost
- ❌ 3x latency (slower response)
- **Recommendation:** Use for user-saved recipes only, not browsing

#### Layer 4: User Feedback Loop

```typescript
// After user cooks a recipe
interface RecipeFeedback {
  recipe_id: string;
  user_id: string;
  safety_issue?: 'undercooked' | 'overcooked' | 'allergen_unlisted' | 'other';
  quality_issue?: 'too_salty' | 'bland' | 'wrong_quantities' | 'unclear_instructions';
  severity: 'minor' | 'moderate' | 'critical';
  description: string;
}

async function handleSafetyReport(feedback: RecipeFeedback) {
  if (feedback.severity === 'critical') {
    // Immediately unpublish recipe
    await supabase.from('recipes')
      .update({ published: false, flagged_for_review: true })
      .eq('id', feedback.recipe_id);

    // Alert admin
    await sendAlert({
      type: 'CRITICAL_RECIPE_SAFETY',
      recipe_id: feedback.recipe_id,
      issue: feedback.description
    });
  }

  // Log all feedback for analysis
  await supabase.from('recipe_reports').insert(feedback);
}
```

### Legal & Liability Considerations (UK)

**Applicable Laws:**
- Food Safety Act 1990
- Consumer Protection Act 1987
- General Product Safety Regulations 2005
- Natasha's Law (allergen labeling)

**Recommended Disclaimers:**

```
TERMS OF SERVICE - Recipe Safety

1. USER RESPONSIBILITY
Recipes are AI-generated suggestions only. Users are solely responsible for:
- Verifying ingredient safety and allergen information
- Ensuring proper cooking temperatures and food safety
- Adapting recipes to their specific dietary needs
- Checking ingredients against their known allergies

2. NO WARRANTIES
Recipes are provided "AS IS" without warranty. We do not guarantee:
- Recipe safety, accuracy, or suitability
- Absence of allergens or specific ingredients
- Nutritional information accuracy
- Cooking outcomes

3. ALLERGEN WARNING
While we attempt to flag common allergens, cross-contamination and
hidden allergens may occur. Always verify ingredients if you have
food allergies.

4. CONSULT PROFESSIONALS
For medical dietary needs, consult healthcare professionals.
This service is not a substitute for professional nutritional advice.
```

**Display Prominently:**
- ⚠️ On every recipe page
- ⚠️ Before first recipe generation
- ⚠️ In user profile allergen settings

---

## 3. Data Integration Strategy

### Open Food Facts: FREE UK Product Database

**Why Open Food Facts?**
- ✅ **FREE** - £0/month operating cost
- ✅ **165,000 UK products** - Excellent coverage
- ✅ **Allergen data** - Critical for safety
- ✅ **Nutrition information** - Nutri-Score, macros
- ✅ **No API key required** - Simple integration
- ✅ **Eco-scores** - Environmental impact data

**What It Provides:**
- Product names and brands
- Barcodes (for scanning)
- Ingredients lists
- Allergen warnings (14 UK allergens)
- Nutritional data (calories, protein, carbs, fat)
- Nutri-Score (A-E health rating)
- Eco-Score (A-E environmental rating)
- Product images

**UK Supermarket Coverage:**
- Lidl: 14,000+ products
- Aldi: 10,000+ products
- Tesco: 4,000+ products
- Sainsbury's: 3,500+ products
- Asda, Morrisons, Co-op: Growing coverage

**API Integration:**

```typescript
// Search for products by ingredient name
async function searchOpenFoodFacts(ingredient: string, limit = 10) {
  const url = 'https://uk.openfoodfacts.org/cgi/search.pl';
  const params = new URLSearchParams({
    search_terms: ingredient,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: limit.toString(),
    countries_tags: 'united-kingdom',
    states_tags: 'en:complete' // Only complete entries
  });

  const response = await fetch(`${url}?${params}`);
  const data = await response.json();

  return data.products.map((p: any) => ({
    product_name: p.product_name,
    brands: p.brands,
    barcode: p.code,
    image_url: p.image_url,
    nutriscore_grade: p.nutriscore_grade,
    ecoscore_grade: p.ecoscore_grade,
    allergens: p.allergens_tags || [],
    ingredients_text: p.ingredients_text,
    nutrition: {
      calories: p.nutriments?.['energy-kcal_100g'],
      protein: p.nutriments?.proteins_100g,
      carbs: p.nutriments?.carbohydrates_100g,
      fat: p.nutriments?.fat_100g
    }
  }));
}

// Get specific product by barcode
async function getProductByBarcode(barcode: string) {
  const url = `https://uk.openfoodfacts.org/api/v2/product/${barcode}.json`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 1) {
    return data.product;
  }
  return null;
}
```

**Caching Strategy:**

```typescript
// Cache product lookups to reduce API calls
// Products change slowly, so 7-day TTL is reasonable

interface CachedProduct {
  barcode: string;
  data: any;
  cached_at: Date;
}

async function getCachedProduct(ingredient: string) {
  // Check Redis/database cache first
  const cached = await redis.get(`off:${ingredient}`);
  if (cached) {
    const product: CachedProduct = JSON.parse(cached);
    const age = Date.now() - product.cached_at.getTime();
    if (age < 7 * 24 * 60 * 60 * 1000) { // 7 days
      return product.data;
    }
  }

  // Not in cache or expired, fetch from API
  const products = await searchOpenFoodFacts(ingredient);

  // Cache results
  await redis.set(
    `off:${ingredient}`,
    JSON.stringify({ barcode: ingredient, data: products, cached_at: new Date() }),
    'EX',
    7 * 24 * 60 * 60 // 7 days in seconds
  );

  return products;
}
```

**Rate Limits:**
- 100 requests/minute for product lookups
- 10 requests/minute for search
- **Very reasonable** for typical usage

**Use Cases:**

1. **Shopping List Enhancement:**
```
□ Tomatoes, canned (400g)
  💡 Suggested: Napolina Chopped Tomatoes 400g
  Nutri-Score: B | [Barcode: 5000354006784]
```

2. **Allergen Detection:**
```
⚠️ Warning: This product contains MILK
Based on Open Food Facts ingredient analysis
```

3. **Nutrition Calculation:**
```
Recipe Nutrition (per serving):
Calories: 450 kcal
Protein: 25g
Carbs: 40g
Fat: 15g

[Data from Open Food Facts]
```

### Hybrid Data Strategy

**For comprehensive coverage, combine three sources:**

```typescript
interface IngredientData {
  name: string;
  source: 'open_food_facts' | 'usda' | 'internal';
  nutrition?: NutritionData;
  allergens?: string[];
  products?: Product[];
}

async function getIngredientData(ingredient: string): Promise<IngredientData> {
  // 1. Check internal curated database first (highest quality)
  const internal = await db.ingredients.findOne({ name: ingredient });
  if (internal) {
    return { ...internal, source: 'internal' };
  }

  // 2. Try Open Food Facts (good for packaged products)
  const offProducts = await searchOpenFoodFacts(ingredient);
  if (offProducts.length > 0) {
    return {
      name: ingredient,
      source: 'open_food_facts',
      products: offProducts,
      allergens: offProducts[0].allergens,
      nutrition: offProducts[0].nutrition
    };
  }

  // 3. Fallback to USDA (good for fresh ingredients)
  const usdaData = await searchUSDA(ingredient);
  if (usdaData) {
    return {
      name: ingredient,
      source: 'usda',
      nutrition: usdaData.nutrition
    };
  }

  // 4. No data found
  return { name: ingredient, source: 'internal' };
}
```

**Data Source Comparison:**

| Source | Cost | UK Coverage | Allergens | Nutrition | Best For |
|--------|------|-------------|-----------|-----------|----------|
| Open Food Facts | FREE | 165K products | ✅ Yes | ✅ Yes | Packaged products |
| USDA FoodData | FREE | Generic items | ❌ No | ✅ Yes | Fresh ingredients |
| Internal DB | FREE | Curated | ✅ Yes | ✅ Yes | Quality overrides |
| Edamam | $49-799/mo | Global | ✅ Yes | ✅ Yes | If you have budget |

**Recommendation:** Start with Open Food Facts + USDA (both FREE), add internal overrides for quality control.

---

## 4. Personalization Roadmap

### The Strategy: Simple → Intelligent → Predictive

**Phase 1 (MVP - Months 1-2): Explicit Preferences**
- User profile with dietary restrictions, allergies, preferences
- AI prompt customization with user context
- Simple save/like tracking
- **Cost:** ~$80/month for 1,000 users
- **Implementation:** 2-4 weeks

**Phase 2 (Post-Launch - Months 3-6): Behavioral Learning**
- Recipe similarity recommendations
- Preference inference from behavior
- "Recommended for you" feature
- **Cost:** +$20/month (embeddings)
- **Implementation:** 6-8 weeks

**Phase 3 (Scale - Month 6+): Advanced Intelligence** (Optional)
- Predictive suggestions (anticipate needs)
- Collaborative filtering (similar users)
- Fine-tuning for user segments
- **Cost:** Variable (if needed)
- **Implementation:** 12+ weeks

### Phase 1: MVP Personalization (Recommended Start)

**Database Schema:**

```sql
-- User preferences (JSONB for flexibility)
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(user_id),
  preferences JSONB NOT NULL DEFAULT '{
    "dietary_restrictions": [],
    "allergies": [],
    "cuisines_liked": [],
    "cuisines_disliked": [],
    "disliked_ingredients": [],
    "cooking_skill": "intermediate",
    "household_size": 2,
    "budget_per_meal": null,
    "typical_cook_time": 30,
    "spice_level": "medium"
  }'::jsonb,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Behavioral tracking
CREATE TABLE user_recipe_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(user_id),
  recipe_id UUID REFERENCES recipes(recipe_id),
  interaction_type VARCHAR(50) CHECK (
    interaction_type IN ('viewed', 'saved', 'unsaved', 'cooked', 'planned', 'added_to_shopping_list')
  ),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable JSONB queries
CREATE INDEX idx_user_preferences ON user_profiles USING gin(preferences);
```

**AI Prompt with User Context:**

```typescript
function buildPersonalizedPrompt(user: UserProfile, query: string): string {
  return `You are a personalized recipe assistant for this UK user:

CRITICAL SAFETY (NEVER violate):
${user.preferences.allergies?.length > 0
  ? `- User is allergic to: ${user.preferences.allergies.join(', ')}. NEVER suggest recipes with these.`
  : ''}
${user.preferences.dietary_restrictions?.join(', ') || 'No dietary restrictions'}

USER PREFERENCES:
- Favorite cuisines: ${user.preferences.cuisines_liked?.join(', ') || 'No strong preferences'}
- Cooking skill: ${user.preferences.cooking_skill}
- Typical time: ${user.preferences.typical_cook_time} minutes
- Household size: ${user.preferences.household_size} people
${user.preferences.budget_per_meal ? `- Budget: £${user.preferences.budget_per_meal}/serving` : ''}

USER QUERY: ${query}

Provide 3 recipes matching their profile. Use UK measurements, British ingredient names.`;
}
```

**Anthropic Claude Memory Tool (Game-Changer):**

```typescript
// Claude can store and retrieve user preferences automatically
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4.5',
  tools: [
    {
      name: 'memory',
      description: 'Store and retrieve user preferences across conversations'
    }
  ],
  messages: [
    {
      role: 'user',
      content: 'Suggest dinner recipes'
    }
  ]
});

// Claude automatically:
// - Retrieves stored preferences (allergies, diet, favorites)
// - Generates recipes matching their profile
// - Updates memory with new preferences learned
```

**Benefits of Claude Memory:**
- ✅ Native personalization (no custom engineering)
- ✅ 39% performance improvement over baseline
- ✅ Automatic preference learning
- ✅ Your data (stored on your infrastructure)
- ✅ GDPR-compliant (you control storage)

**Prompt Caching (90% Cost Reduction):**

```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4.5',
  system: [
    {
      type: 'text',
      text: userContextPrompt, // Cached for 5 minutes
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [
    { role: 'user', content: newQuery } // Not cached
  ]
});

// Cost savings:
// First request: $3/million tokens
// Cached requests: $0.30/million tokens (10% of input cost)
```

### GDPR Compliance

**Required for UK Market:**

**1. Granular Consent:**
```typescript
const consentOptions = {
  essential: {
    label: "Essential functionality",
    description: "Store dietary restrictions to filter recipes safely",
    required: true,
    data: ["dietary_restrictions", "allergies"]
  },
  personalization: {
    label: "Personalized recommendations",
    description: "Track which recipes you like to suggest better recipes",
    required: false, // User must opt-in
    data: ["recipe_views", "saves", "likes"]
  }
};
```

**2. Right to Be Forgotten:**
```sql
-- Delete all user data
DELETE FROM user_profiles WHERE user_id = $1;
DELETE FROM user_recipe_interactions WHERE user_id = $1;
DELETE FROM recipe_ratings WHERE user_id = $1;

-- Anonymize analytics (can't reconstruct individual)
UPDATE analytics_events
SET user_id = NULL, anonymized = TRUE
WHERE user_id = $1;
```

**3. Data Retention Policy:**
- Active users: Retain all data
- Inactive 12+ months: Delete behavioral data, keep profile
- Deleted accounts: Hard delete within 30 days

---

## 5. What NOT to Build (Explicit Exclusions)

### Feature Exclusion List

**These features are explicitly OUT OF SCOPE for MVP:**

#### 1. Social Features ❌
**Why exclude:**
- Samsung Food has 4.5M members (can't compete)
- Requires moderation infrastructure
- Community building is a separate product
- Adds 6-8 weeks development time

**What this means:**
- No recipe sharing/comments
- No user profiles/following
- No recipe ratings from others (own ratings only)

**Alternative:** Simple "Share via link" for household members

---

#### 2. Video Recipes ❌
**Why exclude:**
- YouTube exists (don't reinvent)
- Video hosting/encoding infrastructure
- Bandwidth costs
- Production complexity

**Alternative:** Embed external YouTube links if user-provided (Phase 2+)

---

#### 3. Recipe Blogging Platform ❌
**Why exclude:**
- Not solving our core problem
- Content moderation required
- SEO competition with established sites
- Scope creep

**What this means:**
- No user-generated recipe publishing
- No blog-style recipe stories
- Only AI-generated + user-saved recipes

---

#### 4. Advanced Nutrition Tracking ❌
**Why exclude:**
- MyFitnessPal exists and dominates
- Requires extensive food database
- Medical/health advice liability
- Feature bloat

**What we DO include:**
- Basic nutrition display (calories, protein, carbs, fat)
- Macro filtering (high-protein, low-carb options)

**What we DON'T:**
- Daily calorie tracking
- Nutrient micromanagement
- Weight loss goal tracking

---

#### 5. Pantry Inventory Tracking ❌
**Why exclude:**
- Users don't maintain it (high abandonment)
- Constant manual updates required
- SuperCook users complain "pantry doesn't save"
- Low ROI on development time

**What we DO instead:**
- "Use these ingredients" recipe search
- "Already have" checkbox on shopping lists
- Learn common staples from behavior

---

#### 6. Family Member Profiles ❌
**Why exclude:**
- Serves <15% of users (small segment)
- Massive complexity (permissions, separate preferences)
- UI becomes confusing
- Better solved with substitution notes

**Example of excluded feature:**
```
❌ Family Profiles:
- Dad: Vegetarian
- Mom: Eats fish
- Kid 1: Allergic to nuts
- Kid 2: Hates mushrooms
→ Generate 4 separate meal variations
```

**Better solution:**
```
✅ Recipe Notes:
"Substitute tofu for chicken for vegetarian option"
"Omit walnuts for nut-free version"
```

---

#### 7. Recipe Import from URLs ❌ (MVP)
**Why defer to Phase 2:**
- Web scraping is fragile (sites change layouts)
- Legal gray area
- Quality control issues (bad recipes imported)
- Adds 3-4 weeks development

**Phase 2 consideration:** Import with manual review

---

#### 8. Supermarket Online Ordering ❌ (MVP)
**Why defer to Phase 3:**
- Requires API partnerships (business development)
- Maintenance burden
- Only 3 competitors have achieved this
- Generic shopping lists work fine initially

**Phase 3 consideration:** If user base justifies (10K+ users)

---

#### 9. Cooking Mode / Voice Assistant ❌
**Why exclude:**
- Nice-to-have, not essential
- Requires voice UI design
- Hands-free mode is niche (can use phone holder)
- Adds 2-3 weeks

**Phase 2 consideration:** If strong user demand

---

#### 10. Recipe Collections / Folders ❌ (MVP)
**Why defer:**
- Can be solved with tags initially
- Hierarchy adds UI complexity
- Users want search > organization
- Adds 1-2 weeks

**MVP alternative:**
```
✓ Simple tagging: "Quick meals", "Batch cooking", "Favorites"
✓ Search and filter
```

**Phase 2:** Nested collections if users request

---

### The Prioritization Framework

**Use RICE scoring for future features:**

```
RICE Score = (Reach × Impact × Confidence) / Effort

Reach: % of users affected (0-100%)
Impact: Value to those users (0.25, 0.5, 1, 2, 3)
Confidence: How sure are we? (50%, 80%, 100%)
Effort: Person-weeks to build

Example:
Feature: Recipe Collections
- Reach: 40% (moderate)
- Impact: 1 (medium value)
- Confidence: 80% (fairly sure)
- Effort: 2 weeks

RICE = (40 × 1 × 0.8) / 2 = 16

Threshold: Build if RICE > 20 (high leverage)
```

**Current RICE scores:**

| Feature | Reach | Impact | Confidence | Effort | RICE | Decision |
|---------|-------|--------|------------|--------|------|----------|
| Social features | 20% | 2 | 60% | 8 | 3 | ❌ Don't build |
| Pantry tracking | 30% | 1 | 80% | 4 | 6 | ❌ Don't build |
| Recipe collections | 40% | 1 | 80% | 2 | 16 | ⏸ Phase 2 |
| Voice cooking mode | 25% | 1.5 | 70% | 3 | 8.75 | ⏸ Phase 2 |
| Recipe import URL | 50% | 2 | 60% | 4 | 15 | ⏸ Phase 2 |

---

## 6. Technical Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js 15)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Search &   │  │ Meal Planner │  │  Shopping List  │  │
│  │   Generate   │  │              │  │                 │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│         │                  │                    │           │
└─────────┼──────────────────┼────────────────────┼───────────┘
          │                  │                    │
          ↓                  ↓                    ↓
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes (RSC)                  │
│  ┌────────────────┐  ┌───────────────┐  ┌───────────────┐ │
│  │ /api/recipes/  │  │ /api/meal-    │  │ /api/shopping │ │
│  │   generate     │  │   plans       │  │   -lists      │ │
│  └────────┬───────┘  └───────┬───────┘  └───────┬───────┘ │
└───────────┼──────────────────┼──────────────────┼───────────┘
            │                  │                  │
            ↓                  ↓                  ↓
┌────────────────────────────────────────────────────────────┐
│               Supabase (PostgreSQL + Auth)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │   Recipes    │  │ User Profiles│  │  Meal Plans     │ │
│  │  (10K rows)  │  │  (JSONB)     │  │                 │ │
│  └──────────────┘  └──────────────┘  └─────────────────┘ │
│  Row-Level Security (RLS) enabled on all tables           │
└────────────────────────┬───────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ↓                         ↓
┌──────────────────────┐   ┌──────────────────────┐
│  Anthropic Claude    │   │  Open Food Facts     │
│  Sonnet 4.5          │   │  API (FREE)          │
│  - Recipe generation │   │  - 165K UK products  │
│  - Personalization   │   │  - Allergen data     │
│  - Memory tool       │   │  - Nutrition         │
│  - Prompt caching    │   │  - Barcodes          │
└──────────────────────┘   └──────────────────────┘
```

### Database Schema (Complete)

```sql
-- ============================================
-- USER MANAGEMENT
-- ============================================

-- Extended from Supabase Auth
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(user_id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{
    "dietary_restrictions": [],
    "allergies": [],
    "cuisines_liked": [],
    "cuisines_disliked": [],
    "disliked_ingredients": [],
    "cooking_skill": "intermediate",
    "household_size": 2,
    "budget_per_meal": null,
    "typical_cook_time": 30,
    "spice_level": "medium"
  }'::jsonb,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- RECIPES
-- ============================================

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cuisine VARCHAR(100),
  source VARCHAR(50) CHECK (source IN ('ai_generated', 'user_created', 'imported')),

  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  total_time INTEGER GENERATED ALWAYS AS (prep_time + cook_time) STORED,
  servings INTEGER DEFAULT 4,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),

  ingredients JSONB NOT NULL, -- Array of {item, amount, unit, notes}
  instructions JSONB NOT NULL, -- Array of {step_number, instruction}

  allergens TEXT[], -- Array of allergen names
  tags TEXT[], -- Array of tags (quick, batch-cooking, etc.)

  nutrition JSONB, -- {calories, protein, carbs, fat}
  cost_per_serving DECIMAL(5,2),

  image_url TEXT,

  is_public BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  flagged_for_review BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_recipes_user (user_id),
  INDEX idx_recipes_cuisine (cuisine),
  INDEX idx_recipes_difficulty (difficulty),
  INDEX idx_recipes_allergens USING gin(allergens),
  INDEX idx_recipes_tags USING gin(tags)
);

-- ============================================
-- USER INTERACTIONS
-- ============================================

CREATE TABLE user_recipe_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(user_id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL CHECK (
    interaction_type IN ('viewed', 'saved', 'unsaved', 'cooked', 'planned', 'added_to_shopping_list')
  ),
  session_duration INTEGER, -- seconds
  adjustments JSONB, -- {servings_changed_to, ingredient_swaps}
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_interactions_user (user_id, created_at DESC),
  INDEX idx_interactions_recipe (recipe_id, interaction_type)
);

CREATE TABLE recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(user_id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  would_make_again BOOLEAN,
  difficulty_accurate BOOLEAN,
  time_accurate BOOLEAN,
  tags JSONB, -- ["too_salty", "great_leftovers", "kid_friendly"]
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- ============================================
-- MEAL PLANNING
-- ============================================

CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(user_id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

CREATE TABLE meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Mon, 6=Sun
  meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings INTEGER DEFAULT 4,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(meal_plan_id, day_of_week, meal_type)
);

-- ============================================
-- SHOPPING LISTS
-- ============================================

CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(user_id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  name VARCHAR(255) DEFAULT 'Shopping List',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  item_name VARCHAR(255) NOT NULL,
  amount VARCHAR(100),
  category VARCHAR(50), -- produce, dairy, meat, pantry, etc.
  checked BOOLEAN DEFAULT FALSE,
  notes TEXT,
  open_food_facts_barcode VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_shopping_items_list (shopping_list_id),
  INDEX idx_shopping_items_checked (checked)
);

-- ============================================
-- GDPR COMPLIANCE
-- ============================================

CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(user_id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  granted BOOLEAN NOT NULL,
  consent_version VARCHAR(20) NOT NULL,
  consent_method VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  granted_at TIMESTAMP DEFAULT NOW(),
  withdrawn_at TIMESTAMP,
  INDEX idx_user_consents (user_id, consent_type, granted)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recipe_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recipes" ON recipes
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for all user-scoped tables...

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Similar triggers for other tables...
```

### API Architecture

**RESTful API Routes:**

```
/api/auth/*                 - Supabase Auth (handled automatically)

/api/recipes
  GET     /                 - List user's recipes (with filters)
  POST    /                 - Create new recipe
  GET     /:id              - Get specific recipe
  PUT     /:id              - Update recipe
  DELETE  /:id              - Delete recipe
  POST    /generate         - AI generate recipes from ingredients

/api/meal-plans
  GET     /                 - List user's meal plans
  POST    /                 - Create meal plan for week
  GET     /:id              - Get specific meal plan
  PUT     /:id              - Update meal plan
  DELETE  /:id              - Delete meal plan
  POST    /:id/items        - Add recipe to meal plan
  DELETE  /:id/items/:itemId - Remove recipe from meal plan

/api/shopping-lists
  GET     /                 - List user's shopping lists
  POST    /                 - Create shopping list
  GET     /:id              - Get specific list
  PUT     /:id              - Update list
  DELETE  /:id              - Delete list
  POST    /:id/items        - Add item to list
  PUT     /:id/items/:itemId - Update item (check/uncheck)
  DELETE  /:id/items/:itemId - Remove item
  POST    /:id/generate-from-meal-plan - Auto-generate from meal plan

/api/profile
  GET     /                 - Get user profile
  PUT     /                 - Update preferences
  DELETE  /                 - Delete account (GDPR)

/api/search
  GET     /recipes          - Search recipes
  GET     /ingredients      - Search Open Food Facts
```

### Tech Stack

**Frontend:**
- Next.js 15.5.4 (App Router, React Server Components)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui components
- React Hook Form + Zod validation

**Backend:**
- Next.js API Routes (serverless functions)
- Supabase PostgreSQL (database)
- Supabase Auth (authentication)
- Row-Level Security (RLS) for authorization

**AI Services:**
- Anthropic Claude Sonnet 4.5 (primary AI)
- OpenAI GPT-4.1 (alternative/comparison)
- Prompt caching (90% cost reduction)

**External APIs:**
- Open Food Facts (FREE UK product database)
- USDA FoodData Central (FREE generic nutrition)

**Infrastructure:**
- Vercel (hosting, automatic deployments)
- GitHub (version control, CI/CD)
- Supabase Cloud (database hosting)

**Monitoring & Analytics:**
- Vercel Analytics (page views, performance)
- Supabase Dashboard (database queries)
- Custom event tracking (recipe generation, saves)

---

## 7. Development Roadmap (16 Weeks)

### Phase 1: Foundation (Weeks 1-4)

**Week 1: Core Infrastructure**
- ✅ Database schema implementation
- ✅ Supabase Auth setup
- ✅ RLS policies
- ✅ Basic API routes structure
- ✅ UI component library (shadcn/ui)

**Week 2: Recipe Management**
- Recipe CRUD operations
- Recipe form with validation
- Recipe display components
- Search and filter UI
- Recipe scaling logic

**Week 3: AI Integration**
- Anthropic Claude API integration
- UK-focused prompt engineering
- Recipe generation from ingredients
- Safety validation layer
- Error handling and retries

**Week 4: User Preferences**
- Onboarding wizard (5 screens)
- User profile management
- Dietary restrictions & allergens
- Settings page
- GDPR consent flow

**Deliverable:** Working recipe platform with AI generation and user profiles

---

### Phase 2: Core Features (Weeks 5-8)

**Week 5: Meal Planning**
- Weekly meal plan calendar UI
- Drag-and-drop meal assignment
- Meal plan CRUD operations
- Navigation (prev/next week)
- Recipe selector dialog

**Week 6: Shopping Lists**
- Shopping list generation from recipes
- Ingredient consolidation logic
- Aisle categorization
- Checkbox state management
- Shareable list links

**Week 7: Personalization**
- Behavioral tracking (saves, views, cooks)
- Personalized AI prompts
- "Recommended for you" section
- Preference inference basics
- Prompt caching implementation

**Week 8: Polish & Testing**
- Mobile responsiveness
- Loading states
- Error handling improvements
- User testing (10-20 beta users)
- Bug fixes from testing

**Deliverable:** Complete MVP with core 4 features

---

### Phase 3: Enhancement & Launch (Weeks 9-12)

**Week 9: Open Food Facts Integration**
- API integration
- Product search and matching
- Barcode scanning UI
- Caching layer (Redis/Supabase)
- Nutrition display

**Week 10: Safety & Quality**
- Recipe validation enhancement
- Safety warnings and disclaimers
- Recipe reporting system
- Admin review dashboard
- Legal compliance review

**Week 11: Performance & Scale**
- Database query optimization
- API response caching
- Image optimization
- Lighthouse performance audit
- Load testing

**Week 12: Launch Preparation**
- Final bug fixes
- Documentation
- Terms of Service / Privacy Policy
- Analytics setup
- Soft launch to friends/family

**Deliverable:** Production-ready application

---

### Phase 4: Post-Launch (Weeks 13-16)

**Week 13: Launch & Monitor**
- Public launch announcement
- Monitor errors and performance
- Rapid bug fixes
- User feedback collection
- Analytics review

**Week 14: Quick Wins**
- Address top user feedback
- Small UI improvements
- Performance optimizations
- Feature polish

**Week 15: Data Analysis**
- User behavior analysis
- Feature usage metrics
- Retention cohort analysis
- Identify friction points

**Week 16: Roadmap Planning**
- Prioritize Phase 2 features
- Plan next quarter
- Team retro (if applicable)
- Celebrate launch! 🎉

---

### Development Velocity Comparison

**Focused Approach (This Plan):** 16 weeks to MVP

**Feature-Bloat Approach:**
- Core 4 features: 8 weeks
- Social features: 6 weeks
- Video recipes: 4 weeks
- Advanced nutrition: 5 weeks
- Pantry tracking: 3 weeks
- Recipe import: 4 weeks
- Family profiles: 5 weeks
- **Total: 35 weeks** (19 weeks slower!)

**Time-to-Market Advantage:** 4.5 months faster competitive positioning

---

## 8. Success Metrics & KPIs

### North Star Metric

**Primary Success Indicator:**
> **Weekly Active Users who create a meal plan**

Why: This indicates users find core value (meal planning workflow) and return weekly

---

### Launch Targets (Month 3)

**Engagement Metrics:**
- ✅ **30-day retention > 8%** (vs 3.93% industry average)
- ✅ **60% of users save at least one recipe**
- ✅ **40% create at least one meal plan**
- ✅ **Time to first value < 60 seconds**
- ✅ **Average session time > 5 minutes**

**Quality Metrics:**
- ✅ **Zero food safety incidents** (allergen violations)
- ✅ **Recipe generation success rate > 95%**
- ✅ **AI-generated recipe quality rating > 4.0/5**
- ✅ **<5% recipe reports for safety issues**

**Business Metrics:**
- ✅ **1,000 registered users** (Month 3)
- ✅ **Operating cost < £100/month** (Month 3)
- ✅ **Cost per user < £0.10/month**

---

### Growth Metrics (Month 6+)

**User Acquisition:**
- Monthly new users growth rate > 20%
- Organic search traffic > 40% of acquisition
- Referral rate > 15% (users sharing)

**Engagement:**
- Weekly active users (WAU) growth
- Recipes generated per user per month > 10
- Meal plans created per user per month > 3
- Shopping lists generated per user per month > 2

**Retention Cohorts:**
- Week 1 → Week 2 retention > 50%
- Week 1 → Week 4 retention > 25%
- Month 1 → Month 3 retention > 15%

**Quality:**
- Recipe save rate > 25% (of generated recipes)
- "Cooked this" rate > 10% (of saved recipes)
- Average recipe rating > 4.2/5

---

### Product-Specific Metrics

**Feature 1: Ingredient-Based Search**
- % of users who use ingredient search: Target > 80%
- Average ingredients entered per search: Target 3-5
- Success rate (recipes found): Target > 95%

**Feature 2: Meal Planning**
- % of users who create meal plan: Target > 40%
- Average meals planned per week: Target > 5
- Meal plan completion rate: Target > 60% (cook at least 60% of planned meals)

**Feature 3: Shopping Lists**
- % of users who generate shopping list: Target > 50%
- Average items per list: Target 15-25
- Checkbox completion rate: Target > 70%

**Feature 4: Dietary Safety**
- % of users who set allergies: Target > 30%
- Zero allergen violation incidents
- Safety report resolution time < 24 hours

---

### Leading Indicators (Early Warnings)

**Positive Signals:**
- ✅ Increasing session duration
- ✅ Users return within 7 days
- ✅ High recipe save rate
- ✅ Low bounce rate on recipe pages

**Warning Signals:**
- ⚠️ Decreasing time to first search (confused users?)
- ⚠️ Low recipe generation success rate
- ⚠️ High recipe report rate
- ⚠️ Increasing API error rate

---

### Analytics Implementation

**Events to Track:**

```typescript
// User actions
trackEvent('recipe_generated', {
  ingredient_count: number,
  filters_used: string[],
  success: boolean
});

trackEvent('recipe_saved', {
  recipe_id: string,
  source: 'ai_generated' | 'search'
});

trackEvent('meal_plan_created', {
  meals_count: number,
  week_start: Date
});

trackEvent('shopping_list_generated', {
  items_count: number,
  from_meal_plan: boolean
});

// Quality signals
trackEvent('recipe_cooked', {
  recipe_id: string,
  rating: number
});

trackEvent('recipe_reported', {
  recipe_id: string,
  issue_type: string,
  severity: string
});

// Funnel tracking
trackEvent('onboarding_started');
trackEvent('onboarding_step_completed', { step: number });
trackEvent('onboarding_completed');
```

---

## 9. Risks & Mitigation

### Critical Risks

#### Risk 1: AI-Generated Recipe Safety

**Severity:** CRITICAL
**Likelihood:** MEDIUM
**Impact:** Legal liability, user harm, brand damage

**Scenario:** AI suggests recipe with dangerous cooking temperature, user gets food poisoning

**Mitigation:**
- ✅ Multi-layer validation (prompt engineering + automated checks)
- ✅ Temperature safety validation (mandatory for meat/poultry)
- ✅ Allergen detection system
- ✅ Legal disclaimers and Terms of Service
- ✅ User feedback/reporting system
- ✅ Insurance (product liability insurance)
- ✅ Manual review for flagged recipes

**Residual Risk:** LOW (with all mitigations)

---

#### Risk 2: GDPR Non-Compliance

**Severity:** CRITICAL
**Likelihood:** MEDIUM
**Impact:** Fines up to £17.5M or 4% of revenue

**Scenario:** User requests data deletion, we fail to comply within 30 days

**Mitigation:**
- ✅ GDPR compliance built from day one
- ✅ Granular consent system
- ✅ Right to be forgotten implementation
- ✅ Data retention policy automated
- ✅ Legal review of privacy policy
- ✅ Audit trail for all data operations

**Residual Risk:** LOW

---

#### Risk 3: AI Quality Below Expectations

**Severity:** HIGH
**Likelihood:** MEDIUM
**Impact:** Poor user experience, high churn, negative reviews

**Scenario:** AI consistently generates bland, inaccurate, or bizarre recipes

**Mitigation:**
- ✅ Prompt engineering with UK focus
- ✅ Multi-step generation (generate → critique → revise)
- ✅ User feedback loop (ratings, reports)
- ✅ Dual AI option (Claude + GPT, user picks best)
- ✅ Human curation layer (featured recipes)
- ✅ Continuous prompt optimization based on feedback

**Residual Risk:** MEDIUM (AI is unpredictable)

---

#### Risk 4: Open Food Facts Data Quality

**Severity:** MEDIUM
**Likelihood:** HIGH
**Impact:** Incorrect product suggestions, allergen data missing

**Scenario:** Open Food Facts has incomplete UK product data, allergen info missing

**Mitigation:**
- ✅ Hybrid data strategy (OFF + USDA + internal)
- ✅ Data quality checks before display
- ✅ Fallback to generic ingredients
- ✅ User corrections crowdsourcing
- ✅ Disclaimers on allergen data accuracy

**Residual Risk:** MEDIUM (crowdsourced data varies)

---

### Operational Risks

#### Risk 5: Scaling Costs Exceed Budget

**Severity:** MEDIUM
**Likelihood:** MEDIUM
**Impact:** Financial sustainability issues

**Scenario:** API costs grow faster than user acquisition

**Mitigation:**
- ✅ Prompt caching (90% cost reduction)
- ✅ Free data sources (Open Food Facts, USDA)
- ✅ Usage monitoring and alerts
- ✅ Rate limiting per user
- ✅ Freemium model (paid tier for heavy users)

**Residual Risk:** LOW (costs scale linearly with caching)

---

#### Risk 6: Feature Creep

**Severity:** MEDIUM
**Likelihood:** HIGH
**Impact:** Delayed launch, bloated product, complexity

**Scenario:** Team adds "just one more feature" repeatedly

**Mitigation:**
- ✅ Explicit "What NOT to Build" list
- ✅ RICE prioritization framework
- ✅ Weekly scope review
- ✅ User feedback-driven roadmap (not assumptions)
- ✅ 30% user demand threshold for new features

**Residual Risk:** MEDIUM (always a temptation)

---

#### Risk 7: Competition (Established Players)

**Severity:** MEDIUM
**Likelihood:** HIGH
**Impact:** Market share difficulty, differentiation challenge

**Scenario:** Samsung Food or ChefGPT copies our simplicity approach

**Mitigation:**
- ✅ UK-first positioning (competitors are global/US-focused)
- ✅ Simplicity as core differentiator (hard to copy when you're already complex)
- ✅ Fast iteration cycle (16 weeks vs 35)
- ✅ Community building (loyal users)
- ✅ Continuous quality improvement

**Residual Risk:** MEDIUM (competition always a factor)

---

## 10. Go-to-Market Strategy

### Target Audience (UK)

**Primary Persona: "Busy Parent Beth"**
- Age: 30-45
- Household: 2 adults + 2 kids
- Works full-time
- Cooks dinner 5+ nights/week
- Pain: "What's for dinner?" decision fatigue
- Motivation: Save time, reduce food waste, feed family well
- Tech: Uses mobile primarily, comfortable with apps

**Secondary Persona: "Healthy Living Hannah"**
- Age: 25-35
- Household: Lives alone or with partner
- Health-conscious (vegan, keto, or gluten-free)
- Pain: Finding recipes that match dietary restrictions
- Motivation: Health goals, meal prep efficiency
- Tech: Early adopter, willing to try new apps

**Tertiary Persona: "Budget-Conscious Colin"**
- Age: 18-30
- Student or early career
- Pain: Expensive food, limited cooking skills
- Motivation: Save money, learn to cook, avoid takeout
- Tech: Mobile-first, price-sensitive

### Positioning Statement

> For UK home cooks overwhelmed by complex recipe apps, Recipe App is a simple AI assistant that answers "What's for dinner?" by generating personalized meal plans from ingredients you already have—saving time, reducing waste, and removing decision fatigue.

### Launch Strategy (3 Phases)

**Phase 1: Private Beta (Weeks 13-14)**
- 50 invited users (friends, family, network)
- Goal: Find critical bugs, gather initial feedback
- Channels: Personal invitations, Google Form signup
- Incentive: Lifetime free account

**Phase 2: Public Beta (Weeks 15-16)**
- Open registration
- Goal: 500 users, validate product-market fit
- Channels:
  - ProductHunt launch
  - UK subreddits (r/UKPersonalFinance, r/EatCheapAndHealthy, r/MealPrepUK)
  - Twitter/X announcement
  - LinkedIn post
- Incentive: Free during beta

**Phase 3: Public Launch (Month 4)**
- Full launch with pricing
- Goal: 2,000 users in Month 1
- Channels:
  - Content marketing (SEO blog posts)
  - Partnerships (food bloggers, nutritionists)
  - Paid ads (Facebook, Google - small budget test)
  - Referral program (invite friends, get benefits)

### Content Marketing Strategy

**SEO-Focused Blog Posts (UK Keywords):**
1. "15 Quick Vegetarian Dinners Using Tesco Basics"
2. "Meal Prep on £30/Week: 7-Day Guide"
3. "What to Cook with Leftover Chicken: 10 Easy Recipes"
4. "Coeliac-Friendly Meal Planning Made Simple"
5. "How to Reduce Food Waste in Your Kitchen"

**Social Media:**
- Instagram: Recipe photos, meal plan examples
- TikTok: Quick recipe videos, meal prep tips
- Pinterest: Infographics, recipe pins (high search traffic)

### Pricing Strategy

**Free Tier (Forever Free):**
- 10 AI recipe generations per month
- Unlimited saved recipes
- Basic meal planning
- Shopping lists
- Core dietary restrictions

**Pro Tier (£4.99/month or £49/year):**
- Unlimited AI recipe generations
- Advanced personalization (learning preferences)
- Recipe collections/folders
- Priority support
- Early access to new features
- Export recipes to PDF

**Rationale:**
- Lower than competitors (ChefGPT £12.99/mo, Samsung Food £6.99/mo)
- Free tier generous enough to be useful (unlike 5 recipes/month limits)
- Annual discount encourages commitment (£49 vs £59.88)

---

## Conclusion

### The Core Strategy

**Build a laser-focused UK recipe platform that does 4 things brilliantly:**

1. **Generate recipes from available ingredients** (reduce waste, solve "what's for dinner?")
2. **Personalize meal planning** (fit real life, respect restrictions)
3. **Auto-generate shopping lists** (save time, consolidate ingredients)
4. **Ensure dietary safety** (allergies, restrictions, compliance)

**Do NOT build:** Social features, video recipes, nutrition tracking, pantry inventory, family profiles

**Competitive Advantage:**
- ✅ UK-first (metric, British ingredients, local context)
- ✅ Simplicity over breadth (4 features done excellently)
- ✅ Fast to market (16 weeks vs 35 weeks with bloat)
- ✅ FREE data (Open Food Facts, USDA)
- ✅ Low operating cost (£80/month for 1,000 users)
- ✅ GDPR-compliant from day one

### Next Steps

**This Week:**
1. Review this strategy document with stakeholders
2. Finalize scope (confirm what NOT to build)
3. Set up development environment
4. Create project board (GitHub Projects or similar)

**Week 1 of Development:**
5. Database schema implementation
6. Supabase project setup
7. Next.js project structure
8. UI component library integration

**By Month 3:**
9. Launch private beta
10. Gather user feedback
11. Iterate based on real usage
12. Prepare for public launch

### Success Criteria

**You'll know this strategy is working when:**
- Users complete onboarding in < 90 seconds
- 60%+ save at least one recipe in first session
- 30-day retention exceeds 8% (vs 3.93% industry)
- Users say "finally, a simple recipe app!"
- Zero food safety incidents
- Operating costs remain under £100/month

### The Ultimate Vision

> Build the UK's go-to simple recipe assistant that people trust, love, and use weekly—not because it has the most features, but because it does the essential things so well that everything else feels like clutter.

---

**Document Status:** Final Strategy ✅
**Next Review:** After Private Beta (Week 14)
**Living Document:** Update as you learn from real users

**Remember:** "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupéry

---

*End of Strategy Document*