import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AlwaysHaveItemFormData } from '@/types/pantry';

// GET /api/pantry/always-have - Get all user's always-have items
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch always-have items
    const { data: items, error } = await supabase
      .from('always_have_items')
      .select('*')
      .eq('user_id', user.id)
      .order('item', { ascending: true });

    if (error) {
      console.error('Error fetching always-have items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    console.error('Error in GET /api/pantry/always-have:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/pantry/always-have - Add always-have item
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: AlwaysHaveItemFormData = await request.json();

    // Validate required fields
    if (!body.item) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    // Insert item
    const { data: item, error } = await supabase
      .from('always_have_items')
      .insert({
        user_id: user.id,
        item: body.item,
        category: body.category || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding always-have item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/pantry/always-have:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
