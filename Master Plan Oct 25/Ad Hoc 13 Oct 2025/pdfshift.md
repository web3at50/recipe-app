# PDFShift Integration Guide for Platewise Recipe Application

**Document Version:** 1.0
**Date:** October 13, 2025
**Target Application:** Platewise (https://www.platewise.xyz)
**Objective:** Enable PDF generation and printing of recipes

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Implementation Architecture](#2-implementation-architecture)
3. [Technical Specifications](#3-technical-specifications)
4. [Feature Recommendations](#4-feature-recommendations)
5. [Code Integration Points](#5-code-integration-points)
6. [User Flow](#6-user-flow)
7. [Security Considerations](#7-security-considerations)
8. [Testing Strategy](#8-testing-strategy)
9. [Potential Challenges](#9-potential-challenges)
10. [Implementation Checklist](#10-implementation-checklist)

---

## 1. Executive Summary

### 1.1 PDFShift Overview

PDFShift is a RESTful API service that converts HTML content and URLs into high-quality PDF documents. It provides enterprise-grade features with a simple, credit-based pricing model.

**Key Capabilities:**
- HTML-to-PDF and URL-to-PDF conversion
- Customizable page layouts (margins, headers, footers)
- 250 documents per minute for authenticated requests
- Sandbox testing mode (no credit consumption)
- Print stylesheet support
- Cookie-based authentication handling
- Webhook support for async processing
- Amazon S3 direct save integration

### 1.2 Why PDFShift for Platewise

**Advantages:**
- **Simple Integration**: Single POST request to generate PDFs
- **No Server Dependencies**: No need to install Puppeteer, Chrome, or other heavy dependencies
- **High Quality**: Professional PDF output optimized for printing
- **Cost-Effective**: Pay-per-conversion model, no infrastructure overhead
- **API Key Ready**: `PDF_SHIFT_API_KEY` already configured in environment variables

**Ideal Use Cases for Platewise:**
- Users printing recipes for kitchen use
- Saving recipes for offline access
- Sharing recipes via PDF
- Creating meal plan exports
- Generating shopping lists

### 1.3 Recommended Integration Approach

For Platewise recipe PDF generation, the recommended architecture is:

1. **Backend API Route** (`/api/recipes/[id]/pdf`)
   - Keeps API key secure on server
   - Validates user authentication and permissions
   - Handles errors gracefully

2. **Print-Optimized View** (`/recipes/[id]/print`)
   - Clean, printer-friendly layout
   - Removes navigation and UI chrome
   - Optimized for A4 paper

3. **URL-Based Conversion**
   - PDFShift converts the live print view
   - Automatically includes all CSS and styling
   - Easier to maintain than HTML templates

4. **Client Component** (`PrintRecipeButton`)
   - Simple button with loading states
   - Automatic download on success
   - Toast notifications for feedback

**Estimated Implementation Time:**
- **MVP (Basic PDF Generation):** 4-6 hours
- **Enhanced (Rate Limiting, Caching):** +3-4 hours
- **Advanced (Webhooks, S3):** +4-6 hours

---

## 2. Implementation Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Recipe Detail Page (/recipes/[id])                    │ │
│  │  ┌──────────────────────────────────┐                 │ │
│  │  │  [Download PDF] Button           │                 │ │
│  │  └──────────┬───────────────────────┘                 │ │
│  └─────────────┼──────────────────────────────────────────┘ │
└────────────────┼─────────────────────────────────────────────┘
                 │ 1. Click
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Route                         │
│                /api/recipes/[id]/pdf                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Authenticate user (Clerk)                          │ │
│  │  2. Validate recipe access (Supabase)                  │ │
│  │  3. Build print URL                                    │ │
│  │  4. Call PDFShift API ────────────┐                    │ │
│  │  5. Return PDF binary              │                   │ │
│  └────────────────────────────────────┼────────────────────┘ │
└────────────────────────────────────────┼─────────────────────┘
                                         │ 4. POST request
                                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      PDFShift API                            │
│              https://api.pdfshift.io/v3/convert/pdf          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Fetch URL (https://platewise.xyz/recipes/X/print) │ │
│  │  2. Render HTML with CSS                               │ │
│  │  3. Generate PDF with margins/headers/footers          │ │
│  │  4. Return PDF binary                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                         │ 5. PDF response
                                         ▼
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Automatic PDF Download                                │ │
│  │  File: recipe-name.pdf                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 File Structure

```
C:\Users\bryn\Documents\recipeapp\frontend\src\
├── app\
│   ├── (dashboard)\
│   │   └── recipes\
│   │       └── [id]\
│   │           ├── page.tsx                    # Add PrintRecipeButton here
│   │           └── print\
│   │               └── page.tsx                # NEW: Print-optimized view
│   └── api\
│       └── recipes\
│           └── [id]\
│               └── pdf\
│                   └── route.ts                # NEW: PDF generation endpoint
├── lib\
│   └── pdf\
│       ├── pdfshift-client.ts                  # NEW: PDFShift API wrapper
│       ├── config.ts                           # NEW: PDF configuration
│       └── errors.ts                           # NEW: Error handling
└── components\
    └── recipes\
        └── print-recipe-button.tsx             # NEW: UI component
```

### 2.3 Data Flow

**Step-by-Step Request Flow:**

1. **User Action**
   - User views recipe at `/recipes/[id]`
   - Clicks "Download PDF" button

2. **Frontend Request**
   - Button component calls `fetch('/api/recipes/[id]/pdf')`
   - Shows loading state

3. **API Route Processing**
   - Authenticates user via Clerk
   - Queries Supabase to verify recipe exists and user has access
   - Constructs print URL: `https://www.platewise.xyz/recipes/[id]/print`

4. **PDFShift API Call**
   - POST request to `https://api.pdfshift.io/v3/convert/pdf`
   - Headers: `X-API-Key: ${PDF_SHIFT_API_KEY}`
   - Body: Configuration (source URL, format, margins, headers/footers)

5. **PDF Generation**
   - PDFShift fetches the print URL
   - Renders HTML/CSS
   - Applies page settings
   - Generates PDF binary

6. **Response**
   - API route returns PDF as `application/pdf`
   - Frontend downloads file automatically
   - Shows success toast notification

**Processing Time:** 2-8 seconds depending on recipe complexity

---

## 3. Technical Specifications

### 3.1 API Endpoint

**URL:** `https://api.pdfshift.io/v3/convert/pdf`
**Method:** `POST`
**Content-Type:** `application/json`
**Authentication:** `X-API-Key` header

### 3.2 Request Format

**Required Headers:**
```typescript
{
  'X-API-Key': process.env.PDF_SHIFT_API_KEY,
  'Content-Type': 'application/json'
}
```

**Request Body Structure:**
```typescript
interface PDFShiftRequest {
  source: string;              // URL or HTML content (required)
  sandbox?: boolean;           // Test mode with watermark
  format?: string;             // Page size: 'A4', 'Letter', 'Legal'
  landscape?: boolean;         // Orientation
  margin?: {                   // Page margins
    top?: string;              // e.g., '20mm'
    right?: string;
    bottom?: string;
    left?: string;
  };
  header?: {                   // Custom header
    source: string;            // HTML template
    height: string;            // e.g., '15mm'
    start_at?: number;         // Page to start on
  };
  footer?: {                   // Custom footer
    source: string;            // HTML template
    height: string;
    start_at?: number;
  };
  use_print?: boolean;         // Apply @media print styles
  disable_backgrounds?: boolean;
  css?: string;                // Additional CSS
  filename?: string;           // Download filename
}
```

**Example Request:**
```typescript
{
  source: "https://www.platewise.xyz/recipes/123/print",
  sandbox: false,
  format: "A4",
  margin: {
    top: "20mm",
    right: "15mm",
    bottom: "20mm",
    left: "15mm"
  },
  use_print: true,
  footer: {
    source: "<div style='text-align: center;'>Page {{page}} of {{total}}</div>",
    height: "15mm"
  }
}
```

### 3.3 Response Format

**Success Response (200 OK):**
- **Content-Type:** `application/pdf`
- **Body:** PDF binary data

**Response Headers:**
```
X-Credits-Used: 1
X-Process-Time: 2341
X-RateLimit-Remaining: 248
X-RateLimit-Limit: 250
X-RateLimit-Reset: 1699564800
```

**Error Response:**
```json
{
  "error": {
    "code": 400,
    "error": "Error message description",
    "identifier": "A74",
    "success": false
  }
}
```

### 3.4 Authentication Flow

**API Key Configuration:**

```env
# .env.local (Development)
PDF_SHIFT_API_KEY=sk_xxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Vercel Environment Variables (Production)
PDF_SHIFT_API_KEY=sk_xxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=https://www.platewise.xyz
```

**Usage in Code:**
```typescript
const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.PDF_SHIFT_API_KEY!,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(config),
});
```

**Security Rules:**
- ✅ API key stored in environment variables
- ✅ Never exposed to client-side code
- ✅ Only used in server-side API routes
- ❌ Never commit API keys to git
- ❌ Never log API keys
- ❌ Never include in client bundles

### 3.5 Error Handling Strategy

**Error Code Mapping:**

| Status Code | Error | Handling Strategy |
|-------------|-------|-------------------|
| 400 | Bad Request | Log error, show user-friendly message |
| 401 | Unauthorized | Server error (API key issue), alert admin |
| 403 | Forbidden | Verify API key validity |
| 408 | Request Timeout | Retry once, then suggest simpler view |
| 429 | Rate Limited | Exponential backoff, inform user |
| 500 | Server Error | Retry with backoff, fallback to browser print |

**User-Friendly Error Messages:**

```typescript
const ERROR_MESSAGES = {
  401: 'PDF generation is temporarily unavailable. Please contact support.',
  403: 'You do not have permission to generate this PDF.',
  408: 'PDF generation timed out. The recipe may be too complex.',
  429: 'Too many PDF requests. Please wait a moment and try again.',
  500: 'PDF service is unavailable. Please try again later.',
  default: 'Failed to generate PDF. Please try again.'
};
```

**Retry Logic:**

```typescript
async function generatePDFWithRetry(config: PDFConfig, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await pdfShiftClient.convert(config);
    } catch (error) {
      // Don't retry client errors (4xx)
      if (error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      // Exponential backoff for server errors
      if (attempt < maxRetries - 1) {
        await delay(Math.pow(2, attempt) * 1000);
      }
    }
  }
}
```

### 3.6 Rate Limits and Quotas

**PDFShift Limits:**
- **Unauthenticated:** 2 requests/minute
- **Authenticated:** 250 requests/minute
- **Sandbox Mode:** 10 requests/minute

**Recommended Application Limits:**

| User Tier | Daily Limit | Monthly Limit |
|-----------|-------------|---------------|
| Free | 3 PDFs | 10 PDFs |
| Premium | 20 PDFs | 100 PDFs |
| Unlimited | 100 PDFs | Unlimited |

**Implementation:** See [Section 7.2](#72-rate-limiting-strategy)

---

## 4. Feature Recommendations

### 4.1 Optimal Settings for Recipe PDFs

**Recommended Configuration:**

```typescript
const PLATEWISE_PDF_CONFIG = {
  format: 'A4',                    // Standard international paper size
  landscape: false,                // Portrait orientation for recipes
  use_print: true,                 // Apply @media print CSS rules
  disable_backgrounds: false,      // Keep branding/colors

  margin: {
    top: '20mm',                   // Room for header
    right: '15mm',                 // Standard side margin
    bottom: '20mm',                // Room for footer + page numbers
    left: '15mm'                   // Standard side margin
  }
};
```

**Rationale:**
- **A4 Format:** International standard, works globally (210mm × 297mm)
- **Portrait:** Optimal for recipe layout (ingredients, instructions)
- **20mm Top/Bottom:** Professional margins, space for headers/footers
- **15mm Sides:** Comfortable reading margins, prevents text cutoff

### 4.2 Header Configuration

**Branded Header Template:**

```typescript
{
  header: {
    source: `
      <div style="
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 11px;
        color: #333;
        padding: 8px 15mm;
        border-bottom: 2px solid #10b981;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span style="font-weight: 600; font-size: 12px;">{{title}}</span>
        <span style="color: #10b981; font-weight: 600;">Platewise</span>
      </div>
    `,
    height: '18mm'
  }
}
```

**Features:**
- Recipe name from page title ({{title}} variable)
- Platewise branding in green (#10b981)
- Bottom border for separation
- Responsive spacing

### 4.3 Footer Configuration

**Page-Numbered Footer Template:**

```typescript
{
  footer: {
    source: `
      <div style="
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 9px;
        color: #666;
        padding: 8px 15mm;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span>www.platewise.xyz</span>
        <span style="font-weight: 500;">Page {{page}} of {{total}}</span>
        <span>{{date}}</span>
      </div>
    `,
    height: '15mm'
  }
}
```

**Features:**
- Website URL (left)
- Page numbers with total count (center)
- Generation date (right)
- Top border for separation

**Available Variables:**
- `{{page}}` - Current page number
- `{{total}}` - Total number of pages
- `{{date}}` - Generation date (formatted)
- `{{title}}` - Document title from `<title>` tag
- `{{url}}` - Source URL

### 4.4 CSS Customization

**Print-Optimized CSS:**

```css
@page {
  margin: 0; /* Let PDFShift handle margins */
}

body {
  font-size: 12pt;
  line-height: 1.6;
  color: #333;
}

/* Prevent awkward page breaks */
.ingredient-list, .instruction {
  page-break-inside: avoid;
}

h1, h2, h3 {
  page-break-after: avoid;
}

/* Hide non-print elements */
.no-print, nav, footer, .print-button {
  display: none !important;
}

/* Optimize images for print */
img {
  max-width: 100%;
  height: auto;
  page-break-inside: avoid;
}
```

### 4.5 Recommendations Summary

**For MVP Implementation:**
- ✅ Use A4 format, portrait orientation
- ✅ Include branded header with recipe name
- ✅ Include footer with page numbers
- ✅ Apply standard margins (20mm/15mm)
- ✅ Use print stylesheets (`use_print: true`)

**For Future Enhancements:**
- ⏳ User preferences for paper size (A4 vs Letter)
- ⏳ Optional landscape for wide tables
- ⏳ Custom header/footer templates per user
- ⏳ Watermark for shared recipes
- ⏳ Password protection for premium recipes

---

## 5. Code Integration Points

### 5.1 Backend Implementation

#### File: `lib/pdf/pdfshift-client.ts`

**Purpose:** Reusable PDFShift API wrapper

```typescript
export interface PDFShiftConfig {
  source: string;
  sandbox?: boolean;
  format?: string;
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  header?: {
    source: string;
    height: string;
  };
  footer?: {
    source: string;
    height: string;
  };
  use_print?: boolean;
  filename?: string;
}

export class PDFShiftClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.pdfshift.io/v3/convert/pdf';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('PDFShift API key is required');
    }
    this.apiKey = apiKey;
  }

  async convert(config: PDFShiftConfig): Promise<ArrayBuffer> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new PDFShiftError(
        error.error?.error || 'PDF generation failed',
        response.status,
        error
      );
    }

    return await response.arrayBuffer();
  }
}

export class PDFShiftError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details: any
  ) {
    super(message);
    this.name = 'PDFShiftError';
  }
}

// Export singleton
export const pdfShiftClient = new PDFShiftClient(
  process.env.PDF_SHIFT_API_KEY!
);
```

#### File: `lib/pdf/config.ts`

**Purpose:** Default PDF configurations

```typescript
export const DEFAULT_RECIPE_PDF_CONFIG = {
  format: 'A4',
  landscape: false,
  use_print: true,
  margin: {
    top: '20mm',
    right: '15mm',
    bottom: '20mm',
    left: '15mm'
  }
};

export function getRecipeHeaderFooter(recipeTitle: string) {
  return {
    header: {
      source: `
        <div style="
          font-family: system-ui, sans-serif;
          font-size: 11px;
          color: #333;
          padding: 8px 15mm;
          border-bottom: 2px solid #10b981;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <span style="font-weight: 600;">${recipeTitle}</span>
          <span style="color: #10b981; font-weight: 600;">Platewise</span>
        </div>
      `,
      height: '18mm'
    },
    footer: {
      source: `
        <div style="
          font-family: system-ui, sans-serif;
          font-size: 9px;
          color: #666;
          padding: 8px 15mm;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
        ">
          <span>www.platewise.xyz</span>
          <span style="font-weight: 500;">Page {{page}} of {{total}}</span>
          <span>{{date}}</span>
        </div>
      `,
      height: '15mm'
    }
  };
}
```

#### File: `app/api/recipes/[id]/pdf/route.ts`

**Purpose:** API endpoint for PDF generation

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { pdfShiftClient } from '@/lib/pdf/pdfshift-client';
import { DEFAULT_RECIPE_PDF_CONFIG, getRecipeHeaderFooter } from '@/lib/pdf/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get recipe and validate access
    const { id } = await params;
    const supabase = await createClient();

    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('name, user_id')
      .eq('id', id)
      .single();

    if (error || !recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    if (recipe.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 3. Generate PDF
    const recipeUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/recipes/${id}/print`;

    const pdfConfig = {
      ...DEFAULT_RECIPE_PDF_CONFIG,
      source: recipeUrl,
      sandbox: process.env.NODE_ENV !== 'production',
      ...getRecipeHeaderFooter(recipe.name),
      filename: `${recipe.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
    };

    const pdfBuffer = await pdfShiftClient.convert(pdfConfig);

    // 4. Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfConfig.filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);

    // Handle PDFShift errors
    if (error instanceof Error && error.name === 'PDFShiftError') {
      const statusCode = (error as any).statusCode || 500;
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
```

#### File: `app/recipes/[id]/print/page.tsx`

**Purpose:** Print-optimized recipe view

```typescript
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function RecipePrintPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  return (
    <html lang="en">
      <head>
        <title>{recipe.name} - Platewise Recipe</title>
        <meta charSet="utf-8" />
        <style>{`
          @page { margin: 0; }

          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 0;
            margin: 0;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          h1 {
            font-size: 32px;
            margin-bottom: 8px;
            color: #10b981;
          }

          .meta {
            display: flex;
            gap: 24px;
            margin-bottom: 32px;
            font-size: 14px;
            color: #666;
          }

          .section-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #10b981;
            border-bottom: 2px solid #10b981;
            padding-bottom: 8px;
          }

          .ingredients {
            list-style: none;
            padding: 0;
          }

          .ingredient {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }

          .instructions {
            list-style: none;
            padding: 0;
            counter-reset: step-counter;
          }

          .instruction {
            counter-increment: step-counter;
            padding: 16px 0;
            display: flex;
            gap: 16px;
          }

          .instruction::before {
            content: counter(step-counter);
            background: #10b981;
            color: white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            flex-shrink: 0;
          }

          @media print {
            .section { page-break-inside: avoid; }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>{recipe.name}</h1>

          {recipe.description && (
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
              {recipe.description}
            </p>
          )}

          <div className="meta">
            {recipe.prep_time && <span>⏱️ Prep: {recipe.prep_time}m</span>}
            {recipe.cook_time && <span>🔥 Cook: {recipe.cook_time}m</span>}
            <span>👥 Servings: {recipe.servings}</span>
          </div>

          <div className="section">
            <h2 className="section-title">Ingredients</h2>
            <ul className="ingredients">
              {recipe.ingredients.map((ing: any, idx: number) => (
                <li key={idx} className="ingredient">
                  {ing.quantity && `${ing.quantity} `}
                  {ing.unit && `${ing.unit} `}
                  {ing.item}
                  {ing.notes && ` (${ing.notes})`}
                </li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h2 className="section-title">Instructions</h2>
            <ol className="instructions">
              {recipe.instructions.map((inst: any, idx: number) => (
                <li key={idx} className="instruction">
                  <span>{inst.instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### 5.2 Frontend Implementation

#### File: `components/recipes/print-recipe-button.tsx`

**Purpose:** User-facing button component

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PrintRecipeButtonProps {
  recipeId: string;
  recipeName: string;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function PrintRecipeButton({
  recipeId,
  recipeName,
  variant = 'outline',
  className
}: PrintRecipeButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrintRecipe = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/recipes/${recipeId}/pdf`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${recipeName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate PDF',
        {
          duration: 5000,
          action: {
            label: 'Retry',
            onClick: () => handlePrintRecipe()
          }
        }
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handlePrintRecipe}
      disabled={isGenerating}
      variant={variant}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-2" />
          Download PDF
        </>
      )}
    </Button>
  );
}
```

#### Integration: `app/(dashboard)/recipes/[id]/page.tsx`

**Add to the recipe detail page (around line 176, in the actions section):**

```typescript
import { PrintRecipeButton } from '@/components/recipes/print-recipe-button';

// In the actions section:
<div className="flex gap-4">
  <Link href={`/recipes/${id}/edit`} className="flex-1">
    <Button variant="outline" className="w-full">
      <Edit className="h-4 w-4 mr-2" />
      Edit Recipe
    </Button>
  </Link>

  {/* NEW: PDF Download Button */}
  <div className="flex-1">
    <PrintRecipeButton
      recipeId={id}
      recipeName={recipe.name}
      className="w-full"
    />
  </div>
</div>
```

---

## 6. User Flow

### 6.1 Complete User Journey

**Step-by-Step Flow:**

```
1. User Views Recipe
   ↓
   [Recipe Detail Page]
   - Recipe name, ingredients, instructions
   - [Edit Recipe] [Download PDF] buttons

2. User Clicks "Download PDF"
   ↓
   [Button State: Loading]
   - Icon changes to spinner
   - Text: "Generating PDF..."
   - Button disabled

3. Request Sent to Backend
   ↓
   [API Route Processing]
   - Authenticate user (Clerk)
   - Validate recipe access
   - Call PDFShift API
   - Wait 2-8 seconds

4. PDFShift Generates PDF
   ↓
   [PDFShift Service]
   - Fetch print URL
   - Render HTML/CSS
   - Generate PDF with headers/footers

5. PDF Downloaded Automatically
   ↓
   [Browser Download]
   - File: recipe-name.pdf
   - Location: Downloads folder
   - Button returns to normal state

6. Success Notification
   ↓
   [Toast Message]
   - "PDF downloaded successfully!"
   - Auto-dismiss after 3 seconds
```

### 6.2 UI States

**Idle State:**
```
┌─────────────────────────────┐
│  ⬇  Download PDF            │
└─────────────────────────────┘
```

**Loading State:**
```
┌─────────────────────────────┐
│  ⟳  Generating PDF...       │  (disabled, spinner animating)
└─────────────────────────────┘
```

**Success State:**
```
┌─────────────────────────────┐
│  ✓  Downloaded!             │  (brief flash, then returns to idle)
└─────────────────────────────┘

[Toast Notification]
✓ PDF downloaded successfully!
```

**Error State:**
```
[Toast Notification - Red]
✗ Failed to generate PDF
   [Retry Button]
```

### 6.3 Responsive Design

**Desktop Layout:**
```
┌─────────────────────────────────────────┐
│  Recipe Name                      ♥  🗑  │
│                                          │
│  [quick] [vegetarian] [batch]           │
│  ⏱ 30m prep + 45m cook   👥 4 servings  │
├─────────────────────────────────────────┤
│  Ingredients                             │
│  • 400g pasta                            │
│  • 2 tbsp olive oil                      │
│  ...                                     │
├─────────────────────────────────────────┤
│  Instructions                            │
│  1. Boil water...                        │
│  2. Cook pasta...                        │
│  ...                                     │
├─────────────────────────────────────────┤
│  [✏ Edit Recipe]  [⬇ Download PDF]     │
└─────────────────────────────────────────┘
```

**Mobile Layout:**
```
┌───────────────────────┐
│  Recipe Name    ♥  🗑 │
│                       │
│  [tags]               │
│  ⏱ 30m  👥 4         │
├───────────────────────┤
│  Ingredients          │
│  • 400g pasta         │
│  ...                  │
├───────────────────────┤
│  Instructions         │
│  1. Boil water...     │
│  ...                  │
├───────────────────────┤
│  [✏ Edit Recipe]     │
│  [⬇ Download PDF]    │
└───────────────────────┘
```

### 6.4 Error Scenarios

**Scenario 1: User Not Authenticated**
- API returns 401
- Toast: "Please sign in to download PDFs"
- Redirect to sign-in page

**Scenario 2: Recipe Not Found**
- API returns 404
- Toast: "Recipe not found"
- Button re-enabled

**Scenario 3: No Permission**
- API returns 403
- Toast: "You don't have permission to download this recipe"
- Button re-enabled

**Scenario 4: Rate Limit Exceeded**
- API returns 429
- Toast: "Too many PDF requests. Please try again in 5 minutes."
- Button disabled for 5 minutes

**Scenario 5: Network Error**
- Fetch fails
- Toast: "Network error. Please check your connection and try again."
- Retry button shown

**Scenario 6: PDFShift Service Down**
- API returns 503
- Toast: "PDF service is temporarily unavailable. Try browser print instead."
- Show fallback print button

### 6.5 Accessibility

**Keyboard Navigation:**
- Button is focusable with Tab key
- Enter/Space triggers PDF generation
- Loading state announced to screen readers

**Screen Reader Support:**
```typescript
<Button
  onClick={handlePrintRecipe}
  disabled={isGenerating}
  aria-label="Download recipe as PDF"
  aria-busy={isGenerating}
>
  {/* Button content */}
</Button>
```

**Loading Announcement:**
```typescript
{isGenerating && (
  <span className="sr-only" role="status" aria-live="polite">
    Generating PDF, please wait...
  </span>
)}
```

---

## 7. Security Considerations

### 7.1 API Key Protection

**Environment Variable Setup:**

```env
# .env.local (NEVER commit this file)
PDF_SHIFT_API_KEY=sk_xxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Add to .gitignore
.env.local
.env*.local
```

**Vercel Configuration:**
- Navigate to: Vercel Dashboard > Project > Settings > Environment Variables
- Add: `PDF_SHIFT_API_KEY` = `sk_xxxxxxxxxxxx`
- Scope: Production, Preview, Development

**Security Checklist:**
- ✅ API key stored in environment variables
- ✅ Never exposed to client-side code
- ✅ Not logged in console or error messages
- ✅ Not committed to version control
- ✅ Server-side API routes only
- ❌ Never in client components
- ❌ Never in browser network requests
- ❌ Never in public repositories

**Validation at Startup:**

```typescript
// lib/pdf/pdfshift-client.ts
if (!process.env.PDF_SHIFT_API_KEY) {
  throw new Error('PDF_SHIFT_API_KEY environment variable is not set');
}

// Verify API key format
if (!process.env.PDF_SHIFT_API_KEY.startsWith('sk_')) {
  console.warn('⚠️  PDF_SHIFT_API_KEY does not match expected format');
}
```

### 7.2 Rate Limiting Strategy

**Per-User Rate Limits:**

```typescript
// lib/pdf/rate-limit.ts
import { createClient } from '@/lib/supabase/server';

export async function checkPDFRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}> {
  const supabase = await createClient();

  // Count PDFs generated in last hour
  const oneHourAgo = new Date(Date.now() - 3600000);

  const { count } = await supabase
    .from('pdf_generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo.toISOString());

  const limit = 10; // 10 PDFs per hour
  const remaining = Math.max(0, limit - (count || 0));
  const resetAt = new Date(Date.now() + 3600000);

  return {
    allowed: remaining > 0,
    remaining,
    resetAt
  };
}
```

**Database Schema:**

```sql
CREATE TABLE pdf_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  recipe_id UUID NOT NULL,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pdf_generations_user_time
ON pdf_generations(user_id, created_at);
```

**Apply in API Route:**

```typescript
// app/api/recipes/[id]/pdf/route.ts
import { checkPDFRateLimit } from '@/lib/pdf/rate-limit';

export async function GET(request: NextRequest, { params }) {
  const { userId } = await auth();

  // Check rate limit
  const rateLimit = await checkPDFRateLimit(userId);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        userMessage: `You've reached the PDF generation limit. Try again after ${rateLimit.resetAt.toLocaleTimeString()}.`,
        resetAt: rateLimit.resetAt.toISOString()
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor(rateLimit.resetAt.getTime() / 1000).toString()
        }
      }
    );
  }

  // Generate PDF...

  // Track generation
  await supabase.from('pdf_generations').insert({
    user_id: userId,
    recipe_id: id,
    credits_used: 1
  });
}
```

### 7.3 User Authorization

**Multi-Layer Security:**

1. **Authentication Check** (Clerk)
   - Verify user is signed in
   - Get user ID from session

2. **Recipe Ownership Validation** (Supabase)
   - Query recipe by ID
   - Verify `recipe.user_id === userId`

3. **Rate Limit Check**
   - Prevent abuse
   - Track usage

**Implementation:**

```typescript
// 1. Authenticate
const { userId } = await auth();
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// 2. Validate ownership
const { data: recipe } = await supabase
  .from('recipes')
  .select('user_id')
  .eq('id', recipeId)
  .single();

if (!recipe || recipe.user_id !== userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// 3. Check rate limit
const rateLimit = await checkPDFRateLimit(userId);
if (!rateLimit.allowed) {
  return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
}
```

### 7.4 Input Validation

**Sanitize Recipe ID:**

```typescript
// Validate UUID format
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

if (!uuidRegex.test(recipeId)) {
  return NextResponse.json(
    { error: 'Invalid recipe ID' },
    { status: 400 }
  );
}
```

**Sanitize Filename:**

```typescript
// Remove potentially dangerous characters
const sanitizedFilename = recipeName
  .replace(/[^a-z0-9\s-]/gi, '')  // Remove special chars
  .replace(/\s+/g, '-')            // Replace spaces with hyphens
  .replace(/-+/g, '-')             // Remove multiple hyphens
  .replace(/^-|-$/g, '')           // Trim hyphens
  .toLowerCase()
  .substring(0, 100);              // Max length
```

### 7.5 Error Message Safety

**Never Expose Internal Details:**

```typescript
// ❌ BAD - Exposes internal error details
catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// ✅ GOOD - Generic user message, log details
catch (error) {
  console.error('PDF generation failed:', error);
  return NextResponse.json(
    { error: 'Failed to generate PDF. Please try again.' },
    { status: 500 }
  );
}
```

### 7.6 HTTPS Enforcement

**Ensure Secure Communication:**

```typescript
// Vercel automatically enforces HTTPS in production
// For local development, PDFShift accepts HTTP

// Verify HTTPS in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.NEXT_PUBLIC_BASE_URL?.startsWith('https://')) {
    console.error('⚠️  NEXT_PUBLIC_BASE_URL must use HTTPS in production');
  }
}
```

---

## 8. Testing Strategy

### 8.1 Sandbox Mode Testing

**Enable Sandbox in Development:**

```typescript
// lib/pdf/config.ts
export const DEFAULT_RECIPE_PDF_CONFIG = {
  // ...other config
  sandbox: process.env.NODE_ENV !== 'production',
};
```

**Sandbox Characteristics:**
- ✅ No credit consumption
- ✅ All features available
- ✅ Watermark applied ("Test Mode" or similar)
- ✅ 10 requests/minute limit
- ✅ Same API endpoint

**Testing Workflow:**

1. **Local Development:**
   ```bash
   # .env.local
   NODE_ENV=development
   PDF_SHIFT_API_KEY=sk_xxxxxxxxxxxx
   ```

2. **Generate Test PDFs:**
   - All PDFs will have "PDFShift Sandbox" watermark
   - No credits consumed
   - Test all features freely

3. **Before Production Deploy:**
   - Switch `sandbox: false`
   - Test with 1-2 real conversions
   - Verify no watermark
   - Confirm credits are consumed

### 8.2 Test Cases

**Functional Tests:**

| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| Generate PDF for valid recipe | Authenticated user, existing recipe | PDF downloads successfully | ☐ |
| Unauthenticated access | No session | 401 Unauthorized | ☐ |
| Non-existent recipe | Invalid recipe ID | 404 Not Found | ☐ |
| Another user's recipe | Recipe owned by different user | 403 Forbidden | ☐ |
| Rate limit exceeded | 11th request in hour | 429 Too Many Requests | ☐ |
| Invalid API key | Wrong key in env | 500 Internal Error (logged) | ☐ |
| Recipe with special chars | Name: "Mom's Pasta & Meatballs™" | Filename sanitized correctly | ☐ |
| Very long recipe | 50+ ingredients, 20+ steps | Multi-page PDF, proper pagination | ☐ |
| Recipe with images | Recipe includes photos | Images render in PDF | ☐ |
| Concurrent requests | 3 simultaneous PDF requests | All succeed | ☐ |

**UI/UX Tests:**

| Test Case | Expected Behavior | Status |
|-----------|-------------------|--------|
| Click "Download PDF" | Button shows loading state immediately | ☐ |
| PDF generation succeeds | Toast notification + automatic download | ☐ |
| PDF generation fails | Error toast with retry button | ☐ |
| Slow network | Loading indicator persists until complete | ☐ |
| Mobile tap | Responsive, clear feedback | ☐ |
| Keyboard navigation | Tab to button, Enter to activate | ☐ |
| Screen reader | Announces "Download recipe as PDF" | ☐ |

**Performance Tests:**

| Test Case | Target | Actual | Status |
|-----------|--------|--------|--------|
| Simple recipe (1 page) | < 3 seconds | ___ sec | ☐ |
| Average recipe (2-3 pages) | < 5 seconds | ___ sec | ☐ |
| Complex recipe (5+ pages) | < 8 seconds | ___ sec | ☐ |
| PDF file size (average) | < 500 KB | ___ KB | ☐ |
| PDF file size (with images) | < 2 MB | ___ MB | ☐ |

### 8.3 Quality Validation

**PDF Quality Checklist:**

**Visual:**
- ☐ Text is crisp and readable (not blurry)
- ☐ Colors match Platewise brand (#10b981 green)
- ☐ Margins are consistent (20mm top/bottom, 15mm sides)
- ☐ No text cutoff at page edges
- ☐ Line spacing is comfortable (1.6)

**Headers/Footers:**
- ☐ Header appears on all pages
- ☐ Recipe name displays correctly in header
- ☐ Platewise logo/text in header
- ☐ Footer appears on all pages
- ☐ Page numbers are correct (Page X of Y)
- ☐ Date is properly formatted
- ☐ Website URL appears in footer

**Content:**
- ☐ All ingredients are included
- ☐ All instructions are included
- ☐ Ingredient formatting is consistent
- ☐ Instruction numbering is correct
- ☐ Tags are displayed (if present)
- ☐ Prep/cook times are shown
- ☐ Servings count is visible

**Pagination:**
- ☐ No awkward page breaks mid-ingredient
- ☐ No awkward page breaks mid-instruction
- ☐ Section headers don't appear alone at bottom
- ☐ No unnecessary blank pages
- ☐ Multi-page recipes flow naturally

**Compatibility:**
- ☐ Opens in Adobe Acrobat Reader
- ☐ Opens in Chrome PDF viewer
- ☐ Opens in Firefox PDF viewer
- ☐ Opens in Safari PDF viewer
- ☐ Opens on iOS (Mobile Safari)
- ☐ Opens on Android (Chrome)
- ☐ Prints correctly on physical printer

**Special Characters:**
- ☐ Fractions render correctly (½, ¼, ⅓)
- ☐ Currency symbols render (£, €, $)
- ☐ Degree symbol renders (°C, °F)
- ☐ Apostrophes/quotes render properly
- ☐ Non-English characters render (ñ, é, ü)

### 8.4 Automated Testing

**Unit Tests:**

```typescript
// __tests__/lib/pdf/pdfshift-client.test.ts
import { describe, it, expect } from '@jest/globals';
import { PDFShiftClient } from '@/lib/pdf/pdfshift-client';

describe('PDFShiftClient', () => {
  const client = new PDFShiftClient(process.env.PDF_SHIFT_API_KEY!);

  it('should throw error if API key is missing', () => {
    expect(() => new PDFShiftClient('')).toThrow('API key is required');
  });

  it('should generate PDF in sandbox mode', async () => {
    const result = await client.convert({
      source: '<html><body><h1>Test</h1></body></html>',
      sandbox: true
    });

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(result.byteLength).toBeGreaterThan(0);
  });

  it('should handle PDFShift errors', async () => {
    await expect(
      client.convert({
        source: 'invalid-url',
        sandbox: true
      })
    ).rejects.toThrow();
  });
});
```

**Integration Tests:**

```typescript
// __tests__/api/recipes/[id]/pdf.test.ts
import { GET } from '@/app/api/recipes/[id]/pdf/route';
import { NextRequest } from 'next/server';

describe('PDF API Route', () => {
  it('should return 401 if not authenticated', async () => {
    const request = new NextRequest('http://localhost:3000/api/recipes/123/pdf');
    const response = await GET(request, { params: { id: '123' } });

    expect(response.status).toBe(401);
  });

  it('should return PDF for authenticated user', async () => {
    // Mock Clerk auth
    // Mock Supabase response
    // Call API route
    // Verify PDF response
  });
});
```

### 8.5 Manual Testing Checklist

**Before Deploying to Production:**

1. **Sandbox Testing:**
   - ☐ Generate 5 test PDFs in sandbox mode
   - ☐ Verify all have watermark
   - ☐ Verify no credits consumed
   - ☐ Test various recipe types

2. **Production Testing:**
   - ☐ Switch to production mode (`sandbox: false`)
   - ☐ Generate 2 test PDFs
   - ☐ Verify no watermark
   - ☐ Confirm 2 credits consumed
   - ☐ Print physical copies

3. **User Acceptance Testing:**
   - ☐ 3 beta users generate PDFs
   - ☐ Collect feedback on quality
   - ☐ Test on different devices
   - ☐ Test in different browsers

4. **Error Handling:**
   - ☐ Test with invalid recipe ID
   - ☐ Test with deleted recipe
   - ☐ Test rate limiting (generate 11 PDFs)
   - ☐ Test network interruption

5. **Performance:**
   - ☐ Measure generation time for 10 recipes
   - ☐ Calculate average file size
   - ☐ Test with slow internet connection
   - ☐ Test concurrent requests

---

## 9. Potential Challenges

### 9.1 Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|-----------|
| **Processing Time** (2-8 sec) | User waits for PDF generation | Clear loading indicator, consider async webhooks for large PDFs |
| **Rate Limit** (250/min) | Could be exceeded with many users | Per-user rate limiting, queue system if needed |
| **Credit Costs** | Variable consumption per PDF | Monitor usage, implement user quotas, track spending |
| **No Built-in Caching** | Same recipe generates new PDF each time | Application-level caching with TTL |
| **Page Break Control** | Limited control over pagination | Use CSS `page-break-inside: avoid` strategically |
| **File Size** | Image-heavy recipes can be 5+ MB | Image optimization, consider compression |
| **Font Support** | Limited to web fonts | Use web-safe fonts or embed via @font-face |
| **Authentication Complexity** | Forwarding Clerk cookies is tricky | Use public print URLs with signed tokens instead |

### 9.2 Edge Cases

**1. Recipe with No Ingredients**

**Problem:** Empty ingredient list causes poor PDF layout

**Solution:**
```typescript
if (!recipe.ingredients || recipe.ingredients.length === 0) {
  return NextResponse.json(
    { error: 'Cannot generate PDF for recipe without ingredients' },
    { status: 400 }
  );
}
```

**2. Very Long Recipe Names**

**Problem:** Recipe name overflows header

**Solution:**
```typescript
const truncatedName = recipe.name.length > 60
  ? recipe.name.substring(0, 57) + '...'
  : recipe.name;
```

**3. Special Characters in Filenames**

**Problem:** Characters like `?`, `/`, `:` break downloads

**Solution:**
```typescript
const sanitizedFilename = recipe.name
  .replace(/[^a-z0-9\s-]/gi, '')
  .replace(/\s+/g, '-')
  .toLowerCase();
```

**4. Recipe Deleted During Generation**

**Problem:** Race condition if recipe deleted while PDF generating

**Solution:**
```typescript
// Re-verify recipe exists before returning PDF
const { data: exists } = await supabase
  .from('recipes')
  .select('id')
  .eq('id', recipeId)
  .single();

if (!exists) {
  return NextResponse.json(
    { error: 'Recipe no longer exists' },
    { status: 404 }
  );
}
```

**5. Concurrent Requests for Same Recipe**

**Problem:** Wasteful to generate same PDF multiple times

**Solution:** Implement caching
```typescript
// Simple in-memory cache (5 min TTL)
const pdfCache = new Map<string, { pdf: ArrayBuffer; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

const cacheKey = `recipe-${recipeId}-${recipe.updated_at}`;
const cached = pdfCache.get(cacheKey);

if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  return new NextResponse(cached.pdf, { /* headers */ });
}

// Generate PDF and cache
const pdfBuffer = await generatePDF(config);
pdfCache.set(cacheKey, { pdf: pdfBuffer, timestamp: Date.now() });
```

**6. User Changes Recipe While PDF Generating**

**Problem:** PDF might not reflect latest changes

**Solution:** Include `updated_at` in cache key (see above)

**7. PDFShift Service Outage**

**Problem:** Users can't generate PDFs

**Solution:** Fallback to browser print
```typescript
try {
  return await pdfShiftClient.convert(config);
} catch (error) {
  if (error.statusCode >= 500) {
    return NextResponse.json({
      error: 'PDF service temporarily unavailable',
      userMessage: 'Please use your browser\'s print function as a fallback.',
      fallback: 'browser-print'
    }, { status: 503 });
  }
}
```

### 9.3 Performance Optimization

**1. Optimize Print View**

```typescript
// Remove large hero images
css: `
  .hero-image { display: none !important; }
  img { max-width: 400px; height: auto; }
`
```

**2. Lazy Load Images**

```typescript
{
  source: recipeUrl,
  lazy_load_images: true  // Faster processing
}
```

**3. Reduce Header/Footer Complexity**

```typescript
// Simpler header = faster processing
header: {
  source: '<div style="text-align: center;">{{title}}</div>',
  height: '12mm'
}
```

**4. Implement Caching**

```typescript
// Cache PDFs for 5 minutes to reduce duplicate requests
const cachedPDF = await cache.get(`pdf-${recipeId}-${updated_at}`);
if (cachedPDF) return cachedPDF;
```

### 9.4 Cost Management

**Track Usage:**

```typescript
// Log all PDF generations
await supabase.from('pdf_generations').insert({
  user_id: userId,
  recipe_id: recipeId,
  credits_used: 1,
  processing_time_ms: processTime,
  file_size_bytes: pdfBuffer.byteLength
});

// Weekly usage report
const weeklyCount = await supabase
  .from('pdf_generations')
  .select('*', { count: 'exact' })
  .gte('created_at', weekStart);
```

**Set Budget Alerts:**

```typescript
// Alert if daily usage exceeds threshold
if (dailyCount > 100) {
  await sendAlert('High PDF usage', `${dailyCount} PDFs generated today`);
}
```

**User Quotas:**

```typescript
const QUOTAS = {
  free: 10,      // 10 PDFs/month
  premium: 100,  // 100 PDFs/month
  unlimited: Infinity
};
```

### 9.5 Browser Compatibility

**Known Issues:**

| Browser | Issue | Workaround |
|---------|-------|------------|
| Safari iOS < 13 | Blob downloads don't work | Use `window.open()` with PDF URL |
| IE11 | Not supported | Show "Unsupported browser" message |
| Firefox Private | Download blocked | Instruct user to allow downloads |

**Safari iOS Fix:**

```typescript
// Detect Safari iOS
const isIOSSafari = /iP(ad|hone|od).+Version\/[\d\.]+.*Safari/i.test(navigator.userAgent);

if (isIOSSafari) {
  // Open PDF in new tab instead of download
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
} else {
  // Standard download
  link.download = filename;
  link.click();
}
```

---

## 10. Implementation Checklist

### 10.1 Phase 1: MVP (4-6 hours)

**Priority: MUST HAVE**

#### Environment Setup (30 minutes)
- ☐ Verify `PDF_SHIFT_API_KEY` exists in Vercel environment variables
- ☐ Add `PDF_SHIFT_API_KEY` to `.env.local` for local development
- ☐ Add `NEXT_PUBLIC_BASE_URL` to environment variables
- ☐ Test API key with sandbox request (curl or Postman)
- ☐ Verify `.env.local` is in `.gitignore`

#### Create Library Files (1 hour)
- ☐ Create `lib/pdf/pdfshift-client.ts`
  - Export `PDFShiftClient` class
  - Export `PDFShiftError` class
  - Export singleton `pdfShiftClient` instance
- ☐ Create `lib/pdf/config.ts`
  - Export `DEFAULT_RECIPE_PDF_CONFIG`
  - Export `getRecipeHeaderFooter()` function
- ☐ Create `lib/pdf/errors.ts`
  - Error handling utilities
  - User-friendly error messages

#### Build Print View (1.5 hours)
- ☐ Create `app/recipes/[id]/print/page.tsx`
- ☐ Fetch recipe data from Supabase
- ☐ Render clean HTML layout
- ☐ Add print-optimized CSS
  - No navigation, no UI chrome
  - Page break controls
  - Web-safe fonts
- ☐ Test rendering in browser
- ☐ Verify special characters display correctly

#### Create API Endpoint (1.5 hours)
- ☐ Create `app/api/recipes/[id]/pdf/route.ts`
- ☐ Implement GET handler
- ☐ Add Clerk authentication check
- ☐ Add Supabase recipe ownership validation
- ☐ Implement PDFShift API call
- ☐ Add error handling with try/catch
- ☐ Return PDF with correct headers
- ☐ Test with Postman/Thunder Client

#### Build Frontend Component (1 hour)
- ☐ Create `components/recipes/print-recipe-button.tsx`
- ☐ Implement loading state
- ☐ Implement download logic
- ☐ Add toast notifications (using sonner)
- ☐ Add error handling with retry option
- ☐ Test in development

#### Integrate into UI (30 minutes)
- ☐ Update `app/(dashboard)/recipes/[id]/page.tsx`
- ☐ Import `PrintRecipeButton` component
- ☐ Add button to actions section
- ☐ Test on desktop browser
- ☐ Test on mobile browser
- ☐ Verify responsive layout

#### Initial Testing (30 minutes)
- ☐ Generate PDF for simple recipe
- ☐ Generate PDF for complex recipe
- ☐ Verify sandbox watermark appears
- ☐ Verify no credits consumed in sandbox
- ☐ Test error scenarios (invalid ID, unauthenticated)
- ☐ Verify PDF opens in Adobe Reader
- ☐ Print physical copy to verify quality

### 10.2 Phase 2: Enhancement (3-4 hours)

**Priority: SHOULD HAVE**

#### Rate Limiting (1 hour)
- ☐ Create `lib/pdf/rate-limit.ts`
- ☐ Create `pdf_generations` table in Supabase
- ☐ Implement `checkPDFRateLimit()` function
- ☐ Apply rate limiting in API route
- ☐ Add rate limit headers to response
- ☐ Display rate limit warning to users
- ☐ Test with 11 consecutive requests

#### Caching (1 hour)
- ☐ Choose caching solution (Redis/Upstash or in-memory)
- ☐ Implement PDF caching with TTL (5 minutes)
- ☐ Include `updated_at` in cache key
- ☐ Add cache hit/miss logging
- ☐ Test cache effectiveness
- ☐ Implement cache invalidation on recipe update

#### Usage Tracking (1 hour)
- ☐ Extend `pdf_generations` table schema
- ☐ Track credits used per generation
- ☐ Track file size per generation
- ☐ Track processing time per generation
- ☐ Create admin dashboard for monitoring
- ☐ Set up alerts for unusual patterns
- ☐ Create weekly usage reports

#### Polish & Refinement (1 hour)
- ☐ Add user quota system (free/premium tiers)
- ☐ Display PDF quota to users
- ☐ Improve error messages
- ☐ Add retry logic with exponential backoff
- ☐ Optimize header/footer templates
- ☐ Add analytics tracking (Plausible/PostHog)

### 10.3 Phase 3: Advanced Features (4-6 hours)

**Priority: NICE TO HAVE**

#### Async PDF Generation (2 hours)
- ☐ Create webhook endpoint (`/api/webhooks/pdf-complete`)
- ☐ Implement job queue (BullMQ or similar)
- ☐ Store job ID in database
- ☐ Update API route to use webhooks for large PDFs
- ☐ Implement polling for job status
- ☐ Send email notification on completion
- ☐ Test async flow end-to-end

#### Amazon S3 Integration (2 hours)
- ☐ Create S3 bucket for PDF storage
- ☐ Configure IAM policy for PDFShift
- ☐ Update API route to save directly to S3
- ☐ Create "My PDFs" library feature
- ☐ Implement PDF retrieval from S3
- ☐ Add PDF deletion functionality
- ☐ Test S3 integration

#### Batch Export Features (2 hours)
- ☐ Design cookbook PDF (multiple recipes)
- ☐ Implement meal plan PDF export
- ☐ Implement shopping list PDF export
- ☐ Add "Export All" button to recipe list
- ☐ Show progress indicator for batch exports
- ☐ Test with 10+ recipes

### 10.4 Deployment Checklist

**Before Production Deploy:**

- ☐ Switch `sandbox: false` in production config
- ☐ Test 2 PDFs in production mode (consume 2 credits)
- ☐ Verify no watermark in production
- ☐ Confirm rate limiting works
- ☐ Verify error handling works
- ☐ Test on production URL
- ☐ Check API key is set in Vercel
- ☐ Monitor first 10 production PDF generations
- ☐ Set up error alerting (Sentry or similar)
- ☐ Document for team in README

**Post-Deploy Monitoring:**

- ☐ Monitor credit usage daily for first week
- ☐ Track average generation time
- ☐ Track error rate
- ☐ Collect user feedback
- ☐ Optimize based on real usage patterns

### 10.5 Dependencies

**Required (Already Installed):**
- ✅ Next.js 15
- ✅ TypeScript
- ✅ Clerk (authentication)
- ✅ Supabase (database)
- ✅ shadcn/ui components
- ✅ Sonner (toast notifications)

**Optional (Future Phases):**
- ⏳ Redis/Upstash (caching - Phase 2)
- ⏳ BullMQ (job queue - Phase 3)
- ⏳ AWS SDK (S3 integration - Phase 3)
- ⏳ Resend/SendGrid (email notifications - Phase 3)

### 10.6 Rollout Strategy

**Week 1: Internal Testing**
- Deploy to staging environment
- Test with team members (5-10 PDFs each)
- Collect feedback and iterate
- Fix any critical bugs

**Week 2: Beta Release**
- Deploy to production
- Enable for 10-20 beta users
- Monitor usage and errors closely
- Optimize based on feedback

**Week 3: General Availability**
- Announce feature to all users
- Monitor credit usage
- Track user adoption rate
- Gather user testimonials

**Week 4+: Optimization**
- Analyze usage patterns
- Implement caching if needed
- Consider advanced features
- Plan Phase 2 enhancements

---

## Appendix A: Quick Reference

### API Credentials
```env
PDF_SHIFT_API_KEY=sk_xxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=https://www.platewise.xyz
```

### Key Files to Create
```
lib/pdf/pdfshift-client.ts
lib/pdf/config.ts
app/api/recipes/[id]/pdf/route.ts
app/recipes/[id]/print/page.tsx
components/recipes/print-recipe-button.tsx
```

### Essential Configuration
```typescript
{
  source: "https://www.platewise.xyz/recipes/[id]/print",
  sandbox: false,  // true for development
  format: "A4",
  margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
  use_print: true
}
```

### Common Commands
```bash
# Test API key
curl -X POST https://api.pdfshift.io/v3/convert/pdf \
  -H "X-API-Key: sk_xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"source":"<html><body>Test</body></html>","sandbox":true}'

# Run development server
npm run dev

# Build for production
npm run build
```

---

## Appendix B: Support Resources

### PDFShift Documentation
- Main Docs: https://docs.pdfshift.io/
- API Reference: https://docs.pdfshift.io/#convert
- Dashboard: https://app.pdfshift.io/dashboard/

### Contact & Support
- PDFShift Support: support@pdfshift.io
- Documentation Issues: Refer to docs.pdfshift.io

### Platewise Integration
- Repository: C:\Users\bryn\Documents\recipeapp
- Environment: Vercel
- Database: Supabase
- Auth: Clerk

---

## Document Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-13 | Research Agent | Initial comprehensive implementation guide |

---

**End of Document**

This implementation guide provides everything needed to successfully integrate PDFShift PDF generation into the Platewise recipe application. For questions or clarifications, refer to the PDFShift documentation or consult with the development team.

**Estimated Total Implementation Time:**
- **MVP:** 4-6 hours
- **Enhanced:** +3-4 hours
- **Advanced:** +4-6 hours

**Next Steps:** Begin with Phase 1 (MVP) implementation following the checklist in Section 10.1.
