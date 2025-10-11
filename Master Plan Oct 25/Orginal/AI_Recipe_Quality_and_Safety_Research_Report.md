# AI Recipe Quality and Safety: Research Report
## Comprehensive Guide for UK Recipe Platform Implementation

**Date:** January 2025
**Version:** 1.0

---

## Executive Summary

AI-generated recipes pose significant quality and safety risks, ranging from poor ingredient combinations to potentially dangerous cooking instructions. This report synthesizes industry research, regulatory requirements, and technical solutions to create a practical safety framework for a UK-based recipe platform.

**Key Findings:**
- AI recipe failures are well-documented across major platforms (Apple, Google, Samsung)
- Critical safety validation must include temperature checks, allergen detection, and instruction completeness
- UK localization requires explicit prompt engineering and validation layers
- Multi-step AI generation with critique/refinement significantly improves quality
- MVP should prioritize 5-7 critical safety checks before launch

---

## 1. AI Recipe Quality Problems: Evidence and Impact

### 1.1 Documented Issues Across Platforms

**Industry Problem Statement:**
Major tech companies (Apple, Google, Samsung) are integrating AI recipe generation into virtual assistants like Siri, but early implementations reveal serious quality issues.

**Source:** NPR (September 2024) - "AI can generate recipes that can be deadly. Food bloggers are not happy"
**URL:** https://www.npr.org/2024/09/23/g-s1-23843/artificial-intelligence-recipes-food-cooking-apple

**Specific Problems Identified:**

1. **Dangerous Ingredient Combinations**
   - Example: Neural net-generated "Chocolate Baked and Serves" contained **A CUP OF HORSERADISH** in brownies
   - Source: AI Weirdness blog
   - Impact: Inedible results, wasted ingredients, user distrust

2. **Missing Critical Ingredients**
   - AI recipes often lack fundamental components (flour in baking, core proteins)
   - Vague or missing measurements
   - Source: FODMAP Everyday, Pretty Simple Sweet

3. **Instruction Quality Issues**
   - Incomplete cooking steps
   - Missing temperature specifications
   - Unclear timing guidance
   - Illogical step sequencing

4. **Fundamental AI Limitations**
   - AI doesn't taste, smell, or improvise based on sensory feedback
   - Lacks culinary intuition and understanding of flavor compatibility
   - Cannot adjust based on visual cues during cooking

### 1.2 User Impact and Trust Concerns

**Washington Post Analysis (March 2024):**
"AI recipes are everywhere — but can you trust them?"
- Recommendation: Double-check all AI-generated recipes
- Food bloggers express professional and safety concerns
- **URL:** https://www.washingtonpost.com/food/2024/03/07/ai-recipes-generative-instacart-food-photos/

**Trust Research Findings:**
- No difference in trust between AI and traditional recipes for **standard dishes**
- **Significantly lower trust** in AI for innovative/creative recipes
- Source: "Would you trust an AI chef?" (ScienceDirect 2024)

**Real-World Testing:**
- Sugar Spun Run: "Are AI Recipes Actually Any Good? I Put One to the Test"
- Thrive Market: "Do AI Recipes Work? We Tried 3 AI Recipe Generators to Find Out"
- General consensus: Results range from "bland and boring to downright dangerous"

### 1.3 Industry Response

**Negative Press Dominance:**
"Most of the press up to this point about the relationship between AI and cooking has been negative." Food bloggers view this as both a safety concern and professional threat.

**Food Safety Perspective:**
The lack of sensory perception and culinary intuition can lead to recipes that are "at best unappetizing and at worst potentially harmful."

---

## 2. Quality Improvement Strategies

### 2.1 Prompt Engineering Approaches

#### Core Principles for Recipe Generation

**Claude 4 Best Practices** (Anthropic Documentation):
- Claude 4 models are trained for "more precise instruction following" than previous generations
- Key strength: Pays close attention to details and examples
- **URL:** https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices

**GPT-4.1 Characteristics:**
- "Trained to follow instructions more closely and literally than predecessors"
- Highly steerable with well-specified prompts
- Adapts fluently to anchored prompts with clear formatting

**Three Core Strategies:**
1. **Provide Context** - Assign AI a specific role and culinary expertise level
2. **Be Specific** - Explicitly state all constraints and requirements
3. **Build on Conversation** - Use multi-turn dialogue for refinement

#### XML-Based Structured Prompts (Claude Advantage)

**Research Finding:** Claude was **12% more likely** to adhere to all specified elements when using XML format vs. other formats.

**Recommended Structure:**
```xml
<role>
You are a professional UK-based chef with 15 years of experience in British cuisine.
</role>

<context>
You will generate recipes using British ingredients, metric measurements, and UK terminology.
All recipes must be safe, tested, and practical for home cooks.
</context>

<ingredients>
Available ingredients: [list]
</ingredients>

<constraints>
- Servings: 4
- Maximum time: 45 minutes
- Dietary requirements: [list]
- Difficulty: Easy
</constraints>

<uk_requirements>
- Use ONLY British ingredient names (courgette NOT zucchini, aubergine NOT eggplant)
- All measurements in metric (grams, ml, Celsius)
- No cups or Fahrenheit temperatures
- British cooking terminology (grill = broiler, etc.)
</uk_requirements>

<safety_requirements>
- All meat/poultry with safe minimum internal temperatures
- Allergen warnings for: nuts, dairy, gluten, shellfish, eggs, soy, sesame, fish
- Cooking times and temperatures must be specific
- Cross-contamination warnings where applicable
</safety_requirements>

<output_format>
Return ONLY valid JSON matching this schema:
{JSON schema here}
</output_format>

<validation_rules>
1. Every ingredient must have a quantity and unit
2. Every instruction must be actionable and specific
3. Temperature must be in Celsius with specific values
4. Cooking times must include both prep and cook time
5. Include resting time if applicable
</validation_rules>
```

**Source:** Anthropic Documentation - "Use XML tags to structure your prompts"
**URL:** https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags

#### Key Prompt Components

**From AWS Prompt Engineering Guide:**

1. **Task Context** - Assign the LLM a specific role
2. **Tone Context** - Specify the style (professional, approachable, etc.)
3. **Background Data** - Provide relevant culinary knowledge
4. **Detailed Task Description** - Include all rules and constraints

**Example for UK Recipe Generation:**
```
You are a professional UK chef specializing in British home cooking.

Generate a recipe that:
- Uses ONLY the provided ingredients plus common UK pantry staples
- Employs British terminology (courgette, aubergine, coriander)
- Uses metric measurements exclusively (grams, milliliters, Celsius)
- Includes specific temperatures in Celsius (e.g., 180°C, not "medium heat")
- Provides clear timing (e.g., "15 minutes" not "until golden")
- Ensures food safety with proper cooking temperatures
- Lists all allergens present in the recipe
```

### 2.2 Validation Techniques (Ranked by Importance)

#### CRITICAL (MUST-HAVE for MVP)

**1. Temperature Safety Validation**

**FDA/USDA Safe Minimum Internal Temperatures:**
- **Poultry (all types):** 165°F / 74°C
- **Ground meats (beef, pork, lamb):** 160°F / 71°C
- **Beef, pork, lamb steaks/chops:** 145°F / 63°C with 3-minute rest
- **Fish and seafood:** 145°F / 63°C (flesh opaque, separates with fork)
- **Eggs and egg dishes:** 160°F / 71°C
- **Leftovers and casseroles:** 165°F / 74°C

**Source:** USDA Food Safety and Inspection Service
**URL:** https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart

**Implementation:**
```typescript
interface TemperatureRule {
  ingredients: string[];
  minTemp: number; // Celsius
  unit: 'internal' | 'oven';
  requiredRestTime?: number; // minutes
}

const SAFETY_TEMPERATURES: TemperatureRule[] = [
  {
    ingredients: ['chicken', 'turkey', 'duck', 'goose', 'poultry'],
    minTemp: 74,
    unit: 'internal'
  },
  {
    ingredients: ['minced beef', 'ground beef', 'mince', 'burger'],
    minTemp: 71,
    unit: 'internal'
  },
  {
    ingredients: ['beef steak', 'pork chop', 'lamb chop'],
    minTemp: 63,
    unit: 'internal',
    requiredRestTime: 3
  },
  // ... etc
];

function validateCookingTemperature(recipe: Recipe): ValidationResult {
  const errors: string[] = [];

  // Check if recipe contains temperature-sensitive ingredients
  for (const rule of SAFETY_TEMPERATURES) {
    const hasIngredient = recipe.ingredients.some(ing =>
      rule.ingredients.some(keyword =>
        ing.item.toLowerCase().includes(keyword)
      )
    );

    if (hasIngredient) {
      // Verify instructions mention appropriate temperature
      const hasValidTemp = recipe.instructions.some(step =>
        step.instruction.match(new RegExp(`${rule.minTemp}[°]?C`, 'i'))
      );

      if (!hasValidTemp) {
        errors.push(
          `SAFETY: Recipe contains ${rule.ingredients[0]} but doesn't specify ` +
          `minimum safe temperature of ${rule.minTemp}°C`
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
```

**2. Allergen Detection and Labeling**

**UK/FDA Major Allergens (9 categories):**
1. Milk
2. Eggs
3. Fish
4. Crustacean shellfish
5. Tree nuts
6. Peanuts
7. Wheat
8. Soybeans
9. Sesame (added as 9th allergen in 2023)

**Source:** FDA Food Allergies
**URL:** https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies

**Implementation:**
```typescript
interface AllergenRule {
  name: string;
  keywords: string[];
  crossContamination?: string[]; // ingredients that often share equipment
}

