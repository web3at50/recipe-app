# Clerk Migration Plan - Supabase Auth → Clerk Auth

**Date:** October 2025
**Status:** Planning Complete - Ready for Implementation
**Estimated Total Time:** 2-3 hours

---

## Overview

Migrate from Supabase Auth to Clerk while keeping Supabase as the database layer. Use Clerk's native Supabase integration (2025 method - native third-party auth, not deprecated JWT template).

### Why Clerk?

- **Beautiful pre-built UI components** - No more custom auth forms
- **Industry-standard SaaS authentication** - Professional, production-ready
- **Generous free tier** - 10,000 Monthly Active Users (MAU) free
- **Better developer experience** - Drop-in components, minimal code
- **Built-in user management** - Dashboard included
- **OAuth works out of the box** - Google, GitHub, etc.
- **Stripe-ready** - Better integration for future payment features

### Key Architecture Decision

**Clerk handles:** Authentication, user sessions, OAuth, user management UI
**Supabase handles:** Database, data storage, Row Level Security (RLS)
**Integration:** Clerk passes JWT tokens to Supabase for RLS policy enforcement

---

## Current State Analysis

### Supabase Auth Implementation
- **3 utility files:** `client.ts`, `server.ts`, `middleware.ts`
- **4 custom auth components:** Login form, Signup form, Password reset, User menu
- **6 auth routes:** `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/auth/signout`
- **Middleware:** Route protection based on Supabase session
- **15 API routes:** All using `supabase.auth.getUser()`
- **Database:** 9 tables with RLS policies using `auth.uid()`

### Files to Modify/Delete
**Delete (11 files):**
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`
- `app/auth/callback/route.ts`
- `app/auth/signout/route.ts`
- `components/auth/login-form.tsx`
- `components/auth/signup-form.tsx`
- `components/ChangePasswordDialog.tsx`
- `components/UserMenu.tsx`
- `lib/supabase/middleware.ts`

**Modify (20+ files):**
- `app/layout.tsx`
- `middleware.ts`
- `lib/supabase/client.ts` (rewrite)
- `lib/supabase/server.ts` (rewrite or delete)
- `app/(dashboard)/layout.tsx`
- `app/onboarding/layout.tsx`
- `app/settings/page.tsx`
- All 15 API route files

**Create (1 file):**
- New Supabase client helper with Clerk token integration

---

## Phase 1: Clerk Account & Setup (MANUAL - USER ACTION REQUIRED)

**YOU NEED TO DO THIS FIRST BEFORE CLAUDE CONTINUES:**

### Step 1: Create Clerk Account
1. Navigate to: https://dashboard.clerk.com/sign-up
2. Sign up using Google or GitHub
3. Verify your email if required

### Step 2: Create Application
1. Click "Add application"
2. Name: "Recipe App" (or your preference)
3. Select authentication methods:
   - ✅ Email
   - ✅ Google OAuth
   - Optional: GitHub, other providers
4. Choose framework: Next.js
5. Click "Create Application"

### Step 3: Get Your Clerk Keys
1. In Clerk Dashboard, go to "API Keys"
2. Copy and save these keys (you'll need them):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Step 4: Enable Supabase Integration
1. In Clerk Dashboard, navigate to: **Integrations → Databases → Supabase**
2. Click "Activate Supabase integration"
3. Copy the **Clerk domain URL** that appears (looks like: `https://your-app.clerk.accounts.dev`)

### Step 5: Configure Supabase to Accept Clerk Auth
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `hvxjxcatbwfqrydxqfjq`
3. Navigate to: **Authentication → Providers**
4. Scroll down and find "Clerk" in the third-party providers
5. Click "Enable"
6. Paste the Clerk domain URL from Step 4
7. Save configuration

### Step 6: Verify Setup
- In Clerk Dashboard, the Supabase integration should show as "Active"
- In Supabase Dashboard, Clerk should show as an enabled provider

**⏸️ PAUSE HERE AND NOTIFY CLAUDE WHEN COMPLETE**

