# 🎨 Dark/Light Theme System Documentation

## Overview

This project includes a professional dark/light theme toggle system with:
- **Dark mode as default** (sophisticated, modern)
- **Light mode toggle option** (user preference)
- **Black/Grey/White palette** (classic, professional)
- **Smooth transitions** (200ms ease)
- **Persistent user preference** (localStorage)
- **No flash on load** (SSR-compatible)

---

## Color Palette

### Dark Mode (Default)

```css
--background: #0a0a0a      /* Rich black - softer than pure black */
--foreground: #fafafa      /* Soft white - easy on eyes */
--card: #171717            /* Elevated dark grey */
--border: #262626          /* Subtle separation */
--muted-foreground: #a1a1a1 /* Medium grey for secondary text */
--primary: #fafafa         /* Soft white for CTAs */
--primary-foreground: #171717 /* Dark for button text */
```

### Light Mode

```css
--background: #fafafa      /* Soft white - not harsh */
--foreground: #0a0a0a      /* Rich black */
--card: #ffffff            /* Pure white cards */
--border: #e5e5e5          /* Subtle grey */
--muted-foreground: #737373 /* Medium grey for secondary text */
--primary: #171717         /* Dark for CTAs */
--primary-foreground: #fafafa /* Light for button text */
```

**Design Philosophy:**
- No pure black (#000) or pure white (#fff) backgrounds (reduces eye strain)
- Subtle grey scale creates professional depth
- High contrast maintains accessibility (WCAG AA)
- Modern SaaS aesthetic (inspired by Vercel, Linear, Stripe)

---

## Implementation

### 1. Theme Provider

**File:** `frontend/src/components/theme-provider.tsx`

```typescript
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type ThemeProviderProps = {
  children: React.ReactNode
  [key: string]: unknown
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
```

**Key Settings:**
- `attribute="class"` - Adds `.dark` class to `<html>` tag
- `defaultTheme="dark"` - Dark mode by default
- `enableSystem={false}` - Manual toggle only (no OS sync)
- `disableTransitionOnChange={false}` - Smooth 200ms transitions

### 2. Theme Toggle Component

**File:** `frontend/src/components/ThemeToggle.tsx`

```typescript
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="sr-only">Switch to light mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="sr-only">Switch to dark mode</span>
        </>
      )}
    </Button>
  )
}
```

**Features:**
- Sun icon in dark mode (click to go light)
- Moon icon in light mode (click to go dark)
- Prevents hydration mismatch with `mounted` check
- Accessible (screen reader labels)

### 3. Root Layout Integration

**File:** `frontend/src/app/layout.tsx`

```typescript
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ThemeToggle"

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <header className="border-b">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
              <Link href="/">App Name</Link>
              <nav className="flex items-center gap-2">
                <ThemeToggle />
                {/* Other nav items */}
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Key Points:**
- `suppressHydrationWarning` prevents Next.js warning about theme class
- ThemeProvider wraps entire app
- ThemeToggle placed in header for easy access

### 4. Color System (globals.css)

**File:** `frontend/src/app/globals.css`

```css
@import "tailwindcss";

:root {
  --radius: 0.625rem;

  /* Light Mode Colors - Soft, Professional */
  --background: 0 0% 98%;           /* #fafafa */
  --foreground: 0 0% 4%;            /* #0a0a0a */
  --card: 0 0% 100%;                /* #ffffff */
  --card-foreground: 0 0% 4%;       /* #0a0a0a */
  --primary: 0 0% 9%;               /* #171717 */
  --primary-foreground: 0 0% 98%;   /* #fafafa */
  --border: 0 0% 90%;               /* #e5e5e5 */
  --muted-foreground: 0 0% 45%;     /* #737373 */
}

.dark {
  /* Dark Mode Colors - Rich, Sophisticated */
  --background: 0 0% 4%;            /* #0a0a0a */
  --foreground: 0 0% 98%;           /* #fafafa */
  --card: 0 0% 9%;                  /* #171717 */
  --card-foreground: 0 0% 98%;      /* #fafafa */
  --primary: 0 0% 98%;              /* #fafafa */
  --primary-foreground: 0 0% 9%;    /* #171717 */
  --border: 0 0% 15%;               /* #262626 */
  --muted-foreground: 0 0% 63%;     /* #a1a1a1 */
}

/* Smooth transitions for theme changes */
*,
*::before,
*::after {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
```

**Format:** HSL without `hsl()` wrapper (Tailwind v4 requirement)
**Transitions:** All color properties animate smoothly on theme change

---

## Dependencies

### Package Required

```json
{
  "dependencies": {
    "next-themes": "^0.4.4"
  }
}
```

**Installation:**
```bash
npm install next-themes
```

---

## Usage in Components

### Reading Current Theme

```typescript
"use client"

import { useTheme } from "next-themes"

export function MyComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      Current theme: {theme}
      <button onClick={() => setTheme("dark")}>Dark</button>
      <button onClick={() => setTheme("light")}>Light</button>
    </div>
  )
}
```

### Using Theme Colors in Components

All shadcn/ui components automatically adapt to the theme using CSS variables:

```tsx
<Card className="bg-card text-card-foreground border-border">
  <Button className="bg-primary text-primary-foreground">
    Click me
  </Button>
