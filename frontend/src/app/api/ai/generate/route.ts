import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createRecipeGenerationPrompt, parseRecipeFromAI } from '@/lib/ai/prompts';
import { logAIUsage, generateRequestId, generateSessionId } from '@/lib/ai/usage-tracker';
import { detectAllergensInText, detectAllergensInIngredients, groupMatchesByAllergen } from '@/lib/allergen-detector';

export async function POST(request: Request) {
  // Start timing for performance tracking
  const startTime = Date.now();
  const requestId = generateRequestId();
  const sessionId = request.headers.get('x-session-id') || generateSessionId();

  // Token usage tracking variables (populated by each provider)
  let inputTokens = 0;
  let outputTokens = 0;
  let cachedTokens = 0;
  let modelProvider = '';
  let modelName = '';
  let recipeGenerated = false;

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

      // Allow session-only overrides from request body (for temporary preference changes)
      if (body.preferences) {
        userPreferences = {
          ...userPreferences,
          ...body.preferences,
        };
      }
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
      cooking_mode,
      difficulty,
      spice_level,
      favourite_cuisine,
      pantry_staples,
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
    // Uses keyword-based detection from allergen-detector.ts
    const userAllergens = userPreferences.allergies || [];
    if (userAllergens.length > 0) {
      const allergenConflicts: string[] = [];
      const allergenDetails: string[] = [];

      ingredients.forEach((ingredient: string) => {
        const matches = detectAllergensInText(ingredient, userAllergens);
        if (matches.length > 0) {
          allergenConflicts.push(ingredient);
          matches.forEach(match => {
            allergenDetails.push(`${match.allergenLabel}: "${ingredient}" contains "${match.matchedKeyword}"`);
          });
        }
      });

      if (allergenConflicts.length > 0) {
        return NextResponse.json(
          {
            error: 'Safety Warning',
            message: `The following ingredients conflict with your allergen profile:\n\n${allergenDetails.join('\n')}\n\nPlease remove these ingredients and try again.`,
            conflicts: allergenConflicts,
          },
          { status: 400 }
        );
      }
    }

    // Fetch user's pantry staples (authenticated users only)
    // Allow session-only override from request body (for excluding items temporarily)
    let pantryStaplesArray: string[] = [];
    if (pantry_staples) {
      // Use overridden pantry staples from request (filtered list)
      pantryStaplesArray = pantry_staples;
    } else if (userId) {
      // Fetch from database if no override provided
      const supabase = await createClient();
      const { data: pantryData } = await supabase
        .from('user_pantry_staples')
        .select('item_pattern')
        .eq('user_id', userId);

      pantryStaplesArray = pantryData?.map((item) => item.item_pattern) || [];
    }

    // Use dietary preferences (already merged in userPreferences if overrides provided)
    // Legacy parameter dietary_preferences is kept for backward compatibility
    const mergedDietaryPrefs = dietary_preferences && dietary_preferences.length > 0
      ? dietary_preferences
      : (userPreferences.dietary_restrictions || []);

    // Use user preferences as defaults if not specified
    const finalServings = servings || userPreferences.household_size || 2;

    // Cooking mode is ONLY set per-recipe in /create-recipe (not stored in user preferences)
    // If undefined, defaults to 'standard' in prompt generation
    const finalCookingMode = cooking_mode || 'standard';

    // For slow cooker mode, ignore prepTimeMax constraint
    const finalPrepTimeMax = finalCookingMode === 'slow_cooker'
      ? undefined
      : (prepTimeMax || userPreferences.typical_cook_time || 30);

    const finalDifficulty = difficulty || userPreferences.cooking_skill || 'intermediate';
    const finalSpiceLevel = spice_level || userPreferences.spice_level || 'medium';

    // Handle cuisine preference: if specific cuisine provided (for multi-model distribution),
    // use it; otherwise use all preferred cuisines
    const cuisinePreference = favourite_cuisine
      ? [favourite_cuisine] // Single cuisine for this specific generation
      : (userPreferences.cuisines_liked || []); // All cuisines (AI will choose)

    // Generate recipe prompt with user context
    const prompt = createRecipeGenerationPrompt({
      ingredients,
      pantryStaples: pantryStaplesArray,
      ingredientMode: ingredient_mode as 'strict' | 'flexible' | 'creative',
      description,
      dietary_preferences: mergedDietaryPrefs,
      servings: finalServings,
      prepTimeMax: finalPrepTimeMax,
      cookingMode: finalCookingMode as 'standard' | 'slow_cooker' | 'air_fryer' | 'batch_cook',
      difficulty: finalDifficulty,
      spiceLevel: finalSpiceLevel,
      userPreferences: {
        allergies: userAllergens,
        cuisines_liked: cuisinePreference,
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

      // Extract token usage (VERIFIED property names from Vercel AI SDK)
      modelProvider = 'openai';
      modelName = openaiModel;
      inputTokens = result.usage?.inputTokens || 0;
      outputTokens = result.usage?.outputTokens || 0;
      cachedTokens = result.usage?.cachedInputTokens || 0;
      recipeGenerated = true;

      text = result.text;

    } else if (model === 'claude') {
      // Claude Haiku 4.5
      console.log('Generating recipe with Claude Haiku 4.5...');

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

      // Extract token usage (VERIFIED property names from Anthropic SDK)
      modelProvider = 'claude';
      modelName = 'claude-haiku-4-5-20251001';
      inputTokens = message.usage.input_tokens;
      outputTokens = message.usage.output_tokens;
      recipeGenerated = true;

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

      // Extract token usage (VERIFIED property names from Google GenAI SDK)
      modelProvider = 'gemini';
      modelName = 'gemini-2.0-flash-exp';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const usageMetadata = (result as any).usageMetadata;
      inputTokens = usageMetadata?.promptTokenCount || 0;
      outputTokens = usageMetadata?.candidatesTokenCount || 0;
      recipeGenerated = true;

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

      // Extract token usage (VERIFIED property names from XAI via OpenAI SDK)
      modelProvider = 'grok';
      modelName = 'grok-4-fast-reasoning';
      inputTokens = completion.usage?.prompt_tokens || 0;
      outputTokens = completion.usage?.completion_tokens || 0;
      recipeGenerated = true;

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
    // Uses keyword-based detection from allergen-detector.ts
    let allergenWarnings: string[] = [];
    if (userAllergens.length > 0 && recipe.ingredients) {
      // Extract ingredient text for detection
      const ingredientTexts = recipe.ingredients.map(ing => ing.item);

      const allergenMatches = detectAllergensInIngredients(
        ingredientTexts,
        userAllergens
      );

      if (allergenMatches.length > 0) {
        const grouped = groupMatchesByAllergen(allergenMatches);
        allergenWarnings = Object.entries(grouped).map(([allergen, ingredients]) =>
          `⚠️ ${allergen}: ${ingredients.join(', ')}`
        );
      }
    }

    // Add source metadata
    recipe.source = 'ai_generated';

    // Log AI usage for cost tracking and analytics (non-blocking)
    const responseTime = Date.now() - startTime;
    logAIUsage({
      userId: userId || undefined,
      sessionId,
      requestId,
      modelProvider: modelProvider as 'openai' | 'claude' | 'gemini' | 'grok',
      modelName,
      modelVersion: modelName,
      inputTokens,
      outputTokens,
      cachedTokens,
      complexityScore, // Log for all providers for analytics (OpenAI uses it for model selection)
      recipeGenerated,
      responseTimeMs: responseTime,
      ingredientCount: ingredients.length,
      allergenCount: userAllergens.length,
      dietaryRestrictionCount: mergedDietaryPrefs.length,
    }).catch((error) => {
      // Don't let logging errors affect the response
      console.error('Failed to log AI usage:', error);
    });

    return NextResponse.json({
      recipe,
      allergen_warnings: allergenWarnings.length > 0 ? allergenWarnings : undefined,
    });
  } catch (error) {
    console.error('Error in AI recipe generation:', error);

    // Log failed attempt for cost tracking (non-blocking)
    const responseTime = Date.now() - startTime;
    logAIUsage({
      userId: undefined,
      sessionId,
      requestId,
      modelProvider: (modelProvider || 'openai') as 'openai' | 'claude' | 'gemini' | 'grok',
      modelName: modelName || 'unknown',
      modelVersion: modelName || 'unknown',
      inputTokens: inputTokens || 0,
      outputTokens: 0,
      recipeGenerated: false,
      responseTimeMs: responseTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }).catch((logError) => {
      console.error('Failed to log error:', logError);
    });

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
