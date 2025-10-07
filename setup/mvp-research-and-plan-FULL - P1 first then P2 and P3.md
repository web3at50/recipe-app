# AI-Powered Recipe App MVP - Research & Implementation Plan

**Document Version:** 1.0
**Date:** October 2025
**Status:** Ready for Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Competitor Analysis](#2-competitor-analysis)
3. [Feature Analysis & Integration](#3-feature-analysis--integration)
4. [Feature Prioritization for MVP](#4-feature-prioritization-for-mvp)
5. [Novel Ideas & Extensions](#5-novel-ideas--extensions)
6. [User Experience Patterns](#6-user-experience-patterns)
7. [Technical Architecture](#7-technical-architecture)
8. [Database Schema Design](#8-database-schema-design)
9. [Implementation Roadmap](#9-implementation-roadmap)

---

## 1. Executive Summary

### 1.1 Vision
An AI-powered recipe management platform that helps home cooks create, organize, and plan meals based on what they have available, their dietary preferences, and their lifestyle needs. The app combines intelligent recipe generation with practical meal planning and shopping list features.

### 1.2 Value Proposition
- **Reduce Food Waste**: Generate recipes from existing pantry items
- **Save Time**: AI-powered meal planning and automatic shopping lists
- **Personalization**: Dietary preferences, lifestyle categories, and dual AI models
- **Flexibility**: Import recipes from multiple sources (PDF, images, text, URLs)
- **Organization**: Smart categorization and tagging system

### 1.3 Target Users
- Busy professionals needing quick meal solutions
- Families managing weekly meal planning
- Health-conscious individuals tracking nutrition
- Home cooks looking to reduce food waste
- Recipe collectors wanting to digitize and organize their collections

### 1.4 Core Differentiators
1. **Dual AI Model Choice**: Let users choose between Anthropic and OpenAI models
2. **Lifestyle-Based Time Categories**: Beyond meal types (e.g., "Lazy Sunday", "Saturday night dinner party")
3. **Flexible Ingredient Management**: Separate "What's in the cupboard" vs "Always have" lists
4. **Multi-Format Recipe Import**: PDF, images, text, and URLs
5. **Integrated Workflow**: Seamless flow from pantry → recipe generation → meal plan → shopping list

---

## 2. Competitor Analysis

### 2.1 Market Leaders

#### Paprika Recipe Manager
**Strengths:**
- Unlimited recipe storage
- One-time payment model ($29 Mac, $5 iOS)
- Cross-platform sync (iOS, Mac, Android, Windows)
- Pantry management feature
- Web recipe clipping

**Weaknesses:**
- No major updates since 2017
- Dated, blocky UI design
- No OCR for paper recipe import
- Limited AI features

**Key Takeaway:** Users value unlimited storage and cross-platform access but expect modern UI and AI features.

#### Mealime
**Strengths:**
- Personalized weekly meal plans
- Dietary preference customization
- Organized grocery lists by meal
- Focus on quick, healthy recipes
- Excellent for busy individuals/families

**Weaknesses:**
- Smaller recipe database than competitors
- Limited recipe import options
- Less focus on user-created content

**Key Takeaway:** Streamlined meal planning with dietary customization is highly valued.

#### Yummly
**Strengths:**
- Excellent personalized recommendations
- Best-in-class grocery list (sorted by aisle/recipe)
- Instacart integration
- Large recipe database
- Strong search and filtering

**Weaknesses:**
- Cannot edit recipes or add custom recipes
- More of a discovery portal than management tool
- No paywalled content access
- "Dating app" feel may not appeal to all users

**Key Takeaway:** Smart grocery organization and personalization are crucial, but users need customization control.

#### ChefGPT (AI-Powered)
**Strengths:**
- Multiple "Chef Modes" (PantryChef, MasterChef, MealPlanChef, MacrosChef)
- AI image generation for dish visualization
- Macro tracking capabilities
- Ingredient substitution intelligence
- Integration with smart kitchen gadgets

**Weaknesses:**
- May feel overwhelming with too many modes
- Requires learning curve for optimal use
- Premium features behind paywall

**Key Takeaway:** AI specialization modes are powerful but should be accessible and intuitive.

#### DishGen
**Strengths:**
- Instant recipe creation from any ingredient list
- AI-powered meal planning
- Reduces food waste focus
- Simple, focused feature set

**Weaknesses:**
- Limited recipe management features
- Basic categorization

**Key Takeaway:** Simple, focused AI recipe generation has strong appeal.

### 2.2 Market Trends (2025)

#### AI Adoption
- **68%** of professional chefs use AI recipe apps
- **45%** reduction in menu development time
- **32%** increase in culinary creativity
- **28%** cost optimization

#### User Behavior
- **70%+** of adults access recipes via social media (Facebook, Instagram, TikTok, YouTube)
- Strong demand for recipe shoppability features
- Growing focus on sustainability and waste reduction
- Personalized nutrition becoming standard expectation

#### Technology Trends
- AI-powered recipe parsing and generation
- Multi-format recipe import (images, PDFs, URLs)
- Real-time shopping list integration
- Cross-device synchronization
- Social sharing and community features

### 2.3 Must-Have Features (Industry Standard)

Based on competitor analysis, these features are expected by users:

1. **Recipe Organization**
   - Unlimited recipe storage
   - Custom categorization and tagging
   - Advanced search and filtering
   - Recipe ratings and notes

2. **Meal Planning**
   - Weekly/daily meal calendar
   - Drag-and-drop interface
   - Serving size adjustment
   - Nutrition tracking

3. **Shopping Lists**
   - Auto-generation from recipes
   - Organized by store section
   - Multi-list support
   - Check-off functionality

4. **Recipe Import**
   - Web scraping/clipping
   - Manual entry
   - Image import (with OCR considerations)
   - PDF parsing

5. **Cross-Platform Access**
   - Mobile responsive
   - Offline access
   - Cloud synchronization
   - Multi-device support

### 2.4 Competitive Gaps (Opportunities)

1. **AI Model Choice**: No competitor offers multiple AI models for recipe generation
2. **Lifestyle Categories**: Most apps use traditional categories (breakfast, lunch, dinner) rather than lifestyle contexts
3. **Flexible Pantry Management**: Few apps distinguish between current inventory and staple items
4. **Calorie/Macro Transparency**: Users want estimates with clear disclaimers about accuracy
5. **Social Features**: Many apps underutilize social sharing and community features

---

## 3. Feature Analysis & Integration

### 3.1 Core Features Breakdown

#### Feature 1: What's in the Cupboard
**Description:** Dynamic inventory of current ingredients

**Functionality:**
- Add/edit/delete ingredients with quantities
- Quick add from common items
- Search functionality
- Expiry date tracking (optional for MVP)
- Visual indicators for low stock

**AI Integration:**
- Generate recipes using ONLY these ingredients
- Generate recipes PRIMARILY using these ingredients + common staples
- Prioritize recipes that use items closest to expiry (future enhancement)

**Database Requirements:**
- `user_cupboard_items` table
- Link to ingredient master list
- Quantity and unit fields
- Last updated timestamp

**User Flow:**
1. User adds items to cupboard
2. Clicks "Generate Recipe from Cupboard"
3. AI analyzes available ingredients
4. Returns 3-5 recipe options with % match indicator
5. User selects recipe → saved to collection or meal plan

#### Feature 2: Always Have
**Description:** Static list of pantry staples user maintains

**Functionality:**
- Curated list of ingredients always available
- Pre-populated common staples (customizable)
- Add/remove items
- Category grouping (oils, spices, basics, etc.)

**AI Integration:**
- AI assumes these ingredients are always available
- Reduces need to repeatedly add common items to cupboard
- Used in combination with "What's in the Cupboard" for recipe generation

**Database Requirements:**
- `user_always_have` table
- Link to ingredient master list
- Category field

**User Flow:**
1. Initial setup: User selects from common staples checklist
2. Ongoing: Add/remove as preferences change
3. AI automatically includes these in recipe generation queries

**Integration Points:**
- Works WITH Feature 1 for comprehensive ingredient picture
- Feeds into shopping list (skip always-have items)
- Influences AI recipe generation logic

#### Feature 3: Saved Recipes
**Description:** Personal recipe collection with multiple import methods

**Import Methods:**
1. **PDF Import**
   - Upload PDF file
   - PDFShift or similar to extract text
   - AI parses text into structured recipe format
   - User reviews and confirms

2. **Image Import**
   - Photo from phone/camera
   - OCR text extraction (Tesseract or cloud OCR)
   - AI structures extracted text
   - User reviews and confirms

3. **Text Paste**
   - Paste recipe text from any source
   - AI parses and structures
   - User reviews and confirms

4. **URL Import**
   - Web scraping for recipe websites
   - AI extracts recipe data
   - Handles various recipe schema formats

5. **Manual Entry**
   - Traditional form input
   - Recipe name, ingredients, instructions, etc.

6. **AI Generated**
   - Automatically saved from AI generation features

**Organization Features:**
- Custom folders/collections
- Tag system (multiple tags per recipe)
- Pre-defined categories:
  - Favorites
  - Vegetarian
  - Vegan
  - Low Carb
  - Low Calorie
  - Gluten-Free
  - Dairy-Free
  - Quick (<30min)
  - etc.

**Recipe Display:**
- Ingredients list with checkboxes
- Step-by-step instructions
- Prep/cook time
- Servings (adjustable)
- Nutrition info (if available)
- User notes section
- Rating system (personal)
- Date added/last made

**Database Requirements:**
- `recipes` table (comprehensive)
- `recipe_tags` table (many-to-many)
- `recipe_categories` table
- `user_recipe_notes` table
- `recipe_ingredients` table (normalized)

**User Flow - Import:**
1. User chooses import method
2. System processes input (OCR, PDF parsing, web scraping, etc.)
3. AI structures data into recipe format
4. User reviews parsed recipe in edit mode
5. User confirms or makes adjustments
6. Recipe saved to collection

**User Flow - Organization:**
1. User views recipe
2. Adds tags and categories
3. Moves to folders
4. Adds personal notes/modifications
5. Rates recipe

**Integration Points:**
- Recipes can be added to meal planner
- Generate shopping lists from recipes
- Share to social media
- Export as PDF
- Modify and re-generate with AI

#### Feature 4: Time/Lifestyle Categorization
**Description:** Context-based recipe categorization beyond traditional meal types

**Category Examples:**
- **Time-Based:**
  - Weeknight Quick (< 30 min)
  - Lazy Sunday (flexible timing, comfort food)
  - Make-Ahead Monday
  - Friday Night Feast

- **Occasion-Based:**
  - Saturday Night Dinner Party
  - Casual Family Gathering
  - Kids' Quick Meal
  - Date Night Special
  - Meal Prep Sunday

- **Energy-Based:**
  - Low-Effort Comfort
  - One-Pot Wonder
  - No-Cook Needed
  - Hands-Off Cooking (slow cooker, oven)

**Functionality:**
- User can assign multiple lifestyle tags to recipes
- Filter recipes by lifestyle category
- AI can generate recipes targeting specific lifestyle needs
- "What should I make?" wizard uses lifestyle context

**AI Integration Prompt Examples:**
- "Generate a Lazy Sunday recipe with chicken and potatoes"
- "I need a Saturday night dinner party recipe for 6 people"
- "Quick Tuesday night meal for kids using pasta"

**Database Requirements:**
- `lifestyle_categories` table (pre-defined + custom)
- Many-to-many relationship with recipes

**User Flow:**
1. User in meal planning mode
2. Selects day/meal slot
3. Chooses lifestyle category for that meal
4. System suggests matching recipes or generates new ones
5. User selects and adds to plan

**Integration Points:**
- Works with meal planner for context-aware planning
- AI recipe generation includes lifestyle parameters
- Filter saved recipes by lifestyle need
- Smart suggestions based on day of week

#### Feature 5: Calorie & Macro Count
**Description:** Nutritional information with transparency about estimates

**Functionality:**
- Display per-serving estimates:
  - Calories
  - Protein
  - Carbohydrates
  - Fat
  - Fiber (optional)
  - Sugar (optional)

**Data Sources:**
- AI estimation (with disclaimer)
- User manual input
- USDA database (free, public)
- Future: OpenFoodFacts API for UK supermarket data

**Display Requirements:**
- Clear "Estimated" label
- Disclaimer: "Nutritional values are estimates. Actual values may vary based on specific ingredients and preparation methods."
- Confidence indicator (high/medium/low confidence in estimate)

**Functionality:**
- Adjusts automatically with serving size changes
- Sum totals for meal plans (daily/weekly)
- Optional daily goal tracking
- Macro ratio display (pie chart or bar)

**Database Requirements:**
- `recipe_nutrition` table
- `user_nutrition_goals` table (optional for MVP)
- Source field (AI estimate, user input, USDA, etc.)

**User Flow:**
1. Recipe is created/imported
2. AI generates nutritional estimate
3. Displayed with confidence level and disclaimer
4. User can manually adjust if they have better info
5. Nutrition aggregates in meal planner view

**Integration Points:**
- Shows in recipe detail view
- Aggregated in meal planner
- Filter recipes by calorie/macro ranges
- Weekly nutrition summary

**MVP Limitations:**
- Basic USDA data + AI estimates only
- No UK supermarket integration (future)
- No advanced macro goal optimization
- Simple, transparent estimates

#### Feature 6: Day/Weekly Meal Planner
**Description:** Calendar-based meal planning for individuals or families

**Functionality:**
- Calendar view (daily/weekly/monthly)
- Drag-and-drop recipes to time slots
- Multiple meal slots per day:
  - Breakfast
  - Lunch
  - Dinner
  - Snacks (optional)

**Multi-Person Support:**
- Create meal plan for individual or family
- Different portion calculations per person
- Dietary preference overlays (one person vegetarian, etc.)

**Smart Features:**
- Duplicate meals across days
- Copy previous week's plan
- Serve leftovers next day
- "Fill my week" AI suggestion feature

**Nutrition Aggregation:**
- Daily calorie/macro totals
- Weekly nutrition summary
- Per-person calculations

**Database Requirements:**
- `meal_plans` table
- `meal_plan_items` table
- Link to recipes
- Date, meal type, servings fields
- `family_members` table (optional for MVP)

**User Flow - Manual Planning:**
1. User opens meal planner calendar
2. Clicks on day/meal slot
3. Searches/filters saved recipes or generates new
4. Drags recipe to slot
5. Adjusts servings if needed
6. Views nutrition totals
7. Generates shopping list from plan

**User Flow - AI-Assisted Planning:**
1. User clicks "Plan my week"
2. Selects preferences:
   - Dietary restrictions
   - Time availability per day
   - Variety preferences
   - Ingredient reuse optimization
3. AI generates complete week plan
4. User reviews and adjusts
5. Confirms plan

**Integration Points:**
- Pulls from saved recipes
- Generates shopping lists
- Aggregates nutrition
- Uses lifestyle categories
- Considers "what's in cupboard" for suggestions

#### Feature 7: Shopping List
**Description:** Auto-generated and customizable shopping lists

**Functionality:**
- Generate from meal plan (all recipes for week)
- Generate from single recipe
- Manual add/remove items
- Check off items as purchased
- Organize by store section:
  - Produce
  - Meat/Seafood
  - Dairy
  - Pantry
  - Frozen
  - Bakery
  - Other

**Smart Features:**
- Automatically exclude "Always Have" items
- Combine duplicate ingredients across recipes
- Quantity aggregation (1 cup + 2 cups = 3 cups)
- Unit conversion
- Multiple list support (different stores)

**Sharing:**
- Share list via text/email
- Printable version
- Collaborative list (family members)

**Database Requirements:**
- `shopping_lists` table
- `shopping_list_items` table
- Store section categorization
- Checked/unchecked status
- Source recipe linkage

**User Flow:**
1. User in meal planner views week
2. Clicks "Generate Shopping List"
3. System aggregates all ingredients
4. Removes "Always Have" items
5. Organizes by store section
6. User reviews and edits
7. Takes to store (mobile view)
8. Checks off items as purchased

**Integration Points:**
- Generated from meal plans
- Generated from individual recipes
- Respects "Always Have" list
- Links back to recipes (tap ingredient to see which recipe needs it)
- Export to PDF

#### Feature 8: Share on Socials
**Description:** Social media sharing capabilities

**Functionality:**
- Share to:
  - Facebook
  - Instagram (image + caption)
  - Twitter/X
  - Pinterest
  - WhatsApp
  - Email
  - Copy link

**Shareable Content:**
- Recipe card (beautifully formatted image)
- Recipe link (public view)
- Meal plan summary
- Recipe success photo (user-uploaded)

**Recipe Card Generation:**
- Auto-generate attractive recipe card image
- Include:
  - Recipe name
  - Hero image (AI-generated or user-uploaded)
  - Key stats (time, servings, calories)
  - Short ingredient list
  - App branding/watermark
  - Link to full recipe

**Privacy Settings:**
- Public/private recipe toggle
- Generate shareable link
- Link expiration (optional)

**Database Requirements:**
- `shared_recipes` table
- Share count tracking
- Public/private status
- Share links with unique IDs

**User Flow:**
1. User views recipe they love
2. Clicks share button
3. Selects sharing destination
4. System generates recipe card/link
5. Pre-fills social media post
6. User customizes caption
7. Posts to social media

**Integration Points:**
- Share from recipe detail view
- Share from meal plan
- Track popular shared recipes
- Future: Community features

#### Feature 9: Two AI Models to Choose From
**Description:** User choice between Anthropic (Claude) and OpenAI (GPT) models

**Functionality:**
- Global setting: Choose default AI model
- Per-request override: Try other model for comparison
- Model comparison mode: Generate same request with both, see results side-by-side

**Model Use Cases:**

**Recipe Generation:**
- Convert ingredients list → recipe
- Parse imported recipe text
- Suggest recipe variations
- Substitute ingredients

**Meal Planning:**
- Generate weekly meal plan
- Suggest complementary recipes
- Optimize for variety and nutrition

**Nutritional Estimation:**
- Estimate calories and macros
- Parse nutritional information from text

**Text Processing:**
- Extract recipe from image/PDF/text
- Clean up messy recipe formats
- Convert units

**User Choice Rationale:**
- Different models have different "personalities" and recipe styles
- Users can find their preferred AI
- Some queries may work better with one model vs another
- Transparent AI usage builds trust

**Technical Implementation:**
- Vercel AI SDK supports both providers
- Abstract AI calls through service layer
- User preference stored in profile
- Usage tracking per model (for cost management)

**UI/UX:**
- Settings page: Choose default AI
- Recipe generation screen: "Try with [other AI]" button
- Comparison mode: Split screen results

**Database Requirements:**
- `user_preferences` table (default AI model)
- `ai_generations` table (track which model used, for feedback)

**User Flow:**
1. User signs up, chooses default AI or keeps recommended
2. Uses app normally with chosen AI
3. Can switch in settings anytime
4. On any AI generation, can click "Regenerate with [other AI]"
5. Compares results
6. Saves preferred version

**Integration Points:**
- All AI-powered features respect user's model choice
- Consistent experience across recipe generation, parsing, planning
- Usage analytics to optimize model selection

### 3.2 Feature Integration Map

#### Primary Integration Flows

**Flow 1: Ingredient-to-Meal Journey**
```
What's in Cupboard + Always Have
    ↓
AI Recipe Generation (with lifestyle context)
    ↓
Save to Recipe Collection (with tags/categories)
    ↓
Add to Meal Planner
    ↓
Generate Shopping List (for missing ingredients)
```

**Flow 2: External Recipe to Meal Plan**
```
Import Recipe (PDF/Image/Text/URL)
    ↓
AI Parsing & Structuring
    ↓
User Review & Categorization
    ↓
Save with Tags/Categories/Nutrition
    ↓
Add to Meal Planner
    ↓
Generate Shopping List
```

**Flow 3: Weekly Planning Journey**
```
Open Meal Planner
    ↓
AI: "Plan my week" (considering cupboard, always-have, preferences)
    ↓
Review/Adjust Generated Plan
    ↓
View Aggregated Nutrition
    ↓
Generate Shopping List
    ↓
Shop
    ↓
Cook & Share
```

**Flow 4: Discovery & Organization**
```
Browse Saved Recipes
    ↓
Filter by Tags/Categories/Lifestyle/Nutrition
    ↓
Select Recipe
    ↓
Add to Meal Plan or Generate Variation
    ↓
Share to Social Media
```

#### Feature Interdependencies

| Feature | Depends On | Feeds Into |
|---------|-----------|------------|
| What's in Cupboard | - | AI Generation, Shopping List |
| Always Have | - | AI Generation, Shopping List |
| Saved Recipes | Import tools, AI parsing | Meal Planner, Social Sharing |
| Lifestyle Categories | - | Recipe Filtering, AI Generation |
| Calorie/Macro Count | AI or USDA data | Meal Planner Summary, Recipe Filtering |
| Meal Planner | Saved Recipes | Shopping List, Nutrition Summary |
| Shopping List | Meal Planner, Recipes | - |
| Social Sharing | Saved Recipes, Image Gen | - |
| AI Model Choice | - | ALL AI features |

### 3.3 Cross-Feature Intelligence

#### Smart Suggestions
AI can suggest recipes considering multiple factors simultaneously:
- What's in cupboard (reduce waste)
- Always have items (reduce shopping needs)
- Upcoming meal plan (avoid repetition)
- Past favorites (personalization)
- Nutrition goals (health optimization)
- Lifestyle context (time/occasion fit)

#### Learning & Personalization
System learns from:
- Recipes user saves/favorites
- AI model preference
- Common "Always Have" items
- Typical meal planning patterns
- Frequently used lifestyle categories
- Shopping list modifications (indicates ingredient preferences)

#### Waste Reduction Focus
Multiple features combine to reduce food waste:
- Cupboard tracking shows what needs using
- AI prioritizes recipes using existing ingredients
- Meal planner optimizes ingredient reuse across week
- Shopping list prevents overbuying
- Portion control through serving adjustments

---

## 4. Feature Prioritization for MVP

### 4.1 MVP Phase 1 (Core Functionality)

**Must-Have Features:**

1. **User Authentication & Profile**
   - Sign up / login (email + password)
   - User profile with basic settings
   - AI model preference selection

2. **Recipe Management (Basic)**
   - Manual recipe entry
   - View recipe detail
   - Basic categorization (favorites, dietary tags)
   - Simple search

3. **AI Recipe Generation (Basic)**
   - Generate from text ingredient list
   - Single AI model (Anthropic OR OpenAI initially)
   - Basic recipe structure output

4. **What's in Cupboard**
   - Add/edit/delete items
   - Simple list view
   - Generate recipe from cupboard items

5. **Always Have List**
   - Manage static pantry staples
   - Pre-populated common items checklist

6. **Basic Meal Planner**
   - Weekly calendar view
   - Drag/drop recipes to days
   - Simple day-by-day planning

7. **Shopping List (Basic)**
   - Generate from single recipe
   - Manual add/edit items
   - Check off items
   - Simple categorization

**Success Criteria:**
- Users can add ingredients → generate recipe → save it → plan meals → get shopping list
- Core loop is functional and valuable

### 4.2 MVP Phase 2 (Enhancement)

**High-Priority Additions:**

1. **Recipe Import Features**
   - Text paste with AI parsing
   - URL import (web scraping)
   - Image upload (OCR) - basic

2. **Dual AI Model Choice**
   - Switch between Anthropic and OpenAI
   - Compare results side-by-side

3. **Lifestyle Categories**
   - Pre-defined lifestyle tags
   - Filter recipes by lifestyle
   - AI generation with lifestyle context

4. **Enhanced Meal Planner**
   - Generate full week with AI
   - Copy previous weeks
   - Nutrition aggregation view

5. **Calorie & Macro Display**
   - Basic estimates per recipe
   - AI-powered nutritional estimation
   - Clear disclaimers

6. **Shopping List (Enhanced)**
   - Generate from full meal plan
   - Organize by store section
   - Exclude "Always Have" items automatically
   - Aggregate quantities

**Success Criteria:**
- Users have multiple ways to add recipes
- AI features are robust and useful
- Meal planning is efficient and smart

### 4.3 MVP Phase 3 (Polish & Social)

**Nice-to-Have Features:**

1. **Social Sharing**
   - Generate recipe card images
   - Share to social platforms
   - Public recipe links

2. **PDF Export**
   - Export recipes as PDF
   - Export meal plans
   - Export shopping lists

3. **Advanced Search & Filtering**
   - Multi-tag filtering
   - Nutrition range filtering
   - Prep time filtering
   - Ingredient-based search

4. **Recipe Collections/Folders**
   - Custom collections
   - Organize beyond tags

5. **Recipe Variations**
   - AI-suggested variations
   - Substitute ingredients
   - Scale servings with recalculation

6. **User Notes & Ratings**
   - Personal notes on recipes
   - Private ratings
   - "Last made" tracking

**Success Criteria:**
- App feels polished and feature-complete
- Users can organize and share effectively
- Strong user engagement and retention

### 4.4 Post-MVP (Future Enhancements)

**NOT in MVP - Future Roadmap:**

1. **Supermarket Integration**
   - OpenFoodFacts API for UK supermarkets
   - Precise nutritional data
   - Price tracking

2. **Voice Control**
   - Hands-free cooking mode
   - Voice commands for timers
   - Read recipe aloud

3. **Smart Device Integration**
   - Smart home assistant integration
   - Smart appliance control
   - IoT timer synchronization

4. **Barcode Scanning**
   - Scan ingredients to add to cupboard
   - Scan to import packaged recipes
   - Nutritional data from barcodes

5. **Community Features**
   - Public recipe sharing
   - User profiles
   - Recipe ratings from community
   - Comments and reviews
   - Follow other users

6. **Advanced Meal Planning**
   - Family member profiles with individual dietary needs
   - Budget optimization
   - Seasonal ingredient suggestions
   - Leftover tracking and recipes

7. **Advanced Analytics**
   - Nutrition trends over time
   - Cost analysis
   - Waste reduction metrics
   - Recipe success tracking

8. **Batch Cooking & Meal Prep**
   - Dedicated meal prep workflows
   - Portioning and storage instructions
   - Reheating guidelines

### 4.5 Development Phase Summary

| Phase | Duration Estimate | Core Focus | Key Deliverables |
|-------|-------------------|------------|------------------|
| **Phase 1** | 4-6 weeks | Core loop functionality | User auth, basic recipe CRUD, simple AI generation, cupboard management, basic meal planner, shopping list |
| **Phase 2** | 4-5 weeks | AI enhancement & import | Multi-format recipe import, dual AI models, lifestyle categories, enhanced meal planner, nutrition estimates |
| **Phase 3** | 3-4 weeks | Polish & sharing | Social features, PDF export, advanced filtering, collections, recipe variations |
| **Post-MVP** | Ongoing | Advanced features | Based on user feedback and priorities |

**Total MVP Timeline: 11-15 weeks** for fully-featured MVP

---

## 5. Novel Ideas & Extensions

### 5.1 Unique Differentiators

Based on market research, here are novel ideas that could set your app apart:

#### 1. **Dual AI "Personality" Mode**
**Concept:** Beyond just choosing AI models, let users select AI "chef personalities"
- **Creative Chef**: Experimental, fusion recipes
- **Traditional Chef**: Classic, time-tested recipes
- **Health Coach**: Nutrition-optimized recipes
- **Budget Chef**: Cost-effective, simple ingredients
- **Quick Cook**: Speed-focused, minimal steps

**Implementation:**
- Each mode uses different prompting strategies with same underlying AI
- Users can switch personalities for different occasions
- Personalization over time learns preferred balance

**Unique Value:** Competitors offer one AI approach; you offer personalized cooking assistants

#### 2. **Recipe "Remix" Feature**
**Concept:** AI-powered recipe modification engine
- "Make it healthier" (reduce calories, increase protein)
- "Make it faster" (simplify steps, reduce cook time)
- "Make it fancier" (elevate ingredients, add techniques)
- "Make it budget-friendly" (cheaper ingredient alternatives)
- "Make it [dietary restriction]" (vegetarian, vegan, gluten-free adaptation)

**Implementation:**
- One-click remix buttons on any recipe
- AI analyzes original recipe and transforms
- Side-by-side comparison view
- Save both original and remixed versions

**Unique Value:** Most apps offer static recipes; you offer dynamic recipe evolution

#### 3. **"Use It Up" Challenge Mode**
**Concept:** Gamification of food waste reduction
- User marks ingredients nearing expiry
- AI creates "challenge" to use them creatively
- Earn badges for waste reduction
- Track money saved over time
- Share creative "rescue recipes"

**Implementation:**
- Expiry date tracking in cupboard
- Weekly "waste check" notifications
- Success metrics (meals created, waste avoided, money saved)
- Shareable achievements

**Unique Value:** Makes sustainability fun and measurable

#### 4. **Collaborative Family Planning**
**Concept:** Multi-user meal planning with smart conflict resolution
- Each family member has profile with preferences/restrictions
- Visual indicators for dietary conflicts
- AI suggests meals that satisfy everyone
- "Compromise mode" when preferences conflict
- Individual portion customization (one person gets tofu, others get chicken)

**Implementation:**
- Family member profiles
- Dietary preference matrices
- AI "mediator" for meal suggestions
- Side dish/protein swap suggestions
- Individual shopping list sections

**Unique Value:** Most apps focus on individual users; you solve the family coordination challenge

#### 5. **Smart Leftover System**
**Concept:** Track leftovers and generate recipes to use them
- Log leftovers with photo and expiry
- AI suggests recipes using leftovers
- "Leftover remix" recipes
- Leftover soup/stir-fry/casserole builders
- Prevent leftover waste

**Implementation:**
- Leftover logging feature
- Photo-based tracking
- AI leftover recipe generation
- "Fridge clean-out Friday" auto-suggestions

**Unique Value:** No competitor systematically addresses the leftover challenge

#### 6. **Recipe DNA Analysis**
**Concept:** AI analyzes your saved recipes to understand your taste profile
- Identifies favorite ingredients, cuisines, techniques
- Creates "Your Recipe DNA" profile
- Suggests new recipes matching your DNA
- Discovers new ingredients you might love based on patterns
- "Expand your palate" mode for gentle adventuring

**Implementation:**
- Background AI analysis of saved/favorited recipes
- Visual taste profile (cuisine preferences, flavor profiles, ingredient frequency)
- Personalized recommendations
- "Similar to recipes you love" suggestions

**Unique Value:** Deep personalization through behavioral analysis

#### 7. **Cooking Difficulty Progressive Mode**
**Concept:** Skill-building recipe suggestions
- User sets current cooking skill level
- App suggests gradually more complex recipes
- Teaches techniques through progressive recipes
- "Skill unlock" achievements
- Technique library with AI-suggested practice recipes

**Implementation:**
- Skill level assessment quiz
- Recipe difficulty rating (beginner → advanced)
- Technique tagging on recipes
- Progressive learning pathway
- Achievement system for new skills

**Unique Value:** Most apps assume static user skill; you grow with the user

#### 8. **Seasonal & Local Intelligence**
**Concept:** Suggest recipes based on seasonal availability
- UK seasonal produce calendar built-in
- "What's in season now" recipe filtering
- Farm shop / farmer's market mode (what to buy now)
- Local ingredient highlighting
- Seasonal meal plan suggestions

**Implementation:**
- UK seasonal produce database
- Month-based filtering
- "Seasonal challenge" mode
- Educational content about seasonal eating
- Price savings indicators (seasonal = cheaper)

**Unique Value:** Promotes sustainability and better-tasting, cheaper food

#### 9. **Recipe Time Machine**
**Concept:** Historical view of your cooking journey
- Timeline of recipes made
- "On this day last year" memories
- Seasonal favorite detection
- Recipe evolution tracking (how you've modified recipes over time)
- "Comfort food finder" (recipes you return to)

**Implementation:**
- "Last made" tracking on recipes
- Historical view UI
- Nostalgia-based suggestions
- Annual cooking report (like Spotify Wrapped)

**Unique Value:** Emotional connection to cooking history

#### 10. **Ingredient Substitution Intelligence**
**Concept:** Smart ingredient swapping beyond simple alternatives
- Out of an ingredient? AI suggests substitutes with impact assessment
- "Will taste slightly sweeter" or "May affect texture"
- Dietary swap mode (automatic vegan/gluten-free substitutions)
- Allergy-safe swaps
- Budget-conscious swaps

**Implementation:**
- Ingredient substitution database
- AI-powered impact prediction
- One-tap swap with explanation
- "Show me all possible swaps" view
- Recipe regeneration with swaps

**Unique Value:** Most apps show generic substitutions; yours predicts real impact

### 5.2 Quick Wins (Low-Hanging Fruit)

Features that provide high value with relatively low development effort:

1. **Recipe Card Templates**
   - Beautiful, shareable recipe card designs
   - Multiple style options
   - Instagram-story-sized templates

2. **Kitchen Timer Integration**
   - In-app timer linked to recipe steps
   - Multiple concurrent timers
   - Named timers ("Pasta water", "Chicken roasting")

3. **Unit Converter Tool**
   - Quick conversion widget
   - Cups ↔ grams ↔ ml
   - Temperature (°F ↔ °C)
   - Common cooking conversions

4. **Print-Friendly Views**
   - Clean, printer-optimized recipe pages
   - Minimal ink usage
   - Checkbox lists

5. **Favorite Ingredient Shortcuts**
   - Quick-add buttons for frequently used items
   - Custom quick-add bar in cupboard view

6. **Recipe Duplication**
   - "Make a copy" for recipe variations
   - Compare original and modified side-by-side

7. **Dark Mode**
   - For evening meal planning
   - Eye comfort

8. **Offline Mode (PWA)**
   - Access saved recipes without internet
   - Sync when back online
   - Essential for cooking

### 5.3 Future Innovation Areas

Areas to watch and consider for future versions:

1. **Computer Vision for Cooking**
   - Photo-based cooking progress verification
   - "Does my dish look right?" AI analysis
   - Cooking technique feedback from video

2. **AR Cooking Instructions**
   - Augmented reality step overlays
   - Portion visualization
   - Technique demonstrations

3. **Predictive Grocery Management**
   - AI predicts when you'll run out of staples
   - Automatic shopping list pre-population
   - "You usually cook pasta on Wednesdays" intelligence

4. **Recipe Scaling Intelligence**
   - Beyond simple multiplication
   - Adjust cooking times and temps for scaling
   - Pan/dish size recommendations

5. **Taste Preference Learning**
   - "This was too salty" feedback
   - AI adjusts future recipes to your taste
   - Personal recipe calibration

6. **Sustainability Scoring**
   - Carbon footprint per recipe
   - Local ingredient bonus
   - Waste reduction score
   - Water usage awareness

---

## 6. User Experience Patterns

### 6.1 Navigation Structure

#### Information Architecture

```
Primary Navigation (Sidebar/Bottom Nav):
├── Dashboard (Home)
│   ├── Quick actions
│   ├── Today's meals
│   ├── What's in cupboard summary
│   └── Suggested recipes
│
├── My Recipes
│   ├── All Recipes (grid/list view)
│   ├── Favorites
│   ├── Categories (dropdown)
│   ├── Collections/Folders
│   └── Import Recipe (action button)
│
├── Meal Planner
│   ├── Weekly view (default)
│   ├── Daily view
│   ├── Calendar picker
│   └── AI: Plan my week (action button)
│
├── Shopping List
│   ├── Active list
│   ├── Archived lists
│   └── Generate from plan (action button)
│
├── Pantry Management
│   ├── What's in Cupboard
│   ├── Always Have
│   └── Generate Recipe (action button)
│
├── AI Recipe Generator
│   ├── From ingredients
│   ├── By description
│   ├── Random surprise me
│   └── Model selection
│
└── Profile & Settings
    ├── Account settings
    ├── Dietary preferences
    ├── AI model preference
    ├── Nutrition goals
    └── App preferences
```

### 6.2 Key User Flows (Wireframe Concepts)

#### Flow 1: First-Time User Onboarding
```
Step 1: Welcome Screen
  ↓
Step 2: Account Creation
  ↓
Step 3: "Tell us about you"
  - Dietary preferences
  - Cooking skill level
  - Household size
  ↓
Step 4: Choose AI Personality
  - Anthropic vs OpenAI explanation
  - "You can change this anytime"
  ↓
Step 5: "Set up your pantry"
  - Select common "Always Have" items
  - Checklist of staples
  ↓
Step 6: "Let's generate your first recipe!"
  - Guided first generation
  ↓
Step 7: Dashboard
  - Tooltips for key features
```

#### Flow 2: Daily User - Morning Planning
```
User opens app
  ↓
Dashboard shows:
  - Today's planned meals
  - "What's for dinner?" prompt if nothing planned
  - Quick action: "Add to cupboard"
  ↓
User taps "What's for dinner?"
  ↓
App shows:
  - Recipes using cupboard items (green badge "Use what you have")
  - Quick recipes (under 30 min)
  - Recently favorited
  ↓
User selects recipe
  ↓
"Add to tonight's meal plan?"
  ↓
Added → prompt "Need to shop? Add missing items to shopping list"
```

#### Flow 3: Weekend Meal Prep User
```
User opens Meal Planner (Sunday morning)
  ↓
Empty week view
  ↓
User taps "AI: Plan my week"
  ↓
Configuration screen:
  - Number of breakfasts/lunches/dinners needed
  - Dietary preferences (already set, can override)
  - Variety level (repeat meals? leftovers ok?)
  - Time availability per day
  - Lifestyle tags (2 weeknight quick, 1 Saturday dinner party, etc.)
  ↓
AI generates plan (loading animation)
  ↓
Week view populated with recipes
  - Each recipe shows: image, name, time, nutrition summary
  - User can tap to swap individual meals
  ↓
User reviews and approves
  ↓
Prompt: "Generate shopping list?"
  ↓
Shopping list created, organized by store section
  ↓
User heads to store with list on mobile
```

#### Flow 4: Recipe Import User
```
User finds recipe online/in cookbook
  ↓
Opens app → My Recipes → Import
  ↓
Choose import method:
  - Take photo
  - Upload image
  - Paste text
  - Enter URL
  - Manual entry
  ↓
[Example: Paste text]
User pastes recipe text
  ↓
AI processing (loading)
  ↓
Structured recipe preview:
  - Name
  - Ingredients (parsed)
  - Instructions (numbered steps)
  - Metadata (time, servings)
  ↓
Edit mode (user can correct any parsing errors)
  ↓
"Looks good!" → Save
  ↓
Prompt: "Add tags and categories?"
  ↓
Tag screen (quick-select common tags + custom)
  ↓
Saved to My Recipes
  ↓
Prompt: "Add to meal plan now?"
```

### 6.3 UI/UX Best Practices

#### Design Principles

1. **Mobile-First**
   - Most cooking happens on mobile (phone in kitchen)
   - Large touch targets (44px minimum)
   - Thumb-friendly navigation
   - Offline capability essential

2. **Kitchen Mode**
   - Keep screen awake during recipe viewing
   - Extra-large text option
   - Voice reading option (future)
   - Minimal scrolling (step-by-step mode)
   - Splash-resistant design (large margins, high contrast)

3. **Speed & Efficiency**
   - Quick actions prominently featured
   - Smart defaults based on user behavior
   - Minimize taps to common actions
   - Predictive suggestions

4. **Visual Hierarchy**
   - Hero images for recipes (appetite appeal)
   - Clear typography (readability)
   - Consistent iconography
   - Color coding for categories/dietary tags

5. **Progressive Disclosure**
   - Don't overwhelm with all features at once
   - Advanced features hidden behind "More options"
   - Contextual help and tips
   - Onboarding tooltips for first uses

#### Component Patterns

**Recipe Card (Grid/List View)**
```
┌─────────────────────────────┐
│  [Hero Image]               │
│                             │
├─────────────────────────────┤
│  Recipe Name               │
│  ⏱️ 30 min  👤 4 servings  │
│  [Vegan] [Quick] [Favorite]│
│  ⭐⭐⭐⭐⭐                   │
└─────────────────────────────┘
```

**Ingredient List (Recipe Detail)**
```
Ingredients (4 servings) [▼ dropdown to adjust]

☐ 2 cups flour
☐ 1 tsp salt
☐ 3 eggs
☐ 1/2 cup milk [in cupboard ✓]

[Add missing to shopping list →]
```

**Step-by-Step Instructions**
```
┌─────────────────────────────┐
│  Step 1 of 6               │
│                             │
│  Preheat oven to 350°F     │
│  and grease a 9x13 pan.    │
│                             │
│  [Set timer: 0m] [Done ✓]  │
│                             │
│  [← Prev]  [Next →]        │
└─────────────────────────────┘
```

**Meal Planner Week View**
```
Week of Jun 12-18      [< Previous] [Next >]

Monday 6/12
  Breakfast: [Add +]
  Lunch: Chicken Salad [Leftover]
  Dinner: [AI Suggest] [Browse]

Tuesday 6/13
  Breakfast: Overnight Oats
  Lunch: [Add +]
  Dinner: Spaghetti Carbonara

[AI: Plan remaining week →]
[Generate shopping list →]
```

**Shopping List (Mobile)**
```
Shopping List - Tesco        [Share] [Print]

PRODUCE                      ✓ 3/5 items
☑ 2 lbs tomatoes
☑ 1 head lettuce
☐ 3 bell peppers
☐ 1 onion
☑ 2 lbs potatoes

MEAT & SEAFOOD              ☐ 0/2 items
☐ 1 lb chicken breast
☐ 1/2 lb shrimp

[+ Add item]
```

**AI Recipe Generator**
```
┌─────────────────────────────┐
│  What do you want to cook? │
│                             │
│  [From my cupboard]         │
│  [Enter ingredients...]     │
│  [Describe a dish...]       │
│  [Surprise me!]             │
│                             │
│  Filters:                   │
│  Time: [Any ▼]             │
│  Lifestyle: [Any ▼]        │
│  Dietary: [Any ▼]          │
│                             │
│  AI Model:                  │
│  ⚫ Anthropic  ⚪ OpenAI    │
│                             │
│  [Generate Recipe]          │
└─────────────────────────────┘
```

### 6.4 Filter & Search Patterns

#### Multi-Level Filtering
Users should be able to combine multiple filters:

**Filter Categories:**
1. **Dietary**
   - Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, etc.
   - Multi-select

2. **Lifestyle/Time**
   - Quick (<30min), Make-Ahead, One-Pot, Slow-Cooker, etc.
   - Multi-select

3. **Meal Type**
   - Breakfast, Lunch, Dinner, Snack, Dessert
   - Multi-select

4. **Cuisine**
   - Italian, Mexican, Asian, Mediterranean, etc.
   - Multi-select

5. **Nutrition**
   - Calorie range slider
   - Protein/carb/fat range sliders
   - High-protein, Low-carb, etc. presets

6. **Ingredients**
   - Must include: [ingredient tags]
   - Must NOT include: [ingredient tags]

7. **Source**
   - AI Generated
   - Imported
   - Manual Entry
   - Favorites
   - Recently Added

**Filter UI Pattern:**
```
[🔍 Search recipes...]  [⚙️ Filters (3)]

Active Filters:
[Vegan ×] [Quick <30min ×] [Italian ×]

Found 24 recipes

[Sort by: Recent ▼]
```

#### Search Intelligence
- Fuzzy matching (typo tolerance)
- Ingredient-based search ("recipes with chicken and broccoli")
- Natural language ("quick dinner for kids")
- Search history and suggestions

### 6.5 Error Handling & Empty States

#### Empty State Messages

**No Recipes Yet:**
```
📚 Your recipe collection is empty

Let's add your first recipe!

[Import from web]  [AI Generate]  [Manual entry]
```

**No Meal Plan:**
```
📅 Your week is unplanned

Let our AI plan your meals or add recipes manually

[AI: Plan my week]  [Browse recipes]
```

**No Cupboard Items:**
```
🏺 Your cupboard is empty

Add ingredients you have at home to generate recipes

[Add ingredients]
```

**No Search Results:**
```
😕 No recipes found

Try adjusting your filters or search terms

[Clear filters]  [Generate new recipe]
```

#### Error Handling

**AI Generation Failed:**
```
⚠️ Recipe generation failed

Let's try again or switch AI models

[Retry]  [Try other AI model]
```

**Import Failed:**
```
❌ Couldn't import this recipe

The format might not be supported. Try pasting the text manually.

[Try text paste]  [Manual entry]
```

**Save Failed:**
```
⚠️ Changes not saved

Check your internet connection and try again.

[Retry]  [Save as draft]
```

### 6.6 Responsive Design Considerations

#### Breakpoints
- **Mobile**: < 768px (primary focus)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

#### Mobile Optimizations
- Bottom navigation bar (thumb-friendly)
- Swipe gestures (swipe between meal plan days)
- Pull-to-refresh
- Large tap targets
- Collapsible sections
- Single-column layouts

#### Tablet Optimizations
- Two-column recipe browsing
- Side-by-side recipe comparison
- Split view (recipe + shopping list)

#### Desktop Optimizations
- Sidebar navigation
- Multi-column layouts
- Hover states and tooltips
- Keyboard shortcuts
- Drag-and-drop meal planning

### 6.7 Accessibility Standards

**WCAG 2.1 AA Compliance:**
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast (4.5:1 minimum)
- Resizable text (up to 200%)
- Focus indicators
- Alt text for all images
- Form labels and error messages
- Skip navigation links

**Inclusive Design:**
- Dyslexia-friendly font options
- High contrast mode
- Reduced motion option
- Clear, simple language
- Multi-sensory feedback (visual + sound + haptic)

---

## 7. Technical Architecture

### 7.1 Technology Stack Overview

#### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Context + Zustand (for complex state)
- **Forms**: React Hook Form + Zod validation
- **AI SDK**: Vercel AI SDK 5

#### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (recipe images, user uploads)
- **Edge Functions**: Supabase Edge Functions (Deno)
- **Real-time**: Supabase Realtime (for collaborative features)

#### AI/ML
- **Models**:
  - Anthropic Claude (via Anthropic API)
  - OpenAI GPT-4 (via OpenAI API)
- **Orchestration**: Vercel AI SDK 5
- **Image Generation**: (Future) Stable Diffusion or DALL-E

#### External Services
- **Hosting**: Vercel
- **PDF Generation**: PDFShift API
- **OCR**: (Phase 2) Tesseract.js or Cloud Vision API
- **Web Scraping**: Custom service or Recipe Scrapers library

#### Developer Tools
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Jest + React Testing Library + Playwright
- **Version Control**: Git + GitHub

### 7.2 Architecture Patterns

#### Next.js App Structure
```
recipeapp/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   ├── layout.tsx (authenticated layout)
│   │   ├── page.tsx (dashboard home)
│   │   ├── recipes/
│   │   │   ├── page.tsx (recipe list)
│   │   │   ├── [id]/page.tsx (recipe detail)
│   │   │   ├── new/page.tsx (create recipe)
│   │   │   └── import/page.tsx (import recipe)
│   │   ├── meal-planner/
│   │   │   └── page.tsx
│   │   ├── shopping-list/
│   │   │   └── page.tsx
│   │   ├── pantry/
│   │   │   ├── cupboard/page.tsx
│   │   │   └── always-have/page.tsx
│   │   ├── generate/
│   │   │   └── page.tsx (AI recipe generator)
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── recipes/
│   │   │   ├── route.ts (CRUD)
│   │   │   └── import/route.ts
│   │   ├── ai/
│   │   │   ├── generate/route.ts
│   │   │   ├── parse/route.ts
│   │   │   └── nutrition/route.ts
│   │   ├── meal-plans/
│   │   │   └── route.ts
│   │   └── shopping-lists/
│   │       └── route.ts
│   └── layout.tsx (root layout)
├── components/
│   ├── ui/ (shadcn components)
│   ├── recipes/
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeDetail.tsx
│   │   ├── RecipeForm.tsx
│   │   └── RecipeFilters.tsx
│   ├── meal-planner/
│   │   ├── WeekView.tsx
│   │   ├── DayView.tsx
│   │   └── MealSlot.tsx
│   ├── pantry/
│   │   ├── CupboardList.tsx
│   │   └── IngredientInput.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Loading.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts (browser client)
│   │   ├── server.ts (server client)
│   │   └── middleware.ts
│   ├── ai/
│   │   ├── anthropic.ts
│   │   ├── openai.ts
│   │   ├── prompts.ts
│   │   └── types.ts
│   ├── utils/
│   │   ├── nutrition.ts
│   │   ├── units.ts
│   │   └── parsing.ts
│   └── validations/
│       ├── recipe.ts
│       ├── mealPlan.ts
│       └── user.ts
├── types/
│   ├── database.ts (Supabase generated)
│   ├── recipe.ts
│   ├── mealPlan.ts
│   └── user.ts
├── hooks/
│   ├── useRecipes.ts
│   ├── useMealPlan.ts
│   ├── useAI.ts
│   └── useSupabase.ts
└── public/
    ├── images/
    └── icons/
```

#### Service Layer Pattern

**Separation of Concerns:**
1. **API Routes** (`app/api/`) - HTTP endpoints, request validation
2. **Service Layer** (`lib/services/`) - Business logic
3. **Data Layer** (`lib/data/`) - Database queries
4. **Utility Layer** (`lib/utils/`) - Pure functions

**Example: Recipe Generation Flow**
```typescript
// app/api/ai/generate/route.ts
export async function POST(request: Request) {
  // 1. Extract and validate request
  const body = await request.json();
  const validated = generateRecipeSchema.parse(body);

  // 2. Check authentication
  const user = await getUser();
  if (!user) return unauthorized();

  // 3. Call service layer
  const recipe = await recipeService.generateFromIngredients({
    userId: user.id,
    ingredients: validated.ingredients,
    aiModel: validated.aiModel || user.preferredAiModel,
    lifestyle: validated.lifestyle,
  });

  // 4. Return response
  return Response.json(recipe);
}

// lib/services/recipe.service.ts
export class RecipeService {
  async generateFromIngredients(params: GenerateParams) {
    // 1. Get AI service based on user preference
    const aiService = getAIService(params.aiModel);

    // 2. Build prompt with context
    const prompt = buildRecipePrompt({
      ingredients: params.ingredients,
      lifestyle: params.lifestyle,
    });

    // 3. Call AI
    const aiResponse = await aiService.generateRecipe(prompt);

    // 4. Parse and validate AI response
    const recipe = parseRecipeFromAI(aiResponse);

    // 5. Estimate nutrition
    const nutrition = await nutritionService.estimate(recipe);

    // 6. Save to database
    const saved = await recipeData.create({
      ...recipe,
      nutrition,
      userId: params.userId,
      source: 'ai_generated',
    });

    return saved;
  }
}
```

### 7.3 Supabase Architecture

#### Database Access Patterns

**Row-Level Security (RLS):**
- Enable RLS on all tables
- Use for SELECT operations (reading)
- Route mutations through server-side service role for complex validation

**Example RLS Policy:**
```sql
-- Users can only read their own recipes
CREATE POLICY "Users can view own recipes"
ON recipes FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own recipes
CREATE POLICY "Users can insert own recipes"
ON recipes FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Client Types:**
1. **Browser Client** (`lib/supabase/client.ts`)
   - Used in Client Components
   - User-scoped (RLS enforced)
   - For real-time subscriptions

2. **Server Client** (`lib/supabase/server.ts`)
   - Used in Server Components and API Routes
   - User-scoped (RLS enforced)
   - Cookie-based session management

3. **Service Role Client** (`lib/supabase/service.ts`)
   - Used in API routes for admin operations
   - Bypasses RLS (use carefully!)
   - For complex mutations with external validation

#### Real-Time Features

**Use Cases:**
- Collaborative meal planning (future)
- Live shopping list updates (family sharing)
- Real-time recipe import status

**Implementation:**
```typescript
// Subscribe to shopping list changes
const { data, error } = supabase
  .channel('shopping-list-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'shopping_list_items',
      filter: `shopping_list_id=eq.${listId}`,
    },
    (payload) => {
      console.log('Change received!', payload);
      // Update local state
    }
  )
  .subscribe();
```

#### Storage Strategy

**Buckets:**
1. **recipe-images**
   - User-uploaded recipe photos
   - AI-generated recipe card images
   - Public/private access based on recipe sharing settings

2. **user-uploads**
   - PDF uploads (for import)
   - Image uploads (for OCR import)
   - Temporary storage, cleaned up after processing

3. **generated-assets**
   - Generated PDF exports
   - Social media share images
   - Cached for 24 hours

**File Naming Convention:**
```
{userId}/{resourceType}/{resourceId}/{timestamp}_{filename}

Example:
user-123/recipes/recipe-456/1709567890_image.jpg
```

### 7.4 AI Integration Architecture

#### Vercel AI SDK 5 Integration

**Provider Configuration:**
```typescript
// lib/ai/providers.ts
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export const getAIProvider = (model: 'anthropic' | 'openai') => {
  switch (model) {
    case 'anthropic':
      return anthropic('claude-3-5-sonnet-20241022');
    case 'openai':
      return openai('gpt-4-turbo-preview');
    default:
      throw new Error('Invalid AI model');
  }
};
```

**Streaming Recipe Generation:**
```typescript
// app/api/ai/generate/route.ts
import { streamText } from 'ai';
import { getAIProvider } from '@/lib/ai/providers';

export async function POST(request: Request) {
  const { ingredients, model } = await request.json();

  const provider = getAIProvider(model);

  const result = streamText({
    model: provider,
    prompt: buildRecipePrompt(ingredients),
  });

  return result.toDataStreamResponse();
}
```

**Client-Side Consumption:**
```typescript
// components/ai/RecipeGenerator.tsx
'use client';

import { useCompletion } from 'ai/react';

export function RecipeGenerator() {
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/ai/generate',
  });

  const handleGenerate = async (ingredients: string[]) => {
    await complete(JSON.stringify({ ingredients }));
  };

  return (
    <div>
      <button onClick={() => handleGenerate(['chicken', 'rice'])}>
        Generate Recipe
      </button>
      {isLoading && <Loading />}
      {completion && <RecipeDisplay text={completion} />}
    </div>
  );
}
```

#### Structured Output for Recipes

**Using `generateObject` for Structured Data:**
```typescript
// lib/ai/recipe-generation.ts
import { generateObject } from 'ai';
import { z } from 'zod';
import { getAIProvider } from './providers';

const recipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  prepTime: z.number(),
  cookTime: z.number(),
  servings: z.number(),
  ingredients: z.array(
    z.object({
      item: z.string(),
      quantity: z.number().optional(),
      unit: z.string().optional(),
    })
  ),
  instructions: z.array(z.string()),
  tags: z.array(z.string()),
});

export async function generateRecipe(
  ingredients: string[],
  model: 'anthropic' | 'openai'
) {
  const provider = getAIProvider(model);

  const { object } = await generateObject({
    model: provider,
    schema: recipeSchema,
    prompt: `Generate a recipe using these ingredients: ${ingredients.join(', ')}`,
  });

  return object; // Fully typed recipe object
}
```

#### Prompt Engineering Strategy

**Prompt Templates:**
```typescript
// lib/ai/prompts.ts

export const RECIPE_GENERATION_PROMPT = `
You are an expert chef creating a delicious recipe.

INGREDIENTS AVAILABLE:
{ingredients}

REQUIREMENTS:
- Prep time: {prepTime}
- Servings: {servings}
- Dietary: {dietary}
- Lifestyle: {lifestyle}

Generate a complete recipe in JSON format with:
- name (string)
- description (string, 1-2 sentences)
- prepTime (number, minutes)
- cookTime (number, minutes)
- servings (number)
- ingredients (array of {item, quantity, unit})
- instructions (array of step-by-step strings)
- tags (array of relevant tags)

Make it creative, delicious, and practical for home cooking.
`;

export const RECIPE_PARSING_PROMPT = `
Extract recipe information from the following text and structure it.

TEXT:
{recipeText}

Parse into JSON format with fields: name, description, prepTime, cookTime, servings, ingredients, instructions, tags.

Handle various formats gracefully. If information is missing, use reasonable defaults.
`;

export const NUTRITION_ESTIMATION_PROMPT = `
Estimate nutritional information for this recipe:

RECIPE:
{recipe}

Provide estimates for:
- calories (kcal per serving)
- protein (g)
- carbohydrates (g)
- fat (g)
- fiber (g)

Base estimates on USDA data and common ingredient nutrition.
Respond in JSON format.
Include a confidence level (high/medium/low).
`;

export function buildPrompt(template: string, vars: Record<string, any>) {
  return template.replace(/{(\w+)}/g, (_, key) => vars[key] || '');
}
```

#### Error Handling & Fallbacks

**Retry Logic:**
```typescript
// lib/ai/retry.ts
export async function retryAI<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Model Fallback:**
```typescript
// If primary model fails, try secondary
async function generateWithFallback(prompt: string, primaryModel: string) {
  try {
    return await generate(prompt, primaryModel);
  } catch (error) {
    console.warn(`${primaryModel} failed, falling back`);
    const fallbackModel = primaryModel === 'anthropic' ? 'openai' : 'anthropic';
    return await generate(prompt, fallbackModel);
  }
}
```

### 7.5 Performance Optimization

#### Next.js Optimizations

**Server Components by Default:**
- Use Server Components for data fetching
- Client Components only when needed (interactivity, browser APIs)
- Reduces JS bundle size

**Streaming & Suspense:**
```tsx
// app/recipes/page.tsx
import { Suspense } from 'react';
import { RecipeList } from '@/components/recipes/RecipeList';
import { RecipeListSkeleton } from '@/components/recipes/RecipeListSkeleton';

export default function RecipesPage() {
  return (
    <div>
      <h1>My Recipes</h1>
      <Suspense fallback={<RecipeListSkeleton />}>
        <RecipeList />
      </Suspense>
    </div>
  );
}
```

**Image Optimization:**
```tsx
import Image from 'next/image';

<Image
  src={recipe.image}
  alt={recipe.name}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL={recipe.blurHash}
/>
```

#### Database Query Optimization

**Select Only Needed Columns:**
```typescript
// Bad
const recipes = await supabase.from('recipes').select('*');

// Good
const recipes = await supabase
  .from('recipes')
  .select('id, name, prep_time, cook_time, image_url');
```

**Use Indexes:**
```sql
-- Add indexes for common queries
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX idx_meal_plan_items_date ON meal_plan_items(date);
```

**Pagination:**
```typescript
const PAGE_SIZE = 20;

const { data, error } = await supabase
  .from('recipes')
  .select('*')
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

#### Caching Strategy

**React Query (TanStack Query):**
```typescript
// hooks/useRecipes.ts
import { useQuery } from '@tanstack/react-query';

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Next.js Data Cache:**
```typescript
// Force cache for stable data
export const revalidate = 3600; // 1 hour

// Opt out of cache for dynamic data
export const dynamic = 'force-dynamic';
```

**Supabase Edge Functions Cache:**
```typescript
// Edge function with caching headers
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  },
});
```

### 7.6 Security Considerations

#### Authentication Flow

**Supabase Auth:**
```typescript
// lib/auth.ts
import { createServerClient } from '@supabase/ssr';

export async function getUser() {
  const supabase = createServerClient(/* ... */);
  const { data: { user }, error } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}
```

**Protected Routes:**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/recipes/:path*', '/meal-planner/:path*'],
};
```

#### API Security

**Input Validation:**
```typescript
import { z } from 'zod';

const createRecipeSchema = z.object({
  name: z.string().min(1).max(200),
  ingredients: z.array(z.object({
    item: z.string(),
    quantity: z.number().optional(),
    unit: z.string().optional(),
  })).min(1),
  instructions: z.array(z.string()).min(1),
});

// In API route
const validated = createRecipeSchema.parse(body);
```

**Rate Limiting:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

**Environment Variables:**
```
# .env.local (NEVER commit!)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
PDFSHIFT_API_KEY=
```

#### Data Privacy

**User Data Ownership:**
- All user data scoped by `user_id`
- RLS ensures users can only access their own data
- Soft delete for recipes (keep for potential recovery)

**Sharing & Privacy:**
```typescript
// Recipes have privacy levels
type RecipePrivacy = 'private' | 'public' | 'unlisted';

// Only public/unlisted recipes can be shared
if (recipe.privacy === 'private') {
  throw new Error('Cannot share private recipe');
}
```

### 7.7 Deployment & CI/CD

#### Vercel Deployment

**Automatic Deployments:**
- Main branch → Production
- Feature branches → Preview deployments
- PR → Preview with comments

**Environment Variables:**
- Set in Vercel dashboard
- Separate values for Preview vs Production

**Build Configuration:**
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "playwright test"
  }
}
```

#### Database Migrations

**Supabase CLI:**
```bash
# Create migration
supabase migration new add_lifestyle_categories

# Apply migrations (local)
supabase db push

# Apply migrations (production)
supabase db push --linked
```

**Migration Files:**
```sql
-- supabase/migrations/20250101000000_add_lifestyle_categories.sql
CREATE TABLE lifestyle_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO lifestyle_categories (name, description, is_default) VALUES
  ('Lazy Sunday', 'Comfort food with flexible timing', true),
  ('Weeknight Quick', 'Fast meals under 30 minutes', true),
  ('Saturday Dinner Party', 'Impressive dishes for entertaining', true);
```

#### Monitoring & Logging

**Vercel Analytics:**
- Web Vitals tracking
- User analytics

**Error Tracking:**
- Sentry integration for error reporting
- Supabase logs for database issues

**Performance Monitoring:**
- Next.js Speed Insights
- Core Web Vitals tracking

---

## 8. Database Schema Design

### 8.1 Core Tables

#### Users (Managed by Supabase Auth)
```sql
-- Extended user profile
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  preferred_ai_model TEXT CHECK (preferred_ai_model IN ('anthropic', 'openai')),
  dietary_preferences TEXT[], -- ['vegetarian', 'gluten-free']
  cooking_skill_level TEXT CHECK (cooking_skill_level IN ('beginner', 'intermediate', 'advanced')),
  household_size INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Recipes
```sql
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  servings INTEGER DEFAULT 4,
  source TEXT CHECK (source IN ('ai_generated', 'imported', 'manual', 'url')),
  source_url TEXT, -- if imported from URL
  privacy TEXT CHECK (privacy IN ('private', 'public', 'unlisted')) DEFAULT 'private',
  is_favorite BOOLEAN DEFAULT false,
  times_made INTEGER DEFAULT 0,
  last_made_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

CREATE POLICY "Anyone can view public recipes"
  ON recipes FOR SELECT
  USING (privacy = 'public');
```

#### Recipe Ingredients
```sql
CREATE TABLE recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  item TEXT NOT NULL,
  quantity DECIMAL(10, 2),
  unit TEXT, -- 'cup', 'tbsp', 'gram', 'piece', etc.
  notes TEXT, -- e.g., "chopped", "to taste"
  order_index INTEGER NOT NULL, -- for display order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);

-- RLS (inherit from recipes)
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

-- Similar policies for INSERT, UPDATE, DELETE
```

#### Recipe Instructions
```sql
CREATE TABLE recipe_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);

-- RLS (inherit from recipes)
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
```

#### Recipe Nutrition
```sql
CREATE TABLE recipe_nutrition (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  calories INTEGER, -- kcal per serving
  protein DECIMAL(10, 2), -- grams
  carbohydrates DECIMAL(10, 2), -- grams
  fat DECIMAL(10, 2), -- grams
  fiber DECIMAL(10, 2), -- grams
  sugar DECIMAL(10, 2), -- grams
  sodium DECIMAL(10, 2), -- mg
  source TEXT CHECK (source IN ('ai_estimate', 'user_input', 'usda', 'api')),
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_recipe_nutrition_recipe_id ON recipe_nutrition(recipe_id);

-- RLS
ALTER TABLE recipe_nutrition ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view nutrition of own recipes"
  ON recipe_nutrition FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = recipe_nutrition.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );
```

#### Tags & Categories
```sql
-- Pre-defined categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  type TEXT CHECK (type IN ('dietary', 'meal_type', 'cuisine', 'lifestyle', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, type) VALUES
  ('Vegetarian', 'vegetarian', 'dietary'),
  ('Vegan', 'vegan', 'dietary'),
  ('Gluten-Free', 'gluten-free', 'dietary'),
  ('Dairy-Free', 'dairy-free', 'dietary'),
  ('Low-Carb', 'low-carb', 'dietary'),
  ('Low-Calorie', 'low-calorie', 'dietary'),
  ('Breakfast', 'breakfast', 'meal_type'),
  ('Lunch', 'lunch', 'meal_type'),
  ('Dinner', 'dinner', 'meal_type'),
  ('Snack', 'snack', 'meal_type'),
  ('Dessert', 'dessert', 'meal_type'),
  ('Italian', 'italian', 'cuisine'),
  ('Mexican', 'mexican', 'cuisine'),
  ('Asian', 'asian', 'cuisine'),
  ('Lazy Sunday', 'lazy-sunday', 'lifestyle'),
  ('Weeknight Quick', 'weeknight-quick', 'lifestyle'),
  ('Dinner Party', 'dinner-party', 'lifestyle');

-- Many-to-many relationship
CREATE TABLE recipe_categories (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (recipe_id, category_id)
);

-- Index
CREATE INDEX idx_recipe_categories_recipe_id ON recipe_categories(recipe_id);
CREATE INDEX idx_recipe_categories_category_id ON recipe_categories(category_id);

-- RLS
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

-- Categories table is public (read-only for users)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);
```

### 8.2 Pantry Management Tables

#### What's in Cupboard
```sql
CREATE TABLE cupboard_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item TEXT NOT NULL,
  quantity DECIMAL(10, 2),
  unit TEXT,
  expiry_date DATE, -- optional, for future "use it up" feature
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_cupboard_items_user_id ON cupboard_items(user_id);

-- RLS
ALTER TABLE cupboard_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cupboard"
  ON cupboard_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Always Have Items
```sql
CREATE TABLE always_have_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item TEXT NOT NULL,
  category TEXT, -- 'spices', 'oils', 'basics', 'condiments', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_always_have_items_user_id ON always_have_items(user_id);

-- RLS
ALTER TABLE always_have_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own always-have list"
  ON always_have_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Pre-populated common staples (optional)
CREATE TABLE common_staples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item TEXT NOT NULL,
  category TEXT,
  popularity_rank INTEGER -- for sorting
);

INSERT INTO common_staples (item, category, popularity_rank) VALUES
  ('Salt', 'basics', 1),
  ('Black Pepper', 'spices', 2),
  ('Olive Oil', 'oils', 3),
  ('Butter', 'dairy', 4),
  ('Eggs', 'dairy', 5),
  ('Flour', 'baking', 6),
  ('Sugar', 'baking', 7),
  ('Garlic', 'produce', 8),
  ('Onions', 'produce', 9);
```

### 8.3 Meal Planning Tables

#### Meal Plans
```sql
CREATE TABLE meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT, -- e.g., "Week of Jan 15", optional
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_dates ON meal_plans(user_id, start_date, end_date);

-- RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal plans"
  ON meal_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Meal Plan Items
```sql
CREATE TABLE meal_plan_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  servings INTEGER DEFAULT 4,
  notes TEXT, -- e.g., "leftovers from yesterday"
  is_leftover BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_meal_plan_items_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX idx_meal_plan_items_date ON meal_plan_items(date);

-- RLS
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
```

### 8.4 Shopping List Tables

#### Shopping Lists
```sql
CREATE TABLE shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT DEFAULT 'Shopping List',
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL, -- optional link
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);

-- RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shopping lists"
  ON shopping_lists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Shopping List Items
```sql
CREATE TABLE shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
  item TEXT NOT NULL,
  quantity DECIMAL(10, 2),
  unit TEXT,
  category TEXT, -- 'produce', 'meat', 'dairy', 'pantry', 'frozen', 'bakery', 'other'
  is_checked BOOLEAN DEFAULT false,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL, -- source recipe, optional
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_shopping_list_items_list_id ON shopping_list_items(shopping_list_id);

-- RLS
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
```

### 8.5 User Activity & Analytics Tables

#### Recipe Notes (User Reviews/Comments)
```sql
CREATE TABLE recipe_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_recipe_notes_recipe_id ON recipe_notes(recipe_id);

-- RLS
ALTER TABLE recipe_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notes"
  ON recipe_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### AI Generation Logs (for analytics & debugging)
```sql
CREATE TABLE ai_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model TEXT CHECK (model IN ('anthropic', 'openai')) NOT NULL,
  type TEXT CHECK (type IN ('recipe_generation', 'recipe_parsing', 'nutrition_estimation', 'meal_plan_generation')) NOT NULL,
  prompt TEXT, -- truncated for privacy
  input_data JSONB, -- e.g., ingredients list
  output_data JSONB, -- generated recipe
  success BOOLEAN NOT NULL,
  error_message TEXT,
  latency_ms INTEGER, -- for performance tracking
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_created_at ON ai_generations(created_at DESC);

