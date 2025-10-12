# Pantry Items Feature - UI/UX Enhancement Recommendations

**Date**: December 10, 2025
**Designer**: Senior Product Designer & UI/UX Specialist
**Project**: Recipe App - UK-Focused Meal Planning Platform
**Based on**: Technical Audit by Agent 1 (current-setup.md)

---

## Executive Summary

**Recommended Solution**: Option 2 - "Smart Pantry Management System" (3-4 week implementation)

After reviewing Agent 1's comprehensive technical audit and conducting research into UK pantry standards and competitive meal planning apps, I recommend implementing a **checkbox-based onboarding system** with **intelligent override controls** and **simplified pre-auth support**. This solution fixes all critical bugs while providing a solid, maintainable foundation that won't need immediate enhancement.

**Key Innovation**: Instead of complex exclusion tables or confusing UI states, we introduce a **three-state system** (Hide Always, Show Always, Auto-Detect) with clear visual indicators and a dedicated Pantry Management interface accessible from Settings.

**Why This Works**:
1. Solves the #1 critical bug: Users CAN override default rules
2. Provides discoverability: Users can see and manage their pantry list
3. Pre-auth users get valuable feature preview without full database functionality
4. Simple mental model: "I control what's hidden, system provides smart suggestions"
5. UK-focused: Based on actual British pantry staples research

---

## Problems Summary

Based on Agent 1's audit, the current implementation has these critical issues:

### Critical Bugs (Must Fix)
1. **One-Way Door Problem**: Users cannot override default pantry detection rules. If system hides "salt" by default, user cannot force it to show even when they need to buy salt that week.
2. **Zero Visibility**: No UI exists to view or manage the list of custom pantry staples users have marked.
3. **Confusing Labels**: Three-dot menu shows "Always hide this item" even for items already hidden by default rules.
4. **Pre-Auth Exclusion**: Playground users have ZERO pantry functionality, preventing feature discovery before signup.

### User Impact
- **Frustration**: "I need to buy salt but it won't appear in Shopping Mode"
- **No Control**: "I marked 20 items as 'always hide' but can't remember which ones"
- **Poor Pre-Auth Experience**: Trial users see cluttered shopping lists with "2tsp salt", "1tsp pepper", etc.
- **Lack of Clarity**: "The menu says 'hide' but it's already hidden - what does this do?"

---

## Recommended Solution Overview

**Option 2: Smart Pantry Management System**

A comprehensive redesign that:
1. Introduces **checkbox-based onboarding** with 45 curated UK pantry staples
2. Implements **three-state system** (Hide Always, Show Always, Auto-Detect)
3. Creates a **dedicated Pantry Management page** in Settings
4. Adds **visual indicators** throughout the shopping list interface
5. Provides **limited pre-auth support** using sessionStorage
6. Includes **contextual help** and smart suggestions

**Timeline**: 3-4 weeks
**Complexity**: Medium
**Longevity**: Will stand strong for 6-12 months without major enhancement

---

## Design Options

### Option 1: Quick Win (Low Complexity)

**Goal**: Fix critical bugs with minimal redesign
**Timeline**: 1-2 weeks implementation
**Complexity**: Low

#### What It Solves
- ✅ Override mechanism for default rules
- ✅ Fixes three-dot menu labels
- ⚠️ Partial improvement to discoverability

#### What It Doesn't Solve
- ❌ No onboarding flow for first-time users
- ❌ No dedicated management UI (just improvements to existing menu)
- ❌ No pre-auth support
- ❌ No visual indicators for pantry items
- ❌ Limited long-term scalability

#### Key Features

**1. Add Exclusions Table to Database**
```sql
CREATE TABLE user_pantry_exclusions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_pattern TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, item_pattern)
);
```

**2. Update Detection Logic**
```typescript
function isPantryStaple(item, userStaples, userExclusions): boolean {
  // FIRST: Check exclusions (force show)
  if (userExclusions.some(ex => itemName.includes(ex.item_pattern))) {
    return false; // Force show even if matches default rules
  }

  // SECOND: Check custom staples
  if (userStaples.some(s => itemName.includes(s.item_pattern))) {
    return true; // Force hide
  }

  // THIRD: Check default rules
  return matchesDefaultRules(item);
}
```

**3. Improve Three-Dot Menu**
```
Current state-aware menu:

If item is in exclusions list:
  ✓ "Stop showing this item" (removes from exclusions)

If item is in custom staples:
  "Always show this item" (removes from custom staples)

If item matches default rules but not in either list:
  "Always show this item" (adds to exclusions)
  "Keep hidden" (no action)

If item doesn't match any rules:
  "Always hide this item" (adds to custom staples)
```

**4. Add Simple Management Modal**
- Accessible from Shopping List page (gear icon)
- Two tabs: "Always Hide" and "Always Show"
- List view with delete buttons
- No search, no categories, no bulk actions

#### Wireframe Descriptions

**Enhanced Three-Dot Menu**
```
Three-dot menu (context-aware):

When salt (hidden by default rule) is clicked:
┌─────────────────────────────────────┐
│ ○ Edit quantity                     │
│ ◉ Always show this item      [Eye]  │  ← NEW: Override default
│ ○ Delete item                [Bin]  │
└─────────────────────────────────────┘

When chicken breast (not hidden) is clicked:
┌─────────────────────────────────────┐
│ ○ Edit quantity                     │
│ ◉ Always hide this item   [EyeOff]  │  ← Standard hide option
│ ○ Delete item                [Bin]  │
└─────────────────────────────────────┘

When butter (custom hidden) is clicked:
┌─────────────────────────────────────┐
│ ○ Edit quantity                     │
│ ◉ Stop hiding this item      [Eye]  │  ← Remove from custom list
│ ○ Delete item                [Bin]  │
└─────────────────────────────────────┘
```

**Simple Management Modal**
```
Accessed from gear icon next to Shopping Mode toggle

┌──────────────────── Pantry Settings ────────────────────┐
│                                                          │
│  Tabs: [ Always Hide ] [ Always Show ]                  │
│                                                          │
│  Always Hide (5 items)                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Olive oil                              [X Remove] │  │
│  │  Chicken breast                         [X Remove] │  │
│  │  Garlic                                 [X Remove] │  │
│  │  Onions                                 [X Remove] │  │
│  │  Dried oregano                          [X Remove] │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Always Show (2 items)                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Salt                                   [X Remove] │  │
│  │  Black pepper                           [X Remove] │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│                                     [Close]              │
└──────────────────────────────────────────────────────────┘
```

#### Pros & Cons

**Pros**:
- Quick to implement (1-2 weeks)
- Solves critical override bug immediately
- Minimal database changes (one new table)
- Low risk of breaking existing functionality
- Users regain control over their shopping lists

**Cons**:
- No first-time user onboarding (users must discover feature)
- Management UI is bare-bones (no search, categories, or bulk actions)
- No pre-auth support (still zero functionality for trial users)
- Two separate lists (custom hide + exclusions) may confuse some users
- Will likely need enhancement within 2-3 months as users request more features
- Doesn't showcase the app's potential to new users

#### Implementation Complexity: **Low**

**Backend** (2-3 days):
- Create `user_pantry_exclusions` migration
- Add API endpoints: GET/POST/DELETE exclusions
- Update `isPantryStaple()` logic

**Frontend** (3-5 days):
- Modify three-dot menu logic
- Create simple management modal
- Update state management
- Add RLS policies

**Testing** (1-2 days):
- Test override scenarios
- Verify state management
- Edge case handling

---

### Option 2: Smart Pantry Management System (Medium Complexity) ⭐ RECOMMENDED

**Goal**: Comprehensive fix that will last long-term
**Timeline**: 3-4 weeks implementation
**Complexity**: Medium

#### What It Solves
- ✅ All critical bugs from Agent 1's audit
- ✅ First-time user onboarding experience
- ✅ Full pantry management interface
- ✅ Pre-auth feature discovery
- ✅ Visual clarity throughout
- ✅ Long-term scalability

#### Key Features

**1. Checkbox-Based Onboarding**
- Shows on first shopping list generation (or accessible anytime from Settings)
- Presents 45 curated UK pantry staples organized by category
- Users check items they typically have at home
- Includes "Skip for now" option
- Pre-populates based on common UK household standards

**2. Three-State System**
Instead of two separate tables, use one unified approach:

```sql
-- Unified approach using single table with action enum
CREATE TABLE user_pantry_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_pattern TEXT NOT NULL,
  preference VARCHAR NOT NULL CHECK (preference IN ('hide', 'show', 'auto')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, item_pattern)
);
```

States:
- **'hide'**: Force hide (user explicitly marked "always hide")
- **'show'**: Force show (user explicitly marked "always show" - overrides default rules)
- **'auto'**: Let system decide (default state, uses default rules)

**3. Dedicated Pantry Management Page**
- Located at `/settings/pantry-staples`
- Accessible from Settings menu OR shopping list page
- Full search functionality
- Organized by categories
- Bulk actions: "Add common items", "Clear all", "Export list"
- Shows count of items per preference state

**4. Enhanced Shopping List UI**
- Visual badges on pantry items in Complete List mode
- Clearer toggle labels with contextual help tooltips
- "View hidden items" quick link from Shopping Mode
- Inline pantry controls for rapid adjustments

**5. Pre-Auth Support**
- sessionStorage key: `playground_pantry_preferences`
- Limited to 20 custom pantry items (prevent storage bloat)
- Banner: "Sign up to save your pantry preferences permanently"
- Simplified onboarding (15 most common items instead of 45)
- Migration on signup (transfer to database)

**6. Smart Suggestions**
- On first Complete List view, system suggests items to mark as pantry
- "We noticed you have 'salt (2tsp)' - Do you usually keep salt at home?"
- Accept/Dismiss individual suggestions
- Dismissed suggestions don't re-appear

#### User Flows

**Onboarding Flow (First-Time Authenticated Users)**

```
Step 1: Generate First Shopping List
- User plans meals for week
- Clicks "Generate Shopping List"
- System creates list with all ingredients

Step 2: Pantry Onboarding Modal Appears
┌────────────────────────────────────────────────────────┐
│  Welcome to Smart Shopping Lists! 🛒                    │
│                                                         │
│  Save time by hiding pantry staples you usually have   │
│  at home. Select items below:                          │
│                                                         │
│  [ Recommended for UK Households ] [or] [ Skip ]       │
└────────────────────────────────────────────────────────┘

Step 3: Checkbox Selection (if user continues)
┌────────────────────────────────────────────────────────┐
│  Select Your Pantry Staples                             │
│                                                         │
│  [Search items...]                          45 items   │
│                                                         │
│  Oils & Fats (5 items - 3 selected)                   │
│  ☑ Olive oil            ☑ Vegetable oil               │
│  ☑ Butter               ☐ Sunflower oil               │
│  ☐ Coconut oil                                         │
│                                                         │
│  Seasonings (8 items - 5 selected)                    │
│  ☑ Salt                 ☑ Black pepper                │
│  ☑ Stock cubes          ☑ Garlic powder               │
│  ☑ Dried mixed herbs    ☐ White pepper                │
│  ☐ Sea salt flakes      ☐ Pink peppercorns            │
│                                                         │
│  [Collapse other categories...]                        │
│                                                         │
│  💡 Tip: You can always change these in Settings       │
│                                                         │
│            [ Maybe Later ]  [ Save Selections (13) ]   │
└────────────────────────────────────────────────────────┘

Step 4: Shopping List View (After Setup)
- Shopping Mode enabled by default
- Selected pantry items are hidden
- Badge shows "13 pantry staples hidden"
- User sees clean, focused shopping list

Step 5: First Override Scenario
User realizes: "Oh, I'm actually out of salt this week"

- Switch to Complete List mode
- Find "Salt (2tsp)" in list
- Click three-dot menu
- See: "Always show this item" (eye icon)
- Click → Salt moves to "show" preference
- Toast: "Salt will now appear in Shopping Mode"
- Automatically switches back to Shopping Mode
- Salt now visible with subtle indicator badge

Step 6: Discovery of Management Page
User clicks gear icon or visits Settings
- Sees "Pantry Staples" section
- Badge shows "14 items configured"
- Click to access full management interface
```

