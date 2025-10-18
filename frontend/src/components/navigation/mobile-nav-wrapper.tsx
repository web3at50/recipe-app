'use client';

import { usePathname } from 'next/navigation';
import { MobileNav } from './mobile-nav';
import { BookOpen, ChefHat, Calendar, ShoppingCart, Package, Settings } from 'lucide-react';

const navigation = [
  { name: 'My Recipes', href: '/recipes', iconName: 'BookOpen' },
  { name: 'Create Recipe', href: '/create-recipe', iconName: 'ChefHat' },
  { name: 'Meal Planner', href: '/meal-planner', iconName: 'Calendar' },
  { name: 'Shopping List', href: '/shopping-list', iconName: 'ShoppingCart' },
  { name: 'My Pantry', href: '/settings/pantry-staples', iconName: 'Package' },
  { name: 'Settings', href: '/settings', iconName: 'Settings' },
];

export function MobileNavWrapper() {
  const pathname = usePathname();

  // Only show mobile nav on dashboard pages (not on sign-in, sign-up, onboarding, etc.)
  const isDashboardPage = pathname && (
    pathname.startsWith('/recipes') ||
    pathname.startsWith('/create-recipe') ||
    pathname.startsWith('/meal-planner') ||
    pathname.startsWith('/shopping-list') ||
    pathname.startsWith('/settings')
  );

  if (!isDashboardPage) {
    return null;
  }

  return <MobileNav navigation={navigation} />;
}
