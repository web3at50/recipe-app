import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  // Check if user has already completed onboarding
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  // If onboarding already completed, redirect to dashboard
  if (profile?.onboarding_completed) {
    redirect('/recipes');
  }

  return <>{children}</>;
}
