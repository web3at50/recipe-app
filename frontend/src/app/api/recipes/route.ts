import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { RecipeFormData } from '@/types/recipe';

// GET /api/recipes - List all user's recipes
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for filtering/pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const favorite = searchParams.get('favorite') === 'true';

    // Build query
    let query = supabase
      .from('recipes')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (favorite) {
      query = query.eq('is_favorite', true);
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

// POST /api/recipes - Create a new recipe
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: RecipeFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.ingredients?.length || !body.instructions?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        user_id: user.id,
        name: body.name,
        description: body.description || null,
        prep_time: body.prep_time || null,
        cook_time: body.cook_time || null,
        servings: body.servings,
        source: 'manual',
      })
      .select()
      .single();

    if (recipeError) {
      console.error('Error creating recipe:', recipeError);
      return NextResponse.json({ error: recipeError.message }, { status: 500 });
    }

    // Create ingredients
    const ingredientsToInsert = body.ingredients.map((ing, index) => ({
      recipe_id: recipe.id,
      item: ing.item,
      quantity: ing.quantity || null,
      unit: ing.unit || null,
      notes: ing.notes || null,
      order_index: index,
    }));

    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredientsToInsert);

    if (ingredientsError) {
      console.error('Error creating ingredients:', ingredientsError);
      // Rollback recipe creation
      await supabase.from('recipes').delete().eq('id', recipe.id);
      return NextResponse.json({ error: ingredientsError.message }, { status: 500 });
    }

    // Create instructions
    const instructionsToInsert = body.instructions.map((inst, index) => ({
      recipe_id: recipe.id,
      step_number: index + 1,
      instruction: inst.instruction,
    }));

    const { error: instructionsError } = await supabase
      .from('recipe_instructions')
      .insert(instructionsToInsert);

    if (instructionsError) {
      console.error('Error creating instructions:', instructionsError);
      // Rollback recipe creation
      await supabase.from('recipes').delete().eq('id', recipe.id);
      return NextResponse.json({ error: instructionsError.message }, { status: 500 });
    }

    // Add categories if provided
    if (body.category_ids && body.category_ids.length > 0) {
      const categoriesToInsert = body.category_ids.map((catId) => ({
        recipe_id: recipe.id,
        category_id: catId,
      }));

      await supabase.from('recipe_categories').insert(categoriesToInsert);
    }

    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