const ALLERGEN_DATABASE: AllergenRule[] = [
  {
    name: 'Tree Nuts',
    keywords: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut',
               'macadamia', 'brazil nut', 'pine nut'],
    crossContamination: ['peanut']
  },
  {
    name: 'Dairy',
    keywords: ['milk', 'butter', 'cheese', 'cream', 'yogurt', 'yoghurt',
               'ghee', 'paneer', 'whey', 'casein']
  },
  {
    name: 'Gluten',
    keywords: ['wheat', 'flour', 'bread', 'pasta', 'couscous', 'bulgur',
               'semolina', 'spelt', 'rye', 'barley']
  },
  {
    name: 'Shellfish',
    keywords: ['prawn', 'shrimp', 'crab', 'lobster', 'crayfish', 'langoustine',
               'scallop', 'mussel', 'oyster', 'clam']
  },
  // ... etc
];

function detectAllergens(recipe: Recipe): string[] {
  const detected = new Set<string>();

  for (const ingredient of recipe.ingredients) {
    const itemLower = ingredient.item.toLowerCase();

    for (const allergen of ALLERGEN_DATABASE) {
      if (allergen.keywords.some(keyword => itemLower.includes(keyword))) {
        detected.add(allergen.name);
      }
    }
  }

  return Array.from(detected).sort();
}
```

**3. Recipe Completeness Validation**

**Based on USDA Standardized Recipe Requirements:**

A standardized recipe must include:
- Total yield
- Portion size
- Exact ingredient quantities (except spices "to taste")
- Preparation procedures with specific directions
- Cooking temperatures and times

**Source:** CACFP Recipe Standardization Guide
**URL:** https://www.cacfp.org/2024/07/02/recipe-standardization-guide/

**Implementation Checklist:**
```typescript
interface CompletenessCheck {
  field: string;
  check: (recipe: Recipe) => boolean;
  errorMessage: string;
  severity: 'error' | 'warning';
}

const COMPLETENESS_CHECKS: CompletenessCheck[] = [
  {
    field: 'name',
    check: (r) => !!r.name && r.name.length >= 3,
    errorMessage: 'Recipe name is required (minimum 3 characters)',
    severity: 'error'
  },
  {
    field: 'servings',
    check: (r) => r.servings > 0 && r.servings <= 50,
    errorMessage: 'Servings must be between 1 and 50',
    severity: 'error'
  },
  {
    field: 'ingredients',
    check: (r) => r.ingredients.length >= 2,
    errorMessage: 'Recipe must have at least 2 ingredients',
    severity: 'error'
  },
  {
    field: 'ingredients_quantities',
    check: (r) => r.ingredients.every(ing =>
      ing.quantity !== null && ing.unit !== null
    ),
    errorMessage: 'All ingredients must have quantity and unit specified',
    severity: 'error'
  },
  {
    field: 'instructions',
    check: (r) => r.instructions.length >= 2,
    errorMessage: 'Recipe must have at least 2 instruction steps',
    severity: 'error'
  },
  {
    field: 'instruction_clarity',
    check: (r) => r.instructions.every(step =>
      step.instruction.split(' ').length >= 5
    ),
    errorMessage: 'Each instruction must be at least 5 words (too vague otherwise)',
    severity: 'warning'
  },
  {
    field: 'timing',
    check: (r) => r.prep_time !== null || r.cook_time !== null,
    errorMessage: 'Recipe must include either prep time or cook time',
    severity: 'error'
  },
  {
    field: 'timing_reasonable',
    check: (r) => {
      const total = (r.prep_time || 0) + (r.cook_time || 0);
      return total >= 5 && total <= 480; // 5 min to 8 hours
    },
    errorMessage: 'Total time seems unrealistic (must be 5 min - 8 hours)',
    severity: 'warning'
  }
];
```

**4. Ingredient Quantity Sanity Checks**

**Professional Chef Standards:**
- Use weight (grams) rather than volume for accuracy
- Digital scales essential
- "A cup of flour can vary in weight by 20% depending on how it's packed"

**Source:** The Culinary Pro
**URL:** https://www.theculinarypro.com/culinary-ratios

**Common Baking Ratios (for validation):**
```typescript
interface RatioRule {
  name: string;
  ingredients: { [key: string]: number }; // ratio by weight
  tolerance: number; // acceptable deviation %
}

const BAKING_RATIOS: RatioRule[] = [
  {
    name: 'Shortbread',
    ingredients: { sugar: 1, butter: 2, flour: 3 },
    tolerance: 0.2
  },
  {
    name: 'Basic Cookie Dough',
    ingredients: { sugar: 1, butter: 2, flour: 3 },
    tolerance: 0.25
  },
  {
    name: 'Victoria Sponge',
    ingredients: { butter: 1, sugar: 1, flour: 1, eggs: 1 },
    tolerance: 0.15
  }
];

// Leavening ratio check
const BAKING_POWDER_RATIO = {
  perCupFlour: 5, // mL (1 tsp)
  tolerance: 0.3
};

const BAKING_SODA_RATIO = {
  perCupFlour: 1.25, // mL (1/4 tsp) when acidic ingredients present
  tolerance: 0.2
};
```

#### IMPORTANT (SHOULD-HAVE for MVP+1)

**5. UK Ingredient Terminology Validation**

**British vs American Terms:**

| UK Term | US Term | Category |
|---------|---------|----------|
| Courgette | Zucchini | Vegetable |
| Aubergine | Eggplant | Vegetable |
| Coriander (leaf) | Cilantro | Herb |
| Coriander (seed) | Coriander | Spice |
| Spring onion | Scallion | Vegetable |
| Rocket | Arugula | Salad |
| Mangetout | Snow peas | Vegetable |
| Swede | Rutabaga | Vegetable |
| Prawns | Shrimp | Seafood |
| Caster sugar | Superfine sugar | Baking |
| Icing sugar | Powdered sugar | Baking |
| Single cream | Light cream | Dairy |
| Double cream | Heavy cream | Dairy |
| Cornflour | Cornstarch | Thickener |

**Source:** Amica International - Translating Transatlantic Foods
**URL:** https://www.amica-international.co.uk/blog/translating-transatlantic-foods

**Implementation:**
```typescript
const UK_US_DICTIONARY: Record<string, string> = {
  'zucchini': 'courgette',
  'eggplant': 'aubergine',
  'cilantro': 'coriander',
  'scallion': 'spring onion',
  'arugula': 'rocket',
  // ... etc
};

function enforceUKTerminology(recipe: Recipe): Recipe {
  const updatedIngredients = recipe.ingredients.map(ing => {
    let item = ing.item.toLowerCase();

    for (const [useTerm, ukTerm] of Object.entries(UK_US_DICTIONARY)) {
      if (item.includes(useTerm)) {
        item = item.replace(new RegExp(useTerm, 'gi'), ukTerm);
      }
    }

    return { ...ing, item };
  });

  return { ...recipe, ingredients: updatedIngredients };
}
```

**6. Measurement System Validation**

**UK Measurement Standards:**
- Weight: grams (g), kilograms (kg)
- Volume: milliliters (ml), liters (l)
- Temperature: Celsius (°C), Gas Mark
- Small quantities: tablespoons (tbsp), teaspoons (tsp)

**British recipes NEVER use cups for dry ingredients** - everything is weighed.

**Source:** Doves Farm Conversion Tables
**URL:** https://www.dovesfarm.co.uk/hints-&-tips/imperial-to-metric-conversion-tables

**Implementation:**
```typescript
const FORBIDDEN_UNITS = ['cups', 'oz', 'fahrenheit', 'f'];
const ALLOWED_UNITS = [
  'g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms',
  'ml', 'millilitre', 'millilitres', 'milliliter', 'milliliters',
  'l', 'litre', 'litres', 'liter', 'liters',
  'tbsp', 'tablespoon', 'tablespoons',
  'tsp', 'teaspoon', 'teaspoons',
  'pinch', 'handful', 'to taste'
];

