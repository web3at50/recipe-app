import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/profile - Get user profile with preferences and consents
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      // Profile doesn't exist yet (new user)
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({
          profile: null,
          onboarding_completed: false
        });
      }

      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Get user consents
    const { data: consents, error: consentsError } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId);

    if (consentsError) {
      console.error('Error fetching consents:', consentsError);
      // Continue without consents rather than failing
    }

    return NextResponse.json({
      profile,
      consents: consents || [],
      onboarding_completed: profile?.onboarding_completed || false
    });
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update user profile preferences
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    // Validate preferences structure if provided
    if (body.preferences) {
      const { preferences } = body;

      // Ensure arrays exist
      if (preferences.dietary_restrictions && !Array.isArray(preferences.dietary_restrictions)) {
        return NextResponse.json(
          { error: 'dietary_restrictions must be an array' },
          { status: 400 }
        );
      }

      if (preferences.allergies && !Array.isArray(preferences.allergies)) {
        return NextResponse.json(
          { error: 'allergies must be an array' },
          { status: 400 }
        );
      }
    }

    // Update profile
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (body.preferences) {
      updateData.preferences = body.preferences;
    }

    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Update consents if provided
    if (body.consents) {
      const consentUpdates = Object.entries(body.consents).map(([type, granted]) => ({
        user_id: userId,
        consent_type: type,
        granted: granted as boolean,
        granted_at: (granted as boolean) ? new Date().toISOString() : null
      }));

      const { error: consentsError } = await supabase
        .from('user_consents')
        .upsert(consentUpdates, {
          onConflict: 'user_id,consent_type'
        });

      if (consentsError) {
        console.error('Error updating consents:', consentsError);
        // Don't fail the whole request
      }
    }

    return NextResponse.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error in PUT /api/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
