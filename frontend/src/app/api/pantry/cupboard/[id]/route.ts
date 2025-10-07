import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CupboardItemFormData } from '@/types/pantry';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PUT /api/pantry/cupboard/[id] - Update cupboard item
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

    const body: CupboardItemFormData = await request.json();

    // Update item
    const { data: item, error } = await supabase
      .from('cupboard_items')
      .update({
        item: body.item,
        quantity: body.quantity || null,
        unit: body.unit || null,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cupboard item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error in PUT /api/pantry/cupboard/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/pantry/cupboard/[id] - Delete cupboard item
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

    // Delete item
    const { error } = await supabase
      .from('cupboard_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting cupboard item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/pantry/cupboard/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