function validateUKMeasurements(recipe: Recipe): ValidationResult {
  const errors: string[] = [];

  for (const ing of recipe.ingredients) {
    if (!ing.unit) continue;

    const unitLower = ing.unit.toLowerCase();

    if (FORBIDDEN_UNITS.some(forbidden => unitLower.includes(forbidden))) {
      errors.push(
        `Ingredient "${ing.item}" uses non-UK unit "${ing.unit}". ` +
        `Please use metric measurements.`
      );
    }
  }

  // Check for Fahrenheit in instructions
  for (const step of recipe.instructions) {
    if (step.instruction.match(/\d+\s*[°]?f\b/i)) {
      errors.push(
        `Step ${step.step_number} uses Fahrenheit temperature. ` +
        `Use Celsius instead.`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}
```

**7. Nutritional Reasonableness Checks**

**Using Open Food Facts API:**

Open Food Facts provides:
- NOVA group classification (food ultra-processing)
- Additives detection
- Allergen identification
- Normalized ingredients
- Vegan/vegetarian status
- Nutri-Score (if nutritional values provided)

**Source:** Open Food Facts API Documentation
**URL:** https://openfoodfacts.github.io/openfoodfacts-server/api/

**Commercial Alternatives:**
- **FatSecret Platform API** - USDA-sourced data with manual verification
- **CalorieNinjas API** - Natural language processing for nutrition extraction
- **Spoonacular API** - Knows dietary implications (e.g., Worcestershire sauce → not vegetarian)

**Validation approach:**
```typescript
async function validateNutrition(recipe: Recipe): Promise<ValidationResult> {
  const warnings: string[] = [];

  // Estimate calories per serving
  const estimatedCalories = await estimateCaloriesFromIngredients(recipe.ingredients);

  if (estimatedCalories < 100) {
    warnings.push('Recipe seems unusually low in calories - may be incomplete');
  }

  if (estimatedCalories > 2000) {
    warnings.push('Recipe is very high in calories - ensure portion size is correct');
  }

  return { valid: true, warnings };
}
```

#### NICE-TO-HAVE (Future Enhancements)

**8. Cross-Referencing with Recipe Databases**

- Check if AI "hallucinated" or simply copied an existing recipe
- Verify against known recipe databases (BBC Good Food, Jamie Oliver, etc.)
- "When an AI recipe turns out well, it's because AI stole it from a genuine creator"

**9. Seasonal Ingredient Validation**

- Flag out-of-season ingredients (e.g., fresh strawberries in January)
- Suggest seasonal alternatives
- Requires UK seasonal ingredient database

**10. Cost Estimation**

- Estimate recipe cost based on UK supermarket prices
- Flag unusually expensive ingredients
- Suggest budget alternatives

### 2.3 Multi-Step AI Generation Workflow

#### Constitutional AI Approach (Anthropic)

**Core Concept:** AI systems can improve through self-critique and refinement based on explicit principles.

**Source:** Anthropic - "Constitutional AI: Harmlessness from AI Feedback"
**URL:** https://www.anthropic.com/news/claudes-constitution
**Research Paper:** https://arxiv.org/abs/2212.08073

**Two-Phase Process:**

**Phase 1: Supervised Learning (Critique → Revise → Learn)**

1. **Generation:** AI creates initial recipe
2. **Self-Critique:** AI evaluates against "constitution" (safety rules)
3. **Revision:** AI corrects identified issues

**Phase 2: Reinforcement Learning from AI Feedback (RLAIF)**

- AI compares responses for constitutional compliance
- Creates feedback dataset
- Trains preference model based on safety principles

**Implementation for Recipes:**

```typescript
async function generateRecipeWithCritique(params: RecipeParams): Promise<Recipe> {
  // Step 1: Initial generation
  const initialRecipe = await generateRecipe(params);

  // Step 2: Self-critique
  const critiquePrompt = `
    <role>You are a food safety and recipe quality expert.</role>

    <task>
    Evaluate this recipe for:
    1. Safety issues (cooking temperatures, dangerous combinations)
    2. Completeness (missing steps, vague instructions)
    3. UK compliance (terminology, measurements)
    4. Practicality (realistic timing, achievable for home cooks)
    </task>

    <recipe>
    ${JSON.stringify(initialRecipe, null, 2)}
    </recipe>

    <output>
    Provide JSON with:
    {
      "safety_issues": ["list of safety problems"],
      "completeness_issues": ["list of missing/vague elements"],
      "uk_compliance_issues": ["terminology or measurement problems"],
      "practicality_issues": ["unrealistic or unclear elements"],
      "overall_assessment": "safe" | "needs_revision" | "unsafe"
    }
    </output>
  `;

  const critique = await getCritique(critiquePrompt);

  // Step 3: Revision (if needed)
  if (critique.overall_assessment !== 'safe') {
    const revisionPrompt = `
      <original_recipe>
      ${JSON.stringify(initialRecipe, null, 2)}
      </original_recipe>

      <identified_issues>
      ${JSON.stringify(critique, null, 2)}
      </identified_issues>

      <task>
      Revise the recipe to address all identified issues while maintaining
      the original intent. Ensure the revised recipe is safe, complete,
      UK-compliant, and practical.
      </task>
    `;

    return await generateRecipe(revisionPrompt);
  }

  return initialRecipe;
}
```

**Benefits:**
- Catches AI errors before they reach users
- Improves over time through feedback
- More reliable than single-pass generation

**Limitations:**
- Adds latency (2-3x generation time)
- Increases API costs
- Still requires human validation for critical safety

### 2.4 Dual AI Comparison (OpenAI vs Anthropic)

**Current Implementation:** Your app uses GPT-4.1

**Potential Enhancement:** Generate with both, compare results

```typescript
async function dualGeneration(params: RecipeParams): Promise<Recipe> {
  const [gptRecipe, claudeRecipe] = await Promise.all([
    generateWithGPT(params),
    generateWithClaude(params)
  ]);

  // Compare key safety metrics
  const comparison = {
    gpt_safety: validateSafety(gptRecipe),
    claude_safety: validateSafety(claudeRecipe),
    gpt_completeness: validateCompleteness(gptRecipe),
    claude_completeness: validateCompleteness(claudeRecipe)
  };

  // Return safer/more complete option
  // Or present both to user for selection
}
```

**Consideration:** This doubles API costs but may reduce safety incidents.

---

## 3. UK Localization Strategy

### 3.1 Ingredient Terminology Enforcement

**Strategy 1: Prompt Engineering (Primary)**

Add explicit UK terminology requirements to system prompt:

```xml
<uk_terminology_requirements>
You MUST use British ingredient names exclusively:

REQUIRED UK TERMS (examples):
- Courgette (NEVER zucchini)
- Aubergine (NEVER eggplant)
- Coriander leaves (NEVER cilantro)
- Spring onion (NEVER scallion)
- Rocket (NEVER arugula)
- Mangetout (NEVER snow peas)
- Prawns (NEVER shrimp for large ones)
- Caster sugar (NEVER superfine sugar)
- Icing sugar (NEVER powdered sugar)
- Cornflour (NEVER cornstarch)

MEASUREMENT REQUIREMENTS:
- All weights in grams (g) or kilograms (kg)
- All volumes in millilitres (ml) or litres (l)
- All temperatures in Celsius (°C)
- NEVER use cups, ounces, or Fahrenheit
- For small amounts: tablespoons (tbsp) or teaspoons (tsp) acceptable

COOKING TERMINOLOGY:
- Grill = overhead heat (US "broil")
- Hob = stovetop (US "burner")
- Kitchen paper = paper towels
- Cling film = plastic wrap
</uk_terminology_requirements>
```

**Strategy 2: Post-Generation Replacement (Secondary)**

If AI still uses US terms, automatically replace:

```typescript
const UK_TERMINOLOGY_MAP: Record<string, string> = {
  // Vegetables
  'zucchini': 'courgette',
  'eggplant': 'aubergine',
  'scallion': 'spring onion',
  'snow peas': 'mangetout',
  'arugula': 'rocket',
  'rutabaga': 'swede',

  // Herbs & Spices
  'cilantro': 'coriander',

  // Seafood
  'shrimp': 'prawns', // context-dependent

  // Baking
  'superfine sugar': 'caster sugar',
  'powdered sugar': 'icing sugar',
  'confectioners sugar': 'icing sugar',
  'cornstarch': 'cornflour',
  'all-purpose flour': 'plain flour',

  // Dairy
  'heavy cream': 'double cream',
  'light cream': 'single cream',

  // Cooking Terms
  'broil': 'grill',
  'broiling': 'grilling',
  'stovetop': 'hob',
  'burner': 'hob',
  'plastic wrap': 'cling film',
  'paper towels': 'kitchen paper'
};

function replaceUSTerminology(text: string): string {
  let result = text;

  for (const [usTerm, ukTerm] of Object.entries(UK_TERMINOLOGY_MAP)) {
    // Case-insensitive replacement
    const regex = new RegExp(`\\b${usTerm}\\b`, 'gi');
    result = result.replace(regex, ukTerm);
  }

  return result;
}
```

**Strategy 3: UK Ingredient Reference Database**

**Official Source:** McCance and Widdowson's Composition of Foods Integrated Dataset (CoFID)
- Provides information on nutrient content of UK food supply
- Available through GOV.UK

**URL:** https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid

**Usage:**
- Validate that ingredients exist in UK market
- Cross-reference nutritional data
- Ensure UK-appropriate substitutions

### 3.2 Measurement System Handling

**Conversion Factors (for reference, but AVOID needing these):**

```typescript
const CONVERSIONS = {
  // Temperature
  celsiusToFahrenheit: (c: number) => (c * 9/5) + 32,
  fahrenheitToCelsius: (f: number) => (f - 32) * 5/9,

  // Weight
  gramsToOunces: (g: number) => g / 28.349523125,
  ouncesToGrams: (oz: number) => oz * 28.349523125,
  kilogramsToPounds: (kg: number) => kg * 2.2046,

  // Volume (UK vs US pints differ!)
  ukPintToMl: (pints: number) => pints * 568,  // UK pint = 568ml
  usPintToMl: (pints: number) => pints * 473,  // US pint = 473ml

  // UK fluid ounce = 28.4ml
  // US fluid ounce = 29.6ml
};
```

**Best Practice:** Never generate in US units then convert. Always generate directly in UK metric.

### 3.3 Prompt Engineering Templates

**Template 1: UK Recipe Generation (Standard)**

```typescript
const UK_RECIPE_PROMPT_TEMPLATE = `
<role>
You are an experienced British home cook and food writer with deep knowledge
of UK ingredients, measurements, and cooking terminology. You create recipes
specifically for the UK market.
</role>

<context>
The user wants a recipe for British home cooks using ingredients readily
available in UK supermarkets like Tesco, Sainsbury's, or Asda.
</context>

<available_ingredients>
{{INGREDIENTS_LIST}}
</available_ingredients>

<requirements>
- Servings: {{SERVINGS}}
{{#if DIETARY_PREFERENCES}}
- Dietary requirements: {{DIETARY_PREFERENCES}}
{{/if}}
{{#if MAX_TIME}}
- Maximum total time: {{MAX_TIME}} minutes
{{/if}}
{{#if DIFFICULTY}}
- Difficulty level: {{DIFFICULTY}}
{{/if}}
</requirements>

<uk_standards>
INGREDIENT TERMINOLOGY:
- Use ONLY British names (courgette NOT zucchini, aubergine NOT eggplant, etc.)
- Reference UK brands when helpful (e.g., "Maldon sea salt" not just "sea salt")

MEASUREMENTS:
- All quantities in metric: grams (g), millilitres (ml), litres (l)
- Temperatures ONLY in Celsius (°C)
- Small amounts: tablespoons (tbsp), teaspoons (tsp)
- NEVER use cups, ounces, or Fahrenheit

COOKING TERMS:
- "Grill" = overhead heat (not US stovetop grill)
- "Hob" = stovetop
- "Kitchen paper" = paper towels
- "Cling film" = plastic wrap
</uk_standards>

<safety_requirements>
FOOD SAFETY:
- Poultry: must reach 74°C internal temperature
- Minced beef/pork: must reach 71°C internal temperature
- Fish: must reach 63°C (flesh opaque and flakes easily)
- Include resting time where applicable (e.g., 3 minutes for steaks)

ALLERGENS:
- List ALL allergens present (nuts, dairy, gluten, shellfish, eggs, soy, sesame, fish)
- Use format: "Allergens: Contains dairy, gluten, eggs"

CLARITY:
- Every ingredient must have specific quantity and unit
- Every step must be clear and actionable
- Include visual or tactile cues (e.g., "until golden brown", "when bubbles appear")
- Specify exact temperatures and times
</safety_requirements>

<output_format>
Return ONLY valid JSON (no markdown, no explanation):

{
  "name": "Recipe name (appealing, descriptive)",
  "description": "1-2 sentence description of the dish",
  "prep_time": <number in minutes>,
  "cook_time": <number in minutes>,
  "servings": {{SERVINGS}},
  "difficulty": "easy" | "medium" | "hard",
  "allergens": ["list", "of", "allergens"],
  "ingredients": [
    {
      "item": "ingredient name with UK terminology",
      "quantity": <number>,
      "unit": "g | ml | tbsp | tsp | etc.",
      "notes": "preparation notes (chopped, at room temperature, etc.)"
    }
  ],
  "instructions": [
    {
      "step_number": 1,
      "instruction": "Clear, specific instruction with temperatures and times"
    }
  ],
  "cook_tips": [
    "helpful tips for success (optional but recommended)"
  ]
}
</output_format>

<validation>
Before returning, verify:
1. All ingredients have British names
2. All measurements are metric
3. All temperatures are in Celsius
4. Safety temperatures are included for meat/poultry/fish
5. Instructions are clear and sequential
6. Allergens are listed
</validation>
`;
```

**Template 2: Recipe Critique (Quality Check)**

```typescript
const UK_RECIPE_CRITIQUE_PROMPT = `
<role>
You are a UK food safety inspector and professional recipe editor.
</role>

<task>
Evaluate this recipe for UK market suitability and safety.
</task>

<recipe>
{{RECIPE_JSON}}
</recipe>

<evaluation_criteria>

1. TERMINOLOGY COMPLIANCE:
   - Are all ingredients using British names?
   - Flag any American terms (zucchini, eggplant, cilantro, etc.)

2. MEASUREMENT COMPLIANCE:
   - Are all measurements metric (g, ml, °C)?
   - Flag any imperial/US units (cups, oz, Fahrenheit)

3. FOOD SAFETY:
   - Do meat/poultry dishes specify minimum safe temperatures?
   - Are cooking times realistic and safe?
   - Any dangerous ingredient combinations?

4. COMPLETENESS:
   - Does every ingredient have quantity + unit?
   - Are instructions clear and sequential?
   - Is timing information complete (prep + cook)?

5. ALLERGEN COMPLIANCE:
   - Are all major allergens identified?
   - Should there be cross-contamination warnings?

6. PRACTICALITY:
   - Are ingredients available in UK supermarkets?
   - Is the recipe achievable for home cooks?
   - Are times and temperatures realistic?

</evaluation_criteria>

<output_format>
Return JSON:
{
  "overall_status": "approved" | "needs_revision" | "rejected",
  "terminology_issues": ["list of non-UK terms found"],
  "measurement_issues": ["list of non-metric measurements"],
  "safety_issues": ["critical safety problems"],
  "completeness_issues": ["missing or vague elements"],
  "allergen_issues": ["missing or incorrect allergen info"],
  "practicality_issues": ["unrealistic elements"],
  "recommended_fixes": ["specific suggestions for improvement"]
}
</output_format>
`;
```

### 3.4 Reference Data Sources

**1. Official UK Government Resources**
- **CoFID Database:** Composition of Foods Integrated Dataset
- **FSA (Food Standards Agency):** Food safety regulations and allergen guidance
- **URL:** https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses

**2. UK Supermarket APIs (Future Integration)**
- Tesco API
- Sainsbury's API
- Asda/Walmart API
- Validate ingredient availability and pricing

**3. Community Resources**
- **Seasoned Advice (Stack Exchange):** UK/US cooking term translations
- **British Recipe Collection:** Comprehensive ingredient translation guide
- **URL:** https://www.britishrecipecollection.com/uk_to_usa_ingredient_translation.html

**4. Commercial Recipe Platforms (for benchmarking)**
- BBC Good Food (UK-focused, metric measurements)
- Jamie Oliver (UK chef, British terminology)
- Nigella Lawson (British style and measurements)

---

## 4. Safety Framework

### 4.1 Critical Safety Checks (MUST-HAVE for MVP)

#### 1. Temperature Safety Validation

**Priority:** CRITICAL
**Risk Level:** High (foodborne illness, legal liability)

**Implementation:**
- Validate all recipes containing meat, poultry, seafood, eggs
- Cross-reference against FDA/USDA minimum temperatures
- Automated check in validation pipeline
- Block publication if check fails

**Code Example:** See section 2.2, Validation Technique #1

**Estimated Effort:** 2-3 days (database + validation logic)

---

#### 2. Allergen Detection and Labeling

**Priority:** CRITICAL
**Risk Level:** High (allergic reactions, legal liability)

**UK Legal Requirement:**
Food Standards Agency requires allergen labeling for all 14 major allergens.

**Implementation:**
- Scan all ingredients against allergen keyword database
- Auto-generate allergen warning list
- Prompt user to review allergens before publishing
- Display allergens prominently in recipe view

**Code Example:** See section 2.2, Validation Technique #2

**Estimated Effort:** 3-4 days (comprehensive allergen database + UI)

---

#### 3. Ingredient Quantity Validation

**Priority:** CRITICAL
**Risk Level:** Medium (recipe failure, user frustration)

**Implementation:**
- Ensure every ingredient has quantity + unit
- Flag suspicious quantities (e.g., 10kg of salt for 4 servings)
- Validate against known culinary ratios for baking

**Validation Rules:**
```typescript
const QUANTITY_SANITY_CHECKS = [
  {
    ingredient_pattern: /salt/i,
    max_per_serving: 10, // grams
    warning: 'Salt quantity seems very high - health concern'
  },
  {
    ingredient_pattern: /sugar/i,
    max_per_serving: 150, // grams
    warning: 'Sugar quantity seems excessive'
  },
  {
    ingredient_pattern: /flour/i,
    min_per_serving: 20, // grams
    max_per_serving: 500,
    warning: 'Flour quantity seems unusual'
  }
];
```

**Estimated Effort:** 2 days

---

#### 4. Recipe Completeness Validation

**Priority:** CRITICAL
**Risk Level:** Medium (poor user experience)

**Implementation:**
- Name, servings, ingredients, instructions all required
- Minimum 2 ingredients, minimum 2 steps
- All ingredients must have quantities (except "to taste")
- At least one timing field (prep or cook)

**Code Example:** See section 2.2, Validation Technique #3

**Estimated Effort:** 1-2 days

---

#### 5. Instruction Clarity Check

**Priority:** HIGH
**Risk Level:** Medium (recipe failure, confusion)

**Implementation:**
- Minimum word count per instruction (≥5 words)
- Flag vague terms ("cook until done" → needs specificity)
- Ensure sequential numbering
- Check for timing information in instructions

**Vague Term Detection:**
```typescript
const VAGUE_TERMS = [
  'until done',
  'until ready',
  'until cooked',
  'medium heat', // without °C
  'hot oven', // without °C
  'cook thoroughly', // without time/temp
];

function detectVagueInstructions(instructions: Instruction[]): string[] {
  const warnings: string[] = [];

  for (const step of instructions) {
    for (const vagueTerm of VAGUE_TERMS) {
      if (step.instruction.toLowerCase().includes(vagueTerm)) {
        warnings.push(
          `Step ${step.step_number} contains vague term "${vagueTerm}". ` +
          `Please specify exact temperature or time.`
        );
      }
    }
  }

  return warnings;
}
```

**Estimated Effort:** 2 days

---

### 4.2 Important Safety Checks (SHOULD-HAVE for MVP+1)

#### 6. UK Terminology Compliance

**Priority:** HIGH (for UK market differentiation)
**Risk Level:** Low (confusion, not safety issue)

**Implementation:**
- Flag American ingredient names
- Suggest UK alternatives
- Auto-replace common terms (with user confirmation)

**Estimated Effort:** 2-3 days (comprehensive dictionary)

---

#### 7. Metric Measurement Enforcement

**Priority:** HIGH (for UK market)
**Risk Level:** Low (confusion, recipe failure)

**Implementation:**
- Block cups, ounces, Fahrenheit
- Suggest metric equivalents
- Validate units against allowed list

**Estimated Effort:** 1 day

---

#### 8. Cross-Contamination Warnings

**Priority:** MEDIUM
**Risk Level:** Medium (allergen exposure)

**Example Scenarios:**
- Using same oil for fish and chips (gluten cross-contamination)
- Shared cutting boards for nuts and other ingredients
- May contain traces due to shared kitchen equipment

**Implementation:**
```typescript
function checkCrossContamination(recipe: Recipe): string[] {
  const warnings: string[] = [];

  // Check for allergen + "fried" combination
  const hasAllergen = recipe.allergens.length > 0;
  const hasFrying = recipe.instructions.some(s =>
    s.instruction.toLowerCase().includes('fry')
  );

  if (hasAllergen && hasFrying) {
    warnings.push(
      'Recipe involves frying with allergens present. ' +
      'Add warning about using clean oil to prevent cross-contamination.'
    );
  }

  return warnings;
}
```

**Estimated Effort:** 2 days

---

### 4.3 Nice-to-Have Enhancements (Future Roadmap)

#### 9. Nutritional Analysis

**Priority:** LOW
**Value:** High user value but not safety-critical

**Implementation:**
- Integrate with FatSecret or Spoonacular API
- Calculate per-serving calories, macros, vitamins
- Display Nutri-Score (EU standard)

**Estimated Effort:** 5-7 days (API integration + UI)

---

#### 10. Seasonal Ingredient Flagging

**Priority:** LOW
**Value:** Sustainability, cost optimization

**Implementation:**
- Flag out-of-season ingredients
- Suggest seasonal alternatives
- Requires UK seasonal calendar database

**Estimated Effort:** 3-4 days

---

#### 11. Recipe Originality Check

**Priority:** LOW
**Value:** Intellectual property protection

**Implementation:**
- Compare generated recipe against known recipe databases
- Flag suspiciously similar recipes (potential copyright)
- Detect if AI "copied" vs. "created"

**Estimated Effort:** 7-10 days (web scraping, similarity algorithms)

---

### 4.4 UK Legal and Liability Considerations

#### UK Food Safety Regulations

**Primary Legislation:**
1. **Food Safety Act 1990**
   - Framework for all food legislation
   - Food must not damage health
   - Must be of expected quality
   - Cannot be falsely/misleadingly labeled

2. **General Food Law (Retained EU Regulation 178/2002)**
   - Protects human health and consumer interests
   - Applies to all food production, processing, distribution stages

3. **Consumer Protection Act 1987**
   - Strict liability for defective products
   - Covers food products that cause harm

**Source:** Food Standards Agency
**URL:** https://www.food.gov.uk/business-guidance/general-food-law

---

#### Liability Risk Assessment

**Scenario 1: User follows AI recipe and gets food poisoning**

**Risk Level:** HIGH

**Mitigation:**
- Comprehensive temperature validation (CRITICAL)
- Clear allergen warnings
- Disclaimer in terms of service:
  - "Recipes provided for informational purposes"
  - "Users responsible for food safety"
  - "Always use food thermometer for meat/poultry"
  - "Consult medical professional for allergies"

**Legal Defense:**
- Reasonable care taken (validation systems)
- Clear warnings provided
- User assumption of risk

---

**Scenario 2: Allergen not disclosed, user has reaction**

**Risk Level:** VERY HIGH

**Mitigation:**
- Automated allergen detection (CRITICAL)
- Mandatory allergen review by user before publishing
- Prominent allergen display on recipe
- "May contain traces" warnings

**UK Regulatory Requirement:**
Food businesses have a **legal obligation** to provide allergen information.

**Source:** FSA Allergen Guidance
**URL:** https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses

---

**Scenario 3: Recipe instructions cause kitchen accident (fire, burns)**

**Risk Level:** MEDIUM

**Mitigation:**
- Validate cooking temperatures (no "heat oil to 300°C")
- Flag dangerous techniques (deep frying without warnings)
- General safety disclaimer

---

#### Recommended Disclaimers

**On Recipe Display Page:**
```
⚠️ FOOD SAFETY NOTICE
- Always use a food thermometer for meat and poultry
- Check ingredients for personal allergies
- Cook times may vary based on equipment
- This recipe is AI-generated and should be reviewed for your needs

🔔 ALLERGEN WARNING
This recipe contains: [LIST]
Always check ingredient labels as products may change.
```

**In Terms of Service:**
```
USER RESPONSIBILITIES FOR AI-GENERATED RECIPES

1. Recipe Accuracy: AI-generated recipes are provided as starting points.
   Users are responsible for verifying ingredient quantities, cooking times,
   and safety before cooking.

2. Food Safety: Users must ensure all food is cooked to safe temperatures.
   Always use a food thermometer for meat, poultry, and seafood.

3. Allergens: While we attempt to identify common allergens, users with
   food allergies must verify all ingredients. We are not liable for
   allergic reactions.

4. Equipment Variations: Cooking times may vary based on your equipment.
   Users are responsible for monitoring food while cooking.

5. Suitability: Not all AI-generated recipes may be suitable for your
   dietary needs, health conditions, or skill level. Use your judgment.
```

---

#### Insurance Recommendations

**Type:** Product Liability Insurance

**Coverage Should Include:**
- AI-generated content liability
- Food product liability
- Consumer harm (physical injury, illness)
- Legal defense costs

**Typical Premium:** £500-£2,000/year for startup (UK market)

**Note:** Some insurers may exclude AI-generated content - specifically request coverage.

---

## 5. Implementation Roadmap

### 5.1 MVP Safety Checks (Required Before Launch)

**Timeline:** 2-3 weeks
**Status:** Pre-launch requirements

| Check | Priority | Effort | Status |
|-------|----------|--------|--------|
| 1. Temperature Safety Validation | CRITICAL | 3 days | ⬜ Not Started |
| 2. Allergen Detection | CRITICAL | 4 days | ⬜ Not Started |
| 3. Ingredient Quantity Sanity | CRITICAL | 2 days | ⬜ Not Started |
| 4. Recipe Completeness | CRITICAL | 2 days | ⬜ Not Started |
| 5. Instruction Clarity | HIGH | 2 days | ⬜ Not Started |
| 6. Legal Disclaimers & ToS | CRITICAL | 1 day | ⬜ Not Started |

**Total Estimated Effort:** 14 days (3 weeks with buffer)

---

#### Detailed Implementation Plan

**Week 1: Core Safety Validation**

**Days 1-3: Temperature Safety**
- Create `SAFETY_TEMPERATURES` database (ingredient keywords → min temp)
- Implement `validateCookingTemperature()` function
- Add temperature validation to recipe creation/edit flow
- Write unit tests for edge cases
- **Deliverable:** No recipe with chicken/beef/pork can be saved without temperature check

**Days 4-7: Allergen Detection**
- Create comprehensive `ALLERGEN_DATABASE` (9 major allergens + keywords)
- Implement `detectAllergens()` function
- Add allergen field to recipe schema
- Update recipe display to show allergen warnings prominently
- Write unit tests for allergen detection accuracy
- **Deliverable:** All recipes automatically tagged with allergen warnings

---

**Week 2: Completeness & Quality**

**Days 8-9: Ingredient Quantity Sanity**
- Define `QUANTITY_SANITY_CHECKS` rules
- Implement quantity validation logic
- Add warnings (not blockers) for unusual quantities
- **Deliverable:** Flag recipes with unrealistic ingredient amounts

**Days 10-11: Recipe Completeness**
- Implement `COMPLETENESS_CHECKS` array
- Add validation to recipe form submission
- Show user-friendly error messages
- **Deliverable:** All recipes have minimum required fields

**Days 12-13: Instruction Clarity**
- Create `VAGUE_TERMS` detection
- Add minimum word count check per instruction
- Flag missing timing/temperature info
- **Deliverable:** Instructions meet minimum quality standards

---

**Week 3: Legal & Integration**

**Day 14: Legal Disclaimers**
- Draft Terms of Service section on AI recipes
- Add disclaimer to recipe display page
- Add safety notice to recipe generation page
- Consult with UK solicitor (recommended)
- **Deliverable:** Legal protection in place

**Days 15-17: Integration & Testing**
- Integrate all validators into recipe creation API
- Add validation results to UI (errors/warnings)
- End-to-end testing with various recipe types
- Fix bugs and edge cases
- **Deliverable:** Fully validated recipe pipeline

---

### 5.2 Phase 2 Enhancements (First 3 Months Post-Launch)

**Timeline:** 3 months post-MVP
**Focus:** UK localization + quality improvements

| Enhancement | Priority | Effort | Value |
|-------------|----------|--------|-------|
| 7. UK Terminology Compliance | HIGH | 3 days | Market fit |
| 8. Metric Measurement Enforcement | HIGH | 1 day | UK standard |
| 9. Multi-Step AI Generation (Critique) | HIGH | 5 days | Quality boost |
| 10. Cross-Contamination Warnings | MEDIUM | 2 days | Safety |
| 11. Nutritional Analysis (API integration) | MEDIUM | 7 days | User value |

**Total Estimated Effort:** 18 days (1 month)

---

#### Month 1: UK Localization

**Week 1: Terminology Database**
- Build comprehensive UK/US ingredient dictionary (100+ terms)
- Implement `UK_TERMINOLOGY_MAP` replacement logic
- Add UK terminology to prompt engineering templates
- Test with various recipe types

**Week 2: Measurement Enforcement**
- Create `ALLOWED_UNITS` and `FORBIDDEN_UNITS` lists
- Implement `validateUKMeasurements()` function
- Update prompt templates to enforce metric-only
- Add conversion helper (for user reference, not automatic)

**Week 3-4: Enhanced Prompt Engineering**
- Rewrite prompts using XML structure (Claude advantage)
- Add UK-specific examples to prompts
- Implement UK_RECIPE_PROMPT_TEMPLATE
- A/B test new prompts vs. old

---

#### Month 2: Quality Improvements

**Week 1-2: Multi-Step Generation**
- Implement Constitutional AI approach (generate → critique → revise)
- Create `UK_RECIPE_CRITIQUE_PROMPT`
- Add `generateRecipeWithCritique()` workflow
- Measure quality improvement vs. single-pass

**Week 3: Cross-Contamination**
- Implement cross-contamination detection
- Add warnings to recipe display
- Test with allergen-heavy recipes

**Week 4: Nutritional Analysis**
- Integrate FatSecret or Spoonacular API
- Calculate per-serving nutrition
- Display nutrition facts on recipe page
- Add Nutri-Score badge (EU standard)

---

### 5.3 Phase 3: Advanced Features (6-12 Months)

**Timeline:** 6-12 months post-launch
**Focus:** Differentiation + user engagement

| Feature | Priority | Effort | Value |
|---------|----------|--------|-------|
| Recipe Originality Check | LOW | 10 days | IP protection |
| Seasonal Ingredient Flagging | LOW | 4 days | Sustainability |
| Cost Estimation (UK supermarkets) | MEDIUM | 7 days | User value |
| User Recipe Testing Program | HIGH | 14 days | Quality assurance |
| AI Model Fine-Tuning (UK recipes) | LOW | 30 days | Quality boost |
| Dual AI Comparison (GPT vs Claude) | MEDIUM | 5 days | Safety |

---

#### Priority: User Recipe Testing Program

**Concept:** "Turing Test for Chefs" approach

**Implementation:**
1. Flag newly generated recipes as "Untested"
2. Invite beta users to test recipes and provide feedback
3. Users rate recipes on:
   - **Accuracy** (did quantities/times work?)
   - **Clarity** (were instructions clear?)
   - **Taste** (was it delicious?)
   - **Safety** (any concerns?)
4. Recipes with 3+ positive tests get "Community Tested" badge
5. Recipes with negative feedback get flagged for AI retraining

**Benefit:** Crowdsourced quality control, user engagement, trust building

**Effort:** 14 days (UI + feedback system + badge logic)

---

### 5.4 Testing Strategy

#### Pre-Launch Testing Checklist

**Unit Tests:**
- ✅ Temperature validation (20+ test cases)
- ✅ Allergen detection (all 9 major allergens)
- ✅ Quantity sanity checks (edge cases: negative, zero, extreme)
- ✅ Completeness validation (missing fields, empty arrays)
- ✅ UK terminology replacement (50+ terms)
- ✅ Measurement unit validation (forbidden units)

**Integration Tests:**
- ✅ End-to-end recipe generation flow
- ✅ Recipe creation with validation errors
- ✅ Recipe editing with safety re-validation
- ✅ API error handling (OpenAI rate limits, timeouts)

**Manual Testing Scenarios:**
1. **Chicken Recipe** - verify 74°C temperature mentioned
2. **Nut-Based Recipe** - verify allergen warning displayed
3. **US Ingredient Names** - verify auto-correction to UK terms
4. **Missing Quantities** - verify blocked from saving
5. **Vague Instructions** - verify warnings shown

**AI Testing:**
- Generate 50 test recipes across categories (meat, vegan, baking, seafood)
- Manual review for safety, quality, UK compliance
- Fix prompt engineering based on failures
- Re-test until 95%+ pass rate

---

#### Post-Launch Monitoring

**Metrics to Track:**

1. **Safety Metrics:**
   - % of recipes flagged with temperature issues
   - % of recipes with allergen warnings
   - User reports of safety concerns

2. **Quality Metrics:**
   - Average validation score (errors + warnings)
   - % of recipes passing all checks on first generation
   - User ratings of recipe quality

3. **UK Compliance Metrics:**
   - % of recipes using UK terminology correctly
   - % of recipes with metric measurements only
   - User feedback on UK appropriateness

4. **User Behavior:**
   - % of users who edit AI-generated recipes before saving
   - Most common validation errors triggering edits
   - Recipe completion rate (generated → cooked)

**Alerting:**
- Alert if >10% of recipes fail temperature check (prompt issue)
- Alert if allergen detection misses common allergens (database gap)
- Alert if users report safety incidents (immediate investigation)

---

## 6. Recommendations and Next Steps

### Immediate Actions (This Week)

1. **Update OpenAI Prompt** (Current Implementation)
   - Add UK terminology requirements
   - Add safety temperature requirements
   - Add allergen identification requirement
   - Add metric-only measurement requirement
   - **File to edit:** `frontend/src/lib/ai/prompts.ts`

2. **Create Validation Layer**
   - New file: `frontend/src/lib/validation/recipe-safety.ts`
   - Implement temperature, allergen, completeness checks
   - Integrate into recipe creation API
   - **File to edit:** `frontend/src/app/api/ai/generate/route.ts`

3. **Update Recipe Schema**
   - Add `allergens: string[]` field
   - Add `safety_validated: boolean` field
   - Add `uk_compliant: boolean` field
   - **File to edit:** `frontend/src/types/recipe.ts`

4. **Add Legal Disclaimers**
   - Update Terms of Service
   - Add recipe page disclaimer component
   - Add generation page safety notice

### Short-Term Goals (Next 2 Weeks)

1. **Complete MVP Safety Checks**
   - Follow Week 1-3 implementation plan above
   - Achieve 100% validation coverage before launch

2. **User Testing**
   - Internal testing with 10-20 recipes across categories
   - Fix any validation gaps discovered
   - Refine prompt engineering based on results

3. **Legal Review**
   - Consult UK solicitor on ToS and disclaimers
   - Obtain product liability insurance quote
   - Document safety measures for insurance provider

### Medium-Term Goals (3 Months)

1. **UK Localization Excellence**
   - Become the most UK-friendly AI recipe platform
   - Comprehensive terminology and measurement compliance
   - Partner with UK food bloggers for validation

2. **Quality Improvement**
   - Implement multi-step generation with critique
   - Reduce validation failures from 20% → 5%
   - Achieve 4+ star average recipe rating

3. **Community Testing Program**
   - Launch beta testing program
   - Collect real-world recipe feedback
   - Use data to improve AI prompts

### Long-Term Vision (12 Months)

1. **Trusted UK Recipe Platform**
   - Known for safety and quality
   - Zero safety incidents
   - Thousands of "Community Tested" recipes

2. **AI Model Refinement**
   - Fine-tune on validated UK recipe corpus
   - Reduce need for post-generation validation
   - Generate publication-ready recipes 90%+ of time

3. **Market Leadership**
   - UK's #1 AI-powered recipe platform
   - Partnerships with UK supermarkets (ingredient delivery)
   - Featured in UK food media

---

## 7. Key Takeaways

### What Works

1. **Multi-step AI generation** (generate → critique → revise) significantly improves quality
2. **XML-structured prompts** increase Claude's instruction-following by 12%
3. **Explicit UK requirements** in prompts prevent Americanization
4. **Automated temperature validation** is technically feasible and critical for safety
5. **Allergen detection** via keyword matching is reliable for common cases

### What Doesn't Work

1. **Single-pass AI generation** produces too many errors for direct publication
2. **Relying on AI self-validation** without programmatic checks is risky
3. **Post-generation unit conversion** (US → UK) is error-prone; generate UK directly
4. **Assuming AI understands food safety** - it doesn't, validation required

### Critical Success Factors

1. **Safety First:** Never compromise on temperature validation and allergen warnings
2. **UK Authenticity:** British users notice American terminology immediately
3. **User Trust:** One bad recipe can lose a user forever; quality over quantity
4. **Legal Protection:** Disclaimers and validation systems reduce liability risk
5. **Continuous Improvement:** Use user feedback to refine prompts and validation

### Risk Mitigation Priorities

**Priority 1 (Launch Blockers):**
- Temperature safety validation
- Allergen detection
- Legal disclaimers

**Priority 2 (Launch Week):**
- UK terminology compliance
- Measurement enforcement
- Instruction clarity

**Priority 3 (First Month):**
- Multi-step generation
- Nutritional analysis
- Community testing

---

## Appendix A: Validation Code Templates

### Temperature Validation (TypeScript)

```typescript
// frontend/src/lib/validation/temperature-safety.ts

export interface TemperatureRule {
  ingredientKeywords: string[];
  minTempCelsius: number;
  minTempFahrenheit: number;
  cookingMethod: 'internal' | 'oven';
  restTimeMinutes?: number;
  description: string;
}

export const TEMPERATURE_SAFETY_RULES: TemperatureRule[] = [
  {
    ingredientKeywords: ['chicken', 'turkey', 'duck', 'goose', 'poultry', 'fowl'],
    minTempCelsius: 74,
    minTempFahrenheit: 165,
    cookingMethod: 'internal',
    description: 'All poultry must reach safe internal temperature'
  },
  {
    ingredientKeywords: ['minced beef', 'ground beef', 'beef mince', 'burger',
                         'minced pork', 'pork mince', 'minced lamb'],
    minTempCelsius: 71,
    minTempFahrenheit: 160,
    cookingMethod: 'internal',
    description: 'Ground meats must be cooked thoroughly'
  },
  {
    ingredientKeywords: ['beef steak', 'pork chop', 'lamb chop', 'veal'],
    minTempCelsius: 63,
    minTempFahrenheit: 145,
    cookingMethod: 'internal',
    restTimeMinutes: 3,
    description: 'Steaks and chops with rest time'
  },
  {
    ingredientKeywords: ['fish', 'salmon', 'cod', 'haddock', 'sea bass', 'trout'],
    minTempCelsius: 63,
    minTempFahrenheit: 145,
    cookingMethod: 'internal',
    description: 'Fish should be opaque and flake easily'
  },
  {
    ingredientKeywords: ['egg', 'eggs'],
    minTempCelsius: 71,
    minTempFahrenheit: 160,
    cookingMethod: 'internal',
    description: 'Egg dishes and casseroles'
  }
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTemperatureSafety(
  recipe: { ingredients: Array<{ item: string }>, instructions: Array<{ instruction: string }> }
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of TEMPERATURE_SAFETY_RULES) {
    // Check if recipe contains this type of ingredient
    const hasIngredient = recipe.ingredients.some(ing =>
      rule.ingredientKeywords.some(keyword =>
        ing.item.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (!hasIngredient) continue;

    // Check if instructions mention the required temperature
    const instructionText = recipe.instructions
      .map(s => s.instruction)
      .join(' ')
      .toLowerCase();

    const hasCelsius = instructionText.includes(`${rule.minTempCelsius}°c`) ||
                      instructionText.includes(`${rule.minTempCelsius}c`) ||
                      instructionText.includes(`${rule.minTempCelsius} degrees`);

    if (!hasCelsius) {
      errors.push(
        `SAFETY CRITICAL: Recipe contains ${rule.ingredientKeywords[0]} but ` +
        `doesn't specify minimum safe ${rule.cookingMethod} temperature of ` +
        `${rule.minTempCelsius}°C (${rule.minTempFahrenheit}°F). ${rule.description}`
      );
    }

    // Check for rest time if required
    if (rule.restTimeMinutes && hasCelsius) {
      const hasRestTime = instructionText.includes('rest') ||
                         instructionText.includes('stand');

      if (!hasRestTime) {
        warnings.push(
          `Recipe should mention ${rule.restTimeMinutes}-minute rest time ` +
          `after cooking ${rule.ingredientKeywords[0]}.`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

---

## Appendix B: Enhanced UK Prompt

```typescript
// frontend/src/lib/ai/prompts-uk.ts

export function createUKRecipePrompt(params: RecipeGenerationParams): string {
  return `
<role>
You are a professional British chef with 15 years of experience creating recipes
for UK home cooks. You specialize in recipes using ingredients readily available
in UK supermarkets (Tesco, Sainsbury's, Asda, Waitrose).
</role>

<context>
Generate a delicious, safe, and practical recipe for the UK market.
</context>

<available_ingredients>
${params.ingredients.map(ing => `- ${ing}`).join('\n')}
</available_ingredients>

<requirements>
- Servings: ${params.servings || 4}
${params.dietary_preferences?.length ? `- Dietary: ${params.dietary_preferences.join(', ')}` : ''}
${params.prepTimeMax ? `- Max time: ${params.prepTimeMax} minutes` : ''}
${params.difficulty ? `- Difficulty: ${params.difficulty}` : ''}
</requirements>

<uk_standards>
INGREDIENT TERMINOLOGY (CRITICAL):
- Use ONLY British names:
  * Courgette (NEVER zucchini)
  * Aubergine (NEVER eggplant)
  * Coriander leaves (NEVER cilantro)
  * Spring onion (NEVER scallion)
  * Rocket (NEVER arugula)
  * Mangetout (NEVER snow peas)
  * Prawns (for larger shrimp)
  * Caster sugar (NEVER superfine sugar)
  * Icing sugar (NEVER powdered sugar)
  * Cornflour (NEVER cornstarch)
  * Plain flour (NEVER all-purpose flour)
  * Double cream (NEVER heavy cream)
  * Single cream (NEVER light cream)

MEASUREMENTS (CRITICAL):
- ALL weights in grams (g) or kilograms (kg)
- ALL volumes in millilitres (ml) or litres (l)
- ALL temperatures in Celsius (°C) ONLY
- Small amounts: tablespoons (tbsp), teaspoons (tsp), or "pinch"
- NEVER use: cups, ounces (oz), Fahrenheit (°F), pounds (lb)

COOKING TERMINOLOGY:
- "Grill" = overhead heat (UK grill = US broil)
- "Hob" = stovetop/burner
- "Kitchen paper" = paper towels
- "Cling film" = plastic wrap
- "Gas Mark 6" = 200°C for gas ovens
</uk_standards>

<safety_requirements>
TEMPERATURE SAFETY (CRITICAL):
If recipe contains meat/poultry/fish/eggs, you MUST include these minimum temperatures:
- Chicken/turkey/poultry: 74°C internal temperature
- Minced beef/pork: 71°C internal temperature
- Beef/pork/lamb steaks: 63°C internal + 3 minute rest
- Fish: 63°C internal (flesh opaque, flakes easily)
- Egg dishes: 71°C

ALLERGEN IDENTIFICATION (CRITICAL):
Identify ALL allergens present from this list:
- Dairy (milk, butter, cheese, cream, yogurt)
- Eggs
- Fish
- Shellfish (prawns, crab, lobster, mussels, etc.)
- Tree nuts (almonds, walnuts, cashews, etc.)
- Peanuts
- Gluten (wheat, flour, bread, pasta, etc.)
- Soy
- Sesame

INSTRUCTION CLARITY (CRITICAL):
- Every step must be specific and actionable
- Include exact temperatures in °C
- Include exact times in minutes
- Add visual/tactile cues ("until golden", "when bubbles form")
- Never use vague terms like "until done" or "medium heat"
</safety_requirements>

<output_format>
Return ONLY valid JSON (no markdown code blocks, no explanations):

{
  "name": "Descriptive recipe name",
  "description": "Brief 1-2 sentence description",
  "prep_time": <number in minutes>,
  "cook_time": <number in minutes>,
  "servings": ${params.servings || 4},
  "difficulty": "easy" | "medium" | "hard",
  "allergens": ["list", "all", "allergens", "present"],
  "ingredients": [
    {
      "item": "UK ingredient name",
      "quantity": <number>,
      "unit": "g | ml | tbsp | tsp | pinch",
      "notes": "preparation details (optional)"
    }
  ],
  "instructions": [
    {
      "step_number": 1,
      "instruction": "Specific instruction with temperatures/times"
    }
  ]
}
</output_format>

<validation_checklist>
Before returning, verify:
✓ All ingredients use British names (no US terms)
✓ All measurements are metric (no cups/oz/°F)
✓ All meat/poultry/fish has temperature specified
✓ All allergens are identified in allergens array
✓ Every ingredient has quantity + unit
✓ Instructions are clear with specific times/temperatures
✓ Recipe is practical for UK home cook with standard equipment
</validation_checklist>

Generate the recipe now.
`.trim();
}
```

---

## Appendix C: Resources and References

### Food Safety

1. **USDA Safe Temperature Chart**
   https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart

2. **FDA Food Allergies**
   https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies

3. **UK Food Standards Agency - Allergen Guidance**
   https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses

4. **UK Food Safety Act 1990**
   https://www.food.gov.uk/about-us/key-regulations

5. **BRC Global Food Safety Standard - Cooking Instruction Validation**
   https://www.campdenbri.co.uk/white-papers/cooking-instruction-validation.php

### AI and Prompt Engineering

6. **Anthropic - Claude 4 Best Practices**
   https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices

7. **Anthropic - XML Tags in Prompts**
   https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags

8. **Anthropic - Constitutional AI**
   https://www.anthropic.com/news/claudes-constitution

9. **AWS - Prompt Engineering with Claude 3**
   https://aws.amazon.com/blogs/machine-learning/prompt-engineering-techniques-and-best-practices-learn-by-doing-with-anthropics-claude-3-on-amazon-bedrock/

10. **OpenAI - Prompt Engineering Guide**
    https://platform.openai.com/docs/guides/prompt-engineering

### Recipe Quality and Standards

11. **CACFP Recipe Standardization Guide**
    https://www.cacfp.org/2024/07/02/recipe-standardization-guide/

12. **The Culinary Pro - Baking Ratios**
    https://www.theculinarypro.com/culinary-ratios

13. **Taste of Home - Baking Ratios**
    https://www.tasteofhome.com/article/baking-ratios/

14. **Professional Chef's Guide to Recipe Standardization**
    https://flavor365.com/the-professional-chef-s-guide-to-recipe-standardization/

### UK Localization

15. **UK-US Recipe Conversion**
    https://convertrecipe.com/convert_UK_to_US.php

16. **Amica International - Translating Transatlantic Foods**
    https://www.amica-international.co.uk/blog/translating-transatlantic-foods

17. **British Recipe Collection - Ingredient Translation**
    https://www.britishrecipecollection.com/uk_to_usa_ingredient_translation.html

18. **UK Government - Composition of Foods (CoFID)**
    https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid

19. **Doves Farm - Imperial to Metric Conversion**
    https://www.dovesfarm.co.uk/hints-&-tips/imperial-to-metric-conversion-tables

### AI Recipe Quality Research

20. **NPR - AI Can Generate Recipes That Can Be Deadly**
    https://www.npr.org/2024/09/23/g-s1-23843/artificial-intelligence-recipes-food-cooking-apple

21. **Washington Post - AI Recipes Are Everywhere**
    https://www.washingtonpost.com/food/2024/03/07/ai-recipes-generative-instacart-food-photos/

22. **ScienceDirect - Would You Trust an AI Chef?**
    https://www.sciencedirect.com/science/article/abs/pii/S1878450X24001069

23. **FODMAP Everyday - Detecting AI-Generated Recipes**
    https://www.fodmapeveryday.com/how-to-detect-ai-generated-recipes-and-images-online/

### APIs and Tools

24. **Open Food Facts API**
    https://openfoodfacts.github.io/openfoodfacts-server/api/

25. **FatSecret Platform API**
    https://platform.fatsecret.com/platform-api

26. **CalorieNinjas API**
    https://calorieninjas.com/

27. **Spoonacular API**
    (See RapidAPI or official Spoonacular site)

### LLM Guardrails

28. **DataCamp - Top 20 LLM Guardrails**
    https://www.datacamp.com/blog/llm-guardrails

29. **OpenAI Cookbook - How to Implement Guardrails**
    https://cookbook.openai.com/examples/how_to_use_guardrails

30. **Palo Alto Networks - Comparing LLM Guardrails**
    https://unit42.paloaltonetworks.com/comparing-llm-guardrails-across-genai-platforms/

---

## Document Control

**Version:** 1.0
**Date:** January 2025
**Author:** AI Safety Research
**Status:** Final
**Next Review:** Post-MVP Launch (3 months)

**Change Log:**
- v1.0 (2025-01-XX): Initial comprehensive research report

---

**END OF REPORT**
