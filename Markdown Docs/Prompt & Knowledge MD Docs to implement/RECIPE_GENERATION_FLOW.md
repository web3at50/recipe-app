# Recipe Generation Flow Documentation

> **Complete end-to-end documentation of the recipe generation process from user input to database storage**

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Step-by-Step Flow](#step-by-step-flow)
4. [Component Details](#component-details)
5. [Database Schema](#database-schema)
6. [Key Files Reference](#key-files-reference)

---

## Overview

The recipe generation system allows users to create AI-generated recipes based on their available ingredients, dietary preferences, allergies, and other customization options. The system supports:

- **Single recipe generation** with choice of 4 AI models (OpenAI GPT-4.1, Claude Haiku 4.5, Gemini 2.5 Flash, Grok 4)
- **Multi-recipe generation** ("All 4 Styles") that generates 4 recipes simultaneously with different AI models
- **Real-time allergen detection** that blocks dangerous ingredients before AI generation
- **Post-generation allergen validation** that warns users of potential allergen matches

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                                │
│                     /create-recipe/page.tsx                                  │
│                                                                               │
│  User Inputs:                                                                │
│  ├─ Ingredients (textarea)                                                   │
│  ├─ Description (optional)                                                   │
│  ├─ Allergens (from user profile + session overrides)                       │
│  ├─ Dietary Restrictions (vegetarian, vegan, etc.)                          │
│  ├─ Pantry Staples (fetched from user_pantry_staples table)                │
│  ├─ Recipe Preferences (servings, max time, cooking mode, difficulty, etc.) │
│  └─ Model Selection (single model or "All 4 Styles")                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API ENDPOINT LAYER                                 │
│                    /api/ai/generate/route.ts                                 │
│                                                                               │
│  Step 1: Fetch User Preferences                                             │
│    ├─ Get user_profiles.preferences (allergens, dietary, cuisines, etc.)    │
│    └─ Merge with session overrides from request body                        │
│                                                                               │
│  Step 2: PRE-GENERATION ALLERGEN CHECK (BLOCKING) ✋                         │
│    ├─ detectAllergensInText() from allergen-detector.ts                     │
│    ├─ Check each ingredient against user's allergen profile                 │
│    └─ RETURN 400 ERROR if allergen conflict found (generation blocked)      │
│                                                                               │
│  Step 3: Build AI Prompt                                                    │
│    ├─ createRecipeGenerationPrompt() from prompts.ts                        │
│    ├─ Include user context (allergens, preferences, pantry staples)         │
│    ├─ Include ingredient mode (strict/flexible/creative)                    │
│    ├─ Include cooking mode instructions (slow cooker, air fryer, etc.)      │
│    └─ Build structured JSON format request                                   │
│                                                                               │
│  Step 4: AI Generation                                                       │
│    ├─ Route to selected AI model (OpenAI, Claude, Gemini, or Grok)          │
│    ├─ OpenAI: Complexity score determines GPT-4.1 vs GPT-4.1 mini           │
│    ├─ Send prompt to AI provider                                            │
│    └─ Track token usage for cost monitoring                                  │
│                                                                               │
│  Step 5: Parse AI Response                                                   │
│    ├─ parseRecipeFromAI() from prompts.ts                                   │
│    ├─ Extract JSON from AI response                                         │
│    ├─ Normalize ingredients (convert quantities to strings)                  │
│    └─ Normalize instructions (ensure step numbers exist)                     │
│                                                                               │
│  Step 6: POST-GENERATION ALLERGEN CHECK (WARNING) ⚠️                        │
│    ├─ detectAllergensInIngredients() from allergen-detector.ts              │
│    ├─ Check generated ingredients against allergen profile                   │
│    ├─ Group matches by allergen type                                        │
│    └─ Return warnings (non-blocking, user can still save)                   │
│                                                                               │
│  Step 7: Log AI Usage                                                        │
│    ├─ logAIUsage() from usage-tracker.ts                                    │
│    ├─ Store token counts, model used, complexity score                      │
│    └─ Non-blocking (errors don't affect response)                           │
│                                                                               │
│  Step 8: Return Recipe + Warnings                                            │
│    └─ JSON response with recipe object and allergen_warnings array           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RECIPE DISPLAY LAYER                                 │
│                     /create-recipe/page.tsx                                  │
│                                                                               │
│  Single Recipe View:                                                         │
│    ├─ Display recipe name, description, prep/cook time, servings            │
│    ├─ Show allergen warnings if detected (red alert box)                    │
│    ├─ List ingredients with quantities and units                            │
│    ├─ List step-by-step instructions                                        │
│    └─ "Save Recipe to Collection" button                                     │
│                                                                               │
│  Multi-Recipe View ("All 4 Styles"):                                        │
│    ├─ Tabs for each AI model (Balanced, Precise, Quick, Thoughtful)         │
│    ├─ Progress indicator showing generation status                          │
│    ├─ Individual "Save This Recipe" buttons per tab                          │
│    └─ "Save All [X] Recipes" button at bottom                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼ (User clicks "Save Recipe")
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RECIPE SAVING LAYER                                   │
│                     /api/recipes/route.ts (POST)                             │
│                                                                               │
│  Step 1: Validate User Authentication                                        │
│    └─ Check Clerk auth() for userId                                          │
│                                                                               │
│  Step 2: Validate Required Fields                                            │
│    ├─ name (required)                                                        │
│    ├─ ingredients array (required)                                          │
│    └─ instructions array (required)                                         │
│                                                                               │
│  Step 3: AUTO-DETECT ALLERGENS (Server-side validation)                     │
│    ├─ detectAllergensInIngredients() from allergen-detector.ts              │
│    ├─ Check against ALL UK allergens (not just user's profile)              │
│    ├─ Extract unique allergen IDs                                           │
│    └─ Merge with any provided allergens from request                         │
│                                                                               │
│  Step 4: Insert Recipe into Database                                         │
│    ├─ supabase.from('recipes').insert()                                     │
│    ├─ Store all fields in single JSONB-powered row                          │
│    │   - Basic info: name, description, cuisine, source, ai_model           │
│    │   - Timing: prep_time, cook_time, servings, difficulty                 │
│    │   - Content: ingredients (JSONB), instructions (JSONB)                 │
│    │   - Metadata: tags (array), allergens (array), nutrition (JSONB)       │
│    └─ .select().single() to return created recipe                            │
│                                                                               │
│  Step 5: Return Created Recipe                                               │
│    └─ JSON response with recipe object (includes auto-generated UUID)        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NAVIGATION TO MY RECIPES                                │
│                                                                               │
│  Single Recipe Save:                                                         │
│    └─ router.push(`/my-recipes/${savedRecipe.id}`)                           │
│                                                                               │
│  Multi-Recipe Save ("Save All"):                                             │
│    └─ router.push('/my-recipes')                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MY RECIPES PAGE DISPLAY                                 │
│                   /my-recipes/page.tsx                                       │
│                                                                               │
│  Server-Side Data Fetching:                                                  │
│    ├─ Fetch all recipes: supabase.from('recipes').select('*')               │
│    │   .eq('user_id', userId).order('created_at', desc)                      │
│    ├─ Fetch user allergens from user_profiles.preferences.allergies         │
│    └─ Pass to RecipeList component                                           │
│                                                                               │
│  RecipeList Component (recipe-list.tsx):                                    │
│    ├─ Display recipes in grid (1-3 columns responsive)                      │
│    ├─ RecipeCard component for each recipe                                  │
│    ├─ Show allergen warnings if recipe contains user's allergens            │
│    └─ Actions: toggle favorite, delete recipe                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Flow

### Phase 1: User Input Collection (`/create-recipe/page.tsx`)

**Location**: `frontend/src/app/(dashboard)/create-recipe/page.tsx`

1. **Page Load**:
   - Fetch user preferences from `/api/profile`
     - Loads: `allergies`, `dietary_restrictions`, `household_size`, `typical_cook_time`, `cooking_skill`, `spice_level`, `cuisines_liked`
   - Fetch pantry staples from `/api/user/pantry-staples`
     - Returns list of ingredient patterns user has at home

2. **User Fills Form**:
   - **Required**: Ingredients (newline-separated textarea)
   - **Optional**: Description of desired dish
   - **Session Overrides**: User can temporarily modify allergens and dietary restrictions for this recipe only
   - **Pantry Staples**: User can exclude specific items from being used (eye icon toggle)
   - **Preferences**:
     - Servings (defaults to `household_size`)
     - Cooking mode (standard, slow cooker, air fryer, batch cook)
     - Max cook time (ignored for slow cooker mode)
     - Skill level
     - Spice level

3. **Model Selection**:
   - Single model: `model_1`, `model_2`, `model_3`, `model_4`
   - All 4 styles: Generates 4 recipes in parallel with different models

### Phase 2: Pre-Generation Allergen Check (`/api/ai/generate/route.ts`)

**Location**: `frontend/src/app/api/ai/generate/route.ts:78-105`

**Purpose**: Block recipe generation if user enters dangerous ingredients

1. Parse ingredients from textarea (split by newline)
2. Get user's allergen profile (from DB + session overrides)
3. For each ingredient, call `detectAllergensInText(ingredient, userAllergens)`
   - Uses keyword matching from `allergen-detector.ts`
   - Matches against taxonomy keywords (e.g., "milk" → dairy, "peanut" → peanuts)
4. **If allergen conflict found**:
   - Build detailed error message listing conflicts
   - Return `400 Bad Request` with message
   - **Generation is blocked** ✋
5. **If no conflicts**: Proceed to prompt building

**Example Error Response**:
```json
{
  "error": "Safety Warning",
  "message": "The following ingredients conflict with your allergen profile:\n\nDairy: \"milk\" contains \"milk\"\nGluten: \"wheat flour\" contains \"wheat\"",
  "conflicts": ["milk", "wheat flour"]
}
```

### Phase 3: AI Prompt Building (`/lib/ai/prompts.ts`)

**Location**: `frontend/src/lib/ai/prompts.ts`

**Function**: `createRecipeGenerationPrompt(params)`

The prompt is structured in sections:

1. **USER PROFILE** (if provided):
   ```
   ⚠️ CRITICAL - ALLERGENS TO AVOID: gluten, dairy
   DO NOT include these ingredients or their derivatives.
   - Cuisine style: Italian (or multiple cuisines)
   ```

2. **PANTRY STAPLES AVAILABLE**:
   ```
   PANTRY STAPLES AVAILABLE:
   olive oil, salt, pepper, garlic, onions, ...
   ```

3. **AVAILABLE INGREDIENTS**:
   ```
   AVAILABLE INGREDIENTS:
   Chicken breast
   Rice
   Tomatoes
   ```

4. **INGREDIENT MODE**:
   - **Strict**: "You MUST only use ingredients from the available ingredients and pantry staples listed above."
   - **Flexible**: "Primarily use the available ingredients. You may add common UK pantry basics if needed."
   - **Creative**: "Use the available ingredients as inspiration. Feel free to suggest 2-3 special ingredients."

5. **USER'S VISION** (if description provided):
   ```
   USER'S VISION:
   Something creamy and comforting, Italian-style
   ```

6. **COOKING MODE INSTRUCTIONS** (if special mode selected):
   - **Slow Cooker**: Detailed instructions for LOW/HIGH settings, liquid requirements, browning guidance
   - **Air Fryer**: Temperature in Celsius, shake/flip instructions, single layer requirement
   - **Batch Cook**: Larger servings (6-12), freezing instructions, reheating guidance

7. **REQUIREMENTS**:
   ```
   - Servings: 4
   - Dietary Requirements: vegetarian, gluten-free
   - Maximum Total Time: 30 minutes
   - Difficulty: Intermediate
   - Spice Level: Medium
   - Use UK measurements (g, kg, ml, l, tsp, tbsp)
   ```

8. **JSON FORMAT SPECIFICATION**:
   - Specifies exact structure for AI to follow
   - Includes example with all required fields
   - Emphasizes returning ONLY valid JSON

### Phase 4: AI Model Selection & Generation (`/api/ai/generate/route.ts`)

**Location**: `frontend/src/app/api/ai/generate/route.ts:169-302`

**Model Routing**:

1. **OpenAI** (`model === 'openai'`):
   - Calculate complexity score based on:
     - Ingredient count × 0.5
     - Allergen count × 3 (safety critical)
     - Dietary restriction count × 2
     - Description length (>50 chars = +2, otherwise +1)
   - If complexity > 8: Use `gpt-4.1-2025-04-14` (full model)
   - If complexity ≤ 8: Use `gpt-4.1-mini-2025-04-14` (faster, cheaper)
   - Generate with `temperature: 0.7`, `maxOutputTokens: 2000`

2. **Claude** (`model === 'claude'`):
   - Use `claude-haiku-4-5-20251001`
   - Faster, cost-effective option
   - Same temperature and token limits

3. **Gemini** (`model === 'gemini'`):
   - Use `gemini-2.0-flash-exp` (paid tier)
   - Google's latest model

4. **Grok** (`model === 'grok'`):
   - Use `grok-4-fast-reasoning` via XAI API
   - Reasoning capabilities for allergen safety

**Token Usage Tracking**:
- Capture `inputTokens`, `outputTokens`, `cachedTokens` from each provider
- Used for cost monitoring and optimization

### Phase 5: Recipe Parsing (`/lib/ai/prompts.ts`)

**Location**: `frontend/src/lib/ai/prompts.ts:322-357`

**Function**: `parseRecipeFromAI(text)`

1. Extract JSON from AI response using regex: `/\{[\s\S]*\}/`
2. Parse JSON string
3. Validate required fields: `name`, `ingredients`, `instructions`
4. **Normalize ingredients**:
   - Convert `quantity` to string (handles both string and number from AI)
5. **Normalize instructions**:
   - Ensure `step` field exists (fallback to `step_number` or index+1)
6. Return structured `ParsedRecipe` object

**Handles AI variations**:
- Some models return `step_number` instead of `step`
- Some models return numeric quantities, others strings
- Ensures consistent format for frontend

### Phase 6: Post-Generation Allergen Validation (`/api/ai/generate/route.ts`)

**Location**: `frontend/src/app/api/ai/generate/route.ts:309-324`

**Purpose**: Warn users if AI accidentally included allergens (non-blocking)

1. Call `detectAllergensInIngredients(recipe.ingredients, userAllergens)`
2. Check each ingredient's `item` field against allergen keywords
3. Group matches by allergen type using `groupMatchesByAllergen()`
4. Build warning messages: `⚠️ Dairy: milk, cream`
5. Return warnings in response (user can still save recipe)

**Key Difference from Pre-Generation Check**:
- Pre-generation: **Blocks** generation if user enters allergen
- Post-generation: **Warns** if AI included allergen (AI mistake or creative mode)

### Phase 7: Recipe Display (`/create-recipe/page.tsx`)

**Location**: `frontend/src/app/(dashboard)/create-recipe/page.tsx:1103-1298`

**Single Recipe View** (lines 1103-1179):
- Display recipe name, description
- Show AI model badge (e.g., "⚖️ Balanced")
- Show prep time, cook time, servings
- **Allergen Warning Box** (if warnings exist):
  - Red border, warning icon
  - List each allergen with matching ingredients
  - "Please review ingredients carefully before proceeding"
- List ingredients with bullets
- List instructions with numbered steps
- **"Save Recipe to Collection"** button → calls `handleSaveSingleRecipe()`

**Multi-Recipe View** (lines 1182-1273):
- Tabs for each model (`model_1`, `model_2`, `model_3`, `model_4`)
- Each tab shows complete recipe
- Individual **"Save This Recipe"** buttons
- Bottom: **"Save All [X] Recipes"** button → calls `handleSaveAllRecipes()`

**Progress Indicator** (lines 1068-1100):
- Shows during "All 4 Styles" generation
- Progress bar (0-100%)
- List of models with status:
  - ✅ CheckCircle (complete)
  - ⏳ Loader (generating...)
  - ⭕ Circle (waiting)

### Phase 8: Recipe Saving (`/api/recipes/route.ts`)

**Location**: `frontend/src/app/api/recipes/route.ts:67-143`

**Triggered By**:
- Single recipe: `handleSaveSingleRecipe()` → POST to `/api/recipes`
- Multiple recipes: `handleSaveAllRecipes()` → Promise.all of POST requests

**Server-Side Process**:

1. **Authentication Check** (line 69-73):
   ```typescript
   const { userId } = await auth();
   if (!userId) return 401 Unauthorized
   ```

2. **Validate Required Fields** (line 80-85):
   - `name` (required)
   - `ingredients` array (required)
   - `instructions` array (required)

3. **Add Step Numbers** (line 88-91):
   - Ensure instructions have sequential step numbers
   - Fallback to index+1 if not provided

4. **Auto-Detect Allergens** (line 94-106):
   - Call `detectAllergensInIngredients()` with ALL UK allergens
   - Not just user's allergens - detect all possible allergens
   - Purpose: Allow filtering/warnings for all users
   - Merge with any provided allergens from request

5. **Database Insert** (line 109-131):
   ```typescript
   await supabase.from('recipes').insert({
     user_id: userId,
     name: body.name,
     description: body.description || null,
     cuisine: body.cuisine || null,
     prep_time: body.prep_time || null,
     cook_time: body.cook_time || null,
     servings: body.servings,
     difficulty: body.difficulty || null,
     source: body.source || 'user_created', // 'ai_generated' for AI recipes
     ai_model: body.ai_model || null, // 'model_1', 'model_2', etc.
     ingredients: body.ingredients, // JSONB array
     instructions: instructions, // JSONB array with step numbers
     tags: body.tags || [],
     allergens: finalAllergens, // Auto-detected allergens
     nutrition: body.nutrition || null,
     cost_per_serving: body.cost_per_serving || null,
     image_url: body.image_url || null,
   }).select().single();
   ```

6. **Return Created Recipe** (line 138):
   - Includes auto-generated `id` (UUID)
   - Includes `created_at` timestamp

**Request Payload Example**:
```json
{
  "name": "Creamy Chicken Pasta",
  "description": "A delicious Italian-style pasta",
  "prep_time": 15,
  "cook_time": 25,
  "servings": 4,
  "ai_model": "model_1",
  "source": "ai_generated",
  "ingredients": [
    {
      "item": "chicken breast",
      "quantity": "400",
      "unit": "g",
      "notes": "diced"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "instruction": "Heat oil in a pan..."
    }
  ]
}
```

### Phase 9: Navigation & Display (`/my-recipes/page.tsx`)

**Location**: `frontend/src/app/(dashboard)/my-recipes/page.tsx`

**After Saving**:
- Single recipe save → Navigate to `/my-recipes/{recipeId}` (detail view)
- Multi-recipe save → Navigate to `/my-recipes` (list view)

**My Recipes Page Flow**:

1. **Server-Side Data Fetching** (lines 19-36):
   ```typescript
   // Fetch recipes
   const { data: recipes } = await supabase
     .from('recipes')
     .select('*')
     .eq('user_id', userId)
     .order('created_at', { ascending: false });

   // Fetch user allergens for warnings
   const { data: profile } = await supabase
     .from('user_profiles')
     .select('preferences')
     .eq('user_id', userId)
     .single();

   const userAllergens = profile?.preferences?.allergies || [];
   ```

2. **Pass to RecipeList Component** (line 62):
   ```typescript
   <RecipeList
     initialRecipes={recipes || []}
     userAllergens={userAllergens}
   />
   ```

3. **RecipeList Component** (`recipe-list.tsx`):
   - Display recipes in responsive grid (1-3 columns)
   - Each recipe rendered as `RecipeCard` component
   - Show allergen warnings if recipe contains user's allergens
   - Actions:
     - Toggle favorite (PATCH `/api/recipes/{id}`)
     - Delete recipe (DELETE `/api/recipes/{id}`)

---

## Component Details

### `/create-recipe/page.tsx` Key Functions

#### `generateSingleRecipe(model, cuisineOverride?)`
**Lines**: 150-205

Generates a single recipe with specified AI model.

**Process**:
1. Parse ingredients from textarea (split by newline)
2. Build request payload:
   - Ingredients array
   - All preferences (servings, time, difficulty, etc.)
   - Session overrides for allergens/dietary restrictions
   - Filtered pantry staples (excluding user-deselected items)
   - Model selection (mapped to API key: model_1 → 'openai')
3. POST to `/api/ai/generate`
4. Handle response:
   - Success: Return recipe with `ai_model` field set
   - Error: Throw error with message (caught by calling function)

**Multi-Model Generation**:
- For "All 4 Styles", calls `generateSingleRecipe()` 4 times sequentially
- Distributes cuisines randomly across models for variety
- Updates progress indicator after each completion
- Continues even if one model fails

#### `handleSaveRecipe(recipe, modelOverride?)`
**Lines**: 294-333

Saves a recipe to the database via `/api/recipes` POST endpoint.

**Payload Construction**:
```typescript
{
  name: recipe.name,
  description: recipe.description,
  prep_time: recipe.prep_time,
  cook_time: recipe.cook_time,
  servings: recipe.servings,
  ai_model: modelOverride || recipe.ai_model,
  source: 'ai_generated',
  ingredients: recipe.ingredients.map(ing => ({
    item: ing.item,
    quantity: ing.quantity,
    unit: ing.unit,
    notes: ing.notes,
  })),
  instructions: recipe.instructions.map(inst => ({
    instruction: inst.instruction,
  })),
}
```

**Returns**: Saved recipe object with `id`

#### `handleSaveSingleRecipe()`
**Lines**: 335-344

Saves the current displayed recipe and navigates to detail view.

#### `handleSaveAllRecipes()`
**Lines**: 346-366

Saves all 4 generated recipes in parallel:
- Filter out null recipes (failed generations)
- `Promise.all()` to save all simultaneously
- Navigate to `/my-recipes` list view
- Show success toast with count

### `/api/ai/generate/route.ts` Key Functions

#### `POST` Handler
**Lines**: 10-389

Main recipe generation endpoint.

**Request Body**:
```typescript
{
  ingredients: string[],              // Required
  description?: string,               // Optional
  ingredient_mode?: 'strict' | 'flexible' | 'creative',
  dietary_preferences?: string[],
  servings?: number,
  prepTimeMax?: number,
  cooking_mode?: 'standard' | 'slow_cooker' | 'air_fryer' | 'batch_cook',
  difficulty?: string,
  spice_level?: string,
  favourite_cuisine?: string,
  pantry_staples?: string[],
  model: 'openai' | 'claude' | 'gemini' | 'grok',
  preferences?: {
    allergies?: string[],
    dietary_restrictions?: string[],
  }
}
```

**Response** (Success):
```typescript
{
  recipe: {
    name: string,
    description: string,
    prep_time: number,
    cook_time: number,
    servings: number,
    source: 'ai_generated',
    ingredients: Array<{
      item: string,
      quantity?: string,
      unit?: string,
      notes?: string,
    }>,
    instructions: Array<{
      step: number,
      instruction: string,
    }>,
  },
  allergen_warnings?: string[], // e.g., ["⚠️ Dairy: milk, cream"]
}
```

**Response** (Error - Allergen Conflict):
```typescript
{
  error: 'Safety Warning',
  message: 'The following ingredients conflict with your allergen profile:...',
  conflicts: string[], // Array of conflicting ingredients
}
```

#### `calculateComplexityScore()`
**Lines**: 395-420

Determines which OpenAI model to use based on recipe complexity.

**Scoring**:
- Ingredients: `count × 0.5`
- Allergens: `count × 3` (safety critical, needs better model)
- Dietary restrictions: `count × 2`
- Description: `+2` if >50 chars, `+1` if >0 chars

**Model Selection**:
- Score > 8: Use GPT-4.1 (full model) - complex recipe with allergens
- Score ≤ 8: Use GPT-4.1 mini - simple recipe, cost-effective

### `/lib/ai/prompts.ts` Key Functions

#### `createRecipeGenerationPrompt(params)`
**Lines**: 20-300

Builds comprehensive AI prompt with all user context.

**Key Sections**:
1. User profile (allergens, cuisines)
2. Pantry staples
3. Available ingredients
4. Ingredient mode instructions
5. User's vision/description
6. Cooking mode instructions (if special mode)
7. Requirements (servings, dietary, time, difficulty, spice)
8. JSON format specification

**Special Handling**:
- **Allergens**: Marked as "⚠️ CRITICAL" to emphasize importance
- **Slow Cooker Mode**: Includes detailed timing guidance, liquid requirements, layering instructions
- **Air Fryer Mode**: Specifies Celsius only, shake/flip instructions, single layer requirement
- **Batch Cook Mode**: Larger servings, freezing/reheating instructions

#### `parseRecipeFromAI(text)`
**Lines**: 322-357

Extracts and normalizes recipe from AI response.

**Normalization**:
- Ingredients: Convert `quantity` to string
- Instructions: Ensure `step` field exists (handle `step_number` legacy)

**Error Handling**:
- Throws if no JSON found in response
- Throws if missing required fields (`name`, `ingredients`, `instructions`)

### `/api/recipes/route.ts` Key Functions

#### `POST` Handler
**Lines**: 67-143

Creates new recipe in database.

**Allergen Auto-Detection**:
```typescript
// Check against ALL UK allergens (not just user's)
const allAllergenIds = UK_ALLERGENS.map(a => a.id);
const detectedMatches = detectAllergensInIngredients(
  body.ingredients,
  allAllergenIds
);

// Get unique allergen IDs
const detectedAllergens = [...new Set(detectedMatches.map(m => m.allergen))];

// Merge with provided allergens
const finalAllergens = [...new Set([
  ...(body.allergens || []),
  ...detectedAllergens
])];
```

**Purpose**: Store all allergens for recipe, not just user's allergens. This allows:
- Other users to see allergen warnings
- User to add allergens later and see warnings on existing recipes
- Filtering by allergen

#### `GET` Handler
**Lines**: 8-64

Lists user's recipes with filtering/pagination.

**Query Parameters**:
- `limit`: Number of recipes per page (default: 20)
- `offset`: Starting position (default: 0)
- `search`: Filter by recipe name
- `favorite`: Only show favorites
- `cuisine`: Filter by cuisine
- `tag`: Filter by tag

**Returns**:
```typescript
{
  recipes: Recipe[],
  total: number, // Total count for pagination
}
```

---

## Database Schema

### `recipes` Table

```sql
Column             | Type                     | Notes
-------------------|--------------------------|--------------------------------
id                 | uuid                     | Primary key, auto-generated
user_id            | text                     | Clerk user ID
name               | text                     | Recipe name
description        | text                     | Recipe description
cuisine            | varchar(100)             | e.g., 'Italian', 'Mexican'
source             | varchar(50)              | 'ai_generated' or 'user_created'
prep_time          | integer                  | Minutes
cook_time          | integer                  | Minutes
servings           | integer                  | Default: 4
difficulty         | varchar(20)              | 'beginner', 'intermediate', 'advanced'
ingredients        | jsonb                    | Array of ingredient objects
instructions       | jsonb                    | Array of instruction objects
tags               | text[]                   | Array of tags
allergens          | text[]                   | Array of allergen IDs (auto-detected)
nutrition          | jsonb                    | Nutritional information
cost_per_serving   | numeric(5,2)             | Cost estimate
image_url          | text                     | Recipe image URL
is_favorite        | boolean                  | Default: false
published          | boolean                  | Default: true
flagged_for_review | boolean                  | Default: false
created_at         | timestamp with time zone | Auto-generated
updated_at         | timestamp with time zone | Auto-updated
ai_model           | varchar(20)              | 'model_1', 'model_2', etc.
is_public          | boolean                  | Default: false
seo_slug           | varchar(255)             | URL-friendly slug
seo_title          | varchar(255)             | SEO title
seo_description    | text                     | SEO description
seo_keywords       | text[]                   | SEO keywords
category           | varchar(100)             | Recipe category
published_at       | timestamp with time zone | Publication date
image_source       | varchar(50)              | Image source/attribution
image_attribution  | text                     | Image attribution text
page_views         | integer                  | View count, default: 0
cooking_mode       | varchar(50)              | 'slow_cooker', 'air_fryer', etc.
```

### `ingredients` JSONB Structure

```json
[
  {
    "item": "chicken breast",
    "quantity": "400",
    "unit": "g",
    "notes": "diced"
  },
  {
    "item": "olive oil",
    "quantity": "2",
    "unit": "tbsp",
    "notes": null
  }
]
```

### `instructions` JSONB Structure

```json
[
  {
    "step": 1,
    "instruction": "Heat olive oil in a large pan over medium heat."
  },
  {
    "step": 2,
    "instruction": "Add diced chicken and cook for 5-7 minutes until golden."
  }
]
```

### Related Tables

#### `user_profiles`
- Stores user preferences: `allergies`, `dietary_restrictions`, `cuisines_liked`, `household_size`, `typical_cook_time`, `cooking_skill`, `spice_level`
- Accessed in `/api/ai/generate` to personalize prompts

#### `user_pantry_staples`
- Stores items user has at home
- Each row: `user_id`, `item_pattern`
- Fetched in `/create-recipe` and passed to AI prompt

#### `ai_usage_logs`
- Tracks AI API usage for cost monitoring
- Fields: `model_provider`, `model_name`, `input_tokens`, `output_tokens`, `cached_tokens`, `complexity_score`, `response_time_ms`

---

## Key Files Reference

### Frontend Components

| File | Purpose | Key Exports |
|------|---------|-------------|
| `frontend/src/app/(dashboard)/create-recipe/page.tsx` | Main recipe generation UI | `GeneratePage` (default export) |
| `frontend/src/app/(dashboard)/my-recipes/page.tsx` | Recipe list page | `RecipesPage` (default export) |
| `frontend/src/components/recipes/recipe-list.tsx` | Recipe grid display | `RecipeList` |
| `frontend/src/components/recipes/recipe-card.tsx` | Individual recipe card | `RecipeCard` |

### API Endpoints

| File | Purpose | Methods |
|------|---------|---------|
| `frontend/src/app/api/ai/generate/route.ts` | AI recipe generation | `POST` |
| `frontend/src/app/api/recipes/route.ts` | Recipe CRUD operations | `GET`, `POST` |
| `frontend/src/app/api/recipes/[id]/route.ts` | Single recipe operations | `GET`, `PATCH`, `DELETE` |

### Libraries

| File | Purpose | Key Functions |
|------|---------|---------------|
| `frontend/src/lib/ai/prompts.ts` | AI prompt generation | `createRecipeGenerationPrompt()`, `parseRecipeFromAI()` |
| `frontend/src/lib/allergen-detector.ts` | Allergen detection | `detectAllergensInText()`, `detectAllergensInIngredients()`, `groupMatchesByAllergen()` |
| `frontend/src/lib/allergen-taxonomies.ts` | Allergen keyword lists | Keyword arrays for each allergen |
| `frontend/src/lib/ai/usage-tracker.ts` | AI usage logging | `logAIUsage()`, `generateRequestId()`, `generateSessionId()` |
| `frontend/src/lib/model-styles.ts` | Model display info | `MODEL_STYLES`, `getStyleName()`, `getStyleIcon()` |

### Types

| File | Purpose | Key Types |
|------|---------|-----------|
| `frontend/src/types/recipe.ts` | Recipe types | `Recipe`, `RecipeFormData` |
| `frontend/src/types/user-profile.ts` | User preferences | `UserPreferences` |
| `frontend/src/types/index.ts` | Shared types | `IngredientMode` |

---

## Data Flow Summary

```
User Input → Pre-Generation Allergen Check → Prompt Building →
AI Generation → Recipe Parsing → Post-Generation Allergen Validation →
Display Recipe → User Saves → Database Insert (with allergen auto-detection) →
My Recipes Page Display
```

**Safety Layers**:
1. **Pre-Generation**: Blocks if user enters allergens (frontend + API)
2. **Prompt**: Instructs AI to avoid allergens
3. **Post-Generation**: Warns if AI included allergens (non-blocking)
4. **Database Save**: Auto-detects all allergens for future filtering

**Multi-Recipe Generation**:
- Generates 4 recipes sequentially (not parallel to avoid API rate limits)
- Each recipe uses a different AI model
- Progress indicator shows status of each generation
- User can save individual recipes or all at once

**Recipe Display**:
- Single recipe: Save → Navigate to detail view (`/my-recipes/{id}`)
- Multi-recipe: Save All → Navigate to list view (`/my-recipes`)
- Recipe list fetches all user recipes with allergen warnings

---

## Enhancement Areas

Based on the database schema, here are potential areas for enhancement:

1. **Nutrition Information**:
   - Currently `nutrition` field is JSONB but not populated by AI
   - Could enhance prompt to include macros/calories
   - Would need to add to `parseRecipeFromAI()` to extract

2. **Recipe Images**:
   - `image_url`, `image_source`, `image_attribution` fields exist
   - Could integrate with image generation API (DALL-E, Midjourney)
   - Or scrape/suggest images based on recipe name

3. **Cost Estimation**:
   - `cost_per_serving` field exists but not populated
   - Could integrate with grocery API or price database
   - AI could estimate based on ingredients

4. **Recipe Publishing**:
   - `is_public`, `published`, `published_at`, `seo_*` fields exist
   - Could add public recipe sharing feature
   - SEO optimization for public recipes

5. **Recipe Categories**:
   - `category` field exists but not set
   - Could auto-categorize (breakfast, lunch, dinner, dessert, etc.)
   - Add to prompt or detect from recipe name/ingredients

6. **Page View Tracking**:
   - `page_views` field exists
   - Could track recipe popularity
   - Show "trending recipes" or "most viewed"

7. **Flagging System**:
   - `flagged_for_review` field exists
   - Could add user reporting system
   - Moderate AI-generated content

---

## Conclusion

The recipe generation system is a comprehensive end-to-end solution that prioritizes user safety (allergen detection), personalization (user preferences), and flexibility (multi-model support). The system uses a layered approach to ensure allergen safety at multiple checkpoints, and stores all generated recipes in a JSONB-powered PostgreSQL database for efficient querying and flexible schema evolution.

The flow from user input to database storage involves:
- 2 frontend pages (`/create-recipe`, `/my-recipes`)
- 2 API endpoints (`/api/ai/generate`, `/api/recipes`)
- 4 AI models (OpenAI, Claude, Gemini, Grok)
- 3 allergen safety checks (pre-generation, prompt, post-generation, database auto-detection)
- Multiple library utilities for prompt building, parsing, and allergen detection

All data is stored in a single `recipes` table with JSONB fields for ingredients and instructions, allowing for flexible recipe structures without complex joins or migrations.
