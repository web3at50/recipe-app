# PlateWise Brand Design Tokens

> Complete brand design system for the PlateWise recipe application. Use these tokens to maintain consistency across projects.

---

## Color System

### Primary Brand Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Primary | `#F7931E` | `#FFB366` | Main brand color, appetite-stimulating orange |
| Primary Foreground | `#ffffff` | `#121212` | Text on primary background |
| Secondary | `#4CAF50` | `#81C784` | Success, health, fresh elements |
| Secondary Foreground | `#ffffff` | `#121212` | Text on secondary background |
| Tertiary | `#FF6B35` | - | Coral-orange accent |

### Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Success | `#4CAF50` | `#66BB6A` | Success states, confirmations |
| Warning | `#FFA726` | `#FFB74D` | Warnings, cautions |
| Error/Destructive | `#EF5350` | `#EF5350` | Errors, destructive actions, allergen alerts |
| Info | `#42A5F5` | `#64B5F6` | Informational messages |

### Background Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Background | `#fafafa` | `#121212` | Main app background |
| Foreground | `#1A1A1A` | `#fafafa` | Main text color |
| Card | `#ffffff` | `#1E1E1E` | Card/panel backgrounds |
| Card Foreground | `#1A1A1A` | `#fafafa` | Text on cards |
| Accent | `#FAEBD7` | `#3E3E3E` | Subtle accent backgrounds |
| Accent Foreground | `#1A1A1A` | `#fafafa` | Text on accent backgrounds |
| Muted | `#f5f5f5` | `#2C2C2C` | Muted backgrounds |
| Muted Foreground | `#737373` | `#a1a1a1` | Muted/secondary text |

### UI Element Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Border | `#E8D8C8` | `#3E3E3E` | Default border color |
| Input | `#E8D8C8` | `#3E3E3E` | Input field borders |
| Ring | `#F7931E` | `#FFB366` | Focus ring color |

---

## Extended Color Palette

### Tailwind Colors Used in Components

**Orange Shades:**
- `orange-100` - Light backgrounds
- `orange-500` - Standard accent
- `orange-900` - Dark text variant

**Green Shades:**
- `green-500` - Success indicator
- `green-600` - Strong success, fresh category
- `green-500/10` - Subtle green background (10% opacity)
- `green-500/20` - Semi-transparent (20% opacity)

**Blue Shades:**
- `blue-100` - Light backgrounds
- `blue-500` - Info/action indicator
- `blue-600` - Stronger emphasis
- `blue-900` - Dark text variant
- `blue-500/10` - Subtle blue background (10% opacity)

**Red Shades:**
- `red-500` - Error/allergen warnings
- `red-600` - Strong error
- `red-500/10` - Subtle error background (10% opacity)
- `red-500/20` - Semi-transparent (20% opacity)

**Additional Accent Colors:**
- `yellow-400` - Gradient accent
- `yellow-500` - Oil/fat category
- `pink-400` - Gradient accent
- `pink-500` - Baking category
- `purple-900` - Dark text variant
- `amber-500` - Allergen warning
- `amber-600` - Tinned/dried category

**Neutral Shades:**
- `slate-200` - Light neutral
- `slate-400` - Medium neutral
- `slate-500` - Medium-dark neutral
- `slate-600` - Dark neutral

---

## Category-Specific Colors

### Recipe Cuisine Gradients

| Cuisine | Gradient Classes | Emoji |
|---------|-----------------|-------|
| British | `from-red-500 via-blue-500 to-slate-200` | 🇬🇧 |
| Italian | `from-green-600 via-white to-red-600` | 🍝 |
| Indian | `from-orange-500 via-yellow-400 to-green-500` | 🍛 |
| Chinese | `from-red-600 via-yellow-500 to-red-700` | 🥡 |
| Mexican | `from-green-600 via-white to-red-600` | 🌮 |
| Thai | `from-purple-500 via-pink-400 to-yellow-400` | 🍜 |
| French | `from-blue-600 via-white to-red-600` | 🥐 |
| Greek | `from-blue-500 via-white to-blue-400` | 🫒 |
| Spanish | `from-yellow-500 via-red-600 to-yellow-500` | 🥘 |
| Japanese | `from-red-600 via-white to-red-600` | 🍱 |
| Middle Eastern | `from-amber-600 via-yellow-500 to-amber-700` | 🧆 |
| American | `from-blue-600 via-red-600 to-white` | 🍔 |
| Caribbean | `from-green-500 via-yellow-400 to-red-500` | 🌴 |
| Default | `from-slate-600 via-slate-500 to-slate-400` | 🍽️ |

