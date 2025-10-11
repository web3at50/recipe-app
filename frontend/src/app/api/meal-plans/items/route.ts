import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/meal-plans/items - Add recipe to meal plan
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const body = await request.json();
    const { meal_plan_id, recipe_id, date, meal_type, servings = 4, notes } = body;

    // Validate required fields
    if (!meal_plan_id || !recipe_id || !date || !meal_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify meal plan ownership
    const { data: mealPlan, error: planError } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('id', meal_plan_id)
      .eq('user_id', userId)
      .single();

    if (planError || !mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 });
    }

    // Insert meal plan item
    const { data: item, error } = await supabase
      .from('meal_plan_items')
      .insert({
        meal_plan_id,
        recipe_id,
        date,
        meal_type,
        servings,
        notes: notes || null,
      })
      .select(`
        *,
        recipes (*)
      `)
      .single();

    if (error) {
      console.error('Error adding meal plan item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/meal-plans/items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
