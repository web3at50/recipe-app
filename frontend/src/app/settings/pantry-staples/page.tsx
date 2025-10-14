import { createClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PantryManagement } from '@/components/pantry/pantry-management';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default async function PantryStaplesSettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const supabase = await createClient();

  // Fetch user's current pantry staples
  const { data: staples, error } = await supabase
    .from('user_pantry_staples')
    .select('*')
    .eq('user_id', userId)
    .order('item_pattern');

  if (error) {
    console.error('Error fetching pantry staples:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Dashboard', href: '/recipes' },
          { label: 'Settings', href: '/settings' },
          { label: 'Pantry Staples' }
        ]} />

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Pantry Staples</h1>
          <p className="text-muted-foreground">
            Manage items you typically have at home. These will be hidden from shopping lists by default.
          </p>
        </div>

        {/* Management Interface */}
        <PantryManagement initialStaples={staples || []} />
      </div>
    </div>
  );
}