-- RLS
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI generation logs"
  ON ai_generations FOR SELECT
  USING (auth.uid() = user_id);
```

#### Shared Recipes (Social Sharing Tracking)
```sql
CREATE TABLE shared_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  share_token TEXT NOT NULL UNIQUE, -- unique URL token
  platform TEXT, -- 'facebook', 'twitter', 'instagram', 'pinterest', 'email', 'link'
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE, -- optional expiration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_shared_recipes_token ON shared_recipes(share_token);
CREATE INDEX idx_shared_recipes_recipe_id ON shared_recipes(recipe_id);

-- RLS
ALTER TABLE shared_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shares"
  ON shared_recipes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view recipes via share token"
  ON shared_recipes FOR SELECT
  USING (
    expires_at IS NULL OR expires_at > NOW()
  );
```

### 8.6 Database Functions & Triggers

#### Auto-update `updated_at` Timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- etc. for other tables with updated_at
```

#### Generate Shopping List from Meal Plan
```sql
CREATE OR REPLACE FUNCTION generate_shopping_list_from_meal_plan(
  p_user_id UUID,
  p_meal_plan_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_shopping_list_id UUID;
BEGIN
  -- Create new shopping list
  INSERT INTO shopping_lists (user_id, meal_plan_id, name)
  VALUES (p_user_id, p_meal_plan_id, 'Generated from Meal Plan')
  RETURNING id INTO v_shopping_list_id;

  -- Insert aggregated ingredients
  INSERT INTO shopping_list_items (shopping_list_id, item, quantity, unit, category, recipe_id)
  SELECT
    v_shopping_list_id,
    ri.item,
    SUM(ri.quantity * mpi.servings / r.servings) as quantity,
    ri.unit,
    'other' as category, -- categorization logic can be enhanced
    ri.recipe_id
  FROM meal_plan_items mpi
  JOIN recipes r ON mpi.recipe_id = r.id
  JOIN recipe_ingredients ri ON r.id = ri.recipe_id
  WHERE mpi.meal_plan_id = p_meal_plan_id
  GROUP BY ri.item, ri.unit, ri.recipe_id;

  -- TODO: Exclude items in always_have_items

  RETURN v_shopping_list_id;
END;
$$ LANGUAGE plpgsql;
```

