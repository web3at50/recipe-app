import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { RecipeFormData } from '@/types/recipe';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/recipes/[id] - Get single recipe (JSONB schema)
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recipe (all data in one row now - no joins needed!)
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
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
    const supabase = await createClient();
    const { id } = await context.params;
    const body: RecipeFormData = await request.json();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify recipe belongs to user
    const { data: existingRecipe } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

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
        allergens: body.allergens || [], // Array
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
    const supabase = await createClient();
    const { id } = await context.params;
    const body = await request.json();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify recipe belongs to user
    const { data: existingRecipe } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
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
    const supabase = await createClient();
    const { id } = await context.params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete recipe (CASCADE will handle related data)
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

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
