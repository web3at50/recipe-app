# AI Recipe Generation Enhancement Plan
**Date**: October 14, 2025
**Status**: In Progress

## Overview
Enhance the AI recipe generation feature on `/generate` to include pantry staples integration, flexible ingredient modes, and editable cooking parameters for a more personalized and flexible cooking experience.

---

## Current State Analysis

### What's Currently Included in AI Prompts:
- ✅ User allergens (with safety validation)
- ✅ Dietary restrictions (from profile + request)
- ✅ Cooking profile (skill, time, household size, spice level, cuisines)
- ✅ Manually entered ingredients from generate page
- ✅ Optional description field for recipe style/mood
- ❌ **Pantry staples NOT included** (exists in DB but not used)

### Current UI State:
- Read-only profile summary (servings, skill, time, spice)
- Editable: Ingredients, Description, Servings, AI Model
- Not editable: Skill Level, Max Time, Spice Level
- No pantry integration on generate page

---

## Objectives

### 1. Pantry Staples Integration
**Goal**: Include user's selected pantry items in recipe generation context

**Requirements**:
- Fetch user's pantry staples from `user_pantry_staples` table
- Display selected items on generate page (not all 45 standard items)
- Show as chip list with "Edit Pantry" link to `/settings/pantry-staples`
- Include in AI prompt based on ingredient mode

### 2. Ingredient Mode Toggle
**Goal**: Give users control over how strictly AI uses available ingredients

**Three Modes**:

#### Mode A: "No Shopping Needed" (Strict)
- **Use Case**: Sunday night, shops closed, cook with what's available
- **Behavior**: AI MUST only use ingredients from:
  - Available Ingredients (manual entry)
  - User's Pantry Staples
- **AI Instruction**: "You MUST only use ingredients from the available list. Do not add any additional ingredients."

#### Mode B: "Flexible" (Default - Current Behavior)
- **Use Case**: Normal weeknight cooking, happy to use pantry basics
- **Behavior**: Primarily use available ingredients, can add common staples
- **AI Instruction**: "Primarily use available ingredients, but you may add common pantry staples (oil, salt, pepper, stock cubes, etc.)"

#### Mode C: "Creative"
- **Use Case**: Weekend cooking, planning ahead, happy to shop
- **Behavior**: Use available ingredients as inspiration, can suggest additional ingredients
- **AI Instruction**: "Use available ingredients as inspiration. Feel free to add complementary ingredients to create an exceptional dish. Be creative and suggest additional ingredients that would elevate the recipe."

**UI Implementation**:
- Radio buttons or segmented control (3 options)
- Clear labels with helper text/icons
- Defaults to "Flexible" (Mode B)

### 3. Editable Cooking Parameters
**Goal**: Allow one-off overrides without changing saved preferences

**Add Editable Fields**:
- **Skill Level**: Dropdown (Beginner/Intermediate/Advanced)
- **Max Cooking Time**: Number input with "mins" suffix
- **Spice Level**: Dropdown (Mild/Medium/Hot)
- **Servings**: Already exists