#### Increment Recipe "Times Made" Counter
```sql
CREATE OR REPLACE FUNCTION increment_recipe_times_made(p_recipe_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE recipes
  SET
    times_made = times_made + 1,
    last_made_at = NOW()
  WHERE id = p_recipe_id;
END;
$$ LANGUAGE plpgsql;
```

### 8.7 Database Views (for Complex Queries)

#### Recipe with Full Details View
```sql
CREATE OR REPLACE VIEW recipes_full AS
SELECT
  r.*,
  (
    SELECT json_agg(json_build_object(
      'id', ri.id,
      'item', ri.item,
      'quantity', ri.quantity,
      'unit', ri.unit,
      'notes', ri.notes,
      'order_index', ri.order_index
    ) ORDER BY ri.order_index)
    FROM recipe_ingredients ri
    WHERE ri.recipe_id = r.id
  ) as ingredients,
  (
    SELECT json_agg(json_build_object(
      'step_number', inst.step_number,
      'instruction', inst.instruction
    ) ORDER BY inst.step_number)
    FROM recipe_instructions inst
    WHERE inst.recipe_id = r.id
  ) as instructions,
  (
    SELECT json_build_object(
      'calories', rn.calories,
      'protein', rn.protein,
      'carbohydrates', rn.carbohydrates,
      'fat', rn.fat,
      'fiber', rn.fiber,
      'sugar', rn.sugar,
      'source', rn.source,
      'confidence', rn.confidence
    )
    FROM recipe_nutrition rn
    WHERE rn.recipe_id = r.id
  ) as nutrition,
  (
    SELECT json_agg(c.name)
    FROM recipe_categories rc
    JOIN categories c ON rc.category_id = c.id
    WHERE rc.recipe_id = r.id
  ) as categories
FROM recipes r;
```

