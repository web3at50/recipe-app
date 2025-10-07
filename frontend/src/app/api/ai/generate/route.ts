import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createRecipeGenerationPrompt, parseRecipeFromAI } from '@/lib/ai/prompts';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ingredients, dietary_preferences, servings, prepTimeMax, difficulty } = body;

    // Validate inputs
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    // Generate recipe prompt
    const prompt = createRecipeGenerationPrompt({
      ingredients,
      dietary_preferences,
      servings,
      prepTimeMax,
      difficulty,
    });

    console.log('Generating recipe with OpenAI GPT-4.1...');

    // Call OpenAI GPT-4.1
    const { text } = await generateText({
      model: openai('gpt-4.1-2025-04-14'),
      prompt,
      temperature: 0.7,
      maxSteps: 1,
    });

    console.log('AI Response received');

    // Parse the AI response
    const recipe = parseRecipeFromAI(text);

    // Add source metadata
    recipe.source = 'ai_generated';

    return NextResponse.json({ recipe });
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