**Shopping List Generation Flow (Returning Users)**

```
Step 1: User Generates Shopping List
- System creates list from meal plan
- Fetches user's pantry preferences
- Applies filtering automatically

Step 2: Shopping Mode (Default View)
┌─────────────────────────────────────────────────────────┐
│  Shopping List                                    [Gear] │
│  Week of 2025-10-13                                     │
│                                                          │
│  [Filter icon] Display:                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Shopping Mode ✓] [Complete List] [Pantry Only] │   │
│  └─────────────────────────────────────────────────┘   │
│  15 pantry staples hidden • View hidden items           │
│                                                          │
│  PRODUCE (4 items)                                      │
│  ☐ Cherry tomatoes (400g)                               │
│  ☐ Courgettes (2 whole)                                 │
│  ☐ Red onions (3 whole)                                 │
│  ☐ Fresh basil (1 handful)                              │
│                                                          │
│  MEAT & SEAFOOD (2 items)                               │
│  ☐ Chicken breast fillets (600g)                        │
│  ☐ Salmon fillets (400g)                                │
│                                                          │
│  [Continue with other categories...]                    │
└─────────────────────────────────────────────────────────┘

User clicks "View hidden items" link:
→ Smoothly animates to Complete List mode
→ Scrolls to first pantry item
→ Pantry items have subtle grey background

Step 3: Complete List Mode
Same list but now includes:
│  PANTRY (15 items)                                      │
│  ☐ Salt (2tsp) [P]                                      │
│  ☐ Black pepper (1tsp) [P]                              │
│  ☐ Olive oil (100ml) [P]                                │
│  ☐ Dried oregano (1tsp) [P]                             │
│  [...]                                                   │

[P] = Pantry badge (grey, subtle)
Items have slight grey tint background
Three-dot menu shows "Always show this item" for overrides

Step 4: Pantry Only Mode (NEW)
User wants to review what's being hidden:
- Clicks "Pantry Only" button
- List filters to ONLY show pantry items
- Use case: "Let me check if I actually need any of these"
- Each item has quick "Show in Shopping Mode" button

Step 5: Inline Adjustment
User in Shopping Mode realizes they need oregano:
- Clicks "View hidden items" → switches to Complete List
- Finds "Dried oregano"
- Clicks three-dot menu
- Clicks "Always show this item"
- System updates preference to 'show'
- Automatically returns to Shopping Mode
- Oregano now appears with [!] badge ("Usually hidden")
```

**Pantry Management Flow (Settings Page)**

```
User navigates: Settings → Pantry Staples

┌──────────────────── Pantry Staples ─────────────────────┐
│                                                          │
│  Manage items you typically keep at home. Items marked  │
│  as "Always Hide" won't appear in Shopping Mode.        │
│                                                          │
│  [Search pantry items...]                     [+ Add]   │
│                                                          │
│  Quick Actions:                                         │
│  [Set up common items] [Import from shopping history]  │
│  [Export list] [Clear all]                             │
│                                                          │
│  Tabs: [ Always Hide (13) ] [ Always Show (2) ] [ All (15) ] │
│                                                          │
│  Showing: Always Hide (13 items)                        │
│  Sorted by: Category                                    │
│                                                          │
│  ┌──────── Oils & Fats (3 items) ────────┐            │
│  │  Olive oil                    [→ Auto] [× Remove]   │
│  │  Added 2 weeks ago                                  │
│  │                                                      │
│  │  Vegetable oil                [→ Auto] [× Remove]   │
│  │  Added 2 weeks ago                                  │
│  │                                                      │
│  │  Butter                       [→ Auto] [× Remove]   │
│  │  Added 2 weeks ago                                  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────── Seasonings (8 items) ─────────┐            │
│  │  Stock cubes                  [→ Auto] [× Remove]   │
│  │  Garlic powder                [→ Auto] [× Remove]   │
│  │  Dried mixed herbs            [→ Auto] [× Remove]   │
│  │  Dried basil                  [→ Auto] [× Remove]   │
│  │  [View 4 more...]                                   │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Collapse other categories...]                         │
│                                                          │
└──────────────────────────────────────────────────────────┘

Actions:
- [→ Auto]: Change preference to "Let system decide"
- [× Remove]: Delete from list entirely
- [+ Add]: Manual entry with autocomplete
- Search: Filter items in real-time
- Import: Analyze past shopping lists to suggest items
- Export: Download as CSV or text list
```

**Pre-Auth User Experience (Playground)**

```
Pre-Auth User Journey:

Step 1: User Visits Playground (No Signup)
- Can explore app features
- sessionStorage limit: 20 custom pantry items

Step 2: First Shopping List Generation
Simple onboarding modal appears:

┌────────────────────────────────────────────────────────┐
│  Make Shopping Easier! 🛒                               │
│                                                         │
│  Hide common items you usually have at home:           │
│                                                         │
│  Quick Setup (Select items):                           │
│  ☐ Salt & pepper    ☐ Olive oil      ☐ Butter         │
│  ☐ Stock cubes      ☐ Dried herbs    ☐ Garlic         │
│  ☐ Onions           ☐ Flour          ☐ Sugar          │
│  ☐ Baking powder    ☐ Vinegar        ☐ Soy sauce      │
│  ☐ Tomato puree     ☐ Pasta          ☐ Rice           │
│                                                         │
│  💡 This saves in your browser (lost when tab closes)  │
│  Sign up to keep your preferences permanently!         │
│                                                         │
│            [ Skip ]      [ Hide Selected Items (0) ]   │
└────────────────────────────────────────────────────────┘

Note: Only 15 items shown (not 45 like authenticated)

Step 3: Shopping List with Limited Pantry Support
- Shopping Mode toggle works
- Can mark items as always hide/show
- Limited to 20 total custom items
- Persistent banner at top:

┌────────────────────────────────────────────────────────┐
│  ⚠️ Your pantry preferences are saved in your browser   │
│  and will be lost when you close this tab.             │
│  [Sign up free] to save permanently and sync devices   │
└────────────────────────────────────────────────────────┘

Step 4: Hitting Limits
If user tries to add 21st item:

Toast notification:
"You've reached the limit of 20 pantry items for free users.
Sign up to add unlimited items and sync across devices!"

[Sign Up Now] [Dismiss]

Step 5: Migration on Signup
User clicks "Sign up":
- Completes Clerk authentication
- Onboarding flow begins
- System detects existing sessionStorage data:

┌────────────────────────────────────────────────────────┐
│  Welcome! We found your previous work:                  │
│                                                         │
│  • 3 recipes saved                                      │
│  • 1 meal plan (Week of 2025-10-13)                    │
│  • Shopping list with 24 items                          │
│  • 12 pantry staples configured                         │
│                                                         │
│  Would you like to keep these?                          │
│                                                         │
│         [ Start Fresh ]  [ Keep My Work ✓ ]            │
└────────────────────────────────────────────────────────┘

If "Keep My Work":
- Bulk insert recipes → database
- Bulk insert meal plan → database
- Bulk insert shopping list → database
- Bulk insert pantry preferences → user_pantry_preferences
- Clear sessionStorage
- User continues with full authenticated experience
```

#### Wireframe Descriptions

**Screen 1: Pantry Setup Onboarding Modal**

```
Trigger: First shopping list generation OR click "Set up pantry" in Settings
Modal: Center-screen overlay with backdrop blur

┌────────────────────────────────────────────────────────────────────┐
│  [Close X]                                                          │
│                                                                     │
│  Welcome to Smart Shopping! 🛒                                      │
│                                                                     │
│  Save time by hiding pantry staples you usually keep at home.     │
│  Select common items below - you can always change these later.    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  [Search items to add...]                              45     │ │
│  │  ─────────────────────────────────────────────────────────── │ │
│  │                                                               │ │
│  │  Oils & Fats (5 items)                           [Expand ▼]  │ │
│  │  ☑ Olive oil         ☑ Vegetable oil      ☑ Butter          │ │
│  │  ☐ Sunflower oil     ☐ Coconut oil                           │ │
│  │                                                               │ │
│  │  Seasonings & Condiments (8 items)               [Expand ▼]  │ │
│  │  ☑ Salt              ☑ Black pepper       ☑ Stock cubes     │ │
│  │  ☑ Garlic powder     ☑ Mixed dried herbs                     │ │
│  │  ☐ White pepper      ☐ Sea salt          ☐ Pink peppercorn  │ │
│  │                                                               │ │
│  │  Dried Herbs & Spices (12 items)                [Expand ▼]  │ │
│  │  [Collapsed - click to expand]                               │ │
│  │                                                               │ │
│  │  Baking Essentials (6 items)                     [Expand ▼]  │ │
│  │  [Collapsed - click to expand]                               │ │
│  │                                                               │ │
│  │  Vinegars & Cooking Wine (5 items)               [Expand ▼]  │ │
│  │  [Collapsed - click to expand]                               │ │
│  │                                                               │ │
│  │  Other Staples (9 items)                         [Expand ▼]  │ │
│  │  [Collapsed - click to expand]                               │ │
│  │                                                               │ │
│  │  [Scroll for more...]                                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Quick Actions:                                                    │
│  [Select all common (20 items)] [Deselect all] [Select by recipe] │
│                                                                     │
│  💡 Tip: These items will be hidden in Shopping Mode but you can  │
│     always override individual items when needed.                  │
│                                                                     │
│                    [ Maybe Later ]  [ Save (13 selections) ]       │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘

Layout:
- Max-width: 700px
- Max-height: 80vh (scrollable content)
- Header: Fixed at top
- Footer: Fixed at bottom with actions
- Content: Scrollable category list

Interactions:
- Checkboxes: Toggle individual items
- Category headers: Click to expand/collapse
- Search: Real-time filter across all items
- "Select all common": Checks pre-defined recommended set
- "Select by recipe": AI suggests based on saved recipes
- "Maybe Later": Dismisses modal, can access later from Settings
- "Save": Bulk inserts preferences, closes modal

Mobile Responsive:
- Full screen on mobile (no backdrop, slides up from bottom)
- Larger checkboxes (48px touch targets)
- Sticky header and footer
- Swipe down to dismiss
```

**Screen 2: Shopping List View (Enhanced with Pantry Controls)**

