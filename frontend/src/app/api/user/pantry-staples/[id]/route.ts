import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/user/pantry-staples/[id] - Update a pantry staple preference
export async function PATCH(
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
    const { preference_state } = body;

    // Validate preference_state
    if (!preference_state || !['hide', 'show', 'auto'].includes(preference_state)) {
      return NextResponse.json(
        { error: 'preference_state must be "hide", "show", or "auto"' },
        { status: 400 }
      );
    }

    const { data: staple, error } = await supabase
      .from('user_pantry_staples')
      .update({ preference_state })
      .eq('id', id)
      .eq('user_id', userId) // Ensure user owns this staple
      .select()
      .single();

    if (error) {
      console.error('Error updating pantry staple:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!staple) {
      return NextResponse.json(
        { error: 'Pantry staple not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ staple });
  } catch (error) {
    console.error('Error in PATCH /api/user/pantry-staples/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user/pantry-staples/[id] - Remove a pantry staple
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
      .from('user_pantry_staples')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user owns this staple

    if (error) {
      console.error('Error deleting pantry staple:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/user/pantry-staples/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