### 8.8 Sample Data (for Development)

```sql
-- Sample user profile
INSERT INTO user_profiles (id, display_name, preferred_ai_model, dietary_preferences, cooking_skill_level, household_size)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Test User',
  'anthropic',
  ARRAY['vegetarian'],
  'intermediate',
  2
);

-- Sample recipe
WITH new_recipe AS (
  INSERT INTO recipes (user_id, name, description, prep_time, cook_time, servings, source, is_favorite)
  VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'Spaghetti Carbonara',
    'Classic Italian pasta with eggs, cheese, and pancetta',
    10,
    20,
    4,
    'manual',
    true
  )
  RETURNING id
)
INSERT INTO recipe_ingredients (recipe_id, item, quantity, unit, order_index)
SELECT
  (SELECT id FROM new_recipe),
  item,
  quantity,
  unit,
  order_index
FROM (VALUES
  ('spaghetti', 400, 'g', 1),
  ('pancetta', 200, 'g', 2),
  ('eggs', 4, 'whole', 3),
  ('parmesan cheese', 100, 'g', 4),
  ('black pepper', 1, 'tsp', 5)
) AS ingredients(item, quantity, unit, order_index);
```

---

## 9. Implementation Roadmap

### 9.1 Pre-Development Setup (Week 0)

