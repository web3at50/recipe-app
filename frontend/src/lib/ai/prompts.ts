export type IngredientMode = 'strict' | 'flexible' | 'creative';

export interface RecipeGenerationParams {
  ingredients: string[];
  pantryStaples?: string[]; // User's selected pantry items
  ingredientMode?: IngredientMode; // How strictly to use available ingredients
  description?: string; // Optional natural language description of desired dish
  dietary_preferences?: string[];
  servings?: number;
  prepTimeMax?: number;
  cookingMode?: 'standard' | 'slow_cooker' | 'air_fryer' | 'batch_cook'; // Cooking method
  difficulty?: 'easy' | 'medium' | 'hard' | 'beginner' | 'intermediate' | 'advanced';
  spiceLevel?: 'mild' | 'medium' | 'hot'; // Elevated from nested object
  userPreferences?: {
    allergies?: string[];
    cuisines_liked?: string[];
  };
}

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

    prompt += `\n`;
  }

  // Pantry staples section
  if (pantryStaples && pantryStaples.length > 0) {
    prompt += `PANTRY STAPLES AVAILABLE:\n${pantryStaples.join(', ')}\n\n`;
  }

  prompt += `AVAILABLE INGREDIENTS:\n${ingredients.join('\n')}\n\n`;

  // Ingredient mode instructions
  if (ingredientMode === 'strict') {
    prompt += `⚠️ IMPORTANT - INGREDIENT CONSTRAINT:\n`;
    prompt += `You MUST only use ingredients from the available ingredients and pantry staples listed above. `;
    prompt += `Do not add any additional ingredients under any circumstances. `;
    prompt += `The cook does not want to go shopping and only wants to use what they have at home.\n\n`;
  } else if (ingredientMode === 'flexible') {
    prompt += `INGREDIENT GUIDANCE:\n`;
    prompt += `Primarily use the available ingredients and pantry staples listed above. `;
    prompt += `You may add common UK pantry basics (salt, pepper, oil, butter, stock cubes) if needed, but keep additions minimal.\n\n`;
  } else if (ingredientMode === 'creative') {
    prompt += `CREATIVE MODE:\n`;
    prompt += `Use the available ingredients as inspiration. Feel free to suggest additional complementary ingredients that would elevate this dish. `;
    prompt += `Be creative and don't be afraid to recommend 2-3 special ingredients that would make this recipe exceptional. `;
    prompt += `The cook is happy to go shopping for quality ingredients.\n\n`;
  }

  // Add user's vision/description if provided
  if (description && description.trim().length > 0) {
    prompt += `USER'S VISION:\n${description.trim()}\n\n`;
    prompt += `Create a recipe that uses the available ingredients and matches the user's vision for the dish.\n\n`;
  }

  // COOKING MODE INSTRUCTIONS
  if (cookingMode === 'slow_cooker') {
    prompt += `\n⚠️ SLOW COOKER MODE - SPECIAL INSTRUCTIONS:\n`;
    prompt += `You MUST generate a recipe specifically designed for slow cooker cooking.\n\n`;

    prompt += `SLOW COOKER REQUIREMENTS:\n`;
    prompt += `- Recipe Structure: Provide TWO distinct time sets:\n`;
    prompt += `  * Active Prep Time (prep_time): 10-30 minutes for chopping, browning, assembling\n`;
    prompt += `  * Slow Cook Time (cook_time): 180-240 minutes (3-4 hours) on HIGH or 360-600 minutes (6-10 hours) on LOW\n`;
    prompt += `- Temperature Setting: Include in description whether recipe uses LOW (6-10hrs) or HIGH (3-4hrs) setting\n`;
    prompt += `- IGNORE any typical cooking time constraints - slow cooker recipes naturally take longer\n\n`;

    prompt += `PREPARATION METHOD:\n`;
    prompt += `- For MEAT dishes: Consider including an optional browning/searing step on hob before slow cooking\n`;
    prompt += `  * If browning: Add as step 1, note it's optional but recommended for flavor\n`;
    prompt += `  * Time: Add 10-15 mins to prep_time if browning included\n`;
    prompt += `- For VEGETARIAN dishes: Usually direct to slow cooker, no pre-cooking needed\n`;
    prompt += `- For dishes with AROMATICS (onions, garlic): Optional 5-min sauté improves flavor\n\n`;

    prompt += `LIQUID REQUIREMENTS:\n`;
    prompt += `- Slow cookers trap moisture - use LESS liquid than stovetop/oven recipes\n`;
    prompt += `- Most recipes need only 150-300ml liquid (stock, wine, water)\n`;
    prompt += `- EXCEPTION: Soups and stews can have more liquid (500ml+)\n\n`;

    prompt += `INGREDIENT CONSIDERATIONS:\n`;
    prompt += `- Vegetables: Cut into larger chunks (2-3cm) to prevent mushiness\n`;
    prompt += `- Dairy: Add in last 30 minutes to prevent curdling\n`;
    prompt += `- Fresh herbs: Add in last 30 minutes to preserve flavor\n`;
    prompt += `- Dried herbs/spices: Add at start, flavors intensify over long cooking\n\n`;

    prompt += `INSTRUCTIONS FORMAT:\n`;
    prompt += `1. Prep steps (chopping, seasoning)\n`;
    prompt += `2. [If applicable] Optional browning step on hob with timing\n`;
    prompt += `3. Assembly in slow cooker with layering order\n`;
    prompt += `4. Slow cooker setting (LOW 8hrs or HIGH 4hrs) - be specific in instructions\n`;
    prompt += `5. [If applicable] Final additions in last 30 mins\n`;
    prompt += `6. Serving suggestions\n\n`;

    prompt += `EXAMPLE TIMING:\n`;
    prompt += `"prep_time": 20,  // Active hands-on prep work\n`;
    prompt += `"cook_time": 480, // 8 hours on LOW (or 240 for 4 hours on HIGH)\n\n`;
  }

  prompt += `REQUIREMENTS:\n`;
  prompt += `- Servings: ${servings}\n`;

  if (dietary_preferences.length > 0) {
    prompt += `- Dietary Requirements: ${dietary_preferences.join(', ')}\n`;
  }

  // Only add time constraint for non-slow-cooker modes
  if (cookingMode !== 'slow_cooker' && prepTimeMax) {
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

  if (spiceLevel) {
    const spiceGuidance = {
      mild: 'Mild - Keep spices gentle, suitable for those who prefer less heat',
      medium: 'Medium - Moderate spice level with balanced heat',
      hot: 'Hot - Make it spicy with bold, hot flavors'
    };
    prompt += `- Spice Level: ${spiceGuidance[spiceLevel]}\n`;
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
- Use the available ingredients to create a recipe that ${description ? 'matches the user\'s vision described above' : 'is delicious and practical'}
- You may use common pantry staples (salt, pepper, oil, etc.) in addition to listed ingredients
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