**UX Flow**:
- Pre-populate with user's saved preferences
- Visual indicator of default vs custom values (optional)
- Changes apply to this generation only (don't update profile)

---

## Technical Implementation

### Files to Modify

#### 1. **API Route**: `frontend/src/app/api/ai/generate/route.ts`

**Changes**:
```typescript
// Add new parameter
const { ingredients, description, ingredient_mode = 'flexible', servings, prepTimeMax, difficulty, spice_level, model } = body;

// Fetch user's pantry staples
const { data: pantryStaples } = await supabase
  .from('user_pantry_staples')
  .select('item_pattern')
  .eq('user_id', userId);

const pantryItems = pantryStaples?.map(s => s.item_pattern) || [];

// Pass to prompt builder
const prompt = createRecipeGenerationPrompt({
  ingredients,
  pantryStaples: pantryItems,
  ingredientMode: ingredient_mode,
  description,
  dietary_preferences: mergedDietaryPrefs,
  servings: finalServings,
  prepTimeMax: prepTimeMax || userPreferences.typical_cook_time,
  difficulty: difficulty || userPreferences.cooking_skill,
  spiceLevel: spice_level || userPreferences.spice_level,
  userPreferences: {
    allergies: userAllergens,
    cuisines_liked: userPreferences.cuisines_liked || [],
  },
});
```

**Notes**:
- Fetch only for authenticated users (playground users won't have pantry)
- Handle case where user has no pantry items selected

#### 2. **Prompt Builder**: `frontend/src/lib/ai/prompts.ts`

**Changes**:
```typescript
export type IngredientMode = 'strict' | 'flexible' | 'creative';

export interface RecipeGenerationParams {
  ingredients: string[];
  pantryStaples?: string[]; // NEW
  ingredientMode?: IngredientMode; // NEW
  description?: string;
  dietary_preferences?: string[];
  servings?: number;
  prepTimeMax?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'beginner' | 'intermediate' | 'advanced';
  spiceLevel?: 'mild' | 'medium' | 'hot'; // NEW (was nested)
  userPreferences?: {
    allergies?: string[];
    cuisines_liked?: string[];
  };
}

export function createRecipeGenerationPrompt(params: RecipeGenerationParams): string {
  // ... existing code ...

  // Add pantry staples section
  if (params.pantryStaples && params.pantryStaples.length > 0) {
    prompt += `PANTRY STAPLES AVAILABLE:\n${params.pantryStaples.join(', ')}\n\n`;
  }

  prompt += `AVAILABLE INGREDIENTS:\n${ingredients.join('\n')}\n\n`;

  // Ingredient mode instructions
  const ingredientMode = params.ingredientMode || 'flexible';

  if (ingredientMode === 'strict') {
    prompt += `⚠️ IMPORTANT: You MUST only use ingredients from the available ingredients and pantry staples listed above. Do not add any additional ingredients under any circumstances.\n\n`;
  } else if (ingredientMode === 'flexible') {
    prompt += `Primarily use the available ingredients and pantry staples listed above. You may add common UK pantry basics (salt, pepper, oil, butter, stock cubes) if needed, but keep additions minimal.\n\n`;
  } else if (ingredientMode === 'creative') {
    prompt += `Use the available ingredients as inspiration. Feel free to suggest additional complementary ingredients that would elevate this dish. Be creative and don't be afraid to recommend a shopping list of 2-3 special ingredients that would make this recipe exceptional.\n\n`;
  }

  // ... rest of existing code ...
}
```

#### 3. **Generate Page**: `frontend/src/app/(dashboard)/generate/page.tsx`

**Changes**:
```typescript
// Add state
const [ingredientMode, setIngredientMode] = useState<'strict' | 'flexible' | 'creative'>('flexible');
const [skillLevel, setSkillLevel] = useState<string | null>(null);
const [maxCookTime, setMaxCookTime] = useState<number | null>(null);
const [spiceLevel, setSpiceLevel] = useState<string | null>(null);
const [pantryStaples, setPantryStaples] = useState<string[]>([]);

// Fetch pantry staples
useEffect(() => {
  const fetchPantryStaples = async () => {
    try {
      const response = await fetch('/api/user/pantry-staples');
      if (response.ok) {
        const data = await response.json();
        const items = data.staples?.map((s: any) => s.item_pattern) || [];
        setPantryStaples(items);
      }
    } catch (error) {
      console.error('Failed to fetch pantry staples:', error);
    }
  };
  fetchPantryStaples();
}, []);

// Update handleGenerate to include new params
body: JSON.stringify({
  ingredients,
  description: descriptionText.trim() || undefined,
  ingredient_mode: ingredientMode,
  servings: servings || 4,
  prepTimeMax: maxCookTime || undefined,
  difficulty: skillLevel || undefined,
  spice_level: spiceLevel || undefined,
  model: selectedModel,
}),
```

**UI Components to Add**:

1. **Pantry Staples Display** (before ingredient input):
```tsx
{pantryStaples.length > 0 && (
  <Card className="mb-6">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-base">Your Pantry Staples</CardTitle>
        <Button variant="link" asChild>
          <Link href="/settings/pantry-staples">Edit Pantry →</Link>
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        {pantryStaples.map((item, index) => (
          <Badge key={index} variant="secondary">{item}</Badge>
        ))}
      </div>
    </CardContent>
  </Card>
)}
```

2. **Ingredient Mode Toggle**:
```tsx
<div className="space-y-2">
  <Label>Ingredient Mode</Label>
  <RadioGroup value={ingredientMode} onValueChange={(v) => setIngredientMode(v as any)}>
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="strict" id="strict" />
        <Label htmlFor="strict" className="font-normal">
          🔒 No Shopping Needed
          <span className="text-xs text-muted-foreground block">Use only what I have</span>
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="flexible" id="flexible" />
        <Label htmlFor="flexible" className="font-normal">
          🧑‍🍳 Flexible (Recommended)
          <span className="text-xs text-muted-foreground block">Mainly use what I have + pantry basics</span>
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="creative" id="creative" />
        <Label htmlFor="creative" className="font-normal">
          ✨ Creative
          <span className="text-xs text-muted-foreground block">Inspire me with new ingredients</span>
        </Label>
      </div>
    </div>
  </RadioGroup>
