# UI/UX Implementation Recommendations - Plate Wise Recipe App

**Audit Date:** October 14, 2025
**Auditor:** UI/UX Design Specialist
**Technology Stack:** Next.js 15, React 19, Tailwind CSS 4, shadcn/ui, TypeScript
**Framework Context:** App Router, Server Components, Client Components

---

## Executive Summary

This comprehensive UI/UX audit evaluates the Plate Wise Recipe App across **mobile, tablet, and desktop devices** with a focus on responsive design, accessibility compliance, and user experience optimization. The application is built with modern technologies but has **critical mobile navigation issues** that prevent users on smartphones and tablets from accessing core features.

### Key Statistics

- **Pages Audited:** 12 major pages/routes
- **Components Reviewed:** 35+ UI components
- **Critical Issues Found:** 3 (mobile navigation, form layouts, touch targets)
- **High Priority Issues:** 8
- **Medium Priority Issues:** 12
- **Accessibility Gaps:** 6 WCAG 2.1 AA concerns
- **Responsive Breakpoints Analyzed:** 5 (mobile, sm, md, lg, xl)

### Critical Issues Requiring Immediate Attention

1. **CRITICAL: Dashboard Sidebar Has No Mobile Menu** (Line 46, `src/app/(dashboard)/layout.tsx`)
   - Fixed 256px (`w-64`) sidebar is always visible, breaking mobile/tablet layouts
   - No hamburger menu or mobile navigation alternative
   - **Impact:** Mobile and tablet users (primary audience) cannot access app features
   - **Affects:** All authenticated users on devices < 1024px width

2. **HIGH: AI Generate Page Not Optimized for Mobile** (`src/app/(dashboard)/generate/page.tsx`)
   - Complex form with 20+ inputs spread across multiple rows
   - 2-column and 3-column grids don't stack properly on mobile
   - Touch targets too small for mobile input
   - **Impact:** Primary feature unusable on mobile devices

3. **HIGH: Recipe Form Has Horizontal Scrolling on Mobile** (`src/components/recipes/recipe-form.tsx`)
   - 12-column grid layout (lines 288-368) causes horizontal overflow
   - Ingredient inputs require precision tapping on small screens
   - **Impact:** Users cannot create/edit recipes effectively on mobile

---

## Current State Analysis

### Strengths

#### What's Working Well

1. **Modern Technology Stack**
   - Next.js 15 App Router with proper server/client component separation
   - Tailwind CSS 4 with custom theme variables (`:root` in `globals.css`)
   - shadcn/ui components provide accessible primitives (Radix UI)
   - TypeScript ensures type safety across the codebase

2. **Dark Mode Implementation**
   - Seamless theme switching with `next-themes`
   - Properly configured color tokens in CSS custom properties
   - Smooth transitions on theme change (200ms cubic-bezier)
   - Theme toggle accessible with screen reader labels (lines 35, 40 in `ThemeToggle.tsx`)

3. **Component-Based Architecture**
   - Modular, reusable components
   - Clear separation of concerns (UI components vs. feature components)
   - Consistent design patterns using shadcn/ui

4. **Accessibility Features (Desktop)**
   - Proper ARIA labels on buttons (e.g., "Toggle theme", "Close")
   - Focus states configured with ring utilities
   - Semantic HTML structure in most components
   - Screen reader text with `sr-only` class

5. **User Experience Features**
   - Comprehensive allergen detection and warnings
   - Progressive disclosure in onboarding flow
   - Real-time form validation with `react-hook-form` + Zod
   - Toast notifications for user feedback (Sonner)
   - Loading states and skeleton screens

6. **Visual Design**
   - Clean, minimal aesthetic
   - Consistent spacing using Tailwind utilities
   - Professional color palette (neutral grays)
   - Proper card elevation with shadows

### Weaknesses

#### Major Pain Points

1. **Mobile Navigation Completely Broken**
   - **File:** `src/app/(dashboard)/layout.tsx` (lines 44-62)
   - **Issue:** Fixed sidebar with no responsive behavior
   - **Code:**
   ```tsx
   <aside className="w-64 border-r bg-muted/40 p-4">
     <nav className="space-y-2">
       {navigation.map((item) => {
         const Icon = item.icon;
         return (
           <Link key={item.name} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
             <Icon className="h-4 w-4" />
             {item.name}
           </Link>
         );
       })}
     </nav>
   </aside>
   ```
   - **Problem:** No `hidden` class, no `md:block`, no mobile alternative
   - **Impact:** Sidebar takes 256px on mobile (360px screen = 71% of viewport!)
   - **Devices Affected:** Mobile (< 768px), Tablet Portrait (< 1024px)

2. **AI Generate Page Not Mobile-Friendly**
   - **File:** `src/app/(dashboard)/generate/page.tsx`
   - **Issues:**
     - Line 314: 4-column grid for preferences info doesn't stack
     - Line 467: 3-column grid for cooking parameters stays horizontal
     - Line 553: 5-column grid for model selection causes overflow
   - **Code Examples:**
   ```tsx
   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"> {/* Line 314 */}

   <div className="grid grid-cols-2 md:grid-cols-3 gap-4"> {/* Line 467 */}

   <div className="grid grid-cols-2 md:grid-cols-5 gap-2"> {/* Line 553 */}
   ```
   - **Problem:** 2 columns on mobile is still too many for complex inputs
   - **Impact:** Cramped inputs, accidental touches, frustration

3. **Recipe Form Grid Layout Issues**
   - **File:** `src/components/recipes/recipe-form.tsx` (lines 286-382)
   - **Issue:** 12-column grid for ingredient inputs
   - **Code:**
   ```tsx
   <div className="flex-1 grid grid-cols-12 gap-2">
     <div className="col-span-5"> {/* Item name */}
     <div className="col-span-2"> {/* Quantity */}
     <div className="col-span-2"> {/* Unit */}
     <div className="col-span-3"> {/* Notes */}
   </div>
   ```
   - **Problem:** Columns don't stack on mobile, causing horizontal scroll
   - **Impact:** Users can't see/tap all fields without scrolling horizontally

4. **Meal Planner Desktop-Only Layout**
   - **File:** `src/components/meal-planner/week-view.tsx` (lines 38-104)
   - **Issue:** 8-column grid (1 label + 7 days) with no mobile alternative
   - **Code:**
   ```tsx
   <div className="grid grid-cols-8 gap-2 text-sm font-medium">
     <div className="p-2"></div>
     {DAYS_OF_WEEK.map((day, index) => (
       <div key={day} className="p-2 text-center">
   ```
   - **Problem:** 8 columns = each day cell is 45px wide on mobile (unreadable)
   - **Impact:** Meal planning unusable on mobile devices

5. **Touch Targets Below Recommended Size**
   - **Files:** Multiple components
   - **Issue:** Icon buttons are 36px (`size-9` = `h-9 w-9`), below 44x44px best practice
   - **Examples:**
     - Button component (line 27): `icon: "size-9"` = 36px × 36px
     - Recipe card actions (lines 64-85): Icon buttons with `size="icon"` (36px)
     - Shopping list actions (lines 632-667): Multiple icon buttons
   - **WCAG 2.2 Standard:** 24x24px minimum (AA), 44x44px recommended
   - **Current:** 36x36px (meets WCAG 2.2 AA but below best practice)
   - **Impact:** Harder to tap on mobile, especially for users with motor impairments

6. **Shopping List Complex UI on Mobile**
   - **File:** `src/app/(dashboard)/shopping-list/page.tsx`
   - **Issues:**
     - Line 499: 12-column grid for add item form (8 + 4 columns)
     - Line 575-608: Complex inline editing with select dropdowns
     - Lines 668-705: 3-state dropdown menu in tight space
   - **Problem:** Too many actions in small space, requires precision
   - **Impact:** Accidental taps, menu items hard to hit