```
Desktop View (1200px+):

┌────────────────────────────────────────────────────────────────────┐
│  ← Back to Meal Planner                                            │
│                                                                     │
│  Shopping List                                            [Gear ⚙] │
│  Week of 2025-10-13                                                │
│  Generated from meal plan                                          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  [Filter icon] Display Mode:                                  │ │
│  │  ┌───────────────┬────────────────┬──────────────────┐       │ │
│  │  │ Shopping Mode │ Complete List  │  Pantry Only     │       │ │
│  │  │      (✓)      │                │                  │       │ │
│  │  └───────────────┴────────────────┴──────────────────┘       │ │
│  │                                                                │ │
│  │  15 pantry staples hidden                                     │ │
│  │  [View hidden items →]                                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  [ Clear Checked (3) ]                                             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Add Item                                                      │ │
│  │  ┌─────────────────────┬──────────────┬─────────┐            │ │
│  │  │ Item name *         │ Quantity     │ [+ Add] │            │ │
│  │  │ [e.g., Milk]        │ [2 litres]   │         │            │ │
│  │  └─────────────────────┴──────────────┴─────────┘            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Items (24)  [total: 39 including hidden]                         │
│                                                                     │
│  ╔══════════════════════════════════════════════════════════════╗ │
│  ║  PRODUCE (6 items)                                           ║ │
│  ╚══════════════════════════════════════════════════════════════╝ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ☐  Cherry tomatoes (400g)            [✏️ Edit] [🗑️] [⋮]     │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ☐  Courgettes (2 whole)              [✏️ Edit] [🗑️] [⋮]     │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ☐  Red onions (3 whole)              [✏️ Edit] [🗑️] [⋮]     │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ☑  Fresh basil (1 handful)           [✏️ Edit] [🗑️] [⋮]     │ │
│  │     (checked - strikethrough & gray)                          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  [Continue other produce items...]                                │
│                                                                     │
│  ╔══════════════════════════════════════════════════════════════╗ │
│  ║  MEAT & SEAFOOD (3 items)                                    ║ │
│  ╚══════════════════════════════════════════════════════════════╝ │
│  [Items listed...]                                                 │
│                                                                     │
│  ╔══════════════════════════════════════════════════════════════╗ │
│  ║  DAIRY (4 items)                                             ║ │
│  ╚══════════════════════════════════════════════════════════════╝ │
│  [Items listed...]                                                 │
│                                                                     │
│  [Other categories...]                                             │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘

Complete List Mode (When toggled):

Same layout but now includes PANTRY category:

│  ╔══════════════════════════════════════════════════════════════╗ │
│  ║  PANTRY (15 items) - These are hidden in Shopping Mode      ║ │
│  ╚══════════════════════════════════════════════════════════════╝ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ☐  Salt (2tsp) [P]                   [✏️ Edit] [🗑️] [⋮]     │ │
│  │      Background: Light grey tint (#f5f5f5)                    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ☐  Black pepper (1tsp) [P]           [✏️ Edit] [🗑️] [⋮]     │ │
│  │      Background: Light grey tint                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  [Continue pantry items...]                                        │

[P] Badge styling:
- Small rounded badge
- Grey background (#e0e0e0)
- Dark grey text (#424242)
- Positioned to right of item name
- Tooltip on hover: "Pantry item (hidden in Shopping Mode)"

Three-dot menu (⋮) in Complete List for pantry items:
┌─────────────────────────────────────────────┐
│  ○  Edit quantity                  [✏️]     │
│  ●  Always show this item          [👁]     │  ← Override action
│  ○  Delete item                    [🗑️]     │
└─────────────────────────────────────────────┘

Pantry Only Mode (When toggled):

│  Items (15) - Showing only pantry staples                         │
│                                                                     │
│  ╔══════════════════════════════════════════════════════════════╗ │
│  ║  OILS & FATS (3 items)                                       ║ │
│  ╚══════════════════════════════════════════════════════════════╝ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  ☐  Olive oil (100ml)                                         │ │
│  │      [Show in Shopping Mode]  [Edit] [Delete]                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  [Continue with other categories...]                              │

Mobile View (< 768px):

┌─────────────────────────────────┐
│  ← Shopping List           [⚙] │
│  Week of 2025-10-13             │
│                                  │
│  Display:                        │
│  ┌──────────────────────────────┐│
│  │ [Shopping ✓] [Complete]     ││
│  └──────────────────────────────┘│
│  │ [Pantry Only]               ││
│  └──────────────────────────────┘│
│  15 hidden • [View]              │
│                                  │
│  [Clear Checked (3)]             │
│                                  │
│  ┌────────────────────────────┐ │
│  │ Add Item                    │ │
│  │ Item: [____________]        │ │
│  │ Qty:  [______] [+ Add]     │ │
│  └────────────────────────────┘ │
│                                  │
│  Items (24)                      │
│                                  │
│  PRODUCE (6)                     │
│  ┌────────────────────────────┐ │
│  │ ☐ Cherry tomatoes (400g)   │ │
│  │                       [⋮]  │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │ ☐ Courgettes (2 whole)     │ │
│  │                       [⋮]  │ │
│  └────────────────────────────┘ │
│  [...]                           │
│                                  │
└─────────────────────────────────┘

Mobile interactions:
- Swipe left on item → Quick actions (Edit, Delete, Toggle Pantry)
- Tap item → Check/uncheck
- Tap three-dot → Full menu
- Display mode: Segmented control (stacked on narrow screens)
- Touch targets: Minimum 44px height
```

**Screen 3: Pantry Management Interface (Settings Page)**

```
Desktop View:

┌────────────────────────────────────────────────────────────────────┐
│  Settings                                                           │
│  ┌────────────┬─────────────────────────────────────────────────┐ │
│  │ Account    │  Pantry Staples                                  │ │
│  │ Preferences│                                                   │ │
│  │ Allergens  │  Manage items you typically keep at home.       │ │
│  │ ▶ Pantry   │  Items marked "Always Hide" won't appear in     │ │
│  │ About      │  Shopping Mode.                                  │ │
│  │ Help       │                                                   │ │
│  │            │  ┌──────────────────────────────────────────┐   │ │
│  │            │  │ [🔍 Search pantry items...]      [+ Add] │   │ │
│  │            │  └──────────────────────────────────────────┘   │ │
│  │            │                                                   │ │
│  │            │  Quick Actions:                                  │ │
│  │            │  [Set up common items] [Import from history]    │ │
│  │            │  [Export list] [Clear all]                      │ │
│  │            │                                                   │ │
│  │            │  ┌────────────────────────────────────────────┐ │ │
│  │            │  │ Tabs:                                      │ │ │
│  │            │  │ [Always Hide (13)] [Always Show (2)] [All] │ │ │
│  │            │  └────────────────────────────────────────────┘ │ │
│  │            │                                                   │ │
│  │            │  Showing: Always Hide (13 items)                │ │
│  │            │  Sort by: [Category ▼]                          │ │
│  │            │                                                   │ │
│  │            │  ╔════════════════════════════════════════════╗ │ │
│  │            │  ║  Oils & Fats (3 items)          [Collapse]  ║ │ │
│  │            │  ╚════════════════════════════════════════════╝ │ │
│  │            │  ┌────────────────────────────────────────────┐ │ │
│  │            │  │  Olive oil                                  │ │ │
│  │            │  │  Added 2 weeks ago                          │ │ │
│  │            │  │  [Change to: Auto ▼] [× Remove]            │ │ │
│  │            │  └────────────────────────────────────────────┘ │ │
│  │            │  ┌────────────────────────────────────────────┐ │ │
│  │            │  │  Vegetable oil                              │ │ │
│  │            │  │  Added 2 weeks ago                          │ │ │
│  │            │  │  [Change to: Auto ▼] [× Remove]            │ │ │
│  │            │  └────────────────────────────────────────────┘ │ │
│  │            │  ┌────────────────────────────────────────────┐ │ │
│  │            │  │  Butter                                     │ │ │
│  │            │  │  Added 2 weeks ago                          │ │ │
│  │            │  │  [Change to: Auto ▼] [× Remove]            │ │ │
│  │            │  └────────────────────────────────────────────┘ │ │
│  │            │                                                   │ │
│  │            │  ╔════════════════════════════════════════════╗ │ │
│  │            │  ║  Seasonings (8 items)           [Collapse]  ║ │ │
│  │            │  ╚════════════════════════════════════════════╝ │ │
│  │            │  ┌────────────────────────────────────────────┐ │ │
│  │            │  │  Stock cubes                                │ │ │
│  │            │  │  Added 2 weeks ago                          │ │ │
│  │            │  │  [Change to: Auto ▼] [× Remove]            │ │ │
│  │            │  └────────────────────────────────────────────┘ │ │
│  │            │  ┌────────────────────────────────────────────┐ │ │
│  │            │  │  Garlic powder                              │ │ │
│  │            │  │  Added 2 weeks ago                          │ │ │
│  │            │  │  [Change to: Auto ▼] [× Remove]            │ │ │
│  │            │  └────────────────────────────────────────────┘ │ │
│  │            │  [View 6 more items...]                         │ │
│  │            │                                                   │ │
│  │            │  [Other categories collapsed...]                │ │
│  │            │                                                   │ │
│  └────────────┴─────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

Add Item Modal (Click [+ Add]):
┌────────────────────────────────────┐
│  Add Pantry Staple                  │
│                                     │
│  Item name:                         │
│  [________________]                 │
│  Suggestions appear as you type:    │
│  • Coconut oil                      │
│  • Sesame oil                       │
│  • Groundnut oil                    │
│                                     │
│  Preference:                        │
│  ○ Always hide                      │
│  ○ Always show                      │
│  ○ Auto-detect (let system decide)  │
│                                     │
│         [Cancel]  [Add Item]        │
└────────────────────────────────────┘

"Always Show" Tab View:
│  Showing: Always Show (2 items)                │
│  Sort by: [Recently Added ▼]                   │
│                                                  │
│  ╔════════════════════════════════════════════╗│
│  ║  Overridden Defaults (2 items)              ║│
│  ╚════════════════════════════════════════════╝│
│  ┌────────────────────────────────────────────┐│
│  │  Salt                                       ││
│  │  Usually hidden by default rules            ││
│  │  Override added 3 days ago                  ││
│  │  [Change to: Auto ▼] [× Remove]            ││
│  └────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────┐│
│  │  Black pepper                               ││
│  │  Usually hidden by default rules            ││
│  │  Override added 3 days ago                  ││
│  │  [Change to: Auto ▼] [× Remove]            ││
│  └────────────────────────────────────────────┘│

"All" Tab View:
│  Showing: All Preferences (15 items)            │
│  Sort by: [Category ▼]                          │
│                                                  │
│  Combined view of all preferences with badges:  │
│  • [Hide] badge for "Always Hide" items         │
│  • [Show] badge for "Always Show" items         │
│  • No badge for items set to "Auto"             │

Mobile View:

┌─────────────────────────────────┐
│  ← Settings                      │
│                                  │
│  Pantry Staples                  │
│                                  │
│  Manage items you typically keep │
│  at home.                        │
│                                  │
│  [🔍 Search...]         [+ Add]  │
│                                  │
│  [Set up common] [Import]       │
│  [Export] [Clear all]           │
│                                  │
│  ┌───────────────────────────┐  │
│  │ [Hide (13)] [Show (2)]    │  │
│  └───────────────────────────┘  │
│  │ [All (15)]                │  │
│  └───────────────────────────┘  │
│                                  │
│  Always Hide (13)                │
│  [Category ▼]                    │
│                                  │
│  Oils & Fats (3)     [Collapse ▼]│
│  ┌───────────────────────────┐  │
│  │ Olive oil                  │  │
│  │ Added 2w ago               │  │
│  │ [Auto ▼] [× Remove]       │  │
│  └───────────────────────────┘  │
│  [Other items...]               │
│                                  │
└─────────────────────────────────┘

Interactions:
- Search: Real-time filter across all items
- Tabs: Switch between Always Hide, Always Show, All
- Sort: Category, Alphabetical, Recently Added
- Collapse/Expand: Toggle category visibility
- Change to dropdown: Switch preference (Hide/Show/Auto)
- Remove: Delete preference (returns to auto-detect)
- Add: Opens modal with autocomplete
- Import: Analyzes shopping list history to suggest items
- Export: Download CSV or text list
- Clear all: Confirmation dialog → removes all preferences
```

