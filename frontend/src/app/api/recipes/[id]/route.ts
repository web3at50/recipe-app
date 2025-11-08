import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { RecipeFormData } from '@/types/recipe';
import { detectAllergensInIngredients, UK_ALLERGENS } from '@/lib/allergen-detector';
import { generateRecipeFAQs } from '@/lib/faq-generator';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/recipes/[id] - Get single recipe (JSONB schema)
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get recipe (all data in one row now - no joins needed!)
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error in GET /api/recipes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/recipes/[id] - Update recipe (JSONB schema)
export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body: RecipeFormData = await request.json();

    // Verify recipe belongs to user
    const { data: existingRecipe } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

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

    // Update recipe (single update, all data in JSONB)
    const { data: recipe, error: updateError } = await supabase
      .from('recipes')
      .update({
        name: body.name,
        description: body.description || null,
        cuisine: body.cuisine || null,
        prep_time: body.prep_time || null,
        cook_time: body.cook_time || null,
        servings: body.servings,
        difficulty: body.difficulty || null,
        ingredients: body.ingredients, // JSONB
        instructions: body.instructions, // JSONB
        tags: body.tags || [], // Array
        allergens: finalAllergens, // Auto-detected + provided allergens
        faqs: generatedFAQs, // FAQ for LLM optimization
        nutrition: body.nutrition || null, // JSONB
        cost_per_serving: body.cost_per_serving || null,
        image_url: body.image_url || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating recipe:', updateError);
      return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Error in PUT /api/recipes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/recipes/[id] - Update specific fields (e.g., favorite)
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    // Verify recipe belongs to user
    const { data: existingRecipe } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Update only the fields provided (partial update)
    const updates: Record<string, unknown> = {};
    if ('is_favorite' in body) updates.is_favorite = body.is_favorite;
    if ('published' in body) updates.published = body.published;
    if ('flagged_for_review' in body) updates.flagged_for_review = body.flagged_for_review;

    const { data: recipe, error: updateError } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating recipe:', updateError);
      return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Error in PATCH /api/recipes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/recipes/[id] - Delete recipe
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Delete recipe (CASCADE will handle related data)
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting recipe:', deleteError);
      return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/recipes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