7. **Form Inputs Missing Mobile Optimization**
   - **Files:** Multiple forms
   - **Issues:**
     - No `inputmode` attribute for numeric inputs
     - Font size 14px (`text-sm`) causes iOS zoom on focus
     - Multi-column layouts don't stack
   - **Best Practice:** 16px (1rem) font size prevents zoom
   - **Impact:** Unexpected zoom behavior disrupts user flow

---

## Prioritized Recommendations

### High Priority (Critical - Immediate Action Required)

#### 1. Implement Mobile Navigation for Dashboard Sidebar

**Issue:** Dashboard sidebar has no mobile menu, breaking all navigation on small screens.

**Impact:**
- **Severity:** CRITICAL
- **Users Affected:** All mobile and tablet users (primary audience)
- **Features Blocked:** All main app features (Recipes, Generate, Meal Planner, Shopping List, Settings)

**Current Code:** `src/app/(dashboard)/layout.tsx` (lines 44-62)

```tsx
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
```

**Recommended Solution:**

Create a responsive navigation system with:
1. Sheet component for mobile menu (slide-in drawer)
2. Hidden sidebar on mobile, visible on desktop
3. Hamburger menu button in header for mobile
4. Smooth animations for menu open/close

**Implementation Code:**

**Step 1:** Create Mobile Navigation Component (`src/components/navigation/mobile-nav.tsx`):

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { LucideIcon } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface MobileNavProps {
  navigation: NavigationItem[];
}

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
      </SheetContent>
    </Sheet>
  );
}
```

**Step 2:** Create Sheet Component (if not exists - `src/components/ui/sheet.tsx`):

```tsx
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

const sheetVariants = {
  side: {
    top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
    bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
    left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
    right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
  },
}

interface SheetContentProps extends React.ComponentProps<typeof SheetPrimitive.Content> {
  side?: 'top' | 'bottom' | 'left' | 'right';
}

function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          sheetVariants.side[side],
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
}
```

**Step 3:** Update Dashboard Layout (`src/app/(dashboard)/layout.tsx`):

```tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ChefHat, Calendar, ShoppingCart, Package, Settings } from 'lucide-react';
import { Toaster } from 'sonner';
import { createClient } from '@/lib/supabase/server';
import { MobileNav } from '@/components/navigation/mobile-nav';

const navigation = [
  { name: 'My Recipes', href: '/recipes', icon: BookOpen },
  { name: 'AI Generate', href: '/generate', icon: ChefHat },
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

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .single();

  if (!profile?.onboarding_completed) {
    redirect('/onboarding');
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Mobile Navigation - Only visible on mobile */}
        <div className="fixed top-16 left-4 z-40 md:hidden">
          <MobileNav navigation={navigation} />
        </div>

        {/* Desktop Sidebar - Hidden on mobile, visible on md+ */}
        <aside className="hidden md:block w-64 border-r bg-muted/40 p-4">
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
        <div className="flex-1 w-full md:w-auto">
          {children}
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
    </>
  );
}
```

**Implementation Difficulty:** Medium
**Estimated Effort:** 4-6 hours
**Devices Affected:** Mobile (< 768px), Tablet (< 1024px)
**Benefits:**
- Unlocks all app features for mobile users
- Follows mobile-first design principles
- Uses shadcn/ui Sheet component (accessible, animated)
- Hamburger menu is industry standard (users expect it)

---

#### 2. Refactor AI Generate Page for Mobile

**Issue:** Complex form with 20+ inputs not optimized for mobile screens.

**Impact:**
- **Severity:** HIGH
- **Users Affected:** All mobile users trying to generate recipes (primary feature)
- **Usability Score:** 2/10 on mobile

**Current Issues in `src/app/(dashboard)/generate/page.tsx`:**

1. **Line 314:** Preferences summary uses 4 columns on mobile
2. **Line 467:** Cooking parameters in 3 columns
3. **Line 553:** Model selection buttons in 5 columns (2 on mobile, 5 on desktop)

**Recommended Solution:**

**Fix 1: User Preferences Summary (Line 314)**

Current:
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
```

Recommended:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
```

**Fix 2: Cooking Parameters (Line 467)**

Current:
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
```

Recommended:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Fix 3: Model Selection Buttons (Line 553)**

Current:
```tsx
<div className="grid grid-cols-2 md:grid-cols-5 gap-2">
```

Recommended:
```tsx
<div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
  <Button
    type="button"
    variant={selectedModel === 'model_1' ? 'default' : 'outline'}
    onClick={() => setSelectedModel('model_1')}
    className="flex-1 sm:min-w-[100px]"
  >
    Model 1
  </Button>
  {/* ... other buttons ... */}
  <Button
    type="button"
    variant={selectedModel === 'all' ? 'default' : 'outline'}
    onClick={() => setSelectedModel('all')}
    className="w-full sm:flex-1 sm:min-w-[120px]"
  >
    All 4 Models
  </Button>
</div>
```

**Fix 4: Add Mobile-Optimized Input Attributes**

For all number inputs (servings, max time), add:
```tsx
<Input
  id="servings"
  type="number"
  inputMode="numeric"
  pattern="[0-9]*"
  min="1"
  max="20"
  value={servings || userPreferences?.household_size || 4}
  onChange={(e) => setServings(parseInt(e.target.value))}
  className="text-base" // Prevent iOS zoom
/>
```

**Implementation Difficulty:** Easy
**Estimated Effort:** 2-3 hours
**Devices Affected:** Mobile (< 640px), Tablet (< 1024px)

---

#### 3. Fix Recipe Form Horizontal Scrolling

**Issue:** 12-column grid for ingredients causes horizontal overflow on mobile.

**Impact:**
- **Severity:** HIGH
- **Users Affected:** Anyone creating/editing recipes on mobile
- **Usability:** Can't see all form fields without horizontal scrolling

**Current Code:** `src/components/recipes/recipe-form.tsx` (lines 286-382)

```tsx
<div className="flex-1 grid grid-cols-12 gap-2">
  <div className="col-span-5">
    {/* Item */}
  </div>
  <div className="col-span-2">
    {/* Quantity */}
  </div>
  <div className="col-span-2">
    {/* Unit */}
  </div>
  <div className="col-span-3">
    {/* Notes */}
  </div>
</div>
```

**Recommended Solution:**

Stack ingredients vertically on mobile, use grid on desktop:

```tsx
<div className="flex-1 flex flex-col sm:grid sm:grid-cols-12 gap-2">
  {/* Item - Full width on mobile, 5 cols on desktop */}
  <div className="w-full sm:col-span-5">
    <FormField
      control={form.control}
      name={`ingredients.${index}.item`}
      render={({ field }) => (
        <FormItem>
          {index === 0 && <FormLabel>Item</FormLabel>}
          <FormControl>
            <Input
              placeholder="e.g., Flour"
              {...field}
              className="text-base" // Prevent zoom on iOS
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>

  {/* Quantity & Unit - Side by side on mobile, separate on desktop */}
  <div className="flex gap-2 sm:contents">
    <div className="flex-1 sm:col-span-2">
      <FormField
        control={form.control}
        name={`ingredients.${index}.quantity`}
        render={({ field }) => (
          <FormItem>
            {index === 0 && <FormLabel className="hidden sm:block">Qty</FormLabel>}
            <FormControl>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="400"
                {...field}
                value={field.value || ''}
                className="text-base"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <div className="flex-1 sm:col-span-2">
      <FormField
        control={form.control}
        name={`ingredients.${index}.unit`}
        render={({ field }) => (
          <FormItem>
            {index === 0 && <FormLabel className="hidden sm:block">Unit</FormLabel>}
            <Select onValueChange={field.onChange} value={field.value || undefined}>
              <FormControl>
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {UNIT_OPTIONS.filter(option => option.value !== '').map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </div>

  {/* Notes - Full width on mobile, 3 cols on desktop */}
  <div className="w-full sm:col-span-3">
    <FormField
      control={form.control}
      name={`ingredients.${index}.notes`}
      render={({ field }) => (
        <FormItem>
          {index === 0 && <FormLabel className="hidden sm:block">Notes</FormLabel>}
          <FormControl>
            <Input
              placeholder="chopped"
              {...field}
              value={field.value || ''}
              className="text-base"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
</div>

{/* Delete button */}
{ingredientFields.length > 1 && (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    onClick={() => removeIngredient(index)}
    className={cn(
      "sm:mt-0",
      index === 0 && "sm:mt-8"
    )}
    aria-label="Remove ingredient"
  >
    <Trash2 className="h-4 w-4" />
  </Button>
)}
```

