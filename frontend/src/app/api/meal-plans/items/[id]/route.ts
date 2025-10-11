import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// DELETE /api/meal-plans/items/[id] - Remove recipe from meal plan
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

    // Verify ownership through meal_plan
    const { data: item, error: itemError } = await supabase
      .from('meal_plan_items')
      .select('meal_plan_id, meal_plans!inner(user_id)')
      .eq('id', id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    interface MealPlanRecord {
      user_id: string;
    }

    const mealPlan = item.meal_plans as unknown as MealPlanRecord;
    if (mealPlan.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete item
    const { error } = await supabase
      .from('meal_plan_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting meal plan item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/meal-plans/items/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/meal-plans/items/[id] - Update meal plan item
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

    const body = await request.json();
    const { servings, notes } = body;

    // Update item
    const { data: item, error } = await supabase
      .from('meal_plan_items')
      .update({
        servings,
        notes: notes || null,
      })
      .eq('id', id)
      .select(`
        *,
        recipes (*)
      `)
      .single();

    if (error) {
      console.error('Error updating meal plan item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error in PUT /api/meal-plans/items/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
