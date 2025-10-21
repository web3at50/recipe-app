import { createClient } from '@/lib/supabase/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Mail, Shield } from 'lucide-react';
import { PreferencesForm } from '@/components/settings/preferences-form';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import type { UserPreferences } from '@/types/user-profile';

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const supabase = await createClient();

  // Get user's profile data
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get user consents
  const { data: consents } = await supabase
    .from('user_consents')
    .select('*')
    .eq('user_id', userId);

  // Get recipe count
  const { count: recipeCount } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Format member since date
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  // Get primary email address
  const primaryEmail = user?.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress || 'No email';

  const preferences: UserPreferences = profile?.preferences || {
    dietary_restrictions: [],
    allergies: [],
    cuisines_liked: [],
    cooking_skill: 'intermediate',
    household_size: 2,
    typical_cook_time: 30,
    spice_level: 'medium'
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'My Recipes', href: '/my-recipes' },
          { label: 'Settings' }
        ]} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, preferences, and privacy settings
          </p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="text-base font-semibold">{primaryEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-base font-semibold">{memberSince}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Your Statistics</CardTitle>
            <CardDescription>
              Track your activity and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📖</div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Recipes</p>
                    <p className="text-2xl font-bold">{recipeCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Onboarding</p>
                    <p className="text-2xl font-bold">
                      {profile?.onboarding_completed ? 'Complete' : 'Incomplete'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <PreferencesForm initialPreferences={preferences} />

        {/* Privacy & Consents */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Privacy & Data</CardTitle>
            </div>
            <CardDescription>
              Manage your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {consents && consents.length > 0 ? (
              <div className="space-y-3">
                {consents.map((consent) => (
                  <div key={consent.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{consent.consent_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {consent.granted ? 'Granted' : 'Not granted'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      consent.granted
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {consent.granted ? '✓ Active' : '○ Inactive'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No consent records found. Complete onboarding to set your preferences.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your account security and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              To manage your password, email settings, or sign out, use the account menu in the top right corner.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