**Implementation Difficulty:** Medium
**Estimated Effort:** 3-4 hours
**Devices Affected:** Mobile (< 640px)
**Benefits:**
- No horizontal scrolling
- All fields visible without scrolling
- Larger touch targets for mobile
- Better label visibility

---

#### 4. Redesign Meal Planner for Mobile

**Issue:** 8-column grid layout unusable on mobile devices.

**Impact:**
- **Severity:** HIGH
- **Users Affected:** Mobile users trying to plan meals
- **Current State:** Day cells are 45px wide (unreadable, untappable)

**Current Code:** `src/components/meal-planner/week-view.tsx` (lines 38-104)

**Recommended Solution:**

Create a mobile-friendly single-day view with swipe navigation:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { MealPlanItemWithRecipe } from '@/types/meal-plan';

interface WeekViewProps {
  startDate: Date;
  items: MealPlanItemWithRecipe[];
  onAddRecipe: (date: string, mealType: 'breakfast' | 'lunch' | 'dinner') => void;
  onRemoveRecipe: (itemId: string) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];

export function WeekView({ startDate, items, onAddRecipe, onRemoveRecipe }: WeekViewProps) {
  // Mobile: single day view
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Generate dates for the week
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    weekDates.push(date);
  }

  const getItemForSlot = (date: Date, mealType: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return items.find((item) => item.date === dateStr && item.meal_type === mealType);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const goToPreviousDay = () => {
    setSelectedDayIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const goToNextDay = () => {
    setSelectedDayIndex((prev) => (prev < 6 ? prev + 1 : 6));
  };

  // Mobile View (< md breakpoint)
  const MobileView = () => {
    const selectedDate = weekDates[selectedDayIndex];

    return (
      <div className="space-y-4 md:hidden">
        {/* Day Navigation */}
        <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousDay}
            disabled={selectedDayIndex === 0}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <div className="font-semibold text-lg">
              {DAYS_OF_WEEK[selectedDayIndex]}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextDay}
            disabled={selectedDayIndex === 6}
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Day Dots Indicator */}
        <div className="flex justify-center gap-1">
          {weekDates.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedDayIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === selectedDayIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/30'
              }`}
              aria-label={`Go to ${DAYS_OF_WEEK[index]}`}
            />
          ))}
        </div>

        {/* Meals for Selected Day */}
        <div className="space-y-3">
          {MEAL_TYPES.map((mealType) => {
            const item = getItemForSlot(selectedDate, mealType);

            return (
              <Card key={mealType}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold capitalize text-lg">{mealType}</h3>
                  </div>

                  {item ? (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/recipes/${item.recipe_id}?servings=${item.servings}&from=meal-planner`}
                          className="text-base font-medium hover:underline cursor-pointer flex-1"
                        >
                          {item.recipe?.name || 'Unknown Recipe'}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveRecipe(item.id)}
                          aria-label={`Remove ${item.recipe?.name} from ${mealType}`}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.servings} servings
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center gap-2"
                      onClick={() => onAddRecipe(formatDate(selectedDate), mealType)}
                    >
                      <Plus className="h-5 w-5" />
                      <span className="text-sm">Add Recipe</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Desktop View (>= md breakpoint)
  const DesktopView = () => (
    <div className="hidden md:block space-y-4">
      {/* Header Row */}
      <div className="grid grid-cols-8 gap-2 text-sm font-medium">
        <div className="p-2"></div>
        {DAYS_OF_WEEK.map((day, index) => (
          <div key={day} className="p-2 text-center">
            <div>{day.substring(0, 3)}</div>
            <div className="text-xs text-muted-foreground">
              {weekDates[index].getDate()}/{weekDates[index].getMonth() + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Meal Rows */}
      {MEAL_TYPES.map((mealType) => (
        <div key={mealType} className="grid grid-cols-8 gap-2">
          <div className="p-2 flex items-center font-medium capitalize">
            {mealType}
          </div>

          {weekDates.map((date, index) => {
            const item = getItemForSlot(date, mealType);

            return (
              <Card key={index} className="min-h-[120px]">
                <CardContent className="p-3">
                  {item ? (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/recipes/${item.recipe_id}?servings=${item.servings}&from=meal-planner`}
                          className="text-sm font-medium line-clamp-2 hover:underline cursor-pointer flex-1"
                        >
                          {item.recipe?.name || 'Unknown Recipe'}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => onRemoveRecipe(item.id)}
                          aria-label={`Remove recipe from ${mealType}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.servings} servings
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                      onClick={() => onAddRecipe(formatDate(date), mealType)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-xs">Add</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
}
```

**Implementation Difficulty:** Medium-Hard
**Estimated Effort:** 6-8 hours
**Devices Affected:** Mobile (< 768px)
**Benefits:**
- One day at a time = readable, tappable
- Swipe navigation (industry standard for calendars)
- Larger cards = easier to tap
- Day dots show position in week

---

### Medium Priority (Important - Next Sprint)

#### 5. Increase Touch Target Sizes to 44x44px

**Issue:** Icon buttons are 36px, below the recommended 44x44px for optimal mobile accessibility.

**Impact:**
- **Severity:** MEDIUM
- **WCAG Compliance:** Meets WCAG 2.2 AA (24px min) but below AAA (44px) and best practice
- **Usability:** Harder to tap for users with motor impairments or on-the-go

**Current Code:** `src/components/ui/button.tsx` (line 27)

```tsx
icon: "size-9", // 36px × 36px
```

**Recommended Solution:**

Update button variants to use 44px minimum:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-11", // Changed from size-9 (36px) to size-11 (44px)
        "icon-sm": "size-9", // Keep small variant for desktop-only contexts
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

**Update all icon button usages:**

In `src/components/recipes/recipe-card.tsx` (lines 64-85), change:
```tsx
<Button variant="ghost" size="icon">
```

In `src/components/ThemeToggle.tsx` (line 28), change:
```tsx
<Button variant="ghost" size="icon" className="h-9 w-9">
```
to:
```tsx
<Button variant="ghost" size="icon">
```

**Implementation Difficulty:** Easy
**Estimated Effort:** 2-3 hours (find & replace + testing)
**Devices Affected:** Mobile (all)
**Benefits:**
- Easier to tap on mobile
- Better accessibility for motor impairments
- Aligns with iOS and Android design guidelines

---

#### 6. Optimize Landing Page for Mobile

**Issue:** Landing page has some responsive issues with hero text and CTA buttons.

**Current Code:** `src/app/page.tsx` (lines 16-169)

**Recommended Fixes:**

**Fix 1: Hero Text Sizing (Line 23)**

Current:
```tsx
<h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
```

Recommended:
```tsx
<h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
```

**Fix 2: CTA Button Layout (Line 31)**

Current:
```tsx
<div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
```

Recommended:
```tsx
<div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4">
  <Button size="lg" asChild className="text-base sm:text-lg h-12 sm:h-auto">
    <Link href="/playground">
      <Sparkles className="mr-2 h-5 w-5" />
      Try It Free
    </Link>
  </Button>
  <Button size="lg" variant="outline" asChild className="text-base sm:text-lg h-12 sm:h-auto">
    <Link href="/sign-up">
      Create Account
    </Link>
  </Button>
</div>
```

**Fix 3: Feature Cards Grid (Line 52)**

Current:
```tsx
<div className="grid gap-6 md:grid-cols-3">
```

Recommended:
```tsx
<div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
```

**Implementation Difficulty:** Easy
**Estimated Effort:** 1 hour
**Devices Affected:** Mobile (< 640px)

---

#### 7. Add Loading Skeletons for Better Perceived Performance

**Issue:** Pages show "Loading..." text instead of skeleton screens.

**Impact:** Poor perceived performance, users unsure if page is working.

**Current Code Examples:**
- `src/app/(dashboard)/meal-planner/page.tsx` (line 218): Text "Loading..."
- `src/app/(dashboard)/shopping-list/page.tsx` (line 403): Text "Loading..."

**Recommended Solution:**

Create skeleton component (`src/components/ui/skeleton.tsx`):

```tsx
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

Use in meal planner:

```tsx
if (isLoading) {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-12 w-64 mb-8" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-8 gap-2">
            <Skeleton className="h-8 w-20" />
            {[1, 2, 3, 4, 5, 6, 7].map((j) => (
              <Skeleton key={j} className="h-[120px] w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Implementation Difficulty:** Easy
**Estimated Effort:** 2-3 hours
**Devices Affected:** All

---

#### 8. Fix Header on Mobile to Include Navigation

**Issue:** Root header doesn't integrate with dashboard mobile nav.

**Current Code:** `src/app/layout.tsx` (lines 42-66)

**Recommended Solution:**

The mobile nav hamburger button needs to be accessible from the root header when user is authenticated and in dashboard. Consider adding a layout slot or moving the mobile nav trigger to the root layout.

**Option A:** Add mobile nav to root header (Recommended)

```tsx
// In layout.tsx
import { MobileNav } from "@/components/navigation/mobile-nav"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider>
            <header className="border-b sticky top-0 z-50 bg-background">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <SignedIn>
                    {/* Mobile nav hamburger - only show when in dashboard */}
                    <MobileNavTrigger />
                  </SignedIn>
                  <Link href="/" className="text-xl font-semibold">
                    Plate Wise
                  </Link>
                </div>
                <nav className="flex items-center gap-2">
                  <ThemeToggle />
                  <SignedIn>
                    <UserButtonWithLinks />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button size="sm">
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                </nav>
              </div>
            </header>
            <main>{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

**Implementation Difficulty:** Medium
**Estimated Effort:** 2-3 hours
**Devices Affected:** Mobile (< 768px)

---

#### 9. Improve Recipe Card Responsiveness

**Issue:** Recipe card image has fixed aspect ratio that doesn't adapt well to different grid layouts.

**Current Code:** `src/components/recipes/recipe-card.tsx` (line 31)

```tsx
<div className="aspect-video bg-muted relative">
```

**Recommended Solution:**

Use responsive aspect ratios:

```tsx
<div className="aspect-square sm:aspect-video bg-muted relative">
```

Or use different ratios for different breakpoints:

```tsx
<div className="aspect-[4/3] sm:aspect-video bg-muted relative">
```

**Also update recipe list grid:**

Current in `src/components/recipes/recipe-list.tsx` (line 67):
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

Recommended:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
```

**Implementation Difficulty:** Easy
**Estimated Effort:** 1 hour
**Devices Affected:** Mobile, Tablet

---

#### 10. Add Haptic Feedback for Mobile Actions

**Issue:** No tactile feedback when tapping buttons on mobile.

**Recommended Solution:**

Add vibration API for key actions:

```tsx
// utils/haptics.ts
export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 50;
    navigator.vibrate(duration);
  }
};

// Usage in buttons:
<Button
  onClick={() => {
    triggerHapticFeedback('light');
    handleToggleFavorite();
  }}
>
  <Heart />
</Button>
```

**Implementation Difficulty:** Easy
**Estimated Effort:** 1-2 hours
**Devices Affected:** Mobile (iOS, Android)

---

#### 11. Optimize Dialog Sizes for Mobile

**Issue:** Dialogs use `sm:max-w-lg` which is still quite large on mobile.

**Current Code:** `src/components/ui/dialog.tsx` (line 63)

```tsx
className={cn(
  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
  className
)}
```

**Recommended Solution:**

Reduce mobile padding and adjust max-width:

```tsx
className={cn(
  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] md:max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-4 sm:p-6 shadow-lg duration-200",
  className
)}
```

**Also update meal planner dialog:**

In `src/app/(dashboard)/meal-planner/page.tsx` (line 291):
```tsx
<DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
```

Change to:
```tsx
<DialogContent className="max-w-full sm:max-w-2xl max-h-[80vh] sm:max-h-[600px] overflow-y-auto">
```

**Implementation Difficulty:** Easy
**Estimated Effort:** 1 hour
**Devices Affected:** Mobile (< 640px)

---

#### 12. Add Pull-to-Refresh for Lists

**Issue:** No way to refresh recipe list, meal plans, or shopping lists on mobile without reloading page.

**Recommended Solution:**

Install pull-to-refresh library:

```bash
npm install react-simple-pull-to-refresh
```

Wrap lists:

```tsx
import PullToRefresh from 'react-simple-pull-to-refresh';

<PullToRefresh
  onRefresh={async () => {
    await fetchRecipes();
  }}
  pullingContent=""
  refreshingContent={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}
>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {recipes.map((recipe) => (
      <RecipeCard key={recipe.id} recipe={recipe} />
    ))}
  </div>
</PullToRefresh>
```

**Implementation Difficulty:** Medium
**Estimated Effort:** 3-4 hours
**Devices Affected:** Mobile (iOS, Android)

---

### Low Priority (Nice to Have - Future)

#### 13. Add Swipe Gestures for Recipe Cards

**Issue:** No swipe-to-delete or swipe-to-favorite on recipe cards (common mobile pattern).

**Recommended Solution:** Use `react-swipeable` or `framer-motion` to add swipe gestures.

**Implementation Difficulty:** Medium
**Estimated Effort:** 4-6 hours
**Devices Affected:** Mobile

---

#### 14. Implement Bottom Navigation for Mobile

**Issue:** Current mobile nav is a hamburger menu. Consider bottom tab bar for faster access.

**Recommended Solution:**

Add bottom navigation bar for primary actions:

```tsx
// components/navigation/bottom-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ChefHat, Calendar, ShoppingCart } from 'lucide-react';

const bottomNavItems = [
  { name: 'Recipes', href: '/recipes', icon: BookOpen },
  { name: 'Generate', href: '/generate', icon: ChefHat },
  { name: 'Meals', href: '/meal-planner', icon: Calendar },
  { name: 'Shop', href: '/shopping-list', icon: ShoppingCart },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex justify-around items-center h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'fill-primary' : ''}`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

Add padding to main content to account for bottom nav:

```tsx
// In dashboard layout
<div className="flex-1 pb-16 md:pb-0"> {/* 64px bottom padding on mobile */}
  {children}
</div>
<BottomNav />
```

**Implementation Difficulty:** Medium
**Estimated Effort:** 3-4 hours
**Devices Affected:** Mobile (< 768px)
**Benefits:**
- Faster navigation (no menu opening)
- Industry standard (Instagram, Twitter, etc.)
- Always visible, one-tap access

---

#### 15. Add Offline Mode with Service Worker

**Issue:** App doesn't work offline. Meal plans and recipes could be cached.

**Recommended Solution:** Use Next.js PWA plugin.

**Implementation Difficulty:** Hard
**Estimated Effort:** 8-12 hours
**Devices Affected:** All

---

#### 16. Implement Voice Input for Recipe Search

**Issue:** Typing recipe names is slow on mobile. Voice input would be faster.

**Recommended Solution:** Use Web Speech API.

**Implementation Difficulty:** Medium
**Estimated Effort:** 4-6 hours
**Devices Affected:** Mobile

---

#### 17. Add Pinch-to-Zoom for Recipe Images

**Issue:** Recipe detail images can't be zoomed on mobile.

**Recommended Solution:** Use `react-medium-image-zoom` library.

**Implementation Difficulty:** Easy
**Estimated Effort:** 1-2 hours
**Devices Affected:** Mobile

---

#### 18. Optimize Images with Next/Image

**Issue:** Some images may not be using Next.js Image optimization.

**Review:** Check all `<img>` tags, convert to `<Image>` from `next/image`.

**Implementation Difficulty:** Easy
**Estimated Effort:** 2-3 hours
**Devices Affected:** All

---

## Mobile-First Design Recommendations

### Navigation

#### Current State:
- Fixed 256px sidebar (always visible)
- No mobile alternative
- No hamburger menu

#### Recommended Changes:

1. **Hide sidebar on mobile, show hamburger menu**
   - `hidden md:block` on sidebar
   - Sheet component for mobile menu
   - Hamburger trigger in header

2. **Consider bottom navigation** (Low Priority)
   - Faster access than hamburger menu
   - Industry standard for mobile apps
   - Always visible, one-tap access

3. **Improve touch targets**
   - Increase icon buttons from 36px to 44px
   - Add more padding between navigation items
   - Use larger text (16px minimum)

### Forms

#### Current Issues:
- Multi-column grids don't stack
- Small touch targets
- Horizontal scrolling
- iOS zoom on focus (14px font)

#### Recommended Fixes:

1. **Use single-column layouts on mobile**
   - Stack all form fields vertically
   - `flex flex-col sm:grid sm:grid-cols-X`

2. **Increase input font size**
   - Use `text-base` (16px) instead of `text-sm` (14px)
   - Prevents iOS auto-zoom on focus

3. **Add mobile-specific input attributes**
   - `inputMode="numeric"` for number inputs
   - `inputMode="email"` for email inputs
   - `pattern="[0-9]*"` for iOS numeric keyboard

4. **Increase spacing between inputs**
   - Use `gap-4` or `gap-6` on mobile
   - Prevents accidental touches

5. **Make labels more visible**
   - Don't hide labels on mobile
   - Use placeholder text sparingly

### Content Layout

#### Recipe Cards:

1. **Responsive grid breakpoints**
   - 1 column on mobile (< 640px)
   - 2 columns on tablet portrait (640px - 1024px)
   - 3 columns on tablet landscape (1024px - 1280px)
   - 4 columns on desktop (>= 1280px)

   ```tsx
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
   ```

2. **Responsive image aspect ratios**
   - Square on mobile: `aspect-square`
   - Video on tablet+: `sm:aspect-video`

3. **Truncate text properly**
   - Use `line-clamp-2` for titles
   - Use `line-clamp-3` for descriptions

#### Typography:

1. **Scale font sizes responsively**
   ```tsx
   <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
   ```

2. **Adjust line heights for mobile**
   - Tighter line-height on mobile (1.2 - 1.3)
   - More breathing room on desktop (1.5 - 1.6)

3. **Optimize reading width**
   - Max width of 65-75 characters per line
   - Use `max-w-prose` for long text

---

## Accessibility Improvements

### WCAG 2.1 AA Compliance Issues

#### 1. Touch Target Size (2.5.8 - Level AA)

**Current State:** Icon buttons are 36px (meets minimum but below best practice)

**Requirement:** 24px minimum (AA), 44px recommended (AAA, iOS, Android)

**Fix:** Increase `size="icon"` from 36px to 44px (see Recommendation #5)

**Priority:** HIGH

---

#### 2. Color Contrast (1.4.3 - Level AA)

**Requirement:** 4.5:1 for normal text, 3:1 for large text

**Areas to Check:**
- Muted text (`text-muted-foreground`) - verify against background
- Disabled button text - verify sufficient contrast
- Placeholder text - often fails contrast

**Recommended Tool:** Use Chrome DevTools Lighthouse or https://webaim.org/resources/contrastchecker/

**Priority:** MEDIUM

---

#### 3. Focus Indicators (2.4.7 - Level AA)

**Current State:** Focus rings configured with `focus-visible:ring-[3px]`

**Issue:** Some components may override focus styles

**Fix:** Ensure all interactive elements have visible focus indicators

**Test:** Tab through entire app, verify every focusable element shows focus ring

**Priority:** MEDIUM

---

#### 4. Form Labels (3.3.2 - Level A)

**Current State:** Most forms use `<FormLabel>` correctly

**Issue:** Some inline edit forms may be missing visible labels

**Example:** Shopping list inline edit (line 575-608) uses placeholder but no label

**Fix:** Add `aria-label` or visible label:

```tsx
<Input
  type="number"
  value={editingQuantityNumber}
  onChange={(e) => setEditingQuantityNumber(e.target.value)}
  placeholder="400"
  aria-label="Quantity"
  autoFocus
/>
```

**Priority:** MEDIUM

---

#### 5. Keyboard Navigation (2.1.1 - Level A)

**Current State:** Most components keyboard accessible (Radix UI primitives)

**Areas to Test:**
- Meal planner grid navigation
- Recipe card actions (favorite, delete)
- Shopping list dropdown menus

**Test:** Use only keyboard (Tab, Enter, Escape, Arrow keys)

**Priority:** MEDIUM

---

#### 6. Alternative Text for Images (1.1.1 - Level A)

**Current State:** Recipe images use Next/Image but alt text may be generic

**Issue:** Alt text should be descriptive, not just recipe name

**Current:**
```tsx
<Image
  src={recipe.image_url}
  alt={recipe.name}
  fill
  className="object-cover"
/>
```

**Recommended:**
```tsx
<Image
  src={recipe.image_url}
  alt={recipe.image_url ? `Photo of ${recipe.name}` : 'No image available'}
  fill
  className="object-cover"
/>
```

**Priority:** LOW (current implementation is acceptable)

---

### Recommended Fixes

#### Add Skip to Content Link

Add skip link to root layout:

```tsx
// In layout.tsx, before <header>
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
>
  Skip to main content
</a>

<header>...</header>

<main id="main-content">
  {children}
</main>
```

---

#### Improve ARIA Labels

Add descriptive labels to icon-only buttons:

```tsx
// Current (line 64 in recipe-card.tsx):
<Button variant="ghost" size="icon" onClick={() => onToggleFavorite(recipe.id, !recipe.is_favorite)}>
  <Heart className={`h-5 w-5 ${recipe.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
</Button>

// Recommended:
<Button
  variant="ghost"
  size="icon"
  onClick={() => onToggleFavorite(recipe.id, !recipe.is_favorite)}
  aria-label={recipe.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
>
  <Heart className={`h-5 w-5 ${recipe.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
</Button>
```

---

#### Add Loading States with ARIA

Current loading states are not announced to screen readers:

```tsx
// Current:
{isLoading && <p>Loading...</p>}

// Recommended:
{isLoading && (
  <div role="status" aria-live="polite">
    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
    <span className="sr-only">Loading recipes...</span>
  </div>
)}
```

---

## Component-Specific Improvements

### Recipe Card Component (`src/components/recipes/recipe-card.tsx`)

#### Current Issues:
1. Image aspect ratio is always `aspect-video` (not ideal for portrait cards)
2. Icon buttons are small (36px)
3. Allergen badge is small and might be missed

#### Recommended Changes:

```tsx
<Card className="overflow-hidden hover:shadow-lg transition-shadow">
  <Link href={`/recipes/${recipe.id}`}>
    {/* Responsive aspect ratio */}
    <div className="aspect-square sm:aspect-[4/3] md:aspect-video bg-muted relative">
      {recipe.image_url ? (
        <Image
          src={recipe.image_url}
          alt={`Photo of ${recipe.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <ChefHat className="h-12 w-12" />
        </div>
      )}
      {/* Larger, more visible allergen badge */}
      {hasAllergenConflict && (
        <div className="absolute top-2 right-2 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-md">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">Allergen</span>
        </div>
      )}
    </div>
  </Link>

  <CardHeader>
    <div className="flex items-start justify-between gap-2">
      <Link href={`/recipes/${recipe.id}`} className="flex-1 min-w-0">
        <h3 className="font-semibold line-clamp-2 hover:underline text-base sm:text-lg">
          {recipe.name}
        </h3>
      </Link>
      <div className="flex items-center gap-1 flex-shrink-0">
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(recipe.id, !recipe.is_favorite)}
            aria-label={recipe.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            className="h-11 w-11"
          >
            <Heart
              className={`h-5 w-5 ${
                recipe.is_favorite ? 'fill-red-500 text-red-500' : ''
              }`}
            />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(recipe.id)}
            className="hover:text-red-500 h-11 w-11"
            aria-label={`Delete ${recipe.name}`}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  </CardHeader>

  <CardContent>
    {recipe.description && (
      <p className="text-sm text-muted-foreground line-clamp-2">
        {recipe.description}
      </p>
    )}
  </CardContent>

  <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground">
    {totalTime > 0 && (
      <div className="flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        <span>{totalTime} min</span>
      </div>
    )}
    <div className="flex items-center gap-1.5">
      <Users className="h-4 w-4" />
      <span>{recipe.servings} servings</span>
    </div>
  </CardFooter>
</Card>
```

---

### Button Component (`src/components/ui/button.tsx`)

#### Recommended Changes:

1. Increase icon size from 36px to 44px (see line 27)
2. Add pressed state for mobile
3. Ensure minimum font size of 16px

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-95 md:active:scale-100",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 text-base sm:text-sm has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 text-sm has-[>svg]:px-2.5",
        lg: "h-12 sm:h-10 rounded-md px-6 text-base has-[>svg]:px-4",
        icon: "size-11", // 44px - better for mobile
        "icon-sm": "size-9", // 36px - desktop only
        "icon-lg": "size-12", // 48px
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

Key changes:
- `active:scale-95 md:active:scale-100`: Button shrinks slightly on mobile when pressed
- `active:bg-primary/80`: Darker background on press
- `size-11` (44px) for icon buttons
- `text-base` default for better mobile readability

---

### Input Component (`src/components/ui/input.tsx`)

#### Current Issues:
1. Font size is 14px (`text-sm`), causes iOS zoom
2. No mobile-specific input modes

#### Recommended Changes:

```tsx
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  // Auto-detect inputMode based on type
  let inputMode = props.inputMode;
  if (!inputMode && type === 'number') {
    inputMode = 'numeric';
  } else if (!inputMode && type === 'email') {
    inputMode = 'email';
  } else if (!inputMode && type === 'tel') {
    inputMode = 'tel';
  } else if (!inputMode && type === 'url') {
    inputMode = 'url';
  }

  return (
    <input
      type={type}
      inputMode={inputMode}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-11 sm:h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}
```

Key changes:
- `h-11 sm:h-9`: Taller on mobile (44px), standard on desktop (36px)
- `text-base`: 16px font size prevents iOS zoom
- `md:text-sm`: 14px on desktop for consistency
- Auto-detects `inputMode` based on type

---

### Dialog Component (`src/components/ui/dialog.tsx`)

#### Current Issues:
1. Max width is too restrictive on mobile
2. Padding is large for small screens
3. Close button might be hard to tap

#### Recommended Changes:

```tsx
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-2rem)] md:max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-4 sm:p-6 shadow-lg duration-200",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-3 right-3 sm:top-4 sm:right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 h-8 w-8 sm:h-auto sm:w-auto flex items-center justify-center"
            aria-label="Close dialog"
          >
            <XIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}
```

Key changes:
- Smaller max-width calculation on mobile
- Less padding on mobile: `p-4 sm:p-6`
- Larger, easier-to-tap close button on mobile: `h-8 w-8`
- Positioned slightly inward: `top-3 right-3`

---

### Settings Form (`src/components/settings/preferences-form.tsx`)

#### Current Issues:
1. Checkboxes in 3 columns don't stack on mobile
2. 2-column grid for inputs too cramped on mobile

#### Recommended Changes:

**Line 105: Allergens Grid**

Current:
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
```

Recommended:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
```

**Line 125: Dietary Options Grid**

Current:
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
```

Recommended:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
```

**Line 152: Cooking Profile Inputs**

Current:
```tsx
<div className="grid md:grid-cols-2 gap-4">
```

Recommended:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

**Line 230: Cuisines Grid**

Current:
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
```

Recommended:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
```

---

## Visual Design Enhancements

### Typography

#### Current State:
- Font sizes are consistent
- Responsive scaling is minimal

#### Recommended Scale:

```css
/* Mobile-first typography scale */
.text-xs { font-size: 0.75rem; } /* 12px */
.text-sm { font-size: 0.875rem; } /* 14px */
.text-base { font-size: 1rem; } /* 16px */
.text-lg { font-size: 1.125rem; } /* 18px */
.text-xl { font-size: 1.25rem; sm: 1.5rem; } /* 20px → 24px */
.text-2xl { font-size: 1.5rem; sm: 2rem; } /* 24px → 32px */
.text-3xl { font-size: 1.875rem; sm: 2.25rem; md: 3rem; } /* 30px → 36px → 48px */
```

#### Hierarchy Improvements:

1. **Page Titles:** Use larger, bolder text with better spacing
   ```tsx
   <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
     My Recipes
   </h1>
   <p className="text-base sm:text-lg text-muted-foreground">
     Manage your recipe collection
   </p>
   ```

2. **Card Titles:** Scale with container
   ```tsx
   <h3 className="text-base sm:text-lg font-semibold line-clamp-2">
     {recipe.name}
   </h3>
   ```

3. **Body Text:** Minimum 16px on mobile
   ```tsx
   <p className="text-base text-muted-foreground">
     Description text
   </p>
   ```

---

### Spacing & Layout

#### Container Widths:

Current pages use `container mx-auto px-4`, which is good. Consider max-widths for content:

```tsx
<div className="container mx-auto px-4 py-8 max-w-7xl">
  {/* Content */}
</div>
```

#### Responsive Padding:

```tsx
<div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
```

#### Gap Sizes:

```tsx
<div className="space-y-4 sm:space-y-6 md:space-y-8">
<div className="grid gap-4 sm:gap-6 md:gap-8">
```

---

### Color & Theme

#### Current State:
- Clean neutral palette
- Good contrast in light mode
- Dark mode properly implemented

#### Enhancements:

1. **Add accent color for CTAs**
   ```css
   --accent-primary: 220 100% 50%; /* Blue for primary actions */
   ```

2. **Improve disabled state visibility**
   ```tsx
   disabled:opacity-50 disabled:cursor-not-allowed disabled:saturate-0
   ```

3. **Add success/warning/error states**
   ```css
   --success: 142 71% 45%; /* Green */
   --warning: 38 92% 50%; /* Amber */
   --error: 0 84% 60%; /* Red */
   ```

---

## Performance Optimization Opportunities

### Loading States

#### Current Issues:
- Text "Loading..." instead of skeleton screens
- No loading indicators for button actions

#### Recommended Skeleton Screens:

**Recipe List Skeleton:**

```tsx
export function RecipeListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardFooter>
            <Skeleton className="h-4 w-20 mr-4" />
            <Skeleton className="h-4 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

**Form Skeleton:**

```tsx
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" />
        </div>
      ))}
      <Skeleton className="h-11 w-32 mt-8" />
    </div>
  );
}
```

---

### Animations

#### Add Loading Spinners to Buttons:

```tsx
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Save className="h-4 w-4 mr-2" />
      Save Recipe
    </>
  )}
</Button>
```

#### Reduce Motion Preferences:

Add to global CSS:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Code Examples

### 1. Mobile Hamburger Menu Component (Complete)

See Recommendation #1 for full code.

---

### 2. Responsive Sidebar Layout (Complete)

See Recommendation #1 for full code.

---

### 3. Mobile-Optimized Form Layout

```tsx
// Example: Responsive ingredient form
<div className="space-y-6">
  <div className="space-y-4">
    {ingredientFields.map((field, index) => (
      <Card key={field.id} className="p-4">
        <div className="space-y-3">
          {/* Item Name - Full Width */}
          <FormField
            control={form.control}
            name={`ingredients.${index}.item`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ingredient</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Flour"
                    className="text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantity & Unit - Side by Side */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name={`ingredients.${index}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="400"
                      className="text-base"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`ingredients.${index}.unit`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UNIT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Notes - Full Width */}
          <FormField
            control={form.control}
            name={`ingredients.${index}.notes`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., chopped, diced"
                    className="text-base"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Delete Button */}
          {ingredientFields.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeIngredient(index)}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Ingredient
            </Button>
          )}
        </div>
      </Card>
    ))}
  </div>

  <Button
    type="button"
    variant="outline"
    onClick={() => appendIngredient({ item: '', quantity: '', unit: '', notes: '' })}
    className="w-full"
  >
    <Plus className="h-4 w-4 mr-2" />
    Add Ingredient
  </Button>
</div>
```

---

### 4. Accessible Button Component

See Button Component section for full accessible implementation.

---

### 5. Loading State Patterns

```tsx
// Loading state with skeleton
{isLoading ? (
  <RecipeListSkeleton />
) : recipes.length > 0 ? (
  <RecipeList recipes={recipes} />
) : (
  <EmptyState
    icon={ChefHat}
    title="No recipes yet"
    description="Create your first recipe to get started!"
    action={
      <Button asChild>
        <Link href="/recipes/new">
          <Plus className="h-4 w-4 mr-2" />
          Create Recipe
        </Link>
      </Button>
    }
  />
)}
```

---

### 6. Empty State Component

```tsx
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
}
```

---

## Before/After Visual Improvements

### 1. Dashboard Navigation (Desktop vs Mobile)

**Before:**
- Desktop: Sidebar always visible (256px fixed)
- Mobile: Sidebar always visible (takes 71% of viewport!)
- No mobile menu

**After:**
- Desktop: Sidebar visible (256px)
- Mobile: Sidebar hidden, hamburger menu in header
- Sheet drawer slides in from left on mobile

**Visual Description:**
- Mobile users see hamburger icon (☰) in top-left
- Tapping opens slide-in menu with all navigation items
- Menu items have larger text and spacing (44px min)
- Menu closes automatically after selecting item

---

### 2. AI Generate Form Layout

**Before:**
- 2-4 column grids on all screens
- Cramped inputs on mobile
- Model buttons overflow

**After:**
- Single column on mobile (< 640px)
- 2 columns on tablet (640px - 1024px)
- 3-4 columns on desktop (>= 1024px)
- Model buttons stack vertically on mobile, wrap on tablet+

**Visual Description:**
- Mobile: All inputs stacked, easy to tap
- Inputs are taller (44px) with larger text (16px)
- Model selection buttons are full-width on mobile
- "All 4 Models" button spans full width for emphasis

---

### 3. Recipe Card Grid

**Before:**
- 1 column mobile, 2 columns tablet, 3 columns desktop
- Images always 16:9 aspect ratio
- Icon buttons 36px (small on mobile)

**After:**
- 1 column mobile, 2 columns tablet portrait, 3 columns tablet landscape, 4 columns desktop
- Images square on mobile, 16:9 on tablet+
- Icon buttons 44px (easier to tap)

**Visual Description:**
- Mobile cards are larger, easier to see recipe details
- Square images show more of the dish on small screens
- Favorite and delete buttons are easier to tap
- Cards have more breathing room with responsive gaps

---

### 4. Onboarding Flow

**Before:**
- Progress bar exists
- Step content not optimized for mobile
- Checkboxes in 3 columns too cramped

**After:**
- Progress bar with step indicators
- Single-column checkboxes on mobile
- Larger tap targets
- "Skip" and "Continue" buttons full-width on mobile

**Visual Description:**
- Each step feels spacious on mobile
- Checkboxes have plenty of room to tap
- Buttons at bottom are thumb-friendly
- Progress is clear with large percentage

---

## Testing Recommendations

### Device Testing Matrix

#### Mobile Phones (Critical)

**iOS:**
- iPhone SE 3rd gen (4.7", 375 × 667 CSS pixels)
- iPhone 14 Pro (6.1", 393 × 852 CSS pixels)
- iPhone 14 Pro Max (6.7", 430 × 932 CSS pixels)

**Android:**
- Samsung Galaxy S21 (6.2", 360 × 800 CSS pixels)
- Google Pixel 7 (6.3", 412 × 915 CSS pixels)
- OnePlus 9 (6.55", 412 × 919 CSS pixels)

#### Tablets (High Priority)

**iOS:**
- iPad Mini 6 (8.3", 744 × 1133 CSS pixels portrait)
- iPad Air 5 (10.9", 820 × 1180 CSS pixels portrait)
- iPad Pro 12.9" (12.9", 1024 × 1366 CSS pixels portrait)

**Android:**
- Samsung Galaxy Tab S8 (11", 800 × 1280 CSS pixels)
- Lenovo Tab P11 (11", 1200 × 2000 CSS pixels)

#### Desktop (Medium Priority)

**Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Resolutions:**
- 1366 × 768 (common laptop)
- 1920 × 1080 (Full HD)
- 2560 × 1440 (QHD)

---

### Accessibility Testing

#### Screen Readers

**Desktop:**
- NVDA on Windows + Chrome
- JAWS on Windows + Edge
- VoiceOver on macOS + Safari

**Mobile:**
- VoiceOver on iOS
- TalkBack on Android

**Test Checklist:**
- [ ] All interactive elements are announced
- [ ] Form labels are associated correctly
- [ ] Error messages are announced
- [ ] Navigation landmarks are present
- [ ] Heading hierarchy is logical

---

#### Keyboard Navigation

**Test Checklist:**
- [ ] Tab key moves through all interactive elements
- [ ] Enter/Space activates buttons and checkboxes
- [ ] Escape closes dialogs and menus
- [ ] Arrow keys navigate selects and radio groups
- [ ] Focus is trapped in modals
- [ ] Focus returns to trigger after closing modal
- [ ] Skip to content link works

---

#### Color Contrast

**Tools:**
- Chrome DevTools Lighthouse
- axe DevTools extension
- WebAIM Contrast Checker

**Test Areas:**
- [ ] Text on backgrounds (light and dark mode)
- [ ] Button text on button backgrounds
- [ ] Placeholder text in inputs
- [ ] Muted text (check contrast ratio)
- [ ] Disabled state text
- [ ] Link colors

**Requirements:**
- Normal text: 4.5:1 minimum
- Large text (18px+ or 14px+ bold): 3:1 minimum
- UI components: 3:1 minimum

---

### Browser Testing

#### Feature Support

**Test Features:**
- [ ] CSS Grid (all modern browsers support)
- [ ] CSS Custom Properties (all modern browsers support)
- [ ] Container Queries (Chrome 105+, Firefox 110+, Safari 16+)
- [ ] Dialog element (Chrome 37+, Firefox 98+, Safari 15.4+)
- [ ] Intersection Observer (all modern browsers support)
- [ ] Web Share API (mobile browsers)
- [ ] Vibration API (mobile browsers)

---

### Performance Testing

#### Metrics to Monitor

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Tools:**
- Chrome DevTools Lighthouse
- WebPageTest.org
- Next.js Analytics (if enabled)

**Test Scenarios:**
- [ ] Homepage load time
- [ ] Recipe list with 50+ recipes
- [ ] AI generate page (complex form)
- [ ] Image-heavy recipe detail page
- [ ] Meal planner with full week

---

### Responsive Testing Tools

**Browser DevTools:**
- Chrome DevTools Device Toolbar (Cmd+Shift+M)
- Firefox Responsive Design Mode
- Safari Responsive Design Mode

**Online Tools:**
- BrowserStack (real devices)
- LambdaTest (real devices)
- Responsively App (desktop app)

**Testing Checklist:**
- [ ] Test all breakpoints (320px, 375px, 768px, 1024px, 1440px)
- [ ] Portrait and landscape orientations
- [ ] Zoom levels (100%, 150%, 200%)
- [ ] Text resize (browser settings)
- [ ] High contrast mode

---

## Implementation Notes

### Breaking Changes

1. **Button Size Changes**
   - Icon buttons increase from 36px to 44px
   - May affect layouts where buttons are tightly spaced
   - Test all pages with icon buttons

2. **Input Height Changes**
   - Inputs taller on mobile (44px) for better touch
   - May affect form layouts with fixed heights
   - Test all forms on mobile devices

3. **Sidebar Hidden on Mobile**
   - Dashboard layout changes significantly on mobile
   - Hamburger menu is now required for navigation
   - Test all navigation flows on mobile

4. **Grid Layout Changes**
   - Many grids now stack to single column on mobile
   - Content may look different on small screens
   - Test all pages with grid layouts

---

### Dependencies

#### New Packages Required

```json
{
  "@radix-ui/react-dialog": "^1.1.15", // Already installed (for Sheet)
  "react-simple-pull-to-refresh": "^1.3.3" // Optional, for pull-to-refresh
}
```

**Sheet Component:**
No new dependencies needed - can use existing Dialog primitive from Radix UI or create custom Sheet component.

---

### Browser Support

**Target Browsers:**
- Chrome/Edge 100+
- Firefox 100+
- Safari 15+
- iOS Safari 15+
- Chrome Android 100+

**Polyfills Needed:**
- None (modern browsers only)

**Progressive Enhancement:**
- Vibration API: Falls back gracefully if not supported
- Web Share API: Only show share button if supported
- Container Queries: Provide fallback with media queries if needed

---

### Migration Strategy

#### Phase 1: Critical Mobile Fixes (Week 1)

1. Implement mobile navigation (Recommendation #1)
2. Fix AI Generate page layout (Recommendation #2)
3. Fix Recipe Form horizontal scrolling (Recommendation #3)
4. Increase touch target sizes (Recommendation #5)

**Testing:** Full mobile device testing after each fix

---

#### Phase 2: Form & Layout Optimization (Week 2)

5. Redesign Meal Planner for mobile (Recommendation #4)
6. Optimize Settings Form (see Component section)
7. Fix Landing Page responsive issues (Recommendation #6)
8. Add loading skeletons (Recommendation #7)

**Testing:** Cross-device testing, focus on forms

---

#### Phase 3: Polish & Enhancement (Week 3)

9. Improve Recipe Card responsiveness (Recommendation #9)
10. Fix header integration (Recommendation #8)
11. Optimize dialogs for mobile (Recommendation #11)
12. Add pull-to-refresh (Recommendation #12)

**Testing:** Full accessibility audit, performance testing

---

#### Phase 4: Nice-to-Have Features (Week 4+)

13. Add swipe gestures (Recommendation #13)
14. Implement bottom navigation (Recommendation #14)
15. Add offline mode (Recommendation #15)
16. Implement voice input (Recommendation #16)
17. Add pinch-to-zoom (Recommendation #17)

**Testing:** User acceptance testing

---

### Code Review Checklist

Before merging mobile responsiveness changes:

**Layout:**
- [ ] All pages tested on mobile (< 768px)
- [ ] No horizontal scrolling
- [ ] All content visible without zooming
- [ ] Proper spacing between elements

**Touch Targets:**
- [ ] All buttons at least 44px × 44px
- [ ] Adequate spacing between tap targets (8px min)
- [ ] No overlapping touch areas

**Forms:**
- [ ] Single-column layout on mobile
- [ ] Input font size 16px minimum
- [ ] Proper `inputMode` attributes
- [ ] Labels visible on mobile

**Typography:**
- [ ] Responsive font sizes
- [ ] Readable line length (< 75 characters)
- [ ] Proper heading hierarchy

**Images:**
- [ ] Responsive aspect ratios
- [ ] Proper `sizes` attribute
- [ ] Lazy loading enabled

**Accessibility:**
- [ ] ARIA labels on icon buttons
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader tested

**Performance:**
- [ ] Lighthouse score > 90
- [ ] No layout shifts
- [ ] Fast input responsiveness

---

## Appendix

### Resources

#### Next.js Documentation
- [App Router Layouts](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
- [Responsive Design](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts#responsive-design)
- [Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)

#### Tailwind CSS
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Container Queries](https://tailwindcss.com/docs/hover-focus-and-other-states#container-queries)
- [Customizing Breakpoints](https://tailwindcss.com/docs/breakpoints)

#### shadcn/ui
- [Components](https://ui.shadcn.com/docs/components)
- [Installation](https://ui.shadcn.com/docs/installation/next)
- [Dark Mode](https://ui.shadcn.com/docs/dark-mode)

#### Accessibility Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WCAG 2.5.8 Target Size (AA)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

#### Mobile Design Guidelines
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design (Android)](https://m3.material.io/)
- [Touch Target Sizes](https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/)

#### Design Inspiration
- [Dribbble - Recipe App Designs](https://dribbble.com/tags/recipe-app)
- [Mobbin - Mobile App Patterns](https://mobbin.com/)
- [Page Flows - User Flow Examples](https://pageflows.com/)

---

### Glossary

**App Router:** Next.js 13+ routing system using the `app/` directory.

**Breakpoint:** Screen width at which layout changes (e.g., 768px = tablet).

**Container Query:** CSS feature to style based on parent size, not viewport.

**CSS Custom Properties:** CSS variables (e.g., `--primary-color`).

**Focus Indicator:** Visual highlight when element is keyboard-focused.

**Hamburger Menu:** Three-line icon (☰) that opens mobile navigation.

**Mobile-First:** Design approach starting with mobile, then enhancing for larger screens.

**Progressive Enhancement:** Building basic experience first, then adding advanced features.

**Radix UI:** Headless UI primitives (no styling, just functionality).

**Server Component:** Next.js component that renders on server (no client JS).

**Sheet:** Slide-in panel from edge of screen (like drawer).

**shadcn/ui:** Component library built on Radix UI with Tailwind styling.

**Skeleton Screen:** Placeholder shown while content loads.

**Touch Target:** Interactive element size (buttons, links).

**WCAG:** Web Content Accessibility Guidelines (international standard).

---

## Summary & Next Steps

### Immediate Actions Required

1. **Implement Mobile Navigation** (Recommendation #1)
   - Blocking all mobile users from accessing features
   - Estimated effort: 4-6 hours
   - Requires: Sheet component, mobile nav component, layout changes

2. **Fix AI Generate Page** (Recommendation #2)
   - Primary feature unusable on mobile
   - Estimated effort: 2-3 hours
   - Requires: Grid layout changes, input optimizations

3. **Fix Recipe Form** (Recommendation #3)
   - Users can't create recipes on mobile
   - Estimated effort: 3-4 hours
   - Requires: Layout restructure, responsive grids

### Success Metrics

After implementing recommendations:

**User Experience:**
- Mobile navigation accessible (0% → 100% users)
- Forms completable on mobile (20% → 95% success rate)
- Touch targets meet best practices (36px → 44px)

**Accessibility:**
- WCAG 2.2 AA compliance (partial → full)
- Lighthouse Accessibility score (75 → 95+)
- Screen reader compatible (untested → tested)

**Performance:**
- Reduced layout shifts (CLS < 0.1)
- Faster perceived loading (skeleton screens)
- Better mobile engagement (bounce rate reduction)

### Long-Term Recommendations

1. **Establish Design System**
   - Document component usage patterns
   - Create responsive layout templates
   - Build component library Storybook

2. **Continuous Testing**
   - Set up automated accessibility testing
   - Run Lighthouse CI on PRs
   - Regular device lab testing

3. **User Feedback Loop**
   - Implement analytics for mobile usage
   - A/B test mobile layouts
   - Gather user feedback on mobile experience

---

**End of Document**

---

**Document Version:** 1.0
**Last Updated:** October 14, 2025
**Next Review:** After Phase 1 implementation
**Contact:** UI/UX Design Specialist
