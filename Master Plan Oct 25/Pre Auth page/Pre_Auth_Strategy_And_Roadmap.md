# Pre-Auth Homepage Strategy & Implementation Roadmap

**Date:** October 10, 2025
**Project:** Recipe App - Pre-Authentication Free Trial Experience
**Status:** Planning → Implementation
**Goal:** Build pre-auth playground to validate product-market fit before monetization

---

## Executive Summary

### The Strategy

**One-Off Payment Model** (Not Subscription)
- Base Tier: £9.99-£14.99 one-off payment
- Premium LLM Access: +£4.99 (optional add-on)
- **Why:** Subscription fatigue (3.93% industry retention), larger user base for future products

**Phased Approach:**
1. Build full-featured pre-auth page (NOW)
2. Beta test with friends (NEXT)
3. Add smart gates based on data (LATER)
4. Launch with payment (LATER)

---

## Phase 1: Build Pre-Auth Homepage (NOW - Weeks 7-8)

### What We're Building

**Full-Featured Playground:**
- ✅ AI recipe generation (unlimited during beta)
- ✅ Meal planner (works without account)
- ✅ Shopping list generation (works without account)
- ✅ All existing features accessible

**Key Technical Decision:**
- **Session storage only** (no database persistence)
- Data lost on browser refresh/close
- Creates natural "I need to save this!" friction point

**UI Elements:**
- "Sign up to save your work" CTA (visible but not enforced)
- Clear indication this is a "playground" experience
- Showcase value before asking for commitment

### Implementation Checklist

**New Pages/Routes:**
- [ ] `/` - New pre-auth homepage (landing page)
- [ ] `/playground` or `/try` - Pre-auth recipe generation
- [ ] `/playground/meal-planner` - Pre-auth meal planning
- [ ] `/playground/shopping-list` - Pre-auth shopping lists

**Technical Requirements:**
- [ ] Session storage for recipes (localStorage/sessionStorage)
- [ ] Session storage for meal plans
- [ ] Session storage for shopping lists
- [ ] No authentication required for these routes
- [ ] "Sign up to save" CTAs throughout
- [ ] Analytics tracking (recipe generations, feature usage)

**What's Different from Current App:**
- Current: Requires login → Everything persists to Supabase
- Pre-auth: No login → Everything uses browser storage only

---

## Phase 2: Beta Testing (Weeks 8-10)

### Beta Test Plan

**Participants:**
- 20-30 friends and family
- Full free access (no payment required)
- 2-week testing period

**What We're Tracking:**

**Usage Metrics:**
- How many recipes do they generate per session?
- How many times do they return?
- Which features do they use most?
- Where do they get frustrated?
- Do they try to "save" and get blocked?

**Behavioral Data:**
```
Track in Analytics:
- Recipes generated per user
- Meal plans created (but not saved)
- Shopping lists generated
- "Sign up" button clicks
- Session duration
- Return visits
```

**Feedback Questions:**
1. What would make you pay £9.99 for this app?
2. At what point did you wish you could save your work?
3. How many recipes did you want to generate?
4. Would you pay more (£14.99) for access to better AI models?

---

## Phase 3: Limit Discovery (Weeks 10-11)

### Data-Driven Decision Making

**Analyze Beta Results:**

**If users generate 5-10 recipes on first session:**
→ Free tier should limit to 3 recipes per session

**If users come back 5+ times:**
→ Persistence (saving) is the key value proposition

**If users love meal planning:**
→ Gate meal plan saving behind payment

**If users barely use meal planner:**
→ Keep it free, gate recipe saving instead

### Proposed Free Tier Limits (Subject to Beta Data)

