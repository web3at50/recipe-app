export interface RecipeGenerationParams {
  ingredients: string[];
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

export function createRecipeGenerationPrompt(params: RecipeGenerationParams): string {
  const {
    ingredients,
    dietary_preferences = [],
    servings = 4,
    prepTimeMax,
    difficulty,
    userPreferences,
  } = params;

  let prompt = `You are a professional UK-based chef assistant helping a home cook. Generate a delicious, practical recipe.\n\n`;

  // User Context (personalization)
  if (userPreferences) {
    prompt += `USER PROFILE:\n`;

    if (userPreferences.allergies && userPreferences.allergies.length > 0) {
      prompt += `⚠️ CRITICAL - ALLERGENS TO AVOID: ${userPreferences.allergies.join(', ')}\n`;
      prompt += `DO NOT include these ingredients or their derivatives under any circumstances.\n`;
    }

    if (userPreferences.cuisines_liked && userPreferences.cuisines_liked.length > 0) {
      prompt += `- Preferred cuisines: ${userPreferences.cuisines_liked.join(', ')}\n`;
    }

    if (userPreferences.spice_level) {
      const spiceGuidance = {
        mild: 'Keep spices gentle - suitable for those who prefer less heat',
        medium: 'Moderate spice level - balanced heat',
        hot: 'Make it spicy - this cook enjoys bold, hot flavors'
      };
      prompt += `- Spice preference: ${spiceGuidance[userPreferences.spice_level]}\n`;
    }

    prompt += `\n`;
  }

  prompt += `AVAILABLE INGREDIENTS:\n${ingredients.join('\n')}\n\n`;

  prompt += `REQUIREMENTS:\n`;
  prompt += `- Servings: ${servings}\n`;

  if (dietary_preferences.length > 0) {
    prompt += `- Dietary Requirements: ${dietary_preferences.join(', ')}\n`;
  }

  if (prepTimeMax) {
    prompt += `- Maximum Total Time: ${prepTimeMax} minutes (including prep and cook)\n`;
  }

  if (difficulty) {
    const difficultyMap = {
      'beginner': 'Easy - suitable for beginners, simple techniques',
      'easy': 'Easy - suitable for beginners, simple techniques',
      'intermediate': 'Intermediate - moderate cooking skills required',
      'medium': 'Intermediate - moderate cooking skills required',
      'advanced': 'Advanced - complex techniques, experienced cook',
      'hard': 'Advanced - complex techniques, experienced cook'
    };
    prompt += `- Difficulty: ${difficultyMap[difficulty as keyof typeof difficultyMap] || difficulty}\n`;
  }

  prompt += `- Use UK measurements and terminology\n`;
  prompt += `- Use ONLY these units: g, kg, ml, l, tsp, tbsp, whole, clove, tin, can, cube, slice, piece, pinch, handful, or 'to taste'\n`;
  prompt += `- Suggest UK-available ingredients\n`;

  prompt += `\nPlease provide a complete recipe in the following JSON format:

{
  "name": "Recipe Name",
  "description": "A brief description of the dish",
  "prep_time": 15,
  "cook_time": 30,
  "servings": ${servings},
  "ingredients": [
    {
      "item": "ingredient name",
      "quantity": "200",
      "unit": "g",
      "notes": "optional notes like 'chopped' or 'diced'"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "instruction": "Detailed step instruction"
    }
  ]
}

Important:
- Use ONLY the ingredients I provided, or common pantry staples (salt, pepper, oil, etc.)
- Include specific quantities and units
- Provide clear, step-by-step instructions
- Make it practical and achievable
- Return ONLY valid JSON, no additional text`;

  return prompt;
}

interface ParsedRecipe {
  name: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  source?: 'ai_generated' | 'user_created';
  ingredients: Array<{
    item: string;
    quantity?: string | number; // Accept both for compatibility
    unit?: string;
    notes?: string;
  }>;
  instructions: Array<{
    step?: number;
    step_number?: number; // Support old format temporarily
    instruction: string;
  }>;
}

export function parseRecipeFromAI(text: string): ParsedRecipe {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('No valid JSON found in AI response');
  }

  try {
    const recipe = JSON.parse(jsonMatch[0]) as ParsedRecipe;

    // Validate required fields
    if (!recipe.name || !recipe.ingredients || !recipe.instructions) {
      throw new Error('Missing required recipe fields');
    }

    // Normalize ingredients: convert quantity to string
    recipe.ingredients = recipe.ingredients.map(ing => ({
      item: ing.item,
      quantity: ing.quantity !== undefined ? String(ing.quantity) : undefined,
      unit: ing.unit,
      notes: ing.notes
    }));

    // Normalize instructions: use 'step' field (support both step_number and step)
    recipe.instructions = recipe.instructions.map((inst, index) => ({
      step: inst.step || inst.step_number || index + 1,
      instruction: inst.instruction
    }));

    return recipe;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Invalid recipe format from AI');
  }
}
