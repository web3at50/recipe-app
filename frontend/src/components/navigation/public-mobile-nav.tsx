'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, BookOpen, Info, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export function PublicMobileNav() {
  const [open, setOpen] = useState(false);

  const navigation = [
    { name: 'Recipes', href: '/recipes', icon: BookOpen },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Privacy Policy', href: '/privacy', icon: Shield },
    { name: 'Terms of Service', href: '/terms', icon: FileText },
  ];

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
      <SheetContent side="left" className="w-64 p-0 flex flex-col">
        <SheetHeader className="border-b p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        {/* Navigation Links */}
        <nav className="flex flex-col p-4 space-y-2 flex-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons */}
        <div className="border-t p-4 space-y-2">
          <SignInButton mode="modal">
            <Button variant="outline" className="w-full">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="w-full">
              Sign Up Free
            </Button>
          </SignUpButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
