# SEO Optimization Plan for PlateWise
## Next.js 15 / Vercel Deployment - 2025 Best Practices

**Document Version:** 1.0
**Date:** October 17, 2025
**Application:** PlateWise - AI-Powered Recipe Manager
**Tech Stack:** Next.js 15.5.4, React 19, Vercel, Clerk Auth, Supabase

---

## Executive Summary

### Current State Assessment

PlateWise is a Next.js 15 application using the App Router with minimal SEO optimization currently implemented. The application has:

**Strengths:**
- Modern Next.js 15.5.4 with App Router (optimal for SEO)
- Basic metadata configuration in root layout
- Clean URL structure via file-based routing
- Server-side rendering enabled by default
- Fast performance potential (React 19, Vercel hosting)

**Critical Gaps:**
- ❌ No sitemap.xml implementation
- ❌ No robots.txt configuration
- ❌ Missing structured data (JSON-LD Schema.org markup)
- ❌ No Open Graph tags for social sharing
- ❌ Missing canonical URL configuration
- ❌ No search engine verification setup
- ❌ Limited per-page metadata customization
- ❌ No LLM optimization strategy

### Priority Recommendations

**Immediate (Week 1):**
1. Implement dynamic sitemap.xml generation
2. Create robots.txt configuration
3. Add comprehensive metadata to all public pages
4. Set up Open Graph and Twitter Card tags

**High Priority (Week 2):**
5. Implement Recipe Schema.org structured data (JSON-LD)
6. Set up Google Search Console and Bing Webmaster Tools
7. Add canonical URLs across all pages
8. Optimize content for LLM indexing

**Medium Priority (Week 3-4):**
9. Implement dynamic OG image generation
10. Add breadcrumb structured data
11. Optimize URL structure for public recipe sharing
12. Create comprehensive internal linking strategy

---

## 1. Current Codebase Analysis

### 1.1 File Structure

```
frontend/src/app/
├── layout.tsx                    # Root layout with basic metadata
├── page.tsx                      # Landing page
├── (dashboard)/                  # Private, authenticated routes
│   ├── layout.tsx
│   ├── recipes/
│   │   ├── page.tsx             # Recipe list
│   │   ├── [id]/page.tsx        # Recipe detail (dynamic)
│   │   ├── [id]/edit/page.tsx   # Edit recipe
│   │   └── new/page.tsx         # Create recipe
│   ├── generate/page.tsx        # AI generation
│   ├── meal-planner/page.tsx
│   ├── shopping-list/page.tsx
│   └── settings/
├── onboarding/
└── api/                          # API routes
```

### 1.2 Current Metadata Implementation

**Location:** `frontend/src/app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: "PlateWise",
  description: "Your personal recipe manager and meal planner",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}
```

**Issues:**
- Single static title (no title templates)
- Missing Open Graph tags
- Missing Twitter Card tags
- No canonical URLs
- No structured data
- Missing viewport and charset optimization

### 1.3 Public vs Private Content Analysis

**Public Content (Should be indexed):**
- Landing page (`/`)
- Potentially: Public recipe pages (future feature)
- Privacy Policy, Terms of Service (when created)

**Private Content (Should NOT be indexed):**
- All `/recipes/*` pages (user-authenticated)
- `/generate`, `/meal-planner`, `/shopping-list`
- `/settings/*` pages
- `/onboarding`
- All `/api/*` routes

**Current Protection:** Clerk authentication handles access control, but no explicit SEO directives prevent indexing attempts.

---

## 2. Sitemap.xml Implementation Strategy

### 2.1 Technical Approach

Next.js 15 provides built-in sitemap support via the `sitemap.ts` file convention. This approach generates sitemaps at build time or dynamically at runtime.

**Recommended Implementation:** Dynamic sitemap with force-dynamic export

### 2.2 Implementation Code

**File:** `frontend/src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next'

// Force dynamic generation to ensure sitemap stays current
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://platewise.app'

  // Static pages (public routes)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // Add other static public pages as they're created
    // {
    //   url: `${baseUrl}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
  ]

  // Future: Add dynamic public recipe pages when sharing feature is implemented
  // const recipes = await fetchPublicRecipes()
  // const recipeRoutes: MetadataRoute.Sitemap = recipes.map((recipe) => ({
  //   url: `${baseUrl}/recipes/${recipe.slug}`,
  //   lastModified: new Date(recipe.updated_at),
  //   changeFrequency: 'weekly',
  //   priority: 0.7,
  // }))

  return [...staticRoutes]
}
```

### 2.3 Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_SITE_URL=https://platewise.app
```

### 2.4 Sitemap Testing

After implementation:
1. Run dev server: `npm run dev`
2. Visit `http://localhost:3000/sitemap.xml`
3. Verify XML structure and URLs
4. Deploy to Vercel and verify at `https://platewise.app/sitemap.xml`

### 2.5 Future Enhancements

When public recipe sharing is implemented:

```typescript
// Fetch public recipes from Supabase
const { data: publicRecipes } = await supabase
  .from('recipes')
  .select('id, slug, updated_at')
  .eq('is_public', true)
  .order('updated_at', { ascending: false })

const recipeRoutes: MetadataRoute.Sitemap = publicRecipes.map((recipe) => ({
  url: `${baseUrl}/r/${recipe.slug}`,
  lastModified: new Date(recipe.updated_at),
  changeFrequency: 'weekly' as const,
  priority: 0.7,
}))
```

**Priority Scale:**
- 1.0: Homepage
- 0.8: Important static pages (About, Features, Pricing)
- 0.7: Public recipe pages
- 0.6: Blog posts, help articles
- 0.5: Lower priority static content

---

## 3. Robots.txt Configuration

### 3.1 Implementation Strategy

Next.js 15 supports robots.txt via the `robots.ts` file convention, allowing dynamic generation.

### 3.2 Implementation Code

**File:** `frontend/src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://platewise.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/recipes/',
          '/generate',
          '/meal-planner',
          '/shopping-list',
          '/settings/',
          '/onboarding',
          '/*.json$',
          '/*?*', // Disallow URLs with query parameters (except on public pages)
        ],
      },
      // Allow AI crawlers for LLM optimization
      {
        userAgent: [
          'GPTBot',              // OpenAI ChatGPT
          'ChatGPT-User',        // ChatGPT user agent
          'CCBot',               // Common Crawl (used by many AI models)
          'anthropic-ai',        // Claude AI
          'Claude-Web',          // Claude web crawler
          'Google-Extended',     // Google Bard/Gemini
          'PerplexityBot',       // Perplexity AI
        ],
        allow: '/',
        disallow: [
          '/api/',
          '/recipes/',
          '/generate',
          '/meal-planner',
          '/shopping-list',
          '/settings/',
          '/onboarding',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### 3.3 Robots.txt Best Practices 2025

**Key Considerations:**

1. **AI Crawler Management**: Explicitly allow AI crawlers (GPTBot, Claude-Web, Google-Extended) for LLM optimization while respecting the same privacy boundaries.

2. **Crawl Budget Optimization**: Disallow paths that waste crawler resources (API routes, authenticated pages, duplicate content).

3. **Sitemap Reference**: Always include sitemap URL for efficient discovery.

4. **Vercel Preview Deployments**: Vercel automatically adds `X-Robots-Tag: noindex` to preview deployments, preventing accidental indexing.

### 3.4 Testing

After deployment:
```bash
curl https://platewise.app/robots.txt
```

Expected output:
```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /recipes/
...
Sitemap: https://platewise.app/sitemap.xml
```

---

## 4. Metadata Optimization

### 4.1 Root Layout Metadata Enhancement

**File:** `frontend/src/app/layout.tsx`

**Replace existing metadata with:**

```typescript
import { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://platewise.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PlateWise - AI-Powered Recipe Manager & Meal Planner',
    template: '%s | PlateWise',
  },
  description: 'Your AI-powered recipe assistant. Generate personalized recipes, plan your meals, and create shopping lists — all in one place. Save time and eat better with PlateWise.',
  keywords: [
    'recipe manager',
    'meal planner',
    'AI recipes',
    'recipe generator',
    'shopping list',
    'meal prep',
    'cooking app',
    'recipe organizer',
    'AI cooking assistant',
  ],
  authors: [{ name: 'PlateWise' }],
  creator: 'PlateWise',
  publisher: 'PlateWise',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'PlateWise',
    title: 'PlateWise - AI-Powered Recipe Manager & Meal Planner',
    description: 'Your AI-powered recipe assistant. Generate personalized recipes, plan your meals, and create shopping lists — all in one place.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'PlateWise - AI Recipe Manager',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlateWise - AI-Powered Recipe Manager & Meal Planner',
    description: 'Your AI-powered recipe assistant. Generate personalized recipes, plan your meals, and create shopping lists.',
    images: [`${siteUrl}/og-image.png`],
    creator: '@platewise', // Add your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}
