import { NextResponse } from 'next/server';
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
    const supabase = await createClient();
    const { id } = await context.params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('user_pantry_staples')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns this staple

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
