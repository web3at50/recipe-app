import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { RecipeFormData } from '@/types/recipe';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/recipes/[id] - Get single recipe with details
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

    // Get recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Get ingredients
    const { data: ingredients } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', id)
      .order('order_index', { ascending: true });

    // Get instructions
    const { data: instructions } = await supabase
      .from('recipe_instructions')
      .select('*')
      .eq('recipe_id', id)
      .order('step_number', { ascending: true });

    // Get categories
    const { data: recipeCategories } = await supabase
      .from('recipe_categories')
      .select('category_id, categories(*)')
      .eq('recipe_id', id);

    interface CategoryRecord {
      categories: {
        id: string;
        name: string;
        description?: string;
      };
    }

    const categories = recipeCategories?.map((rc) => (rc as unknown as CategoryRecord).categories) || [];

    return NextResponse.json({
      ...recipe,
      ingredients: ingredients || [],
      instructions: instructions || [],
      categories,
    });
  } catch (error) {
    console.error('Error in GET /api/recipes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/recipes/[id] - Update recipe
export async function PUT(
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

    const body: RecipeFormData = await request.json();

    // Verify recipe ownership
    const { data: existingRecipe, error: checkError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Update recipe
    const { error: recipeError } = await supabase
      .from('recipes')
      .update({
        name: body.name,
        description: body.description || null,
        prep_time: body.prep_time || null,
        cook_time: body.cook_time || null,
        servings: body.servings,
      })
      .eq('id', id);

    if (recipeError) {
      console.error('Error updating recipe:', recipeError);
      return NextResponse.json({ error: recipeError.message }, { status: 500 });
    }

    // Delete existing ingredients and instructions
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
    await supabase.from('recipe_instructions').delete().eq('recipe_id', id);
    await supabase.from('recipe_categories').delete().eq('recipe_id', id);

    // Insert new ingredients
    if (body.ingredients && body.ingredients.length > 0) {
      const ingredientsToInsert = body.ingredients.map((ing, index) => ({
        recipe_id: id,
        item: ing.item,
        quantity: ing.quantity || null,
        unit: ing.unit || null,
        notes: ing.notes || null,
        order_index: index,
      }));

      await supabase.from('recipe_ingredients').insert(ingredientsToInsert);
    }

    // Insert new instructions
    if (body.instructions && body.instructions.length > 0) {
      const instructionsToInsert = body.instructions.map((inst, index) => ({
        recipe_id: id,
        step_number: index + 1,
        instruction: inst.instruction,
      }));

      await supabase.from('recipe_instructions').insert(instructionsToInsert);
    }

    // Insert new categories
    if (body.category_ids && body.category_ids.length > 0) {
      const categoriesToInsert = body.category_ids.map((catId) => ({
        recipe_id: id,
        category_id: catId,
      }));

      await supabase.from('recipe_categories').insert(categoriesToInsert);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/recipes/[id]:', error);
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

    // Delete recipe (CASCADE will delete related records)
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting recipe:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/recipes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/recipes/[id] - Toggle favorite status
export async function PATCH(
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

    const body = await request.json();
    const { is_favorite } = body;

    // Update favorite status
    const { error } = await supabase
      .from('recipes')
      .update({ is_favorite })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating favorite status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/recipes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
