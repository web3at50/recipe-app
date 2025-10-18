import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ChefHat, Calendar, ShoppingCart, Package, Settings } from 'lucide-react';
import { Toaster } from 'sonner';
import { createClient } from '@/lib/supabase/server';

const navigation = [
  { name: 'My Recipes', href: '/recipes', icon: BookOpen },
  { name: 'Create Recipe', href: '/create-recipe', icon: ChefHat },
  { name: 'Meal Planner', href: '/meal-planner', icon: Calendar },
  { name: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
  { name: 'My Pantry', href: '/settings/pantry-staples', icon: Package },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user has completed onboarding (using Supabase for DB query)
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .single();

  // Redirect to onboarding if not completed
  if (!profile?.onboarding_completed) {
    redirect('/onboarding');
  }

  return (
    <>
      <div className="flex h-full">
        {/* Desktop Sidebar - Hidden on mobile, visible on md+ */}
        <aside className="hidden md:block w-64 border-r bg-muted/40 p-4 flex-shrink-0">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content - Full width on mobile, with sidebar offset on desktop */}
        <div className="flex-1 w-full md:w-auto overflow-y-auto">
          {children}
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
    </>
  );
}