**Environment Setup:**
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up Supabase project (dev + production)
- [ ] Configure Vercel project
- [ ] Set up API keys (Anthropic, OpenAI, PDFShift)
- [ ] Configure environment variables
- [ ] Set up Git repository and branching strategy

**Project Structure:**
- [ ] Create folder structure (components, lib, hooks, types)
- [ ] Install core dependencies (Vercel AI SDK, Supabase client, Zod, React Hook Form)
- [ ] Set up ESLint and Prettier
- [ ] Configure TypeScript strict mode

**Database Setup:**
- [ ] Create initial database schema
- [ ] Set up RLS policies
- [ ] Seed default data (categories, common staples)
- [ ] Test database connections

### 9.2 Phase 1: Core Functionality (Weeks 1-6)

#### Week 1: Authentication & User Setup
**Goals:**
- Users can sign up, log in, and manage profile
- Basic navigation structure in place

**Tasks:**
- [ ] Implement Supabase Auth (email/password)
- [ ] Create login/signup pages
- [ ] Build user profile page
- [ ] Implement protected routes (middleware)
- [ ] Create app layout with sidebar/nav
- [ ] Basic dashboard page (placeholder)

**Deliverables:**
- Working authentication flow
- Protected dashboard area
- User can set AI model preference

#### Week 2: Recipe CRUD (Manual Entry)
**Goals:**
- Users can manually create, view, edit, and delete recipes
- Basic recipe management is functional