### Pantry Category Colors

| Category | Color | Usage |
|----------|-------|-------|
| Oils & Fats | `text-yellow-500` | Cooking oils, butter, etc. |
| Seasonings | `text-red-500` | Salt, pepper, seasonings |
| Herbs & Spices | `text-green-500` | Fresh and dried herbs |
| Baking | `text-pink-500` | Flour, baking powder, etc. |
| Vinegars & Acids | `text-blue-500` | Vinegars, lemon juice, etc. |
| Condiments | `text-orange-500` | Sauces, mustard, etc. |
| Tinned & Dried | `text-amber-600` | Canned goods, dried foods |
| Fresh Staples | `text-green-600` | Fresh produce staples |

---

## Typography

### Font Families

```css
/* Primary Fonts */
--font-heading: Lora          /* Serif for headings */
--font-body: Poppins          /* Sans-serif for body text */
--font-sans: Poppins          /* Default sans-serif */
--font-mono: Geist Mono       /* Monospace for code */
```

### Font Weights & Usage

**Lora (Headings)**
- `400` - Regular
- `600` - Semi-bold
- `700` - Bold (default for h1-h6)

**Poppins (Body)**
- `400` - Regular (body text)
- `500` - Medium (emphasis)
- `600` - Semi-bold (strong emphasis)
- `700` - Bold (very strong emphasis)

**Geist Sans**
- Default weight for general UI elements

**Geist Mono**
- Default weight for code/technical display

### Typography Hierarchy

```
h1-h6: Lora Bold (700)
Body text: Poppins Regular (400)
Emphasis: Poppins Medium (500)
Strong emphasis: Poppins Semi-bold (600)
Code/Technical: Geist Mono
```

### Google Fonts Import

