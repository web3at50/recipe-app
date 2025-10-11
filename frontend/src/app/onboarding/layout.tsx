import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user has already completed onboarding
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .single();

  // If onboarding already completed, redirect to dashboard
  // Note: profile being null is fine - it means new user
  if (profile && profile.onboarding_completed) {
    redirect('/recipes');
  }

  // If profile is null or onboarding not completed, show onboarding page
  return <>{children}</>;
}
