# Recipe App - Complete Implementation Plan

**Project Name:** AI-Powered Recipe Manager
**Version:** 1.0
**Last Updated:** October 2025
**Status:** Ready for Phase 1 Implementation

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Design System](#2-tech-stack--design-system)
3. [Project Setup Instructions](#3-project-setup-instructions)
4. [Database Schema (Phase 1)](#4-database-schema-phase-1)
5. [Phase 1 Implementation (Weeks 1-6)](#5-phase-1-implementation-weeks-1-6)
6. [Phase 2 & 3 Overview](#6-phase-2--3-overview)
7. [Environment Variables](#7-environment-variables)
8. [Deployment Checklist](#8-deployment-checklist)

---

## 1. Project Overview

### 1.1 App Description

An AI-powered recipe management platform that helps home cooks create, organize, and plan meals based on what they have available. The app combines intelligent recipe generation with practical meal planning and shopping list features.

### 1.2 Core Value Proposition

- **Reduce Food Waste**: Generate recipes from existing pantry items
- **Save Time**: AI-powered meal planning and automatic shopping lists
- **Personalization**: Dietary preferences and dual AI models (Anthropic + OpenAI)
- **Flexibility**: Multiple recipe import methods
- **Organization**: Smart categorization and tagging

### 1.3 Target Users

- Busy professionals needing quick meal solutions
- Families managing weekly meal planning
- Health-conscious individuals tracking nutrition
- Home cooks looking to reduce food waste

### 1.4 Phase 1 Goals (MVP Core Features)

**What we're building in Phase 1 (6 weeks):**

1. ✅ User authentication (email + password, Google OAuth for production)
2. ✅ Basic recipe management (manual entry, view, edit, delete)
3. ✅ AI recipe generation from ingredients (single AI model to start)
4. ✅ "What's in Cupboard" pantry tracking
5. ✅ "Always Have" staples list
6. ✅ Basic weekly meal planner
7. ✅ Shopping list generation from recipes

**Success Criteria:** Users can add ingredients → generate recipe → save it → plan meals → get shopping list (complete core loop)

---

## 2. Tech Stack & Design System

### 2.1 Technology Stack

#### Frontend
- **Framework**: Next.js 15.5+ (App Router)
- **Language**: TypeScript
- **Routing**: App Router in `frontend/src/app/`
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style, neutral base)
- **Fonts**: Geist Sans & Geist Mono
- **Forms**: React Hook Form + Zod validation
- **AI SDK**: Vercel AI SDK 5

#### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
  - **Production**: Email/Password + Google OAuth
  - **Local Development**: Email/Password only (simplified setup)
- **Storage**: Supabase Storage
- **API**: Next.js API routes in `frontend/src/app/api/`

#### AI Integration
- **Anthropic**: Claude (primary for Phase 1)
- **OpenAI**: GPT-4 (added in Phase 2 for dual model choice)

#### Infrastructure
- **Version Control**: Git + GitHub
- **Deployment**: Vercel
- **Database Migrations**: Supabase migrations (manual push with `supabase db push`)
- **PDF Generation**: PDFShift API (Phase 3)

#### Developer Tools
- **Package Manager**: npm or pnpm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode

### 2.2 Design System (Monochrome Theme)

#### Exact OKLCH Color Values

Use this **exact** monochrome theme:

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
}
```

#### shadcn/ui Configuration

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 2.3 Project Structure (Canonical)

```
recipeapp/
├── frontend/                    # Next.js application
│   ├── .next/                   # Build directory (auto-generated)
│   ├── node_modules/            # Dependencies (auto-generated)
│   ├── public/                  # Static assets
│   │   └── favicon.ico
│   ├── src/                     # Source code
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── (auth)/          # Auth route group
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── signup/
│   │   │   │       └── page.tsx
│   │   │   ├── (dashboard)/     # Protected routes
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx     # Dashboard home
│   │   │   │   ├── recipes/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/page.tsx
│   │   │   │   │   └── new/page.tsx
│   │   │   │   ├── meal-planner/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── shopping-list/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── pantry/
│   │   │   │   │   ├── cupboard/page.tsx
│   │   │   │   │   └── always-have/page.tsx
│   │   │   │   ├── generate/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   ├── api/             # API routes
│   │   │   │   ├── recipes/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── ai/
│   │   │   │   │   └── generate/route.ts
│   │   │   │   ├── meal-plans/
│   │   │   │   │   └── route.ts
│   │   │   │   └── shopping-lists/
│   │   │   │       └── route.ts
│   │   │   ├── auth/
│   │   │   │   └── callback/route.ts
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Landing page
│   │   │   └── globals.css      # Global styles
│   │   ├── components/          # React components
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── auth/
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── signup-form.tsx
│   │   │   ├── recipes/
│   │   │   │   ├── recipe-card.tsx
│   │   │   │   ├── recipe-form.tsx
│   │   │   │   └── recipe-list.tsx
│   │   │   ├── meal-planner/
│   │   │   │   └── week-view.tsx
│   │   │   ├── pantry/
│   │   │   │   └── cupboard-list.tsx
│   │   │   └── shared/
│   │   │       ├── header.tsx
│   │   │       └── nav.tsx
│   │   ├── lib/                 # Utilities
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts
│   │   │   │   ├── server.ts
│   │   │   │   └── middleware.ts
│   │   │   ├── ai/
│   │   │   │   ├── anthropic.ts
│   │   │   │   └── prompts.ts
│   │   │   └── utils.ts
│   │   ├── types/               # TypeScript types
│   │   │   ├── database.ts
│   │   │   └── index.ts
│   │   └── middleware.ts        # Next.js middleware
│   ├── .env.local               # Environment variables (DO NOT COMMIT)
│   ├── .gitignore
│   ├── components.json          # shadcn config
│   ├── next.config.mjs
│   ├── package.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
├── supabase/                    # Database
│   ├── migrations/              # SQL migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_profiles_and_auth.sql
│   │   └── [future migrations]
│   ├── functions/               # Edge Functions (if needed)
│   │   └── .gitkeep
│   └── config.toml              # Supabase config
├── setup/                       # Setup documentation (IN .gitignore)
│   ├── mvp-research-and-plan.md
│   ├── RECIPE_APP_IMPLEMENTATION_PLAN.md
│   ├── AUTH_TROUBLESHOOTING.md
│   └── GOOGLE_OAUTH_SETUP_GUIDE.md
├── .gitignore                   # MUST include setup/
└── README.md
```

---

## 3. Project Setup Instructions

### 3.1 Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm or pnpm installed
- [ ] Git installed
- [ ] GitHub account with empty repository created
- [ ] Supabase project created (Pro account)
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Vercel account ready
- [ ] Anthropic API key obtained
- [ ] OpenAI API key obtained (for Phase 2)

### 3.2 Step-by-Step Setup

#### Step 1: Clone Repository & Setup Directories

```bash
# Clone your empty GitHub repository
git clone [YOUR_GITHUB_REPO_URL]
cd recipeapp

# Create setup directory (will be in .gitignore)
mkdir setup

# Create .gitignore
cat > .gitignore << EOF
# Setup docs (don't commit)
setup/

# Dependencies
node_modules/
.next/

# Environment variables
.env.local
.env*.local

# Build output
dist/
build/

# Vercel
.vercel

# OS
.DS_Store
Thumbs.db
EOF

git add .gitignore
git commit -m "Add .gitignore"
```

#### Step 2: Initialize Next.js Frontend

```bash
# Create Next.js app in frontend directory
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"

# Navigate to frontend
cd frontend
```

When prompted:
- Use App Router: **Yes**
- Use Turbopack: **No**
- Customize import alias: **Yes** (@/*)

#### Step 3: Install Dependencies

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# shadcn/ui dependencies
npm install class-variance-authority clsx lucide-react tailwind-merge

# Form handling
npm install react-hook-form zod @hookform/resolvers

# Vercel AI SDK
npm install ai @ai-sdk/anthropic @ai-sdk/openai

# Tailwind v4
npm install tailwindcss@next @tailwindcss/postcss@next tw-animate-css
```

#### Step 4: Configure Tailwind CSS v4

**Update `frontend/postcss.config.mjs`:**

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**Remove** `tailwind.config.ts` (Tailwind v4 uses CSS-first config)

```bash
rm tailwind.config.ts
```

**Update `frontend/src/app/globals.css`** with the exact OKLCH theme from section 2.2 above.

#### Step 5: Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Configuration:
- Style: **New York**
- Base color: **Neutral**
- CSS variables: **Yes**
- RSC: **Yes**
- TypeScript: **Yes**

**Install essential components:**

```bash
npx shadcn@latest add button card input label dropdown-menu dialog separator tabs form
```

#### Step 6: Setup Supabase

**Create Supabase clients:**

**`frontend/src/lib/supabase/client.ts`:**

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`frontend/src/lib/supabase/server.ts`:**

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  );
}
```

**`frontend/src/lib/supabase/middleware.ts`:**

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected paths
  const protectedPaths = ['/recipes', '/meal-planner', '/shopping-list', '/pantry', '/generate', '/settings'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect to login if not authenticated
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if authenticated and on auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/recipes';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

**`frontend/src/middleware.ts`:**

```typescript
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

#### Step 7: Create Environment Variables

**Create `frontend/.env.local`:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]

# AI API Keys
ANTHROPIC_API_KEY=[YOUR_ANTHROPIC_API_KEY]
OPENAI_API_KEY=[YOUR_OPENAI_API_KEY]
```

**⚠️ IMPORTANT:** Never commit `.env.local` to Git!

#### Step 8: Setup Supabase Migrations

Navigate to project root:

```bash
cd ..
```

Create Supabase directory structure:

```bash
mkdir -p supabase/migrations supabase/functions
touch supabase/functions/.gitkeep
```

**Create migration files** (see section 4 for complete schema)

```bash
# Will create migrations in next section
```

#### Step 9: Configure Supabase Authentication

**In Supabase Dashboard → Authentication → Providers:**

1. ✅ Enable **Email** provider
2. ✅ Enable "Confirm email" for production (disable for local dev)
3. ✅ Enable **Google** provider (add Client ID and Secret for production)

**In Supabase Dashboard → Authentication → URL Configuration:**

- Site URL: `https://[your-app].vercel.app`
- Redirect URLs:
  - `https://[your-app].vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

**For Google OAuth setup (production):**
- Reference: `setup/GOOGLE_OAUTH_SETUP_GUIDE.md` (from SAAS template)
- Create OAuth client in Google Cloud Console
- Add redirect URI: `https://[supabase-project].supabase.co/auth/v1/callback`

**Note:** For local development, only email authentication is needed. Google OAuth can be configured later for production.

#### Step 10: Push to GitHub

```bash
git add .
git commit -m "Initial project setup"
git push origin main
```

---

## 4. Database Schema (Phase 1)

### 4.1 Overview

Phase 1 includes these tables:
- `profiles` - User profile data
- `recipes` - Recipe storage
- `recipe_ingredients` - Normalized ingredients
- `recipe_instructions` - Step-by-step instructions
- `categories` - Pre-defined tags (dietary, meal type, etc.)
- `recipe_categories` - Many-to-many relationship
- `cupboard_items` - User's current pantry inventory
- `always_have_items` - User's staple ingredients
- `meal_plans` - Weekly meal plan containers
- `meal_plan_items` - Recipes assigned to meal slots
- `shopping_lists` - Shopping list containers
- `shopping_list_items` - Individual shopping list items

### 4.2 Migration Files

#### Migration 1: Initial Schema

**`supabase/migrations/001_initial_schema.sql`:**

```sql
-- =====================================================
-- RECIPE APP - INITIAL SCHEMA
-- Phase 1: Core Tables
-- =====================================================

-- =====================================================
-- RECIPES
-- =====================================================

CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  servings INTEGER DEFAULT 4,
  source TEXT CHECK (source IN ('ai_generated', 'manual')) DEFAULT 'manual',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_recipes_is_favorite ON recipes(user_id, is_favorite) WHERE is_favorite = true;

-- RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RECIPE INGREDIENTS
-- =====================================================

CREATE TABLE recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  item TEXT NOT NULL,
  quantity DECIMAL(10, 2),
  unit TEXT,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ingredients of own recipes"
  ON recipe_ingredients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ingredients for own recipes"
  ON recipe_ingredients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ingredients of own recipes"
  ON recipe_ingredients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ingredients of own recipes"
  ON recipe_ingredients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- =====================================================
-- RECIPE INSTRUCTIONS
-- =====================================================

CREATE TABLE recipe_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);

ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view instructions of own recipes"
  ON recipe_instructions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert instructions for own recipes"
  ON recipe_instructions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update instructions of own recipes"
  ON recipe_instructions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete instructions of own recipes"
  ON recipe_instructions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- =====================================================
-- CATEGORIES
-- =====================================================

CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  type TEXT CHECK (type IN ('dietary', 'meal_type', 'other')) DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed default categories
INSERT INTO categories (name, slug, type) VALUES
  ('Vegetarian', 'vegetarian', 'dietary'),
  ('Vegan', 'vegan', 'dietary'),
  ('Gluten-Free', 'gluten-free', 'dietary'),
  ('Dairy-Free', 'dairy-free', 'dietary'),
  ('Low-Carb', 'low-carb', 'dietary'),
  ('Breakfast', 'breakfast', 'meal_type'),
  ('Lunch', 'lunch', 'meal_type'),
  ('Dinner', 'dinner', 'meal_type'),
  ('Snack', 'snack', 'meal_type'),
  ('Quick (<30min)', 'quick', 'other'),
  ('Favorites', 'favorites', 'other');

-- Categories are public (read-only)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- =====================================================
-- RECIPE CATEGORIES (Many-to-Many)
-- =====================================================

CREATE TABLE recipe_categories (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (recipe_id, category_id)
);

CREATE INDEX idx_recipe_categories_recipe_id ON recipe_categories(recipe_id);
CREATE INDEX idx_recipe_categories_category_id ON recipe_categories(category_id);

ALTER TABLE recipe_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories of own recipes"
  ON recipe_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_categories.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add categories to own recipes"
  ON recipe_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_categories.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove categories from own recipes"
  ON recipe_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_categories.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- =====================================================
-- CUPBOARD ITEMS (What's in the cupboard)
-- =====================================================

CREATE TABLE cupboard_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item TEXT NOT NULL,
  quantity DECIMAL(10, 2),
  unit TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_cupboard_items_user_id ON cupboard_items(user_id);

ALTER TABLE cupboard_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cupboard"
  ON cupboard_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ALWAYS HAVE ITEMS (Pantry staples)
-- =====================================================

CREATE TABLE always_have_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_always_have_items_user_id ON always_have_items(user_id);

ALTER TABLE always_have_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own always-have list"
  ON always_have_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- MEAL PLANS
-- =====================================================

CREATE TABLE meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_dates ON meal_plans(user_id, start_date, end_date);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plans"
  ON meal_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- MEAL PLAN ITEMS
-- =====================================================

CREATE TABLE meal_plan_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  servings INTEGER DEFAULT 4,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_meal_plan_items_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX idx_meal_plan_items_date ON meal_plan_items(date);

ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plan items"
  ON meal_plan_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
    )
  );

-- =====================================================
-- SHOPPING LISTS
-- =====================================================

CREATE TABLE shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT DEFAULT 'Shopping List',
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);

ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopping lists"
  ON shopping_lists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SHOPPING LIST ITEMS
-- =====================================================

CREATE TABLE shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
  item TEXT NOT NULL,
  quantity DECIMAL(10, 2),
  unit TEXT,
  category TEXT,
  is_checked BOOLEAN DEFAULT false,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_shopping_list_items_list_id ON shopping_list_items(shopping_list_id);

ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopping list items"
  ON shopping_list_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cupboard_items_updated_at
  BEFORE UPDATE ON cupboard_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_list_items_updated_at
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Migration 2: Profiles & Auth

**`supabase/migrations/002_profiles_and_auth.sql`:**

```sql
-- =====================================================
-- USER PROFILES & AUTH
-- =====================================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  preferred_ai_model TEXT CHECK (preferred_ai_model IN ('anthropic', 'openai')) DEFAULT 'anthropic',
  dietary_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.email,
      NEW.raw_user_meta_data->>'email',
      'no-email@placeholder.com'
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4.3 Push Migrations to Supabase

From project root:

```bash
supabase db push
```

**Note:** No local Supabase environment. All migrations are pushed directly to your live Supabase project.

---

## 5. Phase 1 Implementation (Weeks 1-6)

### 5.1 Weekly Breakdown

#### **Week 1: Authentication & Core Setup**

**Goals:**
- Users can sign up, log in, log out
- Protected routes working
- Basic dashboard structure

**Tasks:**

1. **Create Auth Components**
   - [ ] `frontend/src/components/auth/login-form.tsx`
   - [ ] `frontend/src/components/auth/signup-form.tsx`
   - Implement email/password auth
   - Add Google OAuth button (works in production only)
   - Add form validation with Zod

2. **Create Auth Pages**
   - [ ] `frontend/src/app/(auth)/login/page.tsx`
   - [ ] `frontend/src/app/(auth)/signup/page.tsx`
   - [ ] `frontend/src/app/auth/callback/route.ts` (OAuth callback)

3. **Create Dashboard Layout**
   - [ ] `frontend/src/app/(dashboard)/layout.tsx`
   - [ ] `frontend/src/components/shared/header.tsx`
   - [ ] `frontend/src/components/shared/nav.tsx`
   - Navigation sidebar with links to:
     - Recipes
     - Meal Planner
     - Shopping List
     - Pantry Management
     - AI Generate
     - Settings

4. **Create Dashboard Home**
   - [ ] `frontend/src/app/(dashboard)/page.tsx`
   - Welcome message
   - Quick action buttons
   - Placeholder widgets for upcoming features

5. **Create Settings Page**
   - [ ] `frontend/src/app/(dashboard)/settings/page.tsx`
   - User profile editing
   - AI model preference selection
   - Dietary preferences

**Deliverables:**
- ✅ Full auth flow working
- ✅ Protected dashboard accessible after login
- ✅ User can view/edit profile

**Testing:**
- Test signup with email/password
- Test login with email/password
- Test logout
- Test middleware redirects (unauthenticated users to /login)
- Test Google OAuth in production (after deployment)

---

#### **Week 2: Recipe Management (CRUD)**

**Goals:**
- Users can manually create recipes
- Users can view recipe list and details
- Users can edit and delete recipes

**Tasks:**

1. **Create Recipe API Routes**
   - [ ] `frontend/src/app/api/recipes/route.ts`
     - GET: Fetch all user recipes
     - POST: Create new recipe
   - [ ] `frontend/src/app/api/recipes/[id]/route.ts`
     - GET: Fetch single recipe
     - PUT: Update recipe
     - DELETE: Delete recipe

2. **Create Recipe Types**
   - [ ] `frontend/src/types/recipe.ts`
   - Define TypeScript interfaces for Recipe, Ingredient, Instruction

3. **Create Recipe Form Component**
   - [ ] `frontend/src/components/recipes/recipe-form.tsx`
   - Recipe name input
   - Description textarea
   - Prep/cook time inputs
   - Servings input
   - Dynamic ingredient list (add/remove)
   - Dynamic instruction list (add/remove/reorder)
   - Category selection (multi-select from categories table)
   - Form validation with Zod

4. **Create Recipe List Page**
   - [ ] `frontend/src/app/(dashboard)/recipes/page.tsx`
   - [ ] `frontend/src/components/recipes/recipe-list.tsx`
   - [ ] `frontend/src/components/recipes/recipe-card.tsx`
   - Grid view of recipe cards
   - Show recipe image, name, time, servings
   - "Add New Recipe" button
   - Basic search/filter (by name)

5. **Create New Recipe Page**
   - [ ] `frontend/src/app/(dashboard)/recipes/new/page.tsx`
   - Use RecipeForm component
   - Handle form submission
   - Redirect to recipe detail after creation

6. **Create Recipe Detail Page**
   - [ ] `frontend/src/app/(dashboard)/recipes/[id]/page.tsx`
   - Display recipe details
   - Show ingredients list
   - Show instructions
   - Edit and Delete buttons
   - Mark as favorite toggle

7. **Create Recipe Edit Flow**
   - [ ] Edit mode in recipe detail page
   - Pre-populate form with existing data
   - Update recipe on save

**Deliverables:**
- ✅ Users can create recipes manually
- ✅ Users can view all their recipes in a list
- ✅ Users can view recipe details
- ✅ Users can edit existing recipes
- ✅ Users can delete recipes

**Testing:**
- Create a recipe with ingredients and instructions
- View the recipe in list and detail views
- Edit the recipe
- Delete the recipe
- Verify RLS policies (users can't see other users' recipes)

---

#### **Week 3: Pantry Management (Cupboard & Always Have)**

**Goals:**
- Users can manage "What's in Cupboard" list
- Users can manage "Always Have" staples list

**Tasks:**

1. **Create Pantry API Routes**
   - [ ] `frontend/src/app/api/pantry/cupboard/route.ts`
     - GET: Fetch user's cupboard items
     - POST: Add item to cupboard
     - PUT: Update cupboard item
     - DELETE: Remove item from cupboard
   - [ ] `frontend/src/app/api/pantry/always-have/route.ts`
     - GET: Fetch user's always-have items
     - POST: Add always-have item
     - DELETE: Remove always-have item

2. **Create Cupboard Page**
   - [ ] `frontend/src/app/(dashboard)/pantry/cupboard/page.tsx`
   - [ ] `frontend/src/components/pantry/cupboard-list.tsx`
   - [ ] `frontend/src/components/pantry/cupboard-item-form.tsx`
   - Display list of items in cupboard
   - Add new item form (item name, quantity, unit)
   - Edit item inline
   - Delete item
   - "Generate Recipe from Cupboard" button

3. **Create Always Have Page**
   - [ ] `frontend/src/app/(dashboard)/pantry/always-have/page.tsx`
   - [ ] `frontend/src/components/pantry/always-have-list.tsx`
   - Display list of always-have items
   - Pre-populated checklist of common staples
   - Add custom items
   - Remove items
   - Category grouping (oils, spices, basics, etc.)

4. **Create Common Staples Seed Data**
   - [ ] Create optional migration or seed script
   - Common staples: salt, pepper, olive oil, butter, eggs, flour, sugar, garlic, onions, etc.
   - Users can select from this list on first use

**Deliverables:**
- ✅ Users can add/edit/delete cupboard items
- ✅ Users can manage always-have staples list
- ✅ Clean, usable UI for pantry management

**Testing:**
- Add items to cupboard
- Edit quantities
- Delete items
- Add items to always-have list
- Remove items from always-have list

---

#### **Week 4: AI Recipe Generation**

**Goals:**
- Users can generate recipes from ingredient lists
- AI integration working with Anthropic Claude
- Generated recipes can be saved

**Tasks:**

1. **Setup AI Integration**
   - [ ] `frontend/src/lib/ai/anthropic.ts`
   - Configure Vercel AI SDK with Anthropic provider
   - [ ] `frontend/src/lib/ai/prompts.ts`
   - Create recipe generation prompts

2. **Create AI Generation API Route**
   - [ ] `frontend/src/app/api/ai/generate/route.ts`
   - Accept ingredients list
   - Call AI with recipe generation prompt
   - Parse AI response into structured recipe format
   - Return recipe JSON

3. **Create AI Recipe Generator Page**
   - [ ] `frontend/src/app/(dashboard)/generate/page.tsx`
   - [ ] `frontend/src/components/generate/ingredient-input.tsx`
   - [ ] `frontend/src/components/generate/recipe-result.tsx`
   - Input: Textarea for ingredient list
   - "Generate from Cupboard" button (auto-fill from cupboard items)
   - "Generate Recipe" button
   - Loading state during AI generation
   - Display generated recipe
   - "Save Recipe" button

4. **Implement Recipe Generation Logic**
   - [ ] Create prompt template for recipe generation
   - Include user's dietary preferences from profile
   - Request structured JSON output from AI
   - Parse and validate AI response
   - Handle errors gracefully

5. **Integrate with Recipe Storage**
   - When user clicks "Save Recipe" after generation:
   - Call POST /api/recipes with generated recipe
   - Mark source as 'ai_generated'
   - Redirect to recipe detail page

**Deliverables:**
- ✅ Users can enter ingredients and generate recipe
- ✅ Users can generate recipe from cupboard items
- ✅ AI returns structured recipe data
- ✅ Generated recipes can be saved to collection

**Testing:**
- Generate recipe from custom ingredient list
- Generate recipe from cupboard items
- Verify AI returns valid recipe structure
- Save generated recipe
- Test error handling (AI timeout, invalid response)

---

#### **Week 5: Basic Meal Planner**

**Goals:**
- Users can view weekly meal planner
- Users can add recipes to meal slots
- Users can view and adjust meal plan

**Tasks:**

1. **Create Meal Plan API Routes**
   - [ ] `frontend/src/app/api/meal-plans/route.ts`
     - GET: Fetch user's meal plans (by date range)
     - POST: Create new meal plan
   - [ ] `frontend/src/app/api/meal-plans/[id]/items/route.ts`
     - GET: Fetch meal plan items
     - POST: Add recipe to meal plan
     - DELETE: Remove recipe from meal plan

2. **Create Meal Planner Page**
   - [ ] `frontend/src/app/(dashboard)/meal-planner/page.tsx`
   - [ ] `frontend/src/components/meal-planner/week-view.tsx`
   - [ ] `frontend/src/components/meal-planner/day-view.tsx`
   - [ ] `frontend/src/components/meal-planner/meal-slot.tsx`
   - Weekly calendar view (Monday-Sunday)
   - Each day has meal slots: Breakfast, Lunch, Dinner
   - Empty slots show "Add Recipe" button
   - Previous/Next week navigation

3. **Implement Add Recipe to Meal Plan**
   - [ ] `frontend/src/components/meal-planner/recipe-selector.tsx`
   - Click "Add Recipe" opens modal/dialog
   - Search/filter user's recipes
   - Select recipe and assign to meal slot
   - Optionally adjust servings

4. **Display Assigned Recipes in Calendar**
   - Show recipe name and image in meal slot
   - Click recipe to view details (new tab or modal)
   - Remove recipe from slot button

5. **Create Current Week Meal Plan on First Load**
   - Automatically create meal plan for current week if none exists
   - Fetch meal plan items for display

**Deliverables:**
- ✅ Weekly meal planner calendar view
- ✅ Users can add recipes to meal slots
- ✅ Users can remove recipes from slots
- ✅ Meal plan persists across sessions

**Testing:**
- Create meal plan for current week
- Add recipes to different meal slots
- Navigate to previous/next week
- Remove recipes from slots
- Verify meal plan data persists

---

#### **Week 6: Shopping List**

**Goals:**
- Users can generate shopping list from recipes
- Users can manually manage shopping list
- Users can check off items

**Tasks:**

1. **Create Shopping List API Routes**
   - [ ] `frontend/src/app/api/shopping-lists/route.ts`
     - GET: Fetch user's shopping lists
     - POST: Create new shopping list
   - [ ] `frontend/src/app/api/shopping-lists/[id]/route.ts`
     - GET: Fetch shopping list items
     - PUT: Update shopping list
     - DELETE: Delete shopping list
   - [ ] `frontend/src/app/api/shopping-lists/[id]/items/route.ts`
     - POST: Add item to list
     - PUT: Update item (check/uncheck, edit)
     - DELETE: Remove item

2. **Create Shopping List Page**
   - [ ] `frontend/src/app/(dashboard)/shopping-list/page.tsx`
   - [ ] `frontend/src/components/shopping-list/list-view.tsx`
   - [ ] `frontend/src/components/shopping-list/item-row.tsx`
   - Display active shopping list
   - List of items with checkboxes
   - Check/uncheck items
   - Manual add item form
   - Delete item button
   - Category labels (if set)

3. **Implement Generate from Recipe**
   - [ ] "Add to Shopping List" button on recipe detail page
   - Fetch recipe ingredients
   - Add ingredients to active shopping list
   - Exclude items in "Always Have" list
   - Show success message

4. **Implement Generate from Meal Plan**
   - [ ] "Generate Shopping List" button on meal planner page
   - Aggregate all ingredients from recipes in meal plan
   - Combine duplicate ingredients (e.g., 1 cup + 2 cups = 3 cups)
   - Exclude "Always Have" items
   - Create new shopping list
   - Navigate to shopping list page

5. **Basic Categorization**
   - Manual category dropdown per item (Produce, Meat, Dairy, Pantry, etc.)
   - Group items by category in display

6. **Mobile-Optimized View**
   - Large touch targets for checkboxes
   - Easy to use while shopping

**Deliverables:**
- ✅ Shopping list with check-off functionality
- ✅ Generate shopping list from single recipe
- ✅ Generate shopping list from meal plan
- ✅ Manual item management
- ✅ Basic categorization

**Testing:**
- Create shopping list manually
- Add items to list
- Check/uncheck items
- Delete items
- Generate shopping list from recipe
- Generate shopping list from meal plan
- Verify duplicate ingredients are combined
- Verify always-have items are excluded
- Test on mobile device

---

### 5.2 Phase 1 Success Criteria

At the end of Week 6, users should be able to:

1. ✅ Sign up and log in
2. ✅ Create recipes manually
3. ✅ View and organize recipes
4. ✅ Track ingredients in cupboard
5. ✅ Maintain always-have staples list
6. ✅ Generate recipes from ingredients using AI
7. ✅ Plan weekly meals
8. ✅ Generate shopping lists from recipes and meal plans
9. ✅ Check off shopping list items

**Core Loop Complete:** Add ingredients → Generate recipe → Save it → Plan meals → Get shopping list

---

## 6. Phase 2 & 3 Overview

### 6.1 Phase 2: Enhancements & AI Features (Weeks 7-11)

**High-Priority Additions:**

1. **Recipe Import Features** (Week 7-8)
   - Text paste with AI parsing
   - URL import (web scraping)
   - Image upload with OCR (basic)

2. **Dual AI Model Choice** (Week 9)
   - Add OpenAI provider
   - Model selection in settings
   - "Try with other AI" button
   - Side-by-side comparison mode

3. **Lifestyle Categories** (Week 9)
   - Add lifestyle_categories table
   - Pre-defined tags: "Lazy Sunday", "Weeknight Quick", "Dinner Party"
   - Filter recipes by lifestyle
   - AI generation with lifestyle context

4. **Enhanced Meal Planner** (Week 10)
   - "AI: Plan my week" feature
   - Copy previous week
   - Duplicate meals across days

5. **Calorie & Macro Display** (Week 11)
   - Add recipe_nutrition table
   - AI-powered nutritional estimation
   - Display with disclaimers
   - Aggregate nutrition in meal planner

6. **Shopping List Enhancements** (Week 11)
   - Organize by store section
   - Better quantity aggregation
   - Print-friendly view

**Phase 2 Success Criteria:**
- Users have multiple ways to add recipes (import, AI, manual)
- Dual AI models available
- Meal planning is more intelligent
- Nutrition information available

---

### 6.2 Phase 3: Polish & Social (Weeks 12-15)

**Nice-to-Have Features:**

1. **Social Sharing** (Week 12)
   - Generate recipe card images
   - Share to Facebook, Instagram, Pinterest, WhatsApp
   - Public recipe links

2. **PDF Export** (Week 12)
   - Export recipes as PDF (PDFShift API)
   - Export meal plans
   - Export shopping lists

3. **Advanced Search & Filtering** (Week 13)
   - Multi-tag filtering
   - Nutrition range filtering
   - Prep time filtering
   - Ingredient-based search

4. **Recipe Collections/Folders** (Week 14)
   - Custom collections
   - Organize beyond tags

5. **Recipe Variations** (Week 14)
   - AI-suggested variations ("Make it healthier", "Make it faster")
   - Substitute ingredients
   - Side-by-side comparison

6. **User Notes & Ratings** (Week 15)
   - Personal notes on recipes
   - Private ratings
   - "Last made" tracking

7. **Polish & Testing** (Week 15)
   - Bug fixes
   - Performance optimization
   - Accessibility improvements
   - Mobile responsiveness polish
   - User onboarding flow

**Phase 3 Success Criteria:**
- App feels polished and complete
- Users can share recipes easily
- Advanced organization features working
- Ready for public launch

---

## 7. Environment Variables

### 7.1 Local Development (.env.local)

**Create `frontend/.env.local`:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]

# AI API Keys
ANTHROPIC_API_KEY=[YOUR_ANTHROPIC_API_KEY]
OPENAI_API_KEY=[YOUR_OPENAI_API_KEY]

# Optional (Phase 3)
# PDFSHIFT_API_KEY=[YOUR_PDFSHIFT_API_KEY]
```

### 7.2 Vercel Production Environment

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
OPENAI_API_KEY
```

**Important:** Make sure to set these for both **Production** and **Preview** environments.

---

## 8. Deployment Checklist

### 8.1 Pre-Deployment

- [ ] All migrations pushed to Supabase (`supabase db push`)
- [ ] Environment variables set in Vercel
- [ ] Google OAuth configured in Supabase (production)
- [ ] Site URL updated in Supabase Auth settings
- [ ] Code pushed to GitHub main branch

### 8.2 Vercel Deployment

1. **In Vercel Dashboard:**
   - Import GitHub repository
   - Set root directory to `frontend/`
   - Add environment variables
   - Deploy

2. **After Deployment:**
   - [ ] Update Supabase Site URL to Vercel URL
   - [ ] Update Supabase redirect URLs:
     - `https://[your-app].vercel.app/auth/callback`
   - [ ] Update Google OAuth redirect URI (if using)
   - [ ] Test authentication flow in production
   - [ ] Test Google OAuth in production

### 8.3 Post-Deployment Testing

- [ ] Sign up with email works
- [ ] Log in with email works
- [ ] Google OAuth works (production)
- [ ] Create recipe works
- [ ] AI generation works
- [ ] Meal planner works
- [ ] Shopping list generation works
- [ ] All protected routes require authentication
- [ ] No errors in browser console
- [ ] No errors in Vercel logs

---

## 9. Key Implementation Notes

### 9.1 Authentication Strategy

- **Production**: Email + Google OAuth
- **Local Dev**: Email only (simpler setup)
- **Why?** Streamlines local development while maintaining full auth for production

### 9.2 Database Management

- **No local Supabase**: Use live project for both dev and production
- **Migrations**: Manual push with `supabase db push`
- **Why?** Simplifies setup, avoids local database sync issues

### 9.3 AI Model Strategy

- **Phase 1**: Anthropic Claude only (simpler)
- **Phase 2**: Add OpenAI for dual model choice
- **Cost Management**: Track usage per model, optimize prompts

### 9.4 Design Philosophy

- **Mobile-First**: Most cooking happens in the kitchen with phones
- **Kitchen Mode**: Large text, keep screen awake, minimal scrolling
- **Progressive Disclosure**: Don't overwhelm users with all features at once
- **Speed**: Quick actions prominently featured, minimize taps

### 9.5 Security

- **RLS Policies**: Enforce on all tables
- **Auth Middleware**: Protect all dashboard routes
- **Input Validation**: Zod schemas for all forms and API routes
- **API Rate Limiting**: Consider implementing in Phase 2

---

## 10. Success Metrics

### Phase 1 Success (Week 6)

- [ ] 5-10 beta testers using the app regularly
- [ ] Core loop functional (ingredients → recipe → meal plan → shopping list)
- [ ] No critical bugs
- [ ] Positive user feedback on core features

### Phase 2 Success (Week 11)

- [ ] 20+ active users
- [ ] Recipe import working with 80%+ accuracy
- [ ] Both AI models performing well
- [ ] Users creating meal plans regularly

### Phase 3 Success (Week 15)

- [ ] 50+ active users
- [ ] Recipes being shared on social media
- [ ] Positive reviews and testimonials
- [ ] Ready for public launch

---

## 11. Next Steps

### To Start Implementation:

1. **Review this plan** and confirm alignment
2. **Setup development environment** (Section 3)
3. **Push initial migrations** (Section 4)
4. **Begin Week 1 tasks** (Section 5.1)
5. **Create a TODO list** for Week 1 specific tasks
6. **Build incrementally**, testing as you go

### When Starting Each Week:

1. Review the weekly goals
2. Create a detailed TODO list for that week
3. Build features incrementally
4. Test thoroughly before moving to next feature
5. Demo progress at end of week

### Remember:

- **Focus on Phase 1 first** - get the core loop working
- **Test with real users early** - gather feedback
- **Don't over-engineer** - ship and iterate
- **Keep it simple** - add complexity only when needed

---

**Document Version:** 1.0
**Ready for Implementation:** ✅
**Focus:** Phase 1 (Weeks 1-6) - Core MVP Features

Good luck building your AI-powered recipe app! 🍳
