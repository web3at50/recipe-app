import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { createClient } from '@/lib/supabase/server';

const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];

const VALID_CATEGORIES = [
  'breakfast',
  'lunch',
  'dinner',
  'desserts',
  'snacks',
  'sides',
  'quick-easy',
  'healthy',
];

/**
 * POST /api/categories/[category]/image
 * Upload custom OpenGraph image for a category
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Validate category
    const { category } = await params;
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // 3. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 4. Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // 5. Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // 6. Upload to Vercel Blob Storage
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `categories/${category}-${timestamp}.${extension}`;

    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // 7. Update category_metadata in database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('category_metadata')
      .update({ custom_image_url: blob.url })
      .eq('category', category)
      .select()
      .single();

    if (error) {
      // Clean up uploaded blob if database update fails
      await del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      throw error;
    }

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
      category: data,
    });
  } catch (error) {
    console.error('Error uploading category image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[category]/image
 * Remove custom OpenGraph image for a category (falls back to first recipe image)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId || !ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Validate category
    const { category } = await params;
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // 3. Get current image URL from database
    const supabase = await createClient();
    const { data: categoryMeta } = await supabase
      .from('category_metadata')
      .select('custom_image_url')
      .eq('category', category)
      .single();

    if (!categoryMeta?.custom_image_url) {
      return NextResponse.json(
        { error: 'No custom image to delete' },
        { status: 404 }
      );
    }

    // 4. Delete from Vercel Blob Storage
    try {
      await del(categoryMeta.custom_image_url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } catch (blobError) {
      console.warn('Failed to delete blob (may not exist):', blobError);
      // Continue anyway - we still want to clear the database entry
    }

    // 5. Update category_metadata (set to NULL)
    const { data, error } = await supabase
      .from('category_metadata')
      .update({ custom_image_url: null })
      .eq('category', category)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Custom image removed. Will now use first recipe image as fallback.',
      category: data,
    });
  } catch (error) {
    console.error('Error deleting category image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
