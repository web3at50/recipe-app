import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createRecipeGenerationPrompt, parseRecipeFromAI } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Get authenticated user (optional - playground users won't have one)
    const { userId } = await auth();

    // Load preferences from database (authenticated) or request body (playground)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userPreferences: any = {};
    if (userId) {
      // Authenticated user - fetch from database
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      userPreferences = profile?.preferences || {};
    } else {
      // Playground user - use preferences from request body
      userPreferences = body.preferences || {};
    }
    const {
      ingredients,
      description,
      ingredient_mode = 'flexible',
      dietary_preferences,
      servings,
      prepTimeMax,
      difficulty,
      spice_level,
      model = 'openai'
    } = body;

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

    // Fetch user's pantry staples (authenticated users only)
    let pantryStaples: string[] = [];
    if (userId) {
      const supabase = await createClient();
      const { data: pantryData } = await supabase
        .from('user_pantry_staples')
        .select('item_pattern')
        .eq('user_id', userId);

      pantryStaples = pantryData?.map((item) => item.item_pattern) || [];
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
    const finalSpiceLevel = spice_level || userPreferences.spice_level || 'medium';

    // Generate recipe prompt with user context
    const prompt = createRecipeGenerationPrompt({
      ingredients,
      pantryStaples,
      ingredientMode: ingredient_mode as 'strict' | 'flexible' | 'creative',
      description,
      dietary_preferences: mergedDietaryPrefs,
      servings: finalServings,
      prepTimeMax: finalPrepTimeMax,
      difficulty: finalDifficulty,
      spiceLevel: finalSpiceLevel,
      userPreferences: {
        allergies: userAllergens,
        cuisines_liked: userPreferences.cuisines_liked || [],
      },
    });

    // Calculate complexity score for OpenAI model selection
    const complexityScore = calculateComplexityScore({
      ingredientCount: ingredients.length,
      allergenCount: userAllergens.length,
      dietaryRestrictionCount: mergedDietaryPrefs.length,
      descriptionLength: description?.trim().length || 0,
    });

    console.log(`Complexity score: ${complexityScore} (threshold: 8)`);

    // Multi-model routing
    let text: string;

    if (model === 'openai') {
      // OpenAI: Use mini for simple, full for complex
      const openaiModel = complexityScore > 8
        ? 'gpt-4.1-2025-04-14'  // Complex: Use full GPT-4.1
        : 'gpt-4.1-mini-2025-04-14';  // Simple: Use GPT-4.1 mini

      console.log(`Generating recipe with OpenAI ${openaiModel}...`);

      const result = await generateText({
        model: openai(openaiModel),
        prompt,
        temperature: 0.7,
        maxOutputTokens: 2000,
      });
      text = result.text;

    } else if (model === 'claude') {
      // Claude Sonnet 4.5
      console.log('Generating recipe with Claude Sonnet 4.5...');

      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        temperature: 0.7,
        system: "You are a professional UK-based chef assistant. Generate recipes in the exact JSON format requested.",
        messages: [{ role: 'user', content: prompt }],
      });

      // Extract text from Claude response
      const contentBlock = message.content[0];
      text = contentBlock.type === 'text' ? contentBlock.text : '';

    } else if (model === 'gemini') {
      // Gemini 2.5 Flash (PAID TIER)
      console.log('Generating recipe with Gemini 2.5 Flash (paid tier)...');

      const { GoogleGenAI } = await import('@google/genai');
      const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

      const result = await genai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });

      text = result.text || '';

    } else if (model === 'grok') {
      // XAI Grok 4 Fast Reasoning
      console.log('Generating recipe with XAI Grok 4 Fast Reasoning...');

      // Verify API key is configured
      if (!process.env.XAI_API_KEY) {
        throw new Error('XAI API key not configured');
      }

      // Use OpenAI SDK with XAI base URL
      const OpenAI = (await import('openai')).default;
      const xai = new OpenAI({
        apiKey: process.env.XAI_API_KEY,
        baseURL: 'https://api.x.ai/v1',
      });

      const completion = await xai.chat.completions.create({
        model: 'grok-4-fast-reasoning',
        messages: [
          {
            role: 'system',
            content: 'You are a professional UK-based chef assistant. Generate recipes in the exact JSON format requested. Use your reasoning capabilities to ensure allergen safety and dietary compliance.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      text = completion.choices[0]?.message?.content || '';

      if (!text) {
        throw new Error('Empty response from Grok API');
      }

    } else {
      throw new Error('Invalid model specified');
    }

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

/**
 * Calculate complexity score for recipe generation
 * Score > 8 triggers GPT-4.1 instead of GPT-4.1 mini
 */
function calculateComplexityScore(params: {
  ingredientCount: number;
  allergenCount: number;
  dietaryRestrictionCount: number;
  descriptionLength: number;
}): number {
  let score = 0;

  // Ingredient complexity (0.5 points per ingredient)
  score += params.ingredientCount * 0.5;

  // Allergen complexity (3 points per allergen - safety critical)
  score += params.allergenCount * 3;

  // Dietary restriction complexity (2 points per restriction)
  score += params.dietaryRestrictionCount * 2;

  // Description complexity (enhanced: +2 if >50 chars, +1 otherwise)
  if (params.descriptionLength > 50) {
    score += 2;
  } else if (params.descriptionLength > 0) {
    score += 1;
  }

  return score;
}
