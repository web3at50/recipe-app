export interface RecipeGenerationParams {
  ingredients: string[];
  dietary_preferences?: string[];
  servings?: number;
  prepTimeMax?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export function createRecipeGenerationPrompt(params: RecipeGenerationParams): string {
  const {
    ingredients,
    dietary_preferences = [],
    servings = 4,
    prepTimeMax,
    difficulty,
  } = params;

  let prompt = `You are a professional chef assistant. Generate a delicious recipe based on the following ingredients:\n\n`;
  prompt += `Available Ingredients:\n${ingredients.join('\n')}\n\n`;

  prompt += `Requirements:\n`;
  prompt += `- Servings: ${servings}\n`;

  if (dietary_preferences.length > 0) {
    prompt += `- Dietary Preferences: ${dietary_preferences.join(', ')}\n`;
  }

  if (prepTimeMax) {
    prompt += `- Maximum Total Time: ${prepTimeMax} minutes\n`;
  }

  if (difficulty) {
    prompt += `- Difficulty Level: ${difficulty}\n`;
  }

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
      "quantity": 2,
      "unit": "cups",
      "notes": "optional notes like 'chopped' or 'diced'"
    }
  ],
  "instructions": [
    {
      "step_number": 1,
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
  ingredients: Array<{
    item: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    step_number: number;
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

    return recipe;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('Invalid recipe format from AI');
  }
}
