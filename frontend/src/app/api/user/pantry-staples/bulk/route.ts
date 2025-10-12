import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { STANDARD_UK_PANTRY_ITEMS } from '@/types/pantry';

/**
 * POST /api/user/pantry-staples/bulk
 * Bulk save pantry staples from onboarding
 * Accepts array of standard pantry item IDs
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { item_ids, preference_state = 'hide' } = body;

    if (!item_ids || !Array.isArray(item_ids)) {
      return NextResponse.json(
        { error: 'item_ids array is required' },
        { status: 400 }
      );
    }

    if (item_ids.length === 0) {
      return NextResponse.json(
        { message: 'No items to save', staples: [] },
        { status: 200 }
      );
    }

    // Validate that all IDs are from the standard list
    const validIds = STANDARD_UK_PANTRY_ITEMS.map((item) => item.id);
    const invalidIds = item_ids.filter((id: string) => !validIds.includes(id));

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid item IDs: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Convert standard item IDs to item patterns (use the display name from standard list)
    const itemsToInsert = item_ids.map((id: string) => {
      const standardItem = STANDARD_UK_PANTRY_ITEMS.find((item) => item.id === id);
      return {
        user_id: userId,
        item_pattern: standardItem?.name.toLowerCase() || id,
        preference_state,
      };
    });

    // Use upsert to avoid duplicates (on conflict, update preference_state)
    const { data: staples, error } = await supabase
      .from('user_pantry_staples')
      .upsert(itemsToInsert, {
        onConflict: 'user_id,item_pattern',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      console.error('Error bulk inserting pantry staples:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: `Successfully saved ${staples?.length || 0} pantry staples`,
        staples,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/user/pantry-staples/bulk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/pantry-staples/bulk
 * Bulk delete pantry staples
 */
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { item_patterns } = body;

    if (!item_patterns || !Array.isArray(item_patterns)) {
      return NextResponse.json(
        { error: 'item_patterns array is required' },
        { status: 400 }
      );
    }

    if (item_patterns.length === 0) {
      return NextResponse.json(
        { message: 'No items to delete' },
        { status: 200 }
      );
    }

    // Delete all matching patterns for this user
    const { error } = await supabase
      .from('user_pantry_staples')
      .delete()
      .eq('user_id', userId)
      .in('item_pattern', item_patterns);

    if (error) {
      console.error('Error bulk deleting pantry staples:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Successfully deleted ${item_patterns.length} pantry staples`,
    });
  } catch (error) {
    console.error('Error in DELETE /api/user/pantry-staples/bulk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