```html
<!-- Add to your <head> or import in CSS -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Or via CSS import:
```css
@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap');
```

---

## Border Radius

```css
--radius: 0.625rem;           /* 10px - Base radius */
--radius-sm: 0.375rem;        /* 6px - Small radius (--radius - 0.25rem) */
--radius-md: 0.625rem;        /* 10px - Medium radius (same as base) */
--radius-lg: 0.875rem;        /* 14px - Large radius (--radius + 0.25rem) */
```

**Usage:**
- Small: Badges, tags, small buttons
- Medium: Standard buttons, inputs, cards
- Large: Modals, large panels, hero sections

---

## Spacing Scale

Following Tailwind's default spacing scale (based on 0.25rem = 4px):

```
1 = 0.25rem (4px)
2 = 0.5rem (8px)
3 = 0.75rem (12px)
4 = 1rem (16px)
6 = 1.5rem (24px)
8 = 2rem (32px)
```

---

## CSS Variables Reference

### Complete Light Mode Variables

```css
:root {
  --background: 0 0% 98%;                    /* #fafafa */
  --foreground: 0 0% 10%;                    /* #1A1A1A */
  --card: 0 0% 100%;                         /* #ffffff */
  --card-foreground: 0 0% 10%;               /* #1A1A1A */
  --primary: 26 92% 54%;                     /* #F7931E */
  --primary-foreground: 0 0% 100%;           /* #ffffff */
  --secondary: 122 39% 49%;                  /* #4CAF50 */
  --secondary-foreground: 0 0% 100%;         /* #ffffff */
  --tertiary: 14 100% 60%;                   /* #FF6B35 */
  --accent: 36 100% 93%;                     /* #FAEBD7 */
  --accent-foreground: 0 0% 10%;             /* #1A1A1A */
  --muted: 0 0% 96%;                         /* #f5f5f5 */
  --muted-foreground: 0 0% 45%;              /* #737373 */
  --destructive: 4 90% 58%;                  /* #EF5350 */
  --destructive-foreground: 0 0% 100%;       /* #ffffff */
  --border: 30 15% 90%;                      /* #E8D8C8 */
  --input: 30 15% 90%;                       /* #E8D8C8 */
  --ring: 26 92% 54%;                        /* #F7931E */
  --success: 122 39% 49%;                    /* #4CAF50 */
  --warning: 28 98% 58%;                     /* #FFA726 */
  --info: 207 82% 62%;                       /* #42A5F5 */
  --radius: 0.625rem;
}
```

### Complete Dark Mode Variables

```css
.dark {
  --background: 0 0% 7%;                     /* #121212 */
  --foreground: 0 0% 98%;                    /* #fafafa */
  --card: 0 0% 12%;                          /* #1E1E1E */
  --card-foreground: 0 0% 98%;               /* #fafafa */
  --primary: 26 100% 70%;                    /* #FFB366 */
  --primary-foreground: 0 0% 7%;             /* #121212 */
  --secondary: 122 39% 65%;                  /* #81C784 */
  --secondary-foreground: 0 0% 7%;           /* #121212 */
  --accent: 0 0% 24%;                        /* #3E3E3E */
  --accent-foreground: 0 0% 98%;             /* #fafafa */
  --muted: 0 0% 17%;                         /* #2C2C2C */
  --muted-foreground: 0 0% 63%;              /* #a1a1a1 */
  --destructive: 4 90% 58%;                  /* #EF5350 */
  --destructive-foreground: 0 0% 98%;        /* #fafafa */
  --border: 0 0% 24%;                        /* #3E3E3E */
  --input: 0 0% 24%;                         /* #3E3E3E */
  --ring: 26 100% 70%;                       /* #FFB366 */
  --success: 122 42% 60%;                    /* #66BB6A */
  --warning: 28 98% 65%;                     /* #FFB74D */
  --info: 207 82% 70%;                       /* #64B5F6 */
}
```

---

## Component Variants

### Button Variants

```
default     → bg-primary, text-primary-foreground, hover:bg-primary/90
destructive → bg-destructive, text-white, hover:bg-destructive/90
outline     → border, bg-background, hover:bg-accent
secondary   → bg-secondary, text-secondary-foreground, hover:bg-secondary/80
ghost       → transparent, hover:bg-accent, hover:text-accent-foreground
link        → text-primary, underline-offset-4, hover:underline
```

### Badge Variants

```
default     → border-transparent, bg-primary, text-primary-foreground
secondary   → border-transparent, bg-secondary, text-secondary-foreground
destructive → border-transparent, bg-destructive, text-destructive-foreground
outline     → text-foreground
```

---

## Design Philosophy

**Brand Identity:**
- Warm, appetite-stimulating color palette
- Food-inspired hues (orange, green, coral)
- Welcoming and approachable aesthetic

**Accessibility:**
- High contrast ratios for readability
- Clear semantic color meanings
- Adjusted colors for dark mode visibility

**Visual Hierarchy:**
- Serif headings (Lora) for elegance and distinction
- Sans-serif body (Poppins) for modern readability
- Consistent spacing and border radius for cohesion

**Color Strategy:**
- Primary orange evokes warmth and appetite
- Green represents health and freshness
- Semantic colors provide clear user feedback
- Category-specific colors aid quick recognition

---

## Source Files

| File | Purpose |
|------|---------|
| `frontend/src/app/globals.css` | CSS variables and theme definitions |
| `frontend/src/app/layout.tsx` | Font family imports |
| `frontend/src/components/ui/button.tsx` | Button component variants |
| `frontend/src/components/ui/badge.tsx` | Badge component variants |
| `frontend/src/components/recipes/recipe-card.tsx` | Cuisine gradient definitions |
| `frontend/src/components/pantry/pantry-onboarding.tsx` | Pantry category colors |

---

## Quick Reference Card

**Brand Colors (Hex):**
```
Primary:     #F7931E (Orange)
Secondary:   #4CAF50 (Green)
Tertiary:    #FF6B35 (Coral)
Success:     #4CAF50 (Green)
Warning:     #FFA726 (Amber)
Error:       #EF5350 (Red)
Info:        #42A5F5 (Blue)
```

**Fonts:**
```
Headings:    Lora (Serif) - Bold (700)
Body:        Poppins (Sans) - Regular (400)
Code:        Geist Mono
```

**Border Radius:**
```
Small:   6px
Medium:  10px
Large:   14px
```

---

*Last Updated: 2025*
*PlateWise Recipe Application Design System*