**Free Tier (No Account):**
- 3 AI recipe generations per session
- Create meal plans (but can't save)
- Generate shopping lists (but can't save)
- Browser storage only (lost on clear)
- No account required

**Key Friction Points:**
- Lose everything on refresh
- Limited generations per session
- Can't access from multiple devices

---

## Phase 4: Launch with Payment (Week 12)

### Pricing Tiers (Final Structure)

**Free Tier:**
- 3 AI generations per session
- No saving/persistence
- Browser storage only

**Base Paid - £9.99 One-Off:**
- ✅ Unlimited AI recipe generations
- ✅ Save recipes permanently
- ✅ Save meal plans
- ✅ Save shopping lists
- ✅ Multi-device sync (Supabase backend)
- ✅ Standard AI models (Claude Sonnet 4.5)

**Premium LLM Access - £14.99 Total (£9.99 + £4.99):**
- ✅ All Base Paid features
- ✅ Access to multiple AI models via Vercel AI Gateway
- ✅ Switch between models (Claude Opus, GPT-4, etc.)
- ✅ Compare recipe quality across models
- ✅ "Power user" feature

**Future Add-Ons (Optional Revenue):**
- £2.99: Advanced features pack (recipe collections, folders)
- £2.99: PDF export + print-friendly recipes
- £4.99: Priority support + early access to new features

### Payment Implementation

**Tech Stack:**
- Stripe for payment processing
- One-off payment (no subscription)
- Immediate access after payment
- Email receipt + account activation

**User Flow:**
```
1. User tries pre-auth playground (3 recipes)
2. Hits limit or tries to refresh (loses data)
3. "Unlock unlimited access for £9.99" CTA
4. Stripe payment page
5. Account created + payment processed
6. Redirect to authenticated app (full Supabase persistence)
```

---

## Vercel AI Gateway Integration Strategy

### Why This Matters

**Cost Control:**
- Different models have different costs
- Claude Haiku: ~$0.25 per 1M tokens (cheap)
- Claude Sonnet: ~$3 per 1M tokens (standard)
- Claude Opus: ~$15 per 1M tokens (premium)
- GPT-4o: ~$2.50 per 1M tokens

**Quality Variation:**
- Budget models: Faster, cheaper, good enough
- Premium models: Better creativity, more detailed

**User Choice:**
- Power users want the best models
- Casual users are fine with good-enough models

### Implementation Plan

**Free Tier:**
- Limited to Claude Haiku (cheapest model)
- 3 generations per session

**Base Paid (£9.99):**
- Claude Sonnet 4.5 (current default)
- Unlimited generations

**Premium LLM (£14.99):**
- User selects from dropdown:
  - Claude Sonnet 4.5 (balanced)
  - Claude Opus 4 (best quality)
  - GPT-4o (alternative)
  - GPT-4.1 (OpenAI latest)
- Unlimited generations across all models

**Technical:**
```typescript
// Vercel AI Gateway unified interface
const model = user.tier === 'premium'
  ? user.selectedModel
  : user.tier === 'paid'
    ? 'claude-sonnet-4.5'
    : 'claude-haiku';

const response = await generateRecipe({
  model,
  prompt: recipePrompt
});
```

---

## Current State vs. Future State

### Current App (Week 6 Complete)

**How It Works Now:**
```
User Flow:
1. Visit site → Redirected to /login
2. Sign up with email/password
3. Complete onboarding (allergies, preferences)
4. Access full app (/recipes, /meal-planner, etc.)
5. Everything saves to Supabase database
6. All features require authentication
```

**What's Protected:**
- All routes behind authentication
- No way to try before signup
- No pre-auth experience

### Future App (After Phase 1)

**New User Flow:**
```
Public User (No Account):
1. Visit site → Land on homepage (/)
2. "Try it now" → /playground
3. Generate recipes (session storage)
4. Create meal plan (session storage)
5. Hit limit or refresh → Lose data
6. "Sign up to save" CTA

Paid User (After Payment):
1. Pay £9.99 → Account created
2. Redirected to /recipes (authenticated)
3. All data saves to Supabase
4. Full app access (current experience)
```

**What Changes:**
- Homepage is public (no auth required)
- Playground routes public (no auth)
- Current app routes stay protected
- Two parallel experiences (pre-auth vs. authenticated)

---

## Technical Architecture Changes

### Route Structure

**Public Routes (No Auth Required):**
```
/                        → Landing page (marketing)
/playground              → Recipe generation (session storage)
/playground/meal-planner → Meal planning (session storage)
/playground/shopping     → Shopping lists (session storage)
/pricing                 → Pricing tiers
/about                   → About page
```

**Protected Routes (Auth Required):**
```
/recipes                 → Saved recipes (Supabase)
/meal-planner            → Saved meal plans (Supabase)
/shopping-list           → Saved shopping lists (Supabase)
/settings                → User preferences
/generate                → AI generation (for logged-in users)
```

### Storage Strategy

**Pre-Auth (Session Storage):**
```typescript
// Store in browser only
const recipes = JSON.parse(sessionStorage.getItem('playground_recipes') || '[]');
recipes.push(newRecipe);
sessionStorage.setItem('playground_recipes', JSON.stringify(recipes));

// Lost on:
// - Browser close
// - Tab close
// - Refresh (if sessionStorage)
// - Clear browsing data
```

**Authenticated (Supabase):**
```typescript
// Store in database (current implementation)
const { data, error } = await supabase
  .from('recipes')
  .insert(newRecipe);

// Persists:
// - Across devices
// - Across sessions
// - Permanent (until user deletes)
```

### Data Migration on Signup

**When user pays and creates account:**
```typescript
async function migratePlaygroundData(userId: string) {
  // Get data from session storage
  const playgroundRecipes = sessionStorage.getItem('playground_recipes');
  const playgroundMealPlan = sessionStorage.getItem('playground_meal_plan');

  if (playgroundRecipes) {
    const recipes = JSON.parse(playgroundRecipes);
    // Save to Supabase with user_id
    await supabase.from('recipes').insert(
      recipes.map(r => ({ ...r, user_id: userId }))
    );
  }

  // Clear session storage
  sessionStorage.clear();
}
```

---

## Analytics & Tracking

### What to Track (Phase 1-2)

**Pre-Auth User Behavior:**
```typescript
// Track in analytics (Vercel Analytics, PostHog, etc.)

// Engagement
trackEvent('playground_recipe_generated', { model: 'claude-haiku' });
trackEvent('playground_meal_plan_created', { meals_count: 5 });
trackEvent('playground_shopping_list_generated', { items_count: 15 });

// Friction points
trackEvent('signup_cta_clicked', { location: 'after_3_recipes' });
trackEvent('data_lost_on_refresh', { recipes_lost: 3 });

// Conversion signals
trackEvent('reached_recipe_limit', { recipes_generated: 3 });
trackEvent('attempted_save', { feature: 'meal_plan' });
```

**Success Metrics:**
```
Questions to answer:
- What % of users generate at least 1 recipe?
- What % hit the 3-recipe limit?
- What % click "Sign up to save"?
- What % return for a second session?
- What's the average time to first recipe?
```

---

## Success Criteria

### Phase 1 Success (Build)
- [ ] Pre-auth homepage live and functional
- [ ] All features work without authentication
- [ ] Session storage working correctly
- [ ] No bugs in playground experience

### Phase 2 Success (Beta)
- [ ] 20+ friends actively testing
- [ ] Collect behavioral data for 2 weeks
- [ ] Gather qualitative feedback
- [ ] Identify ideal free tier limits

### Phase 3 Success (Limits)
- [ ] Data shows clear friction points
- [ ] Free tier limits validated by usage patterns
- [ ] Payment gate strategy defined

### Phase 4 Success (Launch)
- [ ] Payment system working (Stripe)
- [ ] Conversion rate > 5% (free → paid)
- [ ] Zero payment issues
- [ ] First 50 paying customers

---

## Risk Mitigation

### Risk 1: Users Never Pay (Free is "Good Enough")

**Likelihood:** MEDIUM
**Impact:** HIGH (no revenue)

**Mitigation:**
- Make free tier intentionally limited (3 recipes)
- No persistence creates natural frustration
- Value proposition clear (save your work)
- One-off fee reduces commitment fear

**Fallback Plan:**
- If <3% conversion after 1 month, reduce free tier to 1 recipe
- Add more aggressive "upgrade" prompts

---

### Risk 2: Session Storage UX is Confusing

**Likelihood:** MEDIUM
**Impact:** MEDIUM (user frustration)

**Mitigation:**
- Clear warnings: "Your data is temporary"
- Visual indicators: "Not saved" badges
- CTA: "Sign up to save permanently"

**Fallback Plan:**
- Add localStorage option (persists longer but still local-only)
- Add "Export JSON" for users to manually save

---

### Risk 3: Beta Testers Don't Use It Enough

**Likelihood:** MEDIUM
**Impact:** MEDIUM (no useful data)

**Mitigation:**
- Personal outreach to each tester
- Weekly check-ins ("How's it going?")
- Incentives (free lifetime access for testing)
- Reminders to use it

**Fallback Plan:**
- Extend beta period to 3-4 weeks
- Recruit more testers (Reddit, friends-of-friends)

---

## Timeline Summary

| Phase | Duration | Dates | Deliverable |
|-------|----------|-------|-------------|
| **Phase 1: Build** | 2 weeks | Oct 10-24 | Pre-auth homepage live |
| **Phase 2: Beta** | 2 weeks | Oct 24-Nov 7 | Usage data + feedback |
| **Phase 3: Limits** | 1 week | Nov 7-14 | Free tier limits defined |
| **Phase 4: Launch** | 1 week | Nov 14-21 | Payment system live |

**Target Public Launch:** November 21, 2025

---

## Next Steps (Immediate)

### This Week (Week 7)

**Day 1-2: Planning & Setup**
- [x] Create strategy document (this file)
- [ ] Create implementation todos
- [ ] Design pre-auth homepage wireframe
- [ ] Plan session storage architecture

**Day 3-5: Core Implementation**
- [ ] Build new homepage (landing page)
- [ ] Build `/playground` routes
- [ ] Implement session storage for recipes
- [ ] Implement session storage for meal plans
- [ ] Add "Sign up to save" CTAs

**Day 6-7: Testing & Polish**
- [ ] Test session storage (refresh, close tab)
- [ ] Mobile responsiveness
- [ ] Deploy to Vercel staging
- [ ] Self-test the experience

### Next Week (Week 8)

**Day 1-3: Beta Prep**
- [ ] Create beta tester invitation email
- [ ] Set up analytics tracking
- [ ] Create feedback form (Google Forms)
- [ ] Deploy to production

**Day 4-7: Beta Launch**
- [ ] Invite 20-30 friends
- [ ] Monitor usage daily
- [ ] Check for bugs
- [ ] Answer questions

---

## Open Questions (To Be Resolved)

1. **Homepage Design:** What should the landing page look like?
   - Hero section with demo video?
   - "Try it now" primary CTA?
   - Show example recipes?

2. **Session Storage vs. LocalStorage:**
   - SessionStorage = Lost on tab close (more friction)
   - LocalStorage = Persists longer (less friction)
   - **Recommendation:** Start with sessionStorage, test with beta users

3. **Analytics Tool:**
   - Vercel Analytics (built-in, basic)
   - PostHog (free tier, advanced)
   - Google Analytics (traditional)
   - **Recommendation:** Start with Vercel Analytics, add PostHog if needed

4. **Beta Tester Recruitment:**
   - Personal network only?
   - Reddit/social media?
   - **Recommendation:** Start with personal network (easier to get honest feedback)

---

## Appendix: Competitive Analysis

### Apps with Pre-Auth Trials

**Paprika ($4.99-$19.99 one-off):**
- No free tier at all
- Must pay upfront to try
- Works because of strong brand

**ChefGPT (£12.99/month subscription):**
- Free tier: 5 recipes/month
- Very restrictive
- High subscription price

**SuperCook (100% free):**
- All features free forever
- Ad-supported
- Lower quality experience

**Our Positioning:**
- More generous than ChefGPT (3 per session vs. 5 per month)
- Lower commitment than Paprika (try before you buy)
- Higher quality than SuperCook (one-off payment, no ads)

---

## Document Status

**Status:** ✅ Strategy Approved
**Next Review:** After Phase 2 (Beta Testing Complete)
**Last Updated:** October 10, 2025

**Remember:** Build full version first, add gates later based on real user behavior.

---

*End of Strategy Document*
