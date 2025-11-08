import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { RecipeFormData } from '@/types/recipe';
import { detectAllergensInIngredients, UK_ALLERGENS } from '@/lib/allergen-detector';
import { generateRecipeFAQs } from '@/lib/faq-generator';

// GET /api/recipes - List all user's recipes (JSONB schema)
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const favorite = searchParams.get('favorite') === 'true';
    const cuisine = searchParams.get('cuisine');
    const tag = searchParams.get('tag');

    // Build query (single table, no joins!)
    let query = supabase
      .from('recipes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (favorite) {
      query = query.eq('is_favorite', true);
    }
    if (cuisine) {
      query = query.eq('cuisine', cuisine);
    }
    if (tag) {
      query = query.contains('tags', [tag]); // Array contains operator
    }

    const { data: recipes, error, count } = await query;

    if (error) {
      console.error('Error fetching recipes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      recipes: recipes || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('Error in GET /api/recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/recipes - Create a new recipe (JSONB schema - single insert!)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const body: RecipeFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.ingredients?.length || !body.instructions?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: name, ingredients, and instructions are required' },
        { status: 400 }
      );
    }

    // Add step numbers to instructions if not provided
    const instructions = body.instructions.map((inst, index) => ({
      step: inst.step || index + 1,
      instruction: inst.instruction
    }));

    // Auto-detect allergens from ingredients (server-side validation)
    const allAllergenIds = UK_ALLERGENS.map(a => a.id);
    const detectedMatches = detectAllergensInIngredients(
      body.ingredients,
      allAllergenIds
    );

    // Get unique allergen IDs
    const detectedAllergens = [...new Set(detectedMatches.map(m => m.allergen))];

    // Merge with provided allergens (if any)
    const finalAllergens = [
      ...new Set([...(body.allergens || []), ...detectedAllergens])
    ];

    // Generate comprehensive FAQs for LLM optimization
    const generatedFAQs = generateRecipeFAQs({
      name: body.name,
      allergens: finalAllergens,
      tags: body.tags,
      prep_time: body.prep_time,
      cook_time: body.cook_time,
      difficulty: body.difficulty,
    });

    // Create recipe (everything in one insert!)
    const { data: recipe, error: recipeError} = await supabase
      .from('recipes')
      .insert({
        user_id: userId,
        name: body.name,
        description: body.description || null,
        cuisine: body.cuisine || null,
        prep_time: body.prep_time || null,
        cook_time: body.cook_time || null,
        servings: body.servings,
        difficulty: body.difficulty || null,
        source: (body as { source?: string }).source || 'user_created', // Accept source from body or default
        ai_model: (body as { ai_model?: string }).ai_model || null, // Store AI model if provided
        ingredients: body.ingredients, // JSONB array
        instructions: instructions, // JSONB array
        tags: body.tags || [], // Simple array
        allergens: finalAllergens, // Auto-detected + provided allergens
        faqs: generatedFAQs, // FAQ for LLM optimization
        nutrition: body.nutrition || null, // JSONB object
        cost_per_serving: body.cost_per_serving || null,
        image_url: body.image_url || null,
      })
      .select()
      .single();

    if (recipeError) {
      console.error('Error creating recipe:', recipeError);
      return NextResponse.json({ error: recipeError.message }, { status: 500 });
    }

    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