**Tasks:**
- [ ] Create recipe form (name, ingredients, instructions)
- [ ] Implement recipe creation API route
- [ ] Build recipe detail view
- [ ] Implement recipe editing
- [ ] Implement recipe deletion (with confirmation)
- [ ] Create recipe list view (grid/list toggle)
- [ ] Add image upload for recipes

**Deliverables:**
- Functional recipe CRUD
- Recipe list and detail pages
- Image upload working

#### Week 3: Cupboard Management
**Goals:**
- Users can manage "What's in Cupboard" list
- Users can manage "Always Have" list

**Tasks:**
- [ ] Build cupboard items list component
- [ ] Implement add/edit/delete cupboard items
- [ ] Create always-have items list component
- [ ] Implement add/delete always-have items
- [ ] Pre-populate common staples checklist
- [ ] Build pantry management page UI

**Deliverables:**
- Functional cupboard management
- Functional always-have management
- Clean, usable UI

#### Week 4: AI Recipe Generation (Basic)
**Goals:**
- Users can generate recipes from ingredient list
- Single AI model integration working

**Tasks:**
- [ ] Integrate Vercel AI SDK
- [ ] Set up Anthropic provider (primary)
- [ ] Create recipe generation prompts
- [ ] Build AI recipe generator UI
- [ ] Implement streaming recipe generation
- [ ] Parse AI output into structured recipe
- [ ] Save generated recipe to database
- [ ] Handle errors gracefully

**Deliverables:**
- Working AI recipe generation
- Generate from cupboard items
- Generate from custom ingredient list
- Recipes save correctly

#### Week 5: Basic Meal Planner
**Goals:**
- Users can view weekly calendar
- Users can add recipes to specific days/meals

**Tasks:**
- [ ] Build weekly calendar view component
- [ ] Implement day/meal slots
- [ ] Add recipe selection modal
- [ ] Implement drag-and-drop (or click to add)
- [ ] Save meal plan to database
- [ ] Display recipes in calendar
- [ ] Allow removing recipes from plan
- [ ] Adjust servings per meal

**Deliverables:**
- Functional weekly meal planner
- Can add/remove recipes
- Persists data

#### Week 6: Basic Shopping List
**Goals:**
- Users can generate shopping list from single recipe
- Users can manually manage shopping list

**Tasks:**
- [ ] Build shopping list UI (with checkboxes)
- [ ] Implement generate from recipe function
- [ ] Add manual item addition
- [ ] Implement check/uncheck items
- [ ] Implement item deletion
- [ ] Basic categorization (dropdown)
- [ ] Save/load shopping lists

**Deliverables:**
- Functional shopping list
- Generate from recipe
- Manual management
- Check-off functionality

**Phase 1 Milestone:**
✅ Core loop functional: Add ingredients → Generate recipe → Save → Plan meals → Get shopping list

### 9.3 Phase 2: Enhancement (Weeks 7-11)

#### Week 7: Recipe Import - Text & URL
**Goals:**
- Users can import recipes by pasting text
- Users can import recipes from URLs

**Tasks:**
- [ ] Build recipe import UI (multi-method selector)
- [ ] Implement text paste import
- [ ] Create AI parsing function for text recipes
- [ ] Implement URL import (web scraping)
- [ ] Handle various recipe formats
- [ ] Display parsed recipe for user review
- [ ] Allow editing before saving
- [ ] Handle parsing errors

