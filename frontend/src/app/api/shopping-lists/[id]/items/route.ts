import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/shopping-lists/[id]/items - Add item to shopping list
export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const supabase = await createClient();
    const { id: listId } = await context.params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { item_name, quantity, category, recipe_id } = body;

    if (!item_name) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    // Insert item
    const { data: newItem, error } = await supabase
      .from('shopping_list_items')
      .insert({
        shopping_list_id: listId,
        item_name,
        quantity: quantity || null,
        category: category || null,
        recipe_id: recipe_id || null,
        checked: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding shopping list item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/shopping-lists/[id]/items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
