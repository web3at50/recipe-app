import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { OnboardingFormData } from '@/types/user-profile';

// POST /api/profile/onboarding - Complete user onboarding
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const body: OnboardingFormData = await request.json();

    // Validate required fields
    if (!body.cooking_skill || !body.household_size || !body.typical_cook_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build preferences object from onboarding data
    const preferences = {
      dietary_restrictions: body.dietary_restrictions || [],
      allergies: body.allergies || [],
      cuisines_liked: body.cuisines_liked || [],
      cooking_skill: body.cooking_skill,
      household_size: body.household_size,
      typical_cook_time: body.typical_cook_time,
      spice_level: body.spice_level || 'medium'
    };

    // Create or update user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        preferences,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating/updating profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to save profile' },
        { status: 500 }
      );
    }

    // Save user consents
    const timestamp = new Date().toISOString();
    const consents = [
      {
        user_id: userId,
        consent_type: 'essential',
        granted: true, // Always true
        granted_at: timestamp
      },
      {
        user_id: userId,
        consent_type: 'personalization',
        granted: body.consents.personalization,
        granted_at: timestamp
      },
      {
        user_id: userId,
        consent_type: 'analytics',
        granted: body.consents.analytics,
        granted_at: timestamp
      }
    ];

    const { error: consentsError } = await supabase
      .from('user_consents')
      .upsert(consents, {
        onConflict: 'user_id,consent_type'
      });

    if (consentsError) {
      console.error('Error saving consents:', consentsError);
      // Don't fail the whole request if consents fail, just log it
    }

    // Save pantry staples if provided
    if (body.pantry_staples && body.pantry_staples.length > 0) {
      try {
        // Import standard pantry items to get the names
        const { STANDARD_UK_PANTRY_ITEMS } = await import('@/types/pantry');

        // Convert item IDs to item patterns
        const pantryItems = body.pantry_staples
          .map((id: string) => {
            const item = STANDARD_UK_PANTRY_ITEMS.find(i => i.id === id);
            return item ? {
              user_id: userId,
              item_pattern: item.name.toLowerCase(),
              preference_state: 'hide' // Default to hide for onboarding selections
            } : null;
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        if (pantryItems.length > 0) {
          const { error: pantryError } = await supabase
            .from('user_pantry_staples')
            .upsert(pantryItems, {
              onConflict: 'user_id,item_pattern',
              ignoreDuplicates: false
            });

          if (pantryError) {
            console.error('Error saving pantry staples:', pantryError);
            // Don't fail the whole onboarding, just log it
          }
        }
      } catch (pantryError) {
        console.error('Error processing pantry staples:', pantryError);
        // Don't fail the whole onboarding, just log it
      }
    }

    return NextResponse.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Error in POST /api/profile/onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