**Deliverables:**
- Text paste import working
- URL import working
- AI parsing functional
- User review step before saving

#### Week 8: Recipe Import - Image (OCR)
**Goals:**
- Users can import recipes from images
- OCR extraction working

**Tasks:**
- [ ] Integrate OCR library (Tesseract.js or cloud API)
- [ ] Implement image upload for import
- [ ] Extract text from image
- [ ] Parse extracted text with AI
- [ ] Display results for review
- [ ] Handle low-quality images gracefully

**Deliverables:**
- Image import working
- OCR extraction functional
- Reasonable accuracy with clear images

#### Week 9: Dual AI Model & Comparison
**Goals:**
- Users can choose between Anthropic and OpenAI
- Users can compare results side-by-side

**Tasks:**
- [ ] Integrate OpenAI provider
- [ ] Add model selection UI (settings + per-request)
- [ ] Implement model switching logic
- [ ] Build comparison mode UI (split view)
- [ ] Generate with both models simultaneously
- [ ] Display results side-by-side
- [ ] Allow selecting preferred result

**Deliverables:**
- Both AI models working
- Model selection in settings
- Comparison mode functional
- User can pick preferred output

#### Week 10: Lifestyle Categories & Advanced Filtering
**Goals:**
- Users can tag recipes with lifestyle categories
- Advanced filtering and search working

**Tasks:**
- [ ] Seed lifestyle categories in database
- [ ] Add lifestyle tagging to recipe form
- [ ] Build filter UI (multi-select, collapsible)
- [ ] Implement filter logic (dietary, lifestyle, time, nutrition)
- [ ] Add search functionality
- [ ] Combine filters + search
- [ ] Save filter preferences

**Deliverables:**
- Lifestyle categories usable
- Advanced filtering working
- Search functional
- Good performance with many recipes

#### Week 11: Enhanced Meal Planner & Nutrition
**Goals:**
- AI can generate full week meal plan
- Nutrition aggregation displayed

**Tasks:**
- [ ] Implement "AI: Plan my week" feature
- [ ] Build configuration UI (preferences, time availability)
- [ ] Create meal plan generation prompts
- [ ] Generate full week with AI
- [ ] Display nutrition aggregation view (daily/weekly totals)
- [ ] Implement nutrition estimation for recipes
- [ ] Display disclaimers and confidence levels
- [ ] Add copy previous week function

**Deliverables:**
- AI weekly meal planning working
- Nutrition estimates on recipes
- Aggregated nutrition in meal planner
- Copy previous week functional

**Phase 2 Milestone:**
✅ Full-featured recipe management with AI, import, and planning

### 9.4 Phase 3: Polish & Social (Weeks 12-15)

#### Week 12: Shopping List Enhancements
**Goals:**
- Shopping list generates from full meal plan
- Smart organization and aggregation

**Tasks:**
- [ ] Implement generate from meal plan
- [ ] Aggregate duplicate ingredients
- [ ] Organize by store section (produce, meat, dairy, etc.)
- [ ] Auto-exclude "Always Have" items
- [ ] Implement multiple lists support
- [ ] Add print view
- [ ] Mobile-optimized shopping mode

**Deliverables:**
- Generate from meal plan working
- Smart aggregation and organization
- Exclude always-have items
- Print-friendly view

#### Week 13: Social Sharing & PDF Export
**Goals:**
- Users can share recipes to social media
- Users can export recipes and meal plans as PDF

**Tasks:**
- [ ] Build recipe card image generator
- [ ] Implement social share buttons (Facebook, Instagram, Twitter, Pinterest, WhatsApp)
- [ ] Create public recipe view (shareable link)
- [ ] Integrate PDFShift for PDF generation
- [ ] Create PDF templates (recipe, meal plan, shopping list)
- [ ] Implement export functionality
- [ ] Track shares (analytics)

**Deliverables:**
- Social sharing working
- Recipe cards look great
- PDF export functional
- Shareable links working

#### Week 14: Recipe Collections, Variations & Notes
**Goals:**
- Users can organize recipes into collections
- Users can create recipe variations
- Personal notes and ratings

**Tasks:**
- [ ] Implement recipe collections/folders
- [ ] Build collection management UI
- [ ] Implement "remix" feature (make it healthier, faster, etc.)
- [ ] Create variation generation prompts
- [ ] Display original vs. variation comparison
- [ ] Add notes and ratings to recipes
- [ ] Display "last made" tracking

**Deliverables:**
- Collections working
- Recipe variations functional
- Notes and ratings working

#### Week 15: Polish, Testing & Bug Fixes
**Goals:**
- App is polished and bug-free
- Performance optimized
- Accessibility improvements

**Tasks:**
- [ ] Fix all known bugs
- [ ] Optimize performance (lazy loading, caching)
- [ ] Improve loading states and error handling
- [ ] Accessibility audit and improvements
- [ ] Mobile responsiveness check
- [ ] Cross-browser testing
- [ ] User onboarding flow improvements
- [ ] Write documentation

**Deliverables:**
- Smooth, polished UX
- No critical bugs
- Good performance
- Accessible

**Phase 3 Milestone:**
✅ Complete MVP ready for launch

### 9.5 Post-MVP: User Feedback & Iteration

#### Weeks 16+: Launch & Iterate
**Goals:**
- Launch to initial users
- Gather feedback
- Prioritize next features

**Tasks:**
- [ ] Soft launch to beta users
- [ ] Set up analytics and monitoring
- [ ] Gather user feedback
- [ ] Prioritize feature requests
- [ ] Fix reported bugs
- [ ] Plan Phase 4 features based on feedback

**Potential Phase 4 Features (based on feedback):**
- OpenFoodFacts API integration for UK supermarket data
- Advanced meal prep workflows
- Family member profiles
- Community features (public recipes, comments)
- Voice control (hands-free cooking mode)
- Smart device integration
- Barcode scanning
- Recipe success tracking & analytics
- Budget optimization

### 9.6 Development Team Structure

**For MVP Development:**

**Solo Developer (you):**
- Focus on one phase at a time
- Use AI coding assistants (like Claude Code) for acceleration
- Prioritize ruthlessly (core features first)

**OR Small Team (if applicable):**
- **Frontend Dev**: UI/UX, React components
- **Backend Dev**: API routes, database, AI integration
- **Designer**: UI/UX design, recipe cards, branding (part-time)

**Recommended Development Approach:**
1. Work in 1-week sprints
2. Demo progress at end of each week
3. Test with real users early and often
4. Don't over-engineer - ship and iterate
5. Use feature flags for gradual rollouts

### 9.7 Success Metrics

**Phase 1 Success:**
- [ ] User can complete core loop end-to-end
- [ ] No critical bugs in core features
- [ ] 5 beta testers using regularly

**Phase 2 Success:**
- [ ] 80%+ recipe import accuracy
- [ ] Both AI models performing well
- [ ] 10+ beta testers

**Phase 3 Success:**
- [ ] 50+ active users
- [ ] Recipes being shared on social media
- [ ] Positive user feedback
- [ ] Ready for public launch

**Post-MVP Success:**
- [ ] 500+ registered users
- [ ] 5000+ recipes created
- [ ] 10%+ weekly active users
- [ ] Clear feature roadmap based on user feedback

---

## 10. Appendix

### 10.1 Key Resources

**Documentation:**
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Anthropic API](https://docs.anthropic.com/)
- [OpenAI API](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

**Useful Tools:**
- [PDFShift](https://pdfshift.io/) - PDF generation
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR
- [Recipe Scrapers](https://github.com/hhursev/recipe-scrapers) - Web scraping recipes
- [OpenFoodFacts](https://world.openfoodfacts.org/) - Food database (future)

### 10.2 Design Inspiration

**Recipe Apps to Study:**
- Paprika Recipe Manager
- Mealime
- Yummly
- ChefGPT
- DishGen
- Whisk
- Pepper

### 10.3 AI Prompting Best Practices

**Recipe Generation Prompts:**
- Be specific about dietary restrictions
- Include prep/cook time requirements
- Specify cuisine or style preferences
- Provide context (occasion, skill level)

**Recipe Parsing Prompts:**
- Request structured JSON output
- Handle missing fields gracefully
- Normalize units and quantities
- Clean up inconsistent formatting

**Nutrition Estimation Prompts:**
- Request confidence levels
- Base on USDA standards
- Include serving size context
- Acknowledge estimation limitations

### 10.4 Database Maintenance

**Regular Tasks:**
- Backup database daily (Supabase handles this)
- Monitor storage usage (images can grow large)
- Clean up orphaned records
- Archive old AI generation logs
- Optimize slow queries

**Scaling Considerations:**
- Add database indexes as query patterns emerge
- Consider read replicas for heavy read workloads
- Implement database connection pooling
- Monitor and optimize RLS policy performance

### 10.5 Security Checklist

- [ ] Environment variables secured
- [ ] RLS policies tested thoroughly
- [ ] API rate limiting implemented
- [ ] Input validation on all forms
- [ ] XSS protection (React handles most)
- [ ] CSRF protection (Next.js handles)
- [ ] File upload size limits
- [ ] Malicious file upload prevention
- [ ] SQL injection prevention (Supabase client handles)
- [ ] Authentication session security

### 10.6 Cost Estimation

**Monthly Operating Costs (estimates for early MVP):**

- **Vercel Hosting**: Free (Hobby) → $20 (Pro if needed)
- **Supabase**: Free (up to 500MB database, 1GB storage) → $25 (Pro)
- **Anthropic API**: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
  - Estimate: $50-200/month depending on usage
- **OpenAI API**: ~$0.01 per 1K tokens (GPT-4)
  - Estimate: $50-200/month depending on usage
- **PDFShift**: Free (250 conversions/month) → $15 (2,500 conversions)
- **OCR**: Tesseract.js is free; cloud OCR would add cost

**Total Initial Estimate: $0-50/month (free tiers)**
**Total Growing Estimate: $150-400/month (paid tiers with moderate usage)**

**Cost Optimization:**
- Cache AI results when possible
- Use smaller AI models for simpler tasks
- Optimize prompts for token efficiency
- Implement usage limits per user tier

---

## Conclusion

This comprehensive plan provides a clear roadmap for building a solid MVP of your AI-powered recipe app. The focus is on:

1. **Core functionality first** - Get the essential features working well
2. **User-centric design** - Build for real cooking scenarios
3. **AI as enhancement** - Leverage AI to provide unique value
4. **Iterative development** - Ship early, gather feedback, improve
5. **Scalable architecture** - Build on solid foundations that can grow

**Next Steps:**
1. Review and refine this plan based on your specific priorities
2. Set up development environment (Week 0)
3. Begin Phase 1 development
4. Test with real users early and often
5. Iterate based on feedback

**Key Success Factors:**
- Focus on usability - make it intuitive and delightful
- Ensure AI provides real value, not just novelty
- Build for mobile first (cooking happens in the kitchen)
- Reduce food waste and help users save time/money
- Create a feedback loop with users to guide development

Good luck with your recipe app! This has the potential to be a truly useful tool for home cooks. The combination of AI-powered recipe generation, flexible organization, and practical meal planning addresses real pain points in the market.

---

**Document prepared for:** Recipe App MVP Development
**Tech Stack:** Next.js, Supabase, Vercel, Anthropic, OpenAI
**Timeline:** 15-week MVP development
**Status:** Ready for development kickoff
