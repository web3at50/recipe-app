import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ChefHat, Calendar, ShoppingCart, Package } from 'lucide-react';

const navigation = [
  { name: 'My Recipes', href: '/recipes', icon: BookOpen },
  { name: 'AI Generate', href: '/generate', icon: ChefHat },
  { name: 'Pantry', href: '/pantry', icon: Package },
  { name: 'Meal Planner', href: '/meal-planner', icon: Calendar },
  { name: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 p-4">
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

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
