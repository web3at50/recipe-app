'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, BookOpen, ChefHat, Calendar, ShoppingCart, Package, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavigationItem {
  name: string;
  href: string;
  iconName: string;
}

interface MobileNavProps {
  navigation: NavigationItem[];
}

// Map icon names to actual icon components
const iconMap = {
  BookOpen,
  ChefHat,
  Calendar,
  ShoppingCart,
  Package,
  Settings,
};

export function MobileNav({ navigation }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = iconMap[item.iconName as keyof typeof iconMap];
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {Icon && <Icon className="h-5 w-5" />}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
