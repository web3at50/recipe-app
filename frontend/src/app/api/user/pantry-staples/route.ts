import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/user/pantry-staples - Get user's custom pantry staples
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's pantry staples
    const { data: staples, error } = await supabase
      .from('user_pantry_staples')
      .select('*')
      .eq('user_id', user.id)
      .order('item_pattern');

    if (error) {
      console.error('Error fetching pantry staples:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ staples });
  } catch (error) {
    console.error('Error in GET /api/user/pantry-staples:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/pantry-staples - Add a new pantry staple
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { item_pattern } = body;

    if (!item_pattern || !item_pattern.trim()) {
      return NextResponse.json(
        { error: 'item_pattern is required' },
        { status: 400 }
      );
    }

    // Insert pantry staple
    const { data: staple, error } = await supabase
      .from('user_pantry_staples')
      .insert({
        user_id: user.id,
        item_pattern: item_pattern.trim().toLowerCase(),
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate key error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This item is already in your pantry staples' },
          { status: 409 }
        );
      }
      console.error('Error creating pantry staple:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ staple }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/user/pantry-staples:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
