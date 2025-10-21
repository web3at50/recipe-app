import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];

// Publish or update a recipe
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin authorization
    if (!ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { seo_title, seo_description, seo_slug, category, image_url } = body;

    // Validate required fields
    if (!seo_title || !seo_description || !seo_slug || !category || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update recipe in database
    const supabase = await createClient();

    const { data: recipe, error } = await supabase
      .from('recipes')
      .update({
        is_public: true,
        seo_title,
        seo_description,
        seo_slug,
        category,
        image_url,
        image_source: 'upload',
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error publishing recipe:', error);

      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A recipe with this URL slug already exists' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to publish recipe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Error in publish route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Unpublish a recipe
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin authorization
    if (!ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update recipe in database
    const supabase = await createClient();

    const { data: recipe, error } = await supabase
      .from('recipes')
      .update({
        is_public: false,
        published_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error unpublishing recipe:', error);
      return NextResponse.json(
        { error: 'Failed to unpublish recipe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Error in unpublish route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
