import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PUT /api/shopping-lists/items/[id] - Update shopping list item
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

    // Update item
    const { data: item, error } = await supabase
      .from('shopping_list_items')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating shopping list item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error in PUT /api/shopping-lists/items/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/shopping-lists/items/[id] - Delete shopping list item
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

    const { error } = await supabase
      .from('shopping_list_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting shopping list item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/shopping-lists/items/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