#### Pre-Auth vs Auth Strategy

**Pre-Auth Experience (Playground)**

**Storage Strategy**:
```javascript
// Add to STORAGE_KEYS in session-storage.ts
const STORAGE_KEYS = {
  RECIPES: 'playground_recipes',
  MEAL_PLANS: 'playground_meal_plans',
  SHOPPING_LISTS: 'playground_shopping_lists',
  USER_PREFERENCES: 'playground_preferences',
  PANTRY_PREFERENCES: 'playground_pantry_preferences', // NEW
  GENERATION_COUNT: 'playground_generation_count',
  SESSION_START: 'playground_session_start',
}

// Storage format
interface PlaygroundPantryPreference {
  item_pattern: string;
  preference: 'hide' | 'show' | 'auto';
  created_at: string;
}
```

**Limitations**:
- Maximum 20 custom pantry items (prevent sessionStorage bloat)
- Simplified onboarding (15 items instead of 45)
- No import/export functionality
- No shopping list history analysis
- Data lost on tab close
- Persistent banner encouraging signup

**What Works**:
- ✅ Shopping Mode / Complete List toggle
- ✅ Mark items as always hide/show
- ✅ Simplified onboarding modal
- ✅ Basic pantry filtering
- ✅ Three-dot menu with override options

**Signup Prompt Triggers**:
1. When user tries to add 21st pantry item
2. Banner always visible at top of shopping list
3. When user closes tab (exit intent popup)
4. After 3 shopping list generations

**Migration on Signup**:
```javascript
// When user completes signup
async function migratePantryPreferences(userId: string) {
  const playgroundData = getAllPlaygroundData();

  if (playgroundData.pantryPreferences) {
    // Bulk insert into user_pantry_preferences
    await fetch('/api/user/pantry-staples/bulk', {
      method: 'POST',
      body: JSON.stringify({
        preferences: playgroundData.pantryPreferences
      })
    });
  }

  // Clear sessionStorage after migration
  clearPlaygroundData();
}
```

**Authenticated Experience**

**Full Feature Set**:
- ✅ Unlimited custom pantry items
- ✅ Full 45-item onboarding
- ✅ Complete management interface in Settings
- ✅ Search, filter, sort, bulk actions
- ✅ Import from shopping list history
- ✅ Export preferences
- ✅ Cross-device sync via database
- ✅ Preferences persist forever
- ✅ Advanced features (Pantry Only mode, history tracking)

**Database Persistence**:
```sql
-- All preferences stored in user_pantry_preferences table
-- RLS ensures users only see their own data
-- Synced across all devices immediately
```

**Upgrade Benefits Clear to Pre-Auth Users**:
- "You've reached 20 items - Sign up for unlimited!"
- "Your preferences are temporary - Sign up to save permanently!"
- "Sync across all your devices - Sign up now!"

#### Component Structure Suggestions

```
Suggested Component Architecture:

frontend/src/components/pantry/
├── PantryOnboarding.tsx
│   ├── Props: { isPreAuth: boolean, onComplete: () => void, onSkip: () => void }
│   ├── Children: CategoryCheckboxGroup, ItemCheckbox, SearchBar
│   └── Handles: Checkbox state, bulk select, save to DB/storage
│
├── PantryManagementPage.tsx
│   ├── Location: /settings/pantry-staples
│   ├── Children: PantryItemsList, PantryFilter, PantryActions
│   └── Handles: CRUD operations, search, sort, filter
│
├── PantryToggle.tsx (Enhanced Shopping List Toggle)
│   ├── Props: { displayMode, hiddenCount, onModeChange }
│   ├── Three buttons: Shopping Mode, Complete List, Pantry Only
│   └── Shows badge with hidden count
│
├── PantryItemBadge.tsx
│   ├── Props: { type: 'pantry' | 'override', item: ShoppingListItem }
│   ├── Visual indicator for pantry items
│   └── Tooltip with explanation
│
└── PantryItemMenu.tsx (Enhanced Three-Dot Menu)
    ├── Props: { item: ShoppingListItem, userPreferences, defaultRules }
    ├── Context-aware menu options
    └── Handles: Toggle preference, delete, edit

frontend/src/hooks/
├── usePantryPreferences.ts
│   ├── Unified hook for auth/pre-auth
│   ├── Handles fetching, updating, caching
│   └── Returns: { preferences, loading, addPreference, removePreference, updatePreference }
│
└── useShoppingListFilter.ts
    ├── Filtering logic for Shopping Mode / Complete List / Pantry Only
    ├── Uses isPantryStaple() function
    └── Returns: { filteredItems, hiddenCount, displayMode, setDisplayMode }

frontend/src/lib/
├── pantry-detection.ts (Extract from page component)
│   ├── isPantryStaple(item, preferences, defaultRules)
│   ├── DEFAULT_PANTRY_RULES (curated UK list)
│   └── evaluatePreference(item, preference)
│
└── pantry-storage.ts (Pre-auth specific)
    ├── getPlaygroundPantryPreferences()
    ├── savePlaygroundPantryPreference()
    ├── removePlaygroundPantryPreference()
    └── MAX_PLAYGROUND_PANTRY_ITEMS = 20

API Endpoints (Already exist, may need enhancement):
├── GET /api/user/pantry-staples (fetch all preferences)
├── POST /api/user/pantry-staples (add single preference)
├── POST /api/user/pantry-staples/bulk (NEW: bulk insert for migration)
├── PUT /api/user/pantry-staples/[id] (NEW: update preference)
└── DELETE /api/user/pantry-staples/[id] (delete preference)
```

#### Pros & Cons

