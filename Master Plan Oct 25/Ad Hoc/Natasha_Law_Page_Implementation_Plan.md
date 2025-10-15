# Natasha's Law Information Page - Implementation Plan

**Date:** October 14, 2025
**Project:** Recipe App (Plate Wise)
**Purpose:** Create educational page about Natasha's Law and UK food allergens to build user trust and demonstrate professional compliance

**Research Document:** See `Natasha_Law_Research_Report.md` in this directory

---

## Executive Summary

### What We're Building

A dedicated informational page about Natasha's Law and the 14 UK food allergens, accessible from our onboarding process and linked throughout the app. This page will:

1. **Educate users** about why we collect allergen information
2. **Build trust** by demonstrating we take food safety seriously
3. **Provide value** beyond our core features (safety education)
4. **Demonstrate compliance** with UK food safety best practices
5. **Honor Natasha's legacy** by raising awareness of food allergen risks

### Why This Matters

**Current State:**
- Our app has excellent allergen functionality (onboarding, filtering, warnings)
- We collect health data (allergen information) under UK GDPR
- Users may wonder: "Why do they need to know my allergies?"

**Gap:**
- No educational content explaining our approach to allergen safety
- Missing opportunity to build trust through transparency
- No link to external resources for users managing allergies

**Impact:**
- Demonstrates professionalism and care for user safety
- Differentiates us from competitors who ignore allergen education
- Reduces liability through proper disclaimers and user education
- Builds brand trust for UK market (Natasha's Law is well-known)

---

## Background Context

### Natasha's Law Summary

**What happened:**
- July 17, 2016: Natasha Ednan-Laperouse (15) died from anaphylactic shock after eating a Pret a Manger baguette containing undeclared sesame
- September 2018: Inquest found Pret's allergen labelling "inadequate"
- October 1, 2021: Natasha's Law came into force requiring full ingredient listing with allergen emphasis on PPDS (Prepacked for Direct Sale) foods

**Why it matters to us:**
- While we don't sell PPDS foods, we have a **duty of care** to provide accurate allergen information
- Allergen data is **health data under UK GDPR** requiring explicit consent and robust protection
- Users with food allergies trust apps like ours to keep them safe
- **10 people die annually** in the UK from food-induced anaphylaxis due to undeclared allergens

### The 14 Major UK Allergens

1. Celery
2. Cereals containing gluten (wheat, rye, barley, oats)
3. Crustaceans (prawns, crab, lobster)
4. Eggs
5. Fish
6. Lupin
7. Milk (dairy)
8. Molluscs (squid, mussels, oysters)
9. Mustard
10. Peanuts
11. Sesame
12. Soybeans (soya)
13. Sulphur dioxide and sulphites (>10mg/kg)
14. Tree nuts (almonds, hazelnuts, walnuts, etc.)

**Critical Statistics:**
- 2.4 million UK adults have clinically confirmed food allergies
- Food allergy prevalence has more than doubled in the UK over the past decade
- Hospital admissions for anaphylaxis increased 108% from 2002-2023
- **Cow's milk** (not peanuts/tree nuts) causes the most fatal allergic reactions in the UK
- Young adults are the highest risk group for severe and fatal reactions

---

## Implementation Plan

### Phase 1: Core Content Pages (Week 1)

#### Task 1.1: Create Main Allergen Information Page

**File:** `/frontend/src/app/allergen-information/page.tsx`

**Page Structure:**

```tsx
// Page sections (from top to bottom):

1. Hero Section
   - Clear headline: "Understanding Food Allergens & Natasha's Law"
   - Brief subtitle: "Why we take allergen information seriously"
   - Visual: Icon or illustration (not photo of Natasha - keep it respectful)

2. Quick Navigation
   - Jump links to main sections
   - "What is Natasha's Law" | "The 14 Allergens" | "Why We Ask" | "Your Safety"

3. Natasha's Law Section
   - "What is Natasha's Law?" heading
   - Origin story (sensitively written - see research report lines 26-45)
   - Timeline graphic (2016 → 2018 → 2021)
   - Legal requirements (for context, not because we're regulated)
   - "How this protects consumers" subsection

4. The 14 Major Allergens
   - Introduction paragraph
   - Grid/List of expandable allergen cards (see Task 1.2)
   - Each card contains:
     * Allergen name
     * What it includes
     * Common foods
     * Prevalence/severity
     * Cross-contamination notes

5. Why We Ask About Your Allergies
   - Our duty of care
   - How we use the information:
     * Filter recipes during AI generation
     * Highlight allergens in recipe ingredients
     * Prevent showing unsafe recipes
     * Help you plan safe meals
   - What we DON'T do:
     * Share with third parties
     * Use for advertising
     * Store insecurely
   - Data protection commitment (UK GDPR compliance)

6. Your Safety Matters
   - Home cooking considerations
   - Cross-contamination risks
   - Emergency guidance (link to separate page)
   - "Always verify ingredients" message
   - Our limitations (disclaimer)

7. External Resources
   - Food Standards Agency (FSA)
   - Natasha Allergy Research Foundation (NARF)
   - Allergy UK
   - Anaphylaxis UK
   - NHS food allergy guidance
   - Each with logo, description, link

8. Footer Call-to-Action
   - "Ready to get started?"
   - Button: "Set up your allergen profile"
   - Or "Return to onboarding" if coming from onboarding flow
```

**Content Tone:**
- Professional but empathetic
- Educational, not preachy
- UK-focused language and examples
- Avoid sensationalism about Natasha's story
- Empowering ("We'll help you cook safely") not fear-based

**Technical Requirements:**
- Mobile-first responsive design
- Semantic HTML (proper heading hierarchy)
- ARIA labels for accessibility
- Meta tags for SEO
- Open Graph tags for social sharing
- Structured data markup (health/safety information)

**SEO Optimization:**
```tsx
export const metadata = {
  title: 'Understanding Food Allergens & Natasha\'s Law | Plate Wise',
  description: 'Learn about the 14 major UK food allergens and Natasha\'s Law. We explain why we take allergen information seriously and how we keep you safe.',
  keywords: 'Natasha\'s Law, UK food allergens, food allergies, allergen safety, recipe app',
  openGraph: {
    title: 'Understanding Food Allergens & Natasha\'s Law',
    description: 'Educational resource about UK food allergen regulations and safety',
    type: 'article'
  }
}
```

---

#### Task 1.2: Create Allergen Card Component

**File:** `/frontend/src/components/allergen-info/AllergenCard.tsx`

**Props Interface:**
```typescript
interface AllergenCardProps {
  allergen: {
    id: string;
    name: string;
    includes: string[];
    commonFoods: string[];
    whyMajorAllergen: string;
    prevalence: string;
    crossContamination: string;
  };
  defaultExpanded?: boolean;
}
```

**Features:**
- Expandable/collapsible design (accordion pattern)
- Icon for each allergen (if available)
- Smooth animation on expand/collapse
- Mobile-friendly touch targets
- Accessible (keyboard navigation, screen reader support)

**Visual Design:**
- Card border color matches severity (red for high-risk, amber for common)
- Clear typography hierarchy
- Ample white space
- Easy to scan when collapsed
- Detailed when expanded

---

#### Task 1.3: Create Natasha's Story Section Component

**File:** `/frontend/src/components/allergen-info/NatashaStorySection.tsx`

**Content Guidelines:**
- Respectful, sensitive tone
- Focus on the impact and change, not graphic details
- Include:
  * Brief timeline of events (July 2016 → Law passes → October 2021 implementation)
  * The gap in regulations that existed
  * How Natasha's parents campaigned for change
  * The legacy: How the law protects consumers today
- Visual: Timeline graphic (not photos of Natasha or her family)
- Link to NARF (Natasha Allergy Research Foundation) for more information

**Example Structure:**
```tsx
<section className="bg-card border rounded-lg p-6 space-y-4">
  <h2>Natasha's Law: A Legacy of Change</h2>

  <p className="text-muted-foreground">
    Natasha's Law is named after Natasha Ednan-Laperouse, whose tragic death
    in 2016 led to landmark changes in UK food labelling regulations.
  </p>

  {/* Timeline component */}
  <Timeline events={natashaLawTimeline} />

  <div className="border-l-4 border-primary pl-4 italic">
    "If Natasha's Law saves just one life, then we've achieved what we set out to do."
    — Nadim Ednan-Laperouse, Natasha's father
  </div>

  <p>
    Today, Natasha's legacy lives on through improved food safety regulations
    that protect millions of people with food allergies across the UK.
  </p>

  <Button variant="outline" asChild>
    <a href="https://www.narf.org.uk" target="_blank">
      Learn more at the Natasha Allergy Research Foundation →
    </a>
  </Button>
</section>
```

---

#### Task 1.4: Integrate Link from Onboarding

**File:** `/frontend/src/components/onboarding/allergy-step.tsx`

**Changes Required:**

1. Add a "Learn more" link after the safety warning (after line 50):

```tsx
<div className="space-y-6">
  {/* Existing safety warning box (lines 41-50) */}
  <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
    {/* ... existing warning ... */}
  </div>

  {/* NEW: Educational link */}
  <div className="text-center">
    <Link
      href="/allergen-information"
      target="_blank"
      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
    >
      <InfoIcon className="h-4 w-4" />
      Why do we ask about allergens? Learn about Natasha's Law
      <ExternalLinkIcon className="h-3 w-3" />
    </Link>
  </div>

  {/* Existing allergen checkboxes (line 52+) */}
  <div className="space-y-4">
    {/* ... */}
  </div>
</div>
```

2. Alternative approach: Add a small info button next to the "Select your allergens" label:

```tsx
<div className="flex items-center justify-between">
  <Label className="text-base">Select your allergens (if any):</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="sm" className="h-auto p-1">
        <InfoIcon className="h-4 w-4 text-muted-foreground" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <div className="space-y-2">
        <h4 className="font-medium">Why we ask about allergens</h4>
        <p className="text-sm text-muted-foreground">
          We take food safety seriously. Your allergen information helps us
          filter recipes and keep you safe.
        </p>
        <Button variant="link" className="p-0 h-auto" asChild>
          <Link href="/allergen-information" target="_blank">
            Learn more about Natasha's Law →
          </Link>
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</div>
```

**Recommendation:** Use both approaches:
- Info button (popover) for quick inline explanation
- Text link below warning box for those who want to read more

---

### Phase 2: Enhanced Safety Features (Week 2)

#### Task 2.1: Create Safety Disclaimer Component

**File:** `/frontend/src/components/ui/safety-disclaimer.tsx`

**Purpose:** Reusable disclaimer component for use across the app

**Props Interface:**
```typescript
interface SafetyDisclaimerProps {
  variant?: 'compact' | 'full' | 'modal';
  context?: 'recipe' | 'profile' | 'generation' | 'general';
  className?: string;
}
```

**Variants:**

1. **Compact** (for recipe cards):
```tsx
<SafetyDisclaimer variant="compact" context="recipe">
  ⚠️ Always verify ingredients. We cannot guarantee allergen-free recipes.
  <Link>Read full disclaimer</Link>
</SafetyDisclaimer>
```

2. **Full** (for allergen settings page):
```tsx
<SafetyDisclaimer variant="full" context="profile">
  {/* Full multi-paragraph disclaimer */}
</SafetyDisclaimer>
```

3. **Modal** (shown before first recipe generation):
```tsx
<SafetyDisclaimer variant="modal" context="generation">
  {/* Comprehensive disclaimer requiring acknowledgment */}
  <Checkbox>I understand and accept these limitations</Checkbox>
  <Button>Continue</Button>
</SafetyDisclaimer>
```

**Content Sections:**
```markdown
1. USER RESPONSIBILITY
   - Verify ingredient safety and allergen information
   - Ensure proper cooking temperatures
   - Adapt recipes to specific dietary needs
   - Check all packaged ingredients for allergen warnings

2. NO WARRANTIES
   - Recipes provided "AS IS"
   - No guarantee of safety, accuracy, or suitability
   - Cross-contamination and hidden allergens may occur

3. ALLERGEN WARNING
   - While we flag common allergens, errors can occur
   - Manufacturers may change ingredients without notice
   - Always read product labels

4. EMERGENCY
   - Know your allergy action plan
   - Carry adrenaline auto-injector if prescribed
   - Call 999 immediately for severe reactions

5. CONSULT PROFESSIONALS
   - Not a substitute for medical advice
   - Consult healthcare professionals for dietary needs
```

**Visual Design:**
- Warning icon (⚠️)
- Amber/yellow color scheme (not red - don't scare users)
- Clear, scannable formatting
- "Read more" expandable sections for full variant
- Checkbox acknowledgment for modal variant

---

#### Task 2.2: Create Emergency Information Page

**File:** `/frontend/src/app/food-allergy-safety/page.tsx`

**Page Structure:**

```tsx
1. Hero Section
   - "Food Allergy Safety Guide"
   - "Essential information for managing food allergies"

2. Recognizing Allergic Reactions
   - Mild symptoms (itching, hives, stomach ache)
   - Moderate symptoms (swelling, multiple body areas affected)
   - Severe symptoms (anaphylaxis: breathing difficulty, drop in blood pressure, loss of consciousness)
   - Visual infographic showing symptom progression

3. Emergency Response
   - When to use adrenaline auto-injector (EpiPen, Jext, Emerade)
   - How to use it (step-by-step with illustrations)
   - When to call 999 (always after using auto-injector, even if symptoms improve)
   - What to tell emergency services
   - Position to place person (lying down with legs raised if possible)

4. Preventing Cross-Contamination
   - Kitchen safety tips
   - Separate preparation areas
   - Equipment cleaning protocols
   - Storage considerations
   - Reading food labels effectively

5. Living with Food Allergies
   - Meal planning strategies
   - Eating out safely
   - Travelling with allergies
   - School and workplace considerations

6. External Resources
   - NHS Anaphylaxis Guidance (primary link)
   - Anaphylaxis UK Action Plans
   - Allergy UK Resources
   - NARF Research Updates
   - Each with description and link

7. Disclaimer
   - "This information is for educational purposes only"
   - "Not a substitute for medical advice"
   - "Consult your GP or allergist for personalized advice"
```

**Critical Content from Research:**
- "Even tiny amounts of food protein can cause reactions"
- "Cooking does NOT reduce or eliminate allergen proteins"
- "Airborne proteins from cooking (fish, shellfish) can trigger reactions"
- "Hand sanitizer is NOT sufficient - must use soap and water"

**Content Sources:**
- NHS website (official medical guidance)
- Anaphylaxis UK emergency action plans
- Research report lines 1232-1273 (home kitchen safety)

---

#### Task 2.3: Add Disclaimers to Key Pages

**Locations to add disclaimers:**

1. **Recipe Generation Results** (`/app/recipes/generate/page.tsx`):
   - Compact disclaimer at top of results
   - "Recipes are AI-generated suggestions. Always verify ingredients."

2. **Recipe Detail Pages** (`/app/recipes/[id]/page.tsx`):
   - Full disclaimer in collapsible section at bottom
   - Link to emergency information page

3. **User Profile Allergen Settings** (`/app/profile/allergies/page.tsx`):
   - Full disclaimer before allergen selection form
   - Explanation of how data is used and protected (GDPR)

4. **First-Time Recipe Generation** (modal):
   - Show modal before first AI generation
   - Require checkbox acknowledgment
   - Store in user profile: `shown_recipe_disclaimer: true`
   - Don't show again for returning users

**Implementation:**
```tsx
// Example for first-time modal
const [showDisclaimer, setShowDisclaimer] = useState(false);

useEffect(() => {
  const hasSeenDisclaimer = localStorage.getItem('recipe_disclaimer_acknowledged');
  if (!hasSeenDisclaimer && isGeneratingRecipe) {
    setShowDisclaimer(true);
  }
}, [isGeneratingRecipe]);

<Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Before We Generate Your Recipes</DialogTitle>
    </DialogHeader>
    <SafetyDisclaimer variant="modal" context="generation" />
    <DialogFooter>
      <Button onClick={() => {
        localStorage.setItem('recipe_disclaimer_acknowledged', 'true');
        setShowDisclaimer(false);
        proceedWithGeneration();
      }}>
        I understand, continue
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Phase 3: Legal & Compliance (Week 3)

#### Task 3.1: Update Privacy Policy

**File:** `/frontend/src/app/legal/privacy/page.tsx` (or wherever privacy policy lives)

**New Section to Add:**

```markdown
## Health Data and Allergen Information

### What We Collect
When you use Plate Wise, you may provide information about food allergies,
dietary restrictions, and other health-related preferences. Under UK GDPR,
this information is classified as "special category data" (health data) and
receives enhanced protection.

### Why We Collect It
We collect allergen information solely to:
- Filter recipes to exclude ingredients you cannot safely eat
- Highlight potential allergen risks in recipes
- Personalize meal suggestions to your dietary needs
- Ensure the safety of AI-generated recipe recommendations

### Legal Basis for Processing
We process your health data based on your **explicit consent** (UK GDPR Article 9(2)(a)).
You provide this consent during onboarding when you choose to enter your allergen
information.

### How We Protect Your Data
Your allergen information is:
- Encrypted in transit and at rest
- Stored securely in UK-based data centers (Supabase EU region)
- Never shared with third parties without your consent
- Never used for advertising or marketing
- Accessible only to you and our secure systems

### Your Rights
You have the right to:
- **Access** your allergen data at any time (Profile > Allergen Settings)
- **Modify** your allergen information whenever you need to
- **Delete** your allergen data (removes all allergen information)
- **Withdraw consent** (same as deleting your allergen data)
- **Export** your data (Settings > Download My Data)

To exercise these rights, visit your Profile settings or contact us at
privacy@platewise.co.uk.

### Data Retention
We retain your allergen information for as long as your account is active.
If you delete your account, all allergen data is permanently deleted within
30 days.

### Important Disclaimer
While we strive to provide accurate allergen information, we cannot guarantee
that all recipes are safe for your specific allergies. You are solely responsible
for verifying ingredients before consuming any food. See our full Terms of Service
for details.

### Changes to This Policy
If we make material changes to how we handle allergen data, we will notify you
by email and require renewed consent.

Last updated: [Date]
```

---

#### Task 3.2: Update Terms of Service

**File:** `/frontend/src/app/legal/terms/page.tsx`

**New Section to Add:**

```markdown
## Recipe Safety and Allergen Information

### User Responsibility
All recipes provided through Plate Wise are suggestions only. You are solely
responsible for:
- Verifying the safety and suitability of ingredients
- Checking packaged ingredients for allergen warnings
- Ensuring proper cooking temperatures and food safety practices
- Adapting recipes to your specific dietary needs and restrictions
- Consulting healthcare professionals regarding dietary requirements

### No Warranties
Recipes are provided "AS IS" without any warranty of any kind. We do not
guarantee:
- Recipe safety, accuracy, or suitability for your needs
- Absence of allergens or specific ingredients
- Nutritional information accuracy
- Cooking times or results

### Allergen Information
While we attempt to flag common allergens and filter recipes based on your
profile, you acknowledge that:
- Allergen information may be incomplete or inaccurate
- Manufacturers may change ingredients without notice
- Cross-contamination can occur in home kitchens
- Hidden allergens may be present in recipes
- AI-generated recipes may contain errors

**IMPORTANT:** Always verify ingredients if you have food allergies. Do not
rely solely on our allergen filtering.

### Limitation of Liability
To the fullest extent permitted by law, Plate Wise and its operators shall not
be liable for any harm, injury, allergic reaction, or other damage arising from
your use of recipes or allergen information provided through the service.

This limitation applies even if we have been advised of the possibility of such
damages.

### Emergency Situations
In case of allergic reaction:
1. Follow your allergy action plan
2. Use your adrenaline auto-injector if prescribed
3. Call 999 immediately for severe reactions
4. Do not delay seeking medical help

### Compliance with Laws
While Natasha's Law (Food Information Amendment Regulations 2019) does not
directly apply to recipe applications, we strive to follow its principles of
allergen transparency and consumer safety.

### Changes to Recipes
We may update, modify, or remove recipes at any time without notice. You should
not rely on the continued availability of any specific recipe.

### Medical Advice Disclaimer
Plate Wise is not a substitute for professional medical, nutritional, or dietary
advice. Always consult qualified healthcare professionals regarding food allergies,
dietary restrictions, or health conditions.

Last updated: [Date]
```

---

#### Task 3.3: Create Consent Flow for Allergen Data

**File:** `/frontend/src/components/onboarding/consent-step.tsx`

**Current Implementation:** Already exists in onboarding (lines 163-167 in page.tsx)

**Enhancement Needed:** Make allergen data consent more explicit

**Updated Consent Interface:**
```typescript
interface Consents {
  essential: boolean; // Required - basic app functionality
  personalization: boolean; // Optional - behavior tracking
  analytics: boolean; // Optional - usage analytics
  allergen_storage: boolean; // NEW - explicit consent for health data
}
```

**Updated Consent Step UI:**
```tsx
<div className="space-y-6">
  {/* Essential consent (required) */}
  <div className="p-4 border rounded-lg bg-card">
    <div className="flex items-start gap-3">
      <Checkbox
        checked={true}
        disabled
        id="consent-essential"
      />
      <div className="flex-1">
        <Label htmlFor="consent-essential" className="font-medium">
          Essential Functionality (Required)
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Store your account information and basic preferences to make the app work.
        </p>
      </div>
    </div>
  </div>

  {/* NEW: Allergen data consent (required if user enters allergies) */}
  <div className="p-4 border-2 border-amber-500/30 rounded-lg bg-amber-500/5">
    <div className="flex items-start gap-3">
      <Checkbox
        checked={consents.allergen_storage}
        onCheckedChange={(checked) => onChange({
          ...consents,
          allergen_storage: checked as boolean
        })}
        id="consent-allergen"
      />
      <div className="flex-1">
        <Label htmlFor="consent-allergen" className="font-medium flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-500" />
          Allergen Information Storage (Required for safety features)
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Store your allergen and dietary restriction information (health data under UK GDPR)
          to filter recipes and keep you safe. You can modify or delete this at any time.
        </p>
        <Button variant="link" className="p-0 h-auto text-xs mt-2" asChild>
          <Link href="/allergen-information" target="_blank">
            Why do we collect this? Learn about Natasha's Law →
          </Link>
        </Button>
      </div>
    </div>
  </div>

  {/* Personalization consent (optional) */}
  <div className="p-4 border rounded-lg bg-card">
    <div className="flex items-start gap-3">
      <Checkbox
        checked={consents.personalization}
        onCheckedChange={(checked) => onChange({
          ...consents,
          personalization: checked as boolean
        })}
        id="consent-personalization"
      />
      <div className="flex-1">
        <Label htmlFor="consent-personalization" className="font-medium">
          Personalized Recommendations (Optional)
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Track which recipes you like to suggest better recipes. This helps us
          learn your preferences over time.
        </p>
      </div>
    </div>
  </div>

  {/* Analytics consent (optional) */}
  <div className="p-4 border rounded-lg bg-card">
    <div className="flex items-start gap-3">
      <Checkbox
        checked={consents.analytics}
        onCheckedChange={(checked) => onChange({
          ...consents,
          analytics: checked as boolean
        })}
        id="consent-analytics"
      />
      <div className="flex-1">
        <Label htmlFor="consent-analytics" className="font-medium">
          Anonymous Usage Analytics (Optional)
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Help us improve the app by sharing anonymous usage data. No personal
          information is included.
        </p>
      </div>
    </div>
  </div>

  {/* Legal links */}
  <p className="text-xs text-muted-foreground text-center">
    By continuing, you agree to our{' '}
    <Link href="/legal/terms" className="underline" target="_blank">Terms of Service</Link>
    {' '}and{' '}
    <Link href="/legal/privacy" className="underline" target="_blank">Privacy Policy</Link>.
  </p>
</div>
```

**Validation Logic:**
```typescript
const canProceed = () => {
  // Essential consent is always required
  if (!consents.essential) return false;

  // If user has entered allergens, allergen_storage consent is required
  if (formData.allergies.length > 0 && !consents.allergen_storage) {
    return false;
  }

  return true;
};
```

---

### Phase 4: Polish & Testing (Week 4)

#### Task 4.1: Accessibility Audit

**Areas to Test:**

1. **Keyboard Navigation**
   - All interactive elements reachable via Tab
   - Logical tab order
   - Focus visible on all elements
   - Escape key closes modals/popovers

2. **Screen Reader Support**
   - Proper heading hierarchy (h1 → h2 → h3, no skips)
   - ARIA labels on icons and buttons
   - ARIA landmarks (main, nav, aside)
   - Alt text on all images
   - Form labels properly associated

3. **Visual Accessibility**
   - Color contrast ≥4.5:1 for normal text
   - Color contrast ≥3:1 for large text
   - Information not conveyed by color alone
   - Text resizable to 200% without breaking layout
   - No content lost at 320px viewport width

4. **Content Accessibility**
   - Plain language (avoid jargon)
   - Short sentences and paragraphs
   - Bullet points for lists
   - Clear headings
   - Reading level appropriate for general audience

**Tools:**
- Browser DevTools Lighthouse
- axe DevTools browser extension
- NVDA or JAWS screen reader testing
- Keyboard-only navigation testing

**Target:** WCAG 2.1 Level AA compliance

---

#### Task 4.2: Mobile Responsive Testing

**Test Scenarios:**

1. **Viewport Sizes:**
   - 320px (iPhone SE)
   - 375px (iPhone 12/13)
   - 390px (iPhone 14 Pro)
   - 414px (iPhone 14 Pro Max)
   - 768px (iPad portrait)
   - 1024px (iPad landscape)

2. **Content Checks:**
   - No horizontal scrolling
   - Touch targets ≥44×44px
   - Text readable without zooming
   - Forms easy to fill on mobile
   - Expandable sections work smoothly
   - External links open in new tab with indicator

3. **Performance:**
   - Page load time <3 seconds on 4G
   - Images optimized (WebP format, lazy loading)
   - No layout shift (CLS <0.1)
   - Smooth scrolling and animations

**Testing Tools:**
- Chrome DevTools Device Mode
- Real device testing (iOS and Android)
- Lighthouse mobile performance audit

---

#### Task 4.3: User Testing

**Participants:** 5-10 users, including:
- 2-3 people with food allergies
- 2-3 parents cooking for families
- 1-2 health-conscious individuals
- Mix of ages and tech proficiency

**Test Scenarios:**

1. **Finding Information:**
   - "You want to understand why the app asks about allergens. How would you find this information?"
   - Success: Find link from onboarding and navigate to page

2. **Understanding Natasha's Law:**
   - "Can you explain in your own words what Natasha's Law is?"
   - Success: Understands basic concept and why it matters

3. **Finding Allergen Details:**
   - "You're allergic to tree nuts. Find information about what foods contain tree nuts."
   - Success: Expands tree nuts card and reads content

4. **Trust and Confidence:**
   - "After reading this page, how confident do you feel that the app takes allergen safety seriously?"
   - Success: 4-5 rating on 5-point scale

5. **Action Items:**
   - "What would you do if you had an allergic reaction?"
   - Success: Mentions emergency page or external resources

**Metrics:**
- Time to find information (target: <2 minutes)
- Comprehension (target: 80% can explain Natasha's Law)
- Trust rating (target: average 4+/5)
- Would recommend to friend with allergies (target: 80% yes)

**Feedback Collection:**
- Verbal think-aloud during testing
- Post-test survey (System Usability Scale)
- Open-ended questions about clarity and usefulness

---

#### Task 4.4: Analytics Implementation

**File:** `/frontend/src/lib/analytics.ts`

**Events to Track:**

```typescript
// Page views
trackPageView('allergen_information');
trackPageView('food_allergy_safety');

// User interactions
trackEvent('allergen_info_viewed', {
  source: 'onboarding' | 'navigation' | 'footer' | 'direct',
  user_has_allergies: boolean
});

trackEvent('allergen_card_expanded', {
  allergen_name: string,
  duration_seconds: number
});

trackEvent('external_resource_clicked', {
  resource_name: string,
  resource_url: string
});

trackEvent('emergency_info_viewed', {
  user_has_allergies: boolean
});

trackEvent('disclaimer_acknowledged', {
  disclaimer_type: 'recipe' | 'profile' | 'generation',
  timestamp: Date
});

// Engagement metrics
trackEvent('allergen_info_read_time', {
  duration_seconds: number,
  scroll_depth_percent: number
});

// Drop-off analysis
trackEvent('allergen_info_bounced', {
  time_on_page_seconds: number,
  scroll_depth_percent: number
});
```

**Dashboards to Create:**

1. **Page Performance:**
   - Page views over time
   - Average time on page
   - Scroll depth distribution
   - Bounce rate

2. **User Engagement:**
   - % of onboarding users who click "Learn more"
   - Most expanded allergen cards
   - External resource click-through rate
   - Emergency info page views

3. **Trust Indicators:**
   - Users who return to allergen info page
   - Correlation: allergen info view → onboarding completion
   - Correlation: allergen info view → recipe generation

4. **Content Effectiveness:**
   - Heatmap of interactions
   - Drop-off points (where users leave)
   - A/B test: Different CTA wording

**Goals:**
- 40%+ of onboarding users click "Learn more about allergens"
- Average time on page >2 minutes (indicates reading)
- <20% bounce rate
- 80%+ scroll depth for engaged users

---

## Content Guidelines

### Writing Style

**Tone:**
- Professional but approachable
- Empathetic and understanding
- Educational without being condescending
- Empowering, not fear-based
- UK English spelling and terminology

**Language:**
- Short sentences (15-20 words average)
- Active voice ("We filter recipes" not "Recipes are filtered")
- Second person ("your allergies" not "user allergies")
- Plain language (avoid medical jargon)
- Explain necessary technical terms

**Structure:**
- Clear hierarchy (h1 → h2 → h3)
- Short paragraphs (3-4 sentences max)
- Bullet points for lists
- Whitespace between sections
- Bold for key points (sparingly)

### Inclusive Language

**Do:**
- "People with food allergies" (person-first language)
- "Living with allergies"
- "Managing dietary restrictions"
- "Allergen-free alternatives"

**Don't:**
- "Allergic people" (avoid identity-first for medical conditions)
- "Suffering from allergies" (negative framing)
- "Normal food" vs "allergy food" (othering language)

### Emotional Sensitivity

**Natasha's Story:**
- Focus on legacy and positive change
- Avoid graphic descriptions of her death
- Respectful to her family and memory
- Emphasize impact: How the law helps others

**User Anxiety:**
- Acknowledge that food allergies are serious
- Provide actionable information (not just warnings)
- Balance caution with empowerment
- Offer resources for support

### Legal Precision

**When discussing compliance:**
- Use "we strive to" not "we guarantee"
- "Best practices" not "requirements" (since we're not regulated)
- "Duty of care" appropriate for our context
- Link to official sources for legal information

**Disclaimers:**
- Clear but not alarmist
- Prominent placement
- Plain language (not legalese)
- Explain user responsibilities

---

## Technical Specifications

### File Structure

```
frontend/src/
├── app/
│   ├── allergen-information/
│   │   ├── page.tsx (Main content page)
│   │   ├── layout.tsx (If special layout needed)
│   │   └── opengraph-image.png (Social sharing image)
│   ├── food-allergy-safety/
│   │   ├── page.tsx (Emergency information)
│   │   └── opengraph-image.png
│   └── legal/
│       ├── privacy/page.tsx (Update with allergen section)
│       └── terms/page.tsx (Update with safety disclaimers)
├── components/
│   ├── allergen-info/
│   │   ├── AllergenCard.tsx
│   │   ├── NatashaStorySection.tsx
│   │   ├── ExternalResourcesSection.tsx
│   │   ├── SafetySummary.tsx
│   │   └── AllergenGrid.tsx
│   ├── ui/
│   │   └── safety-disclaimer.tsx (Reusable disclaimer)
│   └── onboarding/
│       └── allergy-step.tsx (Update with link)
├── lib/
│   ├── allergen-data.ts (Data for 14 allergens)
│   └── analytics.ts (Tracking functions)
└── types/
    └── allergen.ts (TypeScript interfaces)
```

### Data Structure

**File:** `/frontend/src/lib/allergen-data.ts`

```typescript
export interface AllergenDetail {
  id: string;
  name: string;
  description: string;
  includes: string[];
  commonFoods: string[];
  whyMajorAllergen: string;
  prevalence: string;
  severity: 'high' | 'medium' | 'low';
  crossContaminationRisk: string;
  alternativeNames: string[];
  resources: {
    title: string;
    url: string;
    description: string;
  }[];
}

export const UK_ALLERGEN_DETAILS: AllergenDetail[] = [
  {
    id: 'peanuts',
    name: 'Peanuts',
    description: 'Peanuts (groundnuts) and all peanut products including peanut butter, oil, and flour.',
    includes: ['Peanuts (groundnuts)', 'Peanut butter and spreads', 'Peanut oil', 'Peanut flour and protein'],
    commonFoods: [
      'Peanut butter and spreads',
      'Satay sauce and Asian dishes',
      'Confectionery and chocolate bars',
      'Cookies and baked goods',
      'Breakfast cereals and granola',
      'Ice cream and desserts',
      'Vegetarian products (meat substitutes)',
      'Some sauces and marinades',
      'Trail mix and snack foods',
      'Some African and Asian cuisines'
    ],
    whyMajorAllergen: 'Peanut allergy is one of the most common and severe food allergies. Almost half of all deaths from anaphylaxis are related to peanuts or tree nuts. Signs and symptoms can occur within minutes of contact but can take up to an hour to be apparent.',
    prevalence: 'Affects approximately 1-2% of the UK population. Often begins in childhood and usually persists for life.',
    severity: 'high',
    crossContaminationRisk: 'Peanuts are highly allergenic even in trace amounts. Shared manufacturing equipment poses significant risks. "May contain peanuts" warnings are extremely common on packaged foods.',
    alternativeNames: ['Groundnuts', 'Monkey nuts', 'Arachis oil'],
    resources: [
      {
        title: 'Anaphylaxis UK - Peanut Allergy',
        url: 'https://www.anaphylaxis.org.uk',
        description: 'Comprehensive guide to peanut allergy management'
      }
    ]
  },
  // ... (all 14 allergens with similar detail)
];

export interface ExternalResource {
  id: string;
  name: string;
  logo: string;
  description: string;
  url: string;
  type: 'charity' | 'government' | 'research' | 'medical';
}

export const EXTERNAL_RESOURCES: ExternalResource[] = [
  {
    id: 'fsa',
    name: 'Food Standards Agency',
    logo: '/images/logos/fsa.svg',
    description: 'UK government agency responsible for food safety and allergen regulations',
    url: 'https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses',
    type: 'government'
  },
  {
    id: 'narf',
    name: 'Natasha Allergy Research Foundation',
    logo: '/images/logos/narf.svg',
    description: 'Charity founded by Natasha\'s parents to fund allergy research and raise awareness',
    url: 'https://www.narf.org.uk',
    type: 'charity'
  },
  {
    id: 'allergy-uk',
    name: 'Allergy UK',
    logo: '/images/logos/allergy-uk.svg',
    description: 'Leading UK charity providing information and support for people with allergies',
    url: 'https://www.allergyuk.org',
    type: 'charity'
  },
  {
    id: 'anaphylaxis-uk',
    name: 'Anaphylaxis UK',
    logo: '/images/logos/anaphylaxis-uk.svg',
    description: 'Charity focused on anaphylaxis education and emergency preparedness',
    url: 'https://www.anaphylaxis.org.uk',
    type: 'charity'
  },
  {
    id: 'nhs',
    name: 'NHS Food Allergy Guidance',
    logo: '/images/logos/nhs.svg',
    description: 'Official medical guidance on food allergies from the National Health Service',
    url: 'https://www.nhs.uk/conditions/food-allergy/',
    type: 'medical'
  }
];
```

### Styling

**Design Tokens:**
```css
/* Allergen severity colors */
--allergen-high: hsl(0, 65%, 51%);        /* Red */
--allergen-medium: hsl(38, 92%, 50%);     /* Amber */
--allergen-low: hsl(142, 71%, 45%);       /* Green */

/* Warning colors */
--warning-bg: hsl(38, 100%, 95%);
--warning-border: hsl(38, 92%, 50%);
--warning-text: hsl(38, 92%, 30%);

/* Safety disclaimer colors */
--disclaimer-bg: hsl(0, 100%, 97%);
--disclaimer-border: hsl(0, 65%, 51%);
--disclaimer-text: hsl(0, 65%, 35%);
```

**Component Styling Examples:**
```tsx
// AllergenCard.tsx
<div className={cn(
  "border rounded-lg overflow-hidden transition-all",
  severity === 'high' && "border-red-500/30 hover:border-red-500/50",
  severity === 'medium' && "border-amber-500/30 hover:border-amber-500/50",
  severity === 'low' && "border-green-500/30 hover:border-green-500/50"
)}>
  {/* ... */}
</div>

// SafetyDisclaimer.tsx
<div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 rounded-lg">
  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
  <div className="text-sm text-amber-900 dark:text-amber-100">
    {/* ... */}
  </div>
</div>
```

### Performance Optimization

**Images:**
- Use Next.js `<Image>` component
- WebP format with PNG fallback
- Lazy loading for below-the-fold content
- Responsive image sizes
- Alt text for accessibility

**Code Splitting:**
- Each page is separate route (automatic code splitting)
- Dynamic imports for heavy components:
  ```tsx
  const AllergenGrid = dynamic(() => import('@/components/allergen-info/AllergenGrid'), {
    loading: () => <Skeleton className="h-96" />
  });
  ```

**Caching:**
- Static generation for content pages (ISR not needed - content rarely changes)
- Browser caching headers for images and static assets

### SEO & Metadata

**Every page must include:**
```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Understanding Food Allergens & Natasha\'s Law | Plate Wise',
  description: 'Learn about the 14 major UK food allergens, Natasha\'s Law, and how we keep you safe. Educational resource for managing food allergies.',
  keywords: ['Natasha\'s Law', 'UK food allergens', 'food allergy safety', 'allergen information'],
  authors: [{ name: 'Plate Wise Team' }],
  creator: 'Plate Wise',
  publisher: 'Plate Wise',
  openGraph: {
    type: 'article',
    locale: 'en_GB',
    url: 'https://platewise.co.uk/allergen-information',
    title: 'Understanding Food Allergens & Natasha\'s Law',
    description: 'Comprehensive guide to UK food allergen regulations and safety practices.',
    siteName: 'Plate Wise',
    images: [{
      url: '/og-allergen-information.png',
      width: 1200,
      height: 630,
      alt: 'Plate Wise - Food Allergen Information'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Understanding Food Allergens & Natasha\'s Law',
    description: 'Learn about UK allergen regulations and food safety.',
    images: ['/og-allergen-information.png']
  },
  alternates: {
    canonical: 'https://platewise.co.uk/allergen-information'
  }
};
```

**Structured Data (JSON-LD):**
```tsx
export default function AllergenInformationPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Understanding Food Allergens & Natasha\'s Law',
    description: 'Educational resource about UK food allergen regulations',
    author: {
      '@type': 'Organization',
      name: 'Plate Wise'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Plate Wise',
      logo: {
        '@type': 'ImageObject',
        url: 'https://platewise.co.uk/logo.png'
      }
    },
    datePublished: '2025-10-14',
    dateModified: '2025-10-14',
    about: [
      {
        '@type': 'HealthTopicContent',
        name: 'Food Allergies',
        description: 'Information about food allergens and safety'
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Page content */}
    </>
  );
}
```

---

## Implementation Checklist

### Week 1: Core Pages
- [ ] Create `/app/allergen-information/page.tsx` with complete content
- [ ] Create `AllergenCard.tsx` component
- [ ] Create `NatashaStorySection.tsx` component
- [ ] Create `ExternalResourcesSection.tsx` component
- [ ] Create `/lib/allergen-data.ts` with all 14 allergen details
- [ ] Add link to allergen info from `allergy-step.tsx` in onboarding
- [ ] Test responsive design on mobile devices
- [ ] Run Lighthouse accessibility audit

### Week 2: Safety Features
- [ ] Create `SafetyDisclaimer.tsx` component (3 variants)
- [ ] Create `/app/food-allergy-safety/page.tsx` emergency guide
- [ ] Add compact disclaimers to recipe generation results
- [ ] Add full disclaimer to recipe detail pages
- [ ] Create first-time user disclaimer modal for recipe generation
- [ ] Add disclaimer to allergen settings page
- [ ] Test disclaimer visibility and acknowledgment flow

### Week 3: Legal & Compliance
- [ ] Update Privacy Policy with allergen data section
- [ ] Update Terms of Service with recipe safety disclaimers
- [ ] Enhance consent step in onboarding for allergen data
- [ ] Add consent tracking to user profile database
- [ ] Legal review: Schedule consultation with UK solicitor (food/consumer law)
- [ ] GDPR compliance check: Verify allergen data handling meets requirements
- [ ] Add "Withdraw consent" option in user profile settings
- [ ] Test right to be forgotten flow (delete allergen data)

### Week 4: Polish & Testing
- [ ] Accessibility audit (keyboard nav, screen reader, color contrast)
- [ ] Mobile responsive testing (5 breakpoints)
- [ ] User testing with 5-10 participants
- [ ] Collect and implement feedback
- [ ] Analytics implementation (10+ events)
- [ ] Performance optimization (images, code splitting)
- [ ] SEO verification (meta tags, structured data)
- [ ] Final content proofreading and fact-checking
- [ ] Create OG images for social sharing
- [ ] Launch preparation: DNS, monitoring, error tracking

### Post-Launch
- [ ] Monitor analytics for first week
- [ ] Track: allergen info page views, time on page, external link clicks
- [ ] Collect user feedback via in-app survey
- [ ] Iterate based on data: Which sections are most viewed? Where do users drop off?
- [ ] Consider: Partnerships with allergy charities for content endorsement
- [ ] Plan Phase 2: Video content, interactive allergen quiz, personalized safety tips

---

## Success Metrics

### Engagement Metrics (Target: Month 1)
- ✅ 40%+ of onboarding users click "Learn more about allergens"
- ✅ Average time on allergen info page >2 minutes
- ✅ <20% bounce rate on allergen info page
- ✅ 30%+ click-through to external resources
- ✅ 10%+ return to allergen info page (bookmark/reference value)

### Quality Metrics
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ 90+ Lighthouse score (performance, accessibility, SEO)
- ✅ <3 second page load time on 4G
- ✅ 0 critical errors in production
- ✅ 80%+ user comprehension in testing (can explain Natasha's Law)

### Business Impact (Target: Month 3)
- ✅ Increased trust: 80%+ users rate allergen safety features 4+/5
- ✅ Higher retention: Users who view allergen info have 10%+ higher 30-day retention
- ✅ Reduced support queries: 20% fewer questions about allergen handling
- ✅ Professional positioning: "Plate Wise takes food safety seriously" brand perception
- ✅ Organic SEO: Rank top 10 for "Natasha's Law explanation" and related terms

### Legal & Compliance
- ✅ Zero GDPR complaints about allergen data handling
- ✅ Legal review approval (solicitor sign-off on disclaimers)
- ✅ Clear audit trail for allergen data consent
- ✅ 100% compliance with FSA best practice guidance
- ✅ Zero food safety incidents attributable to app

---

## Resources & References

### Internal Documents
- **Research Report:** `Natasha_Law_Research_Report.md` (this directory)
  - 1,500+ lines of comprehensive research
  - Complete allergen details
  - Legal requirements and best practices
  - Source citations

- **Product Strategy:** `Focused_MVP_Product_Strategy_2025.md` (parent directory)
  - Overall app vision and features
  - Allergen safety as core feature #4
  - GDPR compliance strategy

### External Resources
- **Food Standards Agency:** https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses
- **Natasha Allergy Research Foundation:** https://www.narf.org.uk/natashaslaw
- **Anaphylaxis UK:** https://www.anaphylaxis.org.uk
- **Allergy UK:** https://www.allergyuk.org
- **NHS Food Allergy Guide:** https://www.nhs.uk/conditions/food-allergy/
- **UK GDPR Health Data Guidance:** https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/special-category-data/

### Design Inspiration
- **GOV.UK Design System:** https://design-system.service.gov.uk/ (for accessible, clear design)
- **NHS Digital Service Manual:** https://service-manual.nhs.uk/ (for health information design)
- **Allergy UK Website:** https://www.allergyuk.org (for tone and language)

### Technical Resources
- **Next.js Documentation:** https://nextjs.org/docs
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui Components:** https://ui.shadcn.com

---

## Risk Management

### Potential Risks

#### Risk 1: Legal Liability
**Scenario:** User has allergic reaction and claims our app assured them a recipe was safe.

**Mitigation:**
- Clear, prominent disclaimers on every recipe page
- "User responsibility to verify ingredients" messaging
- Legal review of all disclaimer language
- Terms of Service limit liability
- Professional indemnity insurance
- Log all user consents and disclaimer acknowledgments

**Residual Risk:** Low (with all mitigations in place)

---

#### Risk 2: Inaccurate Allergen Information
**Scenario:** Our educational content contains medical errors about allergens.

**Mitigation:**
- Source all facts from official sources (FSA, NHS, medical journals)
- Include citations for verification
- Partner with allergy charity for content review
- Annual content audit and updates
- User feedback mechanism for reporting errors
- Disclaimer: "Consult healthcare professionals for medical advice"

**Residual Risk:** Low (content thoroughly researched and cited)

---

#### Risk 3: User Misunderstanding
**Scenario:** Users think we guarantee recipes are 100% safe for their allergies.

**Mitigation:**
- Explicit messaging: "We cannot guarantee allergen-free recipes"
- Visual warnings (icons, color-coding)
- Multiple touchpoints for disclaimers (onboarding, recipe pages, generation)
- Require acknowledgment before first recipe generation
- User testing to verify comprehension

**Residual Risk:** Medium (some users may not read carefully)

---

#### Risk 4: Emotional Impact
**Scenario:** Natasha's story triggers distress in users with similar experiences.

**Mitigation:**
- Sensitive, respectful language
- Focus on positive legacy and change
- Avoid graphic details of her death
- Provide links to support resources
- Option to skip detailed story and read summary

**Residual Risk:** Low (empathetic approach, content warnings if needed)

---

#### Risk 5: SEO/Brand Association
**Scenario:** Page ranks for "Natasha Ednan-Laperouse death" and looks exploitative.

**Mitigation:**
- Focus content on education and legislation, not tragedy
- Meta description emphasizes educational value
- Respectful tone throughout
- Acknowledge family's campaign and foundation
- No sensational headlines or clickbait
- Clear value proposition: "How we keep you safe"

**Residual Risk:** Low (professional, educational approach)

---

## Future Enhancements (Phase 2)

### Content Expansion
- **Video Content:** Short explainer videos (Natasha's Law, how to read labels, emergency response)
- **Interactive Quiz:** "Test your allergen knowledge" - gamified learning
- **Personalized Safety Tips:** Based on user's specific allergens
- **Seasonal Updates:** Allergen trends, new research findings
- **Case Studies:** Real stories from users managing allergies with the app (with consent)

### Community Features
- **User Reviews:** Rate helpfulness of allergen information
- **Q&A Section:** Common questions about allergen safety
- **Forum Integration:** Connect users managing similar allergies
- **Expert AMAs:** Partner with allergists for Q&A sessions

### Advanced Safety
- **Barcode Scanner:** Scan products to check against user's allergen profile
- **Restaurant Integration:** Allergen info for dining out (if partnerships secured)
- **Medication Reminders:** Reminder to carry EpiPen (with user permission)
- **Emergency Contacts:** Quick-dial emergency contacts from app

### Partnerships
- **Allergy UK Endorsement:** Seek certification/endorsement
- **NARF Partnership:** Donate portion of proceeds, co-branded content
- **NHS Integration:** Explore integration with NHS health records (secure, opt-in)
- **Allergy Clinics:** Partner for educational content, user referrals

---

## Appendix A: Sample Copy

### Natasha's Law Section (Example)

#### What is Natasha's Law?

Natasha's Law is the common name for food labelling legislation that came into force on 1 October 2021 across England, Wales, Scotland, and Northern Ireland. Officially called the Food Information (Amendment) (England) Regulations 2019, the law requires businesses that sell prepacked food (made and packaged on the same premises) to display full ingredient lists with clear allergen emphasis.

#### Why It Matters

The law is named after Natasha Ednan-Laperouse, who tragically died in 2016 at age 15 from an allergic reaction to sesame seeds in a baguette purchased from Pret a Manger. The baguette did not have a full ingredient list on the packaging, and the sesame seeds were not declared.

Natasha's parents, Nadim and Tanya Ednan-Laperouse, campaigned tirelessly for improved food labelling regulations to prevent similar tragedies. Their campaign succeeded, and Natasha's Law now protects millions of people with food allergies by ensuring clear, accessible ingredient information.

#### How It Protects You

Under Natasha's Law, food businesses must:
- List all ingredients on prepacked food
- Clearly emphasize the 14 major allergens (in bold, italics, or another distinct format)
- Ensure ingredient information is easily visible and legible

While Natasha's Law specifically applies to physical food businesses selling prepacked items, we believe its principles of transparency and allergen awareness should extend to digital platforms like ours. That's why we've built robust allergen detection and filtering into every part of Plate Wise.

#### Natasha's Legacy

Today, Natasha's legacy lives on through:
- The Natasha Allergy Research Foundation (NARF), which funds research to find a cure for allergies
- Improved food safety regulations protecting consumers
- Increased awareness of food allergy risks
- Apps like ours that take allergen safety seriously

As Natasha's father Nadim said: "If Natasha's Law saves just one life, then we've achieved what we set out to do."

---

### Sample Allergen Card Copy

#### Peanuts

**What it includes:**
Peanuts (also called groundnuts) and all peanut products including peanut butter, peanut oil, and peanut flour.

**Commonly found in:**
- Peanut butter and spreads
- Satay sauce and Asian cuisine
- Confectionery and chocolate bars
- Baked goods (cookies, brownies)
- Breakfast cereals and granola bars
- Ice cream and desserts
- Some sauces and marinades
- Trail mix and snack foods

**Why it's a major allergen:**
Peanut allergy is one of the most common and potentially severe food allergies, affecting approximately 1-2% of the UK population. Reactions can range from mild itching to life-threatening anaphylaxis. Importantly, almost half of all deaths from food-induced anaphylaxis are related to peanuts or tree nuts.

Peanut allergy often begins in childhood and usually persists throughout life. An allergy to peanuts also increases the likelihood of developing allergies to tree nuts, sesame seeds, and lupin.

**Cross-contamination risks:**
Peanuts are highly allergenic even in trace amounts. Many foods carry "may contain peanuts" warnings due to shared manufacturing equipment. If you have a peanut allergy, always read labels carefully and ask about ingredients when eating out.

**What to watch for:**
Peanut proteins can sometimes hide in unexpected places like sauces, baked goods, and vegetarian meat substitutes. Alternative names include "groundnuts" and "arachis oil."

**Need more information?**
- [Anaphylaxis UK - Peanut Allergy Guide](link)
- [Allergy UK - Managing Peanut Allergies](link)

---

### Sample Safety Disclaimer

#### Your Safety is Our Priority

At Plate Wise, we take allergen safety seriously. We've built our app with multiple layers of protection:
- AI recipe generation that excludes your allergens
- Clear allergen highlighting in all recipes
- Safety checks before recipes are shown
- Transparent ingredient lists

**However, we cannot guarantee that recipes are 100% safe for your specific allergies.**

#### Your Responsibilities

You are solely responsible for:
- ✓ Verifying ingredients before cooking or consuming any recipe
- ✓ Checking packaged ingredient labels for allergen warnings
- ✓ Being aware that manufacturers may change ingredients without notice
- ✓ Understanding cross-contamination risks in your kitchen
- ✓ Following your personal allergy action plan

#### Important Reminders

- **Cooking does not eliminate allergens.** Heating food does not reduce or remove allergen proteins.
- **Cross-contamination can occur.** Shared cooking equipment, surfaces, and storage can transfer allergens.
- **Hidden allergens exist.** Some ingredients contain allergens you might not expect (e.g., soy lecithin in chocolate, fish sauce in Asian cuisine).
- **Always carry your medication.** If prescribed, always have your adrenaline auto-injector (EpiPen) with you.

#### In an Emergency

If you experience a severe allergic reaction:
1. Use your adrenaline auto-injector immediately (if prescribed)
2. Call 999 straight away
3. Lie down with your legs raised (if possible)
4. Use a second auto-injector after 5-15 minutes if symptoms don't improve

Don't delay seeking medical help.

[Read full emergency guidance →](/food-allergy-safety)

#### Questions or Concerns?

If you notice an error in allergen information, please report it immediately:
[Report an Issue] button

We review all reports within 24 hours and update recipes as needed.

---

## Appendix B: Developer Notes

### Component Hierarchy

```
/app/allergen-information/page.tsx
├── Hero Section (inline)
├── Navigation (inline - anchor links)
├── <NatashaStorySection />
│   └── Timeline component
├── <AllergenGrid>
│   ├── <AllergenCard> (×14)
│   │   ├── Header (collapsed state)
│   │   └── Expandable content
├── Why We Ask Section (inline)
├── <SafetySummary />
│   ├── Cross-contamination tips
│   └── Link to emergency page
└── <ExternalResourcesSection>
    ├── Resource Card (×5-7)
```

### State Management

```typescript
// AllergenCard.tsx
const [expanded, setExpanded] = useState(defaultExpanded || false);

// Track which cards are expanded (for analytics)
useEffect(() => {
  if (expanded) {
    trackEvent('allergen_card_expanded', {
      allergen_name: allergen.name,
      timestamp: new Date()
    });
  }
}, [expanded]);

// Keyboard navigation
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    setExpanded(!expanded);
  }
};
```

### Performance Considerations

```typescript
// Lazy load heavy components
const AllergenGrid = dynamic(
  () => import('@/components/allergen-info/AllergenGrid'),
  {
    loading: () => <Skeleton className="h-96" />,
    ssr: true // Still want SEO
  }
);