---

## Phase 2: Install Dependencies & Environment Setup

### Install Clerk Package
```bash
npm install @clerk/nextjs
```

### Update Environment Variables

**File:** `.env.local`

**Add these new variables:**
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... (from Clerk Dashboard)
CLERK_SECRET_KEY=sk_test_... (from Clerk Dashboard)

# Clerk URLs (optional, for custom domains later)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/recipes
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
```

**Keep these existing variables:**
```env
# Supabase (Keep these - still needed for database!)
NEXT_PUBLIC_SUPABASE_URL=https://hvxjxcatbwfqrydxqfjq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (existing key)

# AI API Keys (unchanged)
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

### Remove Old Supabase Auth Packages
```bash
npm uninstall @supabase/ssr @supabase/supabase-js
```

### Install Supabase Client Only (for database queries)
```bash
npm install @supabase/supabase-js
```

**Estimated time: 5 minutes**

---

## Phase 3: Database RLS Policy Migration

Update all Row Level Security policies to use Clerk's JWT token instead of Supabase's `auth.uid()`.

### Key Change
**Before (Supabase Auth):**
```sql
auth.uid() = user_id
```

**After (Clerk Auth):**
```sql
(auth.jwt()->>'sub')::text = user_id
```

### Migration SQL Script

**File to create:** `supabase/migrations/009_migrate_to_clerk_auth.sql`

```sql
-- =====================================================
-- MIGRATION: Supabase Auth → Clerk Auth RLS Policies
-- Date: October 2025
-- =====================================================

-- =====================================================
-- RECIPES TABLE
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;

-- Create new policies with Clerk JWT
CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  USING ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING ((auth.jwt()->>'sub')::text = user_id);

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING ((auth.jwt()->>'sub')::text = user_id);

-- =====================================================
-- USER RECIPE INTERACTIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own interactions" ON user_recipe_interactions;

CREATE POLICY "Users can manage own interactions"
  ON user_recipe_interactions FOR ALL
  USING ((auth.jwt()->>'sub')::text = user_id)
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

-- =====================================================
-- USER CONSENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own consents" ON user_consents;

CREATE POLICY "Users can manage own consents"
  ON user_consents FOR ALL
  USING ((auth.jwt()->>'sub')::text = user_id)
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

-- =====================================================
-- MEAL PLANS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own meal plans" ON meal_plans;

CREATE POLICY "Users can manage own meal plans"
  ON meal_plans FOR ALL
  USING ((auth.jwt()->>'sub')::text = user_id)
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

-- =====================================================
-- MEAL PLAN ITEMS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own meal plan items" ON meal_plan_items;

CREATE POLICY "Users can manage own meal plan items"
  ON meal_plan_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = (auth.jwt()->>'sub')::text
    )
  );

-- =====================================================
-- SHOPPING LISTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own shopping lists" ON shopping_lists;

CREATE POLICY "Users can manage own shopping lists"
  ON shopping_lists FOR ALL
  USING ((auth.jwt()->>'sub')::text = user_id)
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

-- =====================================================
-- SHOPPING LIST ITEMS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own shopping list items" ON shopping_list_items;

CREATE POLICY "Users can manage own shopping list items"
  ON shopping_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = (auth.jwt()->>'sub')::text
    )
  );

-- =====================================================
-- USER PANTRY STAPLES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can manage own pantry staples" ON user_pantry_staples;

CREATE POLICY "Users can manage own pantry staples"
  ON user_pantry_staples FOR ALL
  USING ((auth.jwt()->>'sub')::text = user_id)
  WITH CHECK ((auth.jwt()->>'sub')::text = user_id);

-- =====================================================
-- IMPORTANT: Remove auth.users foreign key constraints
-- =====================================================

-- Clerk user IDs are strings, not UUIDs
-- And they're not stored in auth.users table
-- We need to change user_id columns from UUID REFERENCES auth.users
-- to TEXT (no foreign key)

-- Note: This is a breaking change for existing data
-- But you mentioned no migration needed (test users only)

ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_user_id_fkey;
ALTER TABLE recipes ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
ALTER TABLE user_profiles ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE user_recipe_interactions DROP CONSTRAINT IF EXISTS user_recipe_interactions_user_id_fkey;
ALTER TABLE user_recipe_interactions ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE user_consents DROP CONSTRAINT IF EXISTS user_consents_user_id_fkey;
ALTER TABLE user_consents ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_id_fkey;
ALTER TABLE meal_plans ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE shopping_lists DROP CONSTRAINT IF EXISTS shopping_lists_user_id_fkey;
ALTER TABLE shopping_lists ALTER COLUMN user_id TYPE TEXT;

ALTER TABLE user_pantry_staples DROP CONSTRAINT IF EXISTS user_pantry_staples_user_id_fkey;
ALTER TABLE user_pantry_staples ALTER COLUMN user_id TYPE TEXT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Test that policies are created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN (
  'recipes',
  'user_profiles',
  'meal_plans',
  'meal_plan_items',
  'shopping_lists',
  'shopping_list_items',
  'user_consents',
  'user_recipe_interactions',
  'user_pantry_staples'
)
ORDER BY tablename, policyname;

-- =====================================================
-- COMPLETE
-- =====================================================
```