</Card>
```

**Available Color Variables:**
- `bg-background` / `text-foreground`
- `bg-card` / `text-card-foreground`
- `bg-primary` / `text-primary-foreground`
- `bg-secondary` / `text-secondary-foreground`
- `bg-muted` / `text-muted-foreground`
- `bg-accent` / `text-accent-foreground`
- `border-border`
- `ring-ring`

---

## Customization

### Changing Default Theme

Edit `frontend/src/components/theme-provider.tsx`:

```typescript
<NextThemesProvider
  defaultTheme="light"  // Change to "light"
  ...
>
```

### Adding System Theme Support

Enable OS theme detection:

```typescript
<NextThemesProvider
  enableSystem={true}  // Now respects OS preference
  ...
>
```

### Changing Colors

Edit `frontend/src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;  /* Pure white instead of #fafafa */
  --primary: 220 100% 50%;  /* Blue instead of grey */
}

.dark {
  --background: 0 0% 0%;    /* Pure black instead of #0a0a0a */
}
```

**Format:** `hue saturation% lightness%`
- Hue: 0-360 (0=red, 120=green, 240=blue)
- Saturation: 0-100% (0=grey, 100=vivid)
- Lightness: 0-100% (0=black, 100=white)

**Pro Tip:** Keep saturation at 0% for true black/white/grey palette.

### Adding More Themes

Extend beyond dark/light:

```typescript
<NextThemesProvider
  themes={["light", "dark", "cream"]}
  defaultTheme="dark"
>
```

Then add CSS:

```css
.cream {
  --background: 40 20% 96%;   /* Warm cream */
  --foreground: 30 10% 20%;   /* Warm dark */
  /* ... other colors */
}
```

---

## Testing

### Local Testing

```bash
cd frontend
npm run dev
```

1. Visit http://localhost:3000
2. Click the sun/moon icon in header
3. Verify smooth theme transition
4. Refresh page - theme should persist
5. Check all pages (login, signup, homepage)

### Production Testing

After deploying to Vercel:

1. Test theme toggle works
2. Verify no flash on initial load
3. Check theme persists after navigation
4. Test in incognito (should default to dark)
5. Clear localStorage and reload (should default to dark)

---

## Troubleshooting

### Theme Not Persisting

**Issue:** Theme resets on page reload

**Solution:** Ensure ThemeProvider wraps all content:
```tsx
<html>
  <body>
    <ThemeProvider>  {/* Must wrap everything */}
      {children}
    </ThemeProvider>
  </body>
</html>
```

### Flash of Wrong Theme (FOUT)

**Issue:** Light flash before dark mode loads

**Solution:** Add `suppressHydrationWarning` to `<html>`:
```tsx
<html lang="en" suppressHydrationWarning>
```

### Theme Not Changing

**Issue:** Colors don't change when toggling

**Solution:** Verify CSS variables use `hsl(var(--color))`:
```css
/* ❌ Wrong */
background: var(--background);

/* ✅ Correct */
background: hsl(var(--background));
```

### Icons Not Showing

**Issue:** Sun/Moon icons missing

**Solution:** Ensure `lucide-react` is installed:
```bash
npm install lucide-react
```

---

## Files Added/Modified

### New Files (3)
1. `frontend/src/components/theme-provider.tsx` - Theme context
2. `frontend/src/components/ThemeToggle.tsx` - Toggle UI
3. `THEME_SYSTEM_DOCUMENTATION.md` - This file

### Modified Files (2)
1. `frontend/src/app/globals.css` - Color system
2. `frontend/src/app/layout.tsx` - Provider integration

### Dependencies Added (1)
- `next-themes` (^0.4.4)

---

## Best Practices

### 1. Always Use CSS Variables

```tsx
// ✅ Good - Adapts to theme
<div className="bg-background text-foreground">

// ❌ Bad - Hard-coded color
<div className="bg-white text-black">
```

### 2. Test Both Themes

Always check:
- Text is readable (sufficient contrast)
- Borders are visible
- Buttons stand out
- Forms are accessible

### 3. Provide Accessible Labels

```tsx
// ✅ Good
<button aria-label="Toggle dark/light mode">
  <Sun />
</button>

// ❌ Bad
<button>
  <Sun />
</button>
```

### 4. Handle Client Components Carefully

Theme state is client-side only:

```tsx
"use client"  // Required for useTheme()

import { useTheme } from "next-themes"
```

---

## Future Enhancements

Potential improvements:

1. **System Theme Sync** - Match OS preference
2. **More Themes** - Add "cream", "midnight", etc.
3. **Color Customizer** - Let users pick accent colors
4. **Keyboard Shortcut** - `Cmd+Shift+L` to toggle
5. **Reduced Motion** - Respect `prefers-reduced-motion`
6. **Theme Previews** - Show color swatches before switching

---

**Version:** 1.0.0
**Date:** 2025-10-04
**Stack:** Next.js 15.5.4, next-themes 0.4.4, Tailwind v4.1.14
