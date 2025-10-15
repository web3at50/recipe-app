import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Force dynamic rendering to ensure Clerk middleware context is available
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validation schema
const feedbackSchema = z.object({
  liked: z.string().optional(),
  disliked: z.string().optional(),
  suggestions: z.string().optional(),
  device_type: z.string().optional(),
  user_agent: z.string().optional(),
  viewport_width: z.number().optional(),
  viewport_height: z.number().optional(),
  page: z.string().default('generate'),
});

export async function POST(request: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    // Insert feedback into database
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: userId,
        page: validatedData.page,
        liked: validatedData.liked,
        disliked: validatedData.disliked,
        suggestions: validatedData.suggestions,
        device_type: validatedData.device_type,
        user_agent: validatedData.user_agent,
        viewport_width: validatedData.viewport_width,
        viewport_height: validatedData.viewport_height,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting feedback:', error);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in feedback API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