### Apply Migration
```bash
cd supabase
supabase db push
```

**Estimated time: 15-20 minutes**

---

## Phase 4: Frontend Core Infrastructure

### 4.1: Wrap App with Clerk Provider

**File:** `app/layout.tsx`

```typescript
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ThemeToggle"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Recipe App",
  description: "Your personal recipe manager and meal planner",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider>
            <header className="border-b">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-semibold">
                  Recipe App
                </Link>
                <nav className="flex items-center gap-2">
                  <ThemeToggle />
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
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

### 4.2: Create New Supabase Client Helper

**File:** `lib/supabase/client.ts` (REPLACE ENTIRE FILE)

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'

// Client-side Supabase client with Clerk auth
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Hook to create authenticated Supabase client
export function useSupabaseClient() {
  const { getToken } = useAuth()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: async () => {
        const token = await getToken({ template: 'supabase' })
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    },
  })
}
```

**File:** `lib/supabase/server.ts` (REPLACE ENTIRE FILE)

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// Server-side Supabase client with Clerk auth
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const { getToken } = await auth()
  const token = await getToken({ template: 'supabase' })

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  })
}
```

### 4.3: Update Middleware

**File:** `middleware.ts` (REPLACE ENTIRE FILE)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/playground(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

**DELETE FILE:** `lib/supabase/middleware.ts` (no longer needed)

**Estimated time: 20 minutes**

---

## Phase 5: Remove Custom Auth UI

These files are completely replaced by Clerk's built-in components.

### Delete Auth Pages
```bash
rm -rf app/(auth)
rm -f app/forgot-password/page.tsx
rm -f app/reset-password/page.tsx
rm -rf app/auth
```

### Delete Auth Components
```bash
rm -f components/auth/login-form.tsx
rm -f components/auth/signup-form.tsx
rm -f components/ChangePasswordDialog.tsx
rm -f components/UserMenu.tsx
```

### Files to Delete (11 total):
1. `app/(auth)/login/page.tsx`
2. `app/(auth)/signup/page.tsx`
3. `app/forgot-password/page.tsx`
4. `app/reset-password/page.tsx`
5. `app/auth/callback/route.ts`
6. `app/auth/signout/route.ts`
7. `components/auth/login-form.tsx`
8. `components/auth/signup-form.tsx`
9. `components/ChangePasswordDialog.tsx`
10. `components/UserMenu.tsx`
11. `lib/supabase/middleware.ts`

**Estimated time: 2 minutes**

---

## Phase 6: Update Protected Layouts

### 6.1: Dashboard Layout

**File:** `app/(dashboard)/layout.tsx`

```typescript
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ChefHat, Calendar, ShoppingCart } from 'lucide-react'
import { Toaster } from 'sonner'
import { createClient } from '@/lib/supabase/server'