```

### 4.2 Per-Page Metadata

#### Landing Page

**File:** `frontend/src/app/page.tsx`

Add at the top of the file:

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PlateWise - AI Recipe Manager & Meal Planning Made Easy',
  description: 'Transform your cooking with PlateWise. Generate personalized AI recipes, plan weekly meals, manage your pantry, and create smart shopping lists. Start cooking smarter today.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PlateWise - AI Recipe Manager & Meal Planning Made Easy',
    description: 'Transform your cooking with PlateWise. Generate personalized AI recipes, plan weekly meals, manage your pantry, and create smart shopping lists.',
    url: '/',
    images: [
      {
        url: '/og-image-home.png',
        width: 1200,
        height: 630,
        alt: 'PlateWise Home',
      },
    ],
  },
}
```

#### Recipes List Page (Private)

**File:** `frontend/src/app/(dashboard)/recipes/page.tsx`

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Recipes',
  description: 'Manage your personal recipe collection',
  robots: {
    index: false,
    follow: false,
  },
}
```

#### Recipe Detail Page (Private, Dynamic)

**File:** `frontend/src/app/(dashboard)/recipes/[id]/page.tsx`

Add generateMetadata function:

```typescript
import { Metadata } from 'next'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) {
    return {
      title: 'Recipe Not Found',
      robots: { index: false, follow: false },
    }
  }

  const supabase = await createClient()
  const { data: recipe } = await supabase
    .from('recipes')
    .select('name, description')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!recipe) {
    return {
      title: 'Recipe Not Found',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: recipe.name,
    description: recipe.description || `View recipe for ${recipe.name}`,
    robots: {
      index: false, // Private recipe, don't index
      follow: false,
    },
  }
}
```

### 4.3 Title Tag Best Practices 2025

**Optimal Length:** 50-60 characters (displays fully on mobile and desktop)

**Structure:**
- Homepage: `[Brand] - [Primary Keyword] & [Secondary Keyword]`
- Content Pages: `[Page Title] | [Brand]`
- Dynamic Pages: `[Item Name] | [Category] | [Brand]`

**Examples:**
- Good: "Spaghetti Carbonara Recipe | PlateWise" (41 chars)
- Good: "PlateWise - AI Recipe Manager & Meal Planner" (48 chars)
- Too Long: "PlateWise - Your Personal AI-Powered Recipe Manager, Meal Planner, and Shopping List Generator" (94 chars - will be truncated)

### 4.4 Meta Description Best Practices

**Optimal Length:** 150-160 characters

**Guidelines:**
- Include primary keyword naturally
- Write compelling copy that encourages clicks
- Include a call-to-action when appropriate
- Be specific and accurate
- Each page should have a unique description

**Examples:**
```
Good: "Transform your cooking with PlateWise. Generate personalized AI recipes, plan weekly meals, and create smart shopping lists. Start free today." (152 chars)

Bad: "PlateWise is a recipe app." (27 chars - too short, not compelling)
```

---

## 5. Structured Data Implementation (JSON-LD)

### 5.1 Why Structured Data Matters

Structured data (Schema.org markup) helps:
- Search engines understand your content
- Enable rich snippets in search results
- Improve click-through rates (CTR) by 20-30%
- Optimize for LLM indexing (ChatGPT, Claude, Gemini)
- Appear in Google's recipe carousel

### 5.2 Organization Schema (Site-Wide)

**Implementation:** Add to `frontend/src/app/layout.tsx`

```typescript
// Add this component before the closing </body> tag
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'PlateWise',
      description: 'AI-powered recipe manager and meal planner',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://platewise.app',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'AI Recipe Generation',
        'Meal Planning',
        'Shopping List Management',
        'Pantry Tracking',
        'Dietary Restriction Support',
      ],
    }),
  }}
/>
```

### 5.3 Recipe Schema (Future Implementation)

When public recipe sharing is enabled, implement Recipe schema:

**File:** `frontend/src/app/r/[slug]/page.tsx` (future public recipe route)

```typescript
// Generate structured data for recipe
const recipeSchema = {
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: recipe.name,
  description: recipe.description,
  image: recipe.image_url ? [recipe.image_url] : undefined,
  author: {
    '@type': 'Person',
    name: recipe.author_name || 'PlateWise User',
  },
  datePublished: recipe.created_at,
  dateModified: recipe.updated_at,
  prepTime: recipe.prep_time ? `PT${recipe.prep_time}M` : undefined,
  cookTime: recipe.cook_time ? `PT${recipe.cook_time}M` : undefined,
  totalTime: recipe.prep_time && recipe.cook_time
    ? `PT${recipe.prep_time + recipe.cook_time}M`
    : undefined,
  recipeYield: `${recipe.servings} servings`,
  recipeCategory: recipe.tags?.[0] || 'Main Course',
  recipeCuisine: recipe.cuisine || undefined,
  keywords: recipe.tags?.join(', '),
  recipeIngredient: recipe.ingredients.map((ing: Ingredient) =>
    `${ing.quantity || ''} ${ing.unit || ''} ${ing.item}`.trim()
  ),
  recipeInstructions: recipe.instructions.map((inst: Instruction, index: number) => ({
    '@type': 'HowToStep',
    position: index + 1,
    text: inst.instruction,
  })),
  nutrition: recipe.nutrition ? {
    '@type': 'NutritionInformation',
    calories: recipe.nutrition.calories ? `${recipe.nutrition.calories} calories` : undefined,
    proteinContent: recipe.nutrition.protein ? `${recipe.nutrition.protein}g` : undefined,
    carbohydrateContent: recipe.nutrition.carbs ? `${recipe.nutrition.carbs}g` : undefined,
    fatContent: recipe.nutrition.fat ? `${recipe.nutrition.fat}g` : undefined,
  } : undefined,
  aggregateRating: recipe.rating_count > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: recipe.average_rating,
    ratingCount: recipe.rating_count,
  } : undefined,
}

// Add to page component
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(recipeSchema),
  }}
/>
```

### 5.4 Breadcrumb Schema

For nested pages, implement breadcrumb schema:

```typescript
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://platewise.app',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Recipes',
      item: 'https://platewise.app/recipes',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: recipe.name,
      item: `https://platewise.app/recipes/${recipe.slug}`,
    },
  ],
}
```

### 5.5 Validation

After implementation, validate structured data:

**Tools:**
1. [Google Rich Results Test](https://search.google.com/test/rich-results)
2. [Schema.org Validator](https://validator.schema.org/)
3. [JSON-LD Playground](https://json-ld.org/playground/)

**Process:**
1. Deploy changes
2. Test each URL with public structured data
3. Fix any validation errors
4. Monitor Google Search Console for rich result eligibility

---

## 6. Open Graph & Social Media Optimization

### 6.1 Open Graph Image Creation

**Required Asset:** `/public/og-image.png`

**Specifications:**
- Dimensions: 1200 x 630 pixels
- Format: PNG or JPEG
- Max file size: 8MB (recommend <300KB)
- Aspect ratio: 1.91:1

**Design Guidelines:**
- Include logo prominently
- Add tagline: "AI-Powered Recipe Manager"
- Use brand colors (orange accent: #f97316)
- Keep text minimal and large (readable at small sizes)
- Test on both light and dark backgrounds

### 6.2 Dynamic OG Image Generation (Advanced)

For dynamic recipe pages, implement on-demand OG image generation:

**File:** `frontend/src/app/api/og/route.tsx`

```typescript
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') || 'PlateWise'
  const description = searchParams.get('description') || 'AI-Powered Recipe Manager'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          padding: '40px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#f97316',
              marginRight: '20px',
            }}
          />
          <div style={{ fontSize: 48, fontWeight: 'bold' }}>
            <span style={{ color: '#f97316' }}>P</span>late
            <span style={{ color: '#f97316' }}>W</span>ise
          </div>
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            textAlign: 'center',
            maxWidth: '900px',
            marginBottom: '20px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 30,
            textAlign: 'center',
            color: '#666',
            maxWidth: '800px',
          }}
        >
          {description}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

