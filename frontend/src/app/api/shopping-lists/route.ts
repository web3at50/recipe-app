import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/shopping-lists - Get user's shopping lists
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active shopping lists
    const { data: lists, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shopping lists:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lists: lists || [] });
  } catch (error) {
    console.error('Error in GET /api/shopping-lists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/shopping-lists - Create new shopping list
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name = 'Shopping List', meal_plan_id } = body;

    // Create shopping list
    const { data: list, error } = await supabase
      .from('shopping_lists')
      .insert({
        user_id: user.id,
        name,
        meal_plan_id: meal_plan_id || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating shopping list:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ list }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/shopping-lists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