const navigation = [
  { name: 'My Recipes', href: '/recipes', icon: BookOpen },
  { name: 'AI Generate', href: '/generate', icon: ChefHat },
  { name: 'Meal Planner', href: '/meal-planner', icon: Calendar },
  { name: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Check if user has completed onboarding (using Supabase for DB query)
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .single()

  // Redirect to onboarding if not completed
  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/40 p-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1">{children}</div>
      </div>
      <Toaster position="bottom-right" richColors />
    </>
  )
}
```

### 6.2: Onboarding Layout

**File:** `app/onboarding/layout.tsx`

```typescript
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in')
  }

  // Check if user has already completed onboarding
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .single()

  // If onboarding already completed, redirect to dashboard
  if (profile?.onboarding_completed) {
    redirect('/recipes')
  }

  return <>{children}</>
}
```

**Estimated time: 10 minutes**

---

## Phase 7: Migrate All API Routes

Update all 15 API routes to use Clerk authentication instead of Supabase auth.

### Pattern to Follow

**OLD PATTERN (Supabase Auth):**
```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use user.id for queries
  const { data } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', user.id)

  return NextResponse.json({ data })
}
```

**NEW PATTERN (Clerk Auth):**
```typescript
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use userId for queries (Clerk user ID)
  const supabase = await createClient()
  const { data } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)

  return NextResponse.json({ data })
}
```

### Routes to Update

#### 1. `/api/recipes/route.ts` (GET, POST)
- Replace `supabase.auth.getUser()` with `auth()`
- Use `userId` instead of `user.id`

#### 2. `/api/recipes/[id]/route.ts` (GET, PUT, DELETE)
- Same pattern as above

#### 3. `/api/profile/route.ts` (GET, PUT)
- Replace `supabase.auth.getUser()` with `auth()`
- Use `userId` for profile queries

#### 4. `/api/profile/onboarding/route.ts` (POST)
- Replace `supabase.auth.getUser()` with `auth()`
- Use `userId` for profile creation

#### 5. `/api/meal-plans/route.ts` (GET, POST)
- Replace auth pattern
- Use `userId`

#### 6. `/api/meal-plans/items/route.ts` (POST)
- Replace auth pattern

#### 7. `/api/meal-plans/items/[id]/route.ts` (PUT, DELETE)
- Replace auth pattern

#### 8. `/api/shopping-lists/route.ts` (GET, POST)
- Replace auth pattern
- Use `userId`

#### 9. `/api/shopping-lists/[id]/route.ts` (GET, PUT, DELETE)
- Replace auth pattern

#### 10. `/api/shopping-lists/[id]/items/route.ts` (GET, POST)
- Replace auth pattern

#### 11. `/api/shopping-lists/items/[id]/route.ts` (PUT, DELETE)
- Replace auth pattern

#### 12. `/api/shopping-lists/generate/route.ts` (POST)
- Replace auth pattern
- Use `userId`

#### 13. `/api/user/pantry-staples/route.ts` (GET, POST)
- Replace auth pattern
- Use `userId`

#### 14. `/api/user/pantry-staples/[id]/route.ts` (DELETE)
- Replace auth pattern

#### 15. `/api/ai/generate/route.ts` (POST)
- Replace auth pattern
- Use `userId`

### Important Notes
- Keep all Supabase database queries - only change authentication
- RLS policies will automatically enforce access control via JWT
- No changes needed to query structure, just the auth check

**Estimated time: 30-40 minutes**

---

## Phase 8: Update Settings Page

**File:** `app/settings/page.tsx`

Remove password change functionality (Clerk handles this in UserButton component).

```typescript
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PreferencesForm } from '@/components/settings/preferences-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const supabase = await createClient()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Fetch consents
  const { data: consents } = await supabase
    .from('user_consents')
    .select('*')
    .eq('user_id', userId)

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and dietary requirements
          </p>
        </div>

        <Separator />

        {/* Account Settings - Managed by Clerk */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings, password, and authentication methods through your profile menu in the top right.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Preferences Form - Database driven */}
        <Card>
          <CardHeader>
            <CardTitle>Dietary Preferences</CardTitle>
            <CardDescription>
              Update your dietary restrictions, allergies, and cooking preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PreferencesForm
              profile={profile}
              consents={consents || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Note:** The `ChangePasswordDialog` component is deleted - Clerk's `<UserButton />` component provides account management including password changes.

**Estimated time: 10 minutes**

---

## Phase 9: Testing & Validation

### Testing Checklist

#### Authentication Flow
- [ ] Sign up with email works
- [ ] Sign up with Google OAuth works
- [ ] Sign in with email works
- [ ] Sign in with Google works
- [ ] Sign out works
- [ ] UserButton displays correctly
- [ ] Profile picture shows (if Google OAuth)

#### Route Protection
- [ ] Unauthenticated users redirected to sign-in
- [ ] `/playground` routes remain public
- [ ] Dashboard routes require authentication
- [ ] Onboarding flow works

#### Database Operations (RLS Testing)
- [ ] Create recipe (INSERT)
- [ ] View own recipes (SELECT)
- [ ] Update recipe (UPDATE)
- [ ] Delete recipe (DELETE)
- [ ] Cannot access other users' data

#### Profile & Onboarding
- [ ] New user redirected to onboarding
- [ ] Onboarding saves to database
- [ ] Profile preferences update correctly
- [ ] Settings page displays correctly

#### All Features End-to-End
- [ ] Recipe CRUD operations
- [ ] Meal planner create/edit
- [ ] Shopping list generate/manage
- [ ] Pantry staples CRUD
- [ ] AI recipe generation

#### API Routes
- [ ] All 15 API routes return 401 when not authenticated
- [ ] All API routes work when authenticated
- [ ] User can only access their own data

### Testing Commands

```bash
# Start development server
npm run dev

# Check for TypeScript errors
npx tsc --noEmit

# Check for build errors
npm run build
```

### Manual Testing Steps

1. **Fresh Start Test:**
   - Clear browser cookies/storage
   - Sign up as new user
   - Complete onboarding
   - Create a recipe
   - Create a meal plan
   - Generate shopping list

2. **Cross-Browser Test:**
   - Test in Chrome
   - Test in Safari/Edge

3. **OAuth Test:**
   - Sign up with Google
   - Verify profile data syncs
   - Sign out and sign back in

**Estimated time: 20-30 minutes**

---

## Phase 10: Cleanup & Documentation

### Remove Unused Code

1. Verify all deleted files are gone
2. Check for any remaining Supabase auth imports
3. Remove unused dependencies

```bash
# Check for remaining Supabase auth references
grep -r "supabase.auth" frontend/src --exclude-dir=node_modules
```

### Update Documentation

**File:** `README.md` (update auth setup section)

```markdown
## Authentication Setup

This app uses [Clerk](https://clerk.com) for authentication and [Supabase](https://supabase.com) for the database.

### Environment Variables

Create a `.env.local` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# AI Keys
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
```

### Local Development

1. Create Clerk account at https://clerk.com
2. Create Supabase project at https://supabase.com
3. Configure Clerk → Supabase integration (see docs)
4. Run migrations: `cd supabase && supabase db push`
5. Start dev server: `npm run dev`
```

### Git Commit

```bash
git add .
git commit -m "Migrate from Supabase Auth to Clerk

- Install @clerk/nextjs and configure ClerkProvider
- Update all API routes to use Clerk auth
- Migrate RLS policies to use Clerk JWT
- Replace custom auth UI with Clerk components
- Update middleware for Clerk route protection
- Remove Supabase auth dependencies
- Update documentation

BREAKING CHANGE: User IDs changed from UUID to Clerk string IDs
Existing test users need to re-register"
```

**Estimated time: 5 minutes**

---

## Success Criteria

✅ **Authentication**
- Users can sign up with email or Google
- Users can sign in with email or Google
- Sessions persist correctly
- Sign out works

✅ **Authorization**
- Protected routes redirect to sign-in
- API routes enforce authentication
- RLS policies work correctly
- Users can only access their own data

✅ **User Experience**
- Beautiful Clerk UI components
- Onboarding flow works
- Settings page functional
- No broken links or errors

✅ **Technical**
- No TypeScript errors
- Build succeeds
- All tests pass
- No console errors

---

## Rollback Plan

If issues arise, you can rollback:

1. **Git Revert:**
   ```bash
   git revert HEAD
   npm install
   ```

2. **Restore Supabase Auth:**
   - Restore deleted auth files from git history
   - Reinstall `@supabase/ssr` packages
   - Revert RLS policy migration

3. **Database Migration Rollback:**
   ```sql
   -- Revert user_id back to UUID with auth.users FK
   -- Restore old RLS policies
   ```

---

## Post-Migration Notes

### User ID Changes
- **Old:** Supabase UUID (`123e4567-e89b-12d3-a456-426614174000`)
- **New:** Clerk string ID (`user_2abc123def456`)

### Data Implications
- Existing test user data will be orphaned (user_id no longer matches)
- New users will have Clerk IDs
- If you need to preserve data, you'd need to create a user mapping table (not required for this project)

### Clerk Features Now Available
- User management dashboard
- Email/SMS verification
- Multi-factor authentication (MFA)
- Social OAuth (Google, GitHub, etc.)
- Magic links
- Session management
- User metadata
- Organizations (future use for B2B)
- Better analytics

### Future Enhancements
- Add more OAuth providers (GitHub, Apple)
- Enable MFA for enhanced security
- Use Clerk Organizations for family/team accounts
- Implement Clerk webhooks for user lifecycle events
- Add user metadata for additional profile fields

---

## Resources

### Documentation
- [Clerk Docs](https://clerk.com/docs)
- [Clerk + Supabase Integration](https://clerk.com/docs/integrations/databases/supabase)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase RLS with Clerk](https://supabase.com/docs/guides/auth/third-party/clerk)

### Example Repositories
- [clerk-supabase-nextjs](https://github.com/clerk/clerk-supabase-nextjs)
- [Clerk Examples](https://github.com/clerk/clerk-docs/tree/main/examples)

### Support
- [Clerk Discord](https://clerk.com/discord)
- [Clerk Support](https://clerk.com/support)
- [Supabase Discord](https://discord.supabase.com)

---

## Timeline Summary

| Phase | Task | Time | Dependencies |
|-------|------|------|--------------|
| 1 | Clerk account setup (MANUAL) | 10 min | User action required |
| 2 | Install dependencies | 5 min | Phase 1 complete |
| 3 | Database RLS migration | 20 min | Phase 2 complete |
| 4 | Frontend infrastructure | 20 min | Phase 3 complete |
| 5 | Remove custom auth UI | 2 min | Phase 4 complete |
| 6 | Update layouts | 10 min | Phase 5 complete |
| 7 | Migrate API routes | 40 min | Phase 6 complete |
| 8 | Update settings page | 10 min | Phase 7 complete |
| 9 | Testing | 30 min | Phase 8 complete |
| 10 | Cleanup | 5 min | Phase 9 complete |

**Total:** ~2.5 hours (not including Phase 1 manual setup)

---

## Status Tracking

- [ ] Phase 1: Clerk account setup ⏸️ **WAITING FOR USER**
- [ ] Phase 2: Dependencies installed
- [ ] Phase 3: Database migration applied
- [ ] Phase 4: Core infrastructure updated
- [ ] Phase 5: Auth UI removed
- [ ] Phase 6: Layouts updated
- [ ] Phase 7: API routes migrated
- [ ] Phase 8: Settings page updated
- [ ] Phase 9: Testing complete
- [ ] Phase 10: Cleanup & docs done

---

**Last Updated:** October 2025
**Migration Status:** Ready to begin after user completes Phase 1