**Usage in metadata:**
```typescript
openGraph: {
  images: [
    {
      url: `/api/og?title=${encodeURIComponent(recipe.name)}&description=${encodeURIComponent(recipe.description)}`,
      width: 1200,
      height: 630,
    },
  ],
}
```

### 6.3 Twitter Card Optimization

**Card Types:**
- `summary`: Small square image (120x120)
- `summary_large_image`: Large rectangular image (1200x630) - **Recommended**
- `player`: For video/audio content
- `app`: For mobile app promotion

**Implementation:**
```typescript
twitter: {
  card: 'summary_large_image',
  site: '@platewise',
  creator: '@platewise',
  title: 'Page-specific title',
  description: 'Page-specific description',
  images: ['https://platewise.app/og-image.png'],
}
```

### 6.4 Testing Social Sharing

**Testing Tools:**
1. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. [Twitter Card Validator](https://cards-dev.twitter.com/validator)
3. [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

**Process:**
1. Deploy changes
2. Test URLs in each validator
3. Clear cache if needed (use "Fetch new information")
4. Share test post to verify appearance

---

## 7. LLM Optimization Strategy

### 7.1 Understanding LLM Indexing

**Key Differences from Traditional SEO:**

| Traditional SEO | LLM Optimization |
|----------------|-----------------|
| Keyword-focused | Context & clarity-focused |
| Backlinks important | Content quality paramount |
| Title/meta tags critical | Semantic structure critical |
| PageRank algorithm | Embedding similarity |
| 10 blue links | Single synthesized answer |

**LLM Crawlers to Support:**
- GPTBot (OpenAI ChatGPT)
- Claude-Web (Anthropic Claude)
- Google-Extended (Google Gemini/Bard)
- CCBot (Common Crawl - used by many AI models)
- PerplexityBot (Perplexity AI)

### 7.2 Content Structure for LLMs

**Best Practices:**

1. **Use Semantic HTML**
```tsx
// Good: Clear hierarchy
<article>
  <h1>Main Recipe Title</h1>
  <section>
    <h2>Ingredients</h2>
    <ul>
      <li>Ingredient 1</li>
    </ul>
  </section>
  <section>
    <h2>Instructions</h2>
    <ol>
      <li>Step 1</li>
    </ol>
  </section>
</article>

// Bad: Generic divs
<div>
  <div className="title">Recipe</div>
  <div className="content">...</div>
</div>
```

2. **Clear Content Hierarchy**
- One H1 per page (primary topic)
- H2 for major sections
- H3 for subsections
- Avoid skipping heading levels

3. **FAQ-Style Content Blocks**

For landing page and marketing content, structure answers to common questions:

```tsx
<section>
  <h2>Frequently Asked Questions</h2>

  <div>
    <h3>What is PlateWise?</h3>
    <p>PlateWise is an AI-powered recipe manager that helps you generate personalized recipes, plan meals, and create shopping lists automatically.</p>
  </div>

  <div>
    <h3>How does AI recipe generation work?</h3>
    <p>Our AI analyzes your preferences, dietary restrictions, and available ingredients to create custom recipes tailored to your needs.</p>
  </div>
</section>
```

4. **Definition-First Writing**

Start paragraphs and sections with clear definitions:

```markdown
Bad: "We use advanced technology to help users with their cooking needs."

Good: "PlateWise is an AI recipe manager. It generates custom recipes based on your dietary preferences, creates weekly meal plans, and automatically builds shopping lists from your planned meals."
```

### 7.3 Structured Data for LLM Context

**JSON-LD provides crucial context to LLMs:**

```typescript
// This helps LLMs understand relationships and categories
{
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  'recipeCategory': 'Main Course',
  'recipeCuisine': 'Italian',
  'keywords': 'pasta, quick dinner, weeknight meal',
  'suitableForDiet': [
    'https://schema.org/VegetarianDiet',
    'https://schema.org/LowFatDiet'
  ]
}
```

### 7.4 Landing Page Optimization for LLMs

**File:** `frontend/src/app/page.tsx`

**Recommendations:**

1. **Add FAQ Section**

```tsx
<section className="py-16 border-t">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12">
      Frequently Asked Questions
    </h2>

    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          What makes PlateWise different from other recipe apps?
        </h3>
        <p className="text-muted-foreground">
          PlateWise uses advanced AI to generate personalized recipes based on your specific dietary needs, preferences, and available ingredients. Unlike traditional recipe apps that only store recipes, PlateWise creates new ones tailored to you.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Can PlateWise accommodate dietary restrictions?
        </h3>
        <p className="text-muted-foreground">
          Yes. PlateWise supports all major dietary restrictions including vegetarian, vegan, gluten-free, dairy-free, keto, and more. You can also specify specific allergens to avoid.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          How does the AI recipe generation work?
        </h3>
        <p className="text-muted-foreground">
          Our AI analyzes your preferences, dietary restrictions, cooking skill level, and available ingredients. It then generates complete recipes with ingredients lists, step-by-step instructions, and nutritional information.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Does PlateWise help with meal planning?
        </h3>
        <p className="text-muted-foreground">
          Yes. PlateWise includes a weekly meal planner where you can schedule recipes, and it automatically generates shopping lists based on your planned meals and current pantry inventory.
        </p>
      </div>
    </div>
  </div>
</section>
```

2. **Add How It Works Section**

```tsx
<section className="py-16 bg-muted/40">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12">
      How PlateWise Works
    </h2>

    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      <div className="text-center">
        <div className="text-4xl mb-4">1️⃣</div>
        <h3 className="text-xl font-semibold mb-2">Set Your Preferences</h3>
        <p className="text-muted-foreground">
          Tell us about your dietary restrictions, allergies, and food preferences. PlateWise remembers your settings.
        </p>
      </div>

      <div className="text-center">
        <div className="text-4xl mb-4">2️⃣</div>
        <h3 className="text-xl font-semibold mb-2">Generate or Save Recipes</h3>
        <p className="text-muted-foreground">
          Use AI to generate custom recipes or save your favorites. All recipes are stored in your personal collection.
        </p>
      </div>

      <div className="text-center">
        <div className="text-4xl mb-4">3️⃣</div>
        <h3 className="text-xl font-semibold mb-2">Plan & Shop</h3>
        <p className="text-muted-foreground">
          Schedule meals for the week and let PlateWise generate your shopping list automatically.
        </p>
      </div>
    </div>
  </div>
</section>
```

### 7.5 Meta Tags for LLM Context

Add these to help LLMs understand your content:

```typescript
export const metadata: Metadata = {
  // ... other metadata
  other: {
    'article:tag': 'recipe management, meal planning, AI cooking',
    'article:section': 'Food & Cooking',
  },
}
```

### 7.6 Monitoring LLM Citations

**Track mentions in AI responses:**

1. **Manual Testing**
   - Regularly query ChatGPT, Claude, Gemini with: "What are the best AI recipe apps?"
   - Search for: "PlateWise recipe manager"
   - Ask specific questions your site answers

2. **Tools (Emerging)**
   - Semrush AI Tracking
   - Ahrefs Brand Radar
   - Ubersuggest LLM Beta
   - Manual Google Alerts for brand mentions

3. **Metrics to Track**
   - Brand mentions in AI responses
   - Citation frequency
   - Position in AI-generated lists
   - Accuracy of information cited

### 7.7 Content Freshness

LLMs favor recent, updated content:

```typescript
// Add to page metadata
export const metadata: Metadata = {
  // ... other fields
  other: {
    'article:published_time': '2025-10-17T00:00:00Z',
    'article:modified_time': new Date().toISOString(),
  },
}
```

---

## 8. Search Console Setup

### 8.1 Google Search Console

**Step-by-Step Setup:**

1. **Create Account**
   - Visit [Google Search Console](https://search.google.com/search-console)
   - Sign in with Google account
   - Click "Add Property"

2. **Choose Property Type**
   - **Domain Property** (Recommended): Verifies all subdomains and protocols
     - Enter: `platewise.app`
     - Requires DNS TXT record
   - **URL Prefix**: Verifies specific URL
     - Enter: `https://platewise.app`
     - Multiple verification methods available

3. **Verification Methods**

   **Method 1: DNS Verification (Recommended for Domain Property)**
   ```
   1. Google provides a TXT record (e.g., google-site-verification=abc123...)
   2. Log into your DNS provider (Vercel DNS, Cloudflare, etc.)
   3. Add TXT record to root domain
   4. Wait for DNS propagation (can take up to 24 hours)
   5. Click "Verify" in Google Search Console
   ```

   **Method 2: HTML File Upload**
   ```typescript
   // Download verification file from Google (e.g., google1234567890abcdef.html)
   // Place in: frontend/public/google1234567890abcdef.html
   // File contains: google-site-verification: google1234567890abcdef.html
   // Accessible at: https://platewise.app/google1234567890abcdef.html
   ```

   **Method 3: Meta Tag (Easiest for Next.js)**
   ```typescript
   // Add to frontend/src/app/layout.tsx metadata
   export const metadata: Metadata = {
     // ... other metadata
     verification: {
       google: 'your-verification-code-here', // Google provides this
     },
   }
   ```

   **Method 4: Google Analytics**
   - If you already have GA4 installed with admin access
   - Automatic verification

4. **Submit Sitemap**
   ```
   1. In Google Search Console, go to "Sitemaps" (left sidebar)
   2. Enter sitemap URL: https://platewise.app/sitemap.xml
   3. Click "Submit"
   4. Monitor status (may take days to weeks for initial crawl)
   ```

5. **Initial Configuration**
   - Set preferred domain (www vs non-www)
   - Configure target country (United States)
   - Set up email notifications for critical issues

### 8.2 Bing Webmaster Tools

**Easy Setup via Google Search Console Import:**

1. **Sign Up**
   - Visit [Bing Webmaster Tools](https://www.bing.com/webmasters)
   - Sign in with Microsoft, Google, or Facebook account

2. **Import from Google Search Console (Recommended)**
   ```
   1. Click "Import from Google Search Console"
   2. Authorize Bing to access your GSC data
   3. Select sites to import (can import up to 100 at once)
   4. Bing automatically verifies ownership
   5. Sitemaps are also imported automatically
   ```

3. **Manual Verification (Alternative)**

   **Method 1: Meta Tag**
   ```typescript
   // Add to frontend/src/app/layout.tsx metadata
   export const metadata: Metadata = {
     // ... other metadata
     verification: {
       google: 'google-code',
       bing: 'bing-code-here', // Bing provides this
     },
   }
   ```

   **Method 2: XML File**
   ```
   1. Download BingSiteAuth.xml from Bing
   2. Place in frontend/public/BingSiteAuth.xml
   3. Verify at https://platewise.app/BingSiteAuth.xml
   ```

4. **Submit Sitemap (if not auto-imported)**
   ```
   1. Go to Sitemaps section
   2. Enter: https://platewise.app/sitemap.xml
   3. Click Submit
   ```

5. **Enable IndexNow (Bing Feature)**
   ```
   Bing supports IndexNow protocol for instant indexing.
   When you update content, notify Bing immediately.

   API endpoint: https://www.bing.com/indexnow
   ```

### 8.3 Post-Verification Checklist

**Immediate Actions:**

- [ ] Verify sitemap is successfully submitted and processing
- [ ] Check "Coverage" report for indexing issues
- [ ] Review "Mobile Usability" report
- [ ] Check "Core Web Vitals" report
- [ ] Set up email alerts for critical errors
- [ ] Add team members if needed

**Weekly Monitoring:**

- [ ] Check indexing status
- [ ] Review search performance metrics
- [ ] Monitor for manual actions or security issues
- [ ] Check for crawl errors

**Monthly Reviews:**

- [ ] Analyze search queries driving traffic
- [ ] Review click-through rates (CTR)
- [ ] Identify pages with low impressions but high ranking
- [ ] Check for duplicate content issues

### 8.4 Vercel-Specific Considerations

**Environment Variables:**

Verification codes should be stored in Vercel environment variables:

```bash
# Vercel Dashboard > Project > Settings > Environment Variables
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123...
NEXT_PUBLIC_BING_SITE_VERIFICATION=def456...
```

**Usage in code:**
```typescript
export const metadata: Metadata = {
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
  },
}
```

**Preview Deployments:**

Vercel preview deployments (e.g., `platewise-git-feature-branch.vercel.app`) automatically include `X-Robots-Tag: noindex` header, preventing accidental indexing of development versions.

---

## 9. Canonical URLs

### 9.1 Why Canonical URLs Matter

**Purpose:**
- Prevent duplicate content issues
- Consolidate link equity to preferred URL
- Handle query parameters and URL variations
- Essential for public recipe pages with multiple access paths

### 9.2 Implementation

**Root Layout:**
```typescript
// frontend/src/app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://platewise.app'),
  // metadataBase is used to resolve relative URLs in canonical tags
}
```

**Per-Page Implementation:**

```typescript
// Landing Page
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

// Dynamic Page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  return {
    alternates: {
      canonical: `/recipes/${slug}`,
    },
  }
}
```

### 9.3 Common Scenarios

**Scenario 1: Recipe Accessed via Meal Planner**
```
URL with params: /recipes/123?from=meal-planner&servings=4
Canonical: /recipes/123
```

**Scenario 2: Public Recipe with User Reference**
```
URL: /recipes/abc123?ref=user
Canonical: /recipes/abc123
```

**Scenario 3: Homepage with UTM Parameters**
```
URL: /?utm_source=facebook&utm_campaign=launch
Canonical: /
```

### 9.4 Self-Referencing Canonicals

**Best Practice:** Even if a page has no duplicates, include self-referencing canonical.

```typescript
// Every page should have a canonical, even if it points to itself
alternates: {
  canonical: '/about',
}
```

---

## 10. URL Structure Optimization

### 10.1 Current URL Structure Analysis

**Current Structure:**
```
/ (landing page)
/recipes (private, authenticated)
/recipes/[id] (private, dynamic by UUID)
/recipes/[id]/edit
/recipes/new
/generate
/meal-planner
/shopping-list
/settings/*
/onboarding
```

**Assessment:** Current structure is good for a private application. All routes are logical and RESTful.

### 10.2 Recommended Changes for Public Recipe Sharing

**When implementing public recipe sharing feature:**

**Current (Private):**
```
/recipes/123e4567-e89b-4558-b3d-426614174000
```

**Recommended (Public SEO-Friendly):**
```
/r/spaghetti-carbonara-123
/recipes/spaghetti-carbonara-123
```

**Benefits:**
- Descriptive slugs improve CTR
- Keywords in URL boost SEO
- More shareable and memorable
- Better for social media

### 10.3 Slug Generation Best Practices

**Implementation Example:**

```typescript
// Utility function: lib/utils/slugify.ts
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '')   // Remove leading/trailing hyphens
}

// Usage when creating recipe
const slug = `${slugify(recipeName)}-${shortId}` // "spaghetti-carbonara-abc123"

// Store slug in database
await supabase
  .from('recipes')
  .insert({
    slug,
    name: recipeName,
    // ... other fields
  })
```

**URL Guidelines:**
- Use hyphens (-) not underscores (_)
- Keep slugs concise (3-5 words max)
- Include primary keyword
- Use lowercase only
- Avoid stop words (a, an, the, of) when possible
- Include unique identifier to prevent collisions

### 10.4 URL Structure Best Practices 2025

**Hierarchy Rules:**
```
Good: /recipes/dinner/chicken-parmesan
Bad:  /recipes/dinner/main-course/italian/chicken-parmesan (too deep)

Good: /blog/seo-guide
Bad:  /blog/2025/10/17/seo-guide (unnecessary date structure)

Good: /recipes/vegan-tacos
Bad:  /recipes/recipe-123456 (not descriptive)
```

**Maximum Depth:** 3-4 levels deep
```
✓ /category/subcategory/item
✗ /category/subcategory/sub-subcategory/sub-sub-subcategory/item
```

### 10.5 Implementing SEO-Friendly URLs

**Migration Strategy (when ready for public sharing):**

1. **Add slug column to recipes table**
   ```sql
   ALTER TABLE recipes ADD COLUMN slug TEXT UNIQUE;
   CREATE INDEX idx_recipes_slug ON recipes(slug);
   ```

2. **Generate slugs for existing recipes**
   ```typescript
   // Migration script
   const { data: recipes } = await supabase
     .from('recipes')
     .select('id, name')
     .is('slug', null)

   for (const recipe of recipes) {
     const slug = `${slugify(recipe.name)}-${recipe.id.slice(0, 8)}`
     await supabase
       .from('recipes')
       .update({ slug })
       .eq('id', recipe.id)
   }
   ```

3. **Create new public route**
   ```
   frontend/src/app/r/[slug]/page.tsx (public recipe page)
   ```

4. **Keep private routes unchanged**
   ```
   frontend/src/app/(dashboard)/recipes/[id]/page.tsx (private view)
   ```

5. **Add sharing functionality**
   ```typescript
   // Share button component
   const publicUrl = `${siteUrl}/r/${recipe.slug}`
   ```

---

## 11. Performance Optimization (SEO Impact)

### 11.1 Core Web Vitals

**Why It Matters:** Google uses Core Web Vitals as ranking factors.

**Three Key Metrics:**

1. **Largest Contentful Paint (LCP)** - Loading Performance
   - Target: < 2.5 seconds
   - Measures: Time until largest content element loads

2. **First Input Delay (FID)** / **Interaction to Next Paint (INP)** - Interactivity
   - Target: < 100ms (FID) / < 200ms (INP)
   - Measures: Responsiveness to user interactions

3. **Cumulative Layout Shift (CLS)** - Visual Stability
   - Target: < 0.1
   - Measures: Unexpected layout shifts

### 11.2 Next.js Performance Best Practices

**Current Implementation - Good:**
- ✓ Next.js 15 with App Router (optimized by default)
- ✓ React 19 (improved performance)
- ✓ Server Components (reduced JavaScript)
- ✓ Vercel hosting (global edge network)

**Optimization Opportunities:**

1. **Image Optimization**
   ```typescript
   // Already using Next.js Image component (Good!)
   import Image from 'next/image'

   // Ensure all images specify width/height to prevent CLS
   <Image
     src="/logo.png"
     alt="PlateWise Logo"
     width={40}
     height={40}
     priority // Add priority for above-fold images
   />
   ```

2. **Font Optimization**
   ```typescript
   // Already optimized (using next/font/google)
   import { Geist, Lora, Poppins } from "next/font/google"

   const geistSans = Geist({
     subsets: ["latin"],
     display: 'swap', // Add this for better font loading
     variable: "--font-geist-sans",
   })
   ```

3. **Script Loading**
   ```typescript
   // Use next/script for third-party scripts
   import Script from 'next/script'

   <Script
     src="https://analytics.example.com/script.js"
     strategy="lazyOnload" // Defer non-critical scripts
   />
   ```

### 11.3 Vercel-Specific Optimizations

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

```typescript
// frontend/src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Vercel Speed Insights:**
```bash
npm install @vercel/speed-insights
```

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 11.4 Monitoring Performance

**Tools:**
1. [Google PageSpeed Insights](https://pagespeed.web.dev/)
2. [GTmetrix](https://gtmetrix.com/)
3. [WebPageTest](https://www.webpagetest.org/)
4. Vercel Analytics (built-in)
5. Google Search Console (Core Web Vitals report)

**Monthly Performance Audit:**
- Check Core Web Vitals in GSC
- Run PageSpeed Insights on key pages
- Monitor Vercel Analytics for Real User Metrics (RUM)
- Identify and optimize slow pages

---

## 12. Implementation Timeline & Priorities

### 12.1 Phase 1: Foundation (Week 1) - CRITICAL

**Estimated Time:** 6-8 hours

| Task | Priority | Time | Status |
|------|----------|------|--------|
| Create `sitemap.ts` | Critical | 1h | ⬜ Not Started |
| Create `robots.ts` | Critical | 1h | ⬜ Not Started |
| Update root layout metadata | Critical | 2h | ⬜ Not Started |
| Add landing page metadata | Critical | 1h | ⬜ Not Started |
| Add NEXT_PUBLIC_SITE_URL env var | Critical | 0.5h | ⬜ Not Started |
| Create `/public/og-image.png` | High | 1-2h | ⬜ Not Started |
| Test sitemap & robots locally | Critical | 0.5h | ⬜ Not Started |
| Deploy to Vercel | Critical | 0.5h | ⬜ Not Started |
| Verify sitemap.xml accessibility | Critical | 0.5h | ⬜ Not Started |

**Deliverables:**
- Working sitemap at `/sitemap.xml`
- Working robots.txt at `/robots.txt`
- Enhanced metadata on homepage
- OG image for social sharing

**Testing Checklist:**
- [ ] Visit `https://platewise.app/sitemap.xml` - returns valid XML
- [ ] Visit `https://platewise.app/robots.txt` - returns correct directives
- [ ] Share homepage on Facebook - correct OG image appears
- [ ] Share homepage on Twitter - correct card appears
- [ ] View source of homepage - meta tags present

### 12.2 Phase 2: Search Console Setup (Week 2) - HIGH

**Estimated Time:** 3-4 hours

| Task | Priority | Time | Status |
|------|----------|------|--------|
| Set up Google Search Console | High | 1h | ⬜ Not Started |
| Verify domain ownership (DNS/Meta tag) | High | 1h | ⬜ Not Started |
| Submit sitemap to GSC | High | 0.5h | ⬜ Not Started |
| Set up Bing Webmaster Tools | High | 0.5h | ⬜ Not Started |
| Import from GSC to Bing | High | 0.5h | ⬜ Not Started |
| Configure email alerts | Medium | 0.5h | ⬜ Not Started |

**Deliverables:**
- Verified property in Google Search Console
- Verified property in Bing Webmaster Tools
- Sitemaps submitted to both platforms
- Email alerts configured

**Success Metrics:**
- [ ] GSC shows "Verified" status
- [ ] Bing shows "Verified" status
- [ ] Sitemaps show "Success" or "Pending" status
- [ ] Receive test email alert

### 12.3 Phase 3: Structured Data (Week 2) - HIGH

**Estimated Time:** 4-6 hours

| Task | Priority | Time | Status |
|------|----------|------|--------|
| Add WebApplication JSON-LD to root layout | High | 1h | ⬜ Not Started |
| Add per-page metadata to all dashboard pages | Medium | 2h | ⬜ Not Started |
| Update recipe detail page with generateMetadata | High | 1h | ⬜ Not Started |
| Test structured data with Google Rich Results | High | 1h | ⬜ Not Started |
| Validate JSON-LD syntax | High | 0.5h | ⬜ Not Started |
| Document for future Recipe schema implementation | Low | 0.5h | ⬜ Not Started |

**Deliverables:**
- WebApplication structured data on all pages
- Dynamic metadata for recipe pages
- Validation reports from testing tools

**Testing Checklist:**
- [ ] Rich Results Test shows no errors
- [ ] Schema.org Validator passes
- [ ] JSON-LD Playground parses correctly

### 12.4 Phase 4: LLM Optimization (Week 3) - MEDIUM

**Estimated Time:** 6-8 hours

| Task | Priority | Time | Status |
|------|----------|------|--------|
| Add FAQ section to landing page | Medium | 2h | ⬜ Not Started |
| Add "How It Works" section | Medium | 2h | ⬜ Not Started |
| Enhance semantic HTML structure | Medium | 2h | ⬜ Not Started |
| Add article meta tags | Low | 0.5h | ⬜ Not Started |
| Test content with AI tools | Medium | 1h | ⬜ Not Started |
| Document LLM monitoring process | Low | 0.5h | ⬜ Not Started |

**Deliverables:**
- FAQ section with 5-7 questions
- "How It Works" section with 3 steps
- Improved content structure
- LLM testing baseline

**Success Metrics:**
- [ ] ChatGPT can accurately describe PlateWise
- [ ] Claude provides correct information when asked
- [ ] Content is cited in AI responses (long-term goal)

### 12.5 Phase 5: Advanced Features (Week 4) - MEDIUM

**Estimated Time:** 6-10 hours

| Task | Priority | Time | Status |
|------|----------|------|--------|
| Implement dynamic OG image generation API | Medium | 3h | ⬜ Not Started |
| Add canonical URLs to all pages | Medium | 2h | ⬜ Not Started |
| Install Vercel Analytics | Low | 0.5h | ⬜ Not Started |
| Install Vercel Speed Insights | Low | 0.5h | ⬜ Not Started |
| Create OG images for key pages | Low | 2h | ⬜ Not Started |
| Performance audit with PageSpeed | Medium | 1h | ⬜ Not Started |
| Optimize identified performance issues | Medium | Variable | ⬜ Not Started |

**Deliverables:**
- Dynamic OG images for recipe pages
- Canonical URLs on all pages
- Analytics and performance monitoring
- Performance baseline established

### 12.6 Phase 6: Future Enhancements (Backlog)

**For Public Recipe Sharing Feature:**

| Task | Priority | Time | Status |
|------|----------|------|--------|
| Design slug generation system | Medium | 2h | ⬜ Not Scheduled |
| Add slug column to recipes table | Medium | 1h | ⬜ Not Scheduled |
| Generate slugs for existing recipes | Medium | 2h | ⬜ Not Scheduled |
| Create `/r/[slug]` public route | High | 4h | ⬜ Not Scheduled |
| Implement Recipe JSON-LD schema | High | 3h | ⬜ Not Scheduled |
| Add breadcrumb structured data | Medium | 2h | ⬜ Not Scheduled |
| Implement social sharing buttons | Medium | 2h | ⬜ Not Scheduled |
| Update sitemap to include public recipes | High | 2h | ⬜ Not Scheduled |
| Update robots.txt for public routes | High | 1h | ⬜ Not Scheduled |
| Create public recipe browse page | Medium | 6h | ⬜ Not Scheduled |

---

## 13. Verification & Testing Checklist

### 13.1 Pre-Deployment Checklist

**Local Testing:**
- [ ] `npm run dev` starts without errors
- [ ] Visit `http://localhost:3000/sitemap.xml` - returns valid XML
- [ ] Visit `http://localhost:3000/robots.txt` - returns correct text
- [ ] View page source - meta tags present in `<head>`
- [ ] JSON-LD script tags render correctly
- [ ] No console errors on any page

**Code Review:**
- [ ] All metadata follows TypeScript types
- [ ] Environment variables properly set
- [ ] No hardcoded URLs (use env vars)
- [ ] All pages have unique titles
- [ ] All pages have unique descriptions

### 13.2 Post-Deployment Verification

**Immediate (Within 1 hour):**
- [ ] Production sitemap accessible: `https://platewise.app/sitemap.xml`
- [ ] Production robots.txt accessible: `https://platewise.app/robots.txt`
- [ ] Meta tags render correctly in production (view source)
- [ ] OG images load correctly
- [ ] No 404 errors for meta assets

**Day 1:**
- [ ] Test social sharing on Facebook
- [ ] Test social sharing on Twitter/X
- [ ] Test social sharing on LinkedIn
- [ ] Validate structured data with Rich Results Test
- [ ] Check Google Search Console for coverage

**Week 1:**
- [ ] Verify sitemap in GSC shows "Success"
- [ ] Check for crawl errors in GSC
- [ ] Verify mobile usability in GSC
- [ ] Check Core Web Vitals report
- [ ] Monitor for manual actions

**Week 2-4:**
- [ ] Check indexing progress in GSC
- [ ] Review search performance data (if any)
- [ ] Verify Bing indexing status
- [ ] Test manual queries in search engines
- [ ] Monitor for rich result eligibility

### 13.3 Testing Tools & Resources

**SEO Testing:**
1. [Google Rich Results Test](https://search.google.com/test/rich-results)
2. [Schema Markup Validator](https://validator.schema.org/)
3. [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
4. [PageSpeed Insights](https://pagespeed.web.dev/)

**Social Media Testing:**
5. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
6. [Twitter Card Validator](https://cards-dev.twitter.com/validator)
7. [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

**Technical Testing:**
8. [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/)
9. [Security Headers](https://securityheaders.com/)
10. [HTTP/2 Test](https://tools.keycdn.com/http2-test)

**Performance Testing:**
11. [WebPageTest](https://www.webpagetest.org/)
12. [GTmetrix](https://gtmetrix.com/)
13. [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### 13.4 Monitoring Schedule

**Daily (First Week):**
- Check Google Search Console for critical errors
- Monitor server logs for unusual crawler activity

**Weekly:**
- Review GSC coverage report
- Check for new crawl errors
- Monitor Core Web Vitals
- Review search performance (once data available)

**Monthly:**
- Comprehensive SEO audit
- Performance testing across all pages
- Competitor analysis
- Content gap analysis
- Backlink profile review

---

## 14. Long-Term SEO Strategy

### 14.1 Content Strategy

**Blog Content (Future Consideration):**

Create `/blog` section with SEO-optimized content:
- "10 Quick Weeknight Dinner Ideas"
- "How to Meal Prep for Beginners"
- "Understanding Dietary Restrictions"
- "AI vs Traditional Recipe Discovery"

**Benefits:**
- Target informational keywords
- Build topical authority
- Attract backlinks
- Increase organic traffic

### 14.2 Link Building Strategy

**Internal Linking:**
- Link from homepage to key features
- Link from recipes to meal planner
- Create hub pages for recipe categories
- Breadcrumb navigation for hierarchy

**External Link Building:**
- Product Hunt launch
- Submit to recipe app directories
- Guest posts on food/tech blogs
- Partnerships with food bloggers
- Press releases for major features

### 14.3 Local SEO (If Applicable)

If PlateWise expands to local services:
- Create Google Business Profile
- Implement LocalBusiness schema
- Target local keywords
- Gather customer reviews

### 14.4 International SEO (Future)

When expanding globally:
- Implement hreflang tags
- Create localized content
- Use country-specific domains or subdomains
- Translate metadata and structured data

### 14.5 Voice Search Optimization

Optimize for voice queries:
- Target question-based keywords
- Use natural language in content
- Implement FAQ schema
- Focus on featured snippets

### 14.6 E-A-T Optimization

Build Expertise, Authoritativeness, Trustworthiness:
- Add About page with team credentials
- Include author bios on content
- Display security certifications
- Add privacy policy and terms
- Show social proof (testimonials, user count)

---

## 15. KPIs & Success Metrics

### 15.1 Technical SEO Metrics

**Baseline (Month 1):**
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Pages indexed | 1-3 | Google Search Console |
| Crawl errors | 0 | Google Search Console |
| Mobile usability issues | 0 | Google Search Console |
| Core Web Vitals (Good) | >90% | Google Search Console |
| Average LCP | <2.5s | PageSpeed Insights |
| Average CLS | <0.1 | PageSpeed Insights |
| Schema validation | 100% pass | Rich Results Test |

### 15.2 Traffic & Engagement Metrics

**Month 3-6 Goals:**
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Organic traffic | 100+ visits/mo | Google Analytics 4 |
| Branded searches | 50+ impressions/mo | Google Search Console |
| Average CTR | >3% | Google Search Console |
| Bounce rate | <60% | Google Analytics 4 |
| Pages per session | >2.5 | Google Analytics 4 |

### 15.3 LLM Visibility Metrics

**Month 3-12 Goals:**
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Brand mentions in ChatGPT | 1+ per quarter | Manual testing |
| Accurate info in AI responses | 100% | Manual verification |
| Citation in AI-generated lists | Yes | Periodic checks |
| LLM referral traffic | Track | Analytics (referrer) |

### 15.4 Conversion Metrics

**Business Impact:**
| Metric | Target | How to Measure |
|--------|--------|----------------|
| Sign-up conversion rate | 5%+ | Analytics funnel |
| Organic sign-ups | 20+ per month | Analytics source |
| Time to first recipe | <5 min | Custom event tracking |

### 15.5 Reporting Template

**Monthly SEO Report Structure:**

1. **Executive Summary**
   - Key wins and challenges
   - Month-over-month changes

2. **Traffic Analysis**
   - Organic traffic trend
   - Top landing pages
   - Traffic sources

3. **Keyword Performance**
   - Top performing keywords
   - New keyword opportunities
   - Ranking changes

4. **Technical Health**
   - Crawl status
   - Index coverage
   - Core Web Vitals

5. **Actions & Recommendations**
   - Issues to fix
   - Opportunities identified
   - Next month's priorities

---

## 16. Common Issues & Troubleshooting

### 16.1 Sitemap Issues

**Issue: Sitemap returns 404**
```
Cause: File not created or build error
Solution:
1. Verify sitemap.ts exists in app directory
2. Check for TypeScript errors
3. Ensure export default function is present
4. Rebuild: npm run build
```

**Issue: Sitemap shows old/wrong URLs**
```
Cause: Static generation cached
Solution:
1. Add: export const dynamic = 'force-dynamic'
2. Clear .next cache: rm -rf .next
3. Redeploy to Vercel
```

**Issue: GSC reports "Couldn't fetch sitemap"**
```
Cause: Incorrect URL or access issues
Solution:
1. Verify sitemap URL in browser
2. Check robots.txt allows sitemap
3. Ensure no authentication required
4. Wait 24-48 hours for retry
```

### 16.2 Robots.txt Issues

**Issue: Robots.txt blocks important pages**
```
Cause: Overly restrictive disallow rules
Solution:
1. Review disallow directives
2. Test with Google's robots.txt Tester
3. Use Allow to override Disallow for specific paths
```

**Issue: AI crawlers not allowed**
```
Cause: Missing crawler user-agents
Solution:
1. Add specific user-agent rules for GPTBot, Claude-Web, etc.
2. Redeploy
3. Monitor crawler logs
```

### 16.3 Metadata Issues

**Issue: Meta tags not appearing in page source**
```
Cause: Client-side rendering or syntax error
Solution:
1. Verify metadata is in page.tsx or layout.tsx (not client component)
2. Check for TypeScript errors
3. View source (not inspect element) to verify SSR
```

**Issue: OG image not showing on social media**
```
Cause: Image URL, size, or format issues
Solution:
1. Verify image is accessible (no auth required)
2. Check image dimensions (1200x630 recommended)
3. Use absolute URL, not relative
4. Clear social media cache (Facebook Debugger)
5. Ensure image is <8MB
```

**Issue: Title template not working**
```
Cause: Incorrect syntax or override in child layout
Solution:
1. Use: title: { template: '%s | Brand', default: 'Default Title' }
2. Check for title overrides in child layouts
3. Ensure string titles in pages (not objects)
```

### 16.4 Structured Data Issues

**Issue: Rich Results Test shows errors**
```
Cause: Invalid JSON-LD syntax or missing required fields
Solution:
1. Validate JSON in JSON-LD Playground
2. Check for required properties (name, image for Recipe)
3. Ensure proper type definitions
4. Use string literals for special characters
```

**Issue: Structured data not detected**
```
Cause: Script tag not rendering or wrong format
Solution:
1. View source to verify <script type="application/ld+json">
2. Check for dangerouslySetInnerHTML syntax
3. Ensure JSON.stringify() is used
4. Validate JSON syntax
```

### 16.5 Search Console Issues

**Issue: Verification fails**
```
Cause: Meta tag or file not accessible
Solution:
1. Verify meta tag in production page source
2. Check DNS record propagation (24-48h for DNS method)
3. Ensure file is in /public for file method
4. Try alternative verification method
```

**Issue: Pages not indexing**
```
Cause: Various reasons
Solution:
1. Check Coverage report for specific errors
2. Verify robots.txt allows crawling
3. Check for noindex meta tags
4. Ensure sitemap includes URLs
5. Request indexing manually (use sparingly)
6. Check for manual actions or security issues
```

**Issue: Mobile usability errors**
```
Cause: Responsive design issues
Solution:
1. Test on real devices
2. Use Chrome DevTools mobile emulator
3. Fix viewport settings
4. Ensure text is readable without zoom
5. Fix tap target sizes
```

### 16.6 Performance Issues

**Issue: Poor Core Web Vitals**
```
LCP > 2.5s:
- Optimize images (use next/image)
- Reduce server response time
- Eliminate render-blocking resources
- Enable compression

CLS > 0.1:
- Set width/height on images
- Reserve space for ads/embeds
- Avoid inserting content above existing content
- Use transform animations instead of layout-triggering properties

INP > 200ms:
- Reduce JavaScript execution time
- Break up long tasks
- Optimize event handlers
- Defer non-critical JavaScript
```

### 16.7 Vercel-Specific Issues

**Issue: Environment variables not working**
```
Cause: Not configured in Vercel dashboard or wrong scope
Solution:
1. Add in Vercel Dashboard > Project > Settings > Environment Variables
2. Set correct environment (Production, Preview, Development)
3. Redeploy after adding variables
4. Use NEXT_PUBLIC_ prefix for client-side variables
```

**Issue: Preview deployments getting indexed**
```
Cause: Shouldn't happen (Vercel adds noindex automatically)
Solution:
1. Verify X-Robots-Tag header in preview deployment
2. Contact Vercel support if issue persists
```

---

## 17. Resources & Documentation

### 17.1 Official Documentation

**Next.js:**
- [Metadata API Reference](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Sitemap Generation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [OpenGraph Image Generation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)

**Vercel:**
- [SEO Best Practices](https://vercel.com/docs/frameworks/nextjs/seo)
- [Open Graph Preview](https://vercel.com/docs/deployments/og-preview)
- [Analytics](https://vercel.com/docs/analytics)
- [Speed Insights](https://vercel.com/docs/speed-insights)

**Google:**
- [Search Central Documentation](https://developers.google.com/search/docs)
- [Search Console Help](https://support.google.com/webmasters)
- [Recipe Structured Data](https://developers.google.com/search/docs/appearance/structured-data/recipe)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

**Schema.org:**
- [Recipe Schema](https://schema.org/Recipe)
- [WebApplication Schema](https://schema.org/WebApplication)
- [BreadcrumbList Schema](https://schema.org/BreadcrumbList)

### 17.2 SEO Tools

**Free Tools:**
1. [Google Search Console](https://search.google.com/search-console)
2. [Bing Webmaster Tools](https://www.bing.com/webmasters)
3. [Google PageSpeed Insights](https://pagespeed.web.dev/)
4. [Google Rich Results Test](https://search.google.com/test/rich-results)
5. [Schema Markup Validator](https://validator.schema.org/)
6. [Google Analytics 4](https://analytics.google.com/)
7. [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/) (Free up to 500 URLs)

**Paid Tools (Optional):**
1. Ahrefs - Backlink analysis, keyword research
2. SEMrush - Comprehensive SEO suite
3. Moz Pro - SEO monitoring and recommendations
4. Surfer SEO - Content optimization
5. Screaming Frog (Paid) - Enterprise crawling

### 17.3 Learning Resources

**Articles & Guides:**
1. [Next.js 15 SEO: Complete Guide](https://www.digitalapplied.com/blog/nextjs-seo-guide)
2. [SEO in Next.js 15 - The Easy Guide](https://www.vikramrajput.com/2025/01/21/seo-in-next-js-15-the-easy-guide-metadata-sitemap-robots-google-search-console-caching/)
3. [Vercel: Adapting SEO for LLMs](https://vercel.com/blog/how-were-adapting-seo-for-llms-and-ai-search)
4. [LLM Optimization Guide](https://neilpatel.com/blog/llm-optimization-llmo/)

**Community Resources:**
1. [Next.js Discord](https://nextjs.org/discord)
2. [Vercel Community](https://github.com/vercel/next.js/discussions)
3. [r/SEO Subreddit](https://reddit.com/r/SEO)
4. [Web Dev Community](https://web.dev/)

### 17.4 AI Search Resources

**LLM Crawler Documentation:**
1. [OpenAI GPTBot](https://platform.openai.com/docs/gptbot)
2. [Anthropic Claude Web](https://www.anthropic.com/claude-web)
3. [Google Extended](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
4. [Perplexity AI](https://www.perplexity.ai/hub/faq/what-is-the-perplexitybot-crawler)

**Monitoring Tools:**
1. [AI Rank Lab](https://www.airanklab.com/) - AI search optimization
2. [Semrush AI Tracking](https://www.semrush.com/) - Monitor AI citations
3. [Ahrefs Brand Radar](https://ahrefs.com/) - Track brand mentions

---

## 18. Conclusion & Next Steps

### 18.1 Summary

This comprehensive SEO optimization plan provides PlateWise with a complete roadmap to achieve excellent search engine visibility and LLM discoverability. By implementing these recommendations systematically, PlateWise will:

1. **Establish Technical Foundation**
   - Dynamic sitemap for efficient crawling
   - Proper robots.txt for crawler management
   - Comprehensive metadata for all pages

2. **Optimize for Modern Search**
   - Rich snippets via structured data
   - Enhanced social sharing with OG tags
   - LLM-friendly content structure

3. **Enable Growth**
   - Search Console insights for optimization
   - Performance monitoring for improvements
   - Scalable architecture for future features

4. **Future-Proof SEO**
   - AI search optimization (ChatGPT, Claude, Gemini)
   - Prepared for public recipe sharing
   - Established monitoring and maintenance processes

### 18.2 Immediate Next Steps

**This Week:**
1. Create `sitemap.ts` and `robots.ts` files
2. Update root layout metadata
3. Add OG image to /public
4. Set environment variables
5. Deploy and test

**Next Week:**
1. Set up Google Search Console
2. Set up Bing Webmaster Tools
3. Submit sitemaps
4. Implement structured data

**This Month:**
1. Add LLM optimization content
2. Implement canonical URLs
3. Install analytics
4. Conduct performance audit

### 18.3 Success Criteria

**By End of Month 1:**
- [ ] All technical SEO elements implemented
- [ ] Search consoles configured and verified
- [ ] First pages indexed in Google and Bing
- [ ] Zero critical SEO errors

**By End of Month 3:**
- [ ] Organic traffic beginning to grow
- [ ] Rich results eligibility achieved
- [ ] Core Web Vitals passing
- [ ] LLM citations emerging

**By End of Month 6:**
- [ ] Consistent organic traffic growth
- [ ] Top 10 rankings for branded keywords
- [ ] Positive ROI from SEO efforts
- [ ] Established monitoring routine

### 18.4 Maintenance Schedule

**Daily (First 2 Weeks):**
- Monitor Search Console for critical issues

**Weekly:**
- Review crawl errors
- Check indexing progress
- Monitor performance metrics

**Monthly:**
- Comprehensive SEO audit
- Performance testing
- Content review and optimization
- Competitor analysis

**Quarterly:**
- Strategic review
- KPI assessment
- Roadmap updates
- Major optimizations

### 18.5 Getting Help

If you need assistance with implementation:

**Documentation:**
- Review this guide thoroughly
- Consult official Next.js and Vercel docs
- Search Stack Overflow for specific issues

**Community:**
- Next.js Discord for framework questions
- Vercel Community for deployment issues
- r/SEO for SEO strategy questions

**Professional Services:**
- SEO consultant for strategy
- Web developer for implementation
- Performance engineer for optimization

---

## Appendix A: Code Snippets Reference

### A.1 Complete Sitemap Implementation

```typescript
// frontend/src/app/sitemap.ts
import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://platewise.app'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]
}
```

### A.2 Complete Robots.txt Implementation

```typescript
// frontend/src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://platewise.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/recipes/', '/generate', '/meal-planner', '/shopping-list', '/settings/', '/onboarding'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web', 'Google-Extended', 'PerplexityBot'],
        allow: '/',
        disallow: ['/api/', '/recipes/', '/generate', '/meal-planner', '/shopping-list', '/settings/', '/onboarding'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### A.3 Enhanced Root Layout Metadata

```typescript
// frontend/src/app/layout.tsx
import { Metadata } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://platewise.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'PlateWise - AI-Powered Recipe Manager & Meal Planner',
    template: '%s | PlateWise',
  },
  description: 'Your AI-powered recipe assistant. Generate personalized recipes, plan your meals, and create shopping lists — all in one place.',
  keywords: ['recipe manager', 'meal planner', 'AI recipes', 'recipe generator', 'shopping list'],
  authors: [{ name: 'PlateWise' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'PlateWise',
    title: 'PlateWise - AI-Powered Recipe Manager & Meal Planner',
    description: 'Your AI-powered recipe assistant.',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlateWise - AI-Powered Recipe Manager',
    description: 'Your AI-powered recipe assistant.',
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}
```

---

## Appendix B: Environment Variables

### B.1 Required Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://platewise.app

# Optional (for verification)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-verification-code
NEXT_PUBLIC_BING_SITE_VERIFICATION=your-bing-verification-code
```

### B.2 Vercel Environment Variables Setup

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable:
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://platewise.app`
   - Environment: Production, Preview, Development (select all)

---

## Appendix C: File Checklist

### C.1 Files to Create

- [ ] `frontend/src/app/sitemap.ts`
- [ ] `frontend/src/app/robots.ts`
- [ ] `frontend/public/og-image.png` (1200x630px)
- [ ] `frontend/public/manifest.json` (optional, for PWA)

### C.2 Files to Update

- [ ] `frontend/src/app/layout.tsx` (enhanced metadata)
- [ ] `frontend/src/app/page.tsx` (page-specific metadata)
- [ ] `frontend/src/app/(dashboard)/recipes/[id]/page.tsx` (generateMetadata)
- [ ] `frontend/.env.local` (add NEXT_PUBLIC_SITE_URL)

### C.3 Vercel Configuration

- [ ] Add environment variables in Vercel Dashboard
- [ ] Configure custom domain (if not already)
- [ ] Enable Vercel Analytics (optional)
- [ ] Enable Speed Insights (optional)

---

**Document End**

*This SEO Optimization Plan is a living document and should be updated as the application evolves, search engine algorithms change, and new SEO best practices emerge.*

**Last Updated:** October 17, 2025
**Next Review:** January 17, 2026
