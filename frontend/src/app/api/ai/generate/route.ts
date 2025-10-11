import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createRecipeGenerationPrompt, parseRecipeFromAI } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Get authenticated user (optional - playground users won't have one)
    const { data: { user } } = await supabase.auth.getUser();

    // Load preferences from database (authenticated) or request body (playground)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userPreferences: any = {};
    if (user) {
      // Authenticated user - fetch from database
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      userPreferences = profile?.preferences || {};
    } else {
      // Playground user - use preferences from request body
      userPreferences = body.preferences || {};
    }
    const { ingredients, dietary_preferences, servings, prepTimeMax, difficulty } = body;

    // Validate inputs
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    // Check for allergen conflicts - SAFETY CRITICAL
    const userAllergens = userPreferences.allergies || [];
    if (userAllergens.length > 0) {
      const allergenConflicts = ingredients.filter((ingredient: string) =>
        userAllergens.some((allergen: string) =>
          ingredient.toLowerCase().includes(allergen.toLowerCase())
        )
      );

      if (allergenConflicts.length > 0) {
        return NextResponse.json(
          {
            error: 'Safety Warning',
            message: `The following ingredients conflict with your allergen profile: ${allergenConflicts.join(', ')}. Please remove them before generating.`,
            conflicts: allergenConflicts,
          },
          { status: 400 }
        );
      }
    }

    // Merge user dietary preferences with request preferences
    const mergedDietaryPrefs = [
      ...(userPreferences.dietary_restrictions || []),
      ...(dietary_preferences || []),
    ];

    // Use user preferences as defaults if not specified
    const finalServings = servings || userPreferences.household_size || 2;
    const finalPrepTimeMax = prepTimeMax || userPreferences.typical_cook_time || 30;
    const finalDifficulty = difficulty || userPreferences.cooking_skill || 'intermediate';

    // Generate recipe prompt with user context
    const prompt = createRecipeGenerationPrompt({
      ingredients,
      dietary_preferences: mergedDietaryPrefs,
      servings: finalServings,
      prepTimeMax: finalPrepTimeMax,
      difficulty: finalDifficulty,
      userPreferences: {
        allergies: userAllergens,
        cuisines_liked: userPreferences.cuisines_liked || [],
        spice_level: userPreferences.spice_level || 'medium',
      },
    });

    console.log('Generating recipe with OpenAI GPT-4.1...');

    // Call OpenAI GPT-4.1
    const { text } = await generateText({
      model: openai('gpt-4.1-2025-04-14'),
      prompt,
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    console.log('AI Response received');

    // Parse the AI response
    const recipe = parseRecipeFromAI(text);

    // Post-generation allergen safety check
    const allergenWarnings: string[] = [];
    if (userAllergens.length > 0 && recipe.ingredients) {
      recipe.ingredients.forEach((ingredient) => {
        const ingredientText = `${ingredient.item} ${ingredient.notes || ''}`.toLowerCase();
        userAllergens.forEach((allergen: string) => {
          const allergenLower = allergen.toLowerCase();
          // Check for allergen matches in ingredient text
          if (ingredientText.includes(allergenLower)) {
            allergenWarnings.push(`⚠️ Allergen detected: "${ingredient.item}" may contain ${allergen}`);
          }
          // Check for common derivatives
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

          const derivativeList = derivatives[allergenLower] || [];
          derivativeList.forEach((derivative) => {
            if (ingredientText.includes(derivative)) {
              allergenWarnings.push(`⚠️ Allergen detected: "${ingredient.item}" contains ${allergen} (${derivative})`);
            }
          });
        });
      });
    }

    // Add source metadata
    recipe.source = 'ai_generated';

    return NextResponse.json({
      recipe,
      allergen_warnings: allergenWarnings.length > 0 ? allergenWarnings : undefined,
    });
  } catch (error) {
    console.error('Error in AI recipe generation:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
}