// Memoize expensive calculations
const sortedAllergens = useMemo(() => {
  return UK_ALLERGEN_DETAILS.sort((a, b) => {
    // Sort by severity (high → medium → low)
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}, []);

// Debounce scroll tracking for analytics
const handleScroll = useDebouncedCallback(() => {
  const scrollDepth = (window.scrollY / document.body.scrollHeight) * 100;
  trackEvent('scroll_depth', { depth: Math.round(scrollDepth) });
}, 500);
```

### Error Handling

```typescript
// Graceful degradation if allergen data fails to load
export default function AllergenInformationPage() {
  try {
    const allergenData = UK_ALLERGEN_DETAILS;

    if (!allergenData || allergenData.length === 0) {
      throw new Error('Allergen data not available');
    }

    return <AllergenContent data={allergenData} />;
  } catch (error) {
    console.error('Failed to load allergen information:', error);
    return (
      <ErrorState
        title="Unable to Load Allergen Information"
        description="We're having trouble loading this page. Please try refreshing."
        action={
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        }
      />
    );
  }
}
```

### Testing Considerations

```typescript
// AllergenCard.test.tsx
describe('AllergenCard', () => {
  it('expands and collapses on click', () => {
    // Test interaction
  });

  it('tracks analytics event when expanded', () => {
    // Test tracking
  });

  it('is keyboard accessible', () => {
    // Test keyboard navigation
  });

  it('has proper ARIA attributes', () => {
    // Test accessibility
  });

  it('displays all required information when expanded', () => {
    // Test content completeness
  });
});
```

---

## Document Control

**Version:** 1.0
**Date Created:** October 14, 2025
**Last Updated:** October 14, 2025
**Author:** Product Team
**Status:** Ready for Implementation

**Review Schedule:**
- Technical Review: Before development starts
- Content Review: After first draft
- Legal Review: Before public launch
- User Testing Review: After testing complete
- Post-Launch Review: 1 month after launch

**Change Log:**
- v1.0 (2025-10-14): Initial implementation plan created based on research

---

**Next Steps:**
1. Review this plan with development team
2. Confirm scope and timeline
3. Begin Week 1 tasks (core page creation)
4. Schedule legal review for Week 3

---

*End of Implementation Plan*