**Pros**:
- ✅ Solves ALL critical bugs identified by Agent 1
- ✅ Excellent first-time user experience (checkbox onboarding)
- ✅ Users have full control (can override any rule)
- ✅ Pre-auth users get valuable feature preview
- ✅ Clear upgrade path (encourage signup with limits)
- ✅ Scalable architecture (three-state system is flexible)
- ✅ UK-focused (45 curated items based on research)
- ✅ Mobile-optimized (responsive design throughout)
- ✅ Long-term solution (won't need major changes for 6-12 months)
- ✅ Follows stakeholder requirements (features + simplicity)
- ✅ Clear visual hierarchy (badges, colors, grouping)
- ✅ Comprehensive management interface
- ✅ Good migration path from playground to auth

**Cons**:
- ⚠️ Medium implementation complexity (3-4 weeks)
- ⚠️ Requires database migration (add preference column)
- ⚠️ More extensive testing needed (multiple user states)
- ⚠️ Pre-auth users might be frustrated by 20-item limit
- ⚠️ Three display modes might feel like too many options for some users
- ⚠️ Checkbox onboarding could be intimidating to some users (45 items is a lot)
- ⚠️ Performance consideration: More API calls for preference management

#### Implementation Complexity: **Medium**

**Backend** (1 week):
- Database migration: Add preference column to user_pantry_staples
- Update API endpoints: Add PUT route, bulk POST route
- Migration logic: Transfer playground data on signup
- RLS policies: Ensure secure access
- Testing: Edge cases, race conditions, data integrity

**Frontend** (2 weeks):
- Onboarding modal component (2-3 days)
- Enhanced shopping list UI (2-3 days)
- Pantry management page (3-4 days)
- Pre-auth sessionStorage integration (1-2 days)
- Mobile responsive adjustments (1-2 days)
- Component extraction and refactoring (1-2 days)

**Testing & Polish** (3-5 days):
- End-to-end user flow testing
- Mobile device testing
- Pre-auth to auth migration testing
- Performance testing (large pantry lists)
- Accessibility testing
- Bug fixes and refinements

**Total**: 3-4 weeks with one developer

---

### Option 3: AI-Powered Smart Pantry (High Complexity)

**Goal**: Full-featured pantry system with machine learning
**Timeline**: 6-8 weeks implementation
**Complexity**: High

#### What It Adds Beyond Option 2
- 🤖 AI learns from user behavior over time
- 🤖 Smart suggestions based on recipe patterns
- 🤖 Automatic pantry detection from photos (scan cupboard)
- 🤖 Predictive restocking alerts ("You usually run out of olive oil around now")
- 🤖 Integration with UK supermarket APIs for pricing
- 🤖 Seasonal recommendations (adjust pantry for holidays)
- 🤖 Household sharing (family members can have shared pantry)

#### Key Features (Beyond Option 2)

**1. Machine Learning Preference Detection**
```javascript
// Track user override patterns
// After 3 times user shows salt, system learns "user needs salt"
// After 5 times user hides chicken, system learns "user has chicken"
// Preference confidence score increases over time
```

**2. Visual Pantry Scanner**
- User takes photo of cupboard
- AI identifies visible items
- Automatically adds to pantry list
- Suggests quantities based on package sizes

**3. Smart Restocking Alerts**
```
"You usually buy olive oil every 3 weeks.
Last purchase: 2 weeks ago.
Add to this week's shopping list?"
```

**4. Recipe-Based Suggestions**
```
"You've saved 12 Italian recipes.
Consider adding these to your pantry:
• Dried oregano
• Tinned tomatoes
• Parmesan cheese
• Balsamic vinegar"
```

**5. Household Sharing**
- Family members can contribute to shared pantry
- Individual preferences + household defaults
- Conflict resolution ("Mum says we have butter, Dad says we don't")

**6. Supermarket Integration**
- Fetch prices from Tesco, Sainsbury's, Asda APIs
- Show total shopping list cost
- Price comparison: "Save £3.50 by shopping at Asda"
- Loyalty card integration

**7. Seasonal & Calendar-Based Suggestions**
```
"Christmas is in 3 weeks.
Consider adding to your pantry:
• Plain flour (for baking)
• Caster sugar
• Dried fruit
• Mixed spice"
```

#### Wireframe Descriptions

**AI Suggestions Panel (Shopping List Page)**
```
Appears at top of shopping list after generating:

┌────────────────────────────────────────────────────────────┐
│  💡 Smart Suggestions                              [Dismiss]│
│                                                              │
│  Based on your recipe collection, we recommend adding:      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Dried oregano                          [Add to List]│  │
│  │  You use this in 8 of your saved recipes             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tinned tomatoes                        [Add to List]│  │
│  │  Common in your Italian recipes                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Balsamic vinegar                       [Add to List]│  │
│  │  Used in 5 recipes, often in small amounts           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Add All (3)] [Mark as Pantry Items] [Dismiss]            │
└────────────────────────────────────────────────────────────┘
```

**Visual Pantry Scanner**
```
New feature accessed from Pantry Management page:

┌────────────────────────────────────────────────────────────┐
│  Scan Your Cupboard                                   [Close]│
│                                                              │
│  Take a photo of your pantry/cupboard and we'll identify   │
│  items to add to your pantry list.                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │                  [Camera Preview]                      │  │
│  │                                                        │  │
│  │              or                                        │  │
│  │                                                        │  │
│  │            [Upload Photo]                             │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  💡 Tip: Take photo in good lighting for best results      │
│                                                              │
│                        [Take Photo] [Upload]                │
└────────────────────────────────────────────────────────────┘

After upload/capture:

┌────────────────────────────────────────────────────────────┐
│  Items Detected (8)                                          │
│                                                              │
│  Review detected items before adding to pantry:             │
│                                                              │
│  ☑  Olive oil (1 bottle visible)                            │
│  ☑  Salt (1 container)                                      │
│  ☑  Black pepper (1 grinder)                                │
│  ☑  Dried oregano (1 jar)                                   │
│  ☑  Dried basil (1 jar)                                     │
│  ☐  Cornflour (confidence: 72% - verify?)                   │
│  ☑  Stock cubes (1 box)                                     │
│  ☑  Soy sauce (1 bottle)                                    │
│                                                              │
│  Couldn't identify: 2 items                                 │
│  [View unidentified items →]                                │
│                                                              │
│              [Cancel] [Add Selected Items (7)]              │
└────────────────────────────────────────────────────────────┘
```

**Smart Restocking Alerts**
```
Notification badge on pantry management page:

┌────────────────────────────────────────────────────────────┐
│  Pantry Staples                               [2 alerts 🔔]│
│                                                              │
│  Restocking Suggestions:                                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⏰ Olive oil - Due for restocking                    │  │
│  │     Last purchased: 3 weeks ago                       │  │
│  │     Typical cycle: Every 3-4 weeks                    │  │
│  │     [Add to Shopping List] [I have enough] [Dismiss] │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⏰ Stock cubes - Running low?                        │  │
│  │     Used in 4 recipes this month                      │  │
│  │     Last purchased: 2 months ago                      │  │
│  │     [Add to Shopping List] [I have enough] [Dismiss] │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**Supermarket Price Comparison**
```
At bottom of shopping list:

┌────────────────────────────────────────────────────────────┐
│  Shopping List Total (estimated)                            │
│                                                              │
│  Based on prices from UK supermarkets:                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tesco            £34.50  [Shop at Tesco]            │  │
│  │  Sainsbury's      £36.20                              │  │
│  │  Asda             £32.80  [Shop at Asda] ← Cheapest  │  │
│  │  Morrisons        £35.10                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  💰 Save £1.70 by shopping at Asda instead of Tesco        │
│                                                              │
│  Note: Prices are estimates and may vary by location.      │
│  Last updated: 2 hours ago                                  │
└────────────────────────────────────────────────────────────┘
```

#### Pros & Cons

**Pros**:
- 🎯 Truly intelligent system that learns from user
- 🎯 Minimal manual configuration needed over time
- 🎯 Significant value-add (justifies subscription/premium tier)
- 🎯 Competitive differentiator (few apps have this)
- 🎯 Delight factor (users love smart features)
- 🎯 Comprehensive feature set
- 🎯 Future-proof architecture

**Cons**:
- ❌ High complexity (6-8 weeks minimum)
- ❌ Requires ML infrastructure (training data, models)
- ❌ Privacy concerns (photo scanning, behavior tracking)
- ❌ API integration challenges (supermarket APIs may be limited/costly)
- ❌ Ongoing maintenance (model retraining, API updates)
- ❌ Performance overhead (image processing, ML inference)
- ❌ Might overwhelm users (too many features)
- ❌ Could feel intrusive ("Why is the app tracking my purchases?")
- ❌ Not aligned with stakeholder's "quick win" requirement
- ❌ Violates "simplicity" principle

#### Implementation Complexity: **High**

**Backend** (3-4 weeks):
- ML model training (behavior prediction)
- Image recognition API integration (Google Vision, Azure, AWS)
- Supermarket API integration (if available)
- Behavior tracking database schema
- Analytics pipeline
- Recommendation engine
- Alert/notification system

**Frontend** (2-3 weeks):
- Camera integration
- Image upload handling
- AI suggestion UI components
- Price comparison display
- Alert notifications
- Complex state management

**Testing & Training** (1-2 weeks):
- ML model validation
- API reliability testing
- Privacy/security review
- Performance optimization
- User acceptance testing

**Total**: 6-8 weeks minimum with 2 developers

**Recommendation**: This is a Phase 3 feature. Too complex for current MVP needs.

---

## Standard UK Pantry Items List

### Recommended Default List (45 Items)

Based on research from Jamie Oliver, Sainsbury's, Good Housekeeping UK, and British Heart Foundation, here's a curated list of pantry staples for UK households:

#### Oils & Fats (5 items)
- Olive oil
- Vegetable oil
- Butter
- Sunflower oil
- Coconut oil

#### Seasonings & Condiments (8 items)
- Salt (table salt)
- Black pepper (ground)
- Stock cubes (vegetable, chicken, beef)
- Garlic powder
- Onion powder
- Tomato puree
- Soy sauce
- Worcestershire sauce

#### Dried Herbs & Spices (12 items)
- Dried mixed herbs
- Dried basil
- Dried oregano
- Dried thyme
- Dried rosemary
- Paprika
- Cumin (ground)
- Coriander (ground)
- Turmeric
- Cinnamon
- Chilli flakes
- Garam masala / Curry powder

#### Baking Essentials (6 items)
- Plain flour
- Self-raising flour
- Caster sugar
- Granulated sugar
- Baking powder
- Bicarbonate of soda

#### Vinegars & Cooking Wine (5 items)
- White wine vinegar
- Balsamic vinegar
- Red wine vinegar
- White wine (for cooking)
- Red wine (for cooking)

#### Tinned & Jarred Goods (4 items)
- Tinned tomatoes
- Tinned chickpeas
- Tinned cannellini beans
- Capers

#### Other Staples (5 items)
- Pasta (dried)
- Rice (basmati, long-grain)
- Lentils (red, green)
- Cornflour
- Honey

### Category Rationale

**Why these 45 items?**
1. **Coverage**: Supports 80%+ of common UK recipes
2. **Frequency**: Items used weekly in typical UK cooking
3. **Small Quantities**: Usually needed in amounts that don't require shopping trips
4. **Longevity**: Non-perishable items that keep for months
5. **British Staples**: Includes UK-specific items (mixed herbs, HP sauce compatibility)
6. **Cooking Styles**: Covers British, Indian, Italian, Chinese home cooking
7. **Baking**: Essential for basic home baking (scones, cakes, bread)

**NOT Included (Intentionally)**:
- Fresh produce (tomatoes, onions, garlic) - debatable, many keep at home
- Dairy (milk, eggs, cream) - too perishable for "pantry" definition
- Frozen items - separate category in app
- Specialty ingredients (truffle oil, saffron) - too uncommon
- Alcohol for drinking (beer, spirits) - not cooking ingredients

### Alternative: Tiered Approach

For a more flexible system, could offer three preset tiers:

**Basic Pantry (20 items)**
Most essential items for someone who cooks occasionally:
- Oils: Olive oil, vegetable oil, butter
- Seasonings: Salt, pepper, stock cubes
- Herbs: Mixed dried herbs
- Spices: Garlic powder, paprika
- Baking: Flour, sugar
- Tinned: Tinned tomatoes
- Condiments: Tomato puree, soy sauce
- Staples: Pasta, rice

**Standard Pantry (45 items)**
The full recommended list above

**Comprehensive Pantry (60+ items)**
For keen bakers or diverse cuisines:
- Add: Yeast, bread flour, icing sugar, cocoa powder
- Add: Sesame oil, peanut oil
- Add: Five-spice, star anise, cardamom
- Add: Tahini, miso paste, harissa
- Add: Specialist flours (chickpea, rice flour)

### Customization Strategy

**How Users Can Modify Over Time**:

1. **During Onboarding**:
   - Present "Recommended for UK Households" (45 items)
   - Allow search to add custom items
   - "Skip all" option for experienced users

2. **Post-Onboarding**:
   - Manage via Settings → Pantry Staples
   - Add items from shopping list (three-dot menu)
   - Import from shopping history ("You buy olive oil monthly - add to pantry?")
   - Smart suggestions based on recipe collection

3. **Learning from Behavior**:
   - Track override patterns (Option 3 feature)
   - "You've hidden chicken 3 times - add to pantry?"
   - "You've shown salt 3 times - remove from pantry?"

4. **Bulk Management**:
   - "Select all spices" button
   - "Clear all baking items" option
   - Export/import list (share with family, backup)

5. **Seasonal Adjustments**:
   - Prompt before Christmas: "Add baking essentials?"
   - Prompt before summer: "Add BBQ condiments?"
   - Prompt after recipe imports: "Add ingredients for [cuisine type]?"

### Implementation Notes

**Database Storage**:
```sql
-- Option A: Store as JSON in user preferences
user_preferences {
  pantry_preset: 'basic' | 'standard' | 'comprehensive' | 'custom'
}

-- Option B: Store as boolean flags (more flexible)
default_pantry_rules {
  id UUID,
  item_pattern TEXT,
  category VARCHAR,
  preset_tier VARCHAR CHECK (tier IN ('basic', 'standard', 'comprehensive')),
  enabled BOOLEAN DEFAULT true
}

-- Users can enable/disable default items or add custom ones
```

**Frontend Display**:
- Group by category (collapsible)
- Search across all items
- Visual indicators for tier (basic/standard/comprehensive)
- Quick filters: "Show only spices", "Show only oils"

---

## Visual Design Principles

### Clarity & Scannability

**Goal**: Shopping lists must be easy to read while shopping in-store with one hand.

**Design Guidelines**:

1. **Clear Visual Hierarchy**
   - Category headers: UPPERCASE, grey, smaller font (11px)
   - Item names: Regular case, black, medium font (16px)
   - Quantities: Grey, regular font (14px), parentheses
   - Spacing: 12px between items, 24px between categories

2. **High Contrast**
   - Unchecked items: Full black text (#000000)
   - Checked items: Grey text (#9e9e9e) + strikethrough
   - Pantry badges: Grey background (#e0e0e0), dark grey text
   - Category headers: Medium grey (#757575)

3. **Touch Targets (Mobile)**
   - Minimum 44px height for all interactive elements
   - 8px horizontal padding
   - Checkboxes: 24px × 24px
   - Three-dot menu: 44px × 44px touch area

4. **Readable Quantities**
   - Format: "400g" not "400 grams" (concise)
   - Format: "2 whole" not "2" (clear units)
   - Format: "400ml" not "0.4l" (familiar)
   - Parentheses: "(400g)" separate from name

5. **Grouping & Whitespace**
   - Card-based design for each item
   - 4px border radius for softness
   - 1px border (#e0e0e0) for definition
   - 8px padding inside cards
   - 8px gap between cards

### Pantry Item Visual Treatment

**Challenge**: Distinguish pantry items WITHOUT cluttering the interface.

**Recommended Approach**: Subtle, multi-layered indicators

**In Complete List Mode**:

1. **Background Tint**
   - Pantry items: Very light grey (#f5f5f5)
   - Regular items: White (#ffffff)
   - Contrast: Just enough to notice, not jarring

2. **Badge Indicator**
   - Small rounded badge to right of item name
   - Text: "P" or "Pantry" (depends on space)
   - Style: Grey background (#e0e0e0), dark grey text (#424242)
   - Size: 20px height, 4px padding, 2px border-radius
   - Position: Inline with item name, right-aligned

3. **Icon (Optional)**
   - Small jar/container icon (Lucide: "container")
   - 16px × 16px, grey color
   - Positioned before badge
   - Only show if space permits (desktop)

4. **Category Grouping**
   - Pantry items grouped into "PANTRY" category in Complete List
   - Visually separated from other categories
   - Category header: "PANTRY (15 items) - Hidden in Shopping Mode"

**In Shopping Mode**:
- Pantry items: Not visible at all
- Banner: "15 pantry staples hidden" with link to view

**In Pantry Only Mode**:
- All items have same treatment (no badges needed)
- Background: Light grey tint for consistency
- Focus on actions: "Show in Shopping Mode" button prominent

**Override Indicators**:
- Items with "Show Always" preference (overriding default hide):
  - Badge: "!" or "Override"
  - Color: Blue tint (#e3f2fd) background
  - Meaning: "Usually hidden but you requested to see this"

**Example Visual Hierarchy**:
```
Regular item (white background):
┌────────────────────────────────────┐
│ ☐  Cherry tomatoes (400g)          │
│    [normal black text]             │
└────────────────────────────────────┘

Pantry item (grey tint background):
┌────────────────────────────────────┐
│ ☐  Salt (2tsp) [P]                 │
│    [grey tint bg, badge]           │
└────────────────────────────────────┘

Override item (blue tint background):
┌────────────────────────────────────┐
│ ☐  Black pepper (1tsp) [!]         │
│    [blue tint bg, override badge]  │
└────────────────────────────────────┘
```

### Mobile-First Considerations

**Primary Use Case**: Shopping in-store on mobile device

**Design Constraints**:
- One-handed operation
- Glance-ability (quick scan)
- Works with gloves (winter shopping)
- Poor network (supermarket basements)
- Screen may be locked frequently

**Solutions**:

1. **Large Touch Targets**
   - Checkboxes: 24px, but 44px touch area
   - Buttons: 44px minimum height
   - Three-dot menus: 44px × 44px
   - Swipe zones: 60px width for gesture recognition

2. **Thumb-Friendly Layout**
   - Primary actions in bottom 1/3 of screen
   - Three-dot menu on right (for right-handed users)
   - "Add item" button at top (less frequent action)
   - Category headers sticky on scroll

3. **Progressive Disclosure**
   - Default view: Simple list with checkboxes
   - Swipe left: Reveal quick actions (Edit, Delete, Pantry)
   - Tap three-dot: Full menu with more options
   - Minimize steps for common actions

4. **Offline Support**
   - Optimistic UI updates (don't wait for server)
   - Cache shopping list in localStorage
   - Sync when connection restored
   - Visual indicator for pending syncs

5. **Reduce Cognitive Load**
   - Default to Shopping Mode (fewer items to scan)
   - Persistent header (always see total count)
   - Checked items: Move to bottom OR hide completely (user preference)
   - Large, readable fonts (16px minimum for body text)

6. **Contrast for Readability**
   - High contrast mode option (Settings)
   - Larger text option (Settings)
   - No reliance on color alone (use icons + text)

**Responsive Breakpoints**:
```css
/* Mobile (default) */
@media (max-width: 767px) {
  - Single column layout
  - Full-width cards
  - Stacked display mode buttons
  - Bottom navigation
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  - Two-column grid for items
  - Horizontal display mode buttons
  - Sidebar navigation
}

/* Desktop */
@media (min-width: 1024px) {
  - Max-width 800px (centered)
  - Two-column grid
  - Sidebar + content layout
  - Hover states for buttons
}
```

---

## Interaction Patterns

### Override Mechanism (Critical Fix)

**Problem to Solve**: Users cannot force-show items that match default rules.

**User Stories**:
1. "I'm out of salt this week, but the app hides it because it assumes I have salt"
2. "I want to see ALL items including pantry staples to double-check"
3. "I marked salt as 'always show' but it's still hidden - confusing!"

**Solution: Three-State Preference System**

**States**:
- **Hide**: User explicitly wants item hidden (force hide)
- **Show**: User explicitly wants item shown (override default rules)
- **Auto**: Let system decide (use default rules)

**Implementation**:

```typescript
// Database model
interface PantryPreference {
  id: string;
  user_id: string;
  item_pattern: string;
  preference: 'hide' | 'show' | 'auto';
  created_at: string;
  updated_at: string;
}

// Detection logic
function isPantryStaple(
  item: ShoppingListItem,
  userPreferences: PantryPreference[],
  defaultRules: DefaultPantryRule[]
): boolean {
  const itemName = item.item_name.toLowerCase();

  // STEP 1: Check user preference FIRST
  const userPref = userPreferences.find(pref =>
    itemName.includes(pref.item_pattern.toLowerCase())
  );

  if (userPref) {
    if (userPref.preference === 'hide') return true;  // Force hide
    if (userPref.preference === 'show') return false; // Force show (override)
    // If 'auto', continue to default rules below
  }

  // STEP 2: Check default rules
  return matchesDefaultRules(item, defaultRules);
}
```

**User Interactions**:

**Scenario A: Item Hidden by Default, User Wants to See It**
1. User generates shopping list
2. Shopping Mode active → "Salt" is hidden (matches default rule)
3. User clicks "View hidden items" link
4. Switches to Complete List mode
5. User finds "Salt (2tsp)" with grey tint background
6. User clicks three-dot menu
7. Menu shows: "Always show this item" (eye icon)
8. User clicks → Preference set to 'show'
9. Toast: "Salt will now appear in Shopping Mode"
10. Automatically returns to Shopping Mode
11. Salt now visible with blue tint + [!] badge

**Scenario B: Item Not Hidden, User Wants to Hide It**
1. User in Shopping Mode sees "Chicken breast (600g)"
2. User realizes they always have chicken at home
3. User clicks three-dot menu
4. Menu shows: "Always hide this item" (eye-off icon)
5. User clicks → Preference set to 'hide'
6. Toast: "Chicken breast will be hidden in Shopping Mode"
7. Item disappears from Shopping Mode
8. Still visible in Complete List mode (with grey tint)

**Scenario C: User Changes Mind (Undo)**
1. User previously marked "Salt" as 'show' (override)
2. User opens Pantry Management page in Settings
3. Finds "Salt" in "Always Show" tab
4. Clicks dropdown: "Change to Auto"
5. Preference updated to 'auto'
6. Toast: "Salt will now follow automatic rules"
7. In Shopping Mode, salt is hidden again (matches default rule)

**Scenario D: User Wants Neutral State**
1. User clicks three-dot menu on "Olive oil"
2. Dropdown shows current state indicator:
   - If hidden by default: "Currently auto-hidden"
   - If forced hide: "Currently always hidden"
   - If forced show: "Currently always shown"
3. Menu options:
   - "Always hide this item" (if not already hidden)
   - "Always show this item" (if not already shown)
   - "Reset to automatic" (if has custom preference)
4. User clicks "Reset to automatic"
5. Preference deleted from database
6. System reverts to default rule evaluation

**Visual Feedback**:
- **No preference (auto)**: No badge, follows default rules
- **Hide preference**: Grey tint in Complete List, hidden in Shopping Mode
- **Show preference**: Blue tint + [!] badge in all modes (override indicator)

**Menu Labels (Context-Aware)**:

```javascript
function getMenuLabel(item, userPref, matchesDefault) {
  if (userPref) {
    if (userPref.preference === 'hide') {
      return "Stop hiding this item"; // Change to 'auto'
    }
    if (userPref.preference === 'show') {
      return "Stop showing this item"; // Change to 'auto'
    }
  }

  // No user preference set
  if (matchesDefault) {
    return "Always show this item"; // Override default hide
  } else {
    return "Always hide this item"; // Force hide
  }
}
```

### Quick Toggle Actions

**Goal**: Users should be able to rapidly adjust pantry preferences while shopping.

**Patterns**:

**1. Inline Quick Actions (Mobile Swipe)**
```
Swipe left on item reveals:
┌─────────────────────────────────────┐
│ [Hide] [Edit] [Delete]              │
└─────────────────────────────────────┘

Swipe right on item reveals:
┌─────────────────────────────────────┐
│ [Show] [Add to Pantry]              │
└─────────────────────────────────────┘
```

**2. Long-Press Context Menu (Mobile)**
```
Long-press item for 500ms → Haptic feedback → Menu appears:
┌─────────────────────────────────────┐
│ ○ Check off                          │
│ ○ Edit quantity                      │
│ ● Toggle pantry status              │
│ ○ Delete item                        │
└─────────────────────────────────────┘
```

**3. Keyboard Shortcuts (Desktop)**
```
While shopping list has focus:
- Space: Toggle checked on selected item
- P: Toggle pantry preference
- E: Edit quantity
- Delete: Remove item
- ↑↓: Navigate items
- Tab: Focus next action button
```

**4. Bulk Actions (Select Mode)**
```
User clicks "Select" button → Checkboxes appear on left:

┌────────────────────────────────────────────────────┐
│ [X] Select All  (5 selected)                        │
│                                                     │
│ ☑ Salt (2tsp)                                      │
│ ☑ Black pepper (1tsp)                              │
│ ☑ Olive oil (100ml)                                │
│ ☐ Cherry tomatoes (400g)                           │
│ ☑ Stock cubes (2 whole)                            │
│ ☑ Dried oregano (1tsp)                             │
│                                                     │
│ With selected (5):                                  │
│ [Hide All] [Show All] [Delete All]                 │
└────────────────────────────────────────────────────┘
```

### Bulk Management

**Location**: Settings → Pantry Staples page

**Actions Available**:

**1. Add Common Items**
```
Opens modal with preset selections:
- Basic Pantry (20 items)
- Standard Pantry (45 items)
- Comprehensive Pantry (60 items)
- Custom selection

Bulk inserts checked items into preferences
```

**2. Import from Shopping History**
```
Analyzes past 10 shopping lists
Identifies items that appear frequently
Suggests: "You buy olive oil monthly - add to pantry?"
User reviews suggestions, selects which to add
```

**3. Export List**
```
Download options:
- CSV file (for spreadsheets)
- Plain text (for printing)
- JSON (for backup/sharing)

Format:
Category,Item,Preference,Added Date
Oils & Fats,Olive oil,hide,2025-10-01
Seasonings,Salt,show,2025-10-15
...
```

**4. Clear All**
```
Confirmation dialog:
"Are you sure you want to remove all pantry preferences?
This will delete 15 custom items and reset to automatic detection.

[ Cancel ] [ Yes, Clear All ]"

On confirm:
- DELETE all user_pantry_preferences for user
- Toast: "All pantry preferences cleared"
- Reverts to default rules only
```

**5. Search & Filter**
```
Search box: Real-time filter
- Searches across item_pattern
- Highlights matches
- Shows count: "Showing 3 of 15 items"

Filter dropdown:
- All preferences
- Always Hide only
- Always Show only
- Sort by: Category, Name, Date Added
```

**6. Category Management**
```
View by category (collapsible sections):
- Oils & Fats (3 items)
- Seasonings (5 items)
- Spices (8 items)
- Baking (4 items)

Actions per category:
- Collapse/Expand all
- Hide all in category
- Show all in category
- Remove all in category
```

---

## Future Considerations

### WhatsApp Sharing

**Current State**: Line item #16 in stakeholder's questions document mentions "WhatsApp shopping list" as a desired feature.

**Design Considerations**:

**Sharing Format**:
```
Option A: Plain Text Message
────────────────────────────
Shopping List - Week of 2025-10-13

PRODUCE
☐ Cherry tomatoes (400g)
☐ Courgettes (2 whole)
☐ Red onions (3 whole)

MEAT & SEAFOOD
☐ Chicken breast (600g)
☐ Salmon fillets (400g)

(24 items total)
────────────────────────────

Option B: Web Link
────────────────────────────
View your shopping list:
https://yourapp.com/share/abc123def456

Includes:
- Interactive checkboxes
- Live updates if recipient has app
- View-only for non-users
────────────────────────────

Option C: Image/PDF
────────────────────────────
Attach formatted image or PDF
- Styled, printable format
- Non-interactive
- Easy to view on any device
────────────────────────────
```

**Pantry Impact**:
- Should shared list include hidden pantry items?
- Option: "Share Shopping Mode view" (without pantry) vs "Share Complete List"
- Add toggle before sharing: "Include pantry staples? [Yes] [No]"

**Implementation Notes**:
- WhatsApp Business API for automated sending
- Or simple: Generate shareable link → User manually sends via WhatsApp
- Consider: Can recipient check off items? (live sync)
- Privacy: Shareable links expire after 7 days

**Recommended Approach for MVP**:
- Start with Option B (shareable web link)
- Add "Share" button to shopping list page
- Generates unique URL: `/share/shopping-list/[token]`
- User copies link, sends via WhatsApp manually
- Phase 2: Direct "Send to WhatsApp" button (using WhatsApp URL scheme)

### Smart Learning

**Concept**: System learns from user override patterns over time.

**Learning Scenarios**:

**Scenario 1: Repeated Overrides**
```
User has shown "Salt" 3 times in past 4 weeks
System suggests: "We notice you often need to buy salt.
Would you like to always show salt in Shopping Mode?"
[Yes, always show] [No, keep automatic]
```

**Scenario 2: Repeated Hiding**
```
User has hidden "Chicken breast" 5 times
System suggests: "We notice you always have chicken at home.
Add chicken to your pantry staples?"
[Yes, add] [No, keep showing]
```

**Scenario 3: Seasonal Patterns**
```
User buys flour, sugar, dried fruit in December (Christmas baking)
Next December: "Based on last year, would you like to add baking
essentials to your shopping list?"
[Yes, add items] [No thanks]
```

**Implementation**:
- Track override events in database
- Analyze patterns monthly
- Show suggestions as dismissible banners
- Machine learning optional (can use simple frequency counting)

**Database Schema**:
```sql
CREATE TABLE pantry_override_events (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_pattern TEXT NOT NULL,
  action VARCHAR NOT NULL CHECK (action IN ('force_show', 'force_hide')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Query for patterns
SELECT item_pattern, action, COUNT(*) as frequency
FROM pantry_override_events
WHERE user_id = $1
  AND created_at > NOW() - INTERVAL '4 weeks'
GROUP BY item_pattern, action
HAVING COUNT(*) >= 3;
```

### Recipe Integration

**Concept**: Recipes can declare their own pantry staples.

**Use Case**:
- Recipe author tags ingredients as "usually in pantry"
- User sees: "This recipe assumes you have salt, pepper, olive oil at home"
- User can accept or override assumptions

**Implementation**:

**Recipe Schema Addition**:
```typescript
interface Recipe {
  // Existing fields...
  ingredients: Array<{
    item: string;
    quantity: string;
    unit: string;
    notes?: string;
    is_pantry_staple?: boolean; // NEW
  }>;
}
```

**Shopping List Generation**:
```javascript
// When generating shopping list from recipe
if (ingredient.is_pantry_staple && !userPreferences.includes(ingredient.item)) {
  // Show prompt: "Recipe assumes you have [item]. Add to list anyway?"
  showPantryAssumptionPrompt(ingredient);
}
```

**UI Mockup**:
```
During shopping list generation:

┌────────────────────────────────────────────────────┐
│  Recipe Assumptions                                 │
│                                                     │
│  The recipe "Spaghetti Carbonara" assumes you have:│
│                                                     │
│  ☑ Salt                                            │
│  ☑ Black pepper                                    │
│  ☑ Olive oil                                       │
│  ☐ Parmesan cheese (not in your pantry)           │
│                                                     │
│  Add missing items to shopping list?               │
│  [Yes, add all] [Review individually] [Skip]      │
└────────────────────────────────────────────────────┘
```

**Benefits**:
- Reduces shopping list clutter
- Recipe authors can set expectations
- Users learn what to stock for specific cuisines

---

## Implementation Roadmap

### Phase 1: Critical Fixes (Week 1-2)

**Goal**: Fix bugs preventing current feature from working properly

**Tasks**:
- [ ] Database: Add `preference` column to `user_pantry_staples` (or create new unified table)
- [ ] API: Update GET/POST/DELETE endpoints to handle three states (hide/show/auto)
- [ ] API: Add PUT endpoint for updating preferences
- [ ] Frontend: Update `isPantryStaple()` function to respect 'show' preference
- [ ] Frontend: Update three-dot menu to show context-aware labels
- [ ] Frontend: Add visual indicators (badges) for pantry items
- [ ] Testing: Override scenarios (force show, force hide, reset to auto)
- [ ] Testing: Edge cases (item matches multiple patterns, deleted preferences)

**Deliverables**:
- Users can override default rules ✅
- Three-dot menu labels are clear ✅
- Pantry items visually distinguished ✅

**Success Metrics**:
- Zero complaints about "can't show hidden items"
- User feedback: "Menu labels make sense now"

### Phase 2: Core Features (Week 3-4)

**Goal**: Build comprehensive pantry management system

**Tasks**:
- [ ] Frontend: Create pantry onboarding modal component
- [ ] Frontend: Implement 45-item checkbox list with categories
- [ ] Frontend: Add search functionality to onboarding
- [ ] Frontend: Create Pantry Management page (`/settings/pantry-staples`)
- [ ] Frontend: Implement search, filter, sort on management page
- [ ] Frontend: Add bulk actions (clear all, add common items)
- [ ] Frontend: Enhance shopping list UI (third toggle, pantry badge, overflow menu)
- [ ] Frontend: Implement "Pantry Only" display mode
- [ ] Pre-Auth: Add sessionStorage functions for pantry preferences
- [ ] Pre-Auth: Implement simplified onboarding (15 items)
- [ ] Pre-Auth: Add 20-item limit enforcement
- [ ] Pre-Auth: Create migration logic on signup
- [ ] Mobile: Responsive adjustments for all new screens
- [ ] Testing: Full user flow (onboarding → shopping list → management)
- [ ] Testing: Pre-auth to auth migration
- [ ] Testing: Mobile device testing

**Deliverables**:
- Complete onboarding experience ✅
- Full pantry management interface ✅
- Pre-auth users can use pantry feature ✅
- Mobile-optimized ✅

**Success Metrics**:
- 60%+ of users complete onboarding
- Average 12 pantry items configured per user
- Pre-auth users create average 8 pantry items (close to 20 limit)
- 30%+ of pre-auth users convert to signup

### Phase 3: Polish & Optimization (Week 5-6)

**Goal**: Refine UX and optimize performance

**Tasks**:
- [ ] Performance: Optimize pantry detection function (memoization)
- [ ] Performance: Implement optimistic UI updates
- [ ] Performance: Add loading states and skeletons
- [ ] UX: Add contextual tooltips and help text
- [ ] UX: Implement smart suggestions ("You buy X often - add to pantry?")
- [ ] UX: Add keyboard shortcuts (desktop)
- [ ] UX: Implement swipe gestures (mobile)
- [ ] Accessibility: ARIA labels, screen reader testing
- [ ] Accessibility: Keyboard navigation throughout
- [ ] Accessibility: High contrast mode option
- [ ] UI: Animations for mode transitions (smooth, not jarring)
- [ ] UI: Empty states with helpful prompts
- [ ] UI: Error states with recovery actions
- [ ] Analytics: Track feature usage (onboarding completion, override frequency)
- [ ] Documentation: User help guide in app
- [ ] Testing: Accessibility audit
- [ ] Testing: Performance testing (large pantry lists)
- [ ] Testing: User acceptance testing (beta users)

**Deliverables**:
- Fast, responsive interactions ✅
- Delightful animations ✅
- Accessible to all users ✅
- Data-driven insights ✅

**Success Metrics**:
- Page load time < 2 seconds
- Interaction response time < 100ms
- Accessibility score > 95 (Lighthouse)
- User satisfaction score > 4.5/5

### Phase 4 (Future): Advanced Features

**Goal**: Add intelligence and integrations (6+ months out)

**Potential Tasks**:
- [ ] AI: Implement learning from override patterns
- [ ] AI: Smart suggestions based on recipe collection
- [ ] AI: Seasonal recommendations
- [ ] Integration: Supermarket price comparison
- [ ] Integration: WhatsApp sharing (direct send)
- [ ] Integration: Barcode scanner for pantry setup
- [ ] Feature: Visual pantry scanner (photo recognition)
- [ ] Feature: Household sharing (family pantries)
- [ ] Feature: Restocking alerts
- [ ] Feature: Recipe assumptions system

**Deliverables**:
- Intelligent, learning system ✅
- External integrations ✅
- Premium features for differentiation ✅

---

## Success Metrics

### How to Measure if Redesign is Successful

**User Adoption**:
- **Onboarding Completion Rate**: 60%+ of users complete pantry setup
- **Active Users**: 70%+ of users have at least 1 custom pantry preference
- **Engaged Users**: 40%+ of users have 10+ pantry items configured

**Feature Usage**:
- **Override Actions**: Track frequency of "Always show" / "Always hide" clicks
- **Management Page Visits**: 30%+ of users visit pantry management page within first month
- **Display Mode Usage**:
  - Shopping Mode: 70% of time (default, most useful)
  - Complete List: 25% of time (checking/reviewing)
  - Pantry Only: 5% of time (specific use case)

**Pre-Auth Conversion**:
- **Feature Discovery**: 80%+ of pre-auth users interact with pantry feature
- **Signup Trigger**: 25%+ of signups mention "save pantry" as reason
- **Limit Hits**: Track how many pre-auth users hit 20-item limit

**User Satisfaction**:
- **Support Tickets**: <5% of tickets related to pantry confusion
- **NPS Score**: Net Promoter Score > 40 for pantry feature
- **User Feedback**: Collect qualitative feedback via in-app survey

**Performance**:
- **Load Time**: Shopping list page loads in <2 seconds
- **Interaction Time**: Override actions complete in <100ms
- **Error Rate**: <1% of pantry actions result in errors

**Behavior Changes**:
- **Reduced Override Frequency**: Over time, users should need fewer manual overrides (system learns)
- **Shopping List Size**: Average shopping list size should decrease (fewer pantry items shown)
- **Time to Complete Setup**: Average time for onboarding should decrease (iterative improvement)

### Analytics Tracking Events

```javascript
// Track these events in analytics platform
trackEvent('pantry_onboarding_started', { source: 'shopping_list_generation' });
trackEvent('pantry_onboarding_completed', { items_selected: 13 });
trackEvent('pantry_onboarding_skipped', { source: 'shopping_list_generation' });

trackEvent('pantry_override_action', {
  action: 'force_show',
  item: 'salt',
  source: 'three_dot_menu'
});

trackEvent('display_mode_changed', {
  from: 'shopping',
  to: 'complete',
  pantry_count: 15
});

trackEvent('pantry_management_visited', { item_count: 13 });

trackEvent('pantry_limit_reached', { user_type: 'pre_auth', limit: 20 });

trackEvent('pre_auth_signup', {
  trigger: 'pantry_limit',
  pantry_items_to_migrate: 18
});
```

---

## Technical Constraints to Remember

**From Agent 1's Audit**:

### Database Schema Constraints
- `user_pantry_staples` table uses TEXT for `user_id` (Clerk migration)
- Must maintain UNIQUE constraint on (user_id, item_pattern)
- RLS policies require careful testing when adding new columns
- Consider index performance with large user bases

### API Capabilities
- All endpoints use Clerk authentication
- RLS automatically filters by `user_id`
- POST endpoint converts item_pattern to lowercase (maintain consistency)
- Duplicate handling returns 409 Conflict (UX must handle gracefully)

### Performance Considerations
- No pagination implemented (assumes <100 items per shopping list)
- Client-side filtering only (all items sent to browser)
- Redundant API calls after every mutation (refetch entire list)
- No caching strategy currently (fresh fetch every page load)

### Technical Debt (Acknowledged, Not Blocking)
- Hardcoded detection rules (16 patterns in frontend)
- Duplicate code between auth/pre-auth pages
- No error handling for network failures
- Race condition risk with rapid mutations
- No optimistic UI updates

### UK-Specific Requirements (Working Well)
- Units library properly implements metric system
- Terminology is consistently British (courgette, coriander)
- Categories align with UK supermarket layouts
- No need for imperial conversions

### Pre-Auth Storage Limits
- sessionStorage ~5MB limit (not an issue for pantry items)
- Data lost on tab close (by design, encourages signup)
- No cross-device sync (requires database)

---

## Questions for Stakeholder/Development Team

**Before Implementing Recommended Solution**:

### Onboarding Scope
1. **Mandatory vs Optional**: Should pantry onboarding be mandatory (modal blocks until completed) or skippable?
   - **Recommendation**: Optional with persistent reminder. Don't force users.

2. **Item Count**: Is 45 items too many for initial setup? Should we reduce to 30?
   - **Recommendation**: Keep 45 but allow categories to be collapsed. Most users will select 10-15.

3. **Timing**: When should onboarding appear?
   - A. First shopping list generation (blocks workflow)
   - B. After first shopping list created (gentle prompt)
   - C. From Settings only (user-initiated)
   - **Recommendation**: Option B (after first list, with banner prompt)

### Pre-Auth Experience
4. **Feature Parity**: How much pantry functionality should pre-auth users get?
   - **Recommendation**: 80% parity with 20-item limit. Good preview, not full access.

5. **Limit Enforcement**: When user hits 20-item limit, should we:
   - A. Block further additions (hard limit)
   - B. Allow but show upgrade prompt (soft limit)
   - C. Allow but truncate oldest items (rolling limit)
   - **Recommendation**: Option A (hard limit) with clear upgrade path.

6. **Migration Priority**: How important is seamless migration on signup?
   - **Recommendation**: Very important. Users will be frustrated losing work.

### Display Modes
7. **Third Mode (Pantry Only)**: Is this essential or nice-to-have?
   - **Recommendation**: Nice-to-have. Include in recommended solution but can be Phase 2.

8. **Default Mode**: Should Shopping Mode or Complete List be default?
   - **Recommendation**: Shopping Mode (hides pantry) for most users, but allow preference setting.

### Management Interface
9. **Location**: Settings page, standalone page, or modal from shopping list?
   - **Recommendation**: Settings page with quick access link from shopping list.

10. **Complexity**: Full-featured management (search, filter, bulk) or minimal?
    - **Recommendation**: Full-featured. Users need proper tools for 45+ items.

### Future Features
11. **WhatsApp Priority**: How soon do you want WhatsApp sharing?
    - **Recommendation**: Phase 2 (after core pantry works). Start with simple shareable link.

12. **Smart Learning**: Worth the AI complexity for automatic learning?
    - **Recommendation**: Phase 3 (6+ months). Simple frequency tracking first, ML later.

13. **Price Comparison**: Interest in supermarket API integration?
    - **Recommendation**: Investigate feasibility first. May not be available in UK.

### Database Design
14. **Three States vs Two Tables**: Preference for unified table or separate hide/show tables?
    - **Recommendation**: Unified table with preference enum. Simpler, more flexible.

15. **Migration Strategy**: Break database changes or backward compatible?
    - **Recommendation**: Backward compatible. Add column, migrate data, then deprecate old logic.

---

## Appendix: Competitive Research

### Apps Analyzed

Based on web search for meal planning apps with pantry management:

**1. MealBoard**
- **Pantry Feature**: Built-in pantry inventory
- **Shopping List**: Automatically adds items not in pantry
- **Best Practice**: Clear indication of what you have vs need
- **Learned**: Visual distinction between pantry and shopping items is crucial

**2. Cooklist**
- **Pantry Feature**: Digital pantry that syncs with grocery loyalty cards
- **Smart Detection**: Automatically downloads purchases into pantry
- **Best Practice**: Minimize manual entry (automation)
- **Learned**: Integration with real-world shopping reduces friction

**3. Plan to Eat**
- **Pantry Feature**: Pantry inventory with quantities
- **Shopping List**: Filters out pantry items
- **Best Practice**: Filter by dietary restrictions
- **Learned**: Search functionality essential for large pantries

**4. Pantry Check**
- **Pantry Feature**: Add/remove items from pantry, fridge, freezer
- **Barcode Scanner**: Quick add via barcode
- **Best Practice**: Separate locations (pantry vs fridge)
- **Learned**: Mobile-first design (scanning on-the-go)

### Common Patterns Identified

**✅ What Works Well**:
- **Visual Separation**: Clear distinction between pantry items and shopping needs
- **Quick Toggle**: Easy switch between "shopping mode" and "full list"
- **Search & Filter**: Essential for pantries with 30+ items
- **Barcode Scanning**: Speeds up pantry setup significantly
- **Smart Defaults**: Pre-populated lists based on common items
- **Checkbox Onboarding**: Low friction way to set up pantry

**❌ Anti-Patterns to Avoid**:
- **Too Many Categories**: 15+ categories overwhelming, hard to find items
- **Non-Customizable**: Fixed lists frustrate users ("Why can't I add X?")
- **Hidden Settings**: Pantry management buried 3 levels deep
- **No Visual Indicators**: Users forget what's in pantry vs shopping list
- **All-or-Nothing**: No partial quantities ("I have SOME olive oil, not enough")
- **Manual Entry Only**: Typing 45 items is tedious

### Industry Best Practices

**From UX Research on Grocery Apps**:

1. **Undo is Essential**: Users accidentally delete items, need easy recovery
2. **Customizable Categories**: Store layouts vary, let users reorganize
3. **Cloud Sync**: Multi-device access expected (shop on phone, plan on tablet)
4. **Offline Support**: Supermarkets often have poor signal
5. **Share Lists**: Families shop together, need collaborative lists
6. **Voice Input**: Hands-free adding while cooking
7. **Smart Suggestions**: "You buy X monthly, add to pantry?"

**From Meal Planning Apps**:

1. **Onboarding is Critical**: 70% of users abandon if setup is complex
2. **Progressive Disclosure**: Show advanced features gradually
3. **Contextual Help**: Tooltips and hints where users get stuck
4. **Social Proof**: "85% of users keep olive oil in pantry"
5. **Feedback Loops**: Show impact ("Saved 10 items from shopping list!")

---

## Final Recommendations Summary

### What to Build (Priority Order)

**Phase 1 (Weeks 1-2): Critical Fixes**
1. ✅ Three-state preference system (hide/show/auto)
2. ✅ Context-aware three-dot menu labels
3. ✅ Visual indicators for pantry items (badges, tint)
4. ✅ Override mechanism working end-to-end

**Phase 2 (Weeks 3-4): Core Features**
1. ✅ Pantry onboarding modal (45 UK items, checkbox-based)
2. ✅ Pantry management page in Settings (full CRUD)
3. ✅ Pre-auth support (20-item limit, sessionStorage)
4. ✅ Migration logic (playground → database on signup)
5. ✅ Enhanced shopping list UI (third toggle, better badges)
6. ✅ Mobile-responsive adjustments

**Phase 3 (Weeks 5-6): Polish**
1. ✅ Smart suggestions ("Add olive oil to pantry?")
2. ✅ Bulk actions (clear all, import from history)
3. ✅ Performance optimizations (optimistic UI)
4. ✅ Accessibility improvements
5. ✅ Analytics tracking

**Phase 4 (Future): Advanced**
1. 🔮 WhatsApp sharing (shareable links)
2. 🔮 Learning from user behavior
3. 🔮 Recipe pantry assumptions
4. 🔮 Barcode scanner for setup
5. 🔮 Household sharing

### What to Avoid

**Don't Implement (Too Complex for MVP)**:
- ❌ Image recognition pantry scanner (Option 3)
- ❌ Supermarket price comparison (API availability uncertain)
- ❌ Machine learning preference detection (Phase 4)
- ❌ Threshold customization per item (adds complexity)
- ❌ Partial quantities ("I have some") (confusing UX)

**Don't Over-Engineer**:
- ❌ More than 3 display modes (Shopping, Complete, Pantry Only is enough)
- ❌ Separate exclusions table (unified preferences table simpler)
- ❌ Server-side filtering (client-side works fine for <100 items)
- ❌ Real-time sync (eventual consistency acceptable)

### Success Definition

**This redesign is successful if**:
1. ✅ Users can override any default rule (bug fixed)
2. ✅ 60%+ complete pantry onboarding (good adoption)
3. ✅ <5% support tickets about pantry confusion (clear UX)
4. ✅ Pre-auth users engage with feature (good preview)
5. ✅ System stands strong for 6-12 months (long-term solution)
6. ✅ Shopping lists look clean and useful (stakeholder requirement)
7. ✅ Users understand pantry concept quickly (ease of understanding)
8. ✅ Easy to customize and edit (ease of personalization)

### Next Steps

**For Stakeholder**:
1. Review this document thoroughly
2. Answer questions in "Questions for Stakeholder" section
3. Approve recommended solution (Option 2) or request changes
4. Prioritize Phase 1 vs Phase 2 timeline

**For Development Team**:
1. Review technical constraints and feasibility
2. Estimate effort for each phase
3. Flag any technical concerns or blockers
4. Propose database migration strategy

**For Designer (Me)**:
1. Await stakeholder approval
2. Create high-fidelity mockups (Figma/Sketch)
3. Prepare interactive prototype for user testing
4. Document component library updates

---

**Document Complete**
**Status**: Ready for Stakeholder Review
**Next Action**: Schedule review meeting to discuss recommendations

---

## Appendix B: UK Pantry Research Sources

**Researched Sources**:
1. Jamie Oliver - "Store-cupboard essentials for families"
2. Sainsbury's - "Food Cupboard Essentials" category
3. Good Housekeeping UK - "16 store cupboard staples"
4. British Heart Foundation - "Heart Matters" magazine
5. Mumsnet - "Store Cupboard Essentials List"
6. Jolly Posh Foods - "British Food Staples to Buy in Bulk"

**Key Insights**:
- **British-Specific Items**: HP sauce, Colman's mustard, Heinz beans, Marmite
- **Spice Preferences**: Garam masala and curry powder very common (UK Indian cuisine influence)
- **Baking Culture**: Strong bread flour, self-raising flour essential (home baking popular)
- **Tea Nation**: PG Tips mentioned multiple times (not relevant for pantry app but shows cultural context)

**Regional Variations** (Not Implemented, but Noted):
- Scotland: Oats more common (porridge culture)
- London: More international ingredients (tahini, harissa)
- Rural: More traditional British items (HP sauce, golden syrup)

**Seasonality** (Potential Future Feature):
- Christmas: Dried fruit, mixed spice, icing sugar
- Summer: BBQ sauces, marinades
- Autumn: Apples (for crumbles), cinnamon

**Measurement Preferences**:
- Metric primarily (grams, litres)
- Some imperial holdovers (pint of milk, pound of butter)
- Teaspoon/tablespoon universal (metric equivalent unclear to most)
