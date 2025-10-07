import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/meal-plans - Get meal plans for a date range
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    // Check if meal plan exists for this date range
    const { data: mealPlan, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('start_date', startDate)
      .eq('end_date', endDate)
      .maybeSingle();

    if (error) {
      console.error('Error fetching meal plan:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no meal plan exists, create one
    let finalMealPlan = mealPlan;
    if (!finalMealPlan) {
      const { data: newMealPlan, error: createError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          start_date: startDate,
          end_date: endDate,
          name: `Week of ${startDate}`,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating meal plan:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      finalMealPlan = newMealPlan;
    }

    // Fetch meal plan items with recipes
    const { data: items, error: itemsError } = await supabase
      .from('meal_plan_items')
      .select(`
        *,
        recipes (*)
      `)
      .eq('meal_plan_id', finalMealPlan.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (itemsError) {
      console.error('Error fetching meal plan items:', itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({
      meal_plan: finalMealPlan,
      items: items || [],
    });
  } catch (error) {
    console.error('Error in GET /api/meal-plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