</div>
```

3. **Editable Parameters** (in existing input card):
```tsx
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="skillLevel">Skill Level</Label>
    <Select
      value={skillLevel || userPreferences?.cooking_skill || 'intermediate'}
      onValueChange={setSkillLevel}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="beginner">Beginner</SelectItem>
        <SelectItem value="intermediate">Intermediate</SelectItem>
        <SelectItem value="advanced">Advanced</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div className="space-y-2">
    <Label htmlFor="maxTime">Max Time (mins)</Label>
    <Input
      id="maxTime"
      type="number"
      min="10"
      max="180"
      value={maxCookTime || userPreferences?.typical_cook_time || 30}
      onChange={(e) => setMaxCookTime(parseInt(e.target.value))}
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="spiceLevel">Spice Level</Label>
    <Select
      value={spiceLevel || userPreferences?.spice_level || 'medium'}
      onValueChange={setSpiceLevel}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="mild">Mild</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="hot">Hot</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
```

#### 4. **Types**: `frontend/src/types/index.ts`

**Add**:
```typescript
export type IngredientMode = 'strict' | 'flexible' | 'creative';
```

---

## Implementation Sequence

### Phase 1: Backend & Types
1. ✅ Update types for `IngredientMode`
2. ✅ Modify API route to fetch pantry staples
3. ✅ Update prompt builder with ingredient mode logic

### Phase 2: Frontend UI
4. ✅ Add pantry staples display card
5. ✅ Add ingredient mode toggle
6. ✅ Add editable cooking parameters
7. ✅ Wire up state and API calls

### Phase 3: Testing
8. ✅ Test "No Shopping Needed" mode (strict)
9. ✅ Test "Flexible" mode (default)
10. ✅ Test "Creative" mode
11. ✅ Test parameter overrides work correctly
12. ✅ Test for users with no pantry staples
13. ✅ Test for playground users (no auth)

---

## Success Criteria

- [ ] Users can see their selected pantry staples on generate page
- [ ] Three ingredient modes produce noticeably different AI behavior
- [ ] "No Shopping Needed" mode strictly uses only available ingredients
- [ ] "Flexible" mode matches current behavior (pantry basics allowed)
- [ ] "Creative" mode suggests additional ingredients freely
- [ ] Users can override Skill Level, Max Time, Spice Level for one generation
- [ ] Link to pantry settings works and allows editing
- [ ] Default mode is "Flexible"
- [ ] Works for both authenticated and playground users
- [ ] No errors when user has zero pantry items

---

## Future Considerations (Not in This Task)

- **Settings Page**: Create `/settings/preferences` to edit allergens, dietary restrictions, cooking profile
- **Mobile Responsive**: Review UI layout for mobile devices
- **Pantry Auto-Detection**: Suggest pantry items based on frequently used ingredients
- **Recipe History**: Remember ingredient mode preferences per user

---

## Questions & Decisions

### Q: Show pantry items to playground users?
**A**: No - they don't have accounts, so no pantry data

### Q: What if user has 30+ pantry items?
**A**: Display in scrollable/wrapped chip list, consider pagination if needed

### Q: Should we persist ingredient mode preference?
**A**: Not in this task - default to "Flexible" each time (can add later)

### Q: Validate that strict mode doesn't break AI?
**A**: Yes - test thoroughly. If AI struggles, may need to adjust prompt wording

---

## Notes

- Ingredient mode naming: "No Shopping Needed" / "Flexible" / "Creative" (user-friendly, not technical)
- Keep 2-column layout (input left, output right)
- Pantry page link: `/settings/pantry-staples`
- API already accepts `prepTimeMax`, `difficulty` params - just need UI exposure
