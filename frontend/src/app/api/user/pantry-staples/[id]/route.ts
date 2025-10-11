import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
